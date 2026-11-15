// Breezy story: a walk in light rain under an umbrella (with the cavapoo and the lhasa apso on their
// leads) -> a rainbow with the words riding it -> down to the pot at its end (empty!) and a dancing
// leprechaun -> a UFO beams him up and flies to space -> the space station -> the stars align.
WXS.add("windy", (K) => {
  const { W, H, rnd, clamp, ease, easeIO, lerp, TAU, sky, glow, stars, drawStars, ridge, hill, cloud, tree, lamp, rainLines, E } = K;
  const s0 = Math.min(W, H) / 700, phone = W < 600;
  const BOW = ["#ff3b3b", "#ff9a3b", "#ffe23b", "#4cd964", "#3bb3ff", "#5a5bff", "#b44dff"];

  // ---------------------------------------------------------------- 1. umbrella walk in the rain
  const ws = clamp(Math.min(W, H) / 560, 0.6, 1.35), wgy = H * (phone ? 0.8 : 0.86);
  const walkX = (t) => W * (phone ? lerp(0.12, 0.3, t / 9) : lerp(0.22, 0.4, t / 9));
  // she holds the umbrella up in her far hand, so the canopy sits over her head
  const canopy = (t) => { const x = walkX(t) + 20 * ws, R = 62 * ws; return { x, y: wgy - 152 * ws, R }; };
  const drop = (p, t) => { const dep = 3.0 + p.u * 1.3 + p.r * 0.4; return dep; };
  const domeY = (U, x) => U.y - Math.sqrt(Math.max(0, U.R * U.R - (x - U.x) * (x - U.x)));
  const umbrella = {
    D: 8.6, facts: ["market"], cy: () => H * (phone ? 0.3 : 0.32), cx: () => (phone ? W / 2 : W * 0.58),
    init(S) { S.far = ridge(3.1, H * 0.03, H * 0.6); S.cl = Array.from({ length: 6 }, (_, i) => ({ x: rnd(0, 1), y: rnd(0.04, 0.2), r: rnd(40, 70) * s0, sd: i })); S.trees = [0.06, 0.5, 0.74, 0.95].map((u, i) => ({ u, s: 0.9 + (i % 2) * 0.3 })); },
    draw(c, t, S) {
      const x = walkX(t), U = canopy(t);
      sky(c, ["#4a5a78", "#6a7a96", "#9aa6b8"], 0, H * 0.62);
      S.cl.forEach((q) => cloud(c, ((q.x * W + t * 6) % (W + 300)) - 150, q.y * H, q.r, "rgba(120,130,150,.8)", 6, q.sd));
      hill(c, S.far, "#5a7a68"); sky(c, ["#5a8a5a", "#3c6a42"], H * 0.64, H + 10);
      S.trees.forEach((q) => tree(c, q.u * W, H * 0.66, s0 * q.s, { sway: Math.sin(t * 1.4 + q.u * 9) * 3, col: "#3c7a4a", dark: "#2a5a36" }));
      // the path, a bench and a lamp
      c.fillStyle = "#b8a88a"; c.beginPath(); c.moveTo(-10, wgy + 8 * ws); c.lineTo(W + 10, wgy - 4 * ws); c.lineTo(W + 10, wgy + 24 * ws); c.lineTo(-10, wgy + 34 * ws); c.fill();
      c.fillStyle = "rgba(160,190,220,.4)"; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(((i * 211) % W), wgy + 16 * ws, 26 * ws, 4 * ws, 0, 0, TAU); c.fill(); }
      lamp(c, W * 0.84, H * 0.7, s0 * 1.1, 0.6);
      c.fillStyle = "#6a4a2a"; const bx = W * 0.66, by = H * 0.71; c.fillRect(bx, by - 18 * s0, 70 * s0, 5 * s0); c.fillRect(bx, by - 30 * s0, 70 * s0, 4 * s0); c.fillStyle = "#2a2a2a"; c.fillRect(bx + 6 * s0, by - 13 * s0, 3 * s0, 13 * s0); c.fillRect(bx + 60 * s0, by - 13 * s0, 3 * s0, 13 * s0);
      // light rain: it stops where it meets the canopy, and nothing falls in its shelter
      rainLines(c, phone ? 110 : 220, t, { speed: 1.4, slant: 0.12, col: "rgba(220,235,255,.45)", len: 14, skip: (rx, ry) => Math.abs(rx - U.x) < U.R * 1.04 && ry + 14 > domeY(U, rx) - 2 && ry < wgy + 10 });
      // the walker and the two dogs, on the ends of their leads
      const e = E();
      const hold = e.walker(c, x, wgy, ws, t, 0.12, { umb: true }).umb; e.lhasa(c, x + 62 * ws, wgy, ws, t, 0.12); e.cavapoo(c, x + 124 * ws, wgy, ws, t, 0.12);
      // the umbrella: shaft from the canopy down through her hand to a hooked handle
      const [hx, hy] = hold || [U.x, wgy - 120 * ws];
      c.strokeStyle = "#e8e8f0"; c.lineWidth = 3 * ws; c.lineCap = "round"; c.beginPath(); c.moveTo(U.x, U.y); c.lineTo(hx, hy + 12 * ws); c.arc(hx + 5 * ws, hy + 12 * ws, 5 * ws, Math.PI, 0, true); c.stroke();
      c.fillStyle = "#e8b48a"; c.beginPath(); c.arc(hx, hy, 3.3 * ws, 0, TAU); c.fill(); // her fingers round the shaft
      const g = c.createLinearGradient(U.x - U.R, 0, U.x + U.R, 0); g.addColorStop(0, "#ff4fd8"); g.addColorStop(0.5, "#b44dff"); g.addColorStop(1, "#2ef2ff");
      const tip = (i) => [U.x - U.R + (i * U.R) / 3, U.y];
      c.fillStyle = g; c.beginPath(); c.arc(U.x, U.y, U.R, Math.PI, TAU); for (let i = 5; i >= 0; i--) c.quadraticCurveTo(U.x - U.R + (i + 0.5) * U.R / 3, U.y - 7 * ws, ...tip(i)); c.fill();
      c.fillStyle = "rgba(255,255,255,.14)"; c.beginPath(); c.arc(U.x - U.R * 0.25, U.y - U.R * 0.1, U.R * 0.72, Math.PI * 1.05, Math.PI * 1.55); c.lineTo(U.x - U.R * 0.25, U.y - U.R * 0.1); c.fill(); // wet sheen
      // ribs, each running out to a pointed tip
      c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 1.2; c.beginPath(); for (let i = 1; i < 6; i++) { c.moveTo(U.x, U.y - U.R); c.quadraticCurveTo(U.x - U.R + (i * U.R) / 3, U.y - U.R * 0.6, ...tip(i)); } c.stroke();
      c.fillStyle = "#e8e8f0"; c.beginPath(); c.arc(U.x, U.y - U.R - 3 * ws, 3 * ws, 0, TAU); c.fill(); for (let i = 0; i <= 6; i++) { c.beginPath(); c.arc(...tip(i), 1.6 * ws, 0, TAU); c.fill(); }
      // drops landing on the canopy make tiny crowns
      c.fillStyle = "rgba(235,245,255,.95)";
      for (let i = 0; i < (phone ? 18 : 30); i++) { const f = t * 2.4 + i * 0.618, k = f % 1, n = Math.floor(f), u = ((Math.sin(n * 12.9 + i * 78.2) * 43758.5) % 1 + 1) % 1 * 1.8 - 0.9, px = U.x + u * U.R, py = domeY(U, px); if (k > 0.22) continue; const kk = k / 0.22, nx = (px - U.x) / U.R, ny = (py - U.y) / U.R; c.globalAlpha = 1 - kk; for (let j = -1; j <= 1; j++) { const a = Math.atan2(ny, nx) + j * 0.7, d = kk * 7 * ws; c.beginPath(); c.arc(px + Math.cos(a) * d, py + Math.sin(a) * d - kk * 3 * ws, 1 * ws, 0, TAU); c.fill(); } }
      c.globalAlpha = 1;
      // water running down the panels to the tips
      for (let i = 0; i < 14; i++) { const r = (i % 6) + 0.5, k = (t * 0.9 + i * 0.29) % 1, ex = U.x - U.R + (r * U.R) / 3, px = lerp(U.x, ex, k), py = domeY(U, px) + 1; c.fillStyle = `rgba(230,245,255,${0.55 * Math.sin(k * Math.PI)})`; c.beginPath(); c.ellipse(px, py, 1.3 * ws, 1.8 * ws, 0, 0, TAU); c.fill(); }
      // then it drips steadily off every tip and splashes on the path
      for (let i = 0; i <= 6; i++) for (let j = 0; j < 2; j++) {
        const [tx, ty] = tip(i), k = (t * 1.25 + i * 0.37 + j * 0.5) % 1, gy2 = wgy + 6 * ws - (tx - W * 0.5) * 0.004, y = ty + 2 + k * k * (gy2 - ty);
        if (k < 0.93) { c.fillStyle = "rgba(225,240,255,.9)"; c.beginPath(); c.ellipse(tx - k * 3 * ws, y, 1.4 * ws, (2 + k * 3) * ws, 0, 0, TAU); c.fill(); }
        else { const sk = (k - 0.93) / 0.07; c.strokeStyle = `rgba(225,240,255,${1 - sk})`; c.lineWidth = 1; c.beginPath(); c.ellipse(tx - 3 * ws, gy2, sk * 8 * ws, sk * 2 * ws, 0, 0, TAU); c.stroke(); }
      }
    },
    // each letter falls as a raindrop, hits the umbrella and bounces off into place
    text: {
      at: 3.0, spread: 1.7, dur: 1.0, pre: 1.6, preScale: 0.55, spin: 0.8, arc: H * 0.12, glow: "rgba(120,190,255,.9)", ink: ["#cdeeff", "#7ab8ff", "#b44dff"],
      delay: (p) => p.u * 1.3 + p.r * 0.4,
      from(p, S, t) { const dep = drop(p, t), U = canopy(Math.min(t, dep)), u = (p.r - 0.5) * 1.5, hx = U.x + u * U.R, hy = U.y - Math.sqrt(Math.max(0, 1 - u * u)) * U.R - 8; const k = clamp((t - (dep - 0.9)) / 0.9); return [hx, lerp(-60, hy, k * k)]; },
    },
    sound(e) { e.rain(0, 8.6, 0.12); e.crackle(0, 8.4, 28, 0.05); e.noise("bandpass", 480, 3, 2.2, 0.15, [[2.2, 0], [2.21, 0.18], [2.32, 0]]); e.noise("bandpass", 620, 3, 5.6, 0.15, [[5.6, 0], [5.61, 0.15], [5.7, 0]]); },
  };

  // ---------------------------------------------------------------- 2 and 3. one meadow: the rainbow with the words riding it, then the
  // camera glides down to the pot at its end (no cut), finds it empty, and pans on to the dancing leprechaun
  const GY = H * 0.86, Zf = phone ? 1.9 : 2.1, PS = s0 * (phone ? 1.2 : 1.5), PW = PS / Zf;
  const rb = () => ({ cx: W * 0.5, cy: GY, R: Math.min(W * (phone ? 0.42 : 0.37), H * 0.6), bw: phone ? 0.03 : 0.026 });
  const foot = () => { const B = rb(); return { x: B.cx + B.R * (1 - B.bw * 3), y: GY }; };
  const potAnchor = () => ({ x: W * 0.42, y: H * 0.82 });
  const meadowInit = (S) => {
    S.r1 = ridge(1.3, H * 0.04, H * 0.74); S.r2 = ridge(6.1, H * 0.025, H * 0.81);
    S.cl = Array.from({ length: 8 }, (_, i) => ({ x: rnd(-0.1, 1.4), y: rnd(0.04, 0.3), r: rnd(30, 60) * s0, sd: i }));
    S.trees = Array.from({ length: 12 }, () => ({ u: rnd(-0.05, 1.45), s: rnd(0.5, 0.9) }));
    const F = foot(); S.clov = Array.from({ length: phone ? 60 : 130 }, () => ({ x: F.x + rnd(-0.35, 0.75) * W, y: GY + rnd(-0.01, 0.1) * H, s: rnd(0.6, 1.2) })); S.mush = [-0.18, 0.2, 0.42, 0.55].map((u) => F.x + u * W);
  };
  // camera: the world point F is drawn at screen point A, zoomed by Z
  const cam = (c, A, Z) => { const F = foot(); c.translate(A.x, A.y); c.scale(Z, Z); c.translate(-F.x, -F.y); };
  function potDraw(c, t, S, tipOn) {
    const F = foot(), ps = PW, px = F.x, gy = GY;
    const tip = tipOn ? Math.sin(clamp((t - 0.6) / 1.2) * Math.PI) * 0.35 : 0, wob = tipOn ? Math.sin(t * 9) * 0.04 * (1 - clamp(t / 1)) : 0;
    c.save(); c.translate(px, gy - 4 * ps); c.rotate(wob);
    c.fillStyle = "rgba(0,0,0,.25)"; c.beginPath(); c.ellipse(0, 4 * ps, 52 * ps, 9 * ps, 0, 0, TAU); c.fill();
    const bg = c.createRadialGradient(-14 * ps, -46 * ps, 4 * ps, 0, -34 * ps, 56 * ps); bg.addColorStop(0, "#4a4a5a"); bg.addColorStop(1, "#14141a"); c.fillStyle = bg;
    c.beginPath(); c.ellipse(0, -36 * ps, 48 * ps, 40 * ps, 0, 0, TAU); c.fill(); [-34, 34].forEach((dx) => c.fillRect(dx * ps - 4 * ps, -4 * ps, 8 * ps, 6 * ps));
    const rimH = (10 + tip * 40) * ps; c.fillStyle = "#08080c"; c.beginPath(); c.ellipse(0, -70 * ps, 40 * ps, rimH, 0, 0, TAU); c.fill();
    c.strokeStyle = "#3a3a48"; c.lineWidth = 7 * ps; c.beginPath(); c.ellipse(0, -70 * ps, 43 * ps, rimH + 2 * ps, 0, 0, TAU); c.stroke();
    if (tip > 0.05) { c.strokeStyle = "rgba(220,220,230,.5)"; c.lineWidth = 1 / Zf; c.beginPath(); c.moveTo(-26 * ps, -70 * ps); c.lineTo(10 * ps, -70 * ps + rimH * 0.6); c.moveTo(-26 * ps, -70 * ps + rimH * 0.5); c.lineTo(20 * ps, -70 * ps - rimH * 0.3); c.stroke(); }
    c.restore();
  }
  function meadow(c, t, S, o = {}) {
    const B = rb(), F = foot(), k = o.sun ?? 1, mouthY = GY - 74 * PW;
    if (!o.noSky) { sky(c, [`rgb(${lerp(90, 70, k)},${lerp(130, 160, k)},${lerp(180, 235, k)})`, "#bfe2ff", "#eaf6ff"], -H, GY - H * 0.08); glow(c, W * 0.12, H * 0.12, H * 0.35, `rgba(255,245,200,${0.8 * k})`); c.fillStyle = `rgba(255,250,220,${k})`; c.beginPath(); c.arc(W * 0.12, H * 0.12, Math.min(W, H) * 0.045, 0, TAU); c.fill(); }
    S.cl.forEach((q, i) => cloud(c, q.x * W + (i % 2 ? 1 : -1) * (o.ct ?? t) * 10, q.y * H, q.r, "rgba(255,255,255,.9)", 5, q.sd));
    // the bow: it rises out of the left hills and comes down straight into the pot's mouth
    const arc = o.arc ?? 1;
    BOW.forEach((col, i) => { const r = B.R - i * B.R * B.bw, end = TAU - Math.asin(clamp((GY - mouthY) / r)); c.strokeStyle = col; c.globalAlpha = 0.75; c.lineWidth = B.R * B.bw * 1.05; c.beginPath(); c.arc(B.cx, B.cy, r, Math.PI, Math.PI + (end - Math.PI) * arc); c.stroke(); });
    c.globalAlpha = 0.22; c.strokeStyle = "#fff"; c.lineWidth = B.R * 0.26; c.beginPath(); c.arc(B.cx, B.cy, B.R * 0.7, Math.PI, Math.PI + Math.PI * arc); c.stroke(); c.globalAlpha = 1;
    hill(c, S.r1, "#5aa060", -W, W * 2); hill(c, S.r2, "#3e8a48", -W, W * 2);
    S.trees.forEach((q) => tree(c, q.u * W, S.r2(q.u * W) + 6, s0 * q.s, { col: "#2f7a3a", dark: "#256a30", sway: Math.sin(t + q.u * 9) * 1.5 }));
    for (let i = 0; i < 5; i++) { const x = W * (0.1 + i * 0.04), y = S.r1(x) + 4; c.fillStyle = "#f5efe6"; c.fillRect(x, y - 14 * s0, 16 * s0, 14 * s0); c.fillStyle = "#c0503a"; c.beginPath(); c.moveTo(x - 2 * s0, y - 14 * s0); c.lineTo(x + 8 * s0, y - 22 * s0); c.lineTo(x + 18 * s0, y - 14 * s0); c.fill(); }
    // the near meadow, with clover and red mushrooms around the pot
    sky(c, ["#4fa65a", "#2f7a3a"], GY - H * 0.05, H * 1.4);
    S.clov.forEach((q) => { const x = q.x, y = q.y, r = 4 * q.s * PW * 1.6; c.fillStyle = "#2f8a3a"; c.beginPath(); for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU - 1.57; c.moveTo(x + Math.cos(a) * r + r, y + Math.sin(a) * r); c.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, r, 0, TAU); } c.fill(); });
    S.mush.forEach((x) => { const y = GY + 16 * PW, m = PW * 1.4; c.fillStyle = "#f5efe6"; c.fillRect(x - 4 * m, y - 16 * m, 8 * m, 16 * m); c.fillStyle = "#e0303a"; c.beginPath(); c.arc(x, y - 16 * m, 14 * m, Math.PI, TAU); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(x - 5 * m, y - 22 * m, 2.5 * m, 0, TAU); c.arc(x + 6 * m, y - 20 * m, 2 * m, 0, TAU); c.fill(); });
    glow(c, F.x, mouthY, 70 * PW, "rgba(255,255,255,.45)");
    potDraw(c, o.pt ?? t, S, o.tip);
  }
  const rainbow = {
    D: 8.8, facts: ["best"], fadeText: 1.9, cy: () => GY - rb().R - Math.min(W * 0.085, 82) * 0.45,
    init(S) { meadowInit(S); },
    draw(c, t, S, D) {
      // the last two seconds: a slow glide down the bow and in to the pot
      const e = easeIO((t - (D - 2.3)) / 2.3), F = foot(), A = potAnchor(), Z = Math.pow(Zf, e);
      c.save(); cam(c, { x: lerp(F.x, A.x, e), y: lerp(F.y, A.y, e) }, Z);
      meadow(c, t, S, { sun: ease(t / 1.8), arc: ease((t - 0.2) / 1.6) });
      c.restore();
    },
    // the letters ride up the bow one after another like a little train, leaning with the curve, then glide into place
    text: {
      at: 3.4, spread: 0.9, dur: 1.1, pre: 0.5, preScale: 0.8, preFade: 0.4, ease: (k) => easeIO(k), glow: "rgba(255,200,255,.9)", ink: ["#ff3b3b", "#ffb13b", "#ffe23b", "#4cd964", "#3bb3ff", "#b44dff"],
      delay: (p) => p.u * 0.9,
      from(p, S, t) { const B = rb(), a = Math.PI + clamp((t - 0.5 - (1 - p.u) * 0.5) / 3.2) * Math.PI * (0.25 + p.u * 0.5); return [B.cx + Math.cos(a) * (B.R + 16), B.cy + Math.sin(a) * (B.R + 16)]; },
      rotFrom(p, S, t) { const a = Math.PI + clamp((t - 0.5 - (1 - p.u) * 0.5) / 3.2) * Math.PI * (0.25 + p.u * 0.5); return a + Math.PI / 2; },
    },
    sound(e) { e.birds(0.5, 8, 0.02); [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => e.chime(f, 0.4 + i * 0.3, 0.04)); e.whoosh(6.4, 2, 0.06); },
  };

  // ---------------------------------------------------------------- 3. the pot at the end (empty!) and the dancing leprechaun
  function leprechaun(c, x, gy, s, t) {
    const hop = Math.abs(Math.sin(t * 6)) * 10 * s, kickL = Math.max(0, Math.sin(t * 6)), kickR = Math.max(0, -Math.sin(t * 6)), y = gy - hop;
    c.save(); c.lineCap = "round"; c.lineJoin = "round";
    // legs: white stockings, green breeches, buckled shoes, kicking in turn
    const hipY = y - 40 * s;
    [[-6, kickL, 1], [6, kickR, -1]].forEach(([dx, k, d]) => {
      const kx = x + dx * s + d * k * 10 * s, ky = hipY + 16 * s - k * 8 * s, fx = x + dx * s + d * k * 22 * s, fy = y - k * 16 * s;
      c.strokeStyle = "#1d6b2e"; c.lineWidth = 9 * s; c.beginPath(); c.moveTo(x + dx * s, hipY); c.lineTo(kx, ky); c.stroke();
      c.strokeStyle = "#f5f5f5"; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(kx, ky); c.lineTo(fx, fy - 3 * s); c.stroke();
      c.fillStyle = "#14141a"; c.beginPath(); c.ellipse(fx + d * 4 * s, fy - 1 * s, 8 * s, 3.5 * s, d * -k * 0.4, 0, TAU); c.fill(); c.fillStyle = "#ffd36b"; c.fillRect(fx + d * 2 * s - 2 * s, fy - 4 * s, 4 * s, 3 * s);
    });
    // coat
    c.fillStyle = "#1d7a34"; c.beginPath(); c.moveTo(x - 15 * s, hipY + 6 * s); c.lineTo(x - 13 * s, y - 80 * s); c.quadraticCurveTo(x, y - 86 * s, x + 13 * s, y - 80 * s); c.lineTo(x + 15 * s, hipY + 6 * s); c.closePath(); c.fill();
    c.fillStyle = "#14141a"; c.fillRect(x - 15 * s, hipY - 8 * s, 30 * s, 6 * s); c.fillStyle = "#ffd36b"; c.fillRect(x - 4 * s, hipY - 9 * s, 8 * s, 8 * s); c.fillStyle = "#14141a"; c.fillRect(x - 2 * s, hipY - 7 * s, 4 * s, 4 * s);
    c.fillStyle = "#ffd36b"; [0, 1, 2].forEach((i) => { c.beginPath(); c.arc(x, y - 72 * s + i * 9 * s, 1.8 * s, 0, TAU); c.fill(); });
    // both arms: swinging up over the head in turn, hands open
    [[-1, Math.sin(t * 6)], [1, -Math.sin(t * 6)]].forEach(([d, w]) => {
      const sx = x + d * 12 * s, sy = y - 76 * s, a1 = d * (1.9 + w * 0.7), ex = sx + Math.sin(a1) * 14 * s, ey = sy - Math.cos(a1) * 14 * s * -1, hx = ex + Math.sin(a1 + d * 0.6) * 13 * s, hy = ey - Math.cos(a1 + d * 0.6) * 13 * s * -1;
      c.strokeStyle = "#1d7a34"; c.lineWidth = 7 * s; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(hx, hy); c.stroke();
      c.fillStyle = "#f2c9a0"; c.beginPath(); c.arc(hx, hy, 4 * s, 0, TAU); c.fill();
    });
    // head: rosy cheeks, big grin, bright ginger hair and beard
    const hy0 = y - 96 * s;
    c.fillStyle = "#ff7a1a"; for (let i = -4; i <= 4; i++) { c.beginPath(); c.arc(x + i * 4 * s, hy0 - 5 * s + Math.abs(i) * 1.2 * s, 5 * s, 0, TAU); c.fill(); }
    c.fillStyle = "#f2c9a0"; c.beginPath(); c.arc(x, hy0, 13 * s, 0, TAU); c.fill();
    c.fillStyle = "#ff7a1a"; c.beginPath(); c.moveTo(x - 13 * s, hy0); c.quadraticCurveTo(x - 14 * s, hy0 + 22 * s, x, hy0 + 26 * s); c.quadraticCurveTo(x + 14 * s, hy0 + 22 * s, x + 13 * s, hy0); c.quadraticCurveTo(x, hy0 + 9 * s, x - 13 * s, hy0); c.fill();
    c.fillStyle = "#ff9a8a"; c.beginPath(); c.arc(x - 8 * s, hy0 + 3 * s, 3 * s, 0, TAU); c.arc(x + 8 * s, hy0 + 3 * s, 3 * s, 0, TAU); c.fill();
    c.fillStyle = "#1a1210"; c.beginPath(); c.arc(x - 5 * s, hy0 - 3 * s, 1.8 * s, 0, TAU); c.arc(x + 5 * s, hy0 - 3 * s, 1.8 * s, 0, TAU); c.fill();
    c.fillStyle = "#7a1a1a"; c.beginPath(); c.arc(x, hy0 + 5 * s, 5 * s, 0, Math.PI); c.fill(); c.fillStyle = "#fff"; c.fillRect(x - 4 * s, hy0 + 5 * s, 8 * s, 1.6 * s);
    c.fillStyle = "#e8a87a"; c.beginPath(); c.arc(x, hy0 + 1 * s, 2.4 * s, 0, TAU); c.fill();
    // tall green hat with a buckle
    c.save(); c.translate(x, hy0 - 11 * s); c.rotate(Math.sin(t * 6) * 0.08);
    c.fillStyle = "#1d6b2e"; c.fillRect(-20 * s, -4 * s, 40 * s, 6 * s); c.beginPath(); c.moveTo(-13 * s, -4 * s); c.lineTo(-11 * s, -34 * s); c.lineTo(11 * s, -34 * s); c.lineTo(13 * s, -4 * s); c.fill();
    c.fillStyle = "#14141a"; c.fillRect(-12 * s, -12 * s, 24 * s, 5 * s); c.fillStyle = "#ffd36b"; c.fillRect(-4 * s, -13 * s, 8 * s, 7 * s); c.fillStyle = "#14141a"; c.fillRect(-2 * s, -11 * s, 4 * s, 3 * s);
    c.fillStyle = "#4cd964"; c.beginPath(); [0, 2.1, 4.2].forEach((a) => c.arc(14 * s + Math.cos(a) * 3 * s, -10 * s + Math.sin(a) * 3 * s, 3 * s, 0, TAU)); c.fill();
    c.restore(); c.restore();
  }
  const potPan = (t) => easeIO((t - 2.3) / 1.4);
  const lep = (t) => { const s = s0 * (phone ? 1.25 : 1.6); return { x: W * (phone ? 0.5 : 0.62) + W * 0.45 * (1 - potPan(t)), gy: H * 0.82, s }; };
  const pot = {
    D: 9, facts: ["worst"], seamless: true, fadeText: 1.4, cy: () => H * 0.24,
    init(S) { meadowInit(S); },
    draw(c, t, S, D) {
      const pan = potPan(t) * W * 0.45, A = potAnchor(), F = foot(), ps = PW, px = F.x, gy = GY;
      c.save(); cam(c, { x: A.x - pan, y: A.y }, Zf);
      meadow(c, t + rainbow.D, S, { tip: true, pt: t, ct: t + 8.8 });
      // a moth flutters out of the empty pot, and the pot says so
      if (t > 0.9 && t < 4.5) { const k = (t - 0.9) / 3.6, mx = px + Math.sin(t * 7) * 20 * ps + k * 120 * ps, my = gy - 80 * ps - k * 160 * ps, f = Math.abs(Math.sin(t * 22)); c.fillStyle = "#d8cbb0"; c.beginPath(); c.ellipse(mx - 5 * ps * f, my, 6 * ps * f + 0.5, 4 * ps, -0.4, 0, TAU); c.ellipse(mx + 5 * ps * f, my, 6 * ps * f + 0.5, 4 * ps, 0.4, 0, TAU); c.fill(); c.fillStyle = "#6a5a4a"; c.fillRect(mx - 0.5, my - 3 * ps, 1, 7 * ps); }
      if (t > 1.1 && t < 3.4) { c.save(); c.globalAlpha = clamp((t - 1.1) / 0.3) * clamp((3.4 - t) / 0.4); c.fillStyle = "#fff"; c.strokeStyle = "#14141a"; c.lineWidth = 2 / Zf; const bx = px + 70 * ps, by = gy - 150 * ps; c.beginPath(); c.roundRect ? c.roundRect(bx - 52 * ps, by - 18 * ps, 104 * ps, 36 * ps, 12 * ps) : c.rect(bx - 52 * ps, by - 18 * ps, 104 * ps, 36 * ps); c.fill(); c.stroke(); c.beginPath(); c.moveTo(bx - 30 * ps, by + 18 * ps); c.lineTo(bx - 44 * ps, by + 34 * ps); c.lineTo(bx - 18 * ps, by + 18 * ps); c.fill(); c.fillStyle = "#14141a"; c.font = `800 ${15 * ps}px Inter, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("…it's empty!", bx, by); c.restore(); }
      c.restore();
      const L = lep(t); leprechaun(c, L.x, L.gy, L.s, t);
    },
    // the leprechaun's dancing kicks send the letters flying
    text: {
      at: 4.0, spread: 1.2, dur: 1.0, arc: H * 0.2, startScale: 0.25, spin: 1.5, glow: "rgba(255,210,90,.9)", ink: ["#ffe9a8", "#ffd36b", "#4cd964"],
      from(p, S, t) { const L = lep(t), d = Math.sin(t * 6) > 0 ? 1 : -1; return [L.x + d * 26 * L.s, L.gy - 12 * L.s]; },
    },
    sound(e) { e.noise("bandpass", 300, 2, 0.6, 0.6, [[0.6, 0], [0.62, 0.15], [0.7, 0], [0.9, 0.12], [1, 0]]); e.tone(220, 1.2, 0.5, 0.05, "triangle"); e.tone(175, 1.5, 0.7, 0.05, "triangle");
      const jig = [587, 659, 740, 784, 740, 659, 587, 0, 587, 659, 740, 880, 784, 740, 659, 0, 740, 784, 880, 988, 880, 784, 740, 659, 587, 659, 740, 659, 587, 0];
      e.melody(jig, 2.4, 0.19, 0.035, "square", 0.6); e.melody(jig.map((f) => (f ? f / 2 : 0)), 2.4, 0.19, 0.02, "triangle", 0.8); e.clop(2.4, 6, 3.15, 0.04); },
  };

  // ---------------------------------------------------------------- 4. a UFO beams the leprechaun up and flies off into space
  function ufo(c, x, y, s, t, inside) {
    c.save(); c.translate(x, y); c.rotate(Math.sin(t * 1.7) * 0.05);
    // glass dome (with a small green hat inside once he is aboard)
    const dg = c.createLinearGradient(0, -40 * s, 0, 0); dg.addColorStop(0, "rgba(190,255,250,.75)"); dg.addColorStop(1, "rgba(80,200,220,.45)");
    if (inside) { c.save(); c.translate(0, -12 * s); c.rotate(Math.sin(t * 4) * 0.2); c.fillStyle = "#ff7a1a"; c.beginPath(); c.arc(0, 2 * s, 7 * s, 0, TAU); c.fill(); c.fillStyle = "#f2c9a0"; c.beginPath(); c.arc(0, 0, 5 * s, 0, TAU); c.fill(); c.fillStyle = "#1d6b2e"; c.fillRect(-7 * s, -6 * s, 14 * s, 2.5 * s); c.fillRect(-4.5 * s, -14 * s, 9 * s, 9 * s); c.restore(); }
    c.fillStyle = dg; c.beginPath(); c.ellipse(0, -8 * s, 30 * s, 30 * s, 0, Math.PI, TAU); c.fill();
    c.fillStyle = "rgba(255,255,255,.55)"; c.beginPath(); c.ellipse(-12 * s, -24 * s, 6 * s, 10 * s, 0.5, 0, TAU); c.fill();
    // the saucer: a shiny disc with a glowing belly and lights running round the rim
    const bg = c.createLinearGradient(0, -14 * s, 0, 16 * s); bg.addColorStop(0, "#f2f5fb"); bg.addColorStop(0.45, "#a8b0c4"); bg.addColorStop(1, "#5a6278");
    c.fillStyle = "#4a5266"; c.beginPath(); c.ellipse(0, 8 * s, 38 * s, 12 * s, 0, 0, TAU); c.fill();
    glow(c, 0, 16 * s, 30 * s, "rgba(140,255,200,.7)");
    c.fillStyle = bg; c.beginPath(); c.ellipse(0, 0, 74 * s, 17 * s, 0, 0, TAU); c.fill();
    c.strokeStyle = "rgba(40,44,60,.5)"; c.lineWidth = 1.5 * s; c.beginPath(); c.ellipse(0, 1 * s, 74 * s, 6 * s, 0, 0, Math.PI); c.stroke();
    const cols = ["#ff4fd8", "#2ef2ff", "#ffd36b", "#4cd964"];
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI + 0.1 * 0, lx = Math.cos(a + 0) * 64 * s * (i % 2 ? 1 : 0.999), ly = 5 * s + Math.sin(a) * 6 * s; const on = Math.floor(t * 8 + i) % 4; c.fillStyle = cols[on]; c.beginPath(); c.arc(lx, ly, 3 * s, 0, TAU); c.fill(); glow(c, lx, ly, 8 * s, cols[on] + "88"); }
    c.restore();
  }
  const UX = (t) => { const k = ease(t / 1.4); return { x: lerp(W * 1.15, W * (phone ? 0.5 : 0.6), k), y: lerp(-H * 0.1, H * 0.34, k) + Math.sin(t * 2) * 6 * s0 }; };
  const rise = (t) => easeIO((t - 3.6) / 1.9);
  const ufoPos = (t) => { const a = UX(t), u = rise(t); return { x: lerp(a.x, W * 0.5, u), y: a.y - Math.sin(Math.PI * u) * H * 0.12 - u * H * 0.12 }; };
  const ufoCh = {
    D: 9.4, facts: ["call"], seamless: true, cy: () => H * (phone ? 0.5 : 0.55),
    init(S) { meadowInit(S); S.st = stars(phone ? 160 : 260, 1); S.lines = Array.from({ length: 40 }, () => ({ x: Math.random(), y: Math.random(), l: rnd(40, 140) })); },
    draw(c, t, S) {
      const u = rise(t), U = ufoPos(t), L = lep(9), us = s0 * (phone ? 0.85 : 1.1);
      // looking up as we follow it: the meadow drops away, the sky darkens to space
      const top = `rgb(${Math.round(lerp(90, 0, u))},${Math.round(lerp(150, 2, u))},${Math.round(lerp(230, 14, u))})`;
      c.fillStyle = top; c.fillRect(0, 0, W, H);
      if (u < 0.999) { c.save(); c.translate(0, u * H * 1.5); const A = potAnchor(); cam(c, { x: A.x - W * 0.45, y: A.y }, Zf); meadow(c, 9 + t, S, { ct: 18 + t }); c.restore(); }
      if (u > 0) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, `rgba(2,3,16,${u})`); g.addColorStop(1, `rgba(10,20,60,${u * 0.9})`); c.fillStyle = g; c.fillRect(0, 0, W, H); drawStars(c, S.st, t, clamp((u - 0.4) / 0.6)); }
      // streaks of speed while it climbs
      const sp = Math.sin(Math.PI * clamp((t - 3.6) / 1.9)); if (sp > 0.05) { c.strokeStyle = `rgba(255,255,255,${0.35 * sp})`; c.lineWidth = 1.5; c.beginPath(); S.lines.forEach((q) => { const y = ((q.y + t * 2.5) % 1) * H, x = q.x * W; c.moveTo(x, y); c.lineTo(x, y + q.l * sp); }); c.stroke(); }
      // Earth's curve rising into view below
      const ek = clamp((u - 0.55) / 0.45); if (ek > 0) { const R = Math.max(W, H) * 1.3, ex = W * 0.5, ey = H + R * 0.72 + (1 - ek) * H * 0.4; glow(c, ex, ey, R * 1.06, "rgba(90,170,255,.35)"); const g = c.createRadialGradient(ex - R * 0.2, ey - R * 0.9, R * 0.1, ex, ey, R); g.addColorStop(0, "#3a9ae8"); g.addColorStop(0.7, "#1a5aa8"); g.addColorStop(1, "#0a2a5a"); c.fillStyle = g; c.beginPath(); c.arc(ex, ey, R, 0, TAU); c.fill(); c.fillStyle = "rgba(255,255,255,.5)"; for (let i = 0; i < 12; i++) { const x = ((i * 0.37 + t * 0.01) % 1) * W * 1.2 - W * 0.1, y = ey - Math.sqrt(Math.max(0, R * R - (x - ex) * (x - ex))) + 14 + (i % 4) * 18; c.beginPath(); c.ellipse(x, y, 60 * s0, 5 * s0, 0, 0, TAU); c.fill(); } c.strokeStyle = "rgba(140,210,255,.8)"; c.lineWidth = 4; c.beginPath(); c.arc(ex, ey, R + 2, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
      // the tractor beam lifts him up, spinning gently, into the saucer
      const beam = clamp((t - 1.3) / 0.3) * (1 - clamp((t - 3.3) / 0.3)), up = easeIO((t - 1.6) / 1.6);
      if (beam > 0) { const bg = c.createLinearGradient(0, U.y, 0, L.gy); bg.addColorStop(0, `rgba(150,255,200,${0.55 * beam})`); bg.addColorStop(1, `rgba(150,255,200,${0.12 * beam})`); c.fillStyle = bg; c.beginPath(); c.moveTo(U.x - 22 * us, U.y + 12 * us); c.lineTo(U.x + 22 * us, U.y + 12 * us); c.lineTo(U.x + 80 * us, L.gy + 6); c.lineTo(U.x - 80 * us, L.gy + 6); c.fill(); c.strokeStyle = `rgba(220,255,235,${0.5 * beam})`; c.lineWidth = 1.5; for (let i = 0; i < 5; i++) { const k = (t * 0.8 + i / 5) % 1, y = lerp(L.gy, U.y + 14 * us, k), w = lerp(80, 22, k) * us; c.beginPath(); c.ellipse(U.x, y, w, w * 0.18, 0, 0, TAU); c.stroke(); } }
      if (t < 3.25) { const lx = lerp(L.x, U.x, up), ly = lerp(L.gy, U.y + 10 * us, up), sc = lerp(1, 0.25, up); c.save(); c.translate(lx, ly - 50 * L.s * sc); c.rotate(up * Math.PI * 2.2); c.scale(sc, sc); c.translate(0, 50 * L.s); leprechaun(c, 0, 0, L.s, up > 0 ? t * 0.3 : t); c.restore(); }
      ufo(c, U.x, U.y, us, t, t > 3.2);
    },
    // once in space, the saucer beams the fact down, letter by letter
    text: {
      at: 5.7, spread: 1.1, dur: 0.9, startScale: 0.2, spin: 0, ease: (k) => easeIO(k), glow: "rgba(150,255,200,.95)", ink: ["#eaffe8", "#9dffb0", "#2ef2ff"],
      from: (p, S, t) => { const U = ufoPos(t); return [U.x + (p.r - 0.5) * 30 * s0, U.y + 16 * s0]; },
    },
    sound(e) {
      e.osc("sawtooth", 70, 0, 9.4, [[0, 0], [1, 0.05], [8.8, 0.05], [9.4, 0]], 72, 400); e.osc("sine", 440, 0.2, 9, [[0.2, 0], [1, 0.02], [9, 0]], 460);
      e.sparkle(1.3, 2, 0.015); e.osc("sine", 300, 1.4, 2, [[1.4, 0], [1.6, 0.05], [3.3, 0]], 1200); e.whoosh(3.6, 1.9, 0.25); e.tone(130.8, 5.5, 3.5, 0.03); for (let i = 0; i < 10; i++) e.beep(5.7 + i * 0.11, 1200 + i * 90, 0.02);
    },
  };

  // ---------------------------------------------------------------- 5. the space station, astronauts looking at Earth
  function station(c, x, y, s, t) {
    c.save(); c.translate(x, y); c.rotate(Math.sin(t * 0.3) * 0.04);
    c.fillStyle = "#b9bdca"; c.fillRect(-210 * s, -5 * s, 420 * s, 10 * s); c.strokeStyle = "rgba(60,60,80,.6)"; c.lineWidth = 1; c.beginPath(); for (let i = -210; i < 210; i += 10) { c.moveTo(i * s, -5 * s); c.lineTo((i + 10) * s, 5 * s); } c.stroke();
    // solar wings: dark blue cells with gold frames
    [-180, -130, 130, 180].forEach((dx) => [-1, 1].forEach((d) => { const wx = dx * s - 16 * s, wy = d < 0 ? -96 * s : 8 * s; c.fillStyle = "#1a2a5a"; c.fillRect(wx, wy, 32 * s, 88 * s); c.strokeStyle = "#c9a23a"; c.lineWidth = 1.5; c.strokeRect(wx, wy, 32 * s, 88 * s); c.strokeStyle = "rgba(201,162,58,.5)"; c.lineWidth = 0.8; c.beginPath(); for (let k = 1; k < 8; k++) { c.moveTo(wx, wy + k * 11 * s); c.lineTo(wx + 32 * s, wy + k * 11 * s); } c.moveTo(wx + 16 * s, wy); c.lineTo(wx + 16 * s, wy + 88 * s); c.stroke(); c.fillStyle = "rgba(120,160,255,.15)"; c.fillRect(wx, wy, 16 * s, 88 * s); }));
    // white radiators and the modules
    c.fillStyle = "#e8eaf2"; [-70, 60].forEach((dx) => c.fillRect(dx * s, 8 * s, 12 * s, 40 * s));
    const mod = (mx, my, w, h) => { const g = c.createLinearGradient(0, my - h / 2, 0, my + h / 2); g.addColorStop(0, "#f4f6fb"); g.addColorStop(1, "#9aa0b4"); c.fillStyle = g; c.beginPath(); c.roundRect ? c.roundRect(mx - w / 2, my - h / 2, w, h, h / 2) : c.rect(mx - w / 2, my - h / 2, w, h); c.fill(); };
    mod(0, -16 * s, 120 * s, 22 * s); mod(-56 * s, -16 * s, 40 * s, 28 * s); mod(10 * s, 16 * s, 26 * s, 40 * s);
    // the cupola: a window facing Earth with two astronauts looking out
    c.fillStyle = "#cfd3de"; c.beginPath(); c.arc(10 * s, 46 * s, 22 * s, 0, TAU); c.fill(); c.fillStyle = "#0b1a2e"; c.beginPath(); c.arc(10 * s, 46 * s, 17 * s, 0, TAU); c.fill();
    c.save(); c.beginPath(); c.arc(10 * s, 46 * s, 17 * s, 0, TAU); c.clip();
    [[3, 1], [17, -1]].forEach(([dx, d], i) => { const bob = Math.sin(t * 1.2 + i * 2) * 1.5 * s; c.fillStyle = "#f2f2f6"; c.beginPath(); c.arc(dx * s, 52 * s + bob, 7 * s, 0, TAU); c.fill(); c.fillRect((dx - 7) * s, 52 * s + bob, 14 * s, 12 * s); c.fillStyle = "#ffcf6b"; c.beginPath(); c.ellipse(dx * s + d * 1.5 * s, 53 * s + bob, 4.5 * s, 3.4 * s, 0, 0, TAU); c.fill(); c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.arc(dx * s + d * 3 * s, 51 * s + bob, 1.2 * s, 0, TAU); c.fill(); c.strokeStyle = "#f2f2f6"; c.lineWidth = 3 * s; c.beginPath(); c.moveTo((dx - 6) * s, 58 * s + bob); c.lineTo((dx - 2 + d * 6) * s, 46 * s + bob + Math.sin(t * 2 + i) * 2 * s); c.stroke(); });
    c.fillStyle = "rgba(160,200,255,.18)"; c.fillRect(-10 * s, 30 * s, 40 * s, 10 * s); c.restore();
    c.strokeStyle = "#9aa0b4"; c.lineWidth = 3 * s; for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; c.beginPath(); c.moveTo(10 * s + Math.cos(a) * 17 * s, 46 * s + Math.sin(a) * 17 * s); c.lineTo(10 * s + Math.cos(a) * 22 * s, 46 * s + Math.sin(a) * 22 * s); c.stroke(); }
    c.restore();
  }
  const issPos = (t) => ({ x: lerp(W * 0.32, W * 0.52, ease(t / 5)), y: H * (phone ? 0.24 : 0.27), s: s0 * (phone ? 0.75 : 1.05) });
  const iss = {
    D: 8.6, facts: ["insider", "watch"], cy: () => H * (phone ? 0.52 : 0.56),
    init(S) { S.st = stars(200, 1); S.land = Array.from({ length: 9 }, () => ({ a: rnd(-0.9, 0.9), r: rnd(0.02, 0.08), w: rnd(0.04, 0.12), c: Math.random() > 0.5 ? "#3a8a4a" : "#9a8a5a" })); S.cloud = Array.from({ length: 22 }, () => ({ a: rnd(-1, 1), r: rnd(0.01, 0.12), w: rnd(0.02, 0.08) })); },
    draw(c, t, S) {
      sky(c, ["#000004", "#02030c"]); drawStars(c, S.st, t);
      const R = Math.max(W, H) * 1.3, ex = W * 0.5, ey = H + R * 0.68;
      // Earth: deep blue ocean, land, swirling cloud, and a thin glowing atmosphere
      glow(c, ex, ey, R * 1.07, "rgba(90,170,255,.35)");
      const g = c.createRadialGradient(ex - R * 0.2, ey - R * 0.9, R * 0.1, ex, ey, R); g.addColorStop(0, "#3a9ae8"); g.addColorStop(0.7, "#1a5aa8"); g.addColorStop(1, "#0a2a5a"); c.fillStyle = g; c.beginPath(); c.arc(ex, ey, R, 0, TAU); c.fill();
      c.save(); c.beginPath(); c.arc(ex, ey, R, 0, TAU); c.clip(); const rot = t * 0.006;
      const limb = (x) => ey - Math.sqrt(Math.max(0, R * R - (x - ex) * (x - ex)));
      S.land.forEach((l) => { const x = ((l.a + 1) / 2 * W * 1.4 + t * 6) % (W * 1.4) - W * 0.2, y0 = limb(x), d = l.r / 0.08, y = y0 + 10 + d * (H - y0) * 0.7, sc = 0.4 + d; c.fillStyle = l.c; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(x + Math.sin(i * 2.3 + l.w * 40) * 40 * sc * s0, y + Math.cos(i * 1.7) * 8 * sc * s0, (30 + (i % 3) * 14) * sc * s0, (8 + (i % 2) * 5) * sc * s0, 0, 0, TAU); c.fill(); } });
      S.cloud.forEach((l) => { const x = ((l.a + 1) / 2 * W * 1.4 + t * 9) % (W * 1.4) - W * 0.2, y0 = limb(x), d = l.r / 0.12, y = y0 + 6 + d * (H - y0) * 0.8, sc = 0.4 + d; c.fillStyle = "rgba(255,255,255,.6)"; c.beginPath(); c.ellipse(x, y, (40 + l.w * 300) * sc * s0, 5 * sc * s0, 0, 0, TAU); c.ellipse(x + 30 * sc * s0, y + 4 * sc * s0, 30 * sc * s0, 4 * sc * s0, 0, 0, TAU); c.fill(); });
      c.restore();
      c.strokeStyle = "rgba(140,210,255,.8)"; c.lineWidth = 4; c.beginPath(); c.arc(ex, ey, R + 2, Math.PI * 1.1, Math.PI * 1.9); c.stroke();
      glow(c, W * 0.95, H * 0.62, H * 0.35, "rgba(255,240,210,.35)");
      const P = issPos(t); station(c, P.x, P.y, P.s, t);
    },
    // the letters float out of the station's window and drift into place
    text: {
      at: 3.4, spread: 1.4, dur: 1.4, pre: 0.8, preScale: 0.5, preFade: 0.7, spin: 0.35, ease: (k) => easeIO(k), glow: "rgba(90,170,255,.9)", ink: ["#cfe9ff", "#7ab8ff", "#2ef2ff"],
      from(p, S, t) { const P = issPos(t), k = clamp((t - 0.8) / 4); return [P.x + 10 * P.s + (p.r - 0.5) * 260 * P.s * k + Math.sin(t + p.q * 9) * 6, P.y + 46 * P.s + (p.q * 120 + 10) * P.s * k]; },
    },
    sound(e) { e.tone(55, 0, 8.6, 0.05, "sine"); e.tone(82.4, 0.5, 8, 0.03, "sine"); [1.2, 4.6].forEach((a) => { e.beep(a, 2525, 0.03); e.beep(a + 0.4, 2475, 0.03); }); },
  };

  // ---------------------------------------------------------------- 6. the stars align
  const align = {
    D: 8.2, facts: ["busiest", "insider", "shelter"], cy: () => H * 0.42,
    init(S) { S.st = stars(phone ? 220 : 380, 0.9); S.mw = Array.from({ length: phone ? 300 : 600 }, () => { const u = Math.random(); return { x: u * W, y: H * (0.75 - u * 0.6) + rnd(-1, 1) * H * 0.08, r: rnd(0.3, 1) }; }); S.lines = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => [rnd(0.05, 0.95) * W, rnd(0.05, 0.6) * H])); S.hill = ridge(3.3, H * 0.03, H * 0.86); },
    draw(c, t, S) {
      sky(c, ["#02020a", "#070a20", "#120c2c"]);
      // the milky way
      c.save(); c.translate(W / 2, H * 0.45); c.rotate(-0.55); const g = c.createLinearGradient(0, -H * 0.15, 0, H * 0.15); g.addColorStop(0, "rgba(140,120,255,0)"); g.addColorStop(0.5, "rgba(180,160,255,.16)"); g.addColorStop(1, "rgba(140,120,255,0)"); c.fillStyle = g; c.fillRect(-W, -H * 0.15, W * 2, H * 0.3); c.restore();
      c.fillStyle = "rgba(255,255,255,.5)"; S.mw.forEach((q) => c.fillRect(q.x, q.y, q.r, q.r));
      drawStars(c, S.st, t);
      // constellations draw themselves, then fade as the stars move
      const ck = clamp(t / 2) * (1 - clamp((t - 2.6) / 0.8));
      if (ck > 0) { c.strokeStyle = `rgba(160,190,255,${0.45 * ck})`; c.lineWidth = 1; S.lines.forEach((L) => { c.beginPath(); L.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); L.forEach(([x, y]) => glow(c, x, y, 6, `rgba(220,230,255,${ck})`)); }); }
      // a little observatory on the hill
      hill(c, S.hill, "#06050e"); const ox = W * 0.8, oy = S.hill(ox); c.fillStyle = "#0e0c1a"; c.fillRect(ox - 22 * s0, oy - 30 * s0, 44 * s0, 30 * s0); c.beginPath(); c.arc(ox, oy - 30 * s0, 22 * s0, Math.PI, TAU); c.fill(); c.fillStyle = "rgba(255,214,120,.6)"; c.fillRect(ox - 4 * s0, oy - 50 * s0, 8 * s0, 18 * s0);
    },
    text: { mode: "dots", at: 2.8, spread: 1.2, dur: 1.8, crisp: 0.9, glow: "rgba(200,220,255,1)", color: "#fff", ease: easeIO, from: (p) => [((p.r * 9301) % 1) * W, ((p.q * 4973) % 1) * H * 0.85] },
    sound(e) { e.sparkle(2.8, 2.5, 0.015); [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => e.chime(f, 4.5 + i * 0.25, 0.03)); e.tone(130.8, 0, 8, 0.03); },
  };

  return [umbrella, rainbow, pot, ufoCh, iss, align];
});
