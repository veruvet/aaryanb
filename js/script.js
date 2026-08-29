/* =========================================================
   VLVT — Aaryan Bhatt · shared behaviour
   ========================================================= */
(function(){
"use strict";

const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => [...c.querySelectorAll(s)];
const body    = document.body;
const PAGE    = body.dataset.page || "home";
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------
   0. TECH STACK (name + simple-icons slug) — rendered where present
   --------------------------------------------------------- */
const STACK = [
  ["python","python"], ["html","html5"], ["css","css"], ["javascript","javascript"],
  ["typescript","typescript"], ["react","react"], ["next.js","nextdotjs"],
  ["tailwind","tailwindcss"], ["node.js","nodedotjs"], ["git","git"], ["figma","figma"]
];
const grid = $("#stackGrid");
if (grid){
  grid.innerHTML = STACK.map(([name,slug],i)=>`
    <div class="chip">
      <img class="ico" src="icons/${slug}.svg" alt="${name}" loading="lazy" />
      <span class="nm">${name}</span>
      <span class="n">${String(i+1).padStart(2,"0")}</span>
    </div>`).join("");
}

/* ---------------------------------------------------------
   1. SCRAMBLE + GLITCH BURST
   --------------------------------------------------------- */
const CHARS = "!<>-_\\/[]{}—=+*^?#01abxvlvt";
function scrambleTo(el, finalText, duration = 500){
  if (!el) return Promise.resolve();
  if (reduced){ el.textContent = finalText; return Promise.resolve(); }
  const start = performance.now();
  return new Promise(resolve=>{
    (function frame(now){
      const t = Math.min((now - start) / duration, 1);
      let out = "";
      for (let i = 0; i < finalText.length; i++){
        if (finalText[i] === " "){ out += " "; continue; }
        out += (i / finalText.length < t) ? finalText[i] : CHARS[Math.floor(Math.random()*CHARS.length)];
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(frame); else { el.textContent = finalText; resolve(); }
    })(start);
  });
}
function glitchBurst(el, text){
  if (!el || reduced){ if(el && text!==undefined) el.textContent = text; return; }
  el.classList.add("glitch-active");
  setTimeout(()=> el.classList.remove("glitch-active"), 440);
  if (text !== undefined) scrambleTo(el, text, 440);
}

/* hover-scramble on flagged elements */
$$("[data-scramble]").forEach(el=>{
  const original = el.textContent; let busy = false;
  el.addEventListener("mouseenter", ()=>{
    if (busy) return; busy = true;
    glitchBurst(el, original);
    setTimeout(()=> busy = false, 440);
  });
});

/* ---------------------------------------------------------
   2. CURTAIN — first-visit loader / page-transition
   --------------------------------------------------------- */
const curtain = $("#curtain");
const glitchEl= $("#glitch");
const meta    = $("#curtainMeta");
const bar     = $("#loaderBar");
const counter = $("#counter");
const statusEl= $("#loader-status");
const statuses= ["initialising type system","loading glyphs","compiling grid","rendering vlvt"];

let firstVisit = true;
try { firstVisit = !sessionStorage.getItem("vlvt_seen"); } catch(e){}

body.style.overflow = "hidden";

function reveal(){
  if (curtain) curtain.classList.add("hide");
  body.style.overflow = "";
  setupReveals();
}
function quickReveal(){
  if (meta) meta.style.display = "none";
  if (bar)  bar.style.display  = "none";
  glitchBurst(glitchEl, "vlvt");
  setTimeout(reveal, 620);
}
function fullLoader(){
  let pct = 0;
  (function tick(){
    pct = Math.min(100, pct + (Math.floor(Math.random()*8)+3));
    if (counter) counter.textContent = String(pct).padStart(3,"0");
    if (bar) bar.style.width = pct + "%";
    if (statusEl) statusEl.textContent = statuses[Math.min(statuses.length-1, Math.floor(pct/26))];
    if (pct < 100) setTimeout(tick, Math.random()*120 + 40);
    else scrambleTo(glitchEl, "vlvt", 380).then(()=> setTimeout(reveal, 420));
  })();
}
let started = false;
function startCurtain(){
  if (started) return; started = true;          // guard against double-run (load + fallback)
  if (!curtain){ reveal(); return; }
  if (PAGE === "home" && firstVisit){ fullLoader(); }
  else { quickReveal(); }
  try { sessionStorage.setItem("vlvt_seen","1"); } catch(e){}
}
window.addEventListener("load", ()=> setTimeout(startCurtain, 180));
setTimeout(()=>{ if (curtain && !curtain.classList.contains("hide")) startCurtain(); }, 2000);

/* page-transition on internal links */
function goTo(url){
  if (!curtain){ location.href = url; return; }
  curtain.classList.remove("hide");
  if (meta) meta.style.display = "none";
  if (bar)  bar.style.display  = "none";
  glitchBurst(glitchEl, "vlvt");
  setTimeout(()=> location.href = url, 520);
}
$$("a[data-link]").forEach(a=>{
  a.addEventListener("click", e=>{
    const href = a.getAttribute("href");
    if (!href || href.startsWith("#") || href.startsWith("http") || a.target === "_blank") return;
    e.preventDefault(); goTo(href);
  });
});

/* ---------------------------------------------------------
   3. REVEALS (run once curtain lifts)
   --------------------------------------------------------- */
let revealsDone = false;
function setupReveals(){
  if (revealsDone) return; revealsDone = true;

  // hero / page-hero line reveals
  $$(".go-on-load").forEach((el,i)=> setTimeout(()=> el.classList.add("go"), 60 + i*90));
  const heroFades = $$(".hero-fade");
  heroFades.forEach((el,i)=> setTimeout(()=> el.classList.add("in"), 420 + i*90));

  // scroll-triggered fades + heading glitch
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      const h2 = e.target.matches(".sec-head") ? $("h2", e.target) : null;
      if (h2 && h2.dataset.text) glitchBurst(h2, h2.dataset.text);
      io.unobserve(e.target);
    });
  }, { threshold:0.16, rootMargin:"0px 0px -6% 0px" });

  $$(".fade").forEach(el=>{ if (!el.classList.contains("hero-fade")) io.observe(el); });
}

