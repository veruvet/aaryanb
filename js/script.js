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

})();
