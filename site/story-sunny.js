// Sunny story: surfers at the beach -> pan up to a blimp, a paraglider and a skywriting plane -> a goal in a
// packed stadium (the boards show today's moves) -> two horses and hot air balloons at sunset -> fireworks over London.
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
      S.shells = Array.from({ length: phone ? 10 : 18 }, (_, i) => ({ x: rnd(0.02, 0.98) * W, y: rnd(0.78, 0.98) * H, k: i % 4, r: rnd(0.8, 1.3), a: rnd(0, 6) }));
    },
    draw(c, t, S) {
      const cy = cam(t), hz = H * 0.44;
      c.save(); c.translate(0, cy);
      sky(c, ["#1e78d8", "#3a9cf0", "#7cc6ff", "#cfeeff"], -H * 0.85, hz);
      S.cl.forEach((q) => cloud(c, ((q.x * W + t * 10) % (W + 300)) - 150, q.y * H, q.r, "rgba(255,255,255,.92)", 5, q.sd));
      // sea with rolling swell and breaking waves
      const g = c.createLinearGradient(0, hz, 0, H * 0.72); g.addColorStop(0, "#1a6fb8"); g.addColorStop(1, "#38b6d8"); c.fillStyle = g; c.fillRect(0, hz, W, H * 0.3);
      for (let i = 0; i < 7; i++) { const y = hz + Math.pow(i / 7, 1.4) * H * 0.27 + 6, a = 0.25 + i * 0.07; c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = 1 + i * 0.5; c.beginPath(); for (let x = 0; x <= W; x += 14) { const yy = y + Math.sin(x * (0.02 - i * 0.002) + t * (1.4 + i * 0.1) + i) * (2 + i); x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); }
      // a green-blue wave peeling along, lit through its face, with a white lip and spray; surfers riding it
      const wy = H * 0.62, wv = (x) => wy - (0.35 + 0.65 * Math.max(0, Math.sin((x / W) * Math.PI * 1.2 - t * 0.6))) * 30 * s0;
      const wg = c.createLinearGradient(0, wy - 34 * s0, 0, wy + 22); wg.addColorStop(0, "#5fe0d8"); wg.addColorStop(0.35, "#22a6c8"); wg.addColorStop(1, "#1a74b0"); c.fillStyle = wg;
      c.beginPath(); c.moveTo(0, wy + 22); for (let x = 0; x <= W; x += 8) c.lineTo(x, wv(x)); c.lineTo(W, wy + 22); c.fill();
      c.strokeStyle = "rgba(255,255,255,.25)"; c.lineWidth = 1.2; for (let i = 0; i < 18; i++) { const x = ((i * 0.618 + t * 0.05) % 1) * W, y0 = wv(x); c.beginPath(); c.moveTo(x, wy + 18); c.quadraticCurveTo(x - 6, (y0 + wy + 18) / 2, x - 2, y0 + 6); c.stroke(); }
      c.fillStyle = "rgba(255,255,255,.95)"; c.beginPath(); for (let x = 0; x <= W; x += 8) c.lineTo(x, wv(x) - 1); for (let x = W; x >= 0; x -= 8) c.lineTo(x, wv(x) + 3 + Math.max(0, Math.sin(x * 0.05 + t * 5)) * 3); c.fill();
      for (let i = 0; i < 40; i++) { const x = (i / 40) * W + Math.sin(t * 3 + i) * 6, k = (t * 1.2 + i * 0.37) % 1, y = wv(x) - k * 16 * s0; c.fillStyle = `rgba(255,255,255,${0.7 * (1 - k)})`; c.beginPath(); c.arc(x - k * 10, y, 1.5 + (i % 3), 0, TAU); c.fill(); }
      c.fillStyle = "rgba(255,255,255,.8)"; c.beginPath(); for (let x = 0; x <= W; x += 10) c.lineTo(x, wy + 18 + Math.sin(x * 0.04 + t * 3) * 2); for (let x = W; x >= 0; x -= 10) c.lineTo(x, wy + 24 + Math.sin(x * 0.06 - t * 2) * 3); c.fill();
      [[0.28, "#ffd36b", 0], [0.55, "#ff4fd8", 2], [0.8, "#2ef2ff", 4]].slice(0, phone ? 2 : 3).forEach(([u, col, ph]) => { const x = (u + t * 0.03) % 1 * W; surfer(c, x, wv(x) + 4, s0 * 1.05, t, col, ph); });
      // sand, shoreline foam, umbrella, towel, sandcastle, palm
      const sg = c.createLinearGradient(0, H * 0.7, 0, H); sg.addColorStop(0, "#f2d79e"); sg.addColorStop(1, "#e2bb78"); c.fillStyle = sg; c.beginPath(); c.moveTo(0, H + 10); c.lineTo(0, H * 0.72); for (let x = 0; x <= W; x += 16) c.lineTo(x, H * 0.72 + Math.sin(x * 0.02 + t * 1.5) * 4); c.lineTo(W, H + 10); c.fill();
      c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= W; x += 16) c[x ? "lineTo" : "moveTo"](x, H * 0.72 + Math.sin(x * 0.02 + t * 1.5) * 4); c.stroke();
      const ux = W * 0.22, uy = H * 0.9; c.strokeStyle = "#eee"; c.lineWidth = 3 * s0; c.beginPath(); c.moveTo(ux, uy); c.lineTo(ux + 6 * s0, uy - 80 * s0); c.stroke();
      ["#ff4fd8", "#fff", "#ff4fd8", "#fff", "#ff4fd8"].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.moveTo(ux + 6 * s0, uy - 84 * s0); c.arc(ux + 6 * s0, uy - 76 * s0, 56 * s0, Math.PI + (i / 5) * Math.PI, Math.PI + ((i + 1) / 5) * Math.PI); c.fill(); });
      c.fillStyle = "#2ec7d9"; c.fillRect(ux + 20 * s0, uy - 6 * s0, 70 * s0, 22 * s0); c.fillStyle = "#fff"; c.fillRect(ux + 20 * s0, uy + 2 * s0, 70 * s0, 4 * s0);
      c.fillStyle = "#d9b070"; const cx0 = W * 0.6, cy0 = H * 0.92; c.fillRect(cx0 - 24 * s0, cy0 - 18 * s0, 48 * s0, 18 * s0); c.fillRect(cx0 - 10 * s0, cy0 - 34 * s0, 20 * s0, 16 * s0); [-24, -8, 8, 24 - 6].forEach((d) => c.fillRect(cx0 + d * s0, cy0 - 24 * s0, 6 * s0, 6 * s0)); c.strokeStyle = "#333"; c.lineWidth = 1; c.beginPath(); c.moveTo(cx0, cy0 - 34 * s0); c.lineTo(cx0, cy0 - 50 * s0); c.stroke(); c.fillStyle = "#ff3b5c"; c.fillRect(cx0, cy0 - 50 * s0, 10 * s0, 6 * s0);
      // shells and starfish dotted over the sand
      S.shells.forEach((q) => { c.save(); c.translate(q.x, q.y); c.rotate(q.a); const r = 6 * s0 * q.r;
        if (q.k === 0) { c.fillStyle = "#ff7a4a"; c.beginPath(); for (let j = 0; j < 10; j++) { const aa = (j / 10) * TAU, rr = j % 2 ? r * 0.45 : r * 1.4; c.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } c.closePath(); c.fill(); }
        else if (q.k === 1) { c.fillStyle = "#fbe3d0"; c.beginPath(); c.moveTo(0, r * 0.5); c.arc(0, 0, r, Math.PI, TAU); c.closePath(); c.fill(); c.strokeStyle = "rgba(180,110,80,.6)"; c.lineWidth = 0.8; c.beginPath(); for (let j = 1; j < 6; j++) { const aa = Math.PI + (j / 6) * Math.PI; c.moveTo(0, r * 0.4); c.lineTo(Math.cos(aa) * r, Math.sin(aa) * r); } c.stroke(); }
        else if (q.k === 2) { c.fillStyle = "#f2e2ff"; c.beginPath(); c.ellipse(0, 0, r, r * 0.6, 0, 0, TAU); c.fill(); c.strokeStyle = "rgba(150,110,170,.7)"; c.lineWidth = 1; c.beginPath(); for (let aa = 0; aa < 12; aa += 0.3) c.lineTo(Math.cos(aa) * r * (1 - aa / 13), Math.sin(aa) * r * 0.6 * (1 - aa / 13)); c.stroke(); }
        else { c.fillStyle = "#ff5a7a"; c.beginPath(); for (let j = 0; j < 10; j++) { const aa = (j / 10) * TAU, rr = j % 2 ? r * 0.45 : r * 1.2; c.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } c.closePath(); c.fill(); }
        c.restore(); });
      palm(c, W * 0.93, H * 0.97, s0 * 1.4, t);
      // up in the sky
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


  // the goalkeeper, facing us: green kit with a number 1, big gloves, boots. He bounces on his toes and shuffles,
  // then pushes off and dives full stretch in one smooth arc, lands and slides a little
  function keeper(c, gx, gy, gw, gh, t, s) {
    const d = clamp((t - 1.0) / 0.62), e = d * d * (3 - 2 * d), land = clamp((t - 1.62) / 0.5), dir = -1;
    const shuffle = (1 - clamp((t - 0.85) / 0.15)) * Math.sin(t * 4.2) * gw * 0.045, hop = d === 0 ? Math.abs(Math.sin(t * 8.4)) * 2.5 * s : 0;
    const crouch = d === 0 ? 1 : 1 - e;
    const hx = gx + shuffle + dir * (e * gw * 0.3 + ease(land) * gw * 0.04), hipStand = gy - lerp(36, 29, crouch) * s - hop;
    const hy = d === 0 ? hipStand : lerp(hipStand, gy - 9 * s, ease(d)) - Math.sin(Math.PI * Math.min(1, d * 1.05)) * gh * 0.42 * (1 - land);
    const rot = dir * 1.42 * ease(d * 1.1);
    const L = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    // pose: ready (knees bent wide, gloves out at the waist) blends into stretched (arms past the head, legs together)
    const p = e;
    const kneeL = L([-12, 16], [-3, 18], p), kneeR = L([12, 16], [5, 18], p), footL = L([-14, 30], [-4, 35], p), footR = L([14, 30], [7, 34], p);
    const elbL = L([-24, -18], [-15, -52], p), elbR = L([24, -18], [7, -55], p), handL = L([-26, -4], [-14, -70], p), handR = L([26, -4], [4, -72], p);
    c.save(); c.translate(hx, hy); c.rotate(rot); c.scale(s, s); c.lineCap = "round"; c.lineJoin = "round";
    const seg = (pts, col, w) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(...pts[0]); pts.slice(1).forEach((q) => c.lineTo(...q)); c.stroke(); };
    // legs: shorts, green socks, black boots with white soles
    [[[-6, 0], kneeL, footL], [[6, 0], kneeR, footR]].forEach(([hp, kn, ft]) => {
      seg([hp, kn], "#e8b48a", 6.5); seg([L(kn, ft, 0.15), ft], "#22c55e", 6.8); seg([L(kn, ft, 0.15), L(kn, ft, 0.25)], "#0b0b14", 6.9);
      c.fillStyle = "#111"; c.beginPath(); c.ellipse(ft[0], ft[1] + 1.5, 4.8, 3, 0, 0, TAU); c.fill(); c.fillStyle = "#f2f2f2"; c.fillRect(ft[0] - 4.8, ft[1] + 3, 9.6, 1.4);
    });
    c.fillStyle = "#111"; c.beginPath(); c.moveTo(-12, -6); c.lineTo(12, -6); c.lineTo(13, 6); c.lineTo(1.5, 6); c.lineTo(0, 1); c.lineTo(-1.5, 6); c.lineTo(-13, 6); c.closePath(); c.fill();
    // shirt with dark shoulder stripes and the number 1
    const jg = c.createLinearGradient(-13, 0, 13, 0); jg.addColorStop(0, "#36e27a"); jg.addColorStop(1, "#16a34a"); c.fillStyle = jg;
    c.beginPath(); c.moveTo(-12, -6); c.lineTo(-14, -30); c.quadraticCurveTo(0, -36, 14, -30); c.lineTo(12, -6); c.closePath(); c.fill();
    c.fillStyle = "#0b3d1e"; c.fillRect(-14, -31, 6, 3); c.fillRect(8, -31, 6, 3); c.beginPath(); c.moveTo(-4, -34); c.lineTo(0, -29); c.lineTo(4, -34); c.fill();
    c.fillStyle = "#0b0b14"; c.font = "900 13px Inter, sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("1", 0, -18);
    // arms and big gloves
    [[[-13, -30], elbL, handL], [[13, -30], elbR, handR]].forEach(([sh, el, hd]) => { seg([sh, el], "#22c55e", 6); seg([el, hd], "#22c55e", 5.2); c.fillStyle = "#fff"; c.beginPath(); c.ellipse(hd[0], hd[1], 5.2, 4.4, Math.atan2(hd[1] - el[1], hd[0] - el[0]), 0, TAU); c.fill(); c.fillStyle = "#22c55e"; c.fillRect(hd[0] - 4, hd[1] - 1, 8, 2); });
    // head: short dark hair, eyes on the ball
    c.fillStyle = "#e8b48a"; c.fillRect(-3, -38, 6, 5); c.beginPath(); c.ellipse(0, -45, 8, 9, 0, 0, TAU); c.fill();
    c.fillStyle = "#2a1a10"; c.beginPath(); c.ellipse(0, -50, 8.4, 5, 0, Math.PI, TAU); c.fill(); c.fillRect(-8.4, -50, 2.4, 5); c.fillRect(6, -50, 2.4, 5);
    c.fillStyle = "#1a1530"; c.beginPath(); c.arc(-3, -45, 1.1, 0, TAU); c.arc(3, -45, 1.1, 0, TAU); c.fill(); c.strokeStyle = "#8a3a2a"; c.lineWidth = 1; c.beginPath(); c.moveTo(-2.5, -40.5); c.lineTo(2.5, -40.5); c.stroke();
    c.restore();
    // a puff of grass and chalk where he lands
    if (land > 0 && land < 1) { c.fillStyle = `rgba(220,240,210,${0.5 * (1 - land)})`; for (let i = 0; i < 10; i++) { c.beginPath(); c.arc(hx + (i - 5) * 4 * s, gy - land * 14 * s * ((i * 7) % 3), 2 * s, 0, TAU); c.fill(); } }
  }

  // ---------------------------------------------------------------- 2. the goal
  const goal = {
    D: 8, facts: ["best"], cy: () => H * (phone ? 0.66 : 0.7),
    init(S) {
      const cols = ["#ff4fd8", "#2ef2ff", "#ffd36b", "#f5f5f5", "#6b5cff"];
      S.fans = []; const rows = 9;
      for (let r = 0; r < rows; r++) { const y = H * 0.07 + r * H * 0.034, n = Math.floor(W / (phone ? 9 : 11)); for (let i = 0; i < n; i++) S.fans.push({ x: (i + (r % 2) * 0.5) * (W / n), y, c: cols[(i * 7 + r * 3) % 5], sk: ["#f2c9a0", "#c98a5a", "#8a5a3a", "#e8b48a"][(i + r) % 4], ph: rnd(0, 6), r: 3.2 + r * 0.25 }); }
      S.tick = K.movers(14); if (!S.tick.length) S.tick = [{ t: "S&P 100", c: K.spy() }];
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
      // LED boards along the touchline scroll today's real moves
      { const by = H * 0.368, bh = H * 0.04; c.fillStyle = "#06060f"; c.fillRect(0, by, W, bh); c.save(); c.beginPath(); c.rect(0, by, W, bh); c.clip();
        const fs = Math.round(bh * 0.62); c.font = `900 ${fs}px Inter, sans-serif`; c.textAlign = "left"; c.textBaseline = "middle";
        const items = S.tick.map((m) => ({ m, w: c.measureText(`${m.t} ${m.c >= 0 ? "▲" : "▼"} ${(Math.abs(m.c) * 100).toFixed(1)}%`).width + fs * 2.2 })), tot = items.reduce((a, b) => a + b.w, 0) || 1;
        let x0 = -((t * W * 0.09) % tot); while (x0 < W) { for (const it of items) { if (x0 > W) break; if (x0 + it.w > 0) { const up = it.m.c >= 0; c.fillStyle = up ? "#2df07a" : "#ff4a5a"; c.fillText(`${it.m.t} ${up ? "▲" : "▼"} ${(Math.abs(it.m.c) * 100).toFixed(1)}%`, x0 + fs * 0.6, by + bh / 2); c.fillStyle = "#ffd36b"; c.fillText("•", x0 + it.w - fs * 0.9, by + bh / 2); } x0 += it.w; } }
        c.fillStyle = "rgba(0,0,0,.35)"; for (let x = 0; x < W; x += 3) c.fillRect(x, by, 1, bh); // LED grid
        c.restore(); c.fillStyle = "rgba(255,255,255,.12)"; c.fillRect(0, by, W, 1.5); }
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
      keeper(c, gx, gy, gw, gh, t, s0 * (phone ? 0.95 : 1.2));
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
    sound(e) { e.crowd(0, 8, 0.22, 1.75); e.kick(0.9, 0.6); e.thud(1.65, 0.25, 70); e.noise("bandpass", 600, 1, 1.75, 0.3, [[1.75, 0], [1.76, 0.3], [2.05, 0]]); e.whistle(3.0, 0.05); e.melody([392, 392, 440, 392, 523, 494], 3.8, 0.32, 0.03, "square", 0.7); },
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
      // hot air balloons drifting over the ranges in the evening light
      S.bal = phone ? [[0.14, 0.42, ["#ff4fd8", "#ffd36b"], 0.7], [0.86, 0.3, ["#2ef2ff", "#6b5cff"], 0.6]] : [[0.1, 0.4, ["#ff4fd8", "#ffd36b"], 0.85], [0.9, 0.3, ["#2ef2ff", "#6b5cff"], 0.75], [0.6, 0.44, ["#ff7a3b", "#ffe9a8"], 0.5], [0.33, 0.47, ["#3ee08f", "#ffffff"], 0.4]];
    },
    path(u) { const [px, py] = this.S_peak; const x = lerp(-W * 0.05, px, u), y = lerp(H * 0.95, py, Math.pow(u, 0.9)); return [x, y]; },
    draw(c, t, S) {
      this.S_peak = S.peak; const sunY = lerp(H * 0.5, H * 0.56, t / 8.4), sx = W * (phone ? 0.78 : 0.74), sr = Math.min(W, H) * 0.075;
      sky(c, ["#2a1650", "#7a2a6a", "#d2506a", "#ff9a4a", "#ffd27a"], 0, H * 0.66);
      glow(c, sx, sunY, H * 0.65, "rgba(255,170,90,.45)");
      S.cl.forEach((q, i) => cloud(c, q.x * W + Math.sin(t * 0.2 + i) * 8, q.y * H, q.r, i % 2 ? "rgba(255,150,140,.55)" : "rgba(190,90,140,.5)", 5, q.sd));
      c.fillStyle = "#fff0b8"; c.beginPath(); c.arc(sx, sunY, sr, 0, TAU); c.fill(); glow(c, sx, sunY, sr * 1.6, "rgba(255,240,190,.6)");
      S.bal.forEach(([u, v, cols, sc], i) => { c.save(); balloon(c, (u + t * 0.006 * (i % 2 ? -1 : 1)) * W, v * H - t * 3 * s0, s0 * sc, cols, t); c.globalAlpha = 0.18; c.fillStyle = "#ff9a4a"; c.beginPath(); c.arc((u + t * 0.006 * (i % 2 ? -1 : 1)) * W, v * H - t * 3 * s0, 38 * s0 * sc, 0, TAU); c.fill(); c.restore(); glow(c, (u + t * 0.006 * (i % 2 ? -1 : 1)) * W, v * H - t * 3 * s0 + 58 * s0 * sc, 14 * s0 * sc, `rgba(255,190,90,${0.5 + 0.4 * Math.sin(t * 7 + i)})`); });
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

  // ---------------------------------------------------------------- 4. fireworks over the Thames: the London skyline
  // drawn from simple shapes: the London Eye, Parliament and Elizabeth Tower, St Paul's, the Walkie-Talkie, the Gherkin,
  // the Shard and Tower Bridge, all reflected in the river
  function london(c, wl, u, t, fl) {
    const ink = "#0d0b20", ink2 = "#151232", gold = "rgba(255,214,130,.85)", X = (f) => f * W;
    c.lineCap = "butt";
    // a low row of ordinary buildings all along the bank
    for (let i = 0; i < 46; i++) { const x = (i / 46) * W, h = (18 + ((i * 37) % 23)) * u * 0.9, w = W / 46 + 1; c.fillStyle = i % 2 ? ink : ink2; c.fillRect(x, wl - h, w, h); if ((i * 7) % 3 === 0) { c.fillStyle = "rgba(255,214,130,.35)"; c.fillRect(x + w * 0.3, wl - h * 0.6, w * 0.15, 2); } }
    // the London Eye: rim, spokes, capsules and its A-frame legs
    { const ex = X(phone ? 0.13 : 0.11), R = 92 * u, ey = wl - R - 10 * u; c.strokeStyle = ink2; c.lineWidth = 5 * u; c.beginPath(); c.moveTo(ex - R * 0.55, wl); c.lineTo(ex, ey); c.lineTo(ex - R * 0.2, wl); c.stroke();
      c.strokeStyle = "rgba(170,200,255,.75)"; c.lineWidth = 2.2 * u; c.beginPath(); c.arc(ex, ey, R, 0, TAU); c.stroke(); c.lineWidth = 0.8; c.beginPath(); for (let i = 0; i < 32; i++) { const a = (i / 32) * TAU + t * 0.03; c.moveTo(ex, ey); c.lineTo(ex + Math.cos(a) * R, ey + Math.sin(a) * R); } c.stroke();
      for (let i = 0; i < 32; i++) { const a = (i / 32) * TAU + t * 0.03; c.fillStyle = i % 4 ? "rgba(200,220,255,.9)" : "rgba(255,120,220,.95)"; c.beginPath(); c.ellipse(ex + Math.cos(a) * (R + 4 * u), ey + Math.sin(a) * (R + 4 * u), 3 * u, 2.2 * u, 0, 0, TAU); c.fill(); } c.fillStyle = ink2; c.beginPath(); c.arc(ex, ey, 5 * u, 0, TAU); c.fill(); }
    // the Houses of Parliament: a long gothic front with pinnacles, Victoria Tower at one end and Elizabeth Tower at the other
    { const x0 = X(phone ? 0.24 : 0.2), x1 = X(phone ? 0.42 : 0.36), h = 40 * u; c.fillStyle = ink; c.fillRect(x0, wl - h, x1 - x0, h);
      for (let x = x0 + 4 * u; x < x1; x += 7 * u) { c.beginPath(); c.moveTo(x - 1.6 * u, wl - h); c.lineTo(x, wl - h - 9 * u); c.lineTo(x + 1.6 * u, wl - h); c.fill(); }
      c.fillStyle = gold; for (let x = x0 + 5 * u; x < x1 - 4 * u; x += 7 * u) { c.fillRect(x, wl - h * 0.75, 2 * u, 6 * u); c.fillRect(x, wl - h * 0.4, 2 * u, 6 * u); }
      c.fillStyle = ink; c.fillRect(x0 - 4 * u, wl - 104 * u, 26 * u, 104 * u); [0, 22].forEach((d) => { c.fillRect(x0 - 5 * u + d * u, wl - 114 * u, 6 * u, 12 * u); }); c.beginPath(); c.moveTo(x0 + 2 * u, wl - 104 * u); c.lineTo(x0 + 9 * u, wl - 118 * u); c.lineTo(x0 + 16 * u, wl - 104 * u); c.fill();
      const tx = x1 + 2 * u, tw = 18 * u; c.fillRect(tx - tw / 2, wl - 128 * u, tw, 128 * u); c.fillRect(tx - tw / 2 - 2 * u, wl - 150 * u, tw + 4 * u, 24 * u);
      c.beginPath(); c.moveTo(tx - tw / 2 - 2 * u, wl - 150 * u); c.lineTo(tx - tw / 2 + 2 * u, wl - 162 * u); c.lineTo(tx + tw / 2 - 2 * u, wl - 162 * u); c.lineTo(tx + tw / 2 + 2 * u, wl - 150 * u); c.fill(); c.beginPath(); c.moveTo(tx - 6 * u, wl - 162 * u); c.lineTo(tx, wl - 196 * u); c.lineTo(tx + 6 * u, wl - 162 * u); c.fill();
      glow(c, tx, wl - 138 * u, 22 * u, "rgba(255,230,160,.45)"); c.fillStyle = "#ffe9a8"; c.beginPath(); c.arc(tx, wl - 138 * u, 7.5 * u, 0, TAU); c.fill(); c.strokeStyle = "#3a2a10"; c.lineWidth = 1.2 * u; c.beginPath(); c.moveTo(tx, wl - 138 * u); c.lineTo(tx, wl - 143.5 * u); c.moveTo(tx, wl - 138 * u); c.lineTo(tx + 3.6 * u, wl - 136 * u); c.stroke();
      c.fillStyle = gold; for (let y = wl - 120 * u; y < wl - 10 * u; y += 12 * u) c.fillRect(tx - 2 * u, y, 4 * u, 5 * u); }
    // St Paul's Cathedral: the great dome on its drum, lantern and cross
    if (!phone) { const sx = X(0.5), b = wl - 30 * u; c.fillStyle = ink2; c.fillRect(sx - 44 * u, b, 88 * u, 30 * u); c.fillRect(sx - 40 * u, b - 22 * u, 12 * u, 22 * u); c.fillRect(sx + 28 * u, b - 22 * u, 12 * u, 22 * u); c.fillRect(sx - 18 * u, b - 18 * u, 36 * u, 18 * u);
      c.beginPath(); c.ellipse(sx, b - 18 * u, 20 * u, 26 * u, 0, Math.PI, TAU); c.fill(); c.fillRect(sx - 3 * u, b - 56 * u, 6 * u, 14 * u); c.fillRect(sx - 0.8 * u, b - 64 * u, 1.6 * u, 8 * u); c.fillRect(sx - 3 * u, b - 61 * u, 6 * u, 1.6 * u);
      c.strokeStyle = "rgba(255,214,130,.35)"; c.lineWidth = 1; c.beginPath(); c.ellipse(sx, b - 18 * u, 20 * u, 26 * u, 0, Math.PI * 1.08, Math.PI * 1.45); c.stroke(); c.fillStyle = gold; for (let i = -2; i <= 2; i++) c.fillRect(sx + i * 6 * u - 1, b - 14 * u, 2, 8 * u); }
    // the Walkie-Talkie (wider at the top) and the Gherkin (a rounded bullet with spiralling glass)
    if (!phone) { const wx = X(0.6), wb = wl - 20 * u; c.fillStyle = ink2; c.beginPath(); c.moveTo(wx - 14 * u, wb); c.lineTo(wx - 19 * u, wb - 120 * u); c.quadraticCurveTo(wx, wb - 132 * u, wx + 19 * u, wb - 120 * u); c.lineTo(wx + 14 * u, wb); c.fill(); c.fillStyle = "rgba(140,220,170,.4)"; c.fillRect(wx - 18 * u, wb - 124 * u, 36 * u, 6 * u); c.fillStyle = gold; for (let y = wb - 110 * u; y < wb; y += 9 * u) c.fillRect(wx - 12 * u, y, 24 * u, 1.4); }
    { const gx = X(phone ? 0.58 : 0.655), gb = wl - 16 * u, gh = 130 * u, gw = 17 * u; c.fillStyle = "#11203a"; c.beginPath(); c.moveTo(gx - gw * 0.75, gb); c.bezierCurveTo(gx - gw * 1.25, gb - gh * 0.55, gx - gw * 0.6, gb - gh, gx, gb - gh); c.bezierCurveTo(gx + gw * 0.6, gb - gh, gx + gw * 1.25, gb - gh * 0.55, gx + gw * 0.75, gb); c.fill();
      c.save(); c.clip(); c.strokeStyle = "rgba(120,170,255,.4)"; c.lineWidth = 1.2; for (let i = -8; i < 8; i++) { c.beginPath(); c.moveTo(gx + i * 6 * u, gb); c.quadraticCurveTo(gx + i * 6 * u + 14 * u, gb - gh * 0.5, gx + i * 6 * u + 24 * u, gb - gh); c.stroke(); } c.restore(); }
    // the Shard: a tall glass spike that splinters at the top, with a red light
    { const hx = X(phone ? 0.74 : 0.73), hb = wl - 14 * u, hh = 236 * u, hw = 30 * u; const g = c.createLinearGradient(hx - hw, 0, hx + hw, 0); g.addColorStop(0, "#26304e"); g.addColorStop(0.5, "#1a2240"); g.addColorStop(1, "#0f1530"); c.fillStyle = g;
      c.beginPath(); c.moveTo(hx - hw, hb); c.lineTo(hx - 3 * u, hb - hh); c.lineTo(hx - 1 * u, hb - hh + 10 * u); c.lineTo(hx + 2 * u, hb - hh - 6 * u); c.lineTo(hx + 4 * u, hb - hh + 12 * u); c.lineTo(hx + hw, hb); c.fill();
      c.strokeStyle = "rgba(170,200,255,.25)"; c.lineWidth = 1; c.beginPath(); c.moveTo(hx - hw * 0.3, hb); c.lineTo(hx - 1 * u, hb - hh + 6 * u); c.moveTo(hx + hw * 0.4, hb); c.lineTo(hx + 1.5 * u, hb - hh + 8 * u); c.stroke();
      c.fillStyle = gold; for (let y = hb - 12 * u; y > hb - hh * 0.85; y -= 9 * u) { const w2 = hw * (1 - (hb - y) / hh) * 0.8; c.fillRect(hx - w2, y, w2 * 2, 1.2); }
      glow(c, hx + 1 * u, hb - hh - 4 * u, 8 * u, `rgba(255,60,60,${0.6 + 0.4 * Math.sin(t * 3)})`); }
    // Tower Bridge: two gothic towers, high walkways, the road deck and suspension chains to each bank
    { const b0 = X(phone ? 0.82 : 0.84), b1 = X(phone ? 1.08 : 0.97), tw = 15 * u, th = 92 * u, deck = wl - 16 * u; c.fillStyle = ink;
      c.fillRect(b0 - W * 0.06, deck, (b1 - b0) + W * 0.12, 4 * u); c.fillRect(b0, deck - 3 * u, b1 - b0, 3 * u);
      [b0, b1].forEach((x) => { c.fillRect(x - tw / 2, wl - th, tw, th); c.fillRect(x - tw / 2 - 2 * u, wl - 6 * u, tw + 4 * u, 6 * u); [-1, 1].forEach((d) => { c.fillRect(x + d * tw / 2 - (d > 0 ? 4 * u : 0), wl - th - 10 * u, 4 * u, 10 * u); c.beginPath(); c.moveTo(x + d * tw / 2 - (d > 0 ? 4 * u : 0), wl - th - 10 * u); c.lineTo(x + d * tw / 2 - (d > 0 ? 2 * u : -2 * u), wl - th - 16 * u); c.lineTo(x + d * tw / 2 + (d > 0 ? 0 : 4 * u), wl - th - 10 * u); c.fill(); }); c.beginPath(); c.moveTo(x - 4 * u, wl - th); c.lineTo(x, wl - th - 20 * u); c.lineTo(x + 4 * u, wl - th); c.fill(); c.fillStyle = gold; c.fillRect(x - 2 * u, wl - th * 0.75, 4 * u, 8 * u); c.fillRect(x - 2 * u, wl - th * 0.45, 4 * u, 8 * u); c.fillStyle = ink; });
      c.fillRect(b0, wl - th * 0.86, b1 - b0, 5 * u); c.fillRect(b0, wl - th * 0.78, b1 - b0, 3 * u);
      c.strokeStyle = "rgba(160,200,255,.55)"; c.lineWidth = 2 * u; [[b0, -1], [b1, 1]].forEach(([x, d]) => { c.beginPath(); c.moveTo(x, wl - th * 0.62); c.quadraticCurveTo(x + d * W * 0.03, deck - 4 * u, x + d * W * 0.06, deck - 2 * u); c.stroke(); });
      c.fillStyle = "rgba(255,230,160,.8)"; for (let x = b0 - W * 0.06; x < b1 + W * 0.06; x += 9 * u) c.fillRect(x, deck - 1, 2, 2); }
    
  }
  const fireworks = {
    D: 8, facts: ["insider", "busiest"], cy: () => H * (phone ? 0.3 : 0.34),
    init(S) {
      const cols = ["#ff4fd8", "#2ef2ff", "#ffd36b", "#3ee08f", "#b44dff", "#ff7a3b"];
      S.b = Array.from({ length: phone ? 11 : 15 }, (_, i) => { const n = 90; return { x: rnd(0.1, 0.9) * W, y: rnd(0.08, 0.36) * H, at: 0.2 + i * 0.36 + rnd(0, 0.2), c: cols[i % 6], c2: cols[(i + 2) % 6], kind: i % 4, n, sp: Array.from({ length: n }, () => rnd(0.82, 1.08)) }; });
      S.fans = Array.from({ length: Math.floor(W / 14) }, (_, i) => ({ x: i * 14 + rnd(-3, 3), h: rnd(0.8, 1.2), ph: rnd(0, 6), up: Math.random() > 0.6, ph2: Math.random() > 0.85 }));
    },
    draw(c, t, S) {
      const wl = H * 0.7, u = Math.min(H / 800, W / 900) * (phone ? 1.05 : 1.15);
      sky(c, ["#04030c", "#0c0a26", "#1e1440", "#2a1a48"], 0, wl);
      let fl = 0;
      // each shell: a rising trail, then a burst of stars with short glowing tails that slow and fall; willows droop in gold
      c.save(); c.globalCompositeOperation = "lighter";
      S.b.forEach((b) => {
        const a = t - b.at; if (a < 0) return;
        if (a < 0.6) { const y = lerp(wl, b.y, ease(a / 0.6)); c.strokeStyle = "rgba(255,230,180,.8)"; c.lineWidth = 2; c.beginPath(); c.moveTo(b.x + Math.sin(a * 20) * 1.5, y); c.lineTo(b.x, y + 18); c.stroke(); return; }
        const k = a - 0.6, life = b.kind === 1 ? 3.2 : 2.3; if (k > life) return; if (k < 0.15) fl = Math.max(fl, 1 - k / 0.15);
        if (k < 0.25) glow(c, b.x, b.y, 170 * s0 * (1 - k / 0.25), "rgba(255,240,255,.45)");
        const fade = 1 - k / life, R = (b.kind === 2 ? 95 : 140) * s0 * (phone ? 0.8 : 1);
        const pos = (i, kk) => { const an = (i / b.n) * TAU, r = R * b.sp[i] * (1 - Math.exp(-kk * 3.2)), g = (b.kind === 1 ? 55 : 22) * kk * kk * s0; return b.kind === 3 ? [b.x + Math.cos(an) * r, b.y + Math.sin(an) * r * 0.45 + g] : [b.x + Math.cos(an) * r, b.y + Math.sin(an) * r + g]; };
        c.lineWidth = b.kind === 1 ? 1.4 : 2; c.lineCap = "round";
        for (let i = 0; i < b.n; i++) { const [x, y] = pos(i, k), [px, py] = pos(i, Math.max(0, k - (b.kind === 1 ? 0.5 : 0.12))), tw = b.kind === 0 && k > 1.2 ? (Math.sin(t * 40 + i * 3) > 0 ? 1 : 0.2) : 1;
          c.strokeStyle = b.kind === 1 ? `rgba(255,200,110,${0.7 * fade})` : i % 2 ? b.c : b.c2; c.globalAlpha = fade * tw; c.beginPath(); c.moveTo(px, py); c.lineTo(x, y); c.stroke(); if (b.kind !== 1) { c.fillStyle = "#fff"; c.globalAlpha = fade * tw * 0.8; c.fillRect(x - 1, y - 1, 2, 2); } }
        c.globalAlpha = 1;
      });
      c.restore();
      // drifting smoke from the shells
      S.b.forEach((b) => { const k = t - b.at - 0.6; if (k > 0.3) glow(c, b.x + k * 6, b.y + k * 8, 60 * s0, `rgba(120,110,150,${0.12 * Math.min(1, k) * Math.max(0, 1 - k / 6)})`); });
      if (fl > 0) { const fg = c.createLinearGradient(0, 0, 0, wl); fg.addColorStop(0, `rgba(255,220,255,${fl * 0.06})`); fg.addColorStop(1, `rgba(255,220,255,${fl * 0.12})`); c.fillStyle = fg; c.fillRect(0, 0, W, wl); }
      london(c, wl, u, t, fl);
      // the river: the whole scene mirrored in broken ripples
      const dpr = c.getTransform().a, cv = c.canvas;
      c.fillStyle = "#07061a"; c.fillRect(0, wl, W, H - wl);
      c.save(); c.globalAlpha = 0.5; for (let y = wl; y < H; y += 3) { const d = y - wl, sy = wl - d * 1.2 - 2; if (sy < 0) break; const off = Math.sin(y * 0.11 + t * 2.6) * (1.5 + d * 0.05) + Math.sin(y * 0.37 - t * 4) * 1.2; c.drawImage(cv, 0, sy * dpr, cv.width, 3 * dpr, off, y, W, 3); } c.restore();
      const g = c.createLinearGradient(0, wl, 0, H); g.addColorStop(0, "rgba(10,8,30,.15)"); g.addColorStop(1, "rgba(4,3,12,.85)"); c.fillStyle = g; c.fillRect(0, wl, W, H - wl);
      c.strokeStyle = "rgba(255,255,255,.08)"; c.lineWidth = 1; for (let i = 0; i < 18; i++) { const y = wl + 6 + i * 7, x = ((i * 97 + t * 20) % W); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 60, y); c.stroke(); }
      c.fillStyle = "#3a3448"; c.fillRect(0, wl - 1, W, 2); // the embankment wall
      // people on the near bank watching, some with arms up, some holding up phones
      c.fillStyle = "#04030a"; S.fans.forEach((f) => { const y = H * 0.95 + Math.sin(t * 2 + f.ph) * 1; c.beginPath(); c.arc(f.x, y - 26 * s0 * f.h, 7 * s0, 0, TAU); c.fill(); c.fillRect(f.x - 9 * s0, y - 19 * s0 * f.h, 18 * s0, 30 * s0); if (f.up) { c.strokeStyle = "#04030a"; c.lineWidth = 3 * s0; c.beginPath(); c.moveTo(f.x + 6 * s0, y - 16 * s0); c.lineTo(f.x + 12 * s0, y - 42 * s0 + Math.sin(t * 4 + f.ph) * 3); c.stroke(); if (f.ph2) { c.fillStyle = "#cfe8ff"; c.fillRect(f.x + 9 * s0, y - 50 * s0, 5 * s0, 8 * s0); c.fillStyle = "#04030a"; } } });
    },
    // the last big shells burst into the letters
    text: {
      mode: "dots", at: 3.6, spread: 0.5, dur: 1.0, crisp: 0.85, glow: "rgba(255,79,216,.9)", ink: ["#ff4fd8", "#ffd36b", "#2ef2ff"],
      from(p) { const k = Math.floor(p.u * 3), x = W * (0.3 + k * 0.2); return [x, H * 0.34]; },
      dot(c, p, x, y, k, t, S, a = 1) { if (k < 0) return; c.fillStyle = p.col; c.globalAlpha = Math.max(a, 0.5) * (0.6 + 0.4 * Math.sin(t * 20 + p.r * 30)); c.fillRect(x - 1.6, y - 1.6, 3.2, 3.2); c.globalAlpha = 1; },
    },
    sound(e, S) { S.b.forEach((b) => e.firework(b.at + 0.6, 0.2)); [3.3, 3.4, 3.5].forEach((a) => e.firework(a + 0.3, 0.3)); e.crowd(0, 8, 0.06, 4); e.bell(392, 0.3, 0.03); },
  };

  return [skywriter, goal, mtn, fireworks];
});
