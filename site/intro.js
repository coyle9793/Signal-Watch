// Weather intro: a short animated scene that matches today's market weather, where the weather itself
// writes the headline. Hurricane, thunderstorm, rain, breezy dog walk, sunny beach and solar eclipse.
// Pick any scene from the bar, skip any time, sound is off until you turn it on, and Calm mode turns it all off.
// Try one directly with ?intro=rain | thunder | hurricane | windy | sunny | eclipse
(() => {
  const ORDER = ["hurricane", "thunder", "windy", "sunny", "eclipse"]; // the Rain scene was retired: light rain now shows the Breezy story
  const META = {
    hurricane: ["🌀", "Hurricane", "Very bad day"], thunder: ["⛈️", "Thunderstorm", "Bad day"], rain: ["🌧️", "Rain", "Down day"],
    windy: ["🍃", "Breezy", "Mixed day"], sunny: ["🏖️", "Sunny", "Good day"], eclipse: ["🌑", "Eclipse", "Superb day"],
  };
  const LS = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const SS = { get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const forced = ((f) => (f === "rain" ? "windy" : f))(new URLSearchParams(location.search).get("intro"));
  const calm = () => LS.get("wx-calm") === "1";
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const easeIO = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const lerp = (a, b, k) => a + (b - a) * k;

  function pick(spy, breadth) {
    spy = spy ?? 0; breadth = breadth ?? 0.5;
    const score = spy * 100 + (breadth - 0.5) * 2;
    if (spy <= -0.02) return "hurricane";
    if (spy <= -0.01 || score <= -1.6) return "thunder";
    if (score < 0.5) return "windy";
    if (spy >= 0.012 && breadth >= 0.7) return "eclipse";
    return "sunny";
  }

  // ------------------------------------------------------------------ sound (made in the browser, no files)
  const A = { ctx: null, on: false, nodes: [] };
  function audioOn() {
    if (!A.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
      A.ctx = new AC(); A.master = A.ctx.createGain(); A.master.gain.value = 0.7; A.master.connect(A.ctx.destination);
      const n = A.ctx.sampleRate * 3, b = A.ctx.createBuffer(1, n, A.ctx.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      A.noise = b;
    }
    A.ctx.resume?.(); return true;
  }
  function stopSound() { A.nodes.forEach((n) => { try { n.stop(); } catch (e) {} }); A.nodes = []; }
  const now = () => A.ctx.currentTime;
  // filtered noise: returns the gain node so callers can shape its volume over time
  function noise(type, freq, q, at = 0, dur = 30) {
    const s = A.ctx.createBufferSource(); s.buffer = A.noise; s.loop = true;
    const f = A.ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = A.ctx.createGain(); g.gain.value = 0;
    s.connect(f); f.connect(g); g.connect(A.master); s.start(now() + Math.max(0, at)); s.stop(now() + Math.max(0, at) + dur);
    A.nodes.push(s); return { g: g.gain, f: f.frequency };
  }
  function env(p, pts) { const t0 = now(); p.setValueAtTime(p.value, t0); pts.forEach(([t, v]) => { if (t >= 0) p.linearRampToValueAtTime(v, t0 + t); }); }
  function rumble(at, dur, vol) { const n = noise("lowpass", 110, 0.8, at, dur + 0.5); env(n.g, [[at, 0], [at + dur * 0.25, vol], [at + dur, 0]]); }
  function crack(at, vol = 0.9) {
    const n = noise("highpass", 1200, 0.5, at, 0.6); env(n.g, [[at, 0], [at + 0.01, vol], [at + 0.35, 0]]);
    rumble(at + 0.05, 2.2, vol * 1.2);
  }
  function tone(freq, at, dur, vol) {
    const o = A.ctx.createOscillator(), g = A.ctx.createGain(); o.type = "sine"; o.frequency.value = freq; g.gain.value = 0;
    o.connect(g); g.connect(A.master); o.start(now() + Math.max(0, at)); o.stop(now() + Math.max(0, at) + dur + 0.1);
    env(g.gain, [[at, 0], [at + dur * 0.4, vol], [at + dur, 0]]); A.nodes.push(o);
  }

  // ------------------------------------------------------------------ the words the weather writes
  let W = 0, H = 0, dpr = 1, lines = [], info = { spy: 0, up: 0, n: 0 };
  function layout(cy) {
    let s1 = clamp(W * 0.12, 40, 118);
    const tmp = document.createElement("canvas").getContext("2d");
    tmp.font = `italic 900 ${s1}px 'Playfair Display', Georgia, serif`;
    const w1 = tmp.measureText("Whistle Street").width; if (w1 > W * 0.88) s1 *= (W * 0.88) / w1;
    const s2 = s1 * 0.36, sp = info.spy;
    const move = `${sp >= 0 ? "+" : "−"}${Math.abs(sp * 100).toFixed(2)}%`;
    lines = [
      { t: "Whistle Street", f: `italic 900 ${s1}px 'Playfair Display', Georgia, serif`, y: cy - s1 * 0.22, main: true },
      { t: `Market ${move} today`, f: `800 ${s2}px Inter, system-ui, sans-serif`, y: cy + s1 * 0.52 },
      { t: `${info.up} of ${info.n} stocks up`, f: `600 ${s2 * 0.8}px Inter, system-ui, sans-serif`, y: cy + s1 * 0.52 + s2 * 1.25 },
    ];
  }
  function targets(gap) {
    const max = W < 700 ? 1300 : 2300;
    const off = document.createElement("canvas"); off.width = W; off.height = H;
    const c = off.getContext("2d"); c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle";
    lines.forEach((l) => { c.font = l.f; c.fillText(l.t, W / 2, l.y); });
    const d = c.getImageData(0, 0, W, H).data;
    for (;;) {
      const out = [];
      for (let y = 0; y < H; y += gap) for (let x = (y / gap) % 2 ? gap / 2 : 0; x < W; x += gap) {
        if (d[((y | 0) * W + (x | 0)) * 4 + 3] > 120) out.push({ tx: x, ty: y, line: lines.findIndex((l) => Math.abs(l.y - y) < 80) });
      }
      if (out.length <= max) return out;
      gap += 1;
    }
  }
  function ink(c, a, style = {}) {
    if (a <= 0) return;
    c.save(); c.globalAlpha = a; c.textAlign = "center"; c.textBaseline = "middle";
    lines.forEach((l) => {
      c.font = l.f;
      if (style.dark) { c.fillStyle = l.main ? "#1d1147" : "#2b2350"; c.shadowColor = "rgba(255,255,255,.6)"; c.shadowBlur = 8; }
      else if (l.main) {
        const m = c.measureText(l.t).width, g = c.createLinearGradient(W / 2 - m / 2, 0, W / 2 + m / 2, 0);
        (style.gold ? ["#fff3c4", "#ffd36b", "#ff9d2e"] : ["#2ef2ff", "#6b5cff", "#b44dff"]).forEach((x, i) => g.addColorStop(i / 2, x));
        c.fillStyle = g; c.shadowColor = style.gold ? "rgba(255,170,60,.8)" : "rgba(107,92,255,.9)"; c.shadowBlur = 24;
      } else { c.fillStyle = style.gold ? "#fff1cf" : "#f1eeff"; c.shadowColor = "rgba(0,0,0,.6)"; c.shadowBlur = 10; }
      c.fillText(l.t, W / 2, l.y);
    });
    c.restore();
  }
  const bounds = (P) => { let a = Infinity, b = -Infinity; P.forEach((p) => { a = Math.min(a, p.tx); b = Math.max(b, p.tx); }); return [a, Math.max(1, b - a)]; };
  function sky(c, stops, y0 = 0, y1 = H) { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); c.fillStyle = g; c.fillRect(-W, y0, W * 3, y1 - y0); }
  function streaks(n) { return Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), l: rnd(10, 26), v: rnd(0.9, 1.6) })); }
  function drawStreaks(c, arr, t, color, slant = 0.18, speed = 1) {
    c.strokeStyle = color; c.lineWidth = 1.2; c.beginPath();
    arr.forEach((d) => {
      const y = ((d.y + t * d.v * speed) % 1) * (H + 60) - 30, x = ((d.x * W - y * slant) % W + W) % W;
      c.moveTo(x, y); c.lineTo(x + d.l * slant, y + d.l);
    });
    c.stroke();
  }

  // ------------------------------------------------------------------ scenes

  // rough outlines of the real continents (lon, lat in degrees), good enough for a spinning globe
  const EARTH = {
    land: [
      [-168,66,-162,70,-156,71,-140,70,-128,70,-115,68,-95,72,-82,73,-80,63,-94,59,-90,57,-82,55,-79,52,-76,58,-70,61,-64,60,-61,56,-56,52,-60,47,-66,45,-70,42,-74,40,-76,35,-81,31,-80,26,-82,27,-84,30,-89,30,-94,29,-97,26,-97,21,-95,18,-91,19,-87,21,-88,16,-84,15,-83,10,-79,9,-77,8,-80,7,-85,10,-87,13,-92,14,-96,16,-105,20,-109,24,-112,29,-115,30,-117,33,-121,35,-124,40,-124,46,-125,49,-130,54,-136,58,-145,60,-152,59,-158,57,-165,54,-158,58,-162,60,-166,62,-165,65],
      [-80,9,-77,8,-72,12,-64,10,-60,8,-52,5,-50,0,-44,-2,-35,-5,-35,-9,-39,-14,-40,-20,-44,-23,-48,-26,-49,-29,-53,-34,-58,-35,-57,-38,-62,-39,-65,-42,-65,-46,-68,-50,-69,-53,-68,-55,-72,-54,-75,-50,-74,-44,-73,-38,-72,-30,-70,-20,-71,-17,-76,-14,-80,-6,-81,-3,-80,0,-78,2,-77,4,-78,8],
      [-17,21,-16,15,-17,13,-14,10,-12,7,-8,4,-3,5,3,6,8,4,10,2,9,-1,12,-6,13,-12,12,-17,14,-23,16,-29,18,-34,20,-35,25,-34,28,-33,32,-28,33,-25,35,-22,35,-18,40,-15,40,-10,39,-5,41,-1,44,2,49,8,51,12,44,11,43,13,39,17,37,21,35,25,33,28,32,31,25,32,20,31,15,32,11,34,10,37,3,37,-2,35,-6,36,-10,31,-13,28],
      [44,-25,47,-25,50,-15,49,-12,44,-17],
      [-10,36,-9,43,-2,44,-1,47,-4,48,2,51,8,54,9,57,11,59,5,61,5,63,13,67,17,69,25,71,31,70,41,67,44,68,54,69,60,69,68,73,73,72,80,73,90,76,105,78,113,74,130,72,142,72,160,70,170,70,180,66,178,64,170,60,163,58,161,55,156,51,156,57,163,62,150,59,142,59,136,54,140,49,135,43,130,42,129,36,126,35,126,38,122,40,118,38,122,37,119,33,122,30,120,25,114,22,109,21,106,18,109,11,105,9,103,11,100,13,100,8,103,1,100,3,98,8,98,15,94,17,92,22,87,22,80,15,78,8,73,16,73,21,68,24,62,25,57,26,56,24,59,22,52,16,44,12,43,16,39,22,35,28,34,31,36,35,30,36,27,37,26,40,23,40,22,37,20,40,19,42,13,45,16,41,18,40,16,38,12,42,10,44,7,43,3,43,0,40,-1,37,-5,36],
      [-5,50,1,51,2,53,-1,55,-2,57,-3,59,-6,58,-5,55,-3,54,-4,52], [-10,52,-6,52,-6,55,-8,55,-10,54],
      [130,31,132,34,135,34,140,35,141,38,142,42,145,44,141,45,140,41,137,37,133,35,130,33],
      [114,-22,114,-26,115,-34,118,-35,123,-34,129,-32,135,-35,138,-35,140,-38,145,-39,150,-37,153,-32,153,-25,150,-22,146,-19,145,-15,142,-11,141,-16,136,-12,132,-11,129,-15,125,-14,122,-18],
      [172,-34,175,-37,178,-38,175,-41,171,-46,167,-46,171,-42,174,-39],
      [109,1,111,-3,116,-4,119,1,117,7,115,5], [95,5,98,4,104,-3,106,-6,102,-4,96,2], [105,-6,114,-7,114,-8.5,106,-7.5],
      [131,-1,138,-2,146,-6,150,-10,143,-9,138,-8,133,-4], [120,18,122,18,124,13,126,7,122,7,121,13], [-85,22,-80,23,-74,20,-78,20],
      [-73,78,-60,82,-30,83,-20,80,-20,72,-30,68,-40,65,-44,60,-50,62,-54,67,-58,75], [-24,64,-14,64,-14,66,-22,66],
    ],
    desert: [[-15,18,-5,30,10,32,30,30,33,22,30,15,15,15,0,16], [36,30,47,30,56,24,52,17,44,14,38,22], [118,-22,132,-18,142,-24,138,-31,125,-30,117,-27], [55,45,75,42,110,42,115,46,95,48,65,50], [-118,34,-105,30,-102,36,-112,40], [14,-20,22,-19,24,-26,17,-27], [-70,-20,-68,-28,-70,-32,-72,-25]],
    ice: [[-73,78,-60,82,-30,83,-20,80,-22,72,-30,68,-40,65,-44,61,-50,63,-54,68,-58,75]],
  };
  // sample each outline into small steps so it bends with the globe
  const toRad = (a) => a.map((v) => (v * Math.PI) / 180);
  function densify(f) { const r = toRad(f), out = []; for (let i = 0; i < r.length; i += 2) { const a = [r[i], r[i + 1]], j = (i + 2) % r.length, b = [r[j], r[j + 1]], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.05)); for (let k = 0; k < n; k++) out.push([lerp(a[0], b[0], k / n), lerp(a[1], b[1], k / n)]); } return out; }
  const EARTH_P = { land: EARTH.land.map(densify), desert: EARTH.desert.map(densify), ice: EARTH.ice.map(densify), ant: Array.from({ length: 73 }, (_, i) => [(i / 72) * Math.PI * 2 - Math.PI, -((68 + 4 * Math.sin(i * 0.9) + 3 * Math.sin(i * 0.37)) * Math.PI) / 180]) };
  const SC = {};

  // RAIN: every letter is built from falling drops that splash and stay
  SC.rain = {
    D: 6.6, cy: () => H * 0.47, gap: () => (W < 600 ? 4 : 5),
    init(S, P) {
      S.amb = streaks(W < 600 ? 110 : 200);
      const [x0, xr] = bounds(P);
      P.forEach((p) => { p.d = 0.3 + ((p.tx - x0) / xr) * 1.7 + rnd(0, 1.5); p.y0 = -rnd(10, H * 0.5); p.ft = rnd(0.5, 0.75); p.wx = rnd(10, 40); });
    },
    draw(c, t, S, P) {
      sky(c, ["#08142b", "#060b1a", "#03040a"]);
      const cg = c.createRadialGradient(W * 0.5, -H * 0.2, 10, W * 0.5, -H * 0.2, H * 0.8); cg.addColorStop(0, "rgba(90,110,160,.35)"); cg.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = cg; c.fillRect(0, 0, W, H);
      drawStreaks(c, S.amb, t, `rgba(150,195,255,${0.35 * (1 - clamp((t - 5) / 2))})`, 0.12, 1.2);
      const fall = new Path2D(), rings = new Path2D(), dots = new Path2D(), g = W < 600 ? 3.2 : 3.8;
      for (const p of P) {
        const k = (t - p.d) / p.ft; if (k < 0) continue;
        if (k < 1) { const y = p.y0 + (p.ty - p.y0) * k * k, x = p.tx + p.wx * (1 - k); fall.moveTo(x, y - 14); fall.lineTo(x, y); continue; }
        const age = t - p.d - p.ft;
        if (age < 0.35) { const r = 1 + age * 20; rings.moveTo(p.tx + r, p.ty); rings.ellipse(p.tx, p.ty, r, r * 0.45, 0, 0, 7); }
        dots.moveTo(p.tx + g / 2, p.ty); dots.arc(p.tx, p.ty, g / 2, 0, 7);
      }
      c.lineWidth = 1.4; c.strokeStyle = "rgba(190,225,255,.75)"; c.stroke(fall);
      c.lineWidth = 1; c.strokeStyle = "rgba(190,225,255,.45)"; c.stroke(rings);
      c.globalAlpha = S.k; c.fillStyle = "#bfe3ff"; c.shadowColor = "rgba(120,190,255,.9)"; c.shadowBlur = 6; c.fill(dots); c.shadowBlur = 0; c.globalAlpha = 1;
    },
    sound(t) { const n = noise("bandpass", 2600, 0.5, 0, 9); env(n.g, [[0, 0.02], [0.8, 0.22], [5.5, 0.18], [7.5, 0]]); const m = noise("lowpass", 500, 0.5, 0, 9); env(m.g, [[1, 0.12], [7.5, 0]]); },
  };

  // THUNDERSTORM: you hear it, then see flashes, then lightning strikes each part of the headline down
  SC.thunder = {
    D: 8.4, cy: () => H * 0.54, gap: () => (W < 600 ? 4 : 5),
    init(S, P) {
      S.amb = streaks(W < 600 ? 90 : 160);
      const cl = document.createElement("canvas"); cl.width = W; cl.height = H * 0.5; const x = cl.getContext("2d");
      for (let i = 0; i < 46; i++) {
        const cx = rnd(-0.1, 1.1) * W, cy = rnd(-0.05, 0.3) * H, r = rnd(60, 180) * (W < 600 ? 0.6 : 1);
        const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, "rgba(70,60,110,.55)"); g.addColorStop(1, "rgba(30,24,60,0)");
        x.fillStyle = g; x.fillRect(cx - r, cy - r, r * 2, r * 2);
      }
      S.cl = cl; S.fl = [[1.5, 0.35], [1.9, 0.18], [2.45, 0.5], [2.6, 0.25]];
      const nb = W < 600 ? 7 : 11, [x0, xr] = bounds(P);
      const order = [...Array(nb).keys()].sort(() => Math.random() - 0.5);
      S.g = Array.from({ length: nb }, (_, i) => ({ st: 3.0 + order[i] * (3.1 / nb) + rnd(-0.08, 0.08), pts: [] }));
      P.forEach((p) => { p.g = Math.min(nb - 1, Math.floor(((p.tx - x0) / xr) * nb)); S.g[p.g].pts.push(p); });
      S.g.forEach((g) => {
        if (!g.pts.length) return;
        g.cx = g.pts.reduce((s, p) => s + p.tx, 0) / g.pts.length; g.cy = g.pts.reduce((s, p) => s + p.ty, 0) / g.pts.length;
        g.bolt = bolt(g.cx + rnd(-120, 120), -10, g.cx, g.cy);
        g.sparks = Array.from({ length: 14 }, () => { const a = rnd(0, Math.PI * 2), v = rnd(80, 260); return { vx: Math.cos(a) * v, vy: Math.sin(a) * v - 60 }; });
      });
      S.flashes = [...S.fl, ...S.g.filter((g) => g.pts.length).map((g) => [g.st, 0.55])];
    },
    draw(c, t, S, P) {
      let fl = 0; S.flashes.forEach(([ft, s]) => { const k = (t - ft) / 0.2; if (k >= 0 && k < 1) fl = Math.max(fl, s * (1 - k) * (Math.random() > 0.25 ? 1 : 0.4)); });
      const shake = S.g.some((g) => t - g.st >= 0 && t - g.st < 0.18) ? 4 : 0;
      c.save(); if (shake) c.translate(rnd(-shake, shake), rnd(-shake, shake));
      sky(c, ["#0d0820", "#090614", "#040309"]);
      c.globalAlpha = 0.9 + 0.1 * Math.sin(t * 0.7); c.drawImage(S.cl, 0, 0); c.globalAlpha = 1;
      if (fl > 0) { c.globalCompositeOperation = "lighter"; c.globalAlpha = fl; c.drawImage(S.cl, 0, 0); c.drawImage(S.cl, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = "source-over"; }
      drawStreaks(c, S.amb, t, "rgba(170,160,230,.28)", 0.22, 1.5);
      S.g.forEach((g) => {
        if (!g.pts.length) return;
        const a = t - g.st;
        if (a >= 0 && a < 0.4 && Math.random() > 0.15) {
          const k = 1 - a / 0.4; c.lineJoin = "round";
          c.strokeStyle = `rgba(160,130,255,${0.35 * k})`; c.lineWidth = 9; c.stroke(g.bolt);
          c.strokeStyle = `rgba(255,255,255,${k})`; c.lineWidth = 2.2; c.stroke(g.bolt);
          const r = c.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, 90); r.addColorStop(0, `rgba(230,220,255,${0.6 * k})`); r.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = r; c.fillRect(g.cx - 90, g.cy - 90, 180, 180);
        }
        if (a >= 0 && a < 0.7) { c.strokeStyle = `rgba(255,230,140,${1 - a / 0.7})`; c.lineWidth = 1.5; c.beginPath(); g.sparks.forEach((s) => { const x = g.cx + s.vx * a, y = g.cy + s.vy * a + 300 * a * a; c.moveTo(x, y); c.lineTo(x - s.vx * 0.03, y - s.vy * 0.03); }); c.stroke(); }
      });
      if (fl > 0) { c.fillStyle = `rgba(210,200,255,${fl * 0.35})`; c.fillRect(0, 0, W, H); }
      const hot = new Path2D(), cool = new Path2D(), gs = W < 600 ? 3 : 3.6;
      for (const p of P) {
        const g = S.g[p.g], a = t - g.st; if (a < 0) continue;
        const k = ease(a / 0.45), x = lerp(g.cx, p.tx, k), y = lerp(g.cy, p.ty, k);
        (a < 0.6 ? hot : cool).rect(x - gs / 2, y - gs / 2, gs, gs);
      }
      c.globalAlpha = S.k; c.fillStyle = "#fff"; c.shadowColor = "#b9a6ff"; c.shadowBlur = 10; c.fill(hot);
      c.fillStyle = "#d9ccff"; c.shadowBlur = 5; c.fill(cool); c.shadowBlur = 0; c.globalAlpha = 1;
      c.restore();
    },
    sound(t, S) {
      const r = noise("bandpass", 1800, 0.4, 0, 10); env(r.g, [[0, 0.03], [2, 0.12], [8, 0.08], [9.5, 0]]);
      if (t < 0.5) rumble(0, 3.2, 0.9);
      S.fl.forEach(([ft]) => ft > t && rumble(ft - t + 0.3, 1.6, 0.35));
      S.g.forEach((g) => g.pts.length && g.st > t && crack(g.st - t, 0.6));
    },
  };
  function bolt(x0, y0, x1, y1) {
    let pts = [[x0, y0], [x1, y1]];
    for (let i = 0; i < 6; i++) {
      const n = [pts[0]];
      for (let j = 1; j < pts.length; j++) {
        const [ax, ay] = pts[j - 1], [bx, by] = pts[j], len = Math.hypot(bx - ax, by - ay), off = rnd(-0.22, 0.22) * len;
        n.push([(ax + bx) / 2 + off * ((by - ay) / len), (ay + by) / 2 - off * ((bx - ax) / len)], [bx, by]);
      }
      pts = n;
    }
    const p = new Path2D(); p.moveTo(...pts[0]); pts.forEach((q) => p.lineTo(...q));
    for (let b = 0; b < 3; b++) {
      const i = Math.floor(rnd(0.2, 0.7) * pts.length); let [x, y] = pts[i]; p.moveTo(x, y);
      const dir = rnd(-1, 1); for (let k = 0; k < 8; k++) { x += dir * rnd(4, 14) + rnd(-6, 6); y += rnd(6, 16); p.lineTo(x, y); }
    }
    return p;
  }

  // SUNNY: a wave washes up the beach and leaves the headline in wet sand, which then dries
  SC.sunny = {
    D: 9, cy: () => H * 0.63, gap: () => 6, final: { dark: true },
    init(S) {
      const b = document.createElement("canvas"); b.width = W; b.height = H; const x = b.getContext("2d");
      S.shore = H * 0.32;
      const sk = x.createLinearGradient(0, 0, 0, H * 0.2); sk.addColorStop(0, "#5cc4ff"); sk.addColorStop(1, "#cdeeff"); x.fillStyle = sk; x.fillRect(0, 0, W, H * 0.2);
      const sun = x.createRadialGradient(W * 0.8, H * 0.08, 0, W * 0.8, H * 0.08, H * 0.14); sun.addColorStop(0, "#fffbe0"); sun.addColorStop(0.25, "#ffe27a"); sun.addColorStop(1, "rgba(255,230,120,0)"); x.fillStyle = sun; x.fillRect(0, 0, W, H * 0.3);
      const se = x.createLinearGradient(0, H * 0.2, 0, S.shore); se.addColorStop(0, "#0f6fb0"); se.addColorStop(1, "#33b7d6"); x.fillStyle = se; x.fillRect(0, H * 0.2, W, S.shore - H * 0.2 + 1);
      x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = 1.2; for (let i = 0; i < 40; i++) { const y = rnd(H * 0.205, S.shore - 4), xx = rnd(0, W); x.beginPath(); x.moveTo(xx, y); x.lineTo(xx + rnd(10, 40), y); x.stroke(); }
      const sa = x.createLinearGradient(0, S.shore, 0, H); sa.addColorStop(0, "#efd29b"); sa.addColorStop(1, "#e2b874"); x.fillStyle = sa; x.fillRect(0, S.shore, W, H - S.shore);
      for (let i = 0; i < W * H * 0.006; i++) { x.fillStyle = Math.random() > 0.5 ? "rgba(140,100,50,.22)" : "rgba(255,250,235,.35)"; x.fillRect(rnd(0, W), rnd(S.shore, H), 1.3, 1.3); }
      // things on the sand, kept to the sides and the bottom so the words have room: shells, starfish, sandcastles
      const k = clamp(Math.min(W, H) / 700, 0.6, 1.3), spot = () => { const side = Math.random() < 0.5; return side ? [Math.random() < 0.5 ? rnd(0.02, 0.16) * W : rnd(0.84, 0.98) * W, rnd(0.42, 0.95) * H] : [rnd(0.05, 0.95) * W, rnd(0.9, 0.97) * H]; };
      for (let i = 0; i < 14; i++) { const [sx, sy] = spot(), r = rnd(4, 8) * k, a = rnd(-0.6, 0.6); x.save(); x.translate(sx, sy); x.rotate(a);
        if (i % 3 === 0) { x.fillStyle = "#fbe3d0"; x.beginPath(); x.moveTo(0, r * 0.4); for (let j = 0; j <= 8; j++) { const aa = Math.PI + (j / 8) * Math.PI; x.lineTo(Math.cos(aa) * r, Math.sin(aa) * r * 1.1); } x.closePath(); x.fill(); x.strokeStyle = "rgba(190,120,90,.6)"; x.lineWidth = 0.8; x.beginPath(); for (let j = 1; j < 8; j++) { const aa = Math.PI + (j / 8) * Math.PI; x.moveTo(0, r * 0.35); x.lineTo(Math.cos(aa) * r * 0.95, Math.sin(aa) * r); } x.stroke(); }
        else if (i % 3 === 1) { x.fillStyle = "#f2e2ff"; x.beginPath(); x.ellipse(0, 0, r, r * 0.6, 0, 0, 7); x.fill(); x.strokeStyle = "rgba(150,110,170,.7)"; x.lineWidth = 1; x.beginPath(); for (let aa = 0; aa < 12; aa += 0.3) x.lineTo(Math.cos(aa) * r * (1 - aa / 13), Math.sin(aa) * r * 0.6 * (1 - aa / 13)); x.stroke(); }
        else { x.fillStyle = "#fff1e0"; x.beginPath(); x.ellipse(0, 0, r * 0.9, r * 0.5, 0, 0, 7); x.fill(); x.fillStyle = "rgba(200,150,110,.5)"; x.fillRect(-r * 0.6, -0.5, r * 1.2, 1); }
        x.restore(); }
      for (let i = 0; i < 5; i++) { const [sx, sy] = spot(), r = rnd(9, 14) * k, rot = rnd(0, 1.2); x.fillStyle = ["#ff7a4a", "#ff5a7a", "#ffa040"][i % 3]; x.beginPath(); for (let j = 0; j < 10; j++) { const aa = rot + (j / 10) * Math.PI * 2, rr = j % 2 ? r * 0.42 : r; x.lineTo(sx + Math.cos(aa) * rr, sy + Math.sin(aa) * rr); } x.closePath(); x.fill(); x.fillStyle = "rgba(255,240,220,.7)"; for (let j = 0; j < 5; j++) { const aa = rot + (j / 5) * Math.PI * 2; x.beginPath(); x.arc(sx + Math.cos(aa) * r * 0.5, sy + Math.sin(aa) * r * 0.5, 1.1, 0, 7); x.fill(); } }
      const castle = (cx, gy, s) => { x.fillStyle = "rgba(120,80,30,.25)"; x.beginPath(); x.ellipse(cx + 6 * s, gy, 46 * s, 8 * s, 0, 0, 7); x.fill();
        const sd = x.createLinearGradient(cx - 40 * s, 0, cx + 40 * s, 0); sd.addColorStop(0, "#f6dca8"); sd.addColorStop(1, "#d9b06a"); x.fillStyle = sd;
        x.fillRect(cx - 34 * s, gy - 26 * s, 68 * s, 26 * s); [-34, -12, 12].forEach((d) => { x.fillRect(cx + d * s - 2 * s, gy - 52 * s, 26 * s * 0.0 + 22 * s, 28 * s); for (let m = 0; m < 3; m++) x.fillRect(cx + d * s - 2 * s + m * 8 * s, gy - 58 * s, 5 * s, 7 * s); });
        x.fillRect(cx - 10 * s, gy - 76 * s, 20 * s, 26 * s); for (let m = 0; m < 3; m++) x.fillRect(cx - 10 * s + m * 7.5 * s, gy - 82 * s, 5 * s, 7 * s);
        x.fillStyle = "#8a5a2a"; x.beginPath(); x.arc(cx, gy - 8 * s, 7 * s, Math.PI, 0); x.fill(); x.fillRect(cx - 7 * s, gy - 8 * s, 14 * s, 8 * s); x.fillRect(cx - 2 * s, gy - 68 * s, 4 * s, 7 * s);
        x.strokeStyle = "#5a3a2a"; x.lineWidth = 1.5 * s; x.beginPath(); x.moveTo(cx, gy - 82 * s); x.lineTo(cx, gy - 100 * s); x.stroke(); x.fillStyle = "#ff4fd8"; x.beginPath(); x.moveTo(cx, gy - 100 * s); x.lineTo(cx + 12 * s, gy - 96 * s); x.lineTo(cx, gy - 92 * s); x.fill();
        x.fillStyle = "rgba(120,80,30,.15)"; for (let r = 0; r < 4; r++) x.fillRect(cx - 34 * s, gy - 22 * s + r * 6 * s, 68 * s, 1); };
      castle(W * (W < 600 ? 0.16 : 0.09), H * (W < 600 ? 0.84 : 0.86), k * (W < 600 ? 0.75 : 1.15)); castle(W * (W < 600 ? 0.84 : 0.91), H * 0.8, k * (W < 600 ? 0.6 : 0.9));
      // a red-and-white bucket and spade beside the bigger castle
      { const bx = W * (W < 600 ? 0.32 : 0.18), by = H * 0.88, s = k * 1.1; x.fillStyle = "#e0303a"; x.beginPath(); x.moveTo(bx - 11 * s, by - 22 * s); x.lineTo(bx + 11 * s, by - 22 * s); x.lineTo(bx + 8 * s, by); x.lineTo(bx - 8 * s, by); x.fill(); x.fillStyle = "#fff"; x.fillRect(bx - 10 * s, by - 15 * s, 20 * s, 3 * s); x.strokeStyle = "#333"; x.lineWidth = 1.2; x.beginPath(); x.arc(bx, by - 22 * s, 11 * s, Math.PI, 0); x.stroke(); }
      S.bg = b; S.max = Math.min(H * 0.97, lines[2].y + 60);
      S.foam = Array.from({ length: 90 }, () => ({ x: Math.random(), o: rnd(-26, 6), r: rnd(1, 3.4) }));
      S.surf = [[0.18, 0.6, 1], [0.62, 0.15, -1], [0.85, 0.42, 1]].map(([x, ph, d], i) => ({ x, ph, d, col: ["#ff4fd8", "#ffd36b", "#2ef2ff"][i], suit: ["#1a2a4a", "#3a1a2a", "#14303a"][i] }));
    },
    // rolling swells: lines of white water that build, curl and break as they reach the shore
    swells(c, t, S) {
      const top = H * 0.2;
      for (let i = 0; i < 6; i++) {
        const k = (t * 0.09 + i / 6) % 1, y = lerp(top + 4, S.shore - 2, Math.pow(k, 1.3)), a = Math.sin(Math.PI * k), th = 1 + k * 4;
        c.fillStyle = `rgba(8,60,100,${0.25 * a})`; c.fillRect(0, y - th * 1.5, W, th * 1.5);
        c.strokeStyle = `rgba(255,255,255,${0.75 * a})`; c.lineWidth = th; c.beginPath();
        for (let x = 0; x <= W + 20; x += 14) { const yy = y + Math.sin(x * 0.012 + i * 2 + t * 0.6) * (1 + k * 3), on = Math.sin(x * 0.008 + i * 1.7 + t * 0.3) > -0.3 + k * 0.4; on ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke();
      }
      // the shore break, lapping on the sand
      const ly = S.shore + Math.sin(t * 1.6) * 3; c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= W + 20; x += 12) { const yy = ly + Math.sin(x * 0.03 + t * 2) * 2; x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke();
      // surfers riding the swells: crouched on their boards, arms out
      S.surf.forEach((q, i) => {
        const k = (t * 0.09 + q.ph) % 1, y = lerp(top + 4, S.shore - 2, Math.pow(k, 1.3)) - 2, a = Math.sin(Math.PI * k); if (a < 0.25) return;
        const sc = (0.45 + k * 0.7) * clamp(Math.min(W, H) / 700, 0.6, 1.2), x = ((q.x + t * 0.02 * q.d) % 1 + 1) % 1 * W;
        c.save(); c.globalAlpha = clamp((a - 0.25) / 0.2); c.translate(x, y); c.scale(q.d * sc, sc); c.rotate(-0.06 + Math.sin(t * 2 + i) * 0.05);
        c.fillStyle = "rgba(255,255,255,.8)"; c.beginPath(); c.ellipse(-26, 2, 18, 3, 0, 0, 7); c.fill(); // spray off the tail
        c.fillStyle = q.col; c.beginPath(); c.ellipse(0, 0, 22, 3.2, 0, 0, 7); c.fill(); c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(-20, 0, 40, 1);
        c.strokeStyle = q.suit; c.lineCap = "round"; c.lineWidth = 3.6; c.beginPath(); c.moveTo(-7, -1); c.lineTo(-3, -10); c.lineTo(0, -19); c.lineTo(5, -10); c.lineTo(8, -1); c.stroke();
        c.lineWidth = 2.6; c.beginPath(); c.moveTo(0, -17); c.lineTo(-12, -21 + Math.sin(t * 3 + i) * 2); c.moveTo(0, -17); c.lineTo(12, -15 - Math.sin(t * 3 + i) * 2); c.stroke();
        c.fillStyle = "#e0a87e"; c.beginPath(); c.arc(1.5, -23, 3.6, 0, 7); c.fill(); c.fillStyle = "#3a2418"; c.beginPath(); c.arc(0.8, -24.5, 3.4, Math.PI, 0); c.fill();
        c.restore();
      });
    },
    front(S, t) {
      if (t < 0.6) return S.shore;
      if (t < 3.4) return lerp(S.shore, S.max, ease((t - 0.6) / 2.8));
      return lerp(S.max, S.shore, easeIO((t - 3.4) / 2.8));
    },
    edge: (x, F, t) => F + Math.sin(x * 0.018 + t * 1.7) * 9 + Math.sin(x * 0.0065 - t * 0.9) * 15,
    draw(c, t, S) {
      c.drawImage(S.bg, 0, 0); this.swells(c, t, S);
      const F = this.front(S, t), wetF = t < 3.4 ? F : S.max, wt = t < 3.4 ? t : 3.4, step = W / 60;
      const dry = 1 - clamp((t - 6.2) / 2.2);
      // wet sand band and the letters pressed into it
      const wet = new Path2D(); wet.moveTo(0, S.shore); for (let x = 0; x <= W + step; x += step) wet.lineTo(x, this.edge(x, wetF, wt)); wet.lineTo(W, S.shore); wet.closePath();
      c.fillStyle = `rgba(150,105,50,${0.3 * dry})`; c.fill(wet);
      c.save(); c.clip(wet); c.textAlign = "center"; c.textBaseline = "middle";
      lines.forEach((l) => { c.font = l.f; c.fillStyle = "rgba(255,245,225,.55)"; c.fillText(l.t, W / 2 + 1.5, l.y + 1.5); c.fillStyle = `rgba(${lerp(170, 92, dry)},${lerp(130, 60, dry)},${lerp(80, 24, dry)},.92)`; c.fillText(l.t, W / 2, l.y); });
      c.restore();
      // the water
      if (F > S.shore + 1) {
        const wp = new Path2D(); wp.moveTo(0, S.shore - 2); for (let x = 0; x <= W + step; x += step) wp.lineTo(x, this.edge(x, F, t)); wp.lineTo(W, S.shore - 2); wp.closePath();
        const g = c.createLinearGradient(0, S.shore, 0, F + 20); g.addColorStop(0, "rgba(40,170,210,.85)"); g.addColorStop(0.7, "rgba(90,200,230,.55)"); g.addColorStop(1, "rgba(200,245,255,.35)");
        c.fillStyle = g; c.fill(wp);
        const fo = new Path2D(); for (let x = 0; x <= W + step; x += step) fo[x ? "lineTo" : "moveTo"](x, this.edge(x, F, t));
        c.lineCap = "round"; c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = 5; c.stroke(fo);
        c.save(); c.translate(0, -12); c.strokeStyle = "rgba(255,255,255,.45)"; c.lineWidth = 2; c.stroke(fo); c.restore();
        c.strokeStyle = "rgba(255,255,255,.3)"; c.lineWidth = 1.2; for (let r = 1; r < 5; r++) { c.beginPath(); for (let x = 0; x <= W + step; x += step) { const yy = this.edge(x, F, t) - r * 14 - Math.sin(x * 0.05 + r * 2 + t * 2) * 4; x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); }
        c.fillStyle = "rgba(255,255,255,.85)"; c.beginPath(); S.foam.forEach((b) => { const x = b.x * W; c.moveTo(x + b.r, this.edge(x, F, t) + b.o); c.arc(x, this.edge(x, F, t) + b.o, b.r, 0, 7); }); c.fill();
      }
    },
    sound(t) {
      const n = noise("lowpass", 700, 0.6, 0, 11); env(n.g, [[0.2, 0.05], [2.4, 0.45], [3.6, 0.3], [6.2, 0.06], [9, 0]]);
      const h = noise("highpass", 3500, 0.4, 0, 11); env(h.g, [[1, 0], [3.2, 0.08], [6, 0.02], [9, 0]]);
    },
  };

  // ECLIPSE: glasses on, the moon slides away and the sunlight reveals the headline
  SC.eclipse = {
    D: 10.6, cy: () => H * 0.63, gap: () => 6, final: { gold: true }, cap: [[0.4, 8.2, "Glasses on 🕶️  Never look at the real sun without proper eclipse glasses."]],
    init(S) {
      S.stars = Array.from({ length: 160 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: rnd(0.4, 1.5) }));
      const rx = Math.min(W * 0.235, H * 0.42), ry = Math.min(H * 0.36, rx * (W < H ? 1.7 : 1.05)); S.lens = [rx, ry];
      S.sx = W / 2 - rx * 1.08 * 0.62; S.sy = H * 0.47 - ry * 0.42; S.R = Math.min(W, H) * (W < H ? 0.075 : 0.095);
      S.motes = Array.from({ length: 90 }, () => ({ a: rnd(0, Math.PI * 2), d: Math.random(), v: rnd(0.08, 0.2) }));
    },
    draw(c, t, S) {
      const { sx, sy, R } = S;
      const dist = easeIO((t - 1.8) / 5.6) * R * 2.3, mx = sx + dist, my = sy - dist * 0.22;
      const d = Math.min(Math.hypot(mx - sx, my - sy), 2 * R);
      const over = 2 * R * R * Math.acos(d / (2 * R)) - (d / 2) * Math.sqrt(4 * R * R - d * d), L = clamp(1 - over / (Math.PI * R * R));
      const day = clamp((L - 0.6) / 0.4); // once the moon has gone, the shadow lifts and it is daytime again
      sky(c, [`rgb(${lerp(lerp(6, 70, L), 70, day)},${lerp(lerp(4, 40, L), 120, day)},${lerp(lerp(16, 70, L), 200, day)})`, `rgb(${lerp(lerp(8, 30, L), 240, day)},${lerp(lerp(5, 18, L), 170, day)},${lerp(lerp(18, 40, L), 120, day)})`]);
      c.fillStyle = `rgba(255,255,255,${0.9 * (1 - L)})`; c.beginPath(); S.stars.forEach((s) => { c.moveTo(s.x, s.y); c.arc(s.x, s.y, s.r, 0, 7); }); c.fill();
      const warm = c.createRadialGradient(sx, sy, R, sx, sy, Math.hypot(W, H)); warm.addColorStop(0, `rgba(255,190,90,${0.55 * L})`); warm.addColorStop(1, "rgba(255,120,60,0)"); c.fillStyle = warm; c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = "lighter";
      if (L > 0.02) {
        const far = Math.hypot(W, H) * 1.2; c.fillStyle = `rgba(255,200,110,${0.13 * L})`; c.beginPath();
        for (let i = 0; i < 16; i++) { const a = (i * Math.PI * 2) / 16 + t * 0.05; c.moveTo(sx, sy); c.lineTo(sx + Math.cos(a - 0.035) * far, sy + Math.sin(a - 0.035) * far); c.lineTo(sx + Math.cos(a + 0.035) * far, sy + Math.sin(a + 0.035) * far); c.closePath(); }
        c.fill();
        c.fillStyle = `rgba(255,230,160,${0.8 * L})`; c.beginPath();
        S.motes.forEach((m) => { const r = ((m.d + t * m.v) % 1) * Math.hypot(W, H); c.moveTo(sx + Math.cos(m.a) * r, sy + Math.sin(m.a) * r); c.arc(sx + Math.cos(m.a) * r, sy + Math.sin(m.a) * r, 1.6, 0, 7); }); c.fill();
      }
      const co = c.createRadialGradient(sx, sy, R * 0.9, sx, sy, R * 2.6); co.addColorStop(0, `rgba(230,240,255,${0.85 * (1 - clamp(L * 2.5))})`); co.addColorStop(0.35, `rgba(170,200,255,${0.3 * (1 - clamp(L * 2.5))})`); co.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = co; c.fillRect(sx - R * 3, sy - R * 3, R * 6, R * 6);
      c.globalCompositeOperation = "source-over";
      const sg = c.createRadialGradient(sx, sy, 0, sx, sy, R); sg.addColorStop(0, "#fffbe6"); sg.addColorStop(0.6, "#ffd451"); sg.addColorStop(1, "#ff9a1f");
      c.fillStyle = sg; c.beginPath(); c.arc(sx, sy, R, 0, 7); c.fill();
      const moonA = 1 - clamp((L - 0.45) / 0.45); if (moonA > 0) { c.fillStyle = `rgba(6,4,12,${moonA})`; c.beginPath(); c.arc(mx, my, R * 1.01, 0, 7); c.fill(); }
      if (L > 0.003 && L < 0.12) { // diamond ring
        const a = Math.atan2(sy - my, sx - mx), px = sx + Math.cos(a) * R, py = sy + Math.sin(a) * R, k = Math.sin((L / 0.12) * Math.PI);
        const fl = c.createRadialGradient(px, py, 0, px, py, R * 1.6); fl.addColorStop(0, `rgba(255,255,255,${k})`); fl.addColorStop(0.15, `rgba(255,240,200,${0.6 * k})`); fl.addColorStop(1, "rgba(255,255,255,0)");
        c.globalCompositeOperation = "lighter"; c.fillStyle = fl; c.fillRect(px - R * 2, py - R * 2, R * 4, R * 4); c.globalCompositeOperation = "source-over";
      }
      // sunlight reaches the words
      const reach = ease(L * 1.3) * Math.hypot(W, H);
      if (reach > 5) { c.save(); c.beginPath(); c.arc(sx, sy, reach, 0, 7); c.clip(); ink(c, clamp(L * 2.2), { gold: true }); c.restore(); }
      // the glasses
      const g = t < 4 ? ease((t - 0.15) / 1.1) : 1 - easeIO((t - 8.1) / 1.1);
      if (g > 0) {
        c.globalCompositeOperation = "multiply"; c.fillStyle = `rgba(255,150,60,${0.7 * g})`; c.fillRect(0, 0, W, H); c.globalCompositeOperation = "source-over";
        const yo = -(1 - g) * H * 1.15, [rx, ry] = S.lens, cy = H * 0.47 + yo, gapx = rx * 1.08;
        const fr = new Path2D(); fr.rect(-10, -10 + yo, W + 20, H + 20); fr.moveTo(W / 2 - gapx + rx, cy); fr.ellipse(W / 2 - gapx, cy, rx, ry, 0, 0, Math.PI * 2); fr.moveTo(W / 2 + gapx + rx, cy); fr.ellipse(W / 2 + gapx, cy, rx, ry, 0, 0, Math.PI * 2);
        c.fillStyle = "#0b0814"; c.fill(fr, "evenodd");
        c.strokeStyle = "#ff4fd8"; c.lineWidth = 4; c.shadowColor = "#ff4fd8"; c.shadowBlur = 16;
        c.beginPath(); c.moveTo(W / 2 - gapx + rx, cy); c.ellipse(W / 2 - gapx, cy, rx, ry, 0, 0, Math.PI * 2); c.moveTo(W / 2 + gapx + rx, cy); c.ellipse(W / 2 + gapx, cy, rx, ry, 0, 0, Math.PI * 2); c.stroke(); c.shadowBlur = 0;
        c.fillStyle = "#ffd36b"; c.font = "700 11px Inter, sans-serif"; c.textAlign = "center"; c.fillText("WHISTLE STREET · ECLIPSE VIEWERS", W / 2, cy + ry + 22);
      }
    },
    sound(t) {
      [[220, 0], [277.18, 0.6], [329.63, 1.2], [440, 3.5], [554.37, 5.5]].forEach(([f, a]) => a >= t - 0.2 && tone(f, Math.max(0, a - t) + 0.1, 8, f > 400 ? 0.05 : 0.08));
      if (t < 7) [880, 1108.73, 1318.5].forEach((f, i) => tone(f, 7.2 - t + i * 0.25, 2.5, 0.035));
    },
  };

  // HURRICANE: start with the whole world, zoom into the storm, which spins the headline then throws it into place
  SC.hurricane = {
    D: 10.4, cy: () => H * 0.5, gap: () => (W < 600 ? 4 : 5),
    init(S, P) {
      S.R = Math.min(W, H) * 0.3;
      S.stars = Array.from({ length: 200 }, () => ({ x: Math.random() * W, y: Math.random() * H, r: rnd(0.3, 1.3) }));
      S.clouds = Array.from({ length: 70 }, () => { const la = rnd(-1, 1) > 0 ? rnd(0.5, 1.05) : rnd(-1.05, 1.05); return [rnd(0, Math.PI * 2), Math.random() < 0.5 ? la : -la * rnd(0.3, 1), rnd(0.05, 0.16), rnd(-0.6, 0.6)]; });
      S.hl = (-58 * Math.PI) / 180; S.hla = (21 * Math.PI) / 180; S.rot = S.hl - 0.42; // the storm sits over the Atlantic, east of the Caribbean
      S.wind = Array.from({ length: W < 600 ? 120 : 220 }, () => ({ r: rnd(0.05, 0.75) * Math.max(W, H), a: rnd(0, 7), l: rnd(0.08, 0.25) }));
      const maxR = Math.hypot(W, H) * 0.5, [x0, xr] = bounds(P);
      P.forEach((p) => { p.r = rnd(0.06, 0.7) * maxR; p.a = rnd(0, Math.PI * 2); p.w = 3.4 * (1 - (p.r / maxR) * 0.6); p.rel = 5.6 + ((p.tx - x0) / xr) * 1.6 + rnd(0, 0.6); });
    },
    proj(S, lon, lat, rot) { const l = lon - rot, z = Math.cos(lat) * Math.cos(l); let x = Math.cos(lat) * Math.sin(l), y = -Math.sin(lat); if (z < 0) { const m = Math.hypot(x, y) || 1; x /= m; y /= m; } return [x * S.R, y * S.R, z]; },
    draw(c, t, S, P) {
      const cx = W / 2, cy = H / 2, rot = S.rot + t * 0.05, k = easeIO((t - 0.4) / 3.4), z = Math.exp(Math.log(13) * k);
      const [ex, ey] = this.proj(S, S.hl, S.hla, rot);
      c.fillStyle = "#020309"; c.fillRect(0, 0, W, H);
      c.fillStyle = `rgba(255,255,255,${0.8 * (1 - k)})`; c.beginPath(); S.stars.forEach((s) => { c.moveTo(s.x, s.y); c.arc(s.x, s.y, s.r, 0, 7); }); c.fill();
      c.save(); c.translate(cx, cy); c.scale(z, z); c.translate(-ex * k, -ey * k);
      const R = S.R;
      const at = c.createRadialGradient(0, 0, R * 0.95, 0, 0, R * 1.18); at.addColorStop(0, "rgba(90,170,255,.55)"); at.addColorStop(1, "rgba(90,170,255,0)"); c.fillStyle = at; c.beginPath(); c.arc(0, 0, R * 1.2, 0, 7); c.fill();
      const oc = c.createRadialGradient(-R * 0.35, -R * 0.35, R * 0.1, 0, 0, R); oc.addColorStop(0, "#2f86d6"); oc.addColorStop(1, "#0a2350"); c.fillStyle = oc; c.beginPath(); c.arc(0, 0, R, 0, 7); c.fill();
      c.save(); c.beginPath(); c.arc(0, 0, R, 0, 7); c.clip();
      c.globalAlpha = 1 - clamp((k - 0.5) / 0.3);
      const shape = (poly, fill) => { const pts = poly.map(([lo, la]) => this.proj(S, lo, la, rot)); if (pts.every((p) => p[2] < 0)) return; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fillStyle = fill; c.fill(); };
      const lg = c.createLinearGradient(0, -R, 0, R); lg.addColorStop(0, "#3d6b3a"); lg.addColorStop(0.3, "#4f8a43"); lg.addColorStop(0.5, "#3f7f3a"); lg.addColorStop(0.75, "#5b8f45"); lg.addColorStop(1, "#4a7a44");
      EARTH_P.land.forEach((p) => shape(p, lg));
      EARTH_P.desert.forEach((p) => shape(p, "rgba(196,170,110,.85)"));
      EARTH_P.ice.forEach((p) => shape(p, "#e8f1f6")); shape(EARTH_P.ant, "#eef4f8");
      // arctic sea ice
      c.fillStyle = "rgba(235,244,250,.85)"; for (let i = 0; i < 48; i++) { const [x, y, zz] = this.proj(S, (i / 48) * Math.PI * 2, (82 * Math.PI) / 180, rot); if (zz < 0) continue; c.beginPath(); c.arc(x, y, R * 0.06 * (0.4 + zz), 0, 7); c.fill(); }
      c.globalAlpha = 1;
      // swirls of cloud drifting with the weather
      c.fillStyle = "rgba(255,255,255,.42)"; S.clouds.forEach(([lo, la, w, tl]) => { const [x, y, zz] = this.proj(S, lo + t * 0.012, la, rot); if (zz < 0.05) return; c.save(); c.translate(x, y); c.rotate(tl); c.beginPath(); c.ellipse(0, 0, R * w * Math.sqrt(zz), R * w * 0.22, 0, 0, 7); c.ellipse(R * w * 0.5, R * w * 0.12, R * w * 0.5 * Math.sqrt(zz), R * w * 0.13, 0, 0, 7); c.fill(); c.restore(); });
      // daylight: a soft shine on the top-left and night on the far edge
      const sh = c.createRadialGradient(-R * 0.45, -R * 0.4, R * 0.05, -R * 0.1, -R * 0.1, R * 1.25); sh.addColorStop(0, "rgba(255,255,255,.14)"); sh.addColorStop(0.55, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,4,20,.6)"); c.fillStyle = sh; c.fillRect(-R, -R, R * 2, R * 2);
      // the hurricane on the globe
      const Rs = R * 0.2, spin = t * (0.8 + k * 1.6); // everything turns the same way: anticlockwise, like a real northern storm
      const cm = c.createRadialGradient(ex, ey, 0, ex, ey, Rs * 1.3); cm.addColorStop(0, "rgba(255,255,255,.75)"); cm.addColorStop(0.7, "rgba(230,240,255,.4)"); cm.addColorStop(1, "rgba(230,240,255,0)"); c.fillStyle = cm; c.beginPath(); c.arc(ex, ey, Rs * 1.3, 0, 7); c.fill();
      c.lineCap = "round";
      for (let arm = 0; arm < 4; arm++) {
        c.beginPath();
        for (let th = 0.3; th < 4.6 * Math.PI; th += 0.12) { const r = Rs * Math.pow(th / (4.6 * Math.PI), 0.9) * 1.25, a = th - spin + (arm * Math.PI) / 2; th < 0.42 ? c.moveTo(ex + Math.cos(a) * r, ey + Math.sin(a) * r) : c.lineTo(ex + Math.cos(a) * r, ey + Math.sin(a) * r); }
        c.strokeStyle = `rgba(255,255,255,${0.55 - arm * 0.08})`; c.lineWidth = Rs * (0.16 - arm * 0.025); c.stroke();
      }
      c.fillStyle = "#0a1a3c"; c.beginPath(); c.arc(ex, ey, Rs * 0.045, 0, 7); c.fill();
      c.restore(); c.restore();
      // inside the storm: wind and the spinning words
      const inS = clamp((t - 3.2) / 0.8), out = 1 - clamp((t - 8.3) / 1.4);
      if (inS > 0) {
        const vg = c.createRadialGradient(cx, cy, 0, cx, cy, Math.hypot(W, H) / 2); vg.addColorStop(0, `rgba(10,16,40,${0.35 * inS})`); vg.addColorStop(1, `rgba(3,5,16,${0.8 * inS})`); c.fillStyle = vg; c.fillRect(0, 0, W, H);
        c.strokeStyle = `rgba(210,230,255,${0.45 * inS * out})`; c.lineWidth = 1.3; c.beginPath();
        S.wind.forEach((w) => { const a = w.a - t * (3.2 * (1 - w.r / Math.max(W, H) * 0.6)); c.moveTo(cx + Math.cos(a) * w.r, cy + Math.sin(a) * w.r); c.arc(cx, cy, w.r, a, a + w.l, false); }); c.stroke();
        const fly = new Path2D(), land = new Path2D(), g = W < 600 ? 3 : 3.6;
        for (const p of P) {
          const a = p.a - (t - 3.2) * p.w, ox = cx + Math.cos(a) * p.r, oy = cy + Math.sin(a) * p.r, e = ease((t - p.rel) / 1.15);
          const x = lerp(ox, p.tx, e), y = lerp(oy, p.ty, e);
          (e >= 1 ? land : fly).rect(x - g / 2, y - g / 2, g, g);
        }
        c.globalAlpha = inS * S.k; c.fillStyle = "#9ff6ff"; c.shadowColor = "#2ef2ff"; c.shadowBlur = 6; c.fill(fly); c.fillStyle = "#fff"; c.shadowColor = "#6b5cff"; c.shadowBlur = 10; c.fill(land); c.shadowBlur = 0; c.globalAlpha = 1;
      }
    },
    sound(t) {
      const w = noise("bandpass", 450, 1.2, 0, 13); env(w.g, [[0, 0.05], [3.4, 0.35], [5.5, 0.55], [8.2, 0.4], [10.5, 0]]); env(w.f, [[0, 300], [4, 700], [6, 500], [8, 900], [10, 400]]);
      const r = noise("lowpass", 160, 0.7, 0, 13); env(r.g, [[2, 0], [4, 0.45], [9, 0.3], [10.5, 0]]);
      const h = noise("highpass", 4000, 0.5, 0, 13); env(h.g, [[3.2, 0], [4.5, 0.06], [9, 0.04], [10.5, 0]]);
    },
  };

  // BREEZY: someone walks a cavapoo and a lhasa apso; a gust brings leaves and footprints and paw prints spell the words
  SC.windy = {
    D: 13, cy: () => (W < 600 ? H * 0.52 : H * 0.6), gap: () => (W < 600 ? 5 : 7), final: {},
    init(S, P) {
      S.s = clamp(Math.min(W, H) / 640, 0.55, 1.25); S.gy = H - (W < 600 ? 128 : 78); S.hz = W < 600 ? H * 0.33 : H * 0.47;
      S.hills = Array.from({ length: 3 }, (_, i) => Array.from({ length: 9 }, () => rnd(0.38, 0.47) + i * 0.02));
      S.trees = Array.from({ length: Math.round(W / 140) }, () => ({ x: rnd(0, W), h: rnd(40, 90), c: ["#e0782f", "#d9a227", "#b84a2a", "#7a9c3a"][Math.floor(rnd(0, 4))] }));
      S.blades = Array.from({ length: Math.round(W / 4) }, () => ({ x: rnd(0, W), y: rnd(S.hz, H), h: rnd(4, 9) }));
      S.leaves = Array.from({ length: W < 600 ? 45 : 80 }, () => ({ y: rnd(0.25, 0.98) * H, off: rnd(-0.6, 0) * W, v: rnd(0.8, 1.5), rot: rnd(0, 6), spin: rnd(-6, 6), sz: rnd(5, 10) * S.s, c: ["#ff8a3d", "#ffb63d", "#e2552e", "#c9d24a", "#d9822b"][Math.floor(rnd(0, 5))] }));
      S.gusts = Array.from({ length: 14 }, () => ({ y: rnd(0.2, 0.9) * H, d: rnd(0, 1), l: rnd(60, 160) }));
      S.trail = []; S.lastStep = 0; S.gap = P.length > 1 ? Math.max(...P.slice(1, 40).map((p, i) => Math.abs(p.tx - P[i].tx)).filter((d) => d > 0 && d < 30).concat([this.gap()])) : this.gap(); S.gap = Math.min(S.gap, this.gap() + 4);
      P.forEach((p, i) => { p.paw = (Math.floor(p.tx / 9) + Math.floor(p.ty / 9)) % 3 !== 0; p.a = this.gx(p.tx) + rnd(0, 0.45); p.rot = Math.PI / 2 + rnd(-0.35, 0.35) + (p.paw ? 0 : rnd(-0.2, 0.2)); });
    },
    walkX(t) { return W * 0.18 + t * W * 0.055; },
    gx(x) { return 3.0 + ((x + 0.1 * W) / (1.2 * W)) * 5.2; }, // when the gust front passes x
    gust(t) { return clamp((t - 2.6) / 0.8) * (1 - clamp((t - 9.5) / 2)); },
    draw(c, t, S, P) {
      const s = S.s, gy = S.gy, wx = this.walkX(t), gu = this.gust(t), wind = 0.25 + gu;
      const zk = easeIO((t - 0.4) / 2.8), z = lerp(1.9, 1, zk), fx = lerp(wx + 40 * s, W / 2, zk), fy = lerp(gy - 60 * s, H / 2, zk);
      c.save(); c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-fx, -fy);
      sky(c, ["#7cc6ff", "#c3e6ff", "#fbe8cf"], -H, S.hz + 2);
      S.hills.forEach((h, i) => { c.fillStyle = ["#9cc48a", "#7fb070", "#5f9a58"][i]; c.beginPath(); c.moveTo(-W, H); h.forEach((y, j) => c.lineTo(-W * 0.2 + (j / (h.length - 1)) * W * 1.4, y * H + S.hz - H * 0.47)); c.lineTo(W * 2, H); c.fill(); });
      S.trees.forEach((tr) => autumnTree(c, tr.x, S.hz + 2, tr.h, tr.c, Math.sin(t * 2 + tr.x) * 4 * wind + wind * 3));
      sky(c, ["#4f9a4a", "#3c8240", "#2c6a34"], S.hz, H * 2);
      c.strokeStyle = "rgba(25,70,30,.6)"; c.lineWidth = 1; c.beginPath(); S.blades.forEach((b) => { const lean = (Math.sin(t * 3 + b.x * 0.05) * 0.5 + 0.5) * wind * 4; c.moveTo(b.x, b.y); c.lineTo(b.x + lean + 1, b.y - b.h); }); c.stroke();
      c.fillStyle = "#cdb48a"; c.beginPath(); c.moveTo(-W, gy - 22 * s); c.lineTo(W * 2, gy - 22 * s); c.lineTo(W * 2, gy + 30 * s); c.lineTo(-W, gy + 30 * s); c.fill();
      c.fillStyle = "rgba(120,90,50,.25)"; c.fillRect(-W, gy - 22 * s, W * 3, 3);
      // the walker's own trail on the path
      if (t - S.lastStep > 0.28) { S.lastStep = t; const k = S.trail.length; S.trail.push({ x: wx + (k % 2 ? 4 : -4) * s, y: gy + 4 * s + (k % 2 ? 5 : 0) * s, paw: false, t }, { x: wx + 62 * s, y: gy + (k % 2 ? 6 : 1) * s, paw: true, t }, { x: wx + 124 * s, y: gy + (k % 2 ? 7 : 2) * s, paw: true, t }); if (S.trail.length > 90) S.trail.splice(0, 3); }
      c.fillStyle = "rgba(110,80,45,.55)"; c.beginPath(); S.trail.forEach((f) => (f.paw ? paw : foot)(c, f.x, f.y, 4.2 * s, Math.PI / 2)); c.fill();
      // prints that spell the words
      const sz = S.gap * 0.5;
      c.save(); c.fillStyle = "#fff6dc"; c.shadowColor = "rgba(20,40,20,.55)"; c.shadowBlur = 2; c.beginPath();
      for (const p of P) { const k = (t - p.a) / 0.18; if (k < 0) continue; (p.paw ? paw : foot)(c, p.tx, p.ty, sz * Math.min(1, k), p.rot); }
      c.fill(); c.restore();
      // the walk
      walker(c, wx, gy, s, t, wind);
      lhasa(c, wx + 62 * s, gy, s, t, wind);
      cavapoo(c, wx + 124 * s, gy, s, t, wind);
      c.restore();
      // the gust: wind lines and leaves (drawn in screen space so they sweep across)
      if (gu > 0) {
        c.strokeStyle = `rgba(255,255,255,${0.55 * gu})`; c.lineWidth = 2; c.lineCap = "round";
        S.gusts.forEach((g) => { const x = ((g.d + t * 0.45) % 1.3 - 0.15) * W; c.beginPath(); c.moveTo(x, g.y); c.bezierCurveTo(x + g.l * 0.3, g.y - 14, x + g.l * 0.7, g.y + 10, x + g.l, g.y - 4); c.stroke(); });
      }
      S.leaves.forEach((l, i) => {
        const x = (t - 2.6) * W * 0.22 * l.v + l.off; if (x < -20 || x > W + 20) return;
        const y = l.y + Math.sin(t * 2.2 + i) * 26 * wind, a = l.rot + t * l.spin;
        c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = l.c; c.beginPath(); c.ellipse(0, 0, l.sz, l.sz * 0.5, 0, 0, 7); c.fill();
        c.strokeStyle = "rgba(90,40,10,.6)"; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-l.sz, 0); c.lineTo(l.sz * 1.2, 0); c.stroke(); c.restore();
      });
    },
    sound(t) {
      const w = noise("bandpass", 600, 1.6, 0, 15); env(w.g, [[0, 0.06], [2.6, 0.08], [3.4, 0.4], [6, 0.3], [9.5, 0.12], [12.5, 0]]); env(w.f, [[2.6, 500], [3.6, 1100], [6, 700], [9, 900]]);
      const l = noise("highpass", 5000, 0.6, 0, 15); env(l.g, [[3, 0], [3.8, 0.05], [9, 0.03], [12, 0]]);
    },
  };
  // an autumn tree: tapering trunk and branches, a crown of leaf clumps lit from the upper left
  function autumnTree(c, x, gy, h, col, sw) {
    const r = h * 0.2, cy = gy - h * 0.72;
    c.fillStyle = "#4a3020"; c.beginPath(); c.moveTo(x - h * 0.05, gy); c.lineTo(x - h * 0.025, gy - h * 0.55); c.lineTo(x + h * 0.025, gy - h * 0.55); c.lineTo(x + h * 0.05, gy); c.fill();
    c.strokeStyle = "#4a3020"; c.lineWidth = h * 0.03; c.lineCap = "round"; c.beginPath(); c.moveTo(x, gy - h * 0.45); c.lineTo(x - h * 0.18 + sw * 0.5, gy - h * 0.7); c.moveTo(x, gy - h * 0.5); c.lineTo(x + h * 0.16 + sw * 0.5, gy - h * 0.78); c.stroke();
    const P = [[0, -0.9], [-0.9, -0.2], [0.9, -0.25], [-0.5, -1.1], [0.5, -1.15], [-0.2, 0.15], [0.45, 0.2], [0, -1.55]];
    c.fillStyle = "rgba(0,0,0,.18)"; c.beginPath(); P.forEach(([a, b]) => { c.moveTo(x + sw + a * r + r, cy + b * r + r * 0.25); c.arc(x + sw + a * r, cy + b * r + r * 0.25, r, 0, 7); }); c.fill();
    c.fillStyle = col; c.beginPath(); P.forEach(([a, b]) => { c.moveTo(x + sw + a * r + r, cy + b * r); c.arc(x + sw + a * r, cy + b * r, r, 0, 7); }); c.fill();
    c.fillStyle = "rgba(255,240,200,.22)"; c.beginPath(); P.slice(0, 5).forEach(([a, b]) => { c.moveTo(x + sw + a * r - r * 0.2 + r * 0.55, cy + b * r - r * 0.3); c.arc(x + sw + a * r - r * 0.2, cy + b * r - r * 0.3, r * 0.55, 0, 7); }); c.fill();
    c.fillStyle = "rgba(60,20,0,.18)"; for (let i = 0; i < 10; i++) { const a = i * 2.4, rr = r * 1.4 * ((i * 0.37) % 1); c.beginPath(); c.arc(x + sw + Math.cos(a) * rr, cy - r * 0.4 + Math.sin(a) * rr, r * 0.16, 0, 7); c.fill(); }
  }
  function paw(c, x, y, s, r) {
    const cr = Math.cos(r), sr = Math.sin(r), P = (dx, dy) => [x + dx * cr - dy * sr, y + dx * sr + dy * cr];
    let [px, py] = P(0, s * 0.35); c.moveTo(px + s * 0.55, py); c.ellipse(px, py, s * 0.55, s * 0.45, r, 0, 7);
    [[-0.62, -0.35], [-0.22, -0.72], [0.22, -0.72], [0.62, -0.35]].forEach(([a, b]) => { [px, py] = P(a * s, b * s); c.moveTo(px + s * 0.22, py); c.arc(px, py, s * 0.22, 0, 7); });
  }
  function foot(c, x, y, s, r) {
    const cr = Math.cos(r), sr = Math.sin(r), P = (dx, dy) => [x + dx * cr - dy * sr, y + dx * sr + dy * cr];
    let [px, py] = P(0, -s * 0.25); c.moveTo(px + s * 0.4, py); c.ellipse(px, py, s * 0.4, s * 0.62, r, 0, 7);
    [px, py] = P(0, s * 0.68); c.moveTo(px + s * 0.3, py); c.ellipse(px, py, s * 0.3, s * 0.3, r, 0, 7);
  }
  // the dog walker: a proper heel-to-toe walk (knees bend as each leg swings through, the body rises and falls,
  // arms swing against the legs), a belted coat, boots, a scarf and a ponytail that move in the wind.
  // o.umb: hold an umbrella in the far hand (returns where that hand is)
  function walker(c, x, gy, s, t, wind, o = {}) {
    const ph = t * 6.2, L1 = 27 * s, L2 = 26 * s, hipY = gy - 49.5 * s - 2.5 * s * Math.cos(2 * ph), lean = 0.04;
    const shY = hipY - 46 * s, shX = x + Math.sin(lean) * 46 * s, top = shY - 6 * s;
    c.lineCap = "round"; c.lineJoin = "round";
    const leg = (p, near) => {
      const a = 0.42 * Math.sin(p), flex = 0.08 + 0.85 * Math.pow(Math.max(0, Math.cos(p)), 1.6), kx = x + Math.sin(a) * L1, ky = hipY + Math.cos(a) * L1, b = a - flex, fx = kx + Math.sin(b) * L2, fy = Math.min(gy - 2 * s, ky + Math.cos(b) * L2);
      c.strokeStyle = near ? "#2c2440" : "#221c34"; c.lineWidth = 6.5 * s; c.beginPath(); c.moveTo(x, hipY); c.lineTo(kx, ky); c.lineTo(fx, fy); c.stroke();
      // ankle boot, the toe tips up as the foot swings forward and rolls off at the back
      const toe = Math.max(-0.35, Math.min(0.3, -flex * 0.4 + (Math.sin(p) > 0.3 && Math.cos(p) < 0 ? 0 : 0) + (Math.cos(p) < -0.5 ? -0.25 * Math.sin(p) : 0)));
      c.save(); c.translate(fx, fy); c.rotate(toe); c.fillStyle = near ? "#3a2418" : "#2a1a10"; c.beginPath(); c.moveTo(-4 * s, -9 * s); c.lineTo(3 * s, -9 * s); c.lineTo(4 * s, -3 * s); c.quadraticCurveTo(12 * s, -3 * s, 12 * s, 1 * s); c.lineTo(-5 * s, 1.5 * s); c.closePath(); c.fill(); c.fillStyle = "#1a100a"; c.fillRect(-5 * s, 0.5 * s, 17 * s, 1.8 * s); c.restore();
    };
    const arm = (sx, sy, a, e, col, w) => { const ex = sx + Math.sin(a) * 19 * s, ey = sy + Math.cos(a) * 19 * s, hx = ex + Math.sin(a + e) * 17 * s, hy = ey + Math.cos(a + e) * 17 * s; c.strokeStyle = col; c.lineWidth = w * s; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(hx, hy); c.stroke(); c.fillStyle = "#e8b48a"; c.beginPath(); c.arc(hx, hy, 3.3 * s, 0, 7); c.fill(); return [hx, hy]; };
    // far side first: leg and arm (swinging, or holding the umbrella up)
    leg(ph + Math.PI, false);
    let umb = null;
    if (o.umb) umb = arm(shX - 3 * s, shY + 3 * s, 2.1, 0.75, "#4a3fb8", 6); else arm(shX - 3 * s, shY + 3 * s, 0.38 * Math.sin(ph), 0.25 + 0.2 * Math.max(0, Math.sin(ph)), "#4a3fb8", 6);
    // coat: fitted at the waist, flaring to the knee and swinging with the stride
    const hem = hipY + 20 * s, fl = Math.sin(ph) * 3 * s - wind * 4 * s;
    const cg = c.createLinearGradient(x - 16 * s, 0, x + 16 * s, 0); cg.addColorStop(0, "#5a4ce6"); cg.addColorStop(1, "#7a6cff"); c.fillStyle = cg;
    c.beginPath(); c.moveTo(shX - 11 * s, shY); c.quadraticCurveTo(shX, shY - 4 * s, shX + 11 * s, shY); c.lineTo(x + 10 * s, hipY - 12 * s); c.quadraticCurveTo(x + 14 * s, hipY, x + 18 * s + fl, hem); c.quadraticCurveTo(x + 1 * s, hem + 4 * s, x - 17 * s + fl, hem - 1 * s); c.quadraticCurveTo(x - 13 * s, hipY, x - 10 * s, hipY - 12 * s); c.closePath(); c.fill();
    c.fillStyle = "#3e33a8"; c.fillRect(x - 11 * s, hipY - 14 * s, 22 * s, 4 * s); c.fillStyle = "#ffd36b"; c.fillRect(x + 2 * s, hipY - 14.5 * s, 5 * s, 5 * s); // belt and buckle
    c.fillStyle = "#e8e4ff"; [shY + 12 * s, shY + 22 * s, hipY - 4 * s].forEach((y) => { c.beginPath(); c.arc(x + 6 * s, y, 1.3 * s, 0, 7); c.fill(); });
    c.strokeStyle = "rgba(30,20,90,.45)"; c.lineWidth = 1.2 * s; c.beginPath(); c.moveTo(x + 4 * s, shY + 2 * s); c.lineTo(x + 4 * s, hem); c.stroke(); // front edge
    // near leg over the coat hem
    leg(ph, true);
    // scarf: wrapped at the neck, the ends streaming behind in the wind
    c.strokeStyle = "#2ef2ff"; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(shX - 8 * s, shY - 1 * s); c.lineTo(shX + 8 * s, shY - 1 * s); c.stroke();
    c.lineWidth = 4.5 * s; c.beginPath(); c.moveTo(shX - 5 * s, shY); for (let i = 1; i <= 5; i++) c.lineTo(shX - 5 * s - i * 6.5 * s * (0.5 + wind * 0.6), shY + Math.sin(t * 9 + i) * 2.5 * s * (0.4 + wind) + i * 2.2 * s * (1.1 - wind)); c.stroke();
    // near arm holds both leads, swinging gently
    const hand = arm(shX + 3 * s, shY + 4 * s, 0.75 + 0.12 * Math.sin(ph), -0.55, "#6b5cff", 6.5);
    // head: neck, face in profile, ear, ponytail
    c.fillStyle = "#e0a87e"; c.fillRect(shX - 2.5 * s, shY - 9 * s, 5 * s, 8 * s);
    const hx = shX + 2 * s, hy = top - 8 * s;
    c.fillStyle = "#3a2418"; const pt = Math.sin(ph * 0.5) * 3 * s - wind * 6 * s; c.beginPath(); c.moveTo(hx - 9 * s, hy - 6 * s); c.quadraticCurveTo(hx - 22 * s + pt, hy + 2 * s, hx - 18 * s + pt * 1.4, hy + 18 * s); c.quadraticCurveTo(hx - 13 * s + pt, hy + 6 * s, hx - 7 * s, hy + 1 * s); c.fill();
    c.fillStyle = "#ff4fd8"; c.beginPath(); c.arc(hx - 9.5 * s, hy - 4 * s, 2.2 * s, 0, 7); c.fill(); // hair tie
    c.fillStyle = "#f0c098"; c.beginPath(); c.ellipse(hx, hy, 10.5 * s, 12 * s, 0, 0, 7); c.fill();
    c.beginPath(); c.moveTo(hx + 9 * s, hy - 2 * s); c.lineTo(hx + 13 * s, hy + 2 * s); c.lineTo(hx + 9.5 * s, hy + 3.5 * s); c.fill(); // nose
    c.fillStyle = "#3a2418"; c.beginPath(); c.moveTo(hx - 11 * s, hy + 2 * s); c.quadraticCurveTo(hx - 12 * s, hy - 14 * s, hx + 2 * s, hy - 13 * s); c.quadraticCurveTo(hx + 11 * s, hy - 12 * s, hx + 10 * s, hy - 5 * s); c.quadraticCurveTo(hx + 2 * s, hy - 9 * s, hx - 4 * s, hy - 5 * s); c.lineTo(hx - 6 * s, hy + 3 * s); c.closePath(); c.fill();
    c.fillStyle = "#e0a87e"; c.beginPath(); c.ellipse(hx - 3 * s, hy + 1 * s, 2.4 * s, 3.2 * s, 0, 0, 7); c.fill(); // ear
    c.fillStyle = "#1a1530"; c.beginPath(); c.ellipse(hx + 5.5 * s, hy - 1.5 * s, 1.3 * s, 1.7 * s, 0, 0, 7); c.fill();
    c.strokeStyle = "#3a2418"; c.lineWidth = 1 * s; c.beginPath(); c.moveTo(hx + 3.5 * s, hy - 4.8 * s); c.lineTo(hx + 7.5 * s, hy - 4.5 * s); c.stroke();
    c.fillStyle = "rgba(255,120,140,.35)"; c.beginPath(); c.arc(hx + 4 * s, hy + 3.5 * s, 2.4 * s, 0, 7); c.fill();
    c.strokeStyle = "#c0485a"; c.lineWidth = 1.4 * s; c.beginPath(); c.moveTo(hx + 6 * s, hy + 6.5 * s); c.quadraticCurveTo(hx + 8 * s, hy + 7.5 * s, hx + 9.5 * s, hy + 6 * s); c.stroke();
    // two leads from her hand to the dogs' collars
    const [lx, ly] = hand; c.lineWidth = 1.6 * s;
    c.strokeStyle = "#ff4fd8"; c.beginPath(); c.moveTo(lx, ly); c.quadraticCurveTo(lx + 18 * s, ly + 22 * s, x + 74 * s, gy - 34 * s); c.stroke();
    c.strokeStyle = "#ffd36b"; c.beginPath(); c.moveTo(lx, ly); c.quadraticCurveTo(lx + 40 * s, ly + 14 * s, x + 136 * s, gy - 30 * s); c.stroke();
    return { umb, hand };
  }
  function legs(c, x, gy, s, t, by, col, spread, lw) {
    c.strokeStyle = col; c.lineWidth = lw * s; c.lineCap = "round";
    [[-spread, 0], [-spread + 5, Math.PI], [spread - 5, Math.PI / 2], [spread, Math.PI * 1.5]].forEach(([dx, o]) => { const a = Math.sin(t * 11 + o) * 0.5; c.beginPath(); c.moveTo(x + dx * s, by); c.lineTo(x + dx * s + Math.sin(a) * 8 * s, gy - 1 * s); c.stroke(); });
  }
  function cavapoo(c, x, gy, s, t, wind) { // curly apricot coat, floppy ears, waggy tail
    const bob = Math.abs(Math.sin(t * 11)) * 1.5 * s, by = gy - 18 * s - bob, col = "#c98a4b", dark = "#a8692f";
    legs(c, x, gy, s, t, by, dark, 13, 4.5);
    c.fillStyle = col; c.beginPath(); c.ellipse(x, by - 4 * s, 19 * s, 11 * s, 0, 0, 7); c.fill();
    c.fillStyle = "#d89a58"; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(x - 15 * s + i * 3.8 * s, by - 13 * s + Math.sin(i * 1.7) * 2 * s, 4 * s, 0, 7); c.fill(); }
    const wag = Math.sin(t * 16) * 0.6; c.strokeStyle = col; c.lineWidth = 5 * s; c.beginPath(); c.moveTo(x - 17 * s, by - 8 * s); c.quadraticCurveTo(x - 26 * s, by - 18 * s, x - 24 * s + wag * 6 * s, by - 24 * s); c.stroke();
    c.fillStyle = col; c.beginPath(); c.arc(x + 20 * s, by - 16 * s, 10 * s, 0, 7); c.fill();
    c.fillStyle = "#d89a58"; [[-4, -9], [2, -11], [8, -8]].forEach(([a, b]) => { c.beginPath(); c.arc(x + 20 * s + a * s, by - 16 * s + b * s, 4 * s, 0, 7); c.fill(); });
    c.fillStyle = "#e2a868"; c.beginPath(); c.ellipse(x + 29 * s, by - 13 * s, 6 * s, 4.5 * s, 0, 0, 7); c.fill();
    c.fillStyle = dark; c.beginPath(); c.ellipse(x + 15 * s + wind * 2 * s, by - 9 * s, 4.5 * s, 9 * s, 0.25 - wind * 0.3, 0, 7); c.fill();
    c.fillStyle = "#1a1210"; c.beginPath(); c.arc(x + 34 * s, by - 14 * s, 2.2 * s, 0, 7); c.arc(x + 24 * s, by - 18 * s, 1.6 * s, 0, 7); c.fill();
    c.fillStyle = "#ff4fd8"; c.fillRect(x + 12 * s, by - 9 * s, 6 * s, 3 * s);
  }
  function lhasa(c, x, gy, s, t, wind) { // long flowing cream-and-gold coat to the ground, plume tail over the back, fringe over the eyes
    const bob = Math.abs(Math.sin(t * 11 + 1)) * 1.2 * s, by = gy - 20 * s - bob, flow = Math.sin(t * 5) * 1.5 * s - wind * 4 * s;
    c.fillStyle = "#3a2a1a"; [-14, -6, 8, 15].forEach((dx, i) => { const a = Math.sin(t * 11 + i * 1.6) * 3 * s; c.beginPath(); c.ellipse(x + dx * s + a, gy - 1.5 * s, 3 * s, 2 * s, 0, 0, 7); c.fill(); });
    // tail plume curling over the back
    c.fillStyle = "#ecd5a0"; c.beginPath(); c.moveTo(x - 18 * s, by - 8 * s);
    c.bezierCurveTo(x - 38 * s, by - 18 * s, x - 32 * s, by - 42 * s, x - 10 * s - wind * 6 * s, by - 30 * s);
    c.bezierCurveTo(x - 20 * s, by - 32 * s, x - 22 * s, by - 18 * s, x - 12 * s, by - 10 * s); c.fill();
    // coat
    const g = c.createLinearGradient(0, by - 18 * s, 0, gy); g.addColorStop(0, "#f6e7c4"); g.addColorStop(1, "#d3a560"); c.fillStyle = g;
    c.beginPath(); c.moveTo(x - 24 * s, by - 4 * s);
    c.quadraticCurveTo(x - 4 * s, by - 20 * s, x + 16 * s, by - 10 * s);
    c.quadraticCurveTo(x + 24 * s, by + 2 * s, x + 21 * s + flow, gy - 2 * s);
    const n = 7; for (let i = 0; i < n; i++) { const x0 = x + 21 * s - (i * 48 * s) / n + flow, x1 = x + 21 * s - ((i + 1) * 48 * s) / n + flow; c.quadraticCurveTo((x0 + x1) / 2, gy + 2.5 * s + Math.sin(t * 6 + i) * s, x1, gy - 2 * s); }
    c.quadraticCurveTo(x - 30 * s + flow, by + 6 * s, x - 24 * s, by - 4 * s); c.fill();
    c.strokeStyle = "rgba(170,120,60,.3)"; c.lineWidth = 1.1 * s; c.beginPath();
    for (let i = 0; i < 7; i++) { const hx = x - 20 * s + i * 6 * s; c.moveTo(hx, by - 6 * s); c.quadraticCurveTo(hx + flow * 0.4 + 2 * s, by + 8 * s, hx + flow, gy - 4 * s); } c.stroke();
    // head with long ears, fringe and beard
    const hx = x + 22 * s, hy = by - 17 * s;
    c.fillStyle = "#f2dfb3"; c.beginPath(); c.arc(hx, hy, 10 * s, 0, 7); c.fill();
    c.fillStyle = "#c6964f"; c.beginPath(); c.ellipse(hx - 6 * s + flow * 0.3, hy + 9 * s, 5 * s, 13 * s, 0.18 - wind * 0.2, 0, 7); c.fill();
    c.fillStyle = "#ead09a"; c.beginPath(); c.ellipse(hx + 7 * s, hy + 8 * s, 6 * s, 5 * s, 0, 0, 7); c.fill();
    c.fillStyle = "#e3c387"; c.beginPath(); c.ellipse(hx + 3 * s, hy - 5 * s, 10 * s, 5.5 * s, -0.15, 0, 7); c.fill();
    c.fillStyle = "#1a1210"; c.beginPath(); c.arc(hx + 6 * s, hy + 0.5 * s, 1.5 * s, 0, 7); c.arc(hx + 11.5 * s, hy + 3 * s, 2.2 * s, 0, 7); c.fill();
    c.fillStyle = "#ff7ab8"; c.beginPath(); c.ellipse(hx - 2 * s, hy - 11 * s, 4.5 * s, 2.4 * s, 0.3, 0, 7); c.ellipse(hx + 4 * s, hy - 12 * s, 4.5 * s, 2.4 * s, -0.3, 0, 7); c.fill();
    c.fillStyle = "#ffd36b"; c.fillRect(x + 12 * s, by - 9 * s, 6 * s, 3 * s);
  }

  // ------------------------------------------------------------------ the player
  let el, cv, ctx, raf, cur, S, P, t0, auto, manual = false, done = false;
  // the story that follows each intro (story.js): chap -1 is the intro itself
  let story = null, chap = -1, tc0 = 0;
  window.WXE = { soundOn: () => A.on, ac: () => A.ctx, out: () => A.master, noiseBuf: () => A.noise, track: (n) => A.nodes.push(n), noise, env, rumble, crack, tone, walker, cavapoo, lhasa };
  // scene changes crossfade: the last frame of the old scene melts into the new one with a gentle push-in
  let prev = null, prevT = 0;
  function snapshot() {
    try { const o = document.createElement("canvas"); o.width = cv.width; o.height = cv.height; o.getContext("2d").drawImage(cv, 0, 0); prev = o; prevT = performance.now(); } catch (e) { prev = null; }
  }
  function dots() {
    const d = el.querySelector(".wx-dots"); if (!d) return;
    const n = story ? story.n : 0;
    d.innerHTML = n ? Array.from({ length: n + 1 }, (_, i) => `<i class="${i === chap + 1 ? "on" : i < chap + 1 ? "was" : ""}"></i>`).join("") : "";
    el.querySelector(".wx-next").hidden = !n;
  }
  function chapter(k) {
    stopSound(); cancelAnimationFrame(raf);
    if (!story || k >= story.n) { chap = -1; prev = null; return close(); }
    if (window.__wxT == null && !story.seamless?.(k)) snapshot(); else prev = null; // some chapters flow straight on, with no fade
    chap = k; story.start(k); tc0 = performance.now(); dots();
    el.querySelector(".wx-cap").hidden = true;
    raf = requestAnimationFrame(storyLoop);
  }
  function storyLoop() {
    const t = window.__wxT ?? (performance.now() - tc0) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    story.draw(ctx, t);
    if (prev) {
      const k = (performance.now() - prevT) / 1000 / 0.9;
      if (k >= 1) prev = null;
      else { const e = k * k * (3 - 2 * k), z = 1 + e * 0.08; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1 - e; ctx.drawImage(prev, cv.width * (1 - z) / 2, cv.height * (1 - z) / 2, cv.width * z, cv.height * z); ctx.globalAlpha = 1; }
    }
    if (window.__wxT == null && t > story.D(chap)) return chapter(chap + 1);
    raf = requestAnimationFrame(storyLoop);
  }
  function next() { if (!el?.classList.contains("on")) return; if (chap < 0 && !story) return close(); chapter(chap + 1); }
  const scene = () => SC[cur];
  function build() {
    if (el) return el;
    el = document.createElement("div"); el.className = "wx"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Weather intro");
    el.innerHTML = `<canvas></canvas><p class="wx-cap" hidden></p>
      <div class="wx-bar"><div class="wx-chips">${ORDER.map((k) => `<button data-wx="${k}" title="${META[k][2]}"><span>${META[k][0]}</span>${META[k][1]}</button>`).join("")}</div>
      <div class="wx-ctl"><button class="wx-snd" aria-pressed="false">🔇 Sound off</button><button class="wx-calm">Calm mode</button><span class="wx-dots" aria-hidden="true"></span><button class="wx-next" hidden>Next ›</button><button class="wx-skip">Skip ✕</button></div></div>`;
    document.body.appendChild(el);
    cv = el.querySelector("canvas"); ctx = cv.getContext("2d");
    el.querySelectorAll("[data-wx]").forEach((b) => b.onclick = () => { manual = true; play(b.dataset.wx); });
    el.querySelector(".wx-skip").onclick = close;
    el.querySelector(".wx-next").onclick = next;
    cv.onclick = next;
    el.querySelector(".wx-calm").onclick = () => { LS.set("wx-calm", "1"); document.body.classList.add("wx-calm"); close(); };
    el.querySelector(".wx-snd").onclick = (e) => {
      A.on = !A.on;
      if (A.on && !audioOn()) A.on = false;
      e.currentTarget.textContent = A.on ? "🔊 Sound on" : "🔇 Sound off"; e.currentTarget.setAttribute("aria-pressed", A.on);
      stopSound(); if (A.on && cur) { if (chap >= 0) story?.sound(); else scene().sound?.((performance.now() - t0) / 1000, S); }
    };
    addEventListener("keydown", (e) => { if (!el.classList.contains("on")) return; if (e.key === "Escape") close(); if (e.key === "ArrowRight") next(); });
    let rz; addEventListener("resize", () => {
      if (!el.classList.contains("on") || !cur) return;
      clearTimeout(rz); rz = setTimeout(() => {
        if (chap < 0) return play(cur, true);
        W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr;
        story = window.WX_STORY?.make(cur, W, H) || null; chapter(chap);
      }, 150);
    });
    return el;
  }
  function open() { build(); el.classList.remove("out"); el.classList.add("on"); document.documentElement.classList.add("wx-lock"); }
  function close() {
    if (!el) return; cancelAnimationFrame(raf); stopSound(); chap = -1; el.classList.add("out");
    document.documentElement.classList.remove("wx-lock");
    setTimeout(() => el.classList.remove("on", "out"), 600);
    reveal(); dispatchEvent(new Event("wx:closed"));
  }
  async function play(name, keepTime) {
    open(); cancelAnimationFrame(raf); stopSound();
    cur = SC[name] ? name : auto; done = false; chap = -1;
    document.body.dataset.wx = cur;
    el.querySelectorAll("[data-wx]").forEach((b) => b.classList.toggle("on", b.dataset.wx === cur));
    el.querySelector('[data-wx="' + auto + '"]')?.classList.add("auto");
    dpr = Math.min(devicePixelRatio || 1, W < 700 ? 2 : 1.5);
    W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr;
    try { await document.fonts.load(`italic 900 60px 'Playfair Display'`); await document.fonts.load("800 20px Inter"); } catch (e) {}
    layout(scene().cy()); P = targets(scene().gap()); S = {}; scene().init(S, P);
    story = window.WX_STORY?.has(cur) ? window.WX_STORY.make(cur, W, H) : null; dots();
    if (window.__wxCh != null && story) return chapter(window.__wxCh);
    t0 = performance.now(); if (A.on) scene().sound?.(0, S);
    const cap = el.querySelector(".wx-cap");
    const loop = () => {
      const t = window.__wxT ?? (performance.now() - t0) / 1000, sc = scene();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fin = clamp((t - (sc.D - 1.4)) / 1.1); S.k = 1 - fin * 0.9;
      sc.draw(ctx, t, S, P);
      ink(ctx, fin, sc.final);
      const c = (sc.cap || []).find(([a, b]) => t >= a && t < b); cap.hidden = !c; if (c) cap.textContent = c[2];
      if (t > sc.D + 0.3 && !done && window.__wxT == null) { done = true; if (story) return chapter(0); if (!manual) return setTimeout(close, 700); }
      if (t > sc.D + 1.2) return;
      raf = requestAnimationFrame(loop);
    };
    loop();
  }

  // ------------------------------------------------------------------ scroll animations that match the weather
  let io;
  function reveal() {
    if (calm() || reduced) { document.body.classList.add("wx-calm"); return; }
    io = io || new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    const tag = () => document.querySelectorAll("main .tcard, main .cards > *, main .kpis > *, main .tablewrap, main .h2, main .storm-card, main .mapwrap, main .scard").forEach((n) => {
      if (n.dataset.rv) return; n.dataset.rv = 1; const r = n.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0 && r.height) return; // already on screen: leave it be
      n.classList.add("rv"); io.observe(n);
    });
    tag(); let q; new MutationObserver(() => { clearTimeout(q); q = setTimeout(tag, 120); }).observe(document.querySelector("main") || document.body, { childList: true, subtree: true });
  }

  // ------------------------------------------------------------------ start
  const shouldAuto = () => (forced && SC[forced]) || (!calm() && !reduced && !SS.get("wx-seen"));
  if (shouldAuto()) { open(); el.classList.add("wait"); }
  if (calm() || reduced) document.body.classList.add("wx-calm");
  window.startIntro = function (spy, breadth, up, n) {
    info = { spy: spy ?? 0, up: up ?? 0, n: n ?? 0 }; auto = pick(spy, breadth); document.body.dataset.wx = auto;
    const brand = document.querySelector(".brand");
    if (brand && !document.getElementById("wx-open")) {
      const b = document.createElement("button"); b.id = "wx-open"; b.className = "wx-open"; b.title = "Play the weather intro and switch between scenes";
      b.innerHTML = `${META[auto][0]} <span>Weather intro</span>`;
      b.onclick = () => { LS.set("wx-calm", "0"); document.body.classList.remove("wx-calm"); manual = true; play(auto); };
      brand.appendChild(b);
    }
    if (shouldAuto()) { SS.set("wx-seen", "1"); el?.classList.remove("wait"); play(forced && SC[forced] ? forced : auto); }
    else reveal();
  };
  setTimeout(() => { if (el?.classList.contains("wait") && !cur) close(); }, 9000);
})();
