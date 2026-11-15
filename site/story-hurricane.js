// Hurricane story: tornado over farmland -> earthquake in the city -> sinkhole on a shopping street -> a volcano spits out today's stocks ->
// the sea pulls back from a beach -> the tsunami rolls in. Buildings, objects and landscapes only.
WXS.add("hurricane", (K) => {
  const { W, H, rnd, clamp, ease, easeIO, lerp, TAU, sky, glow, ridge, hill, cloud, tree, city, drawCity, car, lamp, rainLines, palm } = K;
  const s0 = Math.min(W, H) / 700, phone = W < 600;


  // a black-and-white cow, side on, legs kicking (drawn at the origin)
  function cow(c, z, t) {
    const k = Math.sin(t * 9) * 0.35;
    c.strokeStyle = "#2a2220"; c.lineCap = "round"; c.lineWidth = 3.2 * z;
    [[-12, k], [-7, -k], [9, -k], [14, k]].forEach(([dx, a]) => { c.beginPath(); c.moveTo(dx * z, 4 * z); c.lineTo(dx * z + Math.sin(a) * 11 * z, 4 * z + Math.cos(a) * 11 * z); c.stroke(); });
    c.fillStyle = "#f2efe8"; c.beginPath(); c.ellipse(0, 0, 19 * z, 10 * z, 0, 0, TAU); c.fill();
    c.fillStyle = "#1e1a1a"; c.beginPath(); c.ellipse(-6 * z, -3 * z, 6 * z, 4.5 * z, 0.4, 0, TAU); c.fill(); c.beginPath(); c.ellipse(9 * z, 2 * z, 5 * z, 4 * z, -0.3, 0, TAU); c.fill();
    c.fillStyle = "#f0b8b0"; c.beginPath(); c.ellipse(6 * z, 9 * z, 4 * z, 2.5 * z, 0, 0, TAU); c.fill();
    c.fillStyle = "#f2efe8"; c.beginPath(); c.ellipse(22 * z, -6 * z, 7 * z, 5.5 * z, 0.5, 0, TAU); c.fill();
    c.fillStyle = "#e8b4a8"; c.beginPath(); c.ellipse(27 * z, -3 * z, 3.6 * z, 3 * z, 0.5, 0, TAU); c.fill();
    c.fillStyle = "#1e1a1a"; c.beginPath(); c.arc(22 * z, -8 * z, 1.2 * z, 0, TAU); c.fill(); c.beginPath(); c.ellipse(17 * z, -11 * z, 3 * z, 1.4 * z, -0.6, 0, TAU); c.fill();
    c.strokeStyle = "#d8cfa0"; c.lineWidth = 1.6 * z; c.beginPath(); c.moveTo(20 * z, -11 * z); c.lineTo(19 * z, -15 * z); c.stroke();
    c.strokeStyle = "#2a2220"; c.lineWidth = 1.5 * z; c.beginPath(); c.moveTo(-18 * z, -3 * z); c.quadraticCurveTo(-26 * z, -2 * z + k * 8 * z, -24 * z, 8 * z); c.stroke();
  }

  // ---------------------------------------------------------------- 1. tornado over farmland
  const fx = (t) => W * (phone ? lerp(0.62, 0.7, ease(t / 7)) : lerp(0.66, 0.74, easeIO(t / 7))) + Math.sin(t * 0.9) * W * 0.02;
  const gy1 = H * 0.7, top1 = H * 0.2;
  const funnelW = (h) => lerp(W * (phone ? 0.035 : 0.022), W * (phone ? 0.26 : 0.17), Math.pow(h, 1.7)); // h: 0 ground .. 1 cloud base
  const funnelX = (h, t) => fx(t) + Math.sin(t * 2.2 + h * 4) * 14 * h + Math.sin(t * 5 + h * 9) * 4 * (1 - h) - (1 - h) * (1 - h) * 30 * s0;
  const tornado = {
    D: 7.2, facts: ["market"], calm: false, cy: () => H * (phone ? 0.36 : 0.42), cx: () => (phone ? W / 2 : W * 0.4),
    init(S) {
      S.deb = Array.from({ length: phone ? 50 : 90 }, () => ({ h: Math.pow(Math.random(), 0.7), a: rnd(0, TAU), v: rnd(2.2, 4.5), k: Math.floor(rnd(0, 4)), s: rnd(0.6, 1.4), sp: -rnd(2, 6) }));
      // a cow and a car caught up in it too (they tumble round with everything else, all the same way)
      S.deb.push({ h: 0.42, a: 0.6, v: 1.9, k: 4, s: 1, sp: -1.4 }, { h: 0.62, a: 3.6, v: 1.6, k: 5, s: 1, sp: -1.1 });
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
        c.save(); c.translate(x, y); c.rotate(t * d.sp + d.a); c.globalAlpha = Math.sin(a) < 0 ? (d.k > 3 ? 0.8 : 0.55) : 1; const z = d.s * s0;
        if (d.k === 0) { c.fillStyle = "#8a6a44"; c.fillRect(-10 * z, -2 * z, 20 * z, 4 * z); }
        else if (d.k === 1) { c.fillStyle = "#4a7a2a"; c.beginPath(); c.ellipse(0, 0, 4 * z, 2 * z, 0, 0, TAU); c.fill(); }
        else if (d.k === 2) { c.fillStyle = "#c9b26a"; c.fillRect(-5 * z, -4 * z, 10 * z, 8 * z); }
        else if (d.k === 3) { c.fillStyle = "#9aa2aa"; c.fillRect(-8 * z, -1 * z, 16 * z, 2 * z); }
        else if (d.k === 4) cow(c, z * (phone ? 0.75 : 1), t);
        else car(c, 0, 16 * z, z * (phone ? 0.55 : 0.75), "#c94a4a", { glass: "rgba(150,190,220,.9)" });
        c.restore();
      });
      if (flash) { c.fillStyle = "rgba(230,240,255,.25)"; c.fillRect(0, 0, W, H); }
    },
    // the letters are caught in the funnel with the debris, then fly out and land
    text: {
      at: 3.6, spread: 1.1, dur: 1.0, pre: 0.4, preScale: 0.55, preFade: 0.6, spin: 1.2, spinDir: -1, glow: "rgba(46,242,255,.8)",
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


  // ---------------------------------------------------------------- 4. the volcano: it spits out today's stocks as lava bombs
  const vc = () => ({ x: W * (phone ? 0.5 : 0.56), y: H * (phone ? 0.5 : 0.46), rw: W * (phone ? 0.09 : 0.055) });
  const slopeY = (x) => { const v = vc(), gy = H * 0.9, half = W * (phone ? 0.62 : 0.42); const d = Math.abs(x - v.x); return d < v.rw ? v.y : lerp(v.y, gy, Math.pow(clamp((d - v.rw) / (half - v.rw)), 0.75)); };
  const volcano = {
    D: 8.2, facts: ["watch", "best", "busiest"], calm: false, cy: () => H * (phone ? 0.2 : 0.17),
    init(S) {
      const M = K.movers(phone ? 7 : 10), v = vc();
      S.bombs = M.map((m, i) => { const dir = i % 2 ? 1 : -1, sp = phone ? 0.75 : 1; return { ...m, t0: 1.4 + i * (phone ? 0.75 : 0.55), vx: dir * rnd(0.09, 0.3) * W * sp, vy: rnd(0.55, 0.75) * H, g: 1.1 * H, rot: rnd(-3, 3) }; });
      S.plume = Array.from({ length: phone ? 26 : 40 }, (_, i) => ({ k: i / 40, x: rnd(-1, 1), r: rnd(0.7, 1.3), sd: i }));
      S.sparks = Array.from({ length: phone ? 60 : 110 }, () => ({ a: rnd(-1.25, 1.25), v: rnd(0.25, 0.7) * H, p: rnd(0, 1.4) }));
      S.far = ridge(2.3, H * 0.05, H * 0.72); S.near = ridge(6.1, H * 0.03, H * 0.86);
      S.flows = [[-1, 0.2], [1, 0.45], [-1, 0.75], [1, 0.95]].map(([d, o], i) => ({ d, o, st: 1.6 + i * 0.5, seed: i * 3.7 }));
      void v;
    },
    draw(c, t, S) {
      const v = vc(), erupt = clamp((t - 1.2) / 0.6), shake = t > 1.1 && t < 2 ? Math.sin(t * 70) * 4 * s0 : 0;
      c.save(); c.translate(shake, 0);
      // night sky lit red from below, an ash plume rising and spreading
      sky(c, ["#0b0612", "#24101e", "#5a1e1c", "#a3401c"], -10, H * 0.9);
      glow(c, v.x, v.y, H * 0.7 * (0.4 + erupt * 0.6), "rgba(255,110,40,.28)");
      hill(c, S.far, "#1a0e14");
      for (const q of S.plume) {
        const k = ((q.k + t * 0.07) % 1), y = v.y - k * H * 0.62, x = v.x + q.x * k * W * 0.22 + Math.sin(t * 0.6 + q.sd) * 12 + k * k * W * 0.12, r = (30 + k * 150) * s0 * q.r * (0.3 + erupt * 0.7);
        cloud(c, x, y, r, `rgba(${Math.round(lerp(120, 38, k))},${Math.round(lerp(60, 28, k))},${Math.round(lerp(40, 34, k))},${0.85 * (1 - k * 0.4)})`, 5, q.sd);
      }
      // lightning inside the ash cloud
      if (t > 3 && (t % 2.3) < 0.09) { const P = K.boltPath(v.x + W * 0.1, H * 0.06, v.x + W * 0.02, v.y - H * 0.18, 7); K.bolt(c, P, 0.9); }
      // the cone: dark rock with ridges, glowing at the top
      c.fillStyle = "#24161a"; c.beginPath(); c.moveTo(-10, H * 0.92); for (let x = -10; x <= W + 10; x += 8) c.lineTo(x, slopeY(x) + Math.sin(x * 0.05) * 3 * s0); c.lineTo(W + 10, H + 10); c.lineTo(-10, H + 10); c.fill();
      const cg = c.createLinearGradient(0, v.y, 0, v.y + H * 0.25); cg.addColorStop(0, "rgba(255,120,50,.45)"); cg.addColorStop(1, "rgba(255,120,50,0)"); c.fillStyle = cg; c.beginPath(); for (let x = v.x - W * 0.3; x <= v.x + W * 0.3; x += 8) c.lineTo(x, slopeY(x)); c.lineTo(v.x + W * 0.3, H); c.lineTo(v.x - W * 0.3, H); c.fill();
      c.strokeStyle = "rgba(0,0,0,.35)"; c.lineWidth = 2; for (let i = -6; i <= 6; i++) { if (!i) continue; const x1 = v.x + i * W * 0.05; c.beginPath(); c.moveTo(v.x + Math.sign(i) * v.rw * 0.8, v.y + 4); c.quadraticCurveTo(lerp(v.x, x1, 0.5) + i * 4, lerp(v.y, slopeY(x1), 0.4), x1, slopeY(x1) + 6); c.stroke(); }
      // crater glow
      glow(c, v.x, v.y, v.rw * (2 + erupt * 1.5), `rgba(255,170,60,${0.6 + 0.3 * Math.sin(t * 7)})`);
      c.fillStyle = "#ffb347"; c.beginPath(); c.ellipse(v.x, v.y + 2, v.rw * 0.95, v.rw * 0.22, 0, 0, TAU); c.fill();
      // lava rivers running down the slopes, flowing all the time
      S.flows.forEach((f) => {
        const L = clamp((t - f.st) / 2.6); if (L <= 0) return;
        const pts = []; for (let k = 0; k <= 1.0001; k += 0.04) { if (k > L) break; const x = v.x + f.d * (v.rw * (0.2 + f.o * 0.6) + k * W * (phone ? 0.2 : 0.13) * (0.4 + f.o)) + Math.sin(k * 7 + f.seed) * 16 * s0 * k; pts.push([x, Math.max(slopeY(x) + 4, lerp(v.y + 4, H * 0.9, k * (0.8 + f.o * 0.15)))]); }
        if (pts.length < 2) return;
        const path = () => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); };
        c.lineCap = "round"; c.lineJoin = "round";
        c.strokeStyle = "rgba(255,90,20,.35)"; c.lineWidth = 16 * s0; path(); c.stroke();
        c.strokeStyle = "#e0441a"; c.lineWidth = 8 * s0; path(); c.stroke();
        c.strokeStyle = "#ffcf5a"; c.lineWidth = 3 * s0; c.setLineDash([14 * s0, 10 * s0]); c.lineDashOffset = -t * 60 * s0; path(); c.stroke(); c.setLineDash([]);
      });
      // glowing sparks fountaining out
      if (erupt > 0) { c.fillStyle = "#ffd27a"; S.sparks.forEach((q) => { const a = ((t - 1.2 + q.p) % 1.4); const x = v.x + Math.sin(q.a) * q.v * a * 0.6, y = v.y - Math.cos(q.a) * q.v * a + 0.5 * H * 0.9 * a * a; c.globalAlpha = (1 - a / 1.4) * erupt; c.fillRect(x, y, 2.5, 2.5); }); c.globalAlpha = 1; }
      // the lava bombs: each carries one of today's stocks and its move
      c.textAlign = "center"; c.textBaseline = "middle";
      const fs = Math.round(11 * s0 + (phone ? 5 : 7)); c.font = `800 ${fs}px Inter, sans-serif`;
      S.bombs.forEach((b) => {
        const a = t - b.t0; if (a < 0) return;
        let x = v.x + b.vx * a, y = v.y - b.vy * a + 0.5 * b.g * a * a; const land = y > slopeY(x) - 6 && a > 0.3; 
        if (land && b.ta == null) b.ta = a; if (b.ta != null) { x = v.x + b.vx * b.ta; y = slopeY(x) - 6 + Math.min(1, (a - b.ta) * 2) * 2; }
        const cool = b.ta != null ? clamp((a - b.ta) / 3) : 0, r = 9 * s0 + 3;
        if (b.ta == null) { c.strokeStyle = "rgba(255,140,40,.45)"; c.lineWidth = r * 0.8; c.beginPath(); c.moveTo(x, y); c.lineTo(x - b.vx * 0.05, y + (b.vy - b.g * a) * 0.05); c.stroke(); }
        glow(c, x, y, r * 3.2, `rgba(255,120,30,${0.6 * (1 - cool * 0.7)})`);
        c.save(); c.translate(x, y); c.rotate(b.ta == null ? a * b.rot : b.ta * b.rot);
        c.fillStyle = `rgb(${Math.round(lerp(255, 70, cool))},${Math.round(lerp(110, 40, cool))},${Math.round(lerp(30, 34, cool))})`; c.beginPath(); for (let i = 0; i < 7; i++) { const aa = (i / 7) * TAU, rr = r * (0.8 + ((i * 37) % 5) / 12); c.lineTo(Math.cos(aa) * rr, Math.sin(aa) * rr); } c.fill();
        c.strokeStyle = `rgba(40,16,16,${0.5 + cool * 0.4})`; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-r * 0.5, -r * 0.2); c.lineTo(0, r * 0.1); c.lineTo(r * 0.4, -r * 0.4); c.moveTo(0, r * 0.1); c.lineTo(r * 0.1, r * 0.6); c.stroke();
        c.restore();
        const ly = y - r - fs * 0.9; c.lineWidth = 4; c.strokeStyle = "rgba(10,4,8,.85)"; c.strokeText(b.label, x, ly); c.fillStyle = b.c >= 0 ? "#9dffb0" : "#ffb0a0"; c.fillText(b.label, x, ly);
      });
      // foreground: bare rocks and dead trees, nobody around
      hill(c, S.near, "#0e080c");
      c.strokeStyle = "#0e080c"; c.lineWidth = 3 * s0; [0.08, 0.9, 0.95].forEach((u, i) => { const x = W * u, gy = H * 0.88; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy - 60 * s0); c.moveTo(x, gy - 34 * s0); c.lineTo(x - 16 * s0, gy - 50 * s0); c.moveTo(x, gy - 44 * s0); c.lineTo(x + 14 * s0, gy - 62 * s0 - i * 4); c.stroke(); });
      c.restore();
    },
    // the fact's letters are blasted up out of the crater and drift down into place
    text: { at: 3.0, spread: 1.0, dur: 1.2, arc: H * 0.25, startScale: 0.25, spin: 1.4, spinDir: -1, glow: "rgba(255,150,60,.95)", ink: ["#fff2b0", "#ffb347", "#ff5a2e"], from: () => [vc().x, vc().y] },
    sound(e, S) {
      e.rumble(0, 8.2, 0.7); e.rumble(1.1, 2, 1); e.thud(1.25, 0.9, 38); e.noise("bandpass", 600, 0.4, 1.3, 6.8, [[1.3, 0], [2, 0.12], [8, 0.06], [8.2, 0]]); e.crackle(1.4, 6.5, 12, 0.07);
      (S.bombs || []).forEach((b) => { e.thud(b.t0, 0.3, 50); e.whoosh(b.t0, 0.9, 0.08); }); e.whoosh(2.9, 1.4, 0.2); e.thunder(3.05, 0.2); e.thunder(5.35, 0.18);
    },
  };

  // ---------------------------------------------------------------- 5 and 6. the beach: sea pulls back, then the wave
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
  // (the wave's crest also bends down at the sides, see tsunami.draw)
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
        // a real swell: tallest in the middle, sloping away at the sides, lit turquoise just under the lip
        const cr = (x) => crestY(x, t, top, hgt) + hgt * 0.16 * Math.pow((x / W - 0.45) * 2, 2);
        const g = c.createLinearGradient(0, top, 0, base); g.addColorStop(0, "#0e5a78"); g.addColorStop(0.12, "#2fb8c8"); g.addColorStop(0.3, "#13708f"); g.addColorStop(0.65, "#0b3d5e"); g.addColorStop(1, "#3a98b8");
        c.fillStyle = g; c.beginPath(); c.moveTo(-20, base); for (let x = -20; x <= W + 20; x += 12) c.lineTo(x, cr(x)); c.lineTo(W + 20, base); c.fill();
        // water racing up the face
        c.strokeStyle = "rgba(200,245,255,.18)"; c.lineWidth = 1.6;
        for (let i = 0; i < (phone ? 22 : 40); i++) { const x = ((i * 97.3) % W), ph = (t * 0.9 + i * 0.137) % 1, y0 = lerp(base, cr(x), ph), L = hgt * 0.12; c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x + 4, y0 - L * 0.5, x + 2, y0 - L); c.stroke(); }
        // the backlit lip, then a curtain of white water pouring down from it
        const lip = Math.max(4, hgt * 0.07);
        c.fillStyle = "rgba(120,235,240,.55)"; c.beginPath(); for (let x = -20; x <= W + 20; x += 12) c.lineTo(x, cr(x)); for (let x = W + 20; x >= -20; x -= 12) c.lineTo(x, cr(x) + lip * 1.6); c.fill();
        c.fillStyle = "rgba(255,255,255,.95)"; c.beginPath(); for (let x = -20; x <= W + 20; x += 12) c.lineTo(x, cr(x) - 3); for (let x = W + 20; x >= -20; x -= 12) c.lineTo(x, cr(x) + lip * 0.6 + Math.sin(x * 0.06 + t * 8) * 2); c.fill();
        c.strokeStyle = "rgba(255,255,255,.55)"; c.lineCap = "round";
        for (let i = 0; i < (phone ? 50 : 90); i++) { const x = (i / (phone ? 50 : 90)) * W + Math.sin(i * 3.1) * 8, y = cr(x) + lip * 0.4, L = hgt * (0.06 + ((i * 7) % 5) * 0.02) * clamp(t / 1.5); c.lineWidth = 1.5 + (i % 3); c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.sin(t * 6 + i) * 3, y + L); c.stroke(); }
        // spray blown back off the top
        for (let i = 0; i < (phone ? 18 : 30); i++) { const x = (i / 30) * W * 1.05 + Math.sin(t + i) * 20, k = (t * 0.8 + i * 0.21) % 1; glow(c, x, cr(x) - k * hgt * 0.22, (16 + hgt * 0.06) * (0.5 + k), `rgba(235,250,255,${0.35 * (1 - k)})`); }
        // beach things lifted up the face: a surfboard, a parasol, a deckchair, a beach ball
        [[0.22, "board"], [0.5, "brolly"], [0.7, "chair"], [0.36, "ball"]].forEach(([u, kind], i) => {
          const x = u * W + Math.sin(t * 1.3 + i) * 20, k = clamp((t - 0.6 - i * 0.15) / 1.6), y = lerp(base - 6, cr(x) + lip * 2, ease(k)); if (hgt < 60) return;
          c.save(); c.translate(x, y); c.rotate(-t * (1.2 + i * 0.3)); const z = s0 * (0.6 + 0.6 * (y - top) / Math.max(1, hgt) * 0) * 1.1;
          if (kind === "board") { c.fillStyle = "#ffd36b"; c.beginPath(); c.ellipse(0, 0, 26 * z, 6 * z, 0, 0, TAU); c.fill(); c.fillStyle = "#e05a3a"; c.fillRect(-24 * z, -1 * z, 48 * z, 2 * z); }
          else if (kind === "brolly") { c.fillStyle = "#ff7ab8"; c.beginPath(); c.arc(0, 0, 20 * z, Math.PI, TAU); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 20 * z, Math.PI * 1.33, Math.PI * 1.66); c.fill(); c.strokeStyle = "#5a4a3a"; c.lineWidth = 2 * z; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 26 * z); c.stroke(); }
          else if (kind === "chair") { c.strokeStyle = "#8a6a44"; c.lineWidth = 2.5 * z; c.beginPath(); c.moveTo(-12 * z, 10 * z); c.lineTo(8 * z, -10 * z); c.moveTo(-6 * z, -6 * z); c.lineTo(12 * z, 10 * z); c.stroke(); c.fillStyle = "#2ec7d9"; c.beginPath(); c.moveTo(-10 * z, 6 * z); c.lineTo(6 * z, -9 * z); c.lineTo(10 * z, -4 * z); c.lineTo(-4 * z, 9 * z); c.fill(); }
          else { c.fillStyle = "#fff"; c.beginPath(); c.arc(0, 0, 8 * z, 0, TAU); c.fill(); ["#e05a3a", "#3a7ae0", "#f0c040"].forEach((col, j) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 8 * z, j * 2.1, j * 2.1 + 1); c.fill(); }); }
          c.restore();
        });
        // its shadow falls over the beach
        c.fillStyle = `rgba(10,30,50,${0.35 * clamp(t / 2.4)})`; c.fillRect(0, base, W, H - base);
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
        S.foam.forEach((f) => { const r = f.r * (phone ? 0.6 : 1) * (0.4 + b) * (1 - settle * 0.9), y = lerp(H * 1.1, f.y * H, ease(b * f.v)) - settle * 30 * f.v; if (r < 1) return; const a = 0.9 * (1 - settle * 0.8), g = c.createRadialGradient(f.x * W, y, 0, f.x * W, y, r * 1.5); g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(0.5, `rgba(240,250,255,${a * 0.8})`); g.addColorStop(1, "rgba(240,250,255,0)"); c.fillStyle = g; c.fillRect(f.x * W - r * 1.5, y - r * 1.5, r * 3, r * 3); });
      }
    },
    // the letters ride the crest of the wave, get flung out when it breaks, and land on the calm water
    text: {
      at: 2.6, spread: 0.8, dur: 1.1, pre: 0.5, preScale: 0.6, preFade: 0.8, spin: 0.6, spinDir: -1, glow: "rgba(46,242,255,.9)", ink: ["#ffffff", "#9fefff", "#2ef2ff"],
      from(p, S, t) { const { top, hgt } = wave(Math.min(t, 2.6)), x = W * 0.06 + p.u * W * 0.88 + Math.sin(t * 3 + p.r * 9) * 10; return [x, crestY(x, Math.min(t, 2.6), top, hgt) + hgt * 0.16 * Math.pow((x / W - 0.45) * 2, 2) - 14 - p.q * 26]; },
    },
    sound(e) { e.noise("lowpass", 260, 0.7, 0, 9, [[0, 0.05], [2.2, 0.9], [2.7, 1.2], [4, 0.4], [7.5, 0]]); e.noise("highpass", 1600, 0.5, 2.3, 3.5, [[2.3, 0], [2.5, 0.4], [5.5, 0]]); e.thud(2.45, 0.8, 35); e.waves(4, 3.6, 0.15, 1.8); },
  };

  return [tornado, quake, sinkhole, volcano, recede, tsunami];
});
