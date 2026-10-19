// Stoker nei 100 · Wrapped: jieroersjoch per dielnimmer, yn ferhaal-skermen (allinne prosinten en aktiviteit).
// Te sjen fan 31 desimber oant en mei 7 jannewaris. Teste kin altyd mei ?wrapped yn 'e URL.
(function(){
  const nl=(n,d=1)=>Number(n).toLocaleString("nl-NL",{minimumFractionDigits:d,maximumFractionDigits:d});
  const E=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const pd=s=>{const [y,m,d]=String(s).slice(0,10).split("-").map(Number);return new Date(y,m-1,d)};
  const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const FWD=["snein","moandei","tiisdei","woansdei","tongersdei","freed","sneon"];
  const nu=()=>new Date(new Date().toLocaleString("en-US",{timeZone:"Europe/Amsterdam"}));
  function isoWike(d){const t=new Date(d);t.setHours(0,0,0,0);t.setDate(t.getDate()+3-(t.getDay()+6)%7);const w1=new Date(t.getFullYear(),0,4);return 1+Math.round(((t-w1)/864e5-3+(w1.getDay()+6)%7)/7)}
  // hokker jier is it no Wrapped-tiid foar? (null = net)
  function finster(){
    const t=nu(), test=/[?&]wrapped\b/.test(location.search);
    if(t.getMonth()===11&&t.getDate()===31) return t.getFullYear();
    if(t.getMonth()===0&&t.getDate()<=7) return t.getFullYear()-1;
    return test?t.getFullYear():null;
  }
  function ink(hex){const h=String(hex).replace("#","");if(h.length<6)return"#121212";const [r,g,b]=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(c=>c<=.03928?c/12.92:Math.pow((c+.055)/1.055,2.4));return .2126*r+.7152*g+.0722*b>.35?"#121212":"#ffffff"}
  function reis(km){const R=[[1600,"Rome"],[600,"Parys"],[330,"Brussel"],[120,"Amsterdam"],[45,"Ljouwert"]];const x=R.find(r=>km>=r[0]);return x?"Dat is fan Wâldsein nei "+x[1]+".":"Dat is in moai ein rinnen."}

  function sifers(r,jier,k){
    const J=String(jier), inJ=d=>String(d).slice(0,4)===J;
    const w=(r.wiken||[]).slice().sort((a,b)=>a[0]<b[0]?-1:1);
    const foar=w.filter(x=>x[0]<J+"-01-01"), yn=w.filter(x=>inJ(x[0]));
    const p0=foar.length?foar[foar.length-1][1]:0, p1=yn.length?yn[yn.length-1][1]:p0;
    let best=null; const del=[];
    for(let i=1;i<w.length;i++){ if(!inJ(w[i][0])) continue; const d=Math.round((w[i][1]-w[i-1][1])*10)/10; del.push(d); if(d>0&&(!best||d>best.d)) best={d,wike:isoWike(pd(w[i][0]))}; }
    const dagen=(r.dagen||[]).filter(x=>inJ(x[0]));
    const tr=dagen.filter(x=>x[1]), st=dagen.filter(x=>x[2]);
    const wd=[0,0,0,0,0,0,0]; tr.forEach(x=>wd[pd(x[0]).getDay()]++); const fav=tr.length?wd.indexOf(Math.max(...wd)):-1;
    // langste rige aktive dagen yn it jier
    const akt=new Set(dagen.filter(x=>x[1]||x[2]).map(x=>x[0])); let rige=0,beste=0;
    for(let d=new Date(jier,0,1);d.getFullYear()===jier;d.setDate(d.getDate()+1)){ if(akt.has(iso(d))){rige++;beste=Math.max(beste,rige)}else rige=0; }
    // stippen: fan de start (of 1 jan) oant 31 des
    const b=r.start&&inJ(r.start)?pd(r.start):new Date(jier,0,1), stS=new Set(st.map(x=>x[0])), stip=[];
    for(let d=new Date(b);d.getFullYear()===jier;d.setDate(d.getDate()+1)) stip.push(stS.has(iso(d)));
    const med=window.StokerKomp?StokerKomp.medaljes(r).filter(m=>m[1]).map(m=>m[0]):[];
    const mei=(k&&k.rows||[]).filter(x=>x.pct!=null), plak=mei.findIndex(x=>x.slug===r.slug)+1;
    return {pct:Math.round((p1-p0)*10)/10, tot:r.pct||0, doel:r.doel==null?null:(Number(r.doel)||10), helle:!!r.doelHelle, best, del:del.slice(-12), tr:tr.length, fav, st:st.length, beste, stip,
      med, plak, n:mei.length, stapSom:r.stapJier?r.stapJier[J]||0:0, skoen:!!r.skoen};
  }

  const CSS=`
#swr{position:fixed;inset:0;z-index:200;background:#0b0b0b;display:grid;place-items:center;font-family:"Work Sans",system-ui,sans-serif;color:#fff}
#swr *{box-sizing:border-box}
#swr .w-big span,#swr .w-h span{all:unset}
#swr .w-big small{all:unset;font-size:.36em;margin-left:6px}
#swr .w-h::before,#swr .w-h::after{content:none}
#swr .stage{position:relative;width:min(440px,calc(100vh * 9 / 16 - 24px));aspect-ratio:9/16;max-width:100%;border-radius:18px;overflow:hidden;user-select:none;-webkit-user-select:none;touch-action:manipulation}
@media (max-width:520px){#swr .stage{width:100%;height:100%;aspect-ratio:auto;border-radius:0}}
#swr .bars{position:absolute;inset:0 0 auto;padding:calc(12px + env(safe-area-inset-top,0px)) 12px 0;display:flex;gap:4px;z-index:5}
#swr .bars span{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.3);overflow:hidden}
#swr .bars i{display:block;height:100%;width:0;background:#fff}
#swr .top{position:absolute;top:calc(22px + env(safe-area-inset-top,0px));left:14px;right:6px;z-index:6;display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:600;letter-spacing:.06em;text-transform:uppercase}
#swr .top span{opacity:.85}
#swr .top div{display:flex}
#swr .top button{background:none;border:0;color:inherit;font:600 16px "Work Sans",system-ui,sans-serif;cursor:pointer;width:40px;height:40px}
#swr .slide{position:absolute;inset:0;padding:calc(80px + env(safe-area-inset-top,0px)) 26px calc(44px + env(safe-area-inset-bottom,0px));display:flex;flex-direction:column;justify-content:center;gap:14px;opacity:0;transform:scale(1.03);transition:opacity .45s,transform .6s;pointer-events:none;overflow:hidden}
#swr .slide.on{opacity:1;transform:none}
#swr .w-k{font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;opacity:.8;margin:0}
#swr .w-big{font-family:Anton,Impact,"Arial Narrow Bold",sans-serif;font-weight:400;font-size:clamp(84px,28vw,128px);line-height:.88;margin:0;font-variant-numeric:tabular-nums}
#swr .w-big small{font-size:.36em;margin-left:6px}
#swr .w-h{font-family:Anton,Impact,"Arial Narrow Bold",sans-serif;font-weight:400;text-transform:uppercase;font-size:clamp(40px,12vw,56px);line-height:.95;margin:0;text-wrap:balance;overflow-wrap:anywhere}
#swr .w-t{font-size:18px;line-height:1.4;margin:0;max-width:30ch}
#swr .w-chips{display:flex;flex-wrap:wrap;gap:8px}
#swr .w-chip{font-size:14px;font-weight:600;padding:7px 12px;border-radius:99px;background:rgba(0,0,0,.2)}
#swr .night .w-chip{background:rgba(255,255,255,.1)}
#swr .night{background:#16161b;color:#fff}
#swr .night .w-k{color:var(--wc);opacity:1}
#swr .fire{background:#ff7a2f;color:#2a0f00}
#swr .eigen{background:var(--wc);color:var(--wi)}
#swr .lila{background:#b9a6ff;color:#1c1240}
#swr .w-deco{position:absolute;pointer-events:none;font-family:Anton,Impact,sans-serif;opacity:.1;font-size:380px;line-height:.8;right:-30px;bottom:-30px;color:var(--wc)}
#swr .w-wb{display:flex;align-items:flex-end;gap:5px;height:110px;margin-top:6px}
#swr .w-wb div{flex:1;background:currentColor;opacity:.35;border-radius:3px 3px 0 0;transform-origin:bottom;transform:scaleY(0);transition:transform .6s cubic-bezier(.2,.8,.2,1);min-height:3px}
#swr .w-wb div.best{opacity:1}
#swr .on .w-wb div{transform:scaleY(1)}
#swr .w-dots{display:flex;flex-wrap:wrap;gap:3px;max-width:340px}
#swr .w-dots i{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.14)}
#swr .w-dots i.y{background:var(--wc)}
#swr .tap{position:absolute;inset:0;display:grid;grid-template-columns:1fr 2fr;z-index:4}
#swr .tap button{background:none;border:0;cursor:pointer}
#swr button:focus-visible{outline:2px solid #fff;outline-offset:-4px}
@media (prefers-reduced-motion:reduce){#swr .slide{transition:none;transform:none}#swr .w-wb div{transition:none}}`;

  function iepen(r,k,jier){
    jier=jier||finster()||nu().getFullYear();
    const s=sifers(r,jier,k), kl=r.kleur||"#3ef0c0", nm=E(r.namme);
    const ds=x=>(x<0?"+":"")+nl(Math.abs(x));
    const sl=[];
    sl.push(`<section class="slide night"><p class="w-k">Stoker nei 100 · ${jier}</p><div class="w-h" style="font-size:clamp(60px,19vw,92px)">${nm},<br>dyn jier</div><p class="w-t" style="opacity:.7">Tik om fierder te gean.</p><div class="w-deco">${String(jier).slice(2)}</div></section>`);
    sl.push(`<section class="slide eigen"><p class="w-k">Kwyt dit jier</p><p class="w-big"><span data-n="${Math.abs(s.pct)}" data-d="1">0</span><small>%</small></p><p class="w-t">${s.pct>0?"Fan dyn startgewicht. Elke prosint is in stap tichter by dyn doel.":s.pct<0?"Der kaam wat by, mar do bist begûn. Dat is de earste stap.":"Do bist begûn. Dat is de earste stap."}</p><div class="w-chips"><span class="w-chip">Doel: ${nl(s.doel,s.doel%1?1:0)}% kwyt</span></div></section>`);
    if(s.best){ const mx=Math.max(...s.del,.1);
      sl.push(`<section class="slide fire"><p class="w-k">Dyn bêste wike</p><div class="w-h">Wike ${s.best.wike}</div><p class="w-big" style="font-size:clamp(64px,22vw,96px)">−<span data-n="${s.best.d}" data-d="1">0</span><small>%</small></p><div class="w-wb" aria-hidden="true">${s.del.map((d,i)=>`<div class="${d===s.best.d?"best":""}" style="height:${Math.max(0,d)/mx*100}%;transition-delay:${i*50}ms"></div>`).join("")}</div></section>`); }
    sl.push(`<section class="slide night"><p class="w-k">Sporte</p><p class="w-big"><span data-n="${s.tr}">0</span><small>kear</small></p><p class="w-t">${s.tr?"Meast op "+FWD[s.fav]+". "+(s.tr>=50?"Do wennest sawat yn 'e sportskoalle. 💪":"Elke training telt. 💪"):"Noch gjin training oanjûn. Dat wurdt dyn ding yn "+(jier+1)+"!"}</p><div class="w-deco">${s.tr}</div></section>`);
    sl.push(`<section class="slide night"><p class="w-k">10.000 stappen helle</p><p class="w-big"><span data-n="${s.st}">0</span><small>${s.st===1?"dei":"dagen"}</small></p><div class="w-dots" aria-hidden="true">${s.stip.map(y=>`<i class="${y?"y":""}"></i>`).join("")}</div>${s.beste>=2?`<div class="w-chips"><span class="w-chip">🔥 Langste rige aktyf: ${s.beste} dagen</span></div>`:""}</section>`);
    if(s.stapSom>0){ const km=Math.round(s.stapSom*.75/1000), mil=s.stapSom>=1e6;
      sl.push(`<section class="slide lila"><p class="w-k">Stappen</p><p class="w-big" style="font-size:clamp(64px,21vw,104px)"><span data-n="${mil?s.stapSom/1e6:Math.round(s.stapSom/1000)}" data-d="${mil?2:0}">0</span><small>${mil?"miljoen":"tûzen"}</small></p><p class="w-t">Sa'n ${km.toLocaleString("nl-NL")} kilometer. ${reis(km)}</p></section>`); }
    sl.push(`<section class="slide eigen"><p class="w-k">Medaljes</p><p class="w-big"><span data-n="${s.med.length}">0</span><small>🏅</small></p><div class="w-chips">${s.med.slice(-6).map(m=>`<span class="w-chip">${E(m)}</span>`).join("")||'<span class="w-chip">De earste komt der oan!</span>'}</div></section>`);
    if(s.n>=2&&s.plak>0) sl.push(`<section class="slide fire"><p class="w-k">Kompetysje</p><div class="w-h">Plak ${s.plak} fan ${s.n}</div><p class="w-t">${s.plak===1?"Boppe-oan! De rest moat oan 'e bak.":s.plak<=3?"Op it poadium. Dat smakket nei mear.":"Der sit noch genôch rek yn. Op nei boppen!"}</p>${s.skoen?'<div class="w-chips"><span class="w-chip">👟 Gouden skoen</span></div>':""}</section>`);
    const rest=s.doel==null?(s.helle?0:null):Math.round((s.doel-s.tot)*10)/10;
    sl.push(`<section class="slide night"><p class="w-k">En no?</p><div class="w-h" style="font-size:clamp(52px,16vw,80px)">${rest==null?"Op wei nei de 100!":rest<=0?"Doel helle! 🎉":`Noch <span style="color:var(--wc)">${nl(rest)}%</span> nei dyn doel`}</div><p class="w-t" style="opacity:.75">Op nei ${jier+1}. Stook him op! 🔥</p><div class="w-deco" style="color:#ff7a2f">${String(jier+1).slice(2)}</div></section>`);

    if(!document.getElementById("swrCss")){const st=document.createElement("style");st.id="swrCss";st.textContent=CSS;document.head.appendChild(st)}
    const ov=document.createElement("div"); ov.id="swr"; ov.setAttribute("role","dialog"); ov.setAttribute("aria-modal","true"); ov.setAttribute("aria-label",r.namme+" syn jier "+jier);
    ov.style.setProperty("--wc",kl); ov.style.setProperty("--wi",ink(kl));
    ov.innerHTML=`<div class="stage"><div class="bars">${sl.map(()=>"<span><i></i></span>").join("")}</div>
      <div class="top"><span>${nm} · ${jier}</span><div><button type="button" class="pz" aria-label="Pauze">❚❚</button><button type="button" class="ticht" aria-label="Slute">✕</button></div></div>
      ${sl.join("")}<div class="tap"><button type="button" class="wr" aria-label="Foarige"></button><button type="button" class="fi" aria-label="Folgjende"></button></div></div>`;
    document.body.appendChild(ov); const oudOverflow=document.body.style.overflow; document.body.style.overflow="hidden";
    const S=[...ov.querySelectorAll(".slide")], B=[...ov.querySelectorAll(".bars i")], DUR=5500, RM=matchMedia("(prefers-reduced-motion:reduce)").matches;
    const telop=x=>x.querySelectorAll("[data-n]").forEach(e=>{const to=+e.dataset.n,d=+(e.dataset.d||0),t0=performance.now(),dur=RM?0:1100;
      const f=n=>{const p=dur?Math.min(1,(n-t0)/dur):1;e.textContent=nl(to*(1-Math.pow(1-p,3)),d);if(p<1&&ov.isConnected)requestAnimationFrame(f)};requestAnimationFrame(f)});
    let i=0,t=0,last=performance.now(),paused=false,raf;
    const pz=ov.querySelector(".pz"), knop=()=>{pz.textContent=paused?"▶":"❚❚";pz.setAttribute("aria-label",paused?"Ôfspylje":"Pauze")};
    function show(n){i=Math.max(0,Math.min(S.length-1,n));t=0;S.forEach((x,j)=>x.classList.toggle("on",j===i));B.forEach((b,j)=>b.style.width=j<i?"100%":"0");telop(S[i])}
    function tick(now){const dt=now-last;last=now;if(!paused){t+=dt;B[i].style.width=Math.min(100,t/DUR*100)+"%";if(t>=DUR){if(i<S.length-1)show(i+1);else{paused=true;knop()}}}raf=requestAnimationFrame(tick)}
    function ticht(){cancelAnimationFrame(raf);document.removeEventListener("keydown",kb);ov.remove();document.body.style.overflow=oudOverflow}
    function kb(e){if(e.key==="Escape")ticht();if(e.key==="ArrowRight")show(i+1);if(e.key==="ArrowLeft")show(i-1)}
    pz.onclick=()=>{if(i===S.length-1&&t>=DUR)show(0);paused=!paused;knop()};
    ov.querySelector(".ticht").onclick=ticht;
    ov.querySelector(".fi").onclick=()=>{if(i===S.length-1)ticht();else show(i+1)};
    ov.querySelector(".wr").onclick=()=>show(i-1);
    document.addEventListener("keydown",kb);
    show(0); raf=requestAnimationFrame(tick); ov.querySelector(".ticht").focus({preventScroll:true});
  }
  // knop om it Wrapped te iepenjen; auto=true iepenet it ien kear per browser
  function knop(r,k,tekst,auto){
    const jier=finster(); if(!jier) return null;
    if(!document.getElementById("swrKCss")){const st=document.createElement("style");st.id="swrKCss";
      st.textContent='.swr-knop{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:54px;margin:18px 0 0;border:0;border-radius:10px;cursor:pointer;font:600 17px "Work Sans",system-ui,sans-serif;color:#2a0f00;background:linear-gradient(100deg,#ff7a2f,#ffd23f)}.swr-knop:focus-visible{outline:2px solid #fff;outline-offset:2px}';document.head.appendChild(st)}
    const b=document.createElement("button"); b.type="button"; b.className="swr-knop"; b.textContent=tekst||("🎁 "+r.namme+" syn jier "+jier);
    b.addEventListener("click",()=>iepen(r,k,jier));
    if(auto){const kaai="dn-wr-"+r.slug+"-"+jier;let sjoen=false;try{sjoen=!!localStorage.getItem(kaai);localStorage.setItem(kaai,"1")}catch(e){}
      if(!sjoen&&!/[?&]wrapped\b/.test(location.search)||(/[?&]wrapped\b/.test(location.search)&&!sjoen)) setTimeout(()=>iepen(r,k,jier),600);}
    return b;
  }
  window.StokerWrapped={finster,iepen,knop};
})();