/* ---------------------------------------------------------
   4. ROTATING ROLE · CLOCK · MARQUEE (where present)
   --------------------------------------------------------- */
const roleEl = $("#role");
if (roleEl){
  const roles = ["designer","developer","web designer","web developer"];
  let ri = 0;
  setInterval(()=>{ ri = (ri+1) % roles.length; scrambleTo(roleEl, roles[ri], 420); }, 2400);
}
const clock = $("#clock");
if (clock){
  const tickClock = ()=>{ const d=new Date();
    clock.textContent=[d.getHours(),d.getMinutes(),d.getSeconds()].map(n=>String(n).padStart(2,"0")).join(":"); };
  tickClock(); setInterval(tickClock,1000);
}
const track = $("#marqueeTrack");
if (track) track.innerHTML += track.innerHTML;

/* periodic hero glitch flourish */
const heroH1 = $(".hero-h1");
if (heroH1 && !reduced){
  const lines = $$(".hinner", heroH1);
  setInterval(()=>{ const l = lines[Math.floor(Math.random()*lines.length)]; if (l) glitchBurst(l); }, 4200);
}

/* ---------------------------------------------------------
   5. ACTIVE NAV
   --------------------------------------------------------- */
$$(".nav-right a[data-link]").forEach(a=>{
  const href = a.getAttribute("href");
  const path = (href||"").replace(/\.html$/,"").replace(/^\//,"");
  if ((PAGE==="work" && path==="work") ||
      (PAGE==="about" && path==="about") ||
      (PAGE==="contact" && path==="contact")) a.classList.add("active");
});

/* ---------------------------------------------------------
   6. INTERACTIVE TYPE CANVAS (where present)
   --------------------------------------------------------- */
(function(){
  const canvas = $("#typeCanvas"); if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const GLYPHS = "velvetcode</>{}[]01".split("");
  let W,H,dpr, particles=[], nodes=[], mouse={x:-999,y:-999};
  const cssv = v => getComputedStyle(body).getPropertyValue(v).trim();

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect(); W=r.width; H=r.height;
    canvas.width = W*dpr; canvas.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    nodes = []; const count = Math.floor(W*H/16000);
    for (let i=0;i<count;i++) nodes.push({ x:Math.random()*W, y:Math.random()*H });
  }
  resize(); window.addEventListener("resize", resize);

  canvas.addEventListener("mousemove", e=>{
    const r = canvas.getBoundingClientRect(); mouse.x=e.clientX-r.left; mouse.y=e.clientY-r.top;
    if (Math.random()<0.35 && !reduced){
      particles.push({ x:mouse.x, y:mouse.y, ch:GLYPHS[Math.floor(Math.random()*GLYPHS.length)],
        vy:-(Math.random()*0.5+0.2), life:1, size:Math.random()*10+12 });
    }
  });
  canvas.addEventListener("mouseleave", ()=>{ mouse.x=-999; mouse.y=-999; });

  (function draw(){
    const fg = cssv("--fg")||"#fcfcfc", mute = cssv("--mute")||"#6f6f6b";
    ctx.clearRect(0,0,W,H); ctx.lineWidth=1;
    for (let i=0;i<nodes.length;i++){
      const n = nodes[i];
      ctx.fillStyle=mute; ctx.globalAlpha=.5; ctx.fillRect(n.x-1,n.y-1,2,2); ctx.globalAlpha=1;
      const dx=n.x-mouse.x, dy=n.y-mouse.y, d=Math.hypot(dx,dy);
      if (d<150){ ctx.strokeStyle=fg; ctx.globalAlpha=(1-d/150)*.5;
        ctx.beginPath(); ctx.moveTo(mouse.x,mouse.y); ctx.lineTo(n.x,n.y); ctx.stroke(); ctx.globalAlpha=1; }
    }
    ctx.textAlign="center"; ctx.textBaseline="middle";
    for (let i=particles.length-1;i>=0;i--){
      const p = particles[i]; p.y+=p.vy; p.life-=0.014;
      if (p.life<=0){ particles.splice(i,1); continue; }
      ctx.globalAlpha=p.life; ctx.fillStyle=fg; ctx.font=`${p.size}px "Space Mono", monospace`;
      ctx.fillText(p.ch, p.x, p.y);
    }
    ctx.globalAlpha=1; requestAnimationFrame(draw);
  })();
})();

