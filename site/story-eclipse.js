// Eclipse story: a shooting star over a moonlit lake -> Paris at night, the tower counts down 3-2-1 and
// sparkles -> sunrise over a canal town of half-timbered houses, people punting -> we follow the punt
// all the way to a Singapore waterfront office marked "SGX FX" (plain text, no logo).
WXS.add("eclipse", (K) => {
  const { W, H, rnd, clamp, ease, easeIO, lerp, TAU, sky, glow, stars, drawStars, ridge, hill, pine, person, palm, cloud } = K;
  const s0 = Math.min(W, H) / 700, phone = W < 600;

  // ---------------------------------------------------------------- 1. shooting star over a moonlit lake
  const head = (t) => { const k = (t - 0.6) / 3.2; return [lerp(-0.1, 1.15, k) * W, lerp(H * 0.12, H * 0.4, k)]; };
  const shooting = {
    D: 7.6, facts: ["best"], cy: () => H * 0.36,
    init(S) { S.st = stars(phone ? 160 : 280, 0.62); S.r1 = ridge(2.7, H * 0.05, H * 0.6); S.r2 = ridge(7.1, H * 0.03, H * 0.66); S.pines = Array.from({ length: phone ? 9 : 16 }, () => ({ u: Math.random(), s: rnd(0.6, 1.1) })); },
    draw(c, t, S, D) {
      const pan = easeIO((t - (D - 1.6)) / 1.6) * W * 0.3; c.save(); c.translate(-pan, 0);
      sky(c, ["#02031a", "#0a0c34", "#1c1848"], 0, H * 0.7); drawStars(c, S.st, t);
      const mx = W * 0.18, my = H * 0.16, mr = Math.min(W, H) * 0.05; glow(c, mx, my, mr * 5, "rgba(200,210,255,.25)"); c.fillStyle = "#eef0ff"; c.beginPath(); c.arc(mx, my, mr, 0, TAU); c.fill(); c.fillStyle = "rgba(180,185,215,.5)"; [[-0.3, -0.2, 0.2], [0.25, 0.1, 0.15], [-0.05, 0.35, 0.12]].forEach(([a, b, r]) => { c.beginPath(); c.arc(mx + a * mr, my + b * mr, r * mr, 0, TAU); c.fill(); });
      hill(c, S.r1, "#14143a", -20, W * 1.4); hill(c, S.r2, "#0c0c26", -20, W * 1.4);
      S.pines.forEach((q) => pine(c, q.u * W * 1.3, S.r2(q.u * W * 1.3) + 8, s0 * q.s * 1.2, "#06061a"));
      // a cottage with a lit window
      const cx = W * 0.72, cy = S.r2(cx) + 4; c.fillStyle = "#0a0a20"; c.fillRect(cx, cy - 26 * s0, 40 * s0, 26 * s0); c.beginPath(); c.moveTo(cx - 4 * s0, cy - 26 * s0); c.lineTo(cx + 20 * s0, cy - 42 * s0); c.lineTo(cx + 44 * s0, cy - 26 * s0); c.fill(); c.fillStyle = "#ffd88a"; c.fillRect(cx + 8 * s0, cy - 18 * s0, 8 * s0, 8 * s0); glow(c, cx + 12 * s0, cy - 14 * s0, 20 * s0, "rgba(255,210,120,.4)");
      // the lake, mirroring the sky
      const wl = H * 0.72; const g = c.createLinearGradient(0, wl, 0, H); g.addColorStop(0, "#141444"); g.addColorStop(1, "#06061a"); c.fillStyle = g; c.fillRect(-20, wl, W * 1.5, H - wl);
      c.save(); c.globalAlpha = 0.35; c.translate(0, wl * 2); c.scale(1, -1); drawStars(c, S.st.filter((q) => q.y > H * 0.3), t); c.restore();
      c.fillStyle = "rgba(230,235,255,.5)"; for (let i = 0; i < 8; i++) c.fillRect(mx - 20 * s0 + Math.sin(t + i) * 6, wl + 10 + i * 9, 40 * s0 - i * 3, 1.5);
      c.restore();
      // the shooting star and its sparkling trail
      const [x, y] = head(t);
      if (t > 0.6 && t < 4.4) { const g2 = c.createLinearGradient(x - 260, y - 60, x, y); g2.addColorStop(0, "rgba(255,255,255,0)"); g2.addColorStop(1, "rgba(255,250,220,.95)"); c.strokeStyle = g2; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 260, y - 60); c.lineTo(x, y); c.stroke(); glow(c, x, y, 30, "rgba(230,235,255,.95)"); for (let i = 0; i < 10; i++) { const k = (t * 3 + i / 10) % 1; c.fillStyle = `rgba(255,240,200,${1 - k})`; c.fillRect(x - k * 120 + Math.sin(i * 7) * 10, y - k * 28 + Math.cos(i * 5) * 10, 2, 2); } }
    },
    // the star's trail sprinkles the letters as it passes
    text: { mode: "dots", at: 0.6, spread: 3.2, dur: 0.6, crisp: 0.9, glow: "rgba(255,230,160,1)", color: "#fff7d6", ink: ["#fff7d6", "#ffd36b", "#ff9de0"], delay: (p) => clamp(p.tx / W + 0.1) / 1.25 * 3.2, from: (p, S, t) => { const k = (0.6 + clamp(p.tx / W + 0.1) / 1.25 * 3.2 - 0.6) / 3.2; return [lerp(-0.1, 1.15, k) * W, lerp(H * 0.12, H * 0.4, k)]; } },
    sound(e) { e.birds(0, 2, 0.008); e.chime(1318.5, 0.7, 0.03); e.sparkle(0.8, 3, 0.012); e.whoosh(0.6, 3, 0.05); e.whoosh(6, 1.6, 0.08); },
  };

  // ---------------------------------------------------------------- 2. Paris at night: 3, 2, 1... sparkle
  const TW = () => phone ? { x: W * 0.5, base: H * 0.8, h: H * 0.52 } : { x: W * 0.72, base: H * 0.84, h: Math.min(H * 0.72, W * 0.55) };
  const hw = (v, h) => h * (0.19 * Math.exp(-v * 4.3) + 0.006);
  function towerPath(x, base, h) {
    const P = new Path2D();
    P.moveTo(x - hw(0, h), base); for (let v = 0; v <= 0.93; v += 0.01) P.lineTo(x - hw(v, h), base - v * h);
    P.lineTo(x - h * 0.004, base - 0.97 * h); P.lineTo(x + h * 0.004, base - 0.97 * h);
    for (let v = 0.93; v >= 0; v -= 0.01) P.lineTo(x + hw(v, h), base - v * h); P.closePath();
    // the big arch between the legs
    P.moveTo(x + hw(0, h) * 0.62, base); P.ellipse(x, base, hw(0, h) * 0.62, h * 0.125, 0, 0, Math.PI, true); P.closePath();
    // the open space between first and second platforms
    P.moveTo(x - hw(0.19, h) * 0.55, base - 0.19 * h); for (let v = 0.19; v <= 0.34; v += 0.01) P.lineTo(x - hw(v, h) * 0.55 * (1 - (v - 0.19) * 3), base - v * h);
    for (let v = 0.34; v >= 0.19; v -= 0.01) P.lineTo(x + hw(v, h) * 0.55 * (1 - (v - 0.19) * 3), base - v * h); P.closePath();
    return P;
  }
  const towerPoint = (u, v) => { const T = TW(); return [T.x + (u - 0.5) * 2 * hw(v, T.h) * 0.9, T.base - v * T.h]; };
  const eiffel = {
    D: 9.4, facts: ["insider", "call"], cy: () => (phone ? H * 0.17 : H * 0.42), cx: () => (phone ? W / 2 : W * 0.33), maxW: () => (phone ? W * 0.88 : W * 0.56),
    init(S) {
      S.st = stars(140, 0.5); S.sp = Array.from({ length: 220 }, () => ({ u: Math.random(), v: Math.pow(Math.random(), 1.3) * 0.92, ph: rnd(0, 6) }));
      S.bld = []; let x = -10; while (x < W + 20) { const w = rnd(60, 110) * (phone ? 0.6 : 1); S.bld.push({ x, w, h: rnd(0.07, 0.12) * H, ch: Math.floor(rnd(1, 4)), win: Array.from({ length: 12 }, () => Math.random()) }); x += w; }
    },
    draw(c, t, S) {
      const T = TW(), wl = H * 0.86;
      sky(c, ["#040622", "#0e1442", "#2a2056"], 0, wl); drawStars(c, S.st, t, 0.7);
      const mr = Math.min(W, H) * 0.035; c.fillStyle = "#f2f0ff"; c.beginPath(); c.arc(W * 0.1, H * 0.12, mr, 0, TAU); c.fill(); c.fillStyle = "#0e1442"; c.beginPath(); c.arc(W * 0.1 + mr * 0.4, H * 0.12 - mr * 0.2, mr * 0.9, 0, TAU); c.fill();
      // searchlight from the top
      const ang = t * 0.9, tx = T.x, ty = T.base - T.h * 0.95; c.save(); c.translate(tx, ty); c.rotate(ang); const bg = c.createLinearGradient(0, 0, W, 0); bg.addColorStop(0, "rgba(255,240,200,.28)"); bg.addColorStop(1, "rgba(255,240,200,0)"); c.fillStyle = bg; c.beginPath(); c.moveTo(0, 0); c.lineTo(W, -W * 0.05); c.lineTo(W, W * 0.05); c.fill(); c.restore();
      // Haussmann rooftops: cream fronts, blue-grey mansard roofs, chimneys, lit windows
      const by = wl - H * 0.02;
      S.bld.forEach((b) => {
        c.fillStyle = "#3a3654"; c.fillRect(b.x, by - b.h, b.w - 2, b.h);
        c.fillStyle = "#26304a"; c.beginPath(); c.moveTo(b.x - 2, by - b.h); c.lineTo(b.x + 6, by - b.h - b.h * 0.35); c.lineTo(b.x + b.w - 8, by - b.h - b.h * 0.35); c.lineTo(b.x + b.w, by - b.h); c.fill();
        c.fillStyle = "#1a2036"; for (let i = 0; i < b.ch; i++) c.fillRect(b.x + 10 + i * (b.w / 3), by - b.h - b.h * 0.5, 6, b.h * 0.2);
        for (let i = 0; i < 12; i++) { if (b.win[i] < 0.45) continue; const col = i % 4, row = Math.floor(i / 4); c.fillStyle = "rgba(255,210,130,.8)"; c.fillRect(b.x + 6 + col * (b.w - 12) / 4, by - b.h + 8 + row * b.h * 0.28, (b.w - 12) / 4 - 6, b.h * 0.14); }
      });
      // the tower
      glow(c, T.x, T.base - T.h * 0.3, T.h * 0.7, "rgba(255,170,70,.22)");
      const P = towerPath(T.x, T.base, T.h), g = c.createLinearGradient(0, T.base, 0, T.base - T.h); g.addColorStop(0, "#ffb347"); g.addColorStop(0.5, "#e8902a"); g.addColorStop(1, "#c86a1a");
      c.fillStyle = g; c.fill(P, "evenodd");
      c.save(); c.clip(P, "evenodd"); c.strokeStyle = "rgba(90,40,10,.45)"; c.lineWidth = 1; const st = Math.max(5, T.h * 0.018); c.beginPath(); for (let k = -T.h; k < T.h; k += st) { c.moveTo(T.x - T.h * 0.3, T.base - T.h * 0.3 + k); c.lineTo(T.x + T.h * 0.3, T.base - T.h * 0.3 + k - T.h * 0.6); c.moveTo(T.x - T.h * 0.3, T.base - T.h * 0.3 + k - T.h * 0.6); c.lineTo(T.x + T.h * 0.3, T.base - T.h * 0.3 + k); } c.stroke(); c.restore();
      [[0.17, 1.25, 0.024], [0.355, 1.3, 0.015], [0.9, 2, 0.01]].forEach(([v, wk, hh]) => { const w = hw(v, T.h) * 2 * wk; c.fillStyle = "#ffcf7a"; c.fillRect(T.x - w / 2, T.base - v * T.h - T.h * hh, w, T.h * hh); c.fillStyle = "rgba(90,40,10,.5)"; c.fillRect(T.x - w / 2, T.base - v * T.h - T.h * hh * 0.3, w, T.h * hh * 0.3); });
      c.strokeStyle = "#ffd88a"; c.lineWidth = 2; c.beginPath(); c.moveTo(T.x, T.base - 0.97 * T.h); c.lineTo(T.x, T.base - 1.02 * T.h); c.stroke(); glow(c, T.x, T.base - 1.02 * T.h, 14 + 4 * Math.sin(t * 4), "rgba(255,255,220,.8)");
      // 3, 2, 1...
      const n = t < 0.9 ? null : t < 1.9 ? "3" : t < 2.9 ? "2" : t < 3.9 ? "1" : null;
      if (n) { const k = (t - 0.9) % 1; c.save(); c.globalAlpha = 1 - k * 0.7; c.font = `italic 900 ${Math.min(W * 0.28, 210) * (1 + k * 0.25)}px 'Playfair Display', serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.lineWidth = 6; c.strokeStyle = "rgba(5,4,14,.6)"; const nx = phone ? W / 2 : W * 0.33, ny = phone ? H * 0.3 : H * 0.42; c.strokeText(n, nx, ny); c.fillStyle = "#fff"; c.shadowColor = "#ffd36b"; c.shadowBlur = 30; c.fillText(n, nx, ny); c.restore(); }
      // ...the sparkle: white lights flicker all over the tower
      if (t > 3.9) { const a = clamp((t - 3.9) / 0.3); S.sp.forEach((p) => { if (Math.sin(t * 17 + p.ph * 10) > 0.35) { const [px, py] = towerPoint(p.u, p.v); c.fillStyle = `rgba(255,255,255,${a})`; c.fillRect(px - 1.5, py - 1.5, 3, 3); glow(c, px, py, 7, `rgba(255,255,255,${0.6 * a})`); } }); if (t < 4.2) { c.fillStyle = `rgba(255,255,255,${0.15 * (1 - (t - 3.9) / 0.3)})`; c.fillRect(0, 0, W, H); } }
      // the river with the lights reflected
      const g2 = c.createLinearGradient(0, wl, 0, H); g2.addColorStop(0, "#141a40"); g2.addColorStop(1, "#06081a"); c.fillStyle = g2; c.fillRect(0, wl, W, H - wl);
      for (let i = 0; i < 18; i++) { const y = wl + 4 + i * 5, w = 30 - i; c.fillStyle = `rgba(255,190,90,${0.35 - i * 0.015})`; c.fillRect(T.x - w + Math.sin(t * 2 + i) * 6, y, w * 2, 2); }
      c.fillStyle = "rgba(255,210,130,.25)"; for (let i = 0; i < 30; i++) c.fillRect((i * 53) % W, wl + 10 + (i % 6) * 9, 16, 1.5);
    },
    // after the sparkle, the letters fly off the tower
    text: { at: 4.3, spread: 1.0, dur: 1.0, startScale: 0.2, spin: 0.8, arc: -H * 0.04, glow: "rgba(255,255,255,1)", ink: ["#fff7d6", "#ffd36b", "#ffffff"], from: (p) => towerPoint(p.r, 0.1 + p.q * 0.8) },
    sound(e) {
      const v = [659, 698, 659, 587, 523, 587, 659, 0, 523, 494, 440, 494, 523, 587, 659, 0, 659, 698, 784, 698, 659, 587, 523, 494, 440];
      e.melody(v, 4.1, 0.24, 0.03, "triangle", 0.85); e.melody(v.map((f) => (f ? f * 1.004 : 0)), 4.1, 0.24, 0.02, "square", 0.6);
      [0.9, 1.9, 2.9].forEach((a) => e.beep(a, 660, 0.06)); e.beep(3.9, 990, 0.07); e.sparkle(3.9, 2.5, 0.015);
    },
  };

  // ---------------------------------------------------------------- 3. sunrise over a canal town, punting
  function punt(c, x, y, s, t) {
    c.save(); c.translate(x, y);
    // passengers: one waving, one pointing at the view
    person(c, -30 * s, -4 * s, s * 0.85, { top: "#ff7ab8", legs: "#2a2350", hair: "#e8c070", long: true, legB: [1.4, -1.4], legF: [1.3, -1.3], armB: [Math.PI - 0.3 + Math.sin(t * 6) * 0.35, 0.3], armF: [0.6, -0.4], lean: -0.05 });
    person(c, 0, -4 * s, s * 0.85, { top: "#2ec7d9", legs: "#2a2350", hair: "#3a2418", legB: [1.4, -1.4], legF: [1.3, -1.3], armB: [0.4, -0.6], armF: [2.0, -0.1], lean: 0.05 });
    // the hull
    c.fillStyle = "#6a4422"; c.beginPath(); c.moveTo(-74 * s, -10 * s); c.lineTo(66 * s, -10 * s); c.lineTo(60 * s, 4 * s); c.lineTo(-68 * s, 4 * s); c.fill(); c.fillStyle = "#8a5a2e"; c.fillRect(-74 * s, -12 * s, 140 * s, 4 * s);
    // the punter at the back, both hands on the pole, straw boater
    const sw = Math.sin(t * 1.4), pr = person(c, 44 * s, -12 * s, s, { top: "#f5f5f5", legs: "#2a2350", hair: "#3a2418", legB: [0.2, 0], legF: [-0.15, 0], armB: [1.9 + sw * 0.15, -0.9], armF: [1.4 + sw * 0.15, -0.5], lean: 0.12 + sw * 0.05 });
    c.fillStyle = "#e8d48a"; c.fillRect(pr.head[0] - 11 * s, pr.head[1] - 9 * s, 22 * s, 3 * s); c.fillRect(pr.head[0] - 7 * s, pr.head[1] - 15 * s, 14 * s, 7 * s); c.fillStyle = "#c0303a"; c.fillRect(pr.head[0] - 7 * s, pr.head[1] - 10 * s, 14 * s, 2 * s);
    c.strokeStyle = "#a07a40"; c.lineWidth = 3 * s; c.beginPath(); const hx = (pr.handB[0] + pr.handF[0]) / 2, hy = (pr.handB[1] + pr.handF[1]) / 2, ang = 1.25 + sw * 0.12; c.moveTo(hx - Math.cos(ang) * 50 * s, hy - Math.sin(ang) * 50 * s); c.lineTo(hx + Math.cos(ang) * 70 * s, hy + Math.sin(ang) * 70 * s); c.stroke();
    c.restore();
  }
  const puntX = (t) => lerp(-0.05, phone ? 0.55 : 0.5, ease(t / 6)) * W;
  const colmar = {
    D: 9.4, facts: ["call", "shelter", "watch"], cy: () => H * (phone ? 0.2 : 0.22),
    init(S) {
      const cols = ["#f6b3a6", "#ffd98a", "#a9d8f0", "#b7e3b0", "#e7b8f0", "#ffc48a", "#9fd6c8", "#f3e3b8"]; let x = -20; S.h = [];
      while (x < W * 1.6) { const w = rnd(64, 104) * (phone ? 0.7 : 1); S.h.push({ x, w, h: rnd(0.16, 0.27) * H, c: cols[S.h.length % cols.length], fl: Math.random() > 0.3, dorm: Math.random() > 0.5 }); x += w + 2; }
      S.ducks = [[0.75, 0], [0.8, 1.3], [0.84, 2.1]];
    },
    draw(c, t, S, D) {
      const pan = easeIO((t - (D - 2)) / 2) * W * 0.45, wl = H * 0.66, sunY = lerp(H * 0.6, H * 0.36, ease(t / 6)), sx = W * 0.62;
      sky(c, ["#6a7ac8", "#f0a0b8", "#ffcf9a", "#ffe8c0"], 0, wl);
      glow(c, sx, sunY, H * 0.5, "rgba(255,200,140,.6)"); c.fillStyle = "#fff0c8"; c.beginPath(); c.arc(sx, sunY, Math.min(W, H) * 0.055, 0, TAU); c.fill();
      for (let i = 0; i < 10; i++) { c.save(); c.translate(sx, sunY); c.rotate(-Math.PI / 2 + (i - 4.5) * 0.22); c.fillStyle = "rgba(255,230,180,.08)"; c.beginPath(); c.moveTo(0, 0); c.lineTo(H, -30); c.lineTo(H, 30); c.fill(); c.restore(); }
      c.save(); c.translate(-pan, 0);
      // half-timbered houses with steep roofs, dormers and window boxes of red flowers
      S.h.forEach((b) => {
        const y = wl - b.h; c.fillStyle = b.c; c.fillRect(b.x, y, b.w - 2, b.h);
        c.fillStyle = "#8a3a2a"; c.beginPath(); c.moveTo(b.x - 5, y); c.lineTo(b.x + b.w / 2, y - b.h * 0.6); c.lineTo(b.x + b.w + 3, y); c.fill();
        if (b.dorm) { c.fillStyle = b.c; c.fillRect(b.x + b.w * 0.38, y - b.h * 0.3, b.w * 0.24, b.h * 0.16); c.fillStyle = "#8a3a2a"; c.beginPath(); c.moveTo(b.x + b.w * 0.34, y - b.h * 0.3); c.lineTo(b.x + b.w * 0.5, y - b.h * 0.42); c.lineTo(b.x + b.w * 0.66, y - b.h * 0.3); c.fill(); }
        c.strokeStyle = "#5a2e1a"; c.lineWidth = 3; c.strokeRect(b.x, y, b.w - 2, b.h); c.beginPath(); c.moveTo(b.x, y + b.h * 0.45); c.lineTo(b.x + b.w, y + b.h * 0.45); c.moveTo(b.x, y); c.lineTo(b.x + b.w * 0.3, y + b.h * 0.45); c.moveTo(b.x + b.w, y); c.lineTo(b.x + b.w * 0.7, y + b.h * 0.45); c.moveTo(b.x + b.w / 2, y + b.h * 0.45); c.lineTo(b.x + b.w / 2, y + b.h); c.stroke();
        c.fillStyle = "rgba(255,240,200,.9)"; [0.18, 0.62].forEach((u) => { c.fillRect(b.x + b.w * u, y + b.h * 0.12, b.w * 0.18, b.h * 0.2); c.fillRect(b.x + b.w * u, y + b.h * 0.56, b.w * 0.18, b.h * 0.2); });
        if (b.fl) { [0.16, 0.6].forEach((u) => { c.fillStyle = "#3a7a3a"; c.fillRect(b.x + b.w * u, y + b.h * 0.33, b.w * 0.22, 4); c.fillStyle = "#e0303a"; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(b.x + b.w * u + 3 + k * b.w * 0.055, y + b.h * 0.33, 2.6, 0, TAU); c.fill(); } }); }
      });
      // a stone bridge
      const bx = W * 0.05, bw = W * 0.2; c.fillStyle = "#b8a890"; c.beginPath(); c.moveTo(bx, wl - 30 * s0); c.lineTo(bx + bw, wl - 30 * s0); c.lineTo(bx + bw, wl + 4); c.lineTo(bx + bw * 0.8, wl + 4); c.arc(bx + bw / 2, wl + 4, bw * 0.3, 0, Math.PI, true); c.lineTo(bx, wl + 4); c.fill();
      // canal with reflections and ripples
      const g = c.createLinearGradient(0, wl, 0, H); g.addColorStop(0, "#6a7ab0"); g.addColorStop(1, "#2a3060"); c.fillStyle = g; c.fillRect(-20, wl, W * 1.7, H - wl);
      c.save(); c.globalAlpha = 0.3; c.translate(0, wl * 2); c.scale(1, -1); S.h.forEach((b) => { c.fillStyle = b.c; c.fillRect(b.x, wl - b.h, b.w - 2, b.h); }); c.restore();
      c.restore();
      c.strokeStyle = "rgba(255,230,180,.45)"; c.lineWidth = 2; for (let i = 0; i < 14; i++) { const y = wl + 10 + i * 12, x = sx + Math.sin(t * 2 + i) * 20; c.beginPath(); c.moveTo(x - 30 + i * 2, y); c.lineTo(x + 30 - i * 2, y); c.stroke(); }
      // ducks
      S.ducks.forEach(([u, ph]) => { const x = (u * W - t * 12 - pan) % (W * 1.2), y = wl + H * 0.12 + Math.sin(t * 2 + ph) * 2; c.fillStyle = "#f5f0e0"; c.beginPath(); c.ellipse(x, y, 10 * s0, 6 * s0, 0, 0, TAU); c.arc(x - 8 * s0, y - 6 * s0, 4 * s0, 0, TAU); c.fill(); c.fillStyle = "#ff9a2a"; c.fillRect(x - 15 * s0, y - 6 * s0, 4 * s0, 2 * s0); });
      // the punt glides along; at the end we follow it out of town
      const px = puntX(t), py = wl + (H - wl) * 0.42; c.fillStyle = "rgba(255,255,255,.25)"; c.beginPath(); c.ellipse(px, py + 8 * s0, 90 * s0, 6 * s0, 0, 0, TAU); c.fill();
      punt(c, px, py, s0 * (phone ? 1.05 : 1.25), t);
    },
    // the letters rise out of the water's reflection in the sunrise light
    text: { at: 2.4, spread: 1.4, dur: 1.2, startScale: 0.5, spin: 0.3, ease: (k) => easeIO(k), glow: "rgba(255,190,110,1)", ink: ["#fff3c4", "#ffd36b", "#ff9d2e"], from: (p) => [p.tx + (p.r - 0.5) * 40, H * (0.72 + p.q * 0.18)] },
    sound(e) { e.waves(0, 9.4, 0.06, 2); e.birds(0.4, 14, 0.02); e.bell(392, 1.2, 0.05); e.bell(392, 3.2, 0.04); [261.63, 329.63, 392, 523.25].forEach((f, i) => e.tone(f, 0.3 + i * 0.6, 6, 0.03)); e.splash(2, 0.03); e.splash(5, 0.03); },
  };

  // ---------------------------------------------------------------- 4. the punt arrives at a Singapore waterfront office: SGX FX
  const SG = () => (phone ? { x: W * 0.5, w: W * 0.34, top: H * 0.3 } : { x: W * 0.7, w: Math.min(W * 0.16, 200), top: H * 0.12 });
  const sgx = {
    D: 9.2, facts: ["shelter", "watch", "call", "busiest"], cy: () => (phone ? H * 0.14 : H * 0.36), cx: () => (phone ? W / 2 : W * 0.32), maxW: () => (phone ? W * 0.88 : W * 0.52),
    init(S) {
      const cols = [["#3a7aa8", "#9ad0f0"], ["#2a5a8a", "#7ab8e0"], ["#4a8aa0", "#b0e0f0"], ["#5a6a9a", "#a8b8e8"]];
      S.t = []; let x = -10; while (x < W + 20) { const w = rnd(46, 90) * (phone ? 0.6 : 1); S.t.push({ x, w, h: rnd(0.2, 0.42) * H, c: cols[S.t.length % 4], cap: Math.random() }); x += w + rnd(6, 20); }
      S.cl = Array.from({ length: 4 }, (_, i) => ({ x: rnd(0, 1), y: rnd(0.05, 0.2), r: rnd(30, 50) * s0, sd: i }));
    },
    draw(c, t, S) {
      const wl = H * 0.74, B = SG();
      sky(c, ["#7ab0e8", "#bfe0f8", "#ffe2c0"], 0, wl); glow(c, W * 0.12, H * 0.2, H * 0.3, "rgba(255,240,200,.6)");
      S.cl.forEach((q) => cloud(c, ((q.x * W + t * 8) % (W + 200)) - 100, q.y * H, q.r, "rgba(255,255,255,.85)", 5, q.sd));
      // the skyline: glass towers with mullions
      S.t.forEach((b) => { if (Math.abs(b.x + b.w / 2 - B.x) < B.w * 0.8) return; const g = c.createLinearGradient(b.x, 0, b.x + b.w, 0); g.addColorStop(0, b.c[0]); g.addColorStop(1, b.c[1]); c.fillStyle = g; c.fillRect(b.x, wl - b.h, b.w, b.h); c.strokeStyle = "rgba(255,255,255,.25)"; c.lineWidth = 1; c.beginPath(); for (let k = 8; k < b.w; k += 8) { c.moveTo(b.x + k, wl - b.h); c.lineTo(b.x + k, wl); } c.stroke(); if (b.cap > 0.6) { c.fillStyle = b.c[0]; c.beginPath(); c.moveTo(b.x, wl - b.h); c.lineTo(b.x + b.w / 2, wl - b.h - 24 * s0); c.lineTo(b.x + b.w, wl - b.h); c.fill(); } });
      // the office tower with SGX FX on it
      const h = wl - B.top, x0 = B.x - B.w / 2, g = c.createLinearGradient(x0, 0, x0 + B.w, 0); g.addColorStop(0, "#1e3a5a"); g.addColorStop(0.5, "#4a8ab8"); g.addColorStop(1, "#24486a");
      c.fillStyle = g; c.beginPath(); c.moveTo(x0, wl); c.lineTo(x0, B.top + 30 * s0); c.lineTo(x0 + B.w * 0.75, B.top); c.lineTo(x0 + B.w, B.top + 12 * s0); c.lineTo(x0 + B.w, wl); c.fill();
      c.strokeStyle = "rgba(255,255,255,.22)"; c.lineWidth = 1; c.beginPath(); for (let y = B.top + 40 * s0; y < wl; y += 10) { c.moveTo(x0, y); c.lineTo(x0 + B.w, y); } for (let k = 10; k < B.w; k += 12) { c.moveTo(x0 + k, B.top + 30 * s0); c.lineTo(x0 + k, wl); } c.stroke();
      c.fillStyle = "rgba(255,255,255,.18)"; c.beginPath(); c.moveTo(x0 + B.w * 0.1, wl); c.lineTo(x0 + B.w * 0.3, B.top + 40 * s0); c.lineTo(x0 + B.w * 0.42, B.top + 40 * s0); c.lineTo(x0 + B.w * 0.22, wl); c.fill();
      const fs = Math.min(B.w * 0.22, 34 * s0 + 8); c.fillStyle = "rgba(10,20,40,.75)"; c.fillRect(x0 + B.w * 0.08, B.top + 44 * s0, B.w * 0.84, fs * 1.5);
      c.fillStyle = "#ffffff"; c.font = `800 ${fs}px Inter, system-ui, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.shadowColor = "rgba(46,242,255,.8)"; c.shadowBlur = 10; c.fillText("SGX FX", B.x, B.top + 44 * s0 + fs * 0.78); c.shadowBlur = 0;
      // promenade with palms
      c.fillStyle = "#c8b89a"; c.fillRect(0, wl - 6 * s0, W, 8 * s0);
      for (let i = 0; i < (phone ? 3 : 6); i++) palm(c, W * (0.06 + i * (phone ? 0.36 : 0.17)), wl - 4 * s0, s0 * 0.75, t + i, "#2a7a4a", "#8a6a4a");
      // the river
      const g2 = c.createLinearGradient(0, wl, 0, H); g2.addColorStop(0, "#3a7ab0"); g2.addColorStop(1, "#1a3a60"); c.fillStyle = g2; c.fillRect(0, wl + 2 * s0, W, H - wl);
      c.save(); c.globalAlpha = 0.25; c.translate(0, wl * 2 + 4); c.scale(1, -1); c.fillStyle = "#4a8ab8"; c.fillRect(x0, wl - h, B.w, h); c.restore();
      c.strokeStyle = "rgba(255,255,255,.3)"; c.lineWidth = 1.5; for (let i = 0; i < 12; i++) { const y = wl + 12 + i * 10, x = (i * 97 + t * 20) % W; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40, y); c.stroke(); }
      // the punt from the canal town arrives, everyone waving
      const px = lerp(-0.1, phone ? 0.3 : 0.42, ease(t / 4)) * W; c.fillStyle = "rgba(255,255,255,.25)"; c.beginPath(); c.ellipse(px, wl + (H - wl) * 0.45 + 8, 90 * s0, 6 * s0, 0, 0, TAU); c.fill();
      punt(c, px, wl + (H - wl) * 0.45, s0 * (phone ? 1 : 1.15), t * 1.3);
    },
    // the letters stream out of the office windows
    text: { at: 2.8, spread: 1.2, dur: 1.0, startScale: 0.2, spin: 0.6, glow: "rgba(46,242,255,.9)", ink: ["#2ef2ff", "#6b5cff", "#b44dff"], from(p) { const B = SG(); return [B.x + (p.r - 0.5) * B.w * 0.8, B.top + 60 * s0 + p.q * (H * 0.74 - B.top - 80 * s0)]; } },
    sound(e) { e.noise("lowpass", 400, 0.5, 0, 9.2, [[0, 0], [1, 0.05], [8.6, 0.05], [9.2, 0]]); e.waves(0, 9, 0.04, 2.2); e.birds(1, 6, 0.015); e.bell(523.25, 2.8, 0.03); e.bell(659.25, 3.3, 0.025); e.bell(783.99, 3.8, 0.02); },
  };

  return [shooting, eiffel, colmar, sgx];
});
