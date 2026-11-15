/* Whistle Street tarot cards — all art is original hand-written SVG.
   Usage: <script src="tarot-cards.js"></script>, then TAROT.card('tower') returns an <svg> string,
   TAROT.back() the card back, TAROT.DECK lists every card with its spot and picking rule.
   The script injects its own shared <defs> and ink CSS once. Needs the "IM Fell English SC" Google font (falls back to Georgia). */
(function(){
const DEFS=`<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <pattern id="hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
      <line x1="0" y1="0" x2="0" y2="4" stroke="#1c1915" stroke-width=".7" opacity=".4"/>
    </pattern>
    <pattern id="xhatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
      <path d="M0 0V4M0 0H4" stroke="#1c1915" stroke-width=".6" opacity=".38"/>
    </pattern>
    <pattern id="hatchL" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
      <line x1="0" y1="0" x2="0" y2="6" stroke="#1c1915" stroke-width=".55" opacity=".22"/>
    </pattern>
    <pattern id="stip" width="9" height="9" patternUnits="userSpaceOnUse">
      <circle cx="1.5" cy="2" r=".55" fill="#1c1915" opacity=".28"/><circle cx="6" cy="5.5" r=".5" fill="#1c1915" opacity=".22"/>
      <circle cx="3.5" cy="7.6" r=".45" fill="#1c1915" opacity=".2"/><circle cx="7.8" cy="1.2" r=".4" fill="#1c1915" opacity=".2"/>
    </pattern>
    <pattern id="stipW" width="10" height="10" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="3" r=".6" fill="#fff" opacity=".35"/><circle cx="7" cy="7" r=".5" fill="#fff" opacity=".3"/>
    </pattern>
    <pattern id="brick" width="18" height="11" patternUnits="userSpaceOnUse">
      <rect width="18" height="11" fill="#cdbf9c"/>
      <rect x="5.5" y="1" width="8" height="4.4" fill="#d9ccab"/><rect x="0" y="6.5" width="13.5" height="4" fill="#c2b28d"/>
      <path d="M0 .5H18M0 6H18M5 .5V6M14 6V11" stroke="#1c1915" stroke-width=".8" opacity=".6" fill="none"/>
    </pattern>
    <pattern id="brickC" width="16" height="10" patternUnits="userSpaceOnUse">
      <rect width="16" height="10" fill="#dcd2b8"/>
      <rect x="4.6" y="1" width="7" height="4" fill="#e6dec8"/>
      <path d="M0 .5H16M0 5.5H16M4 .5V5.5M12 5.5V10" stroke="#1c1915" stroke-width=".7" opacity=".5" fill="none"/>
    </pattern>
    <pattern id="lattice" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="22" height="22" fill="#1d2a4f"/>
      <path d="M0 11H22M11 0V22" stroke="#e6c25a" stroke-width=".7" opacity=".45"/>
      <circle cx="11" cy="11" r="1.6" fill="#e6c25a" opacity=".8"/>
    </pattern>
    <linearGradient id="skyT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2340"/><stop offset=".7" stop-color="#3b3f63"/><stop offset="1" stop-color="#5a4a5e"/></linearGradient>
    <linearGradient id="skyC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7d655"/><stop offset="1" stop-color="#eeb328"/></linearGradient>
    <linearGradient id="skyW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fc0dc"/><stop offset="1" stop-color="#c3e0ee"/></linearGradient>
    <linearGradient id="skyS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e9fc6"/><stop offset=".55" stop-color="#a3cbe2"/><stop offset="1" stop-color="#d3e7ef"/></linearGradient>
    <radialGradient id="glowO"><stop offset="0" stop-color="#ffb347" stop-opacity=".75"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
    <radialGradient id="glowY"><stop offset="0" stop-color="#fff6c0" stop-opacity=".9"/><stop offset="1" stop-color="#fff6c0" stop-opacity="0"/></radialGradient>
    <linearGradient id="goldG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#e2a923"/></linearGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" result="n"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .27  0 0 0 0 .15  0 0 0 .55 -.18" in="n"/>
      <feComposite operator="in" in2="SourceGraphic"/>
    </filter>
    <filter id="mottle" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="3" seed="3" result="n"/>
      <feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .42  0 0 0 0 .2  0 0 0 .5 -.12" in="n"/>
      <feComposite operator="in" in2="SourceGraphic"/>
    </filter>
    <radialGradient id="vig" cx="50%" cy="50%" r="70%">
      <stop offset="62%" stop-color="#7a5a2a" stop-opacity="0"/>
      <stop offset="100%" stop-color="#7a5a2a" stop-opacity=".3"/>
    </radialGradient>
    <clipPath id="art"><rect x="20" y="20" width="260" height="414"/></clipPath>
    <path id="ringText" d="M150 228 m-81 0 a81 81 0 1 1 162 0 a81 81 0 1 1 -162 0"/>
    <symbol id="fleuron" viewBox="-10 -10 20 20">
      <path d="M0 -8 C3 -3 3 -3 8 0 C3 3 3 3 0 8 C-3 3 -3 3 -8 0 C-3 -3 -3 -3 0 -8Z" fill="#b98f3e"/>
      <circle r="2" fill="#f3e8cc"/>
    </symbol>
  </defs>
</svg>`;
const CSS=`
.k{stroke:var(--ink);stroke-width:1.7;stroke-linejoin:round;stroke-linecap:round}
.kt{stroke:var(--ink);stroke-width:1.1;stroke-linejoin:round;stroke-linecap:round}
.kn{fill:none;stroke:var(--ink);stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round}
.kf{fill:none;stroke:var(--ink);stroke-width:.7;stroke-linecap:round;stroke-linejoin:round;opacity:.7}
.ttl{font-family:"IM Fell English SC",Georgia,"Times New Roman",serif;fill:var(--ink)}
.mono{font-family:ui-monospace,Menlo,Consolas,monospace;font-weight:700}
`;
function inject(){ if(document.getElementById('tarot-defs')) return;
  const w=document.createElement('div'); w.id='tarot-defs'; w.innerHTML=DEFS; document.body.prepend(w);
  const st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st); }
if(document.body) inject(); else document.addEventListener('DOMContentLoaded',inject);
const INK='#1c1915';
const R=n=>Math.round(n*10)/10;
function star8(cx,cy,Ro,ri,rot=0){let p=[];for(let i=0;i<16;i++){const a=(Math.PI/8)*i-Math.PI/2+rot;const rr=i%2?ri:Ro;p.push(R(cx+rr*Math.cos(a))+','+R(cy+rr*Math.sin(a)))}return p.join(' ')}
function flame(x,y,s,fill,rot=0){
  return `<path class="kt" transform="rotate(${rot} ${x} ${y})" fill="${fill}" d="M${x} ${y}
   c${-9*s} ${-4*s} ${-11*s} ${-14*s} ${-4*s} ${-22*s} c${1*s} ${5*s} ${4*s} ${7*s} ${6*s} ${6*s}
   c${-2*s} ${-8*s} ${2*s} ${-14*s} ${7*s} ${-18*s} c${-1*s} ${7*s} ${4*s} ${10*s} ${6*s} ${15*s}
   c${2*s} ${-3*s} ${2*s} ${-6*s} ${1*s} ${-9*s} c${7*s} ${8*s} ${6*s} ${22*s} ${-4*s} ${28*s}z"/>`;
}
function fire(x,y,s,rot){return flame(x,y,s,'#d9402a',rot)+flame(x+1,y-1,s*.72,'#ef7a2c',rot)+flame(x+2,y-2,s*.42,'#f8d04a',rot)}
function cloud(x,y,w,fill='#fbf8ef',shade='#d9dde6'){
  const s=w/100;
  const d=`M${x} ${y} c${-8*s} 0 ${-12*s} ${-12*s} ${-2*s} ${-16*s} c${-2*s} ${-14*s} ${16*s} ${-20*s} ${24*s} ${-10*s}
   c${4*s} ${-16*s} ${30*s} ${-18*s} ${36*s} ${-2*s} c${10*s} ${-10*s} ${30*s} ${-4*s} ${26*s} ${10*s} c${12*s} ${2*s} ${12*s} ${18*s} ${-2*s} ${18*s}z`;
  return `<path fill="${fill}" d="${d}"/>
   <path fill="${shade}" d="M${x-6*s} ${y-7*s} q${30*s} ${8*s} ${96*s} ${-2*s} q${4*s} ${8*s} ${-2*s} ${9*s} H${x} q${-6*s} 0 ${-6*s} ${-7*s}z"/>
   <path class="k" fill="none" d="${d}"/>
   <path class="kf" d="M${x+18*s} ${y-12*s} q${8*s} ${-7*s} ${16*s} 0 M${x+50*s} ${y-14*s} q${9*s} ${-9*s} ${18*s} ${-2*s} M${x+36*s} ${y-24*s} q${6*s} ${-6*s} ${12*s} ${-1*s}"/>`;
}
const tufts=(list,col='#2f4a22')=>list.map(([x,y])=>`<path class="kn" stroke="${col}" d="M${x} ${y} l-2.5 -6 M${x} ${y} l0 -8 M${x} ${y} l3 -6"/>`).join('');
const flowers=list=>list.map(([x,y,c])=>`<path class="kn" stroke="#2f4a22" d="M${x} ${y} v10 M${x} ${y+6} q-4 -2 -5 -5"/>${[0,72,144,216,288].map(a=>`<circle cx="${R(x+2.6*Math.cos(a*Math.PI/180))}" cy="${R(y+2.6*Math.sin(a*Math.PI/180))}" r="1.9" fill="${c}" stroke="${INK}" stroke-width=".5"/>`).join('')}<circle cx="${x}" cy="${y}" r="1.2" fill="#f2c230"/>`).join('');

function frame(numeral,title,scene){
  return `<svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}">
  <rect x="1.5" y="1.5" width="297" height="497" rx="12" fill="#f3e8cc" stroke="#b9a77c" stroke-width="1.5"/>
  <rect x="1.5" y="1.5" width="297" height="497" rx="12" fill="#fff" filter="url(#mottle)" opacity=".5"/>
  <rect x="8" y="8" width="284" height="484" rx="7" fill="none" stroke="#b98f3e" stroke-width=".9"/>
  <rect x="11" y="11" width="278" height="478" rx="5" fill="none" stroke="#b98f3e" stroke-width=".4"/>
  ${[[11,11],[289,11],[11,489],[289,489]].map(([x,y])=>`<use href="#fleuron" x="${x-5}" y="${y-5}" width="10" height="10"/>`).join('')}
  <g clip-path="url(#art)">${scene}</g>
  <rect x="20" y="20" width="260" height="414" fill="none" stroke="${INK}" stroke-width="2.6"/>
  <path d="M120 20h60v18q0 7-7 7h-46q-7 0-7-7z" fill="#f3e8cc" stroke="${INK}" stroke-width="1.8"/>
  <path d="M126 22h48v15q0 5-5 5h-38q-5 0-5-5z" fill="none" stroke="${INK}" stroke-width=".6"/>
  <text x="150" y="37.5" text-anchor="middle" class="ttl" font-size="16" letter-spacing="1.5">${numeral}</text>
  <rect x="20" y="442" width="260" height="42" fill="#f3e8cc" stroke="${INK}" stroke-width="2"/>
  <rect x="24" y="446" width="252" height="34" fill="none" stroke="${INK}" stroke-width=".6"/>
  ${title.length>13?'':'<path d="M36 463l4-4 4 4-4 4zM256 463l4-4 4 4-4 4z" fill="'+INK+'"/>'}
  <text x="150" y="470" text-anchor="middle" class="ttl" font-size="${title.length>14?18.5:21}" letter-spacing="1.2">${title}</text>
  <rect x="1.5" y="1.5" width="297" height="497" rx="12" fill="url(#vig)"/>
  <rect x="1.5" y="1.5" width="297" height="497" rx="12" fill="#fff" filter="url(#grain)" opacity=".55"/>
  </svg>`;
}

/* ================= XVI THE TOWER: market's last month ================= */
function towerScene(){
  const candles=[[264,40,16,0],[252,58,18,0],[241,76,14,1],[230,92,22,0],[219,114,16,0],[208,132,20,0]].map(([x,y,h,up])=>
    `<line x1="${x}" y1="${y-7}" x2="${x}" y2="${y+h+7}" stroke="${INK}" stroke-width="1.3"/>
     <rect class="kt" x="${x-4.5}" y="${y}" width="9" height="${h}" fill="${up?'#f3e8cc':'#d23b2a'}"/>
     ${up?'':`<rect x="${x+1.5}" y="${y+1}" width="2.2" height="${h-2}" fill="#9e2418"/>`}`).join('');
  const coins=[[58,196],[80,226],[46,268],[234,206],[250,240],[222,274],[92,166],[258,306],[40,326],[204,226]].map(([x,y],i)=>
    `<g transform="rotate(${i*23} ${x} ${y})"><ellipse class="kt" cx="${x}" cy="${y}" rx="5.2" ry="3.8" fill="url(#goldG)"/><ellipse cx="${x}" cy="${y}" rx="2.8" ry="1.8" fill="none" stroke="#9a6b10" stroke-width=".6"/></g>`).join('');
  const tapes=[[46,146,-28,'S&P ▼5.2'],[214,180,24,'NDX ▼6.8'],[54,240,16,'DOW ▼3.9'],[228,256,-18,'VIX ▲31'],[72,304,-8,'RUT ▼7.1']].map(([x,y,r,t])=>
    `<g transform="rotate(${r} ${x} ${y})"><path class="kt" fill="#fbf6e6" d="M${x-24} ${y} q12 -4 24 0 t24 0 v10 q-12 4 -24 0 t-24 0z"/>
    <path d="M${x-24} ${y+6} q12 -4 24 0 t24 0 v4 q-12 4 -24 0 t-24 0z" fill="#e6dcc0"/>
    <text x="${x}" y="${y+7.4}" text-anchor="middle" class="mono" font-size="6.2" fill="#b22a1c">${t}</text></g>`).join('');
  let rain='';for(let i=0;i<42;i++){const x=20+((i*53)%260),y=40+((i*97)%300);rain+=`<line x1="${x}" y1="${y}" x2="${x-5}" y2="${y+14}" stroke="#c9d3f0" stroke-width=".7" opacity=".35"/>`}
  const city=[[20,370,16,46],[36,382,14,34],[50,360,12,56],[62,388,16,28],[226,384,14,32],[240,362,14,54],[254,376,12,40],[266,356,16,60]];
  const lit=city.map(([x,y,w,h])=>{let o='';for(let yy=y+5;yy<y+h-4;yy+=7)for(let xx=x+3;xx<x+w-3;xx+=5){if((xx*7+yy*3)%5<2)o+=`<rect x="${xx}" y="${yy}" width="2" height="3" fill="#f6c96a"/>`}return o}).join('');
  return `
  <rect x="20" y="20" width="260" height="414" fill="url(#skyT)"/>
  <rect x="20" y="20" width="260" height="414" fill="url(#stipW)"/>
  ${rain}
  ${cloud(10,98,116,'#262a44','#1a1d31')}
  ${cloud(178,72,124,'#262a44','#1a1d31')}
  ${cloud(-12,152,72,'#2c3050','#1f2238')}
  ${cloud(236,150,60,'#2c3050','#1f2238')}
  <!-- distant city -->
  ${city.map(([x,y,w,h])=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1a1c2e" stroke="${INK}" stroke-width=".8"/>`).join('')}
  ${lit}
  <!-- lightning -->
  <path d="M276 20 L226 70 L242 74 L201 110 L217 115 L178 150" fill="none" stroke="#fff3b8" stroke-width="16" opacity=".18" stroke-linejoin="round"/>
  <circle cx="186" cy="138" r="40" fill="url(#glowY)" opacity=".55"/>
  <path class="kt" fill="none" stroke="#f5cf3a" stroke-width="1.6" d="M232 66 l-18 6 l-8 14 M212 112 l-14 -4 l-10 10"/>
  ${candles}
  <path class="k" fill="#f5cf3a" d="M278 20 L226 70 L242 74 L201 110 L217 115 L178 150 L196 108 L180 104 L214 68 L198 64 L256 20Z"/>
  <path d="M270 22 L222 66 L232 70 M218 82 L206 102 L212 106" fill="none" stroke="#fffbe0" stroke-width="2.2" opacity=".9"/>
  <path d="M250 22 L198 64 L214 68 L180 104 L196 108 L184 140" fill="none" stroke="#d9a21a" stroke-width="2" opacity=".55"/>
  <!-- crag -->
  <path class="k" fill="#7c7262" d="M20 434 L20 388 L44 368 L66 362 L84 336 L104 322 L118 314 L184 314 L200 324 L214 340 L236 352 L256 372 L280 384 L280 434Z"/>
  <path fill="#5f564a" d="M20 434 L20 388 L44 368 L66 362 L84 336 L104 322 L118 314 L150 314 L130 360 L96 400 L70 434Z"/>
  <path d="M20 434 L20 388 L44 368 L66 362 L84 336 L104 322 L118 314 L150 314 L130 360 L96 400 L70 434Z" fill="url(#xhatch)"/>
  <path fill="#9a8e78" d="M184 314 L200 324 L214 340 L236 352 L256 372 L280 384 L280 400 L238 380 L206 356 Z"/>
  <path d="M150 314 L184 314 L206 356 L170 420 L130 434 L96 434 L130 380Z" fill="url(#stip)"/>
  <path class="kn" d="M84 336 l14 20 l-6 18 M200 324 l-8 26 l12 18 M236 352 l-6 30 M44 368 l10 24 M160 330 l6 22 l-10 20 l8 30 M110 360 l-10 30 l6 20 M246 396 l-14 22"/>
  <path class="k" fill="#968a74" d="M150 314 l40 0 l14 14 l-10 22 l-20 -10 z"/>
  <path class="k" fill="#6b6253" d="M90 410 l12 -8 l10 6 l-4 12 l-14 2z M210 400 l10 -4 l8 8 l-8 6z"/>
  ${tufts([[60,372],[226,360],[262,384],[120,330]],'#4a5a3a')}
  <!-- tower -->
  <ellipse cx="150" cy="200" rx="60" ry="80" fill="url(#glowO)" opacity=".45"/>
  <path class="k" fill="url(#brick)" d="M118 316 L182 316 L178 146 L122 146 Z"/>
  <path d="M158 316 L182 316 L178 146 L162 146Z" fill="url(#xhatch)"/>
  <path d="M118 316 L124 316 L127 146 L122 146Z" fill="#fff" opacity=".18"/>
  <path class="kn" stroke-width="1.4" d="M170 160 l-6 12 l5 8 l-7 14 l4 10 M128 270 l8 10 l-3 10"/>
  <path class="k" fill="#cdbf9c" d="M118 148 L118 130 L128 130 L128 138 L136 138 L136 128 L146 128 L146 136 L152 132 L158 140 L164 134 L170 140 L176 130 L182 130 L182 148Z"/>
  <path d="M164 148 L164 134 L170 140 L176 130 L182 130 L182 148Z" fill="url(#hatch)"/>
  <path class="k" fill="#bfb08c" d="M114 148 H186 V158 H114Z"/>
  <path d="M114 300 H186 V306 H114Z" fill="#bfb08c" stroke="${INK}" stroke-width="1.2"/>
  <!-- windows -->
  ${[[150,206,8,18],[133,256,7,16],[168,256,7,16]].map(([x,y,r,h])=>`
    <circle cx="${x}" cy="${y-h/2}" r="${r*2.4}" fill="url(#glowO)"/>
    <path class="k" fill="#d0bf98" d="M${x-r-3} ${y+2} v${-h} a${r+3} ${r+3} 0 0 1 ${2*r+6} 0 v${h}z"/>
    <path class="k" fill="#2a1712" d="M${x-r} ${y} v${-h+2} a${r} ${r} 0 0 1 ${2*r} 0 v${h-2}z"/>
    <path d="M${x-r+2} ${y} v${-h/2} q${r-2} -6 ${2*r-4} 0 v${h/2}z" fill="#e8642a" opacity=".85"/>
    <rect class="kt" x="${x-r-5}" y="${y}" width="${2*r+10}" height="4" fill="#bfb08c"/>`).join('')}
  ${fire(150,186,1.0,18)}${fire(133,240,.9,22)}${fire(168,240,.9,22)}
  <path class="k" fill="#3a2b20" d="M140 316 v-24 a10 10 0 0 1 20 0 v24z"/>
  <path class="kn" d="M150 282 v34 M144 296 h-3 M141 304 h18" />
  <circle cx="156" cy="302" r="1.4" fill="#e6c25a"/>
  <!-- crown fire -->
  ${fire(130,134,1.25,25)}${fire(160,136,1.45,20)}${fire(176,138,1.0,35)}${fire(146,132,.9,10)}
  <!-- falling bricks -->
  ${[[108,170,20],[196,186,-30],[100,214,50],[202,150,15]].map(([x,y,r])=>`<rect class="kt" x="${x}" y="${y}" width="10" height="6" fill="#cdbf9c" transform="rotate(${r} ${x} ${y})"/>`).join('')}
  <!-- the crown -->
  <g transform="rotate(-28 92 112)">
    <path class="k" fill="url(#goldG)" d="M70 122 L72 100 L80 110 L86 94 L92 108 L98 94 L104 110 L112 100 L114 122 Z"/>
    <path d="M100 110 L104 110 L112 100 L114 122 L104 122Z" fill="#c98f1d" opacity=".7"/>
    <rect class="k" x="68" y="120" width="48" height="9" fill="#e0a92a"/>
    <path class="kf" d="M72 124.5 h40"/>
    <circle class="kt" cx="92" cy="114" r="3.6" fill="#d23b2a"/><circle cx="91" cy="113" r="1" fill="#fff"/>
    <circle class="kt" cx="80" cy="116" r="2.3" fill="#3f7fb8"/><circle class="kt" cx="104" cy="116" r="2.3" fill="#3f7fb8"/>
    ${[72,80,88,96,104,112].map(x=>`<circle cx="${x}" cy="124.5" r=".9" fill="${INK}"/>`).join('')}
    <path class="k" fill="#f6efdc" d="M70 104 q-14 -8 -10 -22 q2 12 14 14z M114 104 q14 -8 10 -22 q-2 12 -14 14z"/>
  </g>
  ${fire(70,128,.75,-60)}
  <path class="kt" fill="#4f4d66" opacity=".9" d="M178 128 q10 -16 24 -10 q8 -12 22 -4 q14 -2 12 12 q-10 8 -22 2 q-12 10 -24 2 q-12 4 -12 -2z"/>
  <path class="kf" stroke="#c9c6dc" d="M190 120 q6 -4 12 0 M212 114 q6 -4 12 0"/>
  ${tapes}
  ${coins}
  ${[[100,186],[196,218],[84,280],[208,296],[110,352],[192,362],[64,182],[236,170]].map(([x,y])=>`<path class="kt" fill="#f6c13a" d="M${x} ${y} q3.5 6 0 11 q-3.5 -5 0 -11z"/>`).join('')}
  `;
}

/* ================= X WHEEL OF FORTUNE: the market now ================= */
function wheelScene(){
  const cx=150, cy=228;
  const sunb=Array.from({length:24},(_,i)=>{const a1=(i*15-3.5)*Math.PI/180,a2=(i*15+3.5)*Math.PI/180;return `<path d="M${cx} ${cy} L${R(cx+190*Math.cos(a1))} ${R(cy+190*Math.sin(a1))} L${R(cx+190*Math.cos(a2))} ${R(cy+190*Math.sin(a2))}Z" fill="#fff" opacity="${i%2?.16:.28}"/>`}).join('');
  const spokes=[0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180;return `<line x1="${R(cx+14*Math.cos(r))}" y1="${R(cy+14*Math.sin(r))}" x2="${R(cx+70*Math.cos(r))}" y2="${R(cy+70*Math.sin(r))}" stroke="${INK}" stroke-width="2"/>`}).join('');
  const sym=['$','▲','%','▼','$','▲','%','▼'];
  const syms=[22.5,67.5,112.5,157.5,202.5,247.5,292.5,337.5].map((a,i)=>{const r=(a-90)*Math.PI/180;const c=sym[i]=='▲'?'#2f8a45':sym[i]=='▼'?'#c23a2a':INK;return `<text x="${R(cx+55*Math.cos(r))}" y="${R(cy+55*Math.sin(r)+4.5)}" text-anchor="middle" font-family="Georgia,serif" font-size="${c==INK?14:10}" font-weight="700" fill="${c}">${sym[i]}</text>`}).join('');
  const segs=Array.from({length:8},(_,i)=>{const a1=i*45*Math.PI/180,a2=(i+1)*45*Math.PI/180;return `<path d="M${R(cx+38*Math.cos(a1))} ${R(cy+38*Math.sin(a1))} L${R(cx+70*Math.cos(a1))} ${R(cy+70*Math.sin(a1))} A70 70 0 0 1 ${R(cx+70*Math.cos(a2))} ${R(cy+70*Math.sin(a2))} L${R(cx+38*Math.cos(a2))} ${R(cy+38*Math.sin(a2))} A38 38 0 0 0 ${R(cx+38*Math.cos(a1))} ${R(cy+38*Math.sin(a1))}Z" fill="${i%2?'#f7d27a':'#f3c25e'}"/>`}).join('');
  const ticks=Array.from({length:48},(_,i)=>{const r=i*7.5*Math.PI/180;return `<line x1="${R(cx+70*Math.cos(r))}" y1="${R(cy+70*Math.sin(r))}" x2="${R(cx+73.5*Math.cos(r))}" y2="${R(cy+73.5*Math.sin(r))}" stroke="${INK}" stroke-width=".9"/>`}).join('');
  const rivets=Array.from({length:16},(_,i)=>{const r=(i*22.5+11.25)*Math.PI/180;return `<circle cx="${R(cx+89*Math.cos(r))}" cy="${R(cy+89*Math.sin(r))}" r="1.3" fill="#7a3d12"/>`}).join('');
  const rays=Array.from({length:12},(_,i)=>{const r=i*30*Math.PI/180;return `<line x1="${R(58+13*Math.cos(r))}" y1="${R(66+13*Math.sin(r))}" x2="${R(58+20*Math.cos(r))}" y2="${R(66+20*Math.sin(r))}" stroke="${INK}" stroke-width="1.4"/>`}).join('');
  const line=(d,c)=>`<path d="${d}" fill="none" stroke="${INK}" stroke-width="8.5" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="5.2" stroke-linejoin="round" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="1" opacity=".45" stroke-linejoin="round" transform="translate(-1 -1)"/>`;
  return `
  <rect x="20" y="20" width="260" height="414" fill="url(#skyW)"/>
  ${sunb}
  <rect x="20" y="20" width="260" height="414" fill="url(#stip)" opacity=".7"/>
  <!-- corner weather -->
  ${cloud(22,102,84)}
  <circle cx="58" cy="66" r="18" fill="url(#glowY)"/>
  <circle class="k" cx="58" cy="66" r="11" fill="#f6cf3a"/>${rays}
  <path class="kn" d="M54 64 v1 M62 64 v1 M54 70 q4 3 8 0"/>
  ${cloud(194,102,84)}
  <path class="k" fill="#8e95a6" d="M212 78 q0 -12 14 -12 q6 -10 18 -4 q14 0 12 14 q-2 6 -10 6 h-28 q-6 0 -6 -4z"/>
  <path d="M214 80 h40 q-2 3 -8 3 h-28 q-4 0 -4 -3z" fill="#6c7386"/>
  ${[[220,90],[230,94],[240,90],[250,94]].map(([x,y])=>`<path class="kt" fill="#3f7fb8" d="M${x} ${y} q3 5 0 8 q-3 -3 0 -8z"/>`).join('')}
  ${cloud(14,412,88,'#eef0f5')}
  <path class="k" fill="#5d6276" d="M34 380 q0 -12 14 -12 q6 -10 18 -4 q14 0 12 14 q-2 6 -10 6 h-28 q-6 0 -6 -4z"/>
  <path class="k" fill="#f6cf3a" d="M56 386 l-8 14 h6 l-4 12 l12 -16 h-6 l4 -10z"/>
  ${cloud(198,412,88,'#eef0f5')}
  ${[['#d8442c',26],['#ec8a3a',22],['#f2c230',18],['#5f9a4a',14],['#3f7fb8',10]].map(([c,r])=>`<path d="M${246-r} 398 a${r} ${r} 0 0 1 ${2*r} 0" fill="none" stroke="${c}" stroke-width="4"/>`).join('')}
  <path class="kn" d="M218 398 a28 28 0 0 1 56 0 M238 398 a8 8 0 0 1 16 0"/>
  <!-- market lines -->
  ${line('M58 144 l14 26 l-12 18 l18 30 l-14 22 l16 30 l-8 26','#d23b2a')}
  <path class="k" fill="#d23b2a" d="M56 288 l8 18 l12 -14z"/>
  ${line('M244 316 l-14 -26 l12 -18 l-18 -30 l14 -22 l-16 -30 l10 -24','#3f9a4e')}
  <path class="k" fill="#3f9a4e" d="M232 152 l-6 -18 l16 8z"/>
  <!-- the wheel -->
  <circle cx="${cx+3}" cy="${cy+5}" r="94" fill="#1c1915" opacity=".16"/>
  <circle class="k" cx="${cx}" cy="${cy}" r="92" fill="#ec8a3a" stroke-width="2.4"/>
  <path d="M${cx+92} ${cy} A92 92 0 0 1 ${cx} ${cy+92} L${cx} ${cy+74} A74 74 0 0 0 ${cx+74} ${cy}Z" fill="#c9661f" opacity=".55"/>
  <circle cx="${cx}" cy="${cy}" r="88.5" fill="none" stroke="#f8c27d" stroke-width="1" opacity=".8"/>
  ${rivets}
  <circle class="k" cx="${cx}" cy="${cy}" r="74" fill="#f5cb6c"/>
  ${segs}
  ${ticks}
  <text font-family="'IM Fell English SC',Georgia,serif" font-size="13" fill="${INK}"><textPath href="#ringText" textLength="500" lengthAdjust="spacing" startOffset="6">BUY ✦ HOLD ✦ SELL ✦ BUY ✦ HOLD ✦ SELL ✦ </textPath></text>
  <circle class="kt" cx="${cx}" cy="${cy}" r="70" fill="none"/>
  ${spokes}
  ${syms}
  <circle class="k" cx="${cx}" cy="${cy}" r="38" fill="none"/>
  <circle class="kt" cx="${cx}" cy="${cy}" r="34" fill="none" stroke-dasharray="2 3"/>
  <circle class="k" cx="${cx}" cy="${cy}" r="15" fill="#f3e8cc"/>
  <polygon class="kt" fill="#d8442c" points="${star8(cx,cy,11,4.5)}"/>
  <circle class="kt" cx="${cx}" cy="${cy}" r="2.6" fill="#f2c230"/>
  <!-- bull riding the top -->
  <g transform="translate(150 120)">
    <ellipse class="k" cx="0" cy="8" rx="30" ry="12" fill="#5a4637"/>
    <path d="M-28 10 q20 10 56 2 q-4 8 -28 9 q-22 0 -28 -11z" fill="#3e3128"/>
    <path class="kf" stroke="#d8c6b0" d="M-18 2 q8 -4 16 0 M-8 6 q8 -3 14 0"/>
    <path class="k" fill="#5a4637" d="M-26 10 q-4 10 2 12 h10 l-2 -10z M18 12 q2 10 8 10 h8 q0 -6 -6 -10z"/>
    <path class="k" fill="#5a4637" d="M14 -14 q14 -6 24 4 q2 12 -6 18 q-12 4 -18 -6z"/>
    <ellipse class="k" cx="34" cy="6" rx="7" ry="5" fill="#8a7160"/>
    <circle cx="32" cy="6" r=".9" fill="${INK}"/><circle cx="36.5" cy="6" r=".9" fill="${INK}"/>
    <path class="k" fill="#f6efdc" d="M18 -12 q-8 -10 -2 -18 q2 8 8 12z M34 -14 q6 -10 0 -18 q-2 8 -6 12z"/>
    <circle cx="26" cy="-4" r="1.8" fill="#f3e8cc"/><circle cx="26.4" cy="-4" r=".8" fill="${INK}"/>
    <path class="kn" d="M-30 6 q-10 -6 -8 -16" stroke-width="1.6"/><path class="kt" fill="#3e3128" d="M-38 -10 l-3 -4 l5 1z"/>
    <line x1="-6" y1="-2" x2="-6" y2="-36" stroke="${INK}" stroke-width="1.8"/>
    <path class="kt" fill="#3f9a4e" d="M-6 -36 l22 6 l-22 7z"/><path d="M-6 -30 l22 0 l-22 7z" fill="#2f7a3c"/>
  </g>
  <!-- bear sliding off -->
  <g transform="translate(150 334) rotate(12)">
    <ellipse class="k" cx="0" cy="8" rx="28" ry="14" fill="#a8562f"/>
    <path d="M-26 12 q20 12 52 0 q-6 10 -26 10 q-20 0 -26 -10z" fill="#7f3e20"/>
    <path class="kf" stroke="#f0c9a8" d="M-10 0 q6 -4 12 0 M4 4 q6 -3 10 0"/>
    <path class="k" fill="#a8562f" d="M-22 12 q-6 10 0 14 h10 l0 -10z M12 16 q0 10 6 10 h10 q2 -6 -6 -12z"/>
    <circle class="k" cx="-32" cy="-2" r="13" fill="#a8562f"/>
    <circle class="k" cx="-40" cy="-12" r="5" fill="#a8562f"/><circle class="k" cx="-24" cy="-13" r="5" fill="#a8562f"/>
    <circle cx="-40" cy="-12" r="2.2" fill="#d9a07a"/><circle cx="-24" cy="-13" r="2.2" fill="#d9a07a"/>
    <ellipse class="k" cx="-34" cy="4" rx="6" ry="4.5" fill="#d9a07a"/>
    <ellipse cx="-34" cy="2.5" rx="2.4" ry="1.6" fill="${INK}"/>
    <circle cx="-37" cy="-4" r="1.4" fill="${INK}"/><circle cx="-29" cy="-4" r="1.4" fill="${INK}"/>
    <path class="kn" d="M-40 -8 q2 -2 4 0 M-31 -8 q2 -2 4 0"/>
  </g>
  `;
}

/* ================= VII THE CHARIOT: your stocks ================= */
function chariotScene(){
  const sunrays=Array.from({length:18},(_,i)=>{const a=(i*20+10)*Math.PI/180;return `<line x1="${R(150+40*Math.cos(a))}" y1="${R(180+40*Math.sin(a))}" x2="${R(150+150*Math.cos(a))}" y2="${R(180+150*Math.sin(a))}" stroke="#fff6c8" stroke-width="5" opacity=".35"/>`}).join('');
  const canopyStars=[[104,151],[124,147],[144,145],[164,145],[184,147],[200,151],[114,158],[134,156],[154,155],[174,155],[192,158]].map(([x,y])=>`<polygon fill="#f6e7a8" points="${star8(x,y,3.4,1.3)}"/>`).join('');
  const wheel=(cx,cy)=>`<circle class="k" cx="${cx}" cy="${cy}" r="26" fill="#7a4e2c"/><circle cx="${cx}" cy="${cy}" r="23" fill="none" stroke="#a5713f" stroke-width="2"/>
    ${Array.from({length:12},(_,i)=>{const a=i*30*Math.PI/180;return `<circle cx="${R(cx+24.5*Math.cos(a))}" cy="${R(cy+24.5*Math.sin(a))}" r=".9" fill="${INK}"/>`}).join('')}
    <circle class="k" cx="${cx}" cy="${cy}" r="19" fill="#c99d60"/>
    ${[0,30,60,90,120,150].map(a=>{const r=a*Math.PI/180;return `<line x1="${R(cx+19*Math.cos(r))}" y1="${R(cy+19*Math.sin(r))}" x2="${R(cx-19*Math.cos(r))}" y2="${R(cy-19*Math.sin(r))}" stroke="${INK}" stroke-width="1.8"/>`}).join('')}
    <circle class="k" cx="${cx}" cy="${cy}" r="6" fill="url(#goldG)"/><circle cx="${cx}" cy="${cy}" r="1.6" fill="${INK}"/>`;
  const pennant=(x,y,c)=>`<line x1="${x}" y1="${y}" x2="${x}" y2="${y-18}" stroke="${INK}" stroke-width="1.2"/><path class="kt" fill="${c}" d="M${x} ${y-18} q8 2 14 4 q-6 2 -14 4z"/>`;
  return `
  <rect x="20" y="20" width="260" height="414" fill="url(#skyC)"/>
  ${sunrays}
  <rect x="20" y="20" width="260" height="414" fill="url(#stip)" opacity=".8"/>
  ${[[56,70],[244,70],[40,128],[260,128]].map(([x,y])=>`<polygon class="kt" fill="#fbf2c9" points="${star8(x,y,5,2)}"/>`).join('')}
  <path class="kn" d="M60 200 q4 -4 8 0 q4 -4 8 0 M222 210 q3 -3 6 0 q3 -3 6 0" stroke-width="1.2"/>
  <!-- your tickers banner -->
  <path class="k" fill="#151a16" d="M36 88 H264 l-10 10 l10 10 H36 l10 -10z"/>
  <path d="M36 88 l10 10 l-10 10z M264 88 l-10 10 l10 10z" fill="#2c332d"/>
  <text x="150" y="101.5" text-anchor="middle" class="mono" font-size="7.6" letter-spacing=".3"><tspan fill="#ff7a6a">NVDA▼</tspan><tspan fill="#ff7a6a"> AAPL▼</tspan><tspan fill="#8ee08a"> MSFT▲</tspan><tspan fill="#ff7a6a"> AMZN▼</tspan><tspan fill="#8ee08a"> JPM▲</tspan></text>
  <!-- hills + trees -->
  <path class="k" fill="#9cbf72" d="M20 254 q40 -22 80 -6 q40 -18 90 -2 q50 -16 94 2 V300 H20Z"/>
  <path d="M20 254 q40 -22 80 -6 q-30 6 -50 30 L20 286Z" fill="url(#hatch)" opacity=".6"/>
  ${[[36,238,18],[70,232,22],[232,232,20],[264,240,16]].map(([x,y,r])=>`<line x1="${x}" y1="${y}" x2="${x}" y2="${y+28}" stroke="${INK}" stroke-width="2.4"/><circle class="k" cx="${x}" cy="${y}" r="${r}" fill="#5f8f41"/><path d="M${x} ${y-r} a${r} ${r} 0 0 1 0 ${2*r}z" fill="#4a7533" opacity=".7"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${INK}" stroke-width="1.7"/><path class="kf" d="M${x-r*.6} ${y-2} q${r*.4} ${-r*.5} ${r*.8} 0 M${x-r*.2} ${y+r*.4} q${r*.3} ${-r*.4} ${r*.6} 0"/>`).join('')}
  <!-- city wall -->
  <path class="k" fill="url(#brickC)" d="M20 270 H280 V300 H20Z"/>
  <path class="k" fill="#d8cfb6" d="M20 270 v-8 ${Array.from({length:13},()=>'h10 v6 h10 v-6').join(' ')} v8z"/>
  <rect class="k" x="24" y="214" width="26" height="56" fill="url(#brickC)"/><path class="k" fill="#c8452e" d="M20 216 L37 182 L54 216Z"/><path d="M37 182 L54 216 L42 216Z" fill="#9e3220"/>
  <rect class="k" x="250" y="210" width="26" height="60" fill="url(#brickC)"/><path class="k" fill="#c8452e" d="M246 212 L263 176 L280 212Z"/><path d="M263 176 L280 212 L268 212Z" fill="#9e3220"/>
  ${pennant(37,182,'#3f9a4e')}${pennant(263,176,'#d23b2a')}
  <rect class="kt" x="32" y="232" width="9" height="14" rx="4" fill="#2a2633"/><rect class="kt" x="258" y="228" width="9" height="14" rx="4" fill="#2a2633"/>
  <!-- river -->
  <path class="k" fill="#7fb4d6" d="M20 300 H280 V316 q-30 6 -66 0 t-70 0 t-66 0 t-58 0Z"/>
  <path class="kf" stroke="#eef6fb" d="M40 306 q10 -3 20 0 M120 308 q10 -3 20 0 M200 305 q10 -3 20 0 M250 309 q8 -3 16 0 M74 311 q6 -2 12 0"/>
  <!-- ground -->
  <path class="k" fill="#c2bd99" d="M20 316 q30 6 62 0 t66 0 t70 0 t62 0 V434 H20Z"/>
  <rect x="20" y="330" width="260" height="104" fill="url(#hatchL)"/>
  <rect x="20" y="330" width="260" height="104" fill="url(#stip)"/>
  <ellipse cx="150" cy="422" rx="120" ry="10" fill="#1c1915" opacity=".12"/>
  ${wheel(80,350)}${wheel(220,350)}
  <!-- canopy posts -->
  ${[90,204].map(x=>`<rect class="k" x="${x}" y="150" width="6" height="118" fill="#d7d0bf"/><rect x="${x+3.5}" y="152" width="2" height="114" fill="#a59d89"/>${[170,200,230].map(y=>`<path class="kf" d="M${x} ${y} h6"/>`).join('')}`).join('')}
  <!-- charioteer -->
  <path class="k" fill="#9db4cc" d="M126 206 Q150 196 174 206 L180 266 H120Z"/>
  <path d="M160 206 L174 206 L180 266 H164Z" fill="url(#xhatch)"/>
  ${[214,226,238,250].map(y=>`<path class="kf" d="M${124+(y-206)*.1} ${y} q26 4 ${52-(y-206)*.2} 0"/>`).join('')}
  <rect class="k" x="137" y="220" width="26" height="24" fill="url(#goldG)"/>
  <path class="kn" d="M141 238 l6 -7 l5 4 l7 -10" stroke-width="1.7"/><path class="kt" fill="${INK}" d="M159 225 l-4 0 l3 3z"/>
  <path class="k" fill="#e6c25a" d="M122 252 H178 V260 H122Z"/>
  ${[128,138,148,158,168].map(x=>`<circle cx="${x}" cy="256" r="1.3" fill="#7a5410"/>`).join('')}
  <path class="k" fill="#f8f4e8" d="M116 212 q4 -14 18 -14 q-10 6 -6 18 q-6 4 -12 -4z"/>
  <path class="k" fill="#f8f4e8" d="M184 212 q-4 -14 -18 -14 q10 6 6 18 q6 4 12 -4z"/>
  <path class="k" fill="#9db4cc" d="M176 214 q12 6 16 22 l-8 4 q-4 -12 -12 -16z"/>
  <circle class="k" cx="192" cy="238" r="5" fill="#f0cfa6"/>
  <rect class="k" x="144" y="190" width="12" height="10" fill="#f0cfa6"/>
  <path class="k" fill="#f0cfa6" d="M136 178 q0 -18 14 -18 q14 0 14 18 q0 14 -14 16 q-14 -2 -14 -16z"/>
  <path d="M157 166 q7 6 6 14 q-1 10 -9 13 q6 -10 3 -27z" fill="#d9ad84" opacity=".7"/>
  <path class="k" fill="#e9b949" d="M136 172 q0 -16 14 -16 q14 0 14 16 q-4 -6 -14 -6 q-10 0 -14 6z"/>
  <path class="k" fill="#6c9a45" d="M134 168 q16 -8 32 0 l-2 4 q-14 -6 -28 0z"/>
  ${[138,144,156,162].map(x=>`<ellipse cx="${x}" cy="${x<150?167:167}" rx="2.4" ry="1.3" fill="#86b35a" stroke="${INK}" stroke-width=".5" transform="rotate(${x<150?-25:25} ${x} 167)"/>`).join('')}
  <polygon class="kt" fill="#f6d23a" points="${star8(150,160,7,3)}"/>
  <path class="kn" d="M143 180 q2.5 -2 5 0 M152 180 q2.5 -2 5 0 M150 182 v5 q1 1 2 0 M146 189 q4 2 8 0"/>
  <circle cx="141" cy="185" r="2" fill="#e89a8a" opacity=".5"/><circle cx="159" cy="185" r="2" fill="#e89a8a" opacity=".5"/>
  <!-- canopy -->
  <path class="k" fill="#2c5a9a" d="M84 140 Q150 126 216 140 V160 ${Array.from({length:12},()=>'q-5 6 -11 0').join(' ')} z"/>
  <path d="M84 140 Q150 126 216 140 V146 Q150 134 84 146z" fill="#1f4478"/>
  ${canopyStars}
  ${Array.from({length:12},(_,i)=>`<path class="kt" fill="#e6c25a" d="M${R(210.5-i*11)} 163 l-1.5 6 h3z"/>`).join('')}
  <path class="k" fill="url(#goldG)" d="M84 136 Q150 122 216 136 v6 Q150 128 84 142z"/>
  <!-- staff -->
  <line x1="194" y1="150" x2="194" y2="262" stroke="${INK}" stroke-width="5"/>
  <line x1="194" y1="150" x2="194" y2="262" stroke="#e7c35a" stroke-width="2.6"/>
  <path class="k" fill="#3f9a4e" d="M194 132 l12 17 h-6 v7 h-12 v-7 h-6z"/>
  <!-- chariot body -->
  <path class="k" fill="#d6cfbd" d="M86 262 H214 V354 H86Z"/>
  <path d="M188 262 H214 V354 H188Z" fill="url(#xhatch)"/>
  <path d="M86 262 H92 V354 H86Z" fill="#fff" opacity=".3"/>
  <rect class="k" x="82" y="256" width="136" height="10" fill="url(#goldG)"/>
  ${Array.from({length:9},(_,i)=>`<circle cx="${90+i*15}" cy="261" r="1.3" fill="#7a5410"/>`).join('')}
  <rect class="k" x="82" y="350" width="136" height="8" fill="#bfb7a2"/>
  <rect x="92" y="270" width="116" height="76" fill="none" stroke="${INK}" stroke-width=".8"/>
  <!-- winged emblem -->
  <path class="k" fill="#c8452e" d="M150 300 q-26 -18 -50 -8 q14 2 18 8 q-12 0 -16 6 q14 -2 22 4 q-8 2 -10 8 q20 -6 36 -2z"/>
  <path class="kf" d="M118 296 q14 0 28 6 M116 306 q14 0 30 2"/>
  <path class="k" fill="#3f7fb8" d="M150 300 q26 -18 50 -8 q-14 2 -18 8 q12 0 16 6 q-14 -2 -22 4 q8 2 10 8 q-20 -6 -36 -2z"/>
  <path class="kf" d="M182 296 q-14 0 -28 6 M184 306 q-14 0 -30 2"/>
  <circle class="k" cx="150" cy="306" r="21" fill="#f3e8cc"/>
  <!-- donut: 62% tech -->
  <circle cx="150" cy="306" r="15" fill="none" stroke="#c9bfa3" stroke-width="6"/>
  <circle cx="150" cy="306" r="15" fill="none" stroke="#3f7fb8" stroke-width="6" stroke-dasharray="${R(2*Math.PI*15*.62)} 200" transform="rotate(-90 150 306)"/>
  <circle cx="150" cy="306" r="18" fill="none" stroke="${INK}" stroke-width=".8"/><circle cx="150" cy="306" r="12" fill="none" stroke="${INK}" stroke-width=".8"/>
  <text x="150" y="309" text-anchor="middle" class="ttl" font-size="8.5">62%</text>
  <text x="150" y="342" text-anchor="middle" class="ttl" font-size="9" letter-spacing="2.4">TECH</text>
  <!-- bull -->
  <g>
    <ellipse class="k" cx="96" cy="404" rx="42" ry="19" fill="#3e352d"/>
    <path d="M58 410 q36 16 78 0 q-6 12 -40 13 q-32 0 -38 -13z" fill="#2a231d"/>
    <path class="kf" stroke="#f3e8cc" d="M64 398 q10 -4 20 0 M70 408 q10 -4 18 0 M92 396 q8 -3 14 0" opacity=".6"/>
    <path class="k" fill="#3e352d" d="M58 414 q-6 10 4 12 h20 q4 -6 -4 -8z"/>
    <path class="k" fill="#3e352d" d="M110 418 q-2 10 8 10 h18 q4 -6 -6 -8z"/>
    <path class="k" fill="#3e352d" d="M118 366 q16 -6 32 0 q2 22 -6 34 q-10 8 -20 0 q-8 -12 -6 -34z"/>
    <path d="M118 366 q4 -2 10 -3 q-4 18 2 38 q-3 -1 -6 -1 q-8 -12 -6 -34z" fill="#56493d"/>
    <ellipse class="k" cx="134" cy="398" rx="11" ry="7" fill="#7a6656"/>
    <circle cx="130" cy="398" r="1.6" fill="${INK}"/><circle cx="138" cy="398" r="1.6" fill="${INK}"/>
    <path class="k" fill="#f6efdc" d="M120 368 q-14 -2 -16 -16 q8 8 18 8z M148 368 q14 -2 16 -16 q-8 8 -18 8z"/>
    <path class="k" fill="#3e352d" d="M118 372 l-8 4 l8 3z M150 372 l8 4 l-8 3z"/>
    <circle cx="127" cy="380" r="2.2" fill="#f3e8cc"/><circle cx="141" cy="380" r="2.2" fill="#f3e8cc"/>
    <circle cx="127.5" cy="380.5" r="1" fill="${INK}"/><circle cx="140.5" cy="380.5" r="1" fill="${INK}"/>
    <circle cx="134" cy="405" r="3.2" fill="none" stroke="#e6c25a" stroke-width="1.8"/>
  </g>
  <!-- bear -->
  <g>
    <ellipse class="k" cx="206" cy="404" rx="42" ry="19" fill="#f1ebdd"/>
    <path d="M168 410 q38 16 80 0 q-6 12 -42 13 q-34 0 -38 -13z" fill="#d8cfbd"/>
    <path class="kf" d="M214 396 q8 -3 14 0 M226 404 q8 -3 12 0"/>
    <path class="k" fill="#f1ebdd" d="M222 418 q2 10 -8 10 h-18 q-4 -6 6 -8z"/>
    <path class="k" fill="#f1ebdd" d="M246 412 q8 10 -2 14 h-18 q-4 -6 4 -8z"/>
    <path class="kf" d="M200 426 v-3 M205 426 v-3 M210 426 v-3"/>
    <circle class="k" cx="166" cy="380" r="9" fill="#f1ebdd"/><circle class="k" cx="194" cy="380" r="9" fill="#f1ebdd"/>
    <circle cx="166" cy="380" r="4" fill="#d9b9a2"/><circle cx="194" cy="380" r="4" fill="#d9b9a2"/>
    <circle class="k" cx="180" cy="392" r="17" fill="#f1ebdd"/>
    <path d="M190 380 a17 17 0 0 1 -2 26 q6 -12 2 -26z" fill="#d8cfbd"/>
    <ellipse class="k" cx="180" cy="399" rx="8" ry="6" fill="#fbf7ee"/>
    <ellipse cx="180" cy="396" rx="3.2" ry="2.2" fill="${INK}"/>
    <path class="kn" d="M180 398 v3 q-3 3 -5 1 M180 401 q3 3 5 1"/>
    <circle cx="173" cy="388" r="1.9" fill="${INK}"/><circle cx="187" cy="388" r="1.9" fill="${INK}"/>
  </g>
  ${tufts([[30,340],[60,432],[260,340],[270,428],[150,432],[40,384],[264,384]])}
  `;
}

/* ================= XVII THE STAR: what to do ================= */
function starScene(){
  const small=[[52,62],[248,62],[40,134],[260,134],[60,166],[218,176],[150,182]];
  const smallStars=small.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="10" fill="url(#glowY)"/><polygon class="kt" fill="#fbf8ef" points="${star8(x,y,11,4.2)}"/><polygon fill="#f6e7a8" points="${star8(x,y,4,1.6,Math.PI/8)}"/>`).join('');
  let rain='';
  for(let i=0;i<16;i++){const x=30+((i*37)%74),y=212+((i*23)%74);rain+=`<line x1="${x}" y1="${y}" x2="${x-3}" y2="${y+9}" stroke="#2f5fa0" stroke-width="1.6" stroke-linecap="round"/>`}
  for(let i=0;i<10;i++){const x=206+((i*29)%40),y=196+((i*31)%30);rain+=`<line x1="${x}" y1="${y}" x2="${x-3}" y2="${y+9}" stroke="#2f5fa0" stroke-width="1.6" stroke-linecap="round"/>`}
  const L=78,Rr=222,base=292,apexY=226,n=6,w=(Rr-L)/n;
  let panels='';
  for(let i=0;i<n;i++){const x0=L+i*w;panels+=`<path class="kt" fill="${i%2?'#f3e8cc':'#d23b2a'}" d="M150 ${apexY} L${R(x0)} ${base} q${R(w/2)} -12 ${R(w)} 0 Z"/>`;
    if(i>=3)panels+=`<path d="M150 ${apexY} L${R(x0)} ${base} q${R(w/2)} -12 ${R(w)} 0 Z" fill="url(#hatch)" opacity="${.3+(i-3)*.2}"/>`;}
  const bars=[[118,350],[146,350],[174,350],[132,340],[160,340],[146,330]].map(([x,y])=>`
    <path class="kt" fill="url(#goldG)" d="M${x-12} ${y+10} L${x-9} ${y} H${x+9} L${x+12} ${y+10}Z"/>
    <path d="M${x+9} ${y} L${x+12} ${y+10} H${x+6} L${x+5} ${y}Z" fill="#c98f1d"/>
    <path d="M${x-8} ${y+1.5} h10" stroke="#fff6c0" stroke-width="1"/>
    <text x="${x-1}" y="${y+7.6}" text-anchor="middle" font-family="Georgia,serif" font-size="5.5" fill="#7a5410" font-weight="700">AU</text>`).join('');
  return `
  <rect x="20" y="20" width="260" height="414" fill="url(#skyS)"/>
  <rect x="20" y="20" width="260" height="414" fill="url(#stipW)"/>
  <circle cx="150" cy="100" r="80" fill="url(#glowY)"/>
  ${Array.from({length:32},(_,i)=>{const a=i*11.25*Math.PI/180,l=i%2?66:76;return `<line x1="${R(150+58*Math.cos(a))}" y1="${R(100+58*Math.sin(a))}" x2="${R(150+l*Math.cos(a))}" y2="${R(100+l*Math.sin(a))}" stroke="${INK}" stroke-width="${i%2?.7:1}" opacity=".5"/>`}).join('')}
  <polygon class="k" fill="#f6cf2c" points="${star8(150,100,56,22)}" stroke-width="2"/>
  ${Array.from({length:8},(_,i)=>{const a=(i*45-90)*Math.PI/180,b=(i*45-90+22.5)*Math.PI/180;return `<path d="M150 100 L${R(150+56*Math.cos(a))} ${R(100+56*Math.sin(a))} L${R(150+22*Math.cos(b))} ${R(100+22*Math.sin(b))}Z" fill="#e2a923" opacity=".75"/>`}).join('')}
  <polygon fill="none" stroke="${INK}" stroke-width="2" stroke-linejoin="round" points="${star8(150,100,56,22)}"/>
  <polygon class="kt" fill="#ec8a3a" points="${star8(150,100,30,13,Math.PI/8)}"/>
  <polygon fill="#d8442c" opacity=".6" points="${star8(150,100,18,8)}"/>
  <circle class="kt" cx="150" cy="100" r="6" fill="#fbf2c9"/>
  ${smallStars}
  ${cloud(22,214,94,'#6d7488','#565c70')}
  ${cloud(200,190,62,'#6d7488','#565c70')}
  ${rain}
  <!-- mountains -->
  <path class="k" fill="#8b9aba" d="M20 300 L20 268 L52 236 L74 252 L96 228 L134 296Z"/>
  <path d="M96 228 L134 296 L104 296 L88 262Z" fill="#6c7b9c"/>
  <path class="k" fill="#f8f4e8" d="M52 236 L60 244 L66 240 L74 252 L80 242 L96 228 L86 244 L76 258 L66 250 L58 256 L46 246Z" stroke-width="1"/>
  <!-- hills -->
  <path class="k" fill="#86ad5c" d="M20 300 q50 -26 110 -8 q60 -20 150 -4 V434 H20Z"/>
  <path d="M20 300 q50 -26 110 -8 q-40 10 -60 40 q-20 30 -50 30Z" fill="url(#hatch)" opacity=".7"/>
  <rect x="20" y="300" width="260" height="134" fill="url(#stip)" opacity=".6"/>
  <!-- little stream down into the pool -->
  <path class="k" fill="#5d9cc6" d="M262 296 q-12 18 -30 26 q-20 8 -26 30 q-2 10 6 16 l-14 0 q-8 -10 -2 -22 q8 -22 30 -30 q18 -8 26 -22z"/>
  <path class="kf" stroke="#eef6fb" d="M252 306 q-10 10 -20 14 M226 330 q-8 6 -10 14"/>
  <!-- tree + bird -->
  <path class="k" fill="#6b4a2e" d="M246 318 q4 -30 -2 -60 h8 q4 30 2 60z"/>
  <path d="M250 260 q3 30 0 58 h2 q4 -30 -2 -58z" fill="#4e3520"/>
  <circle class="k" cx="248" cy="244" r="22" fill="#5f8f41"/>
  <path d="M256 224 a22 22 0 0 1 0 40 q8 -20 0 -40z" fill="#4a7533"/>
  <circle class="k" cx="232" cy="256" r="12" fill="#5f8f41"/><circle class="k" cx="264" cy="254" r="13" fill="#4f7d37"/>
  <path class="kf" d="M240 240 q6 -6 12 0 M232 254 q4 -4 8 0 M246 252 q5 -5 10 0"/>
  ${[[238,234],[256,248],[226,258]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="2.2" fill="#d23b2a" stroke="${INK}" stroke-width=".5"/>`).join('')}
  <g transform="translate(248 218)">
    <path class="k" fill="#d23b2a" d="M-8 2 q0 -10 10 -10 q8 0 8 6 l8 2 l-8 2 q-2 8 -10 8 q-6 0 -8 -8z"/>
    <path class="kt" fill="#a82a1e" d="M-6 0 q-8 -4 -10 2 q6 2 10 2z"/>
    <circle cx="3" cy="-4" r="1.2" fill="${INK}"/>
    <path class="kn" d="M0 8 v4 M4 8 v4"/>
  </g>
  <!-- pool -->
  <ellipse class="k" cx="150" cy="398" rx="114" ry="30" fill="#5d9cc6"/>
  <ellipse cx="150" cy="404" rx="100" ry="20" fill="#4a86b0"/>
  <ellipse cx="150" cy="398" rx="114" ry="30" fill="url(#hatchL)"/>
  <!-- star reflection -->
  <path d="M142 410 q8 -3 16 0 M136 416 q14 -3 28 0 M144 422 q6 -2 12 0" stroke="#f6cf2c" stroke-width="2" fill="none" stroke-linecap="round"/>
  ${[[96,394,22],[200,392,18],[116,412,14],[188,414,12],[70,402,10],[232,402,10]].map(([x,y,r])=>`<path class="kn" stroke="#e8f2f8" d="M${x-r} ${y} q${r} -5 ${r*2} 0"/>`).join('')}
  <!-- island + gold -->
  <path class="k" fill="#86ad5c" d="M96 368 q8 -16 54 -16 q46 0 54 16 q-54 10 -108 0z"/>
  <path d="M150 352 q46 0 54 16 q-24 5 -50 5z" fill="#6c9446"/>
  <ellipse cx="150" cy="356" rx="40" ry="5" fill="#1c1915" opacity=".15"/>
  ${bars}
  ${[[104,362],[196,362],[110,358],[190,359]].map(([x,y])=>`<ellipse class="kt" cx="${x}" cy="${y}" rx="4.5" ry="3" fill="url(#goldG)"/>`).join('')}
  <!-- umbrella -->
  <path d="M150 ${apexY} V346 q0 10 -9 10 q-7 0 -7 -7" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
  <path d="M150 ${apexY} V346 q0 10 -9 10 q-7 0 -7 -7" fill="none" stroke="#7a4a2a" stroke-width="2.6" stroke-linecap="round"/>
  ${panels}
  <path fill="none" stroke="#fff" stroke-width="1.6" opacity=".55" stroke-linecap="round" d="M146 234 Q120 252 98 280 M140 236 Q126 248 116 262"/>
  <path class="k" fill="none" d="M150 ${apexY} L${L} ${base} ${Array.from({length:n},()=>`q${R(w/2)} -12 ${R(w)} 0`).join(' ')} Z" stroke-width="1.9"/>
  ${Array.from({length:n+1},(_,i)=>`<circle cx="${R(L+i*w)}" cy="${base}" r="1.6" fill="#e6c25a" stroke="${INK}" stroke-width=".6"/>`).join('')}
  <circle class="k" cx="150" cy="${apexY-3}" r="4" fill="url(#goldG)"/>
  ${[[80,282],[220,282],[70,296],[230,296],[86,300],[214,300]].map(([x,y])=>`<path class="kt" fill="#3f7fb8" d="M${x} ${y} q3 5 0 8 q-3 -3 0 -8z"/>`).join('')}
  <!-- signpost: what to do -->
  <g>
    <rect class="k" x="60" y="318" width="5" height="50" fill="#7a4e2c"/>
    <path class="k" fill="#f3e8cc" d="M30 321 h58 l8 7.5 l-8 7.5 h-58z"/>
    <text x="61" y="331.4" text-anchor="middle" class="ttl" font-size="7.6" letter-spacing=".4">HOLD STEADY</text>
    <path class="k" fill="#f3e8cc" d="M96 340 h-58 l-8 7.5 l8 7.5 h58z"/>
    <text x="65" y="350.4" text-anchor="middle" class="ttl" font-size="7.6" letter-spacing=".4">SPREAD OUT</text>
  </g>
  ${flowers([[262,334,'#d23b2a'],[244,350,'#f8f4e8'],[270,360,'#f2c230'],[32,372,'#f8f4e8'],[226,330,'#e889a8']])}
  ${tufts([[30,316],[96,322],[214,318],[272,314],[86,372],[250,372]])}
  `;
}

/* ================= CARD BACK ================= */
function backSVG(){
  return `<svg viewBox="0 0 300 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Card back">
  <rect x="1.5" y="1.5" width="297" height="497" rx="12" fill="#f3e8cc" stroke="#b9a77c" stroke-width="1.5"/>
  <rect x="14" y="14" width="272" height="472" rx="6" fill="url(#lattice)" stroke="${INK}" stroke-width="2.4"/>
  <rect x="24" y="24" width="252" height="452" rx="4" fill="none" stroke="#e6c25a" stroke-width="1.4"/>
  <rect x="29" y="29" width="242" height="442" rx="3" fill="none" stroke="#e6c25a" stroke-width=".6"/>
  ${[[38,38],[262,38],[38,462],[262,462]].map(([x,y])=>`<polygon fill="#e6c25a" points="${star8(x,y,7,2.6)}"/>`).join('')}
  <circle cx="150" cy="250" r="96" fill="#14203f" stroke="#e6c25a" stroke-width="1.6"/>
  <circle cx="150" cy="250" r="88" fill="none" stroke="#e6c25a" stroke-width=".6" stroke-dasharray="2 4"/>
  ${Array.from({length:24},(_,i)=>{const a=i*15*Math.PI/180;const r1=i%2?50:46,r2=i%2?70:82;return `<line x1="${R(150+r1*Math.cos(a))}" y1="${R(250+r1*Math.sin(a))}" x2="${R(150+r2*Math.cos(a))}" y2="${R(250+r2*Math.sin(a))}" stroke="#e6c25a" stroke-width="${i%2?1:1.8}"/>`}).join('')}
  <circle cx="150" cy="250" r="42" fill="#e6c25a"/>
  <path d="M118 256 a32 32 0 0 1 64 0 q-5.3 -6 -10.7 0 q-5.3 -6 -10.7 0 q-5.3 -6 -10.6 0 q-5.3 -6 -10.7 0 q-5.3 -6 -10.6 0 q-5.4 -6 -10.7 0z" fill="#14203f"/>
  <path d="M150 222 v52 q0 7 -6 7 q-5 0 -5 -5" fill="none" stroke="#14203f" stroke-width="3" stroke-linecap="round"/>
  <path d="M150 224 l-10 32 M150 224 l10 32" stroke="#e6c25a" stroke-width=".8" opacity=".7"/>
  <text x="150" y="132" text-anchor="middle" font-family="'IM Fell English SC',Georgia,serif" font-size="20" fill="#e6c25a" letter-spacing="4">WHISTLE</text>
  <text x="150" y="384" text-anchor="middle" font-family="'IM Fell English SC',Georgia,serif" font-size="20" fill="#e6c25a" letter-spacing="4">STREET</text>
  <path d="M100 400 h100 M120 406 h60 M100 116 h100 M120 110 h60" stroke="#e6c25a" stroke-width=".8"/>
  <rect x="1.5" y="1.5" width="297" height="497" rx="12" fill="#fff" filter="url(#grain)" opacity=".35"/>
  </svg>`;
}

/* ================= THE REST OF THE DECK ================= */
const meadow=(y=330,c='#86ad5c',d='#6c9446')=>`<path class="k" fill="${c}" d="M20 ${y} q60 -16 130 -4 q70 -14 130 2 V434 H20Z"/>
  <path d="M150 ${y-4} q70 -14 130 2 V434 H190 q-20 -60 -40 -${438-y}z" fill="${d}" opacity=".55"/>
  <rect x="20" y="${y-10}" width="260" height="${444-y}" fill="url(#stip)" opacity=".7"/>`;
const wing=(x,y,dir,c1,c2)=>{const s=dir;return `<path class="k" fill="${c1}" d="M${x} ${y} q${-40*s} -30 ${-70*s} -10 q${16*s} 4 ${22*s} 12 q${-22*s} 0 ${-30*s} 12 q${18*s} -2 ${26*s} 8 q${-16*s} 4 ${-20*s} 14 q${30*s} -10 ${72*s} -6z"/>
  <path class="kt" fill="${c2}" d="M${x} ${y} q${-24*s} -14 ${-46*s} -6 q${14*s} 4 ${18*s} 10 q${-10*s} 2 ${-14*s} 10 q${22*s} -6 ${42*s} -2z"/>
  <path class="kf" d="M${x-12*s} ${y-6} q${-14*s} -4 ${-26*s} 0 M${x-10*s} ${y+6} q${-20*s} -2 ${-34*s} 6 M${x-8*s} ${y+18} q${-16*s} 0 ${-30*s} 8"/>`};
const sparkle=(x,y,r=6,c='#fbf2c9')=>`<path d="M${x} ${y-r} Q${x+r*.2} ${y-r*.2} ${x+r} ${y} Q${x+r*.2} ${y+r*.2} ${x} ${y+r} Q${x-r*.2} ${y+r*.2} ${x-r} ${y} Q${x-r*.2} ${y-r*.2} ${x} ${y-r}Z" fill="${c}" stroke="${INK}" stroke-width=".7"/>`;
const tower2=(x,y,w,h,roof,win='#f6c96a')=>`<rect class="k" x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#brickC)"/>
  <rect x="${x+w*.62}" y="${y}" width="${w*.38}" height="${h}" fill="url(#hatch)"/>
  <path class="k" fill="#bfb7a2" d="M${x-4} ${y+2} v-12 ${Array.from({length:4},()=>`h${(w+8)/8} v6 h${(w+8)/8} v-6`).join(' ')} v12z"/>
  ${roof?`<path class="k" fill="#c8452e" d="M${x-4} ${y-10} L${x+w/2} ${y-44} L${x+w+4} ${y-10}Z"/><path d="M${x+w/2} ${y-44} L${x+w+4} ${y-10} L${x+w/2+6} ${y-10}Z" fill="#9e3220"/>`:''}
  <path class="k" fill="#2a1f1a" d="M${x+w/2-5} ${y+30} v-10 a5 5 0 0 1 10 0 v10z"/><path d="M${x+w/2-3.5} ${y+30} v-9 a3.5 3.5 0 0 1 7 0 v9z" fill="${win}"/>`;

/* XIX THE SUN : the market rose */
function sunScene(){
  const rays=Array.from({length:16},(_,i)=>{const a=(i*22.5-90)*Math.PI/180;
    if(i%2){const p=[];for(let k=0;k<=8;k++){const r=58+k*5.2,off=Math.sin(k*1.1)*.035;p.push(`${R(150+r*Math.cos(a+off))} ${R(160+r*Math.sin(a+off))}`)}return `<path d="M${p.join(' L')}" fill="none" stroke="${INK}" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M${p.join(' L')}" fill="none" stroke="#f6cf2c" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`}
    return `<polygon class="kt" fill="#f6cf2c" points="${R(150+56*Math.cos(a-.13))},${R(160+56*Math.sin(a-.13))} ${R(150+112*Math.cos(a))},${R(160+112*Math.sin(a))} ${R(150+56*Math.cos(a+.13))},${R(160+56*Math.sin(a+.13))}"/><polygon fill="#e2a923" opacity=".7" points="${R(150+56*Math.cos(a))},${R(160+56*Math.sin(a))} ${R(150+112*Math.cos(a))},${R(160+112*Math.sin(a))} ${R(150+56*Math.cos(a+.13))},${R(160+56*Math.sin(a+.13))}"/>`}).join('');
  const flowers2=[[48,262,1],[86,244,1.15],[214,244,1.15],[252,262,1]].map(([x,y,s])=>`
    <path class="kn" stroke="#2f4a22" stroke-width="2.2" d="M${x} ${y} q${-3} 30 0 60"/>
    <path class="kt" fill="#5f8f41" d="M${x} ${y+30} q-16 -2 -18 -12 q12 0 18 8z"/><path class="kt" fill="#4f7d37" d="M${x} ${y+44} q16 -2 18 -12 q-12 0 -18 8z"/>
    ${Array.from({length:14},(_,i)=>{const a=i*(360/14);const r=a*Math.PI/180;return `<ellipse cx="${R(x+10*s*Math.cos(r))}" cy="${R(y+10*s*Math.sin(r))}" rx="${R(6*s)}" ry="${R(2.6*s)}" transform="rotate(${R(a)} ${R(x+10*s*Math.cos(r))} ${R(y+10*s*Math.sin(r))})" fill="${i%2?'#f6cf2c':'#e9b524'}" stroke="${INK}" stroke-width=".6"/>`}).join('')}
    <circle class="kt" cx="${x}" cy="${y}" r="${R(6*s)}" fill="#6b4a2e"/>${[0,1,2,3,4].map(i=>`<circle cx="${R(x-2+i%3*2)}" cy="${R(y-2+Math.floor(i/3)*3)}" r=".7" fill="#f2c230"/>`).join('')}`).join('');
  return `<rect x="20" y="20" width="260" height="414" fill="url(#skyS)"/><rect x="20" y="20" width="260" height="414" fill="url(#stipW)"/>
  <circle cx="150" cy="160" r="120" fill="url(#glowY)"/>${rays}
  <circle class="k" cx="150" cy="160" r="54" fill="#f6cf2c" stroke-width="2"/>
  <circle cx="150" cy="160" r="47" fill="none" stroke="#e2a923" stroke-width="1.2"/>
  <path d="M182 118 a54 54 0 0 1 -26 96 q34 -42 26 -96z" fill="#e2a923" opacity=".55"/>
  <path class="kn" stroke-width="1.5" d="M127 146 q8 -6 15 0 M158 146 q8 -6 15 0 M130 155 q5 3 10 0 M160 155 q5 3 10 0 M150 158 l-4 12 q4 3 7 0 M134 180 q16 12 32 0"/>
  <circle cx="132" cy="173" r="5.5" fill="#ec8a3a" opacity=".45"/><circle cx="168" cy="173" r="5.5" fill="#ec8a3a" opacity=".45"/>
  <!-- rising banner chart behind the wall -->
  <path d="M28 300 L80 282 L110 290 L160 262 L200 270 L268 226" fill="none" stroke="${INK}" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M28 300 L80 282 L110 290 L160 262 L200 270 L268 226" fill="none" stroke="#3f9a4e" stroke-width="5.6" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M28 298 L80 280 L110 288 L160 260 L200 268 L266 225" fill="none" stroke="#c9f0c2" stroke-width="1.2" opacity=".7"/>
  <path class="k" fill="#3f9a4e" d="M276 220 l-20 -2 l10 16z"/>
  ${flowers2}
  <!-- garden wall -->
  <path class="k" fill="url(#brick)" d="M20 314 H280 V352 H20Z"/>
  <rect x="20" y="340" width="260" height="12" fill="url(#hatch)"/>
  <path class="k" fill="#bfb08c" d="M16 306 H284 V316 H16Z"/>
  <!-- a young bull bounding through the meadow -->
  ${meadow(352)}
  <g transform="translate(150 392)">
    <path class="k" fill="#8a5a33" d="M-38 -6 q4 -16 30 -16 q26 -2 36 6 q8 10 2 22 q-30 10 -62 4 q-10 -4 -6 -16z"/>
    <path d="M-36 6 q30 8 64 -2 q-2 8 -6 12 q-30 6 -56 0z" fill="#6b4426"/>
    <path class="k" fill="#8a5a33" d="M-30 6 l-14 18 l6 2 l16 -14z M-12 10 l-4 22 h6 l6 -20z M14 10 l10 20 l6 -2 l-6 -20z M24 6 l18 14 l4 -4 l-14 -14z"/>
    <path class="k" fill="#8a5a33" d="M24 -22 q14 -8 26 2 q4 12 -4 20 q-14 4 -22 -6z"/>
    <ellipse class="k" cx="46" cy="-4" rx="7" ry="5.5" fill="#c99d76"/>
    <circle cx="44" cy="-4" r=".9" fill="${INK}"/><circle cx="48.5" cy="-4" r=".9" fill="${INK}"/>
    <path class="k" fill="#f6efdc" d="M28 -20 q-8 -8 -4 -16 q2 8 8 10z M44 -22 q6 -8 2 -16 q-2 8 -6 10z"/>
    <circle cx="36" cy="-12" r="2" fill="#fbf8ef"/><circle cx="36.4" cy="-12" r="1" fill="${INK}"/>
    <path class="kn" stroke-width="1.6" d="M-38 -6 q-12 -6 -10 -18"/><path class="kt" fill="#6b4426" d="M-48 -24 l-4 -4 l6 0z"/>
    <path class="kt" fill="#d23b2a" d="M-12 -22 q-2 -16 6 -28 l24 4 l-8 8 l10 6 l-26 2 q-4 6 -6 8z"/>
    <line x1="-12" y1="-22" x2="-6" y2="-50" stroke="${INK}" stroke-width="1.8"/>
    <text x="8" y="-35" text-anchor="middle" font-family="Georgia,serif" font-size="8" font-weight="700" fill="#fbf8ef" transform="rotate(8 8 -35)">▲</text>
  </g>
  ${flowers([[40,410,'#d23b2a'],[70,380,'#f8f4e8'],[236,416,'#f2c230'],[262,384,'#d23b2a'],[110,424,'#e889a8']])}
  ${tufts([[30,372],[94,360],[206,360],[270,372],[180,424]])}`;
}