/* ---------------------------------------------------------
   7. BACK-TO-TOP + smooth anchor scroll
   --------------------------------------------------------- */
$$("[data-top]").forEach(a=> a.addEventListener("click", e=>{ e.preventDefault(); window.scrollTo({top:0, behavior:"smooth"}); }));
$$('a[href^="#"]:not([data-top])').forEach(a=>{
  a.addEventListener("click", ev=>{ const t = $(a.getAttribute("href")); if (t){ ev.preventDefault(); t.scrollIntoView({behavior:"smooth"}); } });
});

/* ---------------------------------------------------------
   8. GITHUB CONTRIBUTION CALENDAR
   --------------------------------------------------------- */
(function(){
  const USERNAME = "veruvet";
  const CELL   = 13;
  const GAP    = 3;
  const STEP   = CELL + GAP;
  const MONTH_H = 18;
  const COLORS = ["#0a0a0a","#0e4429","#006d32","#26a641","#39d353"];
  const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
  const FMONTHS= ["january","february","march","april","may","june","july","august","september","october","november","december"];

  const svg       = $("#ghSvg");
  const scroll    = $("#ghScroll");
  const skeleton  = $("#ghSkeleton");
  const errorEl   = $("#ghError");
  const footer    = $("#ghFooter");
  const statsEl   = $("#ghStats");
  const canvasWrap= $("#ghCanvasWrap");
  if (!svg) return;

  // set legend swatch colours
  COLORS.forEach((c,i)=>{ const sw = $(`#ghSw${i}`); if(sw) sw.style.background = c; });

  // helpers
  function parseD(s){ const p=s.split("-").map(Number); return new Date(p[0],p[1]-1,p[2]); }
  function fmtD(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
  function addD(d,n){ const r=new Date(d); r.setDate(r.getDate()+n); return r; }
  function ordinal(n){ if(n>3&&n<21) return "th"; switch(n%10){case 1:return"st";case 2:return"nd";case 3:return"rd";default:return"th";} }
  function fmtTip(s){ const d=parseD(s); return `${FMONTHS[d.getMonth()]} ${d.getDate()}${ordinal(d.getDate())}`; }

  // build grid
  function buildGrid(start,end){
    const s=parseD(start), e=parseD(end);
    const off = s.getDay() % 7; // starts on Sunday
    const gs = addD(s, -off);
    const weeks=[]; const mLabels=[]; let cur=new Date(gs); let wi=0; let lastM=-1;
    while(cur<=e || (weeks.length && (weeks[weeks.length-1]||[]).length<7)){
      const wk=[];
      for(let d=0;d<7;d++){
        const ds=fmtD(cur); const inR=(cur>=s && cur<=e);
        wk.push(inR?ds:null);
        if(inR && cur.getMonth()!==lastM){ lastM=cur.getMonth(); mLabels.push({label:MONTHS[lastM],wi}); }
        cur=addD(cur,1);
      }
      weeks.push(wk); wi++;
      if(cur>e && weeks.length && (weeks[weeks.length-1]||[]).every(x=>x===null||parseD(x)>e)) break;
    }
    // filter overlapping month labels
    const byW=new Map(); mLabels.forEach(m=>byW.set(m.wi,m.label));
    const entries=Array.from(byW.entries()); const valid=[];
    for(let i=0;i<entries.length;i++){
      const c=entries[i], n=entries[i+1];
      if(i===0 && n && n[0]-c[0]<3) continue;
      const last=valid[valid.length-1];
      if(last && c[0]-last[0]<3) continue;
      valid.push(c);
    }
    return { weeks, monthLabels:valid, gridStart:fmtD(gs) };
  }

  // tooltip
  let tooltipEl = null;
  function showTooltip(x,y,text){
    if(!tooltipEl){
      tooltipEl = document.createElement("div");
      tooltipEl.className = "gh-tooltip";
      canvasWrap.appendChild(tooltipEl);
    }
    tooltipEl.textContent = text;
    tooltipEl.style.left = x+"px";
    tooltipEl.style.top  = y+"px";
    tooltipEl.classList.add("visible");
  }
  function hideTooltip(){ if(tooltipEl) tooltipEl.classList.remove("visible"); }

  // FETCH + RENDER
  const NS = "http://www.w3.org/2000/svg";
  let contribData = {};

  fetch(`https://github-contributions-api.jogruber.de/v4/${USERNAME}`)
    .then(r=>{ if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(json=>{
      json.contributions.forEach(e=>{
        contribData[e.date] = { level:Math.min(4,Math.max(0,e.level)), count:e.count };
      });

      // dates: last year
      const now = new Date();
      const endS = fmtD(now);
      const startD = new Date(now); startD.setFullYear(startD.getFullYear()-1); startD.setDate(startD.getDate()+1);
      const startS = fmtD(startD);

      const grid = buildGrid(startS, endS);
      const weeks = grid.weeks;
      const svgW = weeks.length * STEP - GAP;
      const svgH = MONTH_H + 7 * STEP - GAP;

      svg.setAttribute("width", svgW);
      svg.setAttribute("height", svgH);
      svg.setAttribute("viewBox", `0 0 ${svgW} ${svgH}`);

      // month labels
      grid.monthLabels.forEach(([wi,label])=>{
        const t = document.createElementNS(NS,"text");
        t.setAttribute("x", wi*STEP);
        t.setAttribute("y", 10);
        t.setAttribute("class","gh-month-label");
        t.textContent = label;
        svg.appendChild(t);
      });

      // cells
      weeks.forEach((wk,wi)=>{
        wk.forEach((date,di)=>{
          const entry = date ? contribData[date] : undefined;
          const level = entry ? entry.level : 0;
          const rect = document.createElementNS(NS,"rect");
          rect.setAttribute("x", wi*STEP);
          rect.setAttribute("y", MONTH_H + di*STEP);
          rect.setAttribute("width", CELL);
          rect.setAttribute("height", CELL);
          rect.setAttribute("rx", CELL*0.2);
          rect.setAttribute("fill", COLORS[level] || COLORS[0]);
          if(date){
            rect.dataset.date = date;
            rect.dataset.level = level;
            rect.addEventListener("mouseenter", ()=>{
              const cnt = entry ? entry.count : 0;
              const tip = cnt === 0
                ? `no contributions on ${fmtTip(date)}.`
                : `${cnt} contribution${cnt!==1?"s":""} on ${fmtTip(date)}.`;
              showTooltip(wi*STEP + CELL/2, MONTH_H + di*STEP, tip);
            });
            rect.addEventListener("mouseleave", hideTooltip);
          }
          svg.appendChild(rect);
        });
      });

      // stats
      const total = Object.values(contribData).reduce((s,v)=>s+(v.count||(v.level>0?1:0)), 0);
      statsEl.innerHTML = `<a href="https://github.com/${USERNAME}" target="_blank" rel="noopener noreferrer">`
        + `<span class="gh-user">${USERNAME}</span> contributed `
        + `<span class="gh-count">${total.toLocaleString()}</span> this year on `
        + `<span class="gh-link">github</span></a>`;

      // show calendar, hide skeleton
      skeleton.style.display = "none";
      scroll.style.display = "";
      footer.style.display = "";
      // auto-scroll to right
      setTimeout(()=>{ scroll.scrollLeft = scroll.scrollWidth; }, 60);
    })
    .catch(err=>{
      skeleton.style.display = "none";
      errorEl.style.display = "";
      errorEl.querySelector("span").textContent = `⚠ ${err.message || "could not load contributions"}`;
    });
})();

})();
