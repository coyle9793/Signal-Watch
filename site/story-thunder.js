// Thunderstorm story: lightning strikes a tree on a farm -> a transformer blows and the city goes dark ->
// the streets flood -> an empty office block burns while a fire engine stands by. No people are shown
// in harm's way; the facts beside these scenes are worded plainly.
WXS.add("thunder", (K) => {
  const { W, H, rnd, clamp, ease, easeIO, lerp, TAU, sky, glow, ridge, hill, cloud, tree, city, drawCity, boltPath, bolt, car, lamp, rainLines } = K;
  const s0 = Math.min(W, H) / 700, phone = W < 600;
  const storm = (c, t, S, bottom) => { sky(c, ["#07071a", "#14142e", "#24243e"], 0, bottom); S.cl.forEach((q, i) => cloud(c, ((q.x * W + t * 12 * (i % 2 ? 1 : 0.6)) % (W + 300)) - 150, q.y * H, q.r, i % 2 ? "#1a1a30" : "#22223a", 6, q.sd)); };
  const clouds = () => Array.from({ length: 9 }, (_, i) => ({ x: rnd(0, 1), y: rnd(0.02, 0.18), r: rnd(50, 90) * s0, sd: i }));

  // ---------------------------------------------------------------- 1. lightning hits a tree on a farm
  const TX = () => W * (phone ? 0.3 : 0.6), GY = () => H * 0.78, TH = () => Math.min(H * 0.44, 320);
  const crown = (t) => { const tx = TX(), gy = GY(), th = TH(), sh = th * 0.2, hit = 1.4, ft = t - hit - 0.3, fall = ft <= 0 ? 0 : ft < 1.05 ? 1.32 * Math.pow(ft / 1.05, 2) : 1.32; const L = th * 0.85; return [tx + Math.sin(fall) * L, gy - sh - Math.cos(fall) * L]; };
  const treeCh = {
    D: 7.4, facts: ["market"], calm: false, cy: () => H * 0.36, cx: () => (phone ? W / 2 : W * 0.4),
    init(S) { S.cl = clouds(); S.r1 = ridge(4.4, H * 0.04, H * 0.66); S.grass = Array.from({ length: phone ? 90 : 200 }, () => ({ x: Math.random() * W, y: rnd(0.78, 1) * H, h: rnd(6, 14) })); S.leaves = Array.from({ length: 50 }, () => ({ a: rnd(0, TAU), r: Math.random(), v: rnd(0.6, 1.6), c: Math.random() > 0.5 ? "#3a6a3a" : "#5a8a3a" })); },
    draw(c, t, S) {
      const hit = 1.4, fl = (t > hit && t < hit + 0.35 ? 1 - (t - hit) / 0.35 : 0) + (t > 0.5 && t < 0.6 ? 0.4 : 0) + (t > 5.2 && t < 5.32 ? 0.5 : 0);
      storm(c, t, S, H * 0.78);
      hill(c, S.r1, "#141a22");
      // farmhouse with lit windows, a barn, a fence
      const fx = W * (phone ? 0.72 : 0.18), fy = S.r1(fx) + 6; c.fillStyle = "#1e1a26"; c.fillRect(fx, fy - 40 * s0, 64 * s0, 40 * s0); c.beginPath(); c.moveTo(fx - 6 * s0, fy - 40 * s0); c.lineTo(fx + 32 * s0, fy - 64 * s0); c.lineTo(fx + 70 * s0, fy - 40 * s0); c.fill(); c.fillRect(fx + 44 * s0, fy - 74 * s0, 8 * s0, 16 * s0);
      c.fillStyle = "#ffcf7a"; [[10, -30], [40, -30]].forEach(([dx, dy]) => c.fillRect(fx + dx * s0, fy + dy * s0, 12 * s0, 10 * s0)); glow(c, fx + 30 * s0, fy - 25 * s0, 50 * s0, "rgba(255,200,120,.25)");
      sky(c, ["#1c2a1c", "#0e160e"], H * 0.77, H + 10);
      c.strokeStyle = "#2a2018"; c.lineWidth = 3 * s0; c.beginPath(); for (let i = 0; i < 14; i++) { const x = (i / 13) * W; c.moveTo(x, H * 0.84); c.lineTo(x, H * 0.84 - 26 * s0); } c.moveTo(0, H * 0.84 - 18 * s0); c.lineTo(W, H * 0.84 - 18 * s0); c.moveTo(0, H * 0.84 - 8 * s0); c.lineTo(W, H * 0.84 - 8 * s0); c.stroke();
      c.strokeStyle = "#2a4a2a"; c.lineWidth = 1.5; c.beginPath(); S.grass.forEach((g) => { const b = Math.sin(t * 3 + g.x * 0.05) * 4; c.moveTo(g.x, g.y); c.lineTo(g.x + b + 3, g.y - g.h); }); c.stroke();
      // the tree: struck, it splits and falls
      const tx = TX(), gy = GY(), th = TH(), sh = th * 0.2, ft = t - hit - 0.3, fall = ft <= 0 ? 0 : ft < 1.05 ? 1.32 * Math.pow(ft / 1.05, 2) : 1.32 - Math.sin(clamp((ft - 1.05) / 0.4) * Math.PI) * 0.08;
      c.fillStyle = "#4a3220"; c.beginPath(); c.moveTo(tx - 14, gy); c.lineTo(tx - 11, gy - sh); c.lineTo(tx - 2, gy - sh - 10); c.lineTo(tx + 4, gy - sh + 2); c.lineTo(tx + 11, gy - sh - 6); c.lineTo(tx + 14, gy); c.fill();
      c.save(); c.translate(tx, gy - sh); c.rotate(fall);
      c.fillStyle = "#4a3220"; c.beginPath(); c.moveTo(-11, 0); c.lineTo(-7, -th * 0.6); c.lineTo(7, -th * 0.6); c.lineTo(11, 0); c.fill();
      c.strokeStyle = "#4a3220"; c.lineWidth = 5; c.beginPath(); c.moveTo(0, -th * 0.4); c.lineTo(-th * 0.18, -th * 0.6); c.moveTo(0, -th * 0.48); c.lineTo(th * 0.2, -th * 0.66); c.stroke();
      c.translate(0, -th * 0.25); [[0, -th * 0.55, th * 0.3, "#24442a"], [-th * 0.2, -th * 0.42, th * 0.22, "#24442a"], [th * 0.2, -th * 0.45, th * 0.24, "#2e5434"], [0, -th * 0.75, th * 0.22, "#2e5434"], [-th * 0.08, -th * 0.5, th * 0.2, "#3a6040"]].forEach(([x, y, r, col]) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); });
      c.restore();
      if (t > hit && t < hit + 3) { const k = (t - hit) / 3; glow(c, tx, gy - sh, 80, `rgba(255,140,60,${0.7 * (1 - k)})`); c.fillStyle = `rgba(255,170,80,${1 - k})`; for (let i = 0; i < 26; i++) c.fillRect(tx + Math.sin(i * 7.7) * 60 * k * 2, gy - sh - Math.abs(Math.cos(i * 3.1)) * 120 * k, 2, 2); c.fillStyle = `rgba(120,120,130,${0.4 * (1 - k)})`; for (let i = 0; i < 6; i++) glow(c, tx + Math.sin(i + t) * 20, gy - sh - k * 160 - i * 20, 40, `rgba(100,100,110,${0.3 * (1 - k)})`); }
      // leaves torn off by the wind
      if (t > hit) S.leaves.forEach((l) => { const k = ((t - hit) * l.v * 0.35 + l.r) % 1, x = tx + k * W * 0.7 * (phone ? 1.4 : 1) + Math.sin(t * 4 + l.a) * 20, y = gy - th * 0.6 + Math.sin(k * 6 + l.a) * th * 0.4 - k * 60; c.save(); c.translate(x, y); c.rotate(t * 6 + l.a); c.fillStyle = l.c; c.beginPath(); c.ellipse(0, 0, 5, 2.5, 0, 0, TAU); c.fill(); c.restore(); });
      rainLines(c, phone ? 120 : 260, t, { slant: 0.3, speed: 2.2, col: "rgba(170,190,230,.35)", len: 20 });
      if (t > hit - 0.05 && t < hit + 0.35) { if (!S.bolt) S.bolt = boltPath(tx + rnd(-80, 80), -10, tx, gy - th * 0.8); bolt(c, S.bolt, fl); }
      if (fl > 0) { c.fillStyle = `rgba(220,215,255,${fl * 0.35})`; c.fillRect(0, 0, W, H); }
    },
    // the strike throws the letters out of the tree with the leaves; they swirl in the wind, then land
    text: {
      at: 3.6, spread: 1.0, dur: 1.0, pre: 1.5, preScale: 0.6, preFade: 0.4, spin: 1.3, glow: "rgba(255,170,80,.9)", ink: ["#fff2c8", "#ffd36b", "#ff9d2e"],
      from(p, S, t) { const [cx, cy] = crown(Math.min(t, 2)), k = clamp((t - 1.5) / 2); return [cx + (p.r - 0.3) * W * 0.5 * k + Math.sin(t * 3 + p.q * 9) * 20, cy - p.q * H * 0.25 * k + Math.cos(t * 2.5 + p.r * 7) * 16]; },
    },
    sound(e) { e.rain(0, 7.4, 0.1); e.wind(0, 7.4, 0.12, 300, 600); e.rumble(0, 1.3, 0.35); e.thunder(1.4, 0.9); e.noise("bandpass", 300, 1, 2, 1.2, [[2, 0], [2.1, 0.35], [3.1, 0]]); e.thud(2.75, 0.8, 45); e.thunder(5.25, 0.4); },
  };

  // ---------------------------------------------------------------- 2. a transformer blows; the city goes dark
  const TRX = () => [W * (phone ? 0.78 : 0.82), H * 0.6];
  const outage = {
    D: 7.4, facts: ["warning"], calm: false, cy: () => H * 0.34,
    init(S) { S.cl = clouds(); S.B = city(0.28, 0.6); S.cars = [[0.12, "#5a4a8a"], [0.42, "#8a4a5a", 1], [0.62, "#3a6a6a"]]; },
    draw(c, t, S) {
      const gy = H * 0.8, blow = 1.0, front = lerp(1.1, -0.1, clamp((t - blow - 0.2) / 1.4)) * W, back = clamp((t - 5.4) / 1.6), out = (x) => x > front;
      storm(c, t, S, gy);
      drawCity(c, S.B, gy, "#0f1326", (b, i, k, r, v) => (v > 0.45 && (!out(b.x + k * 14) || (back > 0 && v > 1 - back * 0.55)) ? true : false));
      sky(c, ["#1a1a26", "#0a0a12"], gy, H + 10);
      c.fillStyle = "#2a2a36"; c.fillRect(0, gy, W, 10 * s0);
      c.strokeStyle = "rgba(255,220,120,.4)"; c.setLineDash([24, 18]); c.lineWidth = 3; c.beginPath(); c.moveTo(0, H * 0.92); c.lineTo(W, H * 0.92); c.stroke(); c.setLineDash([]);
      // street lamps and a traffic light
      for (let i = 0; i < 5; i++) { const x = W * (0.06 + i * 0.22); lamp(c, x, gy + 8 * s0, s0, out(x) ? back * 0.8 : 1); }
      const lx = W * 0.3, ly = gy + 8 * s0; c.fillStyle = "#1a1a22"; c.fillRect(lx - 2 * s0, ly - 80 * s0, 4 * s0, 80 * s0); c.fillRect(lx - 8 * s0, ly - 110 * s0, 16 * s0, 36 * s0);
      const tl = out(lx) && back === 0 ? -1 : Math.floor(t / 2) % 3; ["#ff3a3a", "#ffc23a", "#3ae07a"].forEach((col, i) => { c.fillStyle = tl === i ? col : "#2a2a30"; c.beginPath(); c.arc(lx, ly - 104 * s0 + i * 11 * s0, 4 * s0, 0, TAU); c.fill(); if (tl === i) glow(c, lx, ly - 104 * s0 + i * 11 * s0, 14 * s0, col); });
      S.cars.forEach(([u, col, f]) => car(c, u * W, H * 0.9, s0 * 1.1, col, { flip: !!f, lights: !out(u * W) }));
      // the power pole and transformer, with lines into town
      const [px, py] = TRX(); c.strokeStyle = "#2a2018"; c.lineWidth = 6 * s0; c.beginPath(); c.moveTo(px, gy + 8 * s0); c.lineTo(px, py - 40 * s0); c.stroke(); c.lineWidth = 4 * s0; c.beginPath(); c.moveTo(px - 30 * s0, py - 34 * s0); c.lineTo(px + 30 * s0, py - 34 * s0); c.stroke();
      c.strokeStyle = "#111"; c.lineWidth = 1.5; [-26, 0, 26].forEach((d) => { c.beginPath(); c.moveTo(px + d * s0, py - 34 * s0); c.quadraticCurveTo(px * 0.5, py + 10 * s0, -20, py - 50 * s0 + d * 0.5); c.stroke(); });
      c.fillStyle = "#4a4a56"; c.fillRect(px - 12 * s0, py - 10 * s0, 24 * s0, 30 * s0);
      if (t > blow && t < blow + 1.6) { const k = (t - blow) / 1.6; glow(c, px, py, (40 + 140 * (1 - k)) * s0, `rgba(140,200,255,${1 - k})`); c.fillStyle = `rgba(220,240,255,${1 - k})`; for (let i = 0; i < 30; i++) { const a = (i / 30) * TAU, r = k * (60 + (i % 5) * 20) * s0; c.fillRect(px + Math.cos(a) * r, py + Math.sin(a) * r + k * k * 60 * s0, 2.5, 2.5); } if (k < 0.15) { c.fillStyle = "rgba(200,230,255,.3)"; c.fillRect(0, 0, W, H); } }
      if (t > blow + 1.6 && t < 5.4) { const sp = Math.sin(t * 30) > 0.6; if (sp) glow(c, px, py, 20 * s0, "rgba(140,200,255,.8)"); }
      rainLines(c, phone ? 100 : 220, t, { slant: 0.2, speed: 2, col: "rgba(170,190,230,.3)", len: 18 });
    },
    // the letters crackle out of the sparking transformer like electricity
    text: {
      at: 2.6, spread: 1.2, dur: 0.9, startScale: 0.15, spin: 1, glow: "rgba(140,220,255,1)", ink: ["#e8f8ff", "#8ad8ff", "#2ef2ff"], ease: (k) => { const e = ease(k); return e + Math.sin(k * 40) * 0.02 * (1 - k); },
      from: () => TRX(),
    },
    sound(e) { e.rain(0, 7.4, 0.08); e.hum(0, 1, 0.05); e.zap(1, 0.5); e.thud(1, 0.6, 40); e.crackle(1.2, 4, 10, 0.05); e.hum(5.4, 2, 0.04); },
  };

  // ---------------------------------------------------------------- 3. the streets flood
  const level = (t) => lerp(H * 0.97, H * 0.7, ease(t / 3.8));
  const flood = {
    D: 7.6, facts: ["shock"], calm: false, cy: () => H * 0.36,
    init(S) { S.cl = clouds(); S.B = city(0.16, 0.36); S.float = Array.from({ length: 10 }, (_, i) => ({ x: Math.random(), k: i % 4, ph: rnd(0, 6), v: rnd(0.01, 0.03) })); },
    draw(c, t, S) {
      const gy = H * 0.76, L = level(t);
      storm(c, t, S, gy);
      // shop fronts with awnings along the street
      drawCity(c, S.B, gy, "#26304a", (b, i, k, r, v) => v > 0.7, { after: (cc, b, i, bx) => { cc.fillStyle = ["#c0503a", "#3a8a7a", "#c09a3a"][i % 3]; cc.fillRect(bx + 4, -40 * s0, b.w - 8, 8 * s0); cc.fillStyle = "rgba(255,220,150,.6)"; cc.fillRect(bx + 8, -30 * s0, b.w - 16, 26 * s0); } });
      sky(c, ["#3c3c44", "#2c2c34"], gy, H + 10);
      for (let i = 0; i < 4; i++) lamp(c, W * (0.12 + i * 0.26), gy + 4, s0, 1);
      car(c, W * 0.22, H * 0.92, s0 * 1.2, "#8a4a5a", { lights: true }); car(c, W * 0.7, H * 0.9, s0 * 1.2, "#4a6a8a", { flip: true });
      c.fillStyle = "#e8e8e8"; c.fillRect(W * 0.5, H * 0.8, 3 * s0, 40 * s0); c.fillStyle = "#2a5aa8"; c.beginPath(); c.arc(W * 0.5 + 1.5 * s0, H * 0.8, 10 * s0, 0, TAU); c.fill(); c.fillStyle = "#fff"; c.font = `800 ${10 * s0 + 3}px Inter`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("P", W * 0.5 + 1.5 * s0, H * 0.8);
      rainLines(c, phone ? 120 : 260, t, { slant: 0.1, speed: 2.2, col: "rgba(170,200,255,.35)", len: 18 });
      // the water: murky, rippling, with things floating along
      const g = c.createLinearGradient(0, L, 0, H); g.addColorStop(0, "rgba(90,110,120,.88)"); g.addColorStop(1, "rgba(40,55,70,.96)");
      c.fillStyle = g; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W + 20; x += 16) c.lineTo(x, L + Math.sin(x * 0.03 + t * 2.4) * 5); c.lineTo(W, H); c.fill();
      c.strokeStyle = "rgba(200,220,230,.35)"; c.lineWidth = 1.5; for (let i = 0; i < 5; i++) { c.beginPath(); for (let x = 0; x <= W; x += 16) { const y = L + 10 + i * 16 + Math.sin(x * 0.02 + t * 2 + i) * 3; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
      for (let i = 0; i < 18; i++) { const k = (t * 1.5 + i / 18) % 1, x = ((i * 0.618) % 1) * W, y = L + 20 + ((i * 0.37) % 1) * (H - L); c.strokeStyle = `rgba(220,235,255,${0.5 * (1 - k)})`; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, k * 12, k * 3, 0, 0, TAU); c.stroke(); }
      S.float.forEach((f) => { const x = ((f.x + t * f.v) % 1.1) * W, y = L - 2 + Math.sin(t * 2 + f.ph) * 3; c.save(); c.translate(x, y); c.rotate(Math.sin(t + f.ph) * 0.2); if (f.k === 0) { c.fillStyle = "#a07a4a"; c.fillRect(-12 * s0, -8 * s0, 24 * s0, 10 * s0); } else if (f.k === 1) { c.fillStyle = "#ff4a6a"; c.beginPath(); c.arc(0, -4 * s0, 6 * s0, 0, TAU); c.fill(); } else if (f.k === 2) { c.fillStyle = "#3a8a3a"; c.beginPath(); c.ellipse(0, 0, 6 * s0, 2 * s0, 0, 0, TAU); c.fill(); } else { c.fillStyle = "#ffd36b"; c.fillRect(-4 * s0, -10 * s0, 8 * s0, 10 * s0); } c.restore(); });
    },
    // the letters bob along on the floodwater, then lift up into place
    text: {
      at: 4.0, spread: 1.0, dur: 1.0, pre: 0.9, preScale: 0.7, preFade: 0.6, spin: 0.25, glow: "rgba(150,220,255,.9)", ink: ["#e8f8ff", "#9fefff", "#2ef2ff"],
      from(p, S, t) { const x = ((p.r + t * 0.03) % 1) * W, L = level(t); return [x, L - 10 + Math.sin(t * 2.4 + x * 0.03) * 5 + Math.sin(t * 3 + p.q * 9) * 3]; },
    },
    sound(e) { e.rain(0, 7.6, 0.12); e.noise("lowpass", 500, 0.6, 0, 7.6, [[0, 0], [2, 0.25], [7, 0.2], [7.6, 0]]); e.crackle(0.5, 7, 4, 0.03); e.thunder(3.2, 0.35); },
  };

  // ---------------------------------------------------------------- 4. an empty office block on fire, a fire engine standing by
  const fire = {
    D: 8, facts: ["worst"], calm: false, cy: () => H * 0.3,
    init(S) { S.cl = clouds(); S.bx = W * 0.5; S.bw = Math.min(W * (phone ? 0.5 : 0.3), 260); S.bh = H * 0.48; S.fl = Array.from({ length: 80 }, () => ({ x: rnd(-0.5, 0.5), ph: rnd(0, 6), s: rnd(0.5, 1.2) })); S.side = city(0.2, 0.36).filter((b) => b.x + b.w < W / 2 - S.bw / 2 - 10 || b.x > W / 2 + S.bw / 2 + 10); S.smoke = Array.from({ length: 22 }, (_, i) => ({ o: i / 22, x: rnd(-1, 1) })); },
    draw(c, t, S) {
      const gy = H * 0.82, x0 = S.bx - S.bw / 2, top = gy - S.bh;
      sky(c, ["#0a0610", "#2a1218", "#4a1e14"], 0, gy);
      glow(c, S.bx, top, S.bw * 2.4, "rgba(255,110,40,.35)");
      drawCity(c, S.side, gy, "#1a1218", (b, i, k, r, v) => (v > 0.7 ? "rgba(255,190,120,.5)" : false));
      // smoke: thick rolling clouds rising from the roof
      S.smoke.forEach((q) => { const k = (t * 0.12 + q.o) % 1; glow(c, S.bx + q.x * 40 * k + Math.sin(t + q.o * 9) * 30 * k, top - k * H * 0.75, (50 + k * 140) * s0, `rgba(70,64,70,${0.55 * (1 - k)})`); });
      c.fillStyle = "#1c1418"; c.fillRect(x0, top, S.bw, S.bh); c.fillStyle = "#120c10"; c.fillRect(x0 - 6, top - 6, S.bw + 12, 8);
      for (let r = 0; r < 9; r++) for (let k = 0; k < 5; k++) { const burning = r < 4 + Math.floor(t / 3); const lit = burning ? 0.55 + 0.45 * Math.sin(t * 9 + r * 2 + k) : 0.06; c.fillStyle = `rgba(255,${110 + r * 12},40,${lit})`; c.fillRect(x0 + 10 + (k * (S.bw - 20)) / 5, top + 12 + (r * (S.bh - 20)) / 9, (S.bw - 20) / 5 - 10, (S.bh - 20) / 9 - 10); }
      S.fl.forEach((f) => { const h = (70 + 45 * Math.sin(t * 6 + f.ph)) * f.s * (phone ? 0.8 : 1.3), x = S.bx + f.x * S.bw; const g = c.createLinearGradient(0, top - h, 0, top + 10); g.addColorStop(0, "rgba(255,230,120,0)"); g.addColorStop(0.5, "rgba(255,150,40,.75)"); g.addColorStop(1, "rgba(255,80,30,.95)"); c.fillStyle = g; c.beginPath(); c.ellipse(x, top - h / 2 + 8, 12 * f.s, h / 2, 0, 0, TAU); c.fill(); });
      // embers
      for (let i = 0; i < 30; i++) { const k = (t * 0.4 + i / 30) % 1; c.fillStyle = `rgba(255,${150 + (i % 5) * 20},60,${1 - k})`; c.fillRect(S.bx + Math.sin(i * 3.3 + t) * S.bw * 0.6 * k, top - k * H * 0.4, 2, 2); }
      sky(c, ["#1a1214", "#0a0608"], gy, H + 10);
      // a fire engine with flashing lights and a raised ladder spraying water (no one shown near the fire)
      const fx = W * (phone ? 0.1 : 0.16), fy = H * 0.93, fs = s0 * (phone ? 0.8 : 1.1);
      c.fillStyle = "#c0202a"; c.fillRect(fx, fy - 40 * fs, 130 * fs, 32 * fs); c.fillRect(fx + 100 * fs, fy - 54 * fs, 34 * fs, 46 * fs); c.fillStyle = "rgba(170,210,240,.85)"; c.fillRect(fx + 106 * fs, fy - 50 * fs, 22 * fs, 14 * fs);
      c.fillStyle = "#f0f0f0"; c.fillRect(fx, fy - 24 * fs, 100 * fs, 4 * fs); c.fillStyle = "#14121a"; [18, 60, 112].forEach((d) => { c.beginPath(); c.arc(fx + d * fs, fy - 6 * fs, 10 * fs, 0, TAU); c.fill(); });
      const fl = Math.sin(t * 14) > 0; c.fillStyle = fl ? "#ff3a3a" : "#3a7aff"; c.fillRect(fx + 108 * fs, fy - 60 * fs, 18 * fs, 6 * fs); glow(c, fx + 117 * fs, fy - 58 * fs, 70 * fs, fl ? "rgba(255,60,60,.45)" : "rgba(60,120,255,.45)");
      c.strokeStyle = "#c8c8d0"; c.lineWidth = 4 * fs; c.beginPath(); const lx = fx + 40 * fs, ly = fy - 40 * fs, la = -0.75, ll = Math.min(W * 0.25, 220 * fs); c.moveTo(lx, ly); c.lineTo(lx + Math.cos(la) * ll, ly + Math.sin(la) * ll); c.stroke(); c.lineWidth = 1.5; for (let i = 1; i < 10; i++) { const px = lx + Math.cos(la) * ll * i / 10, py = ly + Math.sin(la) * ll * i / 10; c.beginPath(); c.moveTo(px - 4, py - 4); c.lineTo(px + 4, py + 4); c.stroke(); }
      const nx = lx + Math.cos(la) * ll, ny = ly + Math.sin(la) * ll; c.strokeStyle = "rgba(170,220,255,.55)"; c.lineWidth = 3; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(nx, ny); c.quadraticCurveTo(lerp(nx, x0, 0.5), ny - 40 * fs - i * 6, x0 + 10 + i * 6, top + S.bh * 0.3 + i * 8); c.stroke(); }
      // a fire hydrant
      c.fillStyle = "#e0b020"; const hx = W * 0.8, hy = H * 0.9; c.fillRect(hx - 7 * s0, hy - 22 * s0, 14 * s0, 22 * s0); c.beginPath(); c.arc(hx, hy - 22 * s0, 7 * s0, Math.PI, TAU); c.fill(); c.fillRect(hx - 11 * s0, hy - 16 * s0, 22 * s0, 5 * s0);
    },
    // the letters ride up in the smoke, curling as they rise, then settle
    text: {
      at: 3.4, spread: 1.2, dur: 1.2, pre: 0.8, preScale: 0.6, preFade: 0.8, spin: 0.5, ease: (k) => easeIO(k), glow: "rgba(255,150,80,.7)", ink: ["#f1eeff", "#ffd2b0", "#ffb38a"],
      from(p, S, t) { const top = H * 0.82 - H * 0.48, k = ((t - 0.8) * 0.18 + p.q * 0.4) % 1; return [W * 0.5 + Math.sin(t * 1.5 + p.r * 9) * 40 * (0.3 + k) + (p.r - 0.5) * 60, top - 20 - k * H * 0.3]; },
    },
    sound(e) { e.noise("bandpass", 700, 0.5, 0, 8, [[0, 0.1], [7.5, 0.12], [8, 0]]); e.crackle(0, 8, 14, 0.08); e.rumble(0, 8, 0.15); for (let i = 0; i < 8; i++) { e.osc("sine", 760, 0.4 + i * 0.9, 0.45, 0.025, 960); } e.noise("highpass", 2500, 0.5, 1, 7, [[1, 0], [1.5, 0.05], [7.5, 0.05], [8, 0]]); },
  };

  return [treeCh, outage, flood, fire];
});