/* XIV TEMPERANCE : a quiet month */
function temperanceScene(){
  return `<rect x="20" y="20" width="260" height="414" fill="url(#skyW)"/><rect x="20" y="20" width="260" height="414" fill="url(#stip)" opacity=".55"/>
  ${cloud(24,120,70)}${cloud(206,96,66)}
  <!-- far mountains with crowned sun at the end of the path -->
  <path class="k" fill="#9aa9c4" d="M150 296 L196 236 L218 258 L246 218 L280 252 V296Z"/>
  <path d="M246 218 L280 252 V296 H244 L232 250Z" fill="#7c8bab"/>
  <path class="k" fill="#f8f4e8" d="M196 236 L204 246 L210 242 L218 258 L226 244 L246 218 L238 238 L228 252 L220 262 L210 250 L202 256 L190 246Z" stroke-width="1"/>
  <circle cx="230" cy="214" r="24" fill="url(#glowY)"/>
  <circle class="k" cx="230" cy="214" r="11" fill="#f6cf2c"/>
  <path class="kt" fill="url(#goldG)" d="M220 204 l3 -8 l4 5 l3 -7 l3 7 l4 -5 l3 8z"/>
  ${meadow(296)}
  <!-- winding path -->
  <path class="k" fill="#e7e2d4" d="M232 298 q-30 34 -86 52 q-40 14 -40 84 h-22 q0 -64 50 -86 q58 -24 90 -50z"/>
  <path class="kf" d="M210 314 l6 2 M180 334 l6 3 M140 354 l6 4 M110 384 l6 4 M102 414 l7 2"/>
  <!-- pool with stepping stones -->
  <ellipse class="k" cx="208" cy="406" rx="70" ry="22" fill="#5d9cc6"/>
  <ellipse cx="208" cy="410" rx="58" ry="14" fill="#4a86b0"/>
  <path class="kf" stroke="#eef6fb" d="M174 402 q10 -4 20 0 M216 410 q10 -4 20 0 M240 398 q8 -3 16 0"/>
  ${[[188,404],[206,398],[224,406]].map(([x,y])=>`<ellipse class="kt" cx="${x}" cy="${y}" rx="7" ry="3.5" fill="#bdb7aa"/>`).join('')}
  <!-- irises -->
  ${[[42,368],[56,360],[70,370],[262,350],[250,360]].map(([x,y])=>`<path class="kn" stroke="#2f4a22" stroke-width="1.4" d="M${x} ${y} v22 M${x} ${y+14} q-6 -4 -8 -12 M${x} ${y+16} q6 -4 7 -12"/><path class="kt" fill="#7a6cc8" d="M${x} ${y} q-7 -9 0 -16 q7 7 0 16z"/><path class="kt" fill="#9b8fe0" d="M${x} ${y} q-9 -2 -10 -8 q6 0 10 6z M${x} ${y} q9 -2 10 -8 q-6 0 -10 6z"/><path fill="#f2c230" d="M${x-1} ${y-6} h2 v4 h-2z"/>`).join('')}
  <!-- wings behind the emblem -->
  ${wing(146,150,1,'#d8442c','#f3e8cc')}${wing(154,150,-1,'#d8442c','#f3e8cc')}
  <!-- central emblem: square in a circle -->
  <circle class="k" cx="150" cy="150" r="22" fill="#fbf8ef"/>
  <circle cx="150" cy="150" r="17" fill="none" stroke="${INK}" stroke-width=".7"/>
  <rect class="kt" x="140" y="140" width="20" height="20" fill="url(#goldG)" transform="rotate(45 150 150)"/>
  <path d="M136 150 h28" stroke="${INK}" stroke-width="1.2"/>
  <!-- two cups pouring -->
  <path d="M96 210 C 128 186, 170 236, 200 262" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
  <path d="M96 210 C 128 186, 170 236, 200 262" fill="none" stroke="#7fc0e6" stroke-width="6.6" stroke-linecap="round"/>
  <path d="M98 207 C 128 188, 166 232, 194 256" fill="none" stroke="#e8f6ff" stroke-width="1.6" opacity=".85"/>
  ${[[132,200],[160,222],[186,248]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.3" fill="#fff"/>`).join('')}
  <g transform="rotate(-38 86 222)"><path class="k" fill="url(#goldG)" d="M66 200 h40 q0 28 -20 33 q-20 -5 -20 -33z"/><path d="M94 200 h12 q0 28 -20 33 q10 -10 8 -33z" fill="#c98f1d" opacity=".7"/><path class="kf" d="M68 206 h36"/><rect class="k" x="83" y="233" width="6" height="14" fill="#e2a923"/><path class="k" fill="url(#goldG)" d="M72 252 h28 l-5 -5 h-18z"/></g>
  <g transform="rotate(8 206 280)"><path class="k" fill="url(#goldG)" d="M186 258 h40 q0 28 -20 33 q-20 -5 -20 -33z"/><path d="M214 258 h12 q0 28 -20 33 q10 -10 8 -33z" fill="#c98f1d" opacity=".7"/><path class="kf" d="M188 264 h36"/><rect class="k" x="203" y="291" width="6" height="12" fill="#e2a923"/><path class="k" fill="url(#goldG)" d="M192 308 h28 l-5 -5 h-18z"/></g>
  <!-- calm sparkline ribbon -->
  <path class="k" fill="#fbf6e6" d="M40 58 h220 l-8 10 l8 10 h-220 l8 -10z"/>
  <path d="M56 70 h36 l5 -3 l7 5 l7 -3 l7 2 h44 l5 -2 l7 3 h70" fill="none" stroke="#2f5fa0" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
  <text x="150" y="66" text-anchor="middle" class="mono" font-size="6" fill="#2f5fa0">S&amp;P 500 · 30 DAYS · ±1.4%</text>
  ${tufts([[30,312],[120,318],[270,316],[90,424]])}`;
}

/* XVIII THE MOON : fear gauge high */
function moonScene(){
  const drops=Array.from({length:15},(_,i)=>{const a=(i*24-90)*Math.PI/180;const x=150+70*Math.cos(a),y=120+70*Math.sin(a);return `<path class="kt" fill="#f6cf2c" transform="rotate(${R(i*24)} ${R(x)} ${R(y)})" d="M${R(x)} ${R(y)} q3.5 6 0 10 q-3.5 -4 0 -10z"/>`}).join('');
  const howler=(x,dir,body,shade,isBull)=>`<g transform="translate(${x} 330) scale(${dir} 1)">
    <path class="k" fill="${body}" d="M-24 30 q-4 -26 14 -36 q18 -6 26 8 q6 14 2 30z"/>
    <path d="M6 4 q8 12 4 26 h8 q4 -16 -6 -28z" fill="${shade}"/>
    <path class="k" fill="${body}" d="M2 10 l-2 22 h7 l1 -18z M12 8 l2 24 h7 l-3 -22z"/>
    <path d="M-2 4 q8 6 18 2 q-4 10 -10 12 q-6 -4 -8 -14z" fill="#fff" opacity=".12"/>
    <path class="kf" d="M-18 14 q8 -4 14 2 M-16 22 q6 -2 10 2"/>
    <path class="k" fill="${body}" d="M-6 -2 q-6 -18 8 -26 q14 -4 18 8 q2 14 -10 20z"/>
    ${isBull?`<path class="k" fill="#f6efdc" d="M0 -24 q-10 -6 -8 -16 q4 8 12 10z M16 -24 q8 -8 4 -18 q-2 8 -8 12z"/><ellipse class="k" cx="14" cy="-6" rx="7" ry="5" fill="#8a7160" transform="rotate(-40 14 -6)"/>`
      :`<circle class="k" cx="0" cy="-24" r="4.5" fill="${body}"/><circle class="k" cx="12" cy="-26" r="4.5" fill="${body}"/><ellipse class="k" cx="15" cy="-8" rx="6" ry="4" fill="#d9a07a" transform="rotate(-40 15 -8)"/><circle cx="18" cy="-11" r="1.6" fill="${INK}"/>`}
    <path class="kn" d="M4 -14 q2 -2 4 0"/>
    <path class="kn" stroke="#f6e7a8" d="M24 -24 q6 -4 10 -10 M26 -18 q8 -2 12 -6" opacity=".9"/>
  </g>`;
  return `<rect x="20" y="20" width="260" height="414" fill="url(#skyT)"/><rect x="20" y="20" width="260" height="414" fill="url(#stipW)"/>
  ${[[40,50],[262,60],[30,190],[270,200],[60,230]].map(([x,y])=>`<polygon fill="#fbf2c9" points="${star8(x,y,3.4,1.3)}"/>`).join('')}
  <circle cx="150" cy="120" r="96" fill="url(#glowY)" opacity=".55"/>
  ${Array.from({length:32},(_,i)=>{const a=i*11.25*Math.PI/180;return `<line x1="${R(150+52*Math.cos(a))}" y1="${R(120+52*Math.sin(a))}" x2="${R(150+(i%2?58:64)*Math.cos(a))}" y2="${R(120+(i%2?58:64)*Math.sin(a))}" stroke="#f6e7a8" stroke-width="1.1"/>`}).join('')}
  <circle class="k" cx="150" cy="120" r="48" fill="#f6e7a8" stroke-width="2"/>
  <path class="kt" fill="#d9c27a" d="M150 72 a48 48 0 0 0 0 96 a32 48 0 0 1 0 -96z"/>
  <path class="kn" stroke-width="1.3" d="M140 104 q5 -4 10 0 M141 110 q4 2 8 0 M150 116 l-6 10 l6 2 M140 138 q7 3 12 -1"/>
  <circle cx="142" cy="128" r="3" fill="#e2a923" opacity=".4"/>
  ${drops}
  <!-- distant mountains -->
  <path class="k" fill="#5c6788" d="M20 300 L70 250 L110 280 L150 236 L196 282 L232 254 L280 292 V320 H20Z"/>
  <path class="kt" fill="#d8dce8" d="M150 236 L160 248 L166 244 L172 256 L180 266 L166 258 L154 262 L146 250 L136 252Z"/>
  ${tower2(30,226,36,110,false)}${tower2(234,226,36,110,false)}
  <!-- fields -->
  <path class="k" fill="#6f8f7a" d="M20 318 q60 -14 130 -6 q70 -8 130 6 V434 H20Z"/>
  <rect x="20" y="318" width="260" height="116" fill="url(#hatchL)"/>
  <!-- winding path to the hills -->
  <path class="k" fill="#d8cfb6" d="M146 312 q-12 24 6 44 q16 20 -10 46 q-14 18 -6 32 h28 q-8 -14 8 -32 q22 -28 2 -50 q-14 -18 -6 -40z"/>
  <path class="kf" d="M150 330 l6 2 M152 360 l6 3 M146 392 l6 3 M152 420 l6 2"/>
  ${howler(80,1,'#5a4637','#3e3128',true)}${howler(220,-1,'#a8562f','#7f3e20',false)}
  <!-- fog -->
  ${[0,1,2].map(i=>`<path d="M20 ${296+i*34} q40 -10 80 0 t80 0 t100 0" fill="none" stroke="#fff" stroke-width="12" opacity=".12" stroke-linecap="round"/>`).join('')}
  <!-- pool in front -->
  <path class="k" fill="#3f6f9a" d="M20 406 q60 -16 130 -10 q70 -6 130 8 V434 H20Z"/>
  <path class="kf" stroke="#cfe2f0" d="M50 414 q10 -3 20 0 M210 416 q10 -3 20 0 M120 420 q10 -3 20 0"/>
  <path d="M138 418 q12 -4 24 0" stroke="#f6e7a8" stroke-width="1.6" fill="none"/>
  <!-- VIX sign -->
  <line x1="196" y1="372" x2="196" y2="404" stroke="${INK}" stroke-width="2.4"/>
  <rect class="k" x="174" y="356" width="44" height="18" fill="#151a16"/>
  <text x="196" y="368.5" text-anchor="middle" class="mono" font-size="8" fill="#ff7a6a">VIX 31▲</text>`;
}

/* VIII STRENGTH : a steady climb */
function strengthScene(){
  const steps=Array.from({length:7},(_,i)=>{const x=44+i*30,y=318-i*22;return `<path class="k" fill="#d8cfb6" d="M${x} ${y} h30 v${22+i*2} h-30z"/><rect x="${x+20}" y="${y}" width="10" height="${22+i*2}" fill="url(#hatch)"/><path class="kf" d="M${x+2} ${y+3} h26"/>`}).join('');
  return `<rect x="20" y="20" width="260" height="414" fill="url(#skyC)"/><rect x="20" y="20" width="260" height="414" fill="url(#stip)"/>
  <circle cx="150" cy="78" r="40" fill="url(#glowY)"/>
  <path d="M150 78 c-20 -26 -54 0 -32 18 c14 10 30 -8 32 -18 c2 10 18 28 32 18 c22 -18 -12 -44 -32 -18z" fill="none" stroke="${INK}" stroke-width="8"/>
  <path d="M150 78 c-20 -26 -54 0 -32 18 c14 10 30 -8 32 -18 c2 10 18 28 32 18 c22 -18 -12 -44 -32 -18z" fill="none" stroke="url(#goldG)" stroke-width="4.4"/>
  ${cloud(28,140,64)}${cloud(212,128,60)}
  <path class="k" fill="#9aa9c4" d="M20 260 L66 200 L104 236 L150 186 L206 246 L244 210 L280 240 V300 H20Z"/>
  <path d="M150 186 L206 246 L180 250 L156 220Z" fill="#7c8bab"/>
  <path class="kt" fill="#f8f4e8" d="M150 186 L160 198 L166 194 L172 206 L158 204 L148 210 L140 200Z"/>
  <!-- the hill and its stone stairway -->
  <path class="k" fill="#86ad5c" d="M20 300 Q120 250 280 150 V434 H20Z"/>
  <path d="M150 230 Q220 190 280 150 V434 H200Z" fill="#6c9446" opacity=".55"/>
  <rect x="20" y="150" width="260" height="284" fill="url(#stip)" opacity=".6" clip-path="none"/>
  ${steps}
  <line x1="262" y1="182" x2="262" y2="140" stroke="${INK}" stroke-width="2"/>
  <path class="kt" fill="#3f9a4e" d="M262 140 l20 6 l-20 7z"/>
  <!-- the bull resting, garlanded -->
  <ellipse cx="128" cy="406" rx="80" ry="10" fill="#1c1915" opacity=".14"/>
  <ellipse class="k" cx="120" cy="384" rx="62" ry="26" fill="#5a4637"/>
  <path d="M58 390 q62 28 124 0 q-10 22 -62 22 q-52 0 -62 -22z" fill="#3e3128"/>
  <path class="kf" stroke="#d8c6b0" d="M84 374 q12 -6 24 0 M110 368 q12 -6 24 0 M96 386 q10 -4 18 0"/>
  <path class="k" fill="#5a4637" d="M64 398 q-8 14 4 18 h26 q4 -8 -6 -12z M150 400 q-2 14 10 14 h24 q4 -8 -8 -12z"/>
  <path class="kn" stroke-width="1.8" d="M58 384 q-14 -2 -16 -16"/><path class="kt" fill="#3e3128" d="M42 368 l-3 -6 l6 2z"/>
  <path class="k" fill="#5a4637" d="M164 336 q24 -8 42 6 q4 24 -10 34 q-18 6 -30 -8z"/>
  <path d="M198 342 q8 12 -2 30 q-4 2 -8 3 q10 -14 10 -33z" fill="#3e3128"/>
  <ellipse class="k" cx="198" cy="366" rx="11" ry="8" fill="#8a7160"/>
  <circle cx="194" cy="366" r="1.3" fill="${INK}"/><circle cx="202" cy="366" r="1.3" fill="${INK}"/>
  <path class="k" fill="#f6efdc" d="M170 336 q-12 -14 -2 -26 q2 12 10 18z M200 336 q12 -14 4 -26 q-4 12 -12 18z"/>
  <path class="kn" d="M178 350 q3 2 6 0"/>
  <path class="kn" stroke="#3f9a4e" stroke-width="3" d="M158 346 q22 -18 52 4"/>
  ${[160,170,180,190,200,208].map((x,i)=>`<circle cx="${x}" cy="${R(344-Math.sin(i/5*Math.PI)*8)}" r="3.3" fill="${['#f2c230','#f8f4e8','#d23b2a'][i%3]}" stroke="${INK}" stroke-width=".6"/>`).join('')}
  ${flowers([[34,330,'#d23b2a'],[48,414,'#f8f4e8'],[240,300,'#f2c230'],[262,404,'#d23b2a'],[226,420,'#f8f4e8']])}
  ${tufts([[40,350],[230,330],[262,280],[214,390]])}`;
}

/* XXI THE WORLD : well spread */
function worldScene(){
  const leaves=Array.from({length:40},(_,i)=>{const a=i*9*Math.PI/180;const x=150+82*Math.cos(a),y=228+118*Math.sin(a);return `<ellipse cx="${R(x)}" cy="${R(y)}" rx="10" ry="4.2" transform="rotate(${R(i*9+90+28)} ${R(x)} ${R(y)})" fill="${i%2?'#5f8f41':'#4a7533'}" stroke="${INK}" stroke-width=".8"/>`}).join('');
  const berries=Array.from({length:10},(_,i)=>{const a=(i*36+18)*Math.PI/180;return `<circle cx="${R(150+90*Math.cos(a))}" cy="${R(228+126*Math.sin(a))}" r="2.4" fill="#d23b2a" stroke="${INK}" stroke-width=".5"/>`}).join('');
  const corner=(x,y,icon,label)=>`${cloud(x-34,y+20,68)}<g transform="translate(${x} ${y})">${icon}</g><text x="${x}" y="${y+30}" text-anchor="middle" class="ttl" font-size="7" letter-spacing="1">${label}</text>`;
  const sector=Array.from({length:6},(_,i)=>`<path d="M150 228 L${R(150+40*Math.cos(i*Math.PI/3))} ${R(228+40*Math.sin(i*Math.PI/3))} A40 40 0 0 1 ${R(150+40*Math.cos((i+1)*Math.PI/3))} ${R(228+40*Math.sin((i+1)*Math.PI/3))}Z" fill="${['#3f7fb8','#5f9a4a','#e6c25a','#d8442c','#8a6cc8','#ec8a3a'][i]}" opacity=".0"/>`).join('');
  return `<rect x="20" y="20" width="260" height="414" fill="#7fb2d4"/><rect x="20" y="20" width="260" height="414" fill="url(#stipW)"/>
  ${Array.from({length:12},(_,i)=>`<polygon fill="#fbf8ef" opacity=".85" points="${star8(30+((i*61)%240),40+((i*97)%380),2.6,1)}"/>`).join('')}
  <ellipse cx="150" cy="228" rx="100" ry="138" fill="url(#glowY)" opacity=".6"/>
  ${leaves}${berries}
  <g><path class="k" fill="#d23b2a" d="M136 102 q14 6 28 0 l-4 10 l6 8 q-16 -4 -26 0 l6 -8z"/><path class="k" fill="#d23b2a" d="M136 354 q14 -6 28 0 l-4 -10 l6 -8 q-16 4 -26 0 l6 8z"/></g>
  <!-- globe -->
  <circle class="k" cx="150" cy="228" r="60" fill="#4f8fc6" stroke-width="2"/>
  <path class="kt" fill="#86b35a" d="M114 190 q16 -12 32 0 q8 14 -6 24 q-4 16 -18 12 q-14 -14 -8 -36z M162 196 q18 -8 28 8 q6 20 -10 32 q-12 2 -14 -14 q-10 -14 -4 -26z M126 248 q16 -2 20 14 q-2 16 -16 20 q-12 -12 -4 -34z M176 254 q10 -2 12 8 q-2 10 -10 12 q-8 -8 -2 -20z"/>
  <path class="kf" d="M120 200 q6 -4 12 0 M168 210 q6 -4 10 2"/>
  <ellipse cx="150" cy="228" rx="60" ry="20" fill="none" stroke="${INK}" stroke-width=".7" opacity=".55"/><ellipse cx="150" cy="228" rx="60" ry="42" fill="none" stroke="${INK}" stroke-width=".5" opacity=".4"/>
  <ellipse cx="150" cy="228" rx="24" ry="60" fill="none" stroke="${INK}" stroke-width=".7" opacity=".55"/><ellipse cx="150" cy="228" rx="46" ry="60" fill="none" stroke="${INK}" stroke-width=".5" opacity=".4"/>
  <path d="M180 176 a60 60 0 0 1 0 104 q24 -52 0 -104z" fill="#1c1915" opacity=".2"/>
  <path d="M112 196 q10 -18 30 -24" stroke="#fff" stroke-width="3" opacity=".5" fill="none" stroke-linecap="round"/>
  ${sector}
  <!-- six-sector ribbon -->
  <path class="k" fill="#f3e8cc" d="M98 300 h104 l-8 8 l8 8 h-104 l8 -8z"/>
  <text x="150" y="311" text-anchor="middle" class="ttl" font-size="8" letter-spacing="1.5">6 SECTORS</text>
  ${corner(58,62,`<rect class="kt" x="-10" y="-9" width="20" height="15" rx="2" fill="#2c3a4a"/><path stroke="${INK}" stroke-width="1.1" d="M-5 -9v-3M0 -9v-3M5 -9v-3M-5 6v3M0 6v3M5 6v3"/><text x="0" y="1.5" text-anchor="middle" class="mono" font-size="4.4" fill="#8ee08a">CPU</text>`,'TECH')}
  ${corner(242,62,`<path class="kt" fill="#d23b2a" d="M-3.5 -11h7v7h7v7h-7v7h-7v-7h-7v-7h7z"/>`,'HEALTH')}
  ${corner(58,384,`<path class="kt" fill="#151a16" d="M0 -12 q11 13 0 21 q-11 -8 0 -21z"/><path d="M-2 -2 q-2 4 1 6" stroke="#fff" stroke-width="1" opacity=".6" fill="none"/>`,'ENERGY')}
  ${corner(242,384,`<path class="kt" fill="url(#goldG)" d="M-12 -6 l12 -7 l12 7z"/><path class="kt" fill="#f3e8cc" d="M-10 -6h4v11h-4z M-2 -6h4v11h-4z M6 -6h4v11h-4z"/><path class="kt" fill="url(#goldG)" d="M-13 5h26v3h-26z"/>`,'BANKS')}`;
}

/* IX THE HERMIT : your picks trail the market */
function hermitScene(){
  return `<rect x="20" y="20" width="260" height="414" fill="#323b5c"/><rect x="20" y="20" width="260" height="414" fill="url(#stipW)"/>
  ${[[46,50],[240,64],[84,110],[262,140],[36,170],[214,30],[120,40]].map(([x,y])=>`<polygon fill="#fbf2c9" points="${star8(x,y,3.4,1.3)}"/>`).join('')}
  <path class="k" fill="#e8e2d0" d="M220 70 a20 20 0 1 0 14 34 a16 16 0 1 1 -14 -34z"/>
  <!-- distant range -->
  <path class="k" fill="#59648a" d="M20 300 L60 240 L94 270 L130 226 L170 276 L210 236 L280 290 V320 H20Z"/>
  <!-- the summit he stands on -->
  <path class="k" fill="#c9d0de" d="M20 434 V352 L90 300 L150 286 L220 300 L280 340 V434Z"/>
  <path d="M150 286 L220 300 L280 340 V434 H170 L180 360Z" fill="url(#xhatch)" opacity=".75"/>
  <path class="k" fill="#f8f4e8" d="M60 322 L90 300 L150 286 L220 300 L246 316 L220 314 L200 324 L170 310 L140 322 L110 312 L84 326Z"/>
  <path class="kn" d="M60 380 l20 -10 l10 12 M200 370 l16 -6 l12 10 M110 410 l14 -8"/>
  <!-- staff -->
  <line x1="196" y1="146" x2="182" y2="400" stroke="${INK}" stroke-width="6.5" stroke-linecap="round"/><line x1="196" y1="146" x2="182" y2="400" stroke="#c99d60" stroke-width="3.4" stroke-linecap="round"/>
  <!-- cloak -->
  <path class="k" fill="#8a8f9e" d="M132 176 q-26 14 -34 80 q-8 70 -18 138 q50 10 104 0 q-6 -60 -14 -120 q-6 -60 -38 -98z"/>
  <path d="M150 190 q24 50 30 130 q2 40 4 74 q-14 4 -30 4 q6 -70 -4 -208z" fill="#6b7080"/>
  <path class="kf" d="M120 230 q-6 60 -14 160 M140 228 q0 80 -2 168 M164 240 q6 70 8 154"/>
  <path class="kt" fill="#7a7f8e" d="M80 392 q50 10 104 0 v6 q-52 10 -104 0z"/>
  <!-- hood + face -->
  <path class="k" fill="#8a8f9e" d="M110 182 q2 -36 30 -40 q24 2 26 34 q-4 12 -12 18 q-18 6 -44 -12z"/>
  <path d="M142 142 q24 2 26 34 q-4 12 -12 18 q8 -30 -14 -52z" fill="#6b7080"/>
  <path class="k" fill="#f0cfa6" d="M134 168 q2 -16 14 -16 q10 2 10 16 q-2 12 -12 14 q-10 -2 -12 -14z"/>
  <path class="k" fill="#f8f4e8" d="M134 172 q4 10 12 12 q8 -2 12 -12 q2 22 -12 34 q-14 -12 -12 -34z"/>
  <path class="kf" d="M140 186 q4 8 6 18 M152 186 q-2 8 -6 18"/>
  <path class="kn" d="M139 164 q3 -2 6 0 M151 164 q3 -2 6 0"/>
  <!-- arm + lantern -->
  <path class="k" fill="#8a8f9e" d="M160 198 q26 4 34 24 l-10 6 q-8 -14 -26 -16z"/>
  <circle class="k" cx="190" cy="224" r="6" fill="#f0cfa6"/>
  <path class="kn" stroke-width="1.6" d="M190 230 v10"/>
  <circle cx="190" cy="268" r="58" fill="url(#glowY)"/>
  <path class="k" fill="#6b5a3e" d="M178 244 h24 l-3 -6 h-18z"/>
  <rect class="k" x="174" y="248" width="32" height="44" fill="#f6e7a8"/>
  <rect x="174" y="248" width="32" height="44" fill="url(#glowY)"/>
  <path class="kn" d="M184 248 v44 M196 248 v44"/>
  <polygon class="kt" fill="#f6cf2c" points="${star8(190,270,11,4.5)}"/>
  <path class="k" fill="#6b5a3e" d="M172 292 h36 v6 h-36z"/>
  <!-- trailing chart in the valley mist -->
  <path class="k" fill="#f3e8cc" d="M30 404 h70 l-6 7 l6 7 h-70 l6 -7z"/>
  <text x="65" y="414" text-anchor="middle" class="mono" font-size="6.4" fill="#b22a1c">YOU −5.1%</text>
  <path class="k" fill="#f3e8cc" d="M206 404 h70 l-6 7 l6 7 h-70 l6 -7z"/>
  <text x="241" y="414" text-anchor="middle" class="mono" font-size="6.4" fill="#2f8a45">MARKET +0.4%</text>`;
}

/* I THE MAGICIAN : your picks beat the market */
function magicianScene(){
  const rose=(x,y)=>`<circle class="kt" cx="${x}" cy="${y}" r="9" fill="#d23b2a"/><path class="kf" stroke="#7a1a10" d="M${x-5} ${y} q5 -6 10 0 q-5 6 -10 0 M${x-2} ${y-2} q2 -2 4 0"/><path class="kt" fill="#5f8f41" d="M${x+7} ${y+5} q8 2 10 -4 q-6 -2 -10 4z"/>`;
  return `<rect x="20" y="20" width="260" height="414" fill="url(#skyC)"/><rect x="20" y="20" width="260" height="414" fill="url(#stip)"/>
  ${Array.from({length:18},(_,i)=>{const a=(i*20)*Math.PI/180;return `<line x1="${R(150+40*Math.cos(a))}" y1="${R(170+40*Math.sin(a))}" x2="${R(150+160*Math.cos(a))}" y2="${R(170+160*Math.sin(a))}" stroke="#fff6c8" stroke-width="6" opacity=".3"/>`}).join('')}
  <path class="kn" stroke="#4a7533" stroke-width="2" d="M20 40 q30 10 60 0 t60 0 t60 0 t80 0"/>
  ${[30,60,94,128,162,196,230,264].map((x,i)=>rose(x,38+(i%2)*6)).join('')}
  <!-- infinity over the wand -->
  <circle cx="150" cy="92" r="30" fill="url(#glowY)"/>
  <path d="M150 92 c-18 -24 -50 0 -30 16 c13 10 28 -6 30 -16 c2 10 17 26 30 16 c20 -16 -12 -40 -30 -16z" fill="none" stroke="${INK}" stroke-width="7.5"/>
  <path d="M150 92 c-18 -24 -50 0 -30 16 c13 10 28 -6 30 -16 c2 10 17 26 30 16 c20 -16 -12 -40 -30 -16z" fill="none" stroke="url(#goldG)" stroke-width="4"/>
  <!-- the wand, rising -->
  <g transform="rotate(14 150 220)">
    <rect class="k" x="145" y="126" width="10" height="120" rx="5" fill="#fbf8ef"/>
    <rect x="151" y="128" width="3" height="116" fill="#d8cfb6"/>
    <rect class="kt" x="143" y="128" width="14" height="10" rx="3" fill="url(#goldG)"/><rect class="kt" x="143" y="234" width="14" height="10" rx="3" fill="url(#goldG)"/>
  </g>
  ${sparkle(118,140,8)}${sparkle(186,150,6)}${sparkle(126,196,5)}${sparkle(196,110,5)}${sparkle(104,104,4)}
  <!-- your line beating the market line -->
  <path d="M40 270 l30 -6 l24 4 l30 -12 l24 4 l30 -10 l30 -4 l40 -2" fill="none" stroke="#a59d89" stroke-width="3" stroke-dasharray="5 4" stroke-linecap="round"/>
  <path d="M40 272 l30 -12 l20 6 l30 -24 l22 6 l30 -28 l50 -20" fill="none" stroke="${INK}" stroke-width="8" stroke-linejoin="round" stroke-linecap="round"/>
  <path d="M40 272 l30 -12 l20 6 l30 -24 l22 6 l30 -28 l50 -20" fill="none" stroke="#3f9a4e" stroke-width="4.6" stroke-linejoin="round" stroke-linecap="round"/>
  <path class="k" fill="#3f9a4e" d="M230 186 l-16 -2 l8 14z"/>
  <!-- the table -->
  <path class="k" fill="#d23b2a" d="M22 300 H278 V322 H22Z"/>
  <path d="M22 316 H278 V322 H22Z" fill="#9e2418"/>
  ${Array.from({length:17},(_,i)=>`<path class="kt" fill="#e6c25a" d="M${28+i*15} 322 l-2 7 h4z"/>`).join('')}
  <path class="k" fill="#a8562f" d="M32 322 H268 V420 H32Z"/>
  <rect x="32" y="322" width="236" height="98" fill="url(#hatch)"/>
  <path class="kf" d="M48 322 v98 M252 322 v98 M32 344 H268 M90 360 q20 -4 40 0 M170 380 q20 -4 40 0"/>
  <!-- tools on the table -->
  <ellipse class="k" cx="62" cy="296" rx="20" ry="8" fill="url(#goldG)"/><ellipse cx="62" cy="294" rx="13" ry="4.5" fill="none" stroke="#9a6b10" stroke-width=".8"/><text x="62" y="297.5" text-anchor="middle" class="ttl" font-size="8" fill="#7a5410">$</text>
  <path class="k" fill="url(#goldG)" d="M104 266 h28 q0 20 -14 25 q-14 -5 -14 -25z"/><path d="M122 266 h10 q0 20 -14 25 q8 -8 4 -25z" fill="#c98f1d" opacity=".6"/><rect class="k" x="115" y="291" width="6" height="7" fill="#e2a923"/><path class="k" fill="url(#goldG)" d="M108 302 h20 l-4 -4 h-12z"/>
  <path class="k" fill="#fbf6e6" d="M156 278 h46 v20 h-46z"/><path class="kt" fill="#e6dcc0" d="M152 276 q4 -4 8 0 v24 q-4 -4 -8 0z M198 276 q4 -4 8 0 v24 q-4 -4 -8 0z"/><path class="kn" stroke="#2f8a45" stroke-width="1.4" d="M162 294 l8 -6 l6 3 l8 -8 l10 -3"/>
  <path class="k" fill="#fbf8ef" d="M226 300 l30 -30 q6 -2 4 4 l-30 30z"/><path class="kf" d="M232 294 l20 -20 M236 296 l18 -18"/><path class="kt" fill="${INK}" d="M226 300 l-3 4 l5 -1z"/>
  <!-- lilies -->
  ${[[52,420],[96,424],[204,424],[248,420]].map(([x,y])=>`<path class="kn" stroke="#2f4a22" d="M${x} ${y} v-14"/><path class="kt" fill="#fbf8ef" d="M${x} ${y-14} q-10 -4 -8 -14 q6 4 8 10 q2 -6 8 -10 q2 10 -8 14z"/>`).join('')}`;
}

/* XI JUSTICE : rebalance */
function justiceScene(){
  const pillar=(x)=>`<rect class="k" x="${x}" y="70" width="36" height="266" fill="#c9c2b1"/>
    <rect x="${x+24}" y="70" width="12" height="266" fill="url(#xhatch)"/>
    ${[6,13,20,27].map(d=>`<line x1="${x+d+2}" y1="74" x2="${x+d+2}" y2="332" stroke="${INK}" stroke-width=".6" opacity=".5"/>`).join('')}
    <path class="k" fill="#d6cfbd" d="M${x-6} 70 h48 v-8 q-24 -12 -48 0z"/><rect class="k" x="${x-4}" y="56" width="44" height="6" fill="#bfb7a2"/>
    <rect class="k" x="${x-6}" y="336" width="48" height="8" fill="#bfb7a2"/>`;
  const tiles=[];for(let r=0;r<4;r++)for(let c=0;c<10;c++){const y0=344+r*22,y1=y0+22;const w0=26+r*4,x0=150+(c-5)*w0,x1=x0+w0,w1=26+(r+1)*4,xa=150+(c-5)*w1,xb=xa+w1;tiles.push(`<path d="M${x0} ${y0} L${x1} ${y0} L${xb} ${y1} L${xa} ${y1}Z" fill="${(r+c)%2?'#e8e1cf':'#8a7f6a'}" stroke="${INK}" stroke-width=".6"/>`)}
  return `<rect x="20" y="20" width="260" height="414" fill="#a8362a"/>
  ${Array.from({length:13},(_,i)=>`<path d="M${20+i*20} 20 q6 160 0 324" stroke="#7e2418" stroke-width="7" fill="none" opacity=".7"/><path d="M${28+i*20} 20 q6 160 0 324" stroke="#c8523e" stroke-width="2" fill="none" opacity=".6"/>`).join('')}
  <path class="k" fill="#e6c25a" d="M20 20 H280 V40 q-20 12 -40 0 q-20 12 -40 0 q-20 12 -40 0 q-20 12 -40 0 q-20 12 -40 0 q-20 12 -40 0 q-10 6 -20 0z"/>
  ${Array.from({length:13},(_,i)=>`<path class="kt" fill="#e6c25a" d="M${30+i*20} 44 l-2 8 h4z"/>`).join('')}
  ${pillar(28)}${pillar(236)}
  <g>${tiles.join('')}</g>
  <path d="M20 344 H280" stroke="${INK}" stroke-width="1.6"/>
  <!-- the scales -->
  <ellipse cx="150" cy="342" rx="40" ry="6" fill="#1c1915" opacity=".2"/>
  <path class="k" fill="url(#goldG)" d="M116 340 h68 l-10 -16 h-48z"/>
  <rect class="k" x="145" y="112" width="10" height="214" fill="url(#goldG)"/>
  <rect x="151" y="114" width="4" height="210" fill="#c98f1d" opacity=".7"/>
  ${[150,200,250,300].map(y=>`<rect class="kt" x="142" y="${y}" width="16" height="5" rx="2" fill="#e2a923"/>`).join('')}
  <circle class="k" cx="150" cy="106" r="11" fill="url(#goldG)"/>
  <polygon class="kt" fill="#d23b2a" points="${star8(150,106,6,2.6)}"/>
  <g transform="rotate(-12 150 136)">
    <rect class="k" x="64" y="132" width="172" height="8" rx="3" fill="url(#goldG)"/>
    <circle class="kt" cx="68" cy="136" r="5" fill="url(#goldG)"/><circle class="kt" cx="232" cy="136" r="5" fill="url(#goldG)"/>
  </g>
  <!-- heavy pan (tech) hangs low on the left -->
  <path class="kn" stroke-width="1.3" d="M70 154 L50 228 M70 154 L92 228"/>
  <path class="k" fill="url(#goldG)" d="M42 228 h58 q-4 18 -29 18 q-25 0 -29 -18z"/>
  <rect class="k" x="56" y="208" width="30" height="20" rx="2" fill="#2c3a4a"/>${[0,1,2,3].map(i=>`<path stroke="${INK}" stroke-width="1" d="M${61+i*7} 208 v-4 M${61+i*7} 228 v0"/>`).join('')}
  <text x="71" y="221" text-anchor="middle" class="mono" font-size="6.5" fill="#8ee08a">TECH</text>
  <!-- light pan (everything else) rides high on the right -->
  <path class="kn" stroke-width="1.3" d="M230 118 L210 172 M230 118 L252 172"/>
  <path class="k" fill="url(#goldG)" d="M202 172 h58 q-4 18 -29 18 q-25 0 -29 -18z"/>
  ${[[212,162],[224,162],[236,162],[248,162],[218,152],[230,152],[242,152]].map(([x,y],i)=>`<rect class="kt" x="${x-5}" y="${y}" width="10" height="10" fill="${['#3f9a4e','#e6c25a','#3f7fb8','#d8cfb6','#a8562f','#8a6cc8','#ec8a3a'][i]}"/>`).join('')}
  <!-- plaque -->
  <path class="k" fill="#f3e8cc" d="M96 398 h108 l-8 10 l8 10 h-108 l8 -10z"/>
  <text x="150" y="412" text-anchor="middle" class="ttl" font-size="10" letter-spacing="3">REBALANCE</text>`;
}

/* 0 THE FOOL : calm, start small */
function foolScene(){
  return `<rect x="20" y="20" width="260" height="414" fill="url(#skyC)"/><rect x="20" y="20" width="260" height="414" fill="url(#stip)"/>
  <circle cx="232" cy="72" r="46" fill="url(#glowY)"/>
  ${Array.from({length:16},(_,i)=>{const a=i*22.5*Math.PI/180;return `<line x1="${R(232+26*Math.cos(a))}" y1="${R(72+26*Math.sin(a))}" x2="${R(232+(i%2?32:38)*Math.cos(a))}" y2="${R(72+(i%2?32:38)*Math.sin(a))}" stroke="${INK}" stroke-width="1.4"/>`}).join('')}
  <circle class="k" cx="232" cy="72" r="22" fill="#fbf8ef"/>
  ${cloud(30,120,70)}${cloud(150,150,54)}
  <path class="kn" d="M70 170 q4 -4 8 0 q4 -4 8 0 M110 190 q3 -3 6 0 q3 -3 6 0" stroke-width="1.3"/>
  <!-- snowy peaks -->
  <path class="k" fill="#9aa9c4" d="M20 300 L54 228 L78 252 L112 200 L160 300Z"/>
  <path d="M112 200 L160 300 L130 300 L104 246Z" fill="#7c8bab"/>
  <path class="k" fill="#f8f4e8" d="M54 228 L62 240 L68 236 L78 252 L86 240 L112 200 L102 226 L92 244 L80 258 L70 248 L60 254 L48 242Z" stroke-width="1"/>
  <!-- cliff with a sunny meadow on top -->
  <path class="k" fill="#a8956f" d="M20 296 H200 L236 322 L226 380 L242 434 H20Z"/>
  <path d="M150 296 H200 L236 322 L226 380 L242 434 H170 Z" fill="url(#xhatch)" opacity=".6"/>
  <path class="kn" d="M200 296 l-8 30 l14 30 l-10 40 M140 340 l10 30 M60 380 l20 20"/>
  <path class="k" fill="#86ad5c" d="M20 296 H200 q-6 8 -20 8 q-80 -2 -160 10z"/>
  <rect x="20" y="296" width="180" height="20" fill="url(#stip)"/>
  <!-- footpath -->
  ${[[40,330],[62,322],[86,318],[112,314]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="5" ry="2.4" fill="#7c6a48" opacity=".6"/>`).join('')}
  <!-- bindle leaning on a stone -->
  <path class="k" fill="#bdb7aa" d="M118 300 q4 -12 18 -12 q14 0 16 12z"/>
  <line x1="88" y1="304" x2="170" y2="214" stroke="${INK}" stroke-width="5.6" stroke-linecap="round"/><line x1="88" y1="304" x2="170" y2="214" stroke="#8a5a33" stroke-width="2.8" stroke-linecap="round"/>
  <path class="k" fill="#d23b2a" d="M156 218 q16 -12 26 2 q6 18 -12 22 q-18 0 -14 -24z"/>
  <path class="kt" fill="#a82a1e" d="M164 214 q4 -6 10 -2 q-4 4 -10 2z"/>
  ${[[164,226],[172,222],[168,234],[176,232]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="1.4" fill="#f3e8cc"/>`).join('')}
  <!-- white rose -->
  <path class="kn" stroke="#2f4a22" stroke-width="1.6" d="M58 300 v-22"/><path class="kt" fill="#5f8f41" d="M58 290 q-8 -2 -10 -8 q8 0 10 6z"/>
  <circle class="kt" cx="58" cy="274" r="7" fill="#fbf8ef"/><path class="kf" d="M54 274 q4 -5 8 0 q-4 5 -8 0"/>
  <!-- seedling + coin: start small -->
  <ellipse class="k" cx="112" cy="372" rx="22" ry="7" fill="#6b4a2e"/>
  <path class="kn" stroke="#2f4a22" stroke-width="2.4" d="M112 372 v-30"/>
  <path class="kt" fill="#5f8f41" d="M112 356 q-18 -2 -18 -14 q14 0 18 12z"/><path class="kt" fill="#6fa64e" d="M112 350 q16 -6 20 -18 q-14 0 -20 14z"/>
  <ellipse class="k" cx="136" cy="376" rx="7" ry="4.5" fill="url(#goldG)"/><ellipse class="k" cx="92" cy="378" rx="6" ry="4" fill="url(#goldG)"/>
  <path class="k" fill="#f3e8cc" d="M60 404 h104 l-8 8 l8 8 h-104 l8 -8z"/>
  <text x="112" y="415" text-anchor="middle" class="ttl" font-size="8" letter-spacing="1.4">START SMALL</text>
  <!-- the little dog, leaping -->
  <g transform="translate(172 282) rotate(-8) scale(.9)">
    <ellipse class="k" cx="0" cy="0" rx="20" ry="10" fill="#f8f4e8"/>
    <path d="M-18 4 q18 10 36 0 q-4 8 -18 8 q-14 0 -18 -8z" fill="#ddd5c4"/>
    <path class="k" fill="#f8f4e8" d="M-16 4 l-12 10 l4 3 l12 -8z M14 4 l14 8 l2 -4 l-12 -8z"/>
    <circle class="k" cx="22" cy="-8" r="9" fill="#f8f4e8"/>
    <path class="k" fill="#d8cfb6" d="M18 -16 q-6 -10 2 -12 q4 6 2 12z"/>
    <circle cx="25" cy="-9" r="1.4" fill="${INK}"/><circle cx="31" cy="-6" r="1.6" fill="${INK}"/>
    <path class="kn" d="M27 -3 q2 2 4 0"/>
    <path class="kn" stroke-width="1.6" d="M-20 -2 q-10 -8 -6 -16"/>
  </g>`;
}

const DECK=[
  {pos:'I · THE PAST',cards:[
    {num:'XVI',title:'THE TOWER',scene:towerScene,when:'the market fell more than 5% last month'},
    {num:'XIX',title:'THE SUN',scene:sunScene,when:'the market rose more than 5% last month'},
    {num:'XIV',title:'TEMPERANCE',scene:temperanceScene,when:'a quiet month, moves under 2%'}]},
  {pos:'II · RIGHT NOW',cards:[
    {num:'X',title:'WHEEL of FORTUNE',scene:wheelScene,when:'today runs against last month (turning)'},
    {num:'XVIII',title:'THE MOON',scene:moonScene,when:'the fear gauge (VIX) is above 25'},
    {num:'VIII',title:'STRENGTH',scene:strengthScene,when:'a steady climb with low fear'}]},
  {pos:'III · YOUR STOCKS',cards:[
    {num:'VII',title:'THE CHARIOT',scene:chariotScene,when:'over half your picks sit in one sector'},
    {num:'XXI',title:'THE WORLD',scene:worldScene,when:'your picks are spread over 5+ sectors'},
    {num:'IX',title:'THE HERMIT',scene:hermitScene,when:'your picks trail the market by 5%+'},
    {num:'I',title:'THE MAGICIAN',scene:magicianScene,when:'your picks beat the market by 5%+'}]},
  {pos:'IV · WHAT TO DO',cards:[
    {num:'XVII',title:'THE STAR',scene:starScene,when:'a storm, with past recoveries on your side'},
    {num:'XI',title:'JUSTICE',scene:justiceScene,when:'one sector has grown too heavy: rebalance'},
    {num:'0',title:'THE FOOL',scene:foolScene,when:'calm markets: a good time to start small'}]}
];

const SCENES={tower:towerScene,sun:sunScene,temperance:temperanceScene,wheel:wheelScene,moon:moonScene,strength:strengthScene,
  chariot:chariotScene,world:worldScene,hermit:hermitScene,magician:magicianScene,star:starScene,justice:justiceScene,fool:foolScene};
const ID={'THE TOWER':'tower','THE SUN':'sun','TEMPERANCE':'temperance','WHEEL of FORTUNE':'wheel','THE MOON':'moon','STRENGTH':'strength',
  'THE CHARIOT':'chariot','THE WORLD':'world','THE HERMIT':'hermit','THE MAGICIAN':'magician','THE STAR':'star','JUSTICE':'justice','THE FOOL':'fool'};
DECK.forEach(g=>g.cards.forEach(c=>c.id=ID[c.title]));
const byId=id=>DECK.flatMap(g=>g.cards).find(c=>c.id===id);
window.TAROT={DECK,byId,back:backSVG,frame,card(id){inject();const c=byId(id);return frame(c.num,c.title,c.scene())}};
})();
