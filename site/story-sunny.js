// Sunny story: surfers at the beach -> pan up to hot air balloons, a blimp, a paraglider and a skywriting
// plane -> a goal in a packed stadium -> two horses reach a summit at sunset -> fireworks over the river.
WXS.add("sunny", (K) => {
  const { W, H, rnd, clamp, ease, easeIO, lerp, TAU, sky, glow, ridge, hill, cloud, person, palm, pine, city, drawCity } = K;
  const s0 = Math.min(W, H) / 700, phone = W < 600;

  // ---------------------------------------------------------------- 1. beach, then up into the sky
  const cam = (t) => easeIO((t - 1.7) / 1.7) * H * 0.78;
  const planeX = (t) => lerp(-0.12, 1.12, (t - 3.3) / 3.4) * W;
  function balloon(c, x, y, s, cols, t) {
    const r = 34 * s;
    c.save(); c.translate(x, y + Math.sin(t * 0.8 + x) * 4 * s);
    // envelope: vertical gores
    const n = 8;
    for (let i = 0; i < n; i++) { const u0 = -1 + (2 * i) / n, u1 = -1 + (2 * (i + 1)) / n; c.fillStyle = cols[i % cols.length]; c.beginPath(); for (let k = 0; k <= 16; k++) { const v = -1 + (2 * k) / 16, w = Math.sqrt(Math.max(0, 1 - v * v)) * (v > 0 ? 1 - v * 0.35 : 1); c.lineTo(u0 * w * r, v * r * 1.15); } for (let k = 16; k >= 0; k--) { const v = -1 + (2 * k) / 16, w = Math.sqrt(Math.max(0, 1 - v * v)) * (v > 0 ? 1 - v * 0.35 : 1); c.lineTo(u1 * w * r, v * r * 1.15); } c.fill(); }
    c.fillStyle = "rgba(255,255,255,.25)"; c.beginPath(); c.ellipse(-r * 0.35, -r * 0.4, r * 0.2, r * 0.45, 0.2, 0, TAU); c.fill();
    c.strokeStyle = "#5a4a3a"; c.lineWidth = 1.2 * s; c.beginPath(); c.moveTo(-r * 0.45, r * 1.05); c.lineTo(-7 * s, r * 1.6); c.moveTo(r * 0.45, r * 1.05); c.lineTo(7 * s, r * 1.6); c.stroke();
    c.fillStyle = "#8a5a2a"; c.fillRect(-8 * s, r * 1.6, 16 * s, 11 * s); c.fillStyle = "#6a4020"; c.fillRect(-8 * s, r * 1.6, 16 * s, 2.5 * s);
    c.fillStyle = "#e8b48a"; c.beginPath(); c.arc(-3 * s, r * 1.6 - 2 * s, 3 * s, 0, TAU); c.arc(4 * s, r * 1.6 - 2 * s, 3 * s, 0, TAU); c.fill();
    c.restore();
  }
  function blimp(c, x, y, s) {
    c.save(); c.translate(x, y);
    const g = c.createLinearGradient(0, -30 * s, 0, 30 * s); g.addColorStop(0, "#f4f6fb"); g.addColorStop(1, "#a9aec0"); c.fillStyle = g;
    c.beginPath(); c.ellipse(0, 0, 100 * s, 30 * s, 0, 0, TAU); c.fill();
    c.fillStyle = "#6b5cff"; c.beginPath(); c.ellipse(0, 4 * s, 96 * s, 7 * s, 0, 0, TAU); c.fill(); c.fillStyle = "#ff4fd8"; c.beginPath(); c.ellipse(0, 10 * s, 88 * s, 3 * s, 0, 0, TAU); c.fill();
    c.fillStyle = "#9aa0b4"; [[1, -1], [1, 1]].forEach(([, sy]) => { c.beginPath(); c.moveTo(78 * s, 0); c.lineTo(108 * s, sy * 26 * s); c.lineTo(114 * s, sy * 26 * s); c.lineTo(98 * s, 0); c.fill(); });
    c.fillStyle = "#d8dce8"; c.beginPath(); c.roundRect ? c.roundRect(-22 * s, 26 * s, 40 * s, 12 * s, 4 * s) : c.rect(-22 * s, 26 * s, 40 * s, 12 * s); c.fill();
    c.fillStyle = "#3a4a6a"; for (let i = 0; i < 4; i++) c.fillRect(-18 * s + i * 9 * s, 29 * s, 6 * s, 5 * s);
    c.restore();
  }
  function paraglider(c, x, y, s, t) {
    c.save(); c.translate(x, y); c.rotate(Math.sin(t * 0.9) * 0.06);
    // the wing: an arc of coloured cells
    const cols = ["#ff4fd8", "#ffd36b", "#2ef2ff", "#ff4fd8", "#ffd36b", "#2ef2ff", "#ff4fd8"];
    for (let i = 0; i < 7; i++) { const a0 = Math.PI * 1.16 + (i / 7) * Math.PI * 0.68, a1 = a0 + Math.PI * 0.68 / 7; c.fillStyle = cols[i]; c.beginPath(); c.arc(0, 0, 70 * s, a0, a1); c.arc(0, 0, 56 * s, a1, a0, true); c.fill(); }
    c.strokeStyle = "rgba(255,255,255,.75)"; c.lineWidth = 0.8; c.beginPath(); for (let i = 0; i <= 6; i++) { const a = Math.PI * 1.18 + (i / 6) * Math.PI * 0.64; c.moveTo(Math.cos(a) * 57 * s, Math.sin(a) * 57 * s); c.lineTo(0, 22 * s); } c.stroke();
    // the pilot sitting in a harness, hands up on the brake lines
    person(c, -4 * s, 66 * s, s * 0.85, { top: "#3a3070", legs: "#2a2350", lean: -0.25, legB: [1.35, -0.2], legF: [1.25, -0.15], armB: [Math.PI - 0.5, 0.2], armF: [Math.PI - 0.3, 0.1], cap: "#ff4fd8" });
    c.fillStyle = "#1a1530"; c.beginPath(); c.ellipse(0, 40 * s, 12 * s, 7 * s, 0.2, 0, TAU); c.fill();
    c.restore();
  }
  function plane(c, x, y, s) {
    c.save(); c.translate(x, y);
    c.fillStyle = "#ff3b5c"; c.beginPath(); c.moveTo(28 * s, 0); c.quadraticCurveTo(20 * s, -7 * s, -10 * s, -4 * s); c.lineTo(-26 * s, -2 * s); c.lineTo(-26 * s, 3 * s); c.quadraticCurveTo(0, 6 * s, 28 * s, 0); c.fill();
    c.fillStyle = "#e02a48"; c.fillRect(-4 * s, -2 * s, 12 * s, 3 * s); c.beginPath(); c.moveTo(4 * s, 0); c.lineTo(-6 * s, -22 * s); c.lineTo(-12 * s, -22 * s); c.lineTo(-6 * s, 0); c.fill(); c.beginPath(); c.moveTo(4 * s, 1); c.lineTo(-2 * s, 14 * s); c.lineTo(-8 * s, 14 * s); c.lineTo(-6 * s, 1); c.fill();
    c.beginPath(); c.moveTo(-20 * s, -2 * s); c.lineTo(-28 * s, -12 * s); c.lineTo(-24 * s, -2 * s); c.fill();
    c.fillStyle = "rgba(170,210,240,.9)"; c.beginPath(); c.ellipse(10 * s, -4 * s, 6 * s, 3 * s, 0, 0, TAU); c.fill();
    c.fillStyle = "rgba(60,60,70,.4)"; c.fillRect(28 * s, -10 * s, 2 * s, 20 * s);
    c.restore();
  }
  function surfer(c, x, y, s, t, col, ph) {
    c.save(); c.translate(x, y); c.rotate(Math.sin(t * 2 + ph) * 0.12 - 0.15);
    c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 32 * s, 5 * s, 0, 0, TAU); c.fill(); c.fillStyle = "rgba(255,255,255,.6)"; c.fillRect(-26 * s, -1 * s, 52 * s, 1.5 * s);
    person(c, 0, -2 * s, s * 0.8, { top: "#14304a", legs: "#14304a", skin: "#d9a07a", hair: "#e8c070", lean: 0.35, legB: [-0.6, 1.0], legF: [0.7, -1.0], armB: [-1.8, 0.2], armF: [1.6, 0.3], shoes: false });
    c.restore();
  }
  const skywriter = {
    D: 9, facts: ["market"], cy: () => H * 0.36,
    init(S) {
      S.cl = Array.from({ length: 7 }, (_, i) => ({ x: rnd(0, 1), y: rnd(-0.75, 0.25), r: rnd(28, 54) * s0, sd: i }));
      S.bal = [[0.12, -0.42, ["#ff4fd8", "#ffd36b"]], [0.88, -0.5, ["#2ef2ff", "#6b5cff"]], [0.7, -0.14, ["#ff7a3b", "#ffe9a8"]]];
      if (phone) S.bal = [[0.15, -0.5, ["#ff4fd8", "#ffd36b"]], [0.85, -0.12, ["#2ef2ff", "#6b5cff"]]];
    },
    draw(c, t, S) {
      const cy = cam(t), hz = H * 0.44;
      c.save(); c.translate(0, cy);
      sky(c, ["#1e78d8", "#3a9cf0", "#7cc6ff", "#cfeeff"], -H * 0.85, hz);
      S.cl.forEach((q) => cloud(c, ((q.x * W + t * 10) % (W + 300)) - 150, q.y * H, q.r, "rgba(255,255,255,.92)", 5, q.sd));
      // sea with rolling swell and breaking waves
      const g = c.createLinearGradient(0, hz, 0, H * 0.72); g.addColorStop(0, "#1a6fb8"); g.addColorStop(1, "#38b6d8"); c.fillStyle = g; c.fillRect(0, hz, W, H * 0.3);
      for (let i = 0; i < 7; i++) { const y = hz + Math.pow(i / 7, 1.4) * H * 0.27 + 6, a = 0.25 + i * 0.07; c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = 1 + i * 0.5; c.beginPath(); for (let x = 0; x <= W; x += 14) { const yy = y + Math.sin(x * (0.02 - i * 0.002) + t * (1.4 + i * 0.1) + i) * (2 + i); x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); }
      // a wave rolling in, with surfers riding it
      const wy = H * 0.6, wv = (x) => wy - Math.max(0, Math.sin((x / W) * Math.PI * 1.2 - t * 0.6)) * 26 * s0;
      c.fillStyle = "#2a8ac0"; c.beginPath(); c.moveTo(0, wy + 20); for (let x = 0; x <= W; x += 10) c.lineTo(x, wv(x)); c.lineTo(W, wy + 20); c.fill();
      c.strokeStyle = "#fff"; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= W; x += 10) c[x ? "lineTo" : "moveTo"](x, wv(x)); c.stroke();
      [[0.28, "#ffd36b", 0], [0.55, "#ff4fd8", 2], [0.8, "#2ef2ff", 4]].slice(0, phone ? 2 : 3).forEach(([u, col, ph]) => { const x = (u + t * 0.03) % 1 * W; surfer(c, x, wv(x) + 2, s0 * 1.05, t, col, ph); });
      // sand, shoreline foam, umbrella, towel, sandcastle, palm
      const sg = c.createLinearGradient(0, H * 0.7, 0, H); sg.addColorStop(0, "#f2d79e"); sg.addColorStop(1, "#e2bb78"); c.fillStyle = sg; c.beginPath(); c.moveTo(0, H + 10); c.lineTo(0, H * 0.72); for (let x = 0; x <= W; x += 16) c.lineTo(x, H * 0.72 + Math.sin(x * 0.02 + t * 1.5) * 4); c.lineTo(W, H + 10); c.fill();
      c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= W; x += 16) c[x ? "lineTo" : "moveTo"](x, H * 0.72 + Math.sin(x * 0.02 + t * 1.5) * 4); c.stroke();
      const ux = W * 0.22, uy = H * 0.9; c.strokeStyle = "#eee"; c.lineWidth = 3 * s0; c.beginPath(); c.moveTo(ux, uy); c.lineTo(ux + 6 * s0, uy - 80 * s0); c.stroke();
      ["#ff4fd8", "#fff", "#ff4fd8", "#fff", "#ff4fd8"].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.moveTo(ux + 6 * s0, uy - 84 * s0); c.arc(ux + 6 * s0, uy - 76 * s0, 56 * s0, Math.PI + (i / 5) * Math.PI, Math.PI + ((i + 1) / 5) * Math.PI); c.fill(); });
      c.fillStyle = "#2ec7d9"; c.fillRect(ux + 20 * s0, uy - 6 * s0, 70 * s0, 22 * s0); c.fillStyle = "#fff"; c.fillRect(ux + 20 * s0, uy + 2 * s0, 70 * s0, 4 * s0);
      c.fillStyle = "#d9b070"; const cx0 = W * 0.6, cy0 = H * 0.92; c.fillRect(cx0 - 24 * s0, cy0 - 18 * s0, 48 * s0, 18 * s0); c.fillRect(cx0 - 10 * s0, cy0 - 34 * s0, 20 * s0, 16 * s0); [-24, -8, 8, 24 - 6].forEach((d) => c.fillRect(cx0 + d * s0, cy0 - 24 * s0, 6 * s0, 6 * s0)); c.strokeStyle = "#333"; c.lineWidth = 1; c.beginPath(); c.moveTo(cx0, cy0 - 34 * s0); c.lineTo(cx0, cy0 - 50 * s0); c.stroke(); c.fillStyle = "#ff3b5c"; c.fillRect(cx0, cy0 - 50 * s0, 10 * s0, 6 * s0);
      palm(c, W * 0.93, H * 0.97, s0 * 1.4, t);
      // up in the sky
      S.bal.forEach(([u, v, cols], i) => balloon(c, (u + Math.sin(t * 0.2 + i) * 0.01) * W, v * H, s0 * (phone ? 0.85 : 1.1) * (i === 2 ? 0.75 : 1), cols, t));
      blimp(c, lerp(W * 1.15, W * 0.45, t / 9), -H * 0.71, s0 * (phone ? 0.75 : 1));
      paraglider(c, lerp(W * 0.18, W * 0.34, t / 9), -H * 0.08 + Math.sin(t) * 8, s0 * (phone ? 0.85 : 1));
      c.restore();
      // the sun: big and bright, drifting down a little as we look up
      const sx = W * (phone ? 0.82 : 0.86), sy = H * 0.12 + cy * 0.12, sr = Math.min(W, H) * 0.07;
      glow(c, sx, sy, sr * 6, "rgba(255,240,170,.55)");
      c.save(); c.translate(sx, sy); c.rotate(t * 0.15); c.fillStyle = "rgba(255,230,140,.35)"; for (let i = 0; i < 12; i++) { c.rotate(TAU / 12); c.beginPath(); c.moveTo(sr * 1.2, -sr * 0.12); c.lineTo(sr * 2.3, 0); c.lineTo(sr * 1.2, sr * 0.12); c.fill(); } c.restore();
      c.fillStyle = "#fff6c8"; c.beginPath(); c.arc(sx, sy, sr, 0, TAU); c.fill(); c.fillStyle = "#ffe27a"; c.beginPath(); c.arc(sx, sy, sr * 0.86, 0, TAU); c.fill();
      // the skywriting plane
      const px = planeX(t), py = H * 0.36 + H * 0.12 + Math.sin(t * 2) * 5;
      if (t > 3.2 && px < W + 60) plane(c, px, py, s0 * 1.1);
    },
    // the plane writes the fact in puffs of smoke
    text: {
      mode: "dots", at: 3.3, spread: 3.4, dur: 0.45, crisp: 0.75, halo: 0.45, glow: "rgba(255,255,255,.8)", ink: ["#ffffff", "#f0f6ff", "#dff0ff"], gap: phone ? 3 : 4, max: 1700,
      delay: (p) => clamp(p.tx / W + 0.12) / 1.24 * 3.4, from: (p) => [p.tx - 18, H * 0.48],
      dot(c, p, x, y, k, t, S, a = 1) { if (k < 0) return; const r = (1.4 + k * 1.6 + p.r) * (phone ? 0.8 : 1); c.fillStyle = `rgba(255,255,255,${0.85 * Math.max(a, 0.6)})`; c.beginPath(); c.arc(x + Math.sin(t + p.q * 9) * 1.5, y + Math.cos(t * 0.8 + p.r * 9) * 1.5, r, 0, TAU); c.fill(); },
      ease: (k) => ease(k),
    },
    sound(e) { e.waves(0, 3.5, 0.25, 2.4); e.gull(0.6, 0.03); e.whoosh(1.6, 1.6, 0.1); e.engine(3.1, 4, 0.06, 95); e.wind(3, 6, 0.04, 600, 900); },
  };

  // ---------------------------------------------------------------- 2. the goal
  const goal = {
    D: 8, facts: ["best"], cy: () => H * (phone ? 0.66 : 0.7),
    init(S) {
      const cols = ["#ff4fd8", "#2ef2ff", "#ffd36b", "#f5f5f5", "#6b5cff"];
      S.fans = []; const rows = 9;
      for (let r = 0; r < rows; r++) { const y = H * 0.07 + r * H * 0.034, n = Math.floor(W / (phone ? 9 : 11)); for (let i = 0; i < n; i++) S.fans.push({ x: (i + (r % 2) * 0.5) * (W / n), y, c: cols[(i * 7 + r * 3) % 5], sk: ["#f2c9a0", "#c98a5a", "#8a5a3a", "#e8b48a"][(i + r) % 4], ph: rnd(0, 6), r: 3.2 + r * 0.25 }); }
      S.conf = Array.from({ length: 140 }, () => ({ x: Math.random() * W, v: rnd(50, 140), ph: rnd(0, 6), c: cols[Math.floor(rnd(0, 5))] }));
    },
    G: () => ({ gx: W * 0.5, gy: H * 0.56, gw: Math.min(W * (phone ? 0.62 : 0.36), 420), gh: Math.min(W * (phone ? 0.62 : 0.36), 420) * 0.32 }),
    ball(t) { const { gx, gy, gw, gh } = this.G(), k = clamp((t - 0.9) / 0.85); const z = 1 - Math.pow(1 - k, 1.4); const x = lerp(W * 0.5, gx + gw * 0.38, z) + Math.sin(z * Math.PI) * W * 0.05, ground = lerp(H * 0.95, gy, z), hgt = Math.sin(z * Math.PI * 0.62) * gh * 1.05; return { x, y: ground - hgt, ground, r: lerp(18, 6.5, z) * (phone ? 0.8 : 1), k }; },
    draw(c, t, S) {
      const { gx, gy, gw, gh } = this.G(), scored = t > 1.75, cheer = scored ? 1 : 0;
      // stands, roof and floodlights
      sky(c, ["#06061a", "#141436"], 0, H * 0.4);
      c.fillStyle = "#1e1e3a"; c.fillRect(0, H * 0.04, W, H * 0.33);
      S.fans.forEach((f) => {
        const j = cheer ? Math.abs(Math.sin(t * 9 + f.ph)) * 5 : Math.sin(t * 2 + f.ph) * 0.6, y = f.y - j;
        c.fillStyle = f.c; c.fillRect(f.x - f.r, y, f.r * 2, f.r * 1.6);
        c.fillStyle = f.sk; c.beginPath(); c.arc(f.x, y - f.r * 0.6, f.r * 0.75, 0, TAU); c.fill();
        if (cheer && Math.sin(f.ph * 3) > -0.3) { c.strokeStyle = f.sk; c.lineWidth = 1.4; c.beginPath(); c.moveTo(f.x - f.r, y); c.lineTo(f.x - f.r * 1.6, y - f.r * 2.2); c.moveTo(f.x + f.r, y); c.lineTo(f.x + f.r * 1.6, y - f.r * 2.2); c.stroke(); }
      });
      c.fillStyle = "#0c0c22"; c.beginPath(); c.moveTo(0, 0); c.lineTo(W, 0); c.lineTo(W, H * 0.045); c.lineTo(0, H * 0.06); c.fill();
      [0.08, 0.92].forEach((u) => { glow(c, u * W, H * 0.02, 180 * s0, "rgba(255,255,235,.75)"); c.fillStyle = "#fffbe0"; c.fillRect(u * W - 18 * s0, H * 0.01, 36 * s0, 8 * s0); });
      // the big screen
      const sw = Math.min(W * 0.22, 200), sx = W / 2 - sw / 2, sy = H * 0.005; c.fillStyle = "#08081a"; c.fillRect(sx, sy, sw, H * 0.045); c.fillStyle = scored && Math.sin(t * 12) > -0.2 ? "#ffd36b" : "#2ef2ff"; c.font = `900 ${H * 0.03}px Inter, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(scored ? "GOAL!" : "1 – 1  89'", W / 2, sy + H * 0.025);
      // boards along the touchline
      c.fillStyle = "#0e0e24"; c.fillRect(0, H * 0.37, W, H * 0.035); for (let i = 0; i < 6; i++) { c.fillStyle = ["#6b5cff", "#ff4fd8", "#2ef2ff"][(i + Math.floor(t * 1.5)) % 3]; c.globalAlpha = 0.8; c.fillRect((i / 6) * W + 4, H * 0.375, W / 6 - 8, H * 0.025); } c.globalAlpha = 1;
      // the pitch in perspective
      const top = H * 0.405; for (let i = 0; i < 10; i++) { const y0 = top + Math.pow(i / 10, 1.6) * (H - top), y1 = top + Math.pow((i + 1) / 10, 1.6) * (H - top); c.fillStyle = i % 2 ? "#2f8f3a" : "#38a046"; c.fillRect(0, y0, W, y1 - y0 + 1); }
      c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, gy + 2); c.lineTo(W, gy + 2);
      const bw = gw * 2.1, bw2 = gw * 3.1; c.moveTo(gx - bw / 2, gy + 2); c.lineTo(gx - bw2 / 2, H * 0.8); c.lineTo(gx + bw2 / 2, H * 0.8); c.lineTo(gx + bw / 2, gy + 2);
      c.moveTo(gx - gw * 0.85, gy + 2); c.lineTo(gx - gw * 1.05, gy + H * 0.06); c.lineTo(gx + gw * 1.05, gy + H * 0.06); c.lineTo(gx + gw * 0.85, gy + 2); c.stroke();
      c.fillStyle = "#fff"; c.beginPath(); c.ellipse(W * 0.5, H * 0.95, 4, 2, 0, 0, TAU); c.fill();
      // the net (bulges where the ball goes in)
      const B = this.ball(t), hitX = gx + gw * 0.38, bul = scored && t < 2.9 ? Math.sin(clamp((t - 1.75) / 1.1) * Math.PI) * 22 * s0 : 0;
      c.strokeStyle = "rgba(255,255,255,.4)"; c.lineWidth = 1;
      for (let i = 0; i <= 18; i++) { const x = gx - gw / 2 + (i * gw) / 18, d = Math.exp(-Math.pow((x - hitX) / (gw * 0.18), 2)) * bul; c.beginPath(); c.moveTo(x, gy - gh); c.quadraticCurveTo(x + d * 0.3, gy - gh / 2 - d, x, gy); c.stroke(); }
      for (let j = 1; j < 6; j++) { const y = gy - gh + (j * gh) / 6; c.beginPath(); c.moveTo(gx - gw / 2, y); for (let i = 0; i <= 18; i++) { const x = gx - gw / 2 + (i * gw) / 18, d = Math.exp(-Math.pow((x - hitX) / (gw * 0.18), 2) - Math.pow((y - (gy - gh * 0.75)) / (gh * 0.5), 2)) * bul; c.lineTo(x, y - d * 0.6); } c.stroke(); }
      // the keeper: ready, then a full-stretch dive the wrong way
      const dive = clamp((t - 1.1) / 0.55), dx = -ease(dive) * gw * 0.32, dy = -Math.sin(dive * Math.PI) * gh * 0.35 + (dive >= 1 ? clamp((t - 1.65) / 0.3) * gh * 0.25 : 0), ks = s0 * (phone ? 0.95 : 1.2);
      person(c, gx + dx, gy + dy, ks, { top: "#ffd000", sleeve: "#ffd000", legs: "#1a1a1a", glove: "#2ef2ff", hair: "#2a1a10", rot: -dive * 1.25, lean: 0, legB: [0.35 - dive * 0.2, 0.2], legF: [-0.35 - dive * 0.3, 0.3], armB: [lerp(-0.9, Math.PI - 0.2, dive), lerp(0.4, 0, dive)], armF: [lerp(0.9, Math.PI + 0.25, dive), lerp(-0.4, 0, dive)] });
      // posts in front of the keeper
      c.strokeStyle = "#fff"; c.lineWidth = 6 * s0; c.lineCap = "square"; c.beginPath(); c.moveTo(gx - gw / 2, gy + 2); c.lineTo(gx - gw / 2, gy - gh); c.lineTo(gx + gw / 2, gy - gh); c.lineTo(gx + gw / 2, gy + 2); c.stroke();
      // the ball, with its shadow on the grass
      if (t < 3.2) {
        const bx = scored ? lerp(hitX, hitX - 6, clamp((t - 1.75) / 0.6)) : B.x, by = scored ? lerp(gy - gh * 0.72, gy - 4, ease((t - 1.75) / 0.7)) : B.y, br = B.r;
        c.fillStyle = "rgba(0,0,0,.3)"; c.beginPath(); c.ellipse(scored ? bx : B.x, scored ? gy : B.ground, br * 0.9, br * 0.3, 0, 0, TAU); c.fill();
        c.save(); c.translate(bx, by); c.rotate(t * 14); c.fillStyle = "#fff"; c.beginPath(); c.arc(0, 0, br, 0, TAU); c.fill();
        c.fillStyle = "#1a1a2a"; for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU; c.beginPath(); c.arc(Math.cos(a) * br * 0.62, Math.sin(a) * br * 0.62, br * 0.22, 0, TAU); c.fill(); } c.beginPath(); c.arc(0, 0, br * 0.26, 0, TAU); c.fill(); c.restore();
        if (t < 1.75 && t > 0.9) { c.strokeStyle = "rgba(255,255,255,.25)"; c.lineWidth = br * 0.8; c.beginPath(); const b2 = this.ball(t - 0.06); c.moveTo(b2.x, b2.y); c.lineTo(bx, by); c.stroke(); }
      }
      if (scored) S.conf.forEach((p) => { c.fillStyle = p.c; c.save(); c.translate(p.x + Math.sin(t * 3 + p.ph) * 12, ((t - 1.75) * p.v) % H); c.rotate(t * 4 + p.ph); c.fillRect(-2, -4, 4, 8); c.restore(); });
    },
    // the letters burst out of the net and bounce into place
    text: { at: 2.6, spread: 0.8, dur: 1.1, arc: H * 0.18, startScale: 0.3, spin: 1.4, glow: "rgba(255,210,90,.9)", ink: ["#ffd36b", "#ff4fd8", "#2ef2ff"], from: (p) => [W * 0.5 + Math.min(W * 0.36, 420) * (0.38 + (p.r - 0.5) * 0.25), H * 0.56 - 30] },
    sound(e) { e.crowd(0, 8, 0.22, 1.75); e.kick(0.9, 0.6); e.noise("bandpass", 600, 1, 1.75, 0.3, [[1.75, 0], [1.76, 0.3], [2.05, 0]]); e.whistle(3.0, 0.05); e.melody([392, 392, 440, 392, 523, 494], 3.8, 0.32, 0.03, "square", 0.7); },
  };

  // ---------------------------------------------------------------- 3. two horses reach the summit at sunset
  function horse(c, x, gy, s, t, walk, o = {}) {
    c.save(); c.translate(x, gy); if (o.slope) c.rotate(o.slope); c.scale((o.dir || 1) * s, s);
    const ph = t * 5.2 + (o.ph || 0), bob = Math.sin(ph * 2) * 1.2 * walk, col = o.col || "#140a16", far = o.far || "#2a1a2a";
    c.lineCap = "round"; c.lineJoin = "round";
    const hip = [-34, -66 + bob], shd = [28, -66 + bob];
    const leg = (anc, off, front, cl) => {
      const a = ph + off * TAU, fx = anc[0] + (front ? 4 : -2) + Math.sin(a) * 15 * walk, fy = -Math.max(0, Math.cos(a)) * 9 * walk;
      const l1 = 30, l2 = 36, dx = fx - anc[0], dy = fy - anc[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - 0.5), b = Math.atan2(dy, dx), A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1)), ja = front ? b - A * 0.6 : b + A;
      const j = [anc[0] + Math.cos(ja) * l1, anc[1] + Math.sin(ja) * l1];
      c.strokeStyle = cl; c.lineWidth = front ? 9 : 12; c.beginPath(); c.moveTo(...anc); c.lineTo(...j); c.stroke();
      c.lineWidth = 5; c.beginPath(); c.moveTo(...j); c.lineTo(fx, fy - 3); c.stroke(); c.fillStyle = cl; c.fillRect(fx - 4, fy - 5, 8, 5);
    };
    leg(hip, 0.5, false, far); leg(shd, 0, true, far);
    // tail
    c.strokeStyle = col; c.lineWidth = 7; c.beginPath(); c.moveTo(-46, -78 + bob); c.quadraticCurveTo(-62, -64 + Math.sin(t * 3) * 3, -58 + Math.sin(t * 2) * 4, -34); c.stroke(); c.lineWidth = 4; c.beginPath(); c.moveTo(-48, -74 + bob); c.quadraticCurveTo(-58, -60, -52 + Math.sin(t * 2.4) * 4, -30); c.stroke();
    // body
    c.fillStyle = col; c.beginPath(); c.moveTo(34, -64 + bob);
    c.bezierCurveTo(36, -80 + bob, 28, -86 + bob, 18, -86 + bob); c.bezierCurveTo(4, -80 + bob, -16, -80 + bob, -30, -84 + bob); c.bezierCurveTo(-46, -84 + bob, -52, -72 + bob, -50, -60 + bob);
    c.bezierCurveTo(-48, -52 + bob, -40, -48 + bob, -30, -50 + bob); c.bezierCurveTo(-10, -48 + bob, 10, -48 + bob, 22, -52 + bob); c.bezierCurveTo(30, -54 + bob, 34, -58 + bob, 34, -64 + bob); c.fill();
    // neck and head (o.head lowers it to graze, raises it to look)
    c.save(); c.translate(24, -80 + bob); c.rotate(o.head || 0);
    c.beginPath(); c.moveTo(-8, -2); c.bezierCurveTo(2, -20, 12, -32, 22, -38); c.lineTo(28, -40); c.bezierCurveTo(34, -36, 42, -22, 45, -15); c.bezierCurveTo(46, -10, 40, -8, 35, -10); c.bezierCurveTo(30, -14, 26, -18, 22, -20); c.bezierCurveTo(18, -12, 14, 0, 12, 16); c.lineTo(-6, 10); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(22, -37); c.lineTo(20, -48); c.lineTo(26, -39); c.fill();
    c.strokeStyle = col; c.lineWidth = 3; for (let i = 0; i < 7; i++) { const k = i / 6, mx = lerp(-6, 20, k), my = lerp(-4, -38, k); c.beginPath(); c.moveTo(mx, my); c.lineTo(mx - 7 + Math.sin(t * 3 + i) * 1.5, my + 6); c.stroke(); }
    c.restore();
    leg(hip, 0, false, col); leg(shd, 0.5, true, col);
    c.restore();
  }
  const mtn = {
    D: 8.4, facts: ["call"], cy: () => H * (phone ? 0.2 : 0.22),
    init(S) {
      S.r1 = ridge(2.1, H * 0.06, H * 0.5); S.r2 = ridge(5.3, H * 0.05, H * 0.58); S.r3 = ridge(8.8, H * 0.04, H * 0.66);
      S.cl = Array.from({ length: 6 }, (_, i) => ({ x: rnd(0, 1), y: rnd(0.08, 0.32), r: rnd(30, 60) * s0, sd: i }));
      S.trees = Array.from({ length: phone ? 10 : 18 }, () => ({ u: Math.random(), s: rnd(0.4, 0.8) }));
      S.peak = [W * (phone ? 0.52 : 0.46), H * 0.6];
    },
    path(u) { const [px, py] = this.S_peak; const x = lerp(-W * 0.05, px, u), y = lerp(H * 0.95, py, Math.pow(u, 0.9)); return [x, y]; },
    draw(c, t, S) {
      this.S_peak = S.peak; const sunY = lerp(H * 0.5, H * 0.56, t / 8.4), sx = W * (phone ? 0.78 : 0.74), sr = Math.min(W, H) * 0.075;
      sky(c, ["#2a1650", "#7a2a6a", "#d2506a", "#ff9a4a", "#ffd27a"], 0, H * 0.66);
      glow(c, sx, sunY, H * 0.65, "rgba(255,170,90,.45)");
      S.cl.forEach((q, i) => cloud(c, q.x * W + Math.sin(t * 0.2 + i) * 8, q.y * H, q.r, i % 2 ? "rgba(255,150,140,.55)" : "rgba(190,90,140,.5)", 5, q.sd));
      c.fillStyle = "#fff0b8"; c.beginPath(); c.arc(sx, sunY, sr, 0, TAU); c.fill(); glow(c, sx, sunY, sr * 1.6, "rgba(255,240,190,.6)");
      // hazy ranges, each darker and nearer
      hill(c, S.r1, "rgba(150,60,110,.85)"); hill(c, S.r2, "rgba(100,40,90,.92)"); hill(c, S.r3, "#4a1f4a");
      // the near ridge, rising to a summit, with pines
      const [px, py] = S.peak; c.fillStyle = "#1e0c22"; c.beginPath(); c.moveTo(-20, H + 10); c.lineTo(-20, H * 0.95); c.quadraticCurveTo(px * 0.6, H * 0.8, px, py); c.quadraticCurveTo(px + W * 0.12, py + H * 0.04, W + 20, H * 0.82); c.lineTo(W + 20, H + 10); c.fill();
      S.trees.forEach((q) => { const x = q.u * W, y = x < px ? lerp(H * 0.95, py, Math.pow(x / px, 1.4)) + 30 * s0 : lerp(py, H * 0.82, (x - px) / (W - px)) + 30 * s0; if (Math.abs(x - px) > W * 0.07) pine(c, x, y + 10 * s0, s0 * q.s * 1.4, "#140818"); });
      // rim light along the ridge
      c.strokeStyle = "rgba(255,170,110,.5)"; c.lineWidth = 2; c.beginPath(); c.moveTo(px - W * 0.2, py + H * 0.09); c.quadraticCurveTo(px - W * 0.08, py + H * 0.02, px, py); c.quadraticCurveTo(px + W * 0.05, py + H * 0.015, px + W * 0.12, py + H * 0.04); c.stroke();
      // the horses walk up and stop at the top, one looks at the sun, one grazes
      const k = clamp(t / 4.2), hs = s0 * (phone ? 0.5 : 0.62);
      [0, 1].forEach((i) => {
        const u = clamp(k - i * 0.09), x = lerp(W * 0.02, px - (i ? 70 : 8) * hs * 1.6, ease(u)), yLine = (xx) => { const tt = clamp(xx / px); return (1 - tt) * (1 - tt) * H * 0.95 + 2 * (1 - tt) * tt * H * 0.8 + tt * tt * py; };
        const y = yLine(x), slope = Math.atan2(yLine(x + 4) - y, 4), walking = u < 1 ? 1 : 0;
        horse(c, x, y + 2, hs * (i ? 0.92 : 1), t, walking, { slope: slope * 0.8, ph: i * 1.7, head: walking ? 0.05 * Math.sin(t * 5) : i ? 0.9 + Math.sin(t) * 0.05 : -0.15, col: "#120814", far: "#2a1630" });
      });
    },
    // a flock of birds crosses the sunset, then each bird turns into a letter
    text: {
      at: 4.6, spread: 1.0, dur: 1.0, pre: 0.6, preScale: 0.6, spin: 0.2, glow: "rgba(255,170,80,.9)", ink: ["#fff3c4", "#ffd36b", "#ff9d2e"],
      from(p, S, t) { const lead = (t - 0.6) * W * 0.16 - W * 0.1, v = Math.abs(p.u - 0.5); return [lead + (0.5 - v) * W * 0.16 + p.r * 14, H * (0.24 + v * 0.18) + Math.sin(t * 2 + p.q * 6) * 6]; },
      preDraw(c, p, x, y, t) { const f = Math.sin(t * 9 + p.r * 6) * 6 * s0; c.strokeStyle = "#1a0a1e"; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x - 9 * s0, y + f); c.quadraticCurveTo(x - 4 * s0, y - 4 * s0, x, y); c.quadraticCurveTo(x + 4 * s0, y - 4 * s0, x + 9 * s0, y + f); c.stroke(); },
    },
    sound(e) { e.wind(0, 8.4, 0.06, 400, 700); e.clop(0.2, 4.2, 3.5, 0.06); e.birds(0.8, 6, 0.025); [196, 246.94, 293.66, 392].forEach((f, i) => e.tone(f, 0.5 + i * 0.4, 7, 0.03)); },
  };

  // ---------------------------------------------------------------- 4. fireworks over the river
  const fireworks = {
    D: 8, facts: ["insider", "busiest"], cy: () => H * 0.36,
    init(S) {
      const cols = ["#ff4fd8", "#2ef2ff", "#ffd36b", "#3ee08f", "#b44dff", "#ff7a3b"];
      S.b = Array.from({ length: 12 }, (_, i) => ({ x: rnd(0.12, 0.88) * W, y: rnd(0.1, 0.42) * H, at: 0.2 + i * 0.42 + rnd(0, 0.2), c: cols[i % 6], c2: cols[(i + 2) % 6], n: 72, kind: i % 3 }));
      S.B = city(0.12, 0.3, { wMin: 34, wMax: 70 }); S.fans = Array.from({ length: Math.floor(W / 14) }, (_, i) => ({ x: i * 14 + rnd(-3, 3), h: rnd(0.8, 1.2), ph: rnd(0, 6), up: Math.random() > 0.6, ph2: Math.random() > 0.85 }));
    },
    draw(c, t, S) {
      sky(c, ["#05040e", "#0e0a28", "#1e1240"], 0, H * 0.68);
      const wl = H * 0.68;
      const burst = (b, mir) => {
        const a = t - b.at; if (a < 0) return; const by = mir ? 2 * wl - b.y : b.y;
        if (a < 0.6) { if (mir) return; const y = lerp(wl, b.y, ease(a / 0.6)); c.fillStyle = "#fff4d0"; c.fillRect(b.x - 1, y, 2, 10); glow(c, b.x, y, 8, "rgba(255,230,180,.6)"); return; }
        const k = a - 0.6; if (k > 2.4) return;
        c.globalAlpha = (1 - k / 2.4) * (mir ? 0.25 : 1); if (k < 0.2 && !mir) glow(c, b.x, by, 160 * s0, "rgba(255,255,255,.35)");
        for (let i = 0; i < b.n; i++) { const an = (i / b.n) * TAU, r = ease(k / 1.1) * (b.kind === 2 ? 100 : 140) * s0 * (phone ? 0.8 : 1), dr = b.kind === 1 ? k * k * 40 : k * k * 14, x = b.x + Math.cos(an) * r, y = by + (mir ? -1 : 1) * (Math.sin(an) * r + dr); c.fillStyle = i % 2 ? b.c : b.c2; c.fillRect(x - 1.5, y - 1.5, 3, 3); if (b.kind === 1 && !mir) { c.fillRect(x - 0.5, y - 10, 1, 10); } }
        c.globalAlpha = 1;
      };
      S.b.forEach((b) => burst(b, false));
      drawCity(c, S.B, wl, "#0a0818", (b, i, k, r, v) => (v > 0.8 ? "rgba(255,214,120,.45)" : false));
      const g = c.createLinearGradient(0, wl, 0, H); g.addColorStop(0, "#120c2a"); g.addColorStop(1, "#06040e"); c.fillStyle = g; c.fillRect(0, wl, W, H - wl);
      S.b.forEach((b) => burst(b, true));
      c.strokeStyle = "rgba(255,255,255,.08)"; c.lineWidth = 1; for (let i = 0; i < 16; i++) { const y = wl + 6 + i * 7; c.beginPath(); c.moveTo((i * 97) % W, y); c.lineTo(((i * 97) % W) + 60, y); c.stroke(); }
      // people on the riverbank watching, some with arms up, some holding up phones
      c.fillStyle = "#04030a"; S.fans.forEach((f) => { const y = H * 0.93 + Math.sin(t * 2 + f.ph) * 1; c.beginPath(); c.arc(f.x, y - 26 * s0 * f.h, 7 * s0, 0, TAU); c.fill(); c.fillRect(f.x - 9 * s0, y - 19 * s0 * f.h, 18 * s0, 30 * s0); if (f.up) { c.strokeStyle = "#04030a"; c.lineWidth = 3 * s0; c.beginPath(); c.moveTo(f.x + 6 * s0, y - 16 * s0); c.lineTo(f.x + 12 * s0, y - 42 * s0 + Math.sin(t * 4 + f.ph) * 3); c.stroke(); if (f.ph2) { c.fillStyle = "#cfe8ff"; c.fillRect(f.x + 9 * s0, y - 50 * s0, 5 * s0, 8 * s0); c.fillStyle = "#04030a"; } } });
    },
    // the last big shells burst into the letters
    text: {
      mode: "dots", at: 3.6, spread: 0.5, dur: 1.0, crisp: 0.85, glow: "rgba(255,79,216,.9)", ink: ["#ff4fd8", "#ffd36b", "#2ef2ff"],
      from(p) { const k = Math.floor(p.u * 3), x = W * (0.3 + k * 0.2); return [x, H * 0.36]; },
      dot(c, p, x, y, k, t, S, a = 1) { if (k < 0) return; c.fillStyle = p.col; c.globalAlpha = Math.max(a, 0.5) * (0.6 + 0.4 * Math.sin(t * 20 + p.r * 30)); c.fillRect(x - 1.6, y - 1.6, 3.2, 3.2); c.globalAlpha = 1; },
    },
    sound(e, S) { S.b.forEach((b) => e.firework(b.at + 0.6, 0.22)); [3.3, 3.4, 3.5].forEach((a) => e.firework(a + 0.3, 0.3)); e.crowd(0, 8, 0.06, 4); },
  };

  return [skywriter, goal, mtn, fireworks];
});
