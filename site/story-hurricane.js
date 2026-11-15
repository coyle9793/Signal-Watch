// Hurricane story: tornado over farmland -> earthquake in the city -> sinkhole on a shopping street ->
// the sea pulls back from a beach -> the tsunami rolls in. Buildings, objects and landscapes only.
WXS.add("hurricane", (K) => {
  const { W, H, rnd, clamp, ease, easeIO, lerp, TAU, sky, glow, ridge, hill, cloud, tree, city, drawCity, car, lamp, rainLines, palm } = K;
  const s0 = Math.min(W, H) / 700, phone = W < 600;

  // ---------------------------------------------------------------- 1. tornado over farmland
  const fx = (t) => W * (phone ? lerp(0.62, 0.7, ease(t / 7)) : lerp(0.66, 0.74, easeIO(t / 7))) + Math.sin(t * 0.9) * W * 0.02;
  const gy1 = H * 0.7, top1 = H * 0.2;
  const funnelW = (h) => lerp(W * (phone ? 0.035 : 0.022), W * (phone ? 0.26 : 0.17), Math.pow(h, 1.7)); // h: 0 ground .. 1 cloud base
  const funnelX = (h, t) => fx(t) + Math.sin(t * 2.2 + h * 4) * 14 * h + Math.sin(t * 5 + h * 9) * 4 * (1 - h) - (1 - h) * (1 - h) * 30 * s0;
  const tornado = {
    D: 7.2, facts: ["market"], calm: false, cy: () => H * (phone ? 0.36 : 0.42), cx: () => (phone ? W / 2 : W * 0.4),
    init(S) {
      S.deb = Array.from({ length: phone ? 50 : 90 }, () => ({ h: Math.pow(Math.random(), 0.7), a: rnd(0, TAU), v: rnd(2.2, 4.5), k: Math.floor(rnd(0, 4)), s: rnd(0.6, 1.4), sp: rnd(-6, 6) }));
      S.cl = Array.from({ length: 16 }, (_, i) => ({ x: (i / 15) * W * 1.3 - W * 0.15, y: rnd(0.04, 0.16) * H, r: rnd(60, 130) * s0 * (phone ? 1.2 : 1), sd: rnd(0, 9) }));
      S.far = ridge(1.7, H * 0.035, H * 0.6); S.mid = ridge(4.2, H * 0.02, H * 0.64);
      S.posts = Array.from({ length: 14 }, (_, i) => i);
    },
    draw(c, t, S) {
      const x0 = fx(t), flash = (t > 2.6 && t < 2.75) || (t > 5.1 && t < 5.2) ? 1 : 0;
      // supercell sky: green-grey, darker overhead
      sky(c, ["#1c2620", "#33423a", "#56664f", "#8a9474"], 0, H * 0.66);
      glow(c, W * 0.15, H * 0.62, W * 0.5, "rgba(200,190,140,.25)");
      // far hills and fields
      hill(c, S.far, "#3a4636"); hill(c, S.mid, "#4a5a38");
      sky(c, ["#5a6a3a", "#3e4c28", "#2c381c"], H * 0.66, H);
      // crop rows running towards the horizon
      c.strokeStyle = "rgba(30,40,18,.55)"; c.lineWidth = 2; c.beginPath();
      for (let i = -14; i <= 14; i++) { c.moveTo(W * 0.5 + i * W * 0.012, H * 0.665); c.lineTo(W * 0.5 + i * W * 0.11, H + 10); } c.stroke();
      c.strokeStyle = "rgba(160,170,90,.18)"; c.lineWidth = 1; c.beginPath(); for (let i = 1; i < 9; i++) { const y = H * 0.665 + Math.pow(i / 9, 2) * H * 0.34; c.moveTo(0, y); c.lineTo(W, y); } c.stroke();
      // barn and silo, windmill, trees bending in the wind
      const bx = W * (phone ? 0.08 : 0.16), by = H * 0.67, bs = s0 * 1.1;
      c.fillStyle = "#7a2a24"; c.fillRect(bx, by - 40 * bs, 60 * bs, 40 * bs); c.beginPath(); c.moveTo(bx - 5 * bs, by - 40 * bs); c.lineTo(bx + 30 * bs, by - 64 * bs); c.lineTo(bx + 65 * bs, by - 40 * bs); c.fill();
      c.strokeStyle = "#e8dccc"; c.lineWidth = 2 * bs; c.strokeRect(bx + 20 * bs, by - 24 * bs, 20 * bs, 24 * bs); c.beginPath(); c.moveTo(bx + 20 * bs, by - 24 * bs); c.lineTo(bx + 40 * bs, by); c.moveTo(bx + 40 * bs, by - 24 * bs); c.lineTo(bx + 20 * bs, by); c.stroke();
      c.fillStyle = "#9aa0a8"; c.fillRect(bx + 68 * bs, by - 66 * bs, 18 * bs, 66 * bs); c.beginPath(); c.arc(bx + 77 * bs, by - 66 * bs, 9 * bs, Math.PI, TAU); c.fill();
      const wx = W * (phone ? 0.38 : 0.34), wy = H * 0.665;
      c.strokeStyle = "#2a2a2a"; c.lineWidth = 2 * s0; c.beginPath(); c.moveTo(wx - 10 * s0, wy); c.lineTo(wx, wy - 70 * s0); c.lineTo(wx + 10 * s0, wy); c.stroke();
      for (let i = 0; i < 8; i++) { const a = t * 9 + (i / 8) * TAU; c.beginPath(); c.moveTo(wx, wy - 70 * s0); c.lineTo(wx + Math.cos(a) * 16 * s0, wy - 70 * s0 + Math.sin(a) * 16 * s0); c.stroke(); }
      [0.04, 0.27, 0.5, 0.92].forEach((u, i) => { const tx = W * u, lean = Math.sin(t * 3 + i) * 3 + (tx < x0 ? 6 : -6); tree(c, tx, H * 0.675, s0 * (0.7 + (i % 2) * 0.2), { sway: lean * s0, col: "#2f4a2a", dark: "#22381f", trunk: "#3a2a1a" }); });
      // fence across the foreground
      c.strokeStyle = "#4a3a26"; c.lineWidth = 3 * s0; c.beginPath(); const fy = H * 0.86;
      S.posts.forEach((i) => { const x = (i / 13) * W; c.moveTo(x, fy); c.lineTo(x, fy - 30 * s0); }); c.moveTo(0, fy - 22 * s0); c.lineTo(W, fy - 22 * s0); c.moveTo(0, fy - 10 * s0); c.lineTo(W, fy - 10 * s0); c.stroke();
      // rain curtain beside the funnel
      c.save(); c.globalAlpha = 0.5; rainLines(c, phone ? 60 : 120, t, { slant: 0.5, speed: 2.4, col: "rgba(200,210,200,.35)", len: 24, skip: (x) => x > x0 - W * 0.05 }); c.restore();
      // the funnel: a dark core with lighter swirling bands, and a dust cloud where it meets the ground
      for (let k = 0; k <= 46; k++) {
        const h = k / 46, y = lerp(gy1, top1, h), w = funnelW(h), x = funnelX(h, t);
        c.fillStyle = `rgba(${lerp(96, 60, h)},${lerp(92, 66, h)},${lerp(84, 64, h)},${0.75 - h * 0.25})`;
        c.beginPath(); c.ellipse(x, y, w, w * 0.16 + 3, 0, 0, TAU); c.fill();
        if (k % 3 === 0) { c.strokeStyle = "rgba(210,210,195,.22)"; c.lineWidth = 2 + h * 2; c.beginPath(); c.ellipse(x, y, w * 0.92, w * 0.14 + 2, 0, t * 5 + k, t * 5 + k + 2.4); c.stroke(); }
      }
      // the wall cloud it hangs from
      S.cl.forEach((q, i) => cloud(c, q.x + Math.sin(t * 0.4 + i) * 10, q.y + H * 0.06, q.r, i % 2 ? "#26302a" : "#2e3a32", 6, q.sd));
      cloud(c, x0, top1 - 10 * s0, W * 0.12, "#202a24", 7, 3);
      for (let i = 0; i < 10; i++) { const a = t * 2 + i, r = 40 + (i % 4) * 22; glow(c, x0 + Math.cos(a) * r * s0, gy1 - 10 * s0 + Math.sin(a) * 6 * s0, (60 + (i % 3) * 30) * s0, "rgba(120,100,70,.32)"); }
      // debris: planks, leaves, hay and tin sheets circling the funnel
      S.deb.forEach((d) => {
        const a = d.a + t * d.v * (1.3 - d.h * 0.6), h = d.h, w = funnelW(h) * 1.15 + 10, x = funnelX(h, t) + Math.cos(a) * w, y = lerp(gy1, top1, h) + Math.sin(a) * w * 0.2;
        c.save(); c.translate(x, y); c.rotate(t * d.sp); c.globalAlpha = Math.sin(a) < 0 ? 0.55 : 1; const z = d.s * s0;
        if (d.k === 0) { c.fillStyle = "#8a6a44"; c.fillRect(-10 * z, -2 * z, 20 * z, 4 * z); }
        else if (d.k === 1) { c.fillStyle = "#4a7a2a"; c.beginPath(); c.ellipse(0, 0, 4 * z, 2 * z, 0, 0, TAU); c.fill(); }
        else if (d.k === 2) { c.fillStyle = "#c9b26a"; c.fillRect(-5 * z, -4 * z, 10 * z, 8 * z); }
        else { c.fillStyle = "#9aa2aa"; c.fillRect(-8 * z, -1 * z, 16 * z, 2 * z); }
        c.restore();
      });
      if (flash) { c.fillStyle = "rgba(230,240,255,.25)"; c.fillRect(0, 0, W, H); }
    },
    // the letters are caught in the funnel with the debris, then fly out and land
    text: {
      at: 3.6, spread: 1.1, dur: 1.0, pre: 0.4, preScale: 0.55, preFade: 0.6, spin: 1.2, glow: "rgba(46,242,255,.8)",
      from(p, S, t) { const h = 0.12 + p.q * 0.75, a = p.r * TAU + t * (3.2 - h * 1.4), w = funnelW(h) * 1.25 + 14; return [funnelX(h, t) + Math.cos(a) * w, lerp(gy1, top1, h) + Math.sin(a) * w * 0.2]; },
    },
    sound(e) { e.wind(0, 7.4, 0.55, 260, 620); e.rumble(0, 7.4, 0.45); e.crackle(0.5, 6.5, 6, 0.08); e.thunder(2.6, 0.35); e.thunder(5.1, 0.25); e.whoosh(3.5, 1.4, 0.25); },
  };

  // ---------------------------------------------------------------- 2. earthquake: the city goes dark, then windows spell the fact
  const quake = {
    D: 7.6, facts: ["worst"], calm: false, cy: () => H * 0.42,
    init(S) {
      S.far = city(0.25, 0.45, { wMin: 30, wMax: 60 });
      S.side = city(0.2, 0.42).filter((b) => b.x + b.w < W * 0.18 || b.x > W * 0.82);
      S.fall = S.side.map((b, i) => (i % 2 === 0 ? 1.3 + (i % 5) * 0.3 : null));
      S.gap = phone ? 4 : 6;
      const pc = document.createElement("canvas"); pc.width = S.gap; pc.height = S.gap; const q = pc.getContext("2d");
      q.fillStyle = "#1c1830"; q.fillRect(0, 0, S.gap, S.gap); q.fillStyle = "#0e0c1a"; q.fillRect(1, 1, S.gap - 2, S.gap - 2);
      S.pat = pc;
    },
    draw(c, t, S, D, L) {
      const shake = t > 0.5 && t < 3.3 ? Math.sin(t * 61) * 7 * s0 * clamp((t - 0.5) / 0.4) * (1 - clamp((t - 2.9) / 0.4)) : 0;
      c.save(); c.translate(shake, Math.cos(t * 47) * shake * 0.5);
      const gy = H * 0.82, dark = clamp((t - 2.6) / 0.4), back = clamp((t - 6) / 1);
      sky(c, ["#0c0a1e", "#1e1636", "#3a2440"], -20, gy);
      drawCity(c, S.far, gy - H * 0.06, "#1a1530", (b, i, k, r, v) => v > 0.6 && v * 3 % 1 > dark, {});
      // the big office block in the middle; its windows will spell the fact
      const fx0 = W * 0.18, fx1 = W * 0.82, ftop = H * 0.16;
      c.fillStyle = "#14112a"; c.fillRect(fx0, ftop, fx1 - fx0, gy - ftop);
      const pat = c.createPattern(S.pat, "repeat"); const y0 = S.y0 ?? 0; pat.setTransform?.(new DOMMatrix().translate(0, y0));
      c.fillStyle = pat; c.fillRect(fx0 + 8, ftop + 10, fx1 - fx0 - 16, gy - ftop - 20);
      // before the power goes, the block is lit floor by floor
      if (dark < 1) { c.globalAlpha = 1 - dark; for (let y = ftop + 12; y < gy - 20; y += S.gap * 3) for (let x = fx0 + 10; x < fx1 - 12; x += S.gap * 3) { const hh = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; if (hh - Math.floor(hh) > 0.45) { c.fillStyle = "rgba(255,214,120,.8)"; c.fillRect(x, y, S.gap * 2, S.gap * 2); } } c.globalAlpha = 1; }
      c.fillStyle = "#0a0816"; c.fillRect(fx0 - 4, ftop - 6, fx1 - fx0 + 8, 8); c.fillRect(W * 0.46, ftop - 40 * s0, W * 0.08, 34 * s0); c.fillRect(W * 0.497, ftop - 80 * s0, 4, 40 * s0);
      glow(c, W * 0.5, ftop - 80 * s0, 10, `rgba(255,60,60,${0.5 + 0.5 * Math.sin(t * 4)})`);
      c.fillStyle = "rgba(60,50,100,.35)"; for (let y = ftop + 10; y < gy; y += S.gap * 9) c.fillRect(fx0, y, fx1 - fx0, 2);
      // side buildings: some come down (no one shown)
      drawCity(c, S.side, gy, "#231c3c", (b, i, k, r, v) => v > 0.55 && (v * 7) % 1 > dark, {
        tilt: (b, i) => (S.fall[i] && t > S.fall[i] ? (b.x < W / 2 ? -1 : 1) * Math.min(1.5, Math.pow((t - S.fall[i]) * 1.5, 2)) : 0),
        sink: (b, i) => (S.fall[i] && t > S.fall[i] ? Math.min(b.h * 0.3, (t - S.fall[i]) * 60) : 0),
      });
      S.side.forEach((b, i) => { const f = S.fall[i]; if (f && t > f + 0.4 && t < f + 4) { const a = (t - f - 0.4) / 3.6; glow(c, b.x + b.w / 2, gy - 20, (70 + a * 160) * s0, `rgba(150,130,125,${0.55 * (1 - a)})`); } });
      // the street: cracked road, lamps that go out, parked cars
      sky(c, ["#2a2436", "#15121e"], gy, H + 20);
      c.strokeStyle = "#07060c"; c.lineWidth = 3; c.beginPath(); let x = 0, y = gy + 18; c.moveTo(x, y); while (x < W) { x += 30 + ((x * 7) % 25); y = gy + 18 + Math.sin(x) * 14 * clamp(t - 0.7); c.lineTo(x, y); } c.stroke();
      for (let i = 0; i < 5; i++) lamp(c, W * (0.08 + i * 0.22), gy + 4, s0 * 0.9, (1 - dark) * (t > 1 && t < 2.6 ? (Math.sin(t * 40 + i) > 0 ? 1 : 0.2) : 1) + back * 0.8);
      car(c, W * 0.3, gy + 30 * s0, s0 * 1.1, "#5a4a8a"); car(c, W * 0.72, gy + 30 * s0, s0 * 1.1, "#8a4a5a", { flip: true });
      c.restore();
    },
    text: {
      mode: "dots", at: 3.4, spread: 1.6, dur: 0.12, crisp: 0.55, max: 2600, glow: "rgba(255,200,90,.9)", ink: ["#fff0b8", "#ffd36b", "#ffb347"],
      gap: phone ? 4 : 6, from: (p) => [p.tx, p.ty], delay: (p) => p.r * 1.6,
      dot(c, p, x, y, k, t, S, a = 1) { if (k < 0) return; const g = (S.gap || 6) - 1.5; c.fillStyle = `rgba(255,${200 + Math.round(p.q * 40)},${100 + Math.round(p.z * 60)},${(0.6 + 0.4 * Math.min(1, k * 2)) * Math.max(a, 0.75)})`; c.fillRect(x - g / 2, y - g / 2, g, g); },
    },
    sound(e) { e.rumble(0.4, 3.2, 1); e.thud(0.5, 0.6, 40); [1.3, 1.9, 2.5, 2.8].forEach((a, i) => e.crash(a, 0.3 - i * 0.03)); e.hum(3.4, 3.6, 0.04); for (let i = 0; i < 10; i++) e.osc("square", 2000, 3.4 + i * 0.16, 0.02, 0.02); },
  };

  // ---------------------------------------------------------------- 3. sinkhole on a shopping street
  const sinkhole = {
    D: 7.2, facts: ["shock"], calm: false, cy: () => H * 0.3,
    init(S) { S.hx = W * 0.5; S.hy = H * 0.8; S.R = Math.min(W * 0.34, 300 * s0 * 1.4); S.rocks = Array.from({ length: 26 }, () => ({ a: rnd(0, TAU), q: rnd(0, 1), v: rnd(0.6, 1.2) })); },
    draw(c, t, S) {
      const gy = H * 0.66;
      sky(c, ["#1c2244", "#3a3a66", "#7a5a7a"], 0, gy);
      glow(c, W * 0.8, gy, W * 0.5, "rgba(255,170,120,.25)");
      // a row of shops with awnings and lit windows
      const names = ["CAFÉ", "BOOKS", "BAKERY", "FLOWERS", "RECORDS", "DELI"], n = phone ? 3 : 6, sw = W / n;
      for (let i = 0; i < n; i++) {
        const x = i * sw, h = H * (0.24 + (i % 3) * 0.04), col = ["#4a3a5a", "#3a4a5a", "#5a4a3a"][i % 3];
        c.fillStyle = col; c.fillRect(x + 2, gy - h, sw - 4, h);
        c.fillStyle = "rgba(255,220,150,.75)"; for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) c.fillRect(x + sw * (0.12 + k * 0.28), gy - h + 14 + r * 28 * s0, sw * 0.16, 16 * s0);
        c.fillStyle = "rgba(255,230,170,.9)"; c.fillRect(x + sw * 0.1, gy - 46 * s0, sw * 0.8, 40 * s0);
        c.fillStyle = ["#e05a7a", "#3ab0a0", "#e0a03a"][i % 3]; c.beginPath(); c.moveTo(x + sw * 0.06, gy - 52 * s0); c.lineTo(x + sw * 0.94, gy - 52 * s0); c.lineTo(x + sw * 0.9, gy - 40 * s0); c.lineTo(x + sw * 0.1, gy - 40 * s0); c.fill();
        c.fillStyle = "#14101e"; c.font = `800 ${11 * s0 + 4}px Inter, sans-serif`; c.textAlign = "center"; c.fillText(names[i], x + sw / 2, gy - 58 * s0);
      }
      // pavement and road
      sky(c, ["#4a4652", "#3a3642"], gy, gy + 24 * s0); sky(c, ["#2c2a34", "#1c1a22"], gy + 24 * s0, H + 10);
      c.strokeStyle = "rgba(255,220,120,.6)"; c.setLineDash([26, 20]); c.lineWidth = 4; c.beginPath(); c.moveTo(0, H * 0.9); c.lineTo(W, H * 0.9); c.stroke(); c.setLineDash([]);
      for (let i = 0; i < 4; i++) lamp(c, W * (0.1 + i * 0.27), gy + 20 * s0, s0, 1);
      const open = ease((t - 0.9) / 2), r = open * S.R;
      // cracks first
      if (t > 0.3) { c.strokeStyle = "#0a0810"; c.lineWidth = 2.5; for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU + 0.3, L = clamp((t - 0.3) / 1) * S.R * 1.4; c.beginPath(); c.moveTo(S.hx, S.hy); let x = S.hx, y = S.hy; for (let k = 1; k <= 5; k++) { x = S.hx + Math.cos(a + Math.sin(k * 3 + i) * 0.2) * (L * k) / 5; y = S.hy + Math.sin(a + Math.sin(k * 2 + i) * 0.2) * (L * k) / 5 * 0.35; c.lineTo(x, y); } c.stroke(); } }
      // things at the edge tip in: a bench, a planter tree, a post box
      const tipT = (d) => clamp((t - 1.6 - d) / 0.9);
      [[0.62, 0, "bench"], [-0.75, 0.25, "tree"], [0.2, 0.5, "box"]].forEach(([u, d, kind]) => {
        const k = tipT(d), x = S.hx + u * S.R * 0.9, y = S.hy + (kind === "box" ? -S.R * 0.22 : 0);
        if (k >= 1) return; c.save(); c.translate(x + (S.hx - x) * k * 0.3, y + k * k * 120 * s0); c.rotate((u > 0 ? -1 : 1) * k * 1.4); c.globalAlpha = 1 - k * 0.5;
        if (kind === "bench") { c.fillStyle = "#6a4a2a"; c.fillRect(-26 * s0, -16 * s0, 52 * s0, 5 * s0); c.fillRect(-26 * s0, -28 * s0, 52 * s0, 4 * s0); c.fillStyle = "#222"; c.fillRect(-22 * s0, -12 * s0, 3 * s0, 12 * s0); c.fillRect(19 * s0, -12 * s0, 3 * s0, 12 * s0); }
        else if (kind === "tree") { c.fillStyle = "#5a4a4a"; c.fillRect(-14 * s0, -16 * s0, 28 * s0, 16 * s0); tree(c, 0, -14 * s0, s0 * 0.7); }
        else { c.fillStyle = "#c0303a"; c.fillRect(-9 * s0, -36 * s0, 18 * s0, 36 * s0); c.beginPath(); c.arc(0, -36 * s0, 9 * s0, Math.PI, TAU); c.fill(); c.fillStyle = "#111"; c.fillRect(-6 * s0, -28 * s0, 12 * s0, 2.5 * s0); }
        c.restore();
      });
      if (r > 2) {
        // the hole: jagged rim, layered soil walls, darkness below
        const rim = (a) => r * (1 + Math.sin(a * 5 + 1) * 0.06 + Math.sin(a * 11) * 0.03);
        c.fillStyle = "#6a4a30"; c.beginPath(); for (let a = 0; a <= TAU + 0.01; a += 0.12) c.lineTo(S.hx + Math.cos(a) * rim(a), S.hy + Math.sin(a) * rim(a) * 0.36); c.fill();
        const g = c.createRadialGradient(S.hx, S.hy + r * 0.08, 0, S.hx, S.hy + r * 0.08, r * 0.95); g.addColorStop(0, "#000"); g.addColorStop(0.7, "#120c10"); g.addColorStop(1, "#3a2818");
        c.fillStyle = g; c.beginPath(); for (let a = 0; a <= TAU + 0.01; a += 0.12) c.lineTo(S.hx + Math.cos(a) * rim(a) * 0.93, S.hy + Math.sin(a) * rim(a) * 0.3 + r * 0.05); c.fill();
        c.strokeStyle = "#2a2a30"; c.lineWidth = 5; c.beginPath(); for (let a = Math.PI; a <= TAU + 0.01; a += 0.12) c.lineTo(S.hx + Math.cos(a) * rim(a), S.hy + Math.sin(a) * rim(a) * 0.36); c.stroke();
        S.rocks.forEach((q) => { const k = (t * q.v + q.q) % 1; c.fillStyle = "#7a5a3a"; c.fillRect(S.hx + Math.cos(q.a) * r * (1 - k * 0.7), S.hy + Math.sin(q.a) * r * 0.34 * (1 - k) + k * 30, 3, 3); });
        glow(c, S.hx, S.hy - r * 0.2, r * 1.2 * clamp((t - 1) / 1), `rgba(140,120,110,${0.35 * (1 - clamp((t - 3) / 2))})`);
      }
    },
    // the letters burst up out of the hole and arc into place
    text: { at: 2.7, spread: 0.9, dur: 1.15, arc: H * 0.22, startScale: 0.2, spin: 1.6, glow: "rgba(255,200,110,.9)", ink: ["#ffe08a", "#ffb347", "#ff6a3d"], from: (p) => [W * 0.5 + (p.r - 0.5) * Math.min(W * 0.3, 260), H * 0.8] },
    sound(e) { e.rumble(0.2, 3.5, 0.8); e.crackle(0.3, 2.2, 22, 0.12); e.crash(1.2, 0.4); e.thud(1.9, 0.5); e.thud(2.3, 0.35); e.whoosh(2.6, 1.2, 0.18); },
  };

  // ---------------------------------------------------------------- 4 and 5. the beach: sea pulls back, then the wave
  function beach(c, t, S, wind = 0) {
    const hz = H * 0.3;
    sky(c, ["#5aa8e8", "#9cd0f0", "#fbe6c4"], 0, hz);
    glow(c, W * 0.2, hz * 0.4, H * 0.3, "rgba(255,245,210,.8)"); c.fillStyle = "#fff8e0"; c.beginPath(); c.arc(W * 0.2, hz * 0.4, Math.min(W, H) * 0.045, 0, TAU); c.fill();
    S.cl.forEach((q) => cloud(c, ((q.x + t * 8) % (W + 300)) - 150, q.y, q.r, "rgba(255,255,255,.9)", 5, q.sd));
    // a green headland on the right
    c.fillStyle = "#3a6a4a"; c.beginPath(); c.moveTo(W * 0.72, hz + 2); c.quadraticCurveTo(W * 0.86, hz - H * 0.12, W * 1.02, hz - H * 0.08); c.lineTo(W * 1.02, hz + 4); c.fill();
    c.fillStyle = "#2c5a3c"; c.beginPath(); c.moveTo(W * 0.82, hz + 2); c.quadraticCurveTo(W * 0.92, hz - H * 0.06, W * 1.02, hz - H * 0.03); c.lineTo(W * 1.02, hz + 4); c.fill();
    sky(c, ["#ecd2a0", "#e0bd7e", "#d6ad6a"], hz, H);
  }
  function huts(c, t, S, wind) {
    const s = s0 * 1.1, gy = H * 0.97, cols = ["#ff7ab8", "#2ec7d9", "#ffd36b", "#8a7aff"];
    for (let i = 0; i < (phone ? 2 : 4); i++) {
      const x = W * (phone ? 0.04 + i * 0.22 : 0.02 + i * 0.09);
      c.fillStyle = cols[i]; c.fillRect(x, gy - 64 * s, 46 * s, 54 * s); c.fillStyle = "#f5efe6"; for (let k = 0; k < 4; k++) c.fillRect(x + k * 12 * s, gy - 64 * s, 5 * s, 54 * s);
      c.fillStyle = "#5a3a2a"; c.beginPath(); c.moveTo(x - 4 * s, gy - 64 * s); c.lineTo(x + 23 * s, gy - 84 * s); c.lineTo(x + 50 * s, gy - 64 * s); c.fill(); c.fillStyle = "#3a2a1a"; c.fillRect(x + 4 * s, gy - 10 * s, 4 * s, 10 * s); c.fillRect(x + 38 * s, gy - 10 * s, 4 * s, 10 * s);
    }
    palm(c, W * 0.86, H * 0.98, s0 * 1.5 * (phone ? 0.8 : 1), t * (1 + wind * 3)); palm(c, W * 0.96, H * 0.99, s0 * 1.2, t * (1 + wind * 3) + 1);
  }
  const boat = (c, x, y, s, rot, col) => { c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = col; c.beginPath(); c.moveTo(-26 * s, -6 * s); c.lineTo(26 * s, -6 * s); c.lineTo(18 * s, 6 * s); c.lineTo(-20 * s, 6 * s); c.fill(); c.fillStyle = "#f5efe6"; c.fillRect(-26 * s, -8 * s, 52 * s, 3 * s); c.strokeStyle = "#5a4a3a"; c.lineWidth = 2 * s; c.beginPath(); c.moveTo(0, -6 * s); c.lineTo(0, -40 * s); c.stroke(); c.restore(); };
  const recede = {
    D: 7.4, facts: ["warning"], calm: false, cy: () => H * 0.52,
    init(S) {
      S.cl = Array.from({ length: 5 }, (_, i) => ({ x: i * W * 0.3, y: rnd(0.05, 0.18) * H, r: rnd(30, 50) * s0, sd: i }));
      S.shells = Array.from({ length: 40 }, () => ({ x: Math.random() * W, y: rnd(0.32, 0.8) * H, c: ["#fff1e0", "#ffc7a8", "#e8d9ff", "#8a6a4a"][Math.floor(rnd(0, 4))], k: Math.random() }));
      S.boats = [[0.3, 0.42, "#e05a3a"], [0.55, 0.5, "#3a7ae0"], [0.75, 0.38, "#f0c040"]];
      S.gulls = Array.from({ length: 5 }, () => ({ x: Math.random(), y: rnd(0.08, 0.22), v: rnd(0.03, 0.06), ph: rnd(0, 6) }));
    },
    edge: (t) => lerp(H * 0.82, H * 0.31, easeIO((t - 0.3) / 3.6)),
    draw(c, t, S) {
      beach(c, t, S);
      const sea = this.edge(t), hz = H * 0.3;
      // wet sand the water has just left
      const g0 = c.createLinearGradient(0, sea, 0, H * 0.82); g0.addColorStop(0, "rgba(150,110,60,.55)"); g0.addColorStop(1, "rgba(150,110,60,.15)"); c.fillStyle = g0; c.fillRect(0, sea, W, H * 0.82 - sea + 20);
      S.shells.forEach((q) => { if (q.y > sea + 4) { c.fillStyle = q.c; c.beginPath(); if (q.k > 0.8) { c.fillStyle = "#3a5a3a"; c.ellipse(q.x, q.y, 14 * s0, 4 * s0, 0.2, 0, TAU); } else c.ellipse(q.x, q.y, 5 * s0, 3.5 * s0, 0.4, 0, TAU); c.fill(); } });
      // boats that were floating now sit on the sand, tipped over
      S.boats.forEach(([u, v, col]) => { const y = v * H, dry = clamp((sea - y) / 40), bob = (1 - dry) * Math.sin(t * 2 + u * 9) * 3; boat(c, u * W, y + bob, s0 * 1.2, dry * (u > 0.5 ? 0.35 : -0.3), col); });
      const g = c.createLinearGradient(0, hz, 0, sea); g.addColorStop(0, "#1a5f9a"); g.addColorStop(1, "#4ac0d9"); c.fillStyle = g;
      c.beginPath(); c.moveTo(-10, hz); for (let x = -10; x <= W + 20; x += 16) c.lineTo(x, sea + Math.sin(x * 0.02 + t * 2) * 5); c.lineTo(W + 20, hz); c.fill();
      c.strokeStyle = "rgba(255,255,255,.85)"; c.lineWidth = 3; c.beginPath(); for (let x = -10; x <= W + 20; x += 16) c[x < 0 ? "moveTo" : "lineTo"](x, sea + Math.sin(x * 0.02 + t * 2) * 5); c.stroke();
      // gulls
      c.strokeStyle = "#2a2a3a"; c.lineWidth = 2; S.gulls.forEach((b) => { const x = ((b.x + t * b.v) % 1.2) * W, y = b.y * H, f = Math.sin(t * 8 + b.ph) * 5; c.beginPath(); c.moveTo(x - 9, y + f); c.quadraticCurveTo(x - 4, y - 3, x, y); c.quadraticCurveTo(x + 4, y - 3, x + 9, y + f); c.stroke(); });
      huts(c, t, S, 0);
    },
    // the letters lie in the sand under the water; as the sea pulls back they are uncovered, then they stand up and fly into place
    text: {
      at: 4.0, spread: 1.0, dur: 0.9, pre: 0, glow: "rgba(255,240,200,.7)", ink: ["#fff3c4", "#ffd36b", "#ff9d2e"],
      from: (p) => [W * 0.08 + p.r * W * 0.84, H * (0.36 + p.q * 0.4)],
      preDraw(c, p, x, y, t) { if (y < recede.edge(t) + 6) return; c.save(); c.translate(x, y); c.rotate(p.rot * 0.6); c.scale(0.7, 0.32); c.fillStyle = "rgba(110,80,40,.75)"; c.fillText(p.g, 0, 0); c.restore(); },
    },
    sound(e) { e.waves(0, 4.5, 0.35, 2.2); e.noise("lowpass", 500, 0.5, 0, 7, [[0, 0.3], [4, 0.04], [7.4, 0]]); e.gull(1.2, 0.04); e.gull(3.4, 0.03); e.wind(0, 7.4, 0.08, 500, 800); },
  };
  const crestY = (x, t, top, hgt) => top + Math.sin(x * 0.012 + t * 3) * hgt * 0.06 + Math.sin(x * 0.031 - t * 2) * hgt * 0.025;
  const wave = (t) => { const k = easeIO(t / 2.6), base = lerp(H * 0.31, H * 1.05, k), hgt = lerp(8, H * 0.82, Math.pow(clamp(t / 2.6), 1.3)); return { base, hgt, top: base - hgt }; };
  const tsunami = {
    D: 7.6, facts: ["shelter", "busiest"], calm: false, cy: () => H * 0.42,
    init(S) {
      S.cl = Array.from({ length: 5 }, (_, i) => ({ x: i * W * 0.3, y: rnd(0.05, 0.18) * H, r: rnd(30, 50) * s0, sd: i }));
      S.foam = Array.from({ length: phone ? 110 : 180 }, () => ({ x: rnd(-0.1, 1.1), y: rnd(0, 1), r: rnd(12, 50), v: rnd(0.6, 1.4) }));
    },
    draw(c, t, S) {
      beach(c, t, S);
      const dark = clamp(t / 2.2); c.fillStyle = `rgba(30,40,60,${dark * 0.35})`; c.fillRect(0, 0, W, H * 0.3);
      const { base, hgt, top } = wave(t);
      if (t < 3.1) {
        const g = c.createLinearGradient(0, top, 0, base); g.addColorStop(0, "#0c3a60"); g.addColorStop(0.45, "#17699a"); g.addColorStop(1, "#46a8cc");
        c.fillStyle = g; c.beginPath(); c.moveTo(-20, base); for (let x = -20; x <= W + 20; x += 14) c.lineTo(x, crestY(x, t, top, hgt)); c.lineTo(W + 20, base); c.fill();
        // the curling lip and spray
        c.fillStyle = "rgba(255,255,255,.92)"; c.beginPath(); for (let x = -20; x <= W + 20; x += 14) c.lineTo(x, crestY(x, t, top, hgt) - 2); for (let x = W + 20; x >= -20; x -= 14) c.lineTo(x, crestY(x, t, top, hgt) + Math.max(3, hgt * 0.05) + Math.sin(x * 0.07 + t * 9) * 3); c.fill();
        for (let i = 0; i < 70; i++) { const x = (i / 70) * W + Math.sin(t * 4 + i) * 12, y = crestY(x, t, top, hgt) - ((i * 37) % 10) / 10 * hgt * 0.09; c.globalAlpha = 0.7; c.beginPath(); c.arc(x, y, 2 + ((i * 13) % 7) / 7 * (3 + hgt * 0.012), 0, TAU); c.fill(); }
        c.globalAlpha = 1;
        c.strokeStyle = "rgba(255,255,255,.22)"; c.lineWidth = 2; for (let i = 0; i < 16; i++) { const x = (i * 131 + t * 50) % W; c.beginPath(); c.moveTo(x, top + hgt * 0.15); c.quadraticCurveTo(x - 10, top + hgt * 0.5, x - 26, top + hgt * 0.85); c.stroke(); }
      }
      huts(c, t, S, clamp(t / 2));
      if (t > 2.3) {
        const b = clamp((t - 2.3) / 0.8), settle = clamp((t - 3.3) / 2.4);
        c.fillStyle = `rgba(36,112,150,${clamp((t - 2.6) / 0.5)})`; c.fillRect(0, 0, W, H);
        if (t > 2.6) {
          c.globalAlpha = clamp((t - 2.6) / 0.5); sky(c, ["#5a7c98", "#8fb4c8"], 0, H * 0.32);
          c.fillStyle = "#2c6a52"; c.beginPath(); c.moveTo(W * 0.72, H * 0.32); c.quadraticCurveTo(W * 0.86, H * 0.2, W * 1.02, H * 0.24); c.lineTo(W * 1.02, H * 0.33); c.fill();
          c.fillStyle = "#2a7aa4"; c.beginPath(); c.moveTo(0, H); c.lineTo(0, H * 0.32); for (let x = 0; x <= W; x += 20) c.lineTo(x, H * 0.32 + Math.sin(x * 0.02 + t * 2) * 5 * (1 - settle * 0.6)); c.lineTo(W, H); c.fill();
          c.strokeStyle = `rgba(255,255,255,${0.3 * settle})`; c.lineWidth = 2; for (let i = 0; i < 11; i++) { const y = H * 0.38 + i * H * 0.055; c.beginPath(); for (let x = 0; x <= W; x += 20) { const yy = y + Math.sin(x * 0.015 + t * 1.5 + i) * 4; x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); }
          c.globalAlpha = 1;
        }
        S.foam.forEach((f) => { const r = f.r * (phone ? 0.6 : 1) * (0.4 + b) * (1 - settle * 0.9), y = lerp(H * 1.1, f.y * H, ease(b * f.v)) - settle * 30 * f.v; if (r < 1) return; c.fillStyle = `rgba(255,255,255,${0.92 * (1 - settle * 0.8)})`; c.beginPath(); c.arc(f.x * W, y, r, 0, TAU); c.fill(); });
      }
    },
    // the letters ride the crest of the wave, get flung out when it breaks, and land on the calm water
    text: {
      at: 2.6, spread: 0.8, dur: 1.1, pre: 0.5, preScale: 0.6, preFade: 0.8, spin: 0.6, glow: "rgba(46,242,255,.9)", ink: ["#ffffff", "#9fefff", "#2ef2ff"],
      from(p, S, t) { const { top, hgt } = wave(Math.min(t, 2.6)), x = W * 0.06 + p.u * W * 0.88 + Math.sin(t * 3 + p.r * 9) * 10; return [x, crestY(x, Math.min(t, 2.6), top, hgt) - 14 - p.q * 26]; },
    },
    sound(e) { e.noise("lowpass", 260, 0.7, 0, 9, [[0, 0.05], [2.2, 0.9], [2.7, 1.2], [4, 0.4], [7.5, 0]]); e.noise("highpass", 1600, 0.5, 2.3, 3.5, [[2.3, 0], [2.5, 0.4], [5.5, 0]]); e.thud(2.45, 0.8, 35); e.waves(4, 3.6, 0.15, 1.8); },
  };

  return [tornado, quake, sinkhole, recede, tsunami];
});
