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
    const w=(D.weights||[]).slice().sort((a,b)=>a[0]<b[0]?-1:1), st=Number(D.start)||(w[0]&&w[0][1]);
    let stap=[]; try{ stap=await (await fetch(SB+"/rest/v1/stappen?select=dei,stappen&order=dei.asc",{headers:{apikey:KEY}})).json(); }catch(e){}
    const dm={}; (D.sport||[]).forEach(d=>dm[d]=[d,true,false]); (Array.isArray(stap)?stap:[]).forEach(s=>{ if(s.stappen>=10000){ dm[s.dei]=dm[s.dei]||[s.dei,false,false]; dm[s.dei][2]=true; } });
    const last=w[w.length-1], prev=w[w.length-2];
    return {slug:"stoker",namme:"Stoker",kleur:"#3ef0c0",doel:r1((st-Number(D.goal||100))/st*100),stoker:true,
      start:w[0]?w[0][0]:null, pct:last?r1((st-last[1])/st*100):null, wike:last&&prev?r1((prev[1]-last[1])/st*100):null, wikedei:last?last[0]:null,
      wiken:w.map(x=>[x[0],r1((st-x[1])/st*100)]), trainingen:(D.sport||[]).length, stappen:Object.values(dm).filter(x=>x[2]).length,
      dagen:Object.values(dm).sort((a,b)=>a[0]<b[0]?-1:1)};
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
    rows.forEach(x=>{ if(x.wikedei===wo&&x.wike!=null&&x.wike>0&&(!winer||x.wike>winer.wike)) winer=x; });
    return {rows, winer, woansdei:wo, oaren:(o||[]).length};
  }
  window.StokerKomp={laad, woansdei};
})();
