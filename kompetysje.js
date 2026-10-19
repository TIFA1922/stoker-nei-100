// Stoker nei 100 · kompetysje: klassemint mei Stoker (út 'e side-JSON) en de oare dielnimmers (út Supabase).
// Allinne prosinten; kilo's fan oaren komme hjir nea del.
(function(){
  const SB="https://cupcyeurvttyetfrhuoi.supabase.co", KEY="sb_publishable_piOI9XYSPxKDYEhVl6rYag_lSCzmy3h";
  const H={apikey:KEY,"Content-Type":"application/json"};
  const r1=n=>Math.round(n*10)/10;
  async function stokerData(D){
    if(D) return D;
    try{ const t=await (await fetch("/",{cache:"no-cache"})).text();
      const m=t.match(/<script type="application\/json" id="data">([\s\S]*?)<\/script>/); return m?JSON.parse(m[1]):null; }catch(e){ return null; }
  }
  async function stokerRij(D){
    D=await stokerData(D); if(!D) return null;
    // Stoker: allinne hiele prosinten (kpct) en gjin doel-prosint, oars is syn startgewicht út te rekkenjen.
    const w=(D.kpct||[]).slice().sort((a,b)=>a[0]<b[0]?-1:1);
    let stap=[]; try{ stap=await (await fetch(SB+"/rest/v1/stappen?select=dei,stappen&order=dei.asc",{headers:{apikey:KEY}})).json(); }catch(e){}
    const dm={}; (D.sport||[]).forEach(d=>dm[d]=[d,true,false]); (Array.isArray(stap)?stap:[]).forEach(s=>{ if(s.stappen>=10000){ dm[s.dei]=dm[s.dei]||[s.dei,false,false]; dm[s.dei][2]=true; } });
    const stapJier={}; (Array.isArray(stap)?stap:[]).forEach(s=>{const j=String(s.dei).slice(0,4);stapJier[j]=(stapJier[j]||0)+(Number(s.stappen)||0)});
    const last=w[w.length-1], prev=w[w.length-2];
    return {slug:"stoker",namme:"Stoker",kleur:"#3ef0c0",doel:null,doelHelle:!!D.reached,stoker:true,heel:true,
      start:w[0]?w[0][0]:null, pct:last?last[1]:null, wike:last&&prev?last[1]-prev[1]:null, wikedei:last?last[0]:null,
      wiken:w.map(x=>[x[0],x[1]]), trainingen:(D.sport||[]).length, stappen:Object.values(dm).filter(x=>x[2]).length,
      dagen:Object.values(dm).sort((a,b)=>a[0]<b[0]?-1:1), stapJier};
  }
  async function oaren(){
    const r=await fetch(SB+"/rest/v1/rpc/dn_klassemint",{method:"POST",headers:H,body:"{}"});
    if(!r.ok) throw new Error("klassemint"); return await r.json();
  }
  // lêste woansdei (Nederlânske tiid)
  function woansdei(){ const t=new Date(new Date().toLocaleString("en-US",{timeZone:"Europe/Amsterdam"})); t.setHours(0,0,0,0);
    t.setDate(t.getDate()-((t.getDay()-3+7)%7)); return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0"); }
  async function laad(D){
    const [s,o]=await Promise.all([stokerRij(D),oaren()]);
    const rows=(s?[s]:[]).concat(o||[]);
    rows.sort((a,b)=>(a.pct==null)-(b.pct==null)||(b.pct||0)-(a.pct||0)||a.namme.localeCompare(b.namme));
    const wo=woansdei(); let winer=null;
    // grutste ôffaller: wa't de lêste 7 dagen woegen hat en it measte kwyt rekke is
    const wk=new Date(new Date().toLocaleString("en-US",{timeZone:"Europe/Amsterdam"})); wk.setHours(0,0,0,0); wk.setDate(wk.getDate()-6);
    const grins=wk.getFullYear()+"-"+String(wk.getMonth()+1).padStart(2,"0")+"-"+String(wk.getDate()).padStart(2,"0");
    rows.forEach(x=>{ if(x.wikedei&&x.wikedei>=grins&&x.wike!=null&&x.wike>0&&(!winer||x.wike>winer.wike)) winer=x; });
    // reade lantearne 🏮: de lêste fan it klassemint (by minimaal 3 meidwaners)
    const mei=rows.filter(x=>x.pct!=null); if(mei.length>=3) mei[mei.length-1].lantearne=true;
    // gouden skoen 👟: de measte dagen 10.000 stappen dizze moanne
    const mnd=new Date(new Date().toLocaleString("en-US",{timeZone:"Europe/Amsterdam"})), mk=mnd.getFullYear()+"-"+String(mnd.getMonth()+1).padStart(2,"0");
    rows.forEach(x=>{x.stapMoanne=(x.dagen||[]).filter(d=>d[2]&&String(d[0]).slice(0,7)===mk).length});
    const mx=Math.max(0,...rows.map(x=>x.stapMoanne)); if(mx>0) rows.forEach(x=>{if(x.stapMoanne===mx) x.skoen=true});
    return {rows, winer, woansdei:wo, oaren:(o||[]).length};
  }
  // ---- motivaasje: medaljes en reeks (allinne prosinten en aktiviteit, nea kilo's) ----
  const isoD=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const pdD=s=>{const [y,m,d]=String(s).slice(0,10).split("-").map(Number);return new Date(y,m-1,d)};
  function medaljes(r){
    const pc=r.pct||0, doel=Number(r.doel)||10, dagen=r.dagen||[];
    const perWike={}; dagen.filter(x=>x[1]).forEach(x=>{const d=pdD(x[0]);d.setDate(d.getDate()-((d.getDay()+6)%7));const k=isoD(d);perWike[k]=(perWike[k]||0)+1});
    const akt=new Set(dagen.filter(x=>x[1]||x[2]).map(x=>x[0])); let rige=0,beste=0;
    if(akt.size){const ks=[...akt].sort();for(let d=pdD(ks[0]);d<=pdD(ks[ks.length-1]);d.setDate(d.getDate()+1)){if(akt.has(isoD(d))){rige++;beste=Math.max(beste,rige)}else rige=0}}
    return [["Begûn!",!!r.start],["1% kwyt",pc>=1],["3% kwyt",pc>=3],["5% kwyt",pc>=5],["Healwei it doel",r.doel==null?!!r.doelHelle:pc>=doel/2],["10% kwyt",pc>=10],
      ["Earste training",(r.trainingen||0)>=1],["10 trainingen",(r.trainingen||0)>=10],["Perfekte wike",Object.values(perWike).some(n=>n>=5)],
      ["7 dagen op rige",beste>=7],["10× 10.000 stappen",(r.stappen||0)>=10],["Doel helle!",r.doel==null?!!r.doelHelle:pc>=doel&&pc>0]];
  }
  // hjoeddeiske reeks: dagen op rige aktyf (sporte of 10.000 stappen), oant hjoed of juster
  function reeks(dagen){
    const akt=new Set((dagen||[]).filter(x=>x[1]||x[2]).map(x=>x[0]));
    const t=new Date(new Date().toLocaleString("en-US",{timeZone:"Europe/Amsterdam"})); t.setHours(0,0,0,0);
    if(!akt.has(isoD(t))) t.setDate(t.getDate()-1);
    let n=0; while(akt.has(isoD(t))){n++;t.setDate(t.getDate()-1)} return n;
  }
  window.StokerKomp={laad, woansdei, medaljes, reeks};
})();
