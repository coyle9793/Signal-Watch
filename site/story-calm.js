// Breezy story: a walk in light rain under an umbrella (with the cavapoo and the lhasa apso on their
// leads) -> a rainbow with the words riding it -> down to the pot at its end (empty!) and a dancing
// leprechaun -> into his ginger hair and his busy brain -> out to the space station -> the stars align.
WXS.add("windy", (K) => {
  const { W, H, rnd, clamp, ease, easeIO, lerp, TAU, sky, glow, stars, drawStars, ridge, hill, cloud, tree, lamp, rainLines, E } = K;
  const s0 = Math.min(W, H) / 700, phone = W < 600;
  const BOW = ["#ff3b3b", "#ff9a3b", "#ffe23b", "#4cd964", "#3bb3ff", "#5a5bff", "#b44dff"];

  // ---------------------------------------------------------------- 1. umbrella walk in the rain
  const ws = clamp(Math.min(W, H) / 560, 0.6, 1.35), wgy = H * (phone ? 0.8 : 0.86);
  const walkX = (t) => W * (phone ? lerp(0.12, 0.3, t / 9) : lerp(0.22, 0.4, t / 9));
  const canopy = (t) => { const x = walkX(t) + 2 * ws, R = 66 * ws; return { x, y: wgy - 150 * ws, R }; };
  const drop = (p, t) => { const dep = 3.0 + p.u * 1.3 + p.r * 0.4; return dep; };
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
      // light rain, kept off the umbrella
      rainLines(c, phone ? 110 : 220, t, { speed: 1.4, slant: 0.12, col: "rgba(220,235,255,.45)", len: 14, skip: (rx, ry) => Math.abs(rx - U.x) < U.R && ry > U.y - U.R * 0.95 && ry < wgy });
      // the walker and the two dogs, on the ends of their leads
      const e = E();
      e.walker(c, x, wgy, ws, t, 0.12); e.lhasa(c, x + 62 * ws, wgy, ws, t, 0.12); e.cavapoo(c, x + 124 * ws, wgy, ws, t, 0.12);
      // the umbrella, held over their head
      c.strokeStyle = "#e8e8f0"; c.lineWidth = 3 * ws; c.lineCap = "round"; c.beginPath(); c.moveTo(U.x, U.y); c.lineTo(U.x - 2 * ws, wgy - 66 * ws); c.arc(U.x + 3 * ws, wgy - 66 * ws, 5 * ws, Math.PI, 0, true); c.stroke();
      const g = c.createLinearGradient(U.x - U.R, 0, U.x + U.R, 0); g.addColorStop(0, "#ff4fd8"); g.addColorStop(0.5, "#b44dff"); g.addColorStop(1, "#2ef2ff");
      c.fillStyle = g; c.beginPath(); c.arc(U.x, U.y, U.R, Math.PI, TAU); for (let i = 5; i >= 0; i--) c.quadraticCurveTo(U.x - U.R + (i + 0.5) * U.R / 3, U.y + 9 * ws, U.x - U.R + (i * U.R) / 3, U.y); c.fill();
      c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 1.2; c.beginPath(); for (let i = 1; i < 6; i++) { c.moveTo(U.x, U.y - U.R); c.quadraticCurveTo(U.x - U.R + (i * U.R) / 3, U.y - U.R * 0.6, U.x - U.R + (i * U.R) / 3, U.y); } c.stroke();
      c.fillStyle = "#e8e8f0"; c.beginPath(); c.arc(U.x, U.y - U.R - 3 * ws, 3 * ws, 0, TAU); c.fill();
      // drops hitting the canopy splash up and off both sides
      c.fillStyle = "rgba(225,240,255,.95)";
      for (let i = 0; i < 34; i++) { const k = (t * 1.3 + (i * 0.618) % 1) % 1, u = ((i * 0.3819) % 1) * 2 - 1, hx = U.x + u * U.R * 0.92, hy = U.y - Math.sqrt(1 - u * u * 0.85) * U.R, dir = u < 0 ? -1 : 1, ox = dir * (20 + (i % 5) * 9) * ws * k, oy = -Math.sin(k * Math.PI) * (16 + (i % 4) * 6) * ws + k * k * 30 * ws; c.globalAlpha = 1 - k; c.beginPath(); c.ellipse(hx + ox, hy + oy, 1.6 * ws, 2.2 * ws, 0, 0, TAU); c.fill(); }
      c.globalAlpha = 1;
      // drips off the rim
      for (let i = 0; i < 6; i++) { const k = (t * 1.8 + i / 6) % 1, rx = U.x - U.R + (i / 5) * U.R * 2; c.fillStyle = `rgba(225,240,255,${1 - k})`; c.beginPath(); c.arc(rx, U.y + 4 + k * 60 * ws, 1.8 * ws, 0, TAU); c.fill(); }
    },
    // each letter falls as a raindrop, hits the umbrella and bounces off into place
    text: {
      at: 3.0, spread: 1.7, dur: 1.0, pre: 1.6, preScale: 0.55, spin: 0.8, arc: H * 0.12, glow: "rgba(120,190,255,.9)", ink: ["#cdeeff", "#7ab8ff", "#b44dff"],
      delay: (p) => p.u * 1.3 + p.r * 0.4,
      from(p, S, t) { const dep = drop(p, t), U = canopy(Math.min(t, dep)), u = (p.r - 0.5) * 1.5, hx = U.x + u * U.R, hy = U.y - Math.sqrt(Math.max(0, 1 - u * u)) * U.R - 8; const k = clamp((t - (dep - 0.9)) / 0.9); return [hx, lerp(-60, hy, k * k)]; },
    },
    sound(e) { e.rain(0, 8.6, 0.12); e.crackle(0, 8.4, 28, 0.05); e.noise("bandpass", 480, 3, 2.2, 0.15, [[2.2, 0], [2.21, 0.18], [2.32, 0]]); e.noise("bandpass", 620, 3, 5.6, 0.15, [[5.6, 0], [5.61, 0.15], [5.7, 0]]); },
  };

  // ---------------------------------------------------------------- 2. the rainbow, with the words riding it
  const rb = () => ({ cx: W * 0.5, cy: H * 1.0, R: Math.min(W * (phone ? 0.46 : 0.4), H * 0.7) });
  const rainbow = {
    D: 8.8, facts: ["best"], cy: () => H * 1.0 - Math.min(W * (phone ? 0.46 : 0.4), H * 0.7) - Math.min(W * 0.085, 82) * 0.3,
    init(S) { S.r1 = ridge(1.3, H * 0.04, H * 0.72); S.r2 = ridge(6.1, H * 0.03, H * 0.8); S.cl = Array.from({ length: 6 }, (_, i) => ({ x: rnd(0, 1), y: rnd(0.04, 0.24), r: rnd(30, 60) * s0, sd: i })); S.trees = Array.from({ length: 9 }, () => ({ u: Math.random(), s: rnd(0.5, 0.9) })); },
    draw(c, t, S, D) {
      const B = rb(), pan = easeIO((t - (D - 2)) / 2), k = ease(t / 1.8);
      c.save(); const fx = B.cx + B.R, fy = B.cy; c.translate(fx, fy); c.scale(1 + pan * 1.6, 1 + pan * 1.6); c.translate(-fx + pan * -W * 0.05, -fy - pan * H * 0.05);
      sky(c, [`rgb(${lerp(90, 70, k)},${lerp(130, 160, k)},${lerp(180, 235, k)})`, "#bfe2ff", "#eaf6ff"], 0, H * 0.74);
      glow(c, W * 0.12, H * 0.12, H * 0.35, `rgba(255,245,200,${0.8 * k})`); c.fillStyle = `rgba(255,250,220,${k})`; c.beginPath(); c.arc(W * 0.12, H * 0.12, Math.min(W, H) * 0.045, 0, TAU); c.fill();
      S.cl.forEach((q, i) => cloud(c, q.x * W + (i % 2 ? 1 : -1) * t * 14 * (1 + k), q.y * H, q.r, `rgba(255,255,255,${0.6 + 0.3 * k})`, 5, q.sd));
      // the bow itself
      const arc = ease((t - 0.2) / 1.6) * Math.PI;
      BOW.forEach((col, i) => { c.strokeStyle = col; c.globalAlpha = 0.72; c.lineWidth = B.R * 0.04; c.beginPath(); c.arc(B.cx, B.cy, B.R - i * B.R * 0.04, Math.PI, Math.PI + arc); c.stroke(); });
      c.globalAlpha = 0.25; c.strokeStyle = "#fff"; c.lineWidth = B.R * 0.3; c.beginPath(); c.arc(B.cx, B.cy, B.R * 0.62, Math.PI, Math.PI + arc); c.stroke(); c.globalAlpha = 1;
      hill(c, S.r1, "#5aa060"); hill(c, S.r2, "#3e8a48");
      S.trees.forEach((q) => tree(c, q.u * W, S.r2(q.u * W) + 6, s0 * q.s, { col: "#2f7a3a", dark: "#256a30" }));
      // a little village on the far hill
      for (let i = 0; i < 5; i++) { const x = W * (0.1 + i * 0.04), y = S.r1(x) + 4; c.fillStyle = "#f5efe6"; c.fillRect(x, y - 14 * s0, 16 * s0, 14 * s0); c.fillStyle = "#c0503a"; c.beginPath(); c.moveTo(x - 2 * s0, y - 14 * s0); c.lineTo(x + 8 * s0, y - 22 * s0); c.lineTo(x + 18 * s0, y - 14 * s0); c.fill(); }
      c.restore();
    },
    // the letters slide up the bow from its left foot and settle along the top
    text: {
      at: 3.6, spread: 0.7, dur: 0.8, pre: 0.6, preScale: 0.85, spin: 0, ease: (k) => ease(k), glow: "rgba(255,200,255,.9)", ink: ["#ff3b3b", "#ffb13b", "#ffe23b", "#4cd964", "#3bb3ff", "#b44dff"],
      from(p, S, t) { const B = rb(), a = Math.PI + clamp((t - 0.6) / 2.8) * (Math.PI * (0.32 + p.u * 0.36)); return [B.cx + Math.cos(a) * (B.R + 14), B.cy + Math.sin(a) * (B.R + 14)]; },
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
    D: 9, facts: ["worst"], cy: () => H * 0.24,
    init(S) { S.clov = Array.from({ length: phone ? 50 : 110 }, () => ({ x: rnd(-0.2, 1.6), y: rnd(0.76, 1), s: rnd(0.6, 1.2) })); S.mush = [0.08, 0.86, 1.25, 1.45]; S.cl = Array.from({ length: 5 }, (_, i) => ({ x: rnd(0, 1.5), y: rnd(0.05, 0.3), r: rnd(30, 60) * s0, sd: i })); },
    draw(c, t, S) {
      const pan = potPan(t) * W * 0.45, gy = H * 0.82, ps = s0 * (phone ? 1.2 : 1.5), px = W * 0.42;
      sky(c, ["#6cc0ff", "#bfe6ff", "#e8f7ff"], 0, gy);
      c.save(); c.translate(-pan, 0);
      S.cl.forEach((q) => cloud(c, q.x * W, q.y * H, q.r, "rgba(255,255,255,.9)", 5, q.sd));
      hill(c, ridge(2.2, H * 0.03, H * 0.7), "#6ab86a", -20, W * 1.6); sky(c, ["#4fa65a", "#2f7a3a"], gy - H * 0.06, H + 10);
      // the bow comes down into the pot
      BOW.forEach((col, i) => { c.strokeStyle = col; c.globalAlpha = 0.6; c.lineWidth = 9 * ps; c.beginPath(); c.moveTo(px - 10 * ps + i * 9 * ps - 60 * ps, -10); c.quadraticCurveTo(px - 10 * ps + i * 9 * ps - 20 * ps, gy * 0.5, px - 26 * ps + i * 8 * ps, gy - 74 * ps); c.stroke(); });
      c.globalAlpha = 1; glow(c, px, gy - 70 * ps, 90 * ps, "rgba(255,255,255,.4)");
      // the pot: rocks, tips towards us, and is empty - a moth flutters out
      const tip = Math.sin(clamp((t - 0.6) / 1.2) * Math.PI) * 0.35, wob = Math.sin(t * 9) * 0.04 * (1 - clamp(t / 1));
      c.save(); c.translate(px, gy - 4 * ps); c.rotate(wob);
      c.fillStyle = "rgba(0,0,0,.25)"; c.beginPath(); c.ellipse(0, 4 * ps, 52 * ps, 9 * ps, 0, 0, TAU); c.fill();
      const bg = c.createRadialGradient(-14 * ps, -46 * ps, 4 * ps, 0, -34 * ps, 56 * ps); bg.addColorStop(0, "#4a4a5a"); bg.addColorStop(1, "#14141a"); c.fillStyle = bg;
      c.beginPath(); c.ellipse(0, -36 * ps, 48 * ps, 40 * ps, 0, 0, TAU); c.fill(); [[-34, 1], [34, 1]].forEach(([dx]) => { c.fillRect(dx * ps - 4 * ps, -4 * ps, 8 * ps, 6 * ps); });
      const rimH = (10 + tip * 40) * ps; c.fillStyle = "#08080c"; c.beginPath(); c.ellipse(0, -70 * ps, 40 * ps, rimH, 0, 0, TAU); c.fill();
      c.strokeStyle = "#3a3a48"; c.lineWidth = 7 * ps; c.beginPath(); c.ellipse(0, -70 * ps, 43 * ps, rimH + 2 * ps, 0, 0, TAU); c.stroke();
      if (tip > 0.05) { c.strokeStyle = "rgba(220,220,230,.5)"; c.lineWidth = 1; c.beginPath(); c.moveTo(-26 * ps, -70 * ps); c.lineTo(10 * ps, -70 * ps + rimH * 0.6); c.moveTo(-26 * ps, -70 * ps + rimH * 0.5); c.lineTo(20 * ps, -70 * ps - rimH * 0.3); c.stroke(); }
      c.restore();
      if (t > 0.9 && t < 4.5) { const k = (t - 0.9) / 3.6, mx = px + Math.sin(t * 7) * 20 * ps + k * 120 * ps, my = gy - 80 * ps - k * 160 * ps, f = Math.abs(Math.sin(t * 22)); c.fillStyle = "#d8cbb0"; c.beginPath(); c.ellipse(mx - 5 * ps * f, my, 6 * ps * f + 1, 4 * ps, -0.4, 0, TAU); c.ellipse(mx + 5 * ps * f, my, 6 * ps * f + 1, 4 * ps, 0.4, 0, TAU); c.fill(); c.fillStyle = "#6a5a4a"; c.fillRect(mx - 1, my - 3 * ps, 2, 7 * ps); }
      if (t > 1.1 && t < 3.4) { c.save(); c.globalAlpha = clamp((t - 1.1) / 0.3) * clamp((3.4 - t) / 0.4); c.fillStyle = "#fff"; c.strokeStyle = "#14141a"; c.lineWidth = 2; const bx = px + 70 * ps, by = gy - 150 * ps; c.beginPath(); c.roundRect ? c.roundRect(bx - 52 * ps, by - 18 * ps, 104 * ps, 36 * ps, 12 * ps) : c.rect(bx - 52 * ps, by - 18 * ps, 104 * ps, 36 * ps); c.fill(); c.stroke(); c.beginPath(); c.moveTo(bx - 30 * ps, by + 18 * ps); c.lineTo(bx - 44 * ps, by + 34 * ps); c.lineTo(bx - 18 * ps, by + 18 * ps); c.fill(); c.fillStyle = "#14141a"; c.font = `800 ${15 * ps}px Inter, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("…it's empty!", bx, by); c.restore(); }
      // clover, mushrooms, a few stones
      S.clov.forEach((q) => { const x = q.x * W, y = q.y * H; c.fillStyle = "#2f8a3a"; for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU - 1.57; c.beginPath(); c.arc(x + Math.cos(a) * 4 * q.s * s0, y + Math.sin(a) * 4 * q.s * s0, 4 * q.s * s0, 0, TAU); c.fill(); } });
      S.mush.forEach((u) => { const x = u * W, y = gy + 26 * s0; c.fillStyle = "#f5efe6"; c.fillRect(x - 4 * s0, y - 16 * s0, 8 * s0, 16 * s0); c.fillStyle = "#e0303a"; c.beginPath(); c.arc(x, y - 16 * s0, 14 * s0, Math.PI, TAU); c.fill(); c.fillStyle = "#fff"; c.beginPath(); c.arc(x - 5 * s0, y - 22 * s0, 2.5 * s0, 0, TAU); c.arc(x + 6 * s0, y - 20 * s0, 2 * s0, 0, TAU); c.fill(); });
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

  // ---------------------------------------------------------------- 4. into the hair, then the brain
  const brain = {
    D: 8.4, facts: ["call"], cy: () => H * 0.5,
    init(S) {
      S.curls = Array.from({ length: 140 }, () => ({ x: rnd(-1.2, 1.2), y: rnd(-1.2, 1.2), r: rnd(0.03, 0.08), c: ["#ff7a1a", "#ff9a3b", "#e05a0a", "#ffb35a"][Math.floor(rnd(0, 4))], a: rnd(0, TAU) }));
      const bw = Math.min(W * 0.42, H * 0.62) * (phone ? 1.6 : 1), cx = W / 2, cy = H * 0.5;
      S.bw = bw; S.N = []; while (S.N.length < (phone ? 50 : 85)) { const x = rnd(-1, 1), y = rnd(-1, 1); if (x * x / 1 + (y * y) / 0.55 < 0.95) S.N.push({ x: cx + x * bw, y: cy + y * bw * 0.72, ph: rnd(0, 6) }); }
      S.E = []; S.N.forEach((a, i) => S.N.forEach((b, j) => { if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < bw * 0.33) S.E.push([a, b, rnd(0, 1), rnd(0.6, 1.4)]); }));
    },
    draw(c, t, S) {
      if (t < 2) { // zooming into bright ginger curls
        const z = 0.45 * Math.exp(t * 1.35);
        sky(c, ["#ff8a2a", "#e0600a"], 0, H);
        S.curls.forEach((q) => { c.strokeStyle = q.c; c.lineWidth = Math.max(1.5, 4 * z * s0); c.beginPath(); const x = W / 2 + q.x * W * z, y = H / 2 + q.y * H * z, r = q.r * Math.min(W, H) * z; for (let a = 0; a < TAU * 1.6; a += 0.2) { const rr = r * (1 - a / (TAU * 2.2)); c.lineTo(x + Math.cos(a + q.a) * rr, y + Math.sin(a + q.a) * rr); } c.stroke(); });
        c.fillStyle = `rgba(30,8,40,${clamp((t - 1.3) / 0.7)})`; c.fillRect(0, 0, W, H); return;
      }
      sky(c, ["#160822", "#240a34", "#12061a"]);
      // the brain: a soft pink shape with folds
      const cx = W / 2, cy = H * 0.5, bw = S.bw;
      c.save(); c.beginPath(); c.ellipse(cx, cy, bw, bw * 0.72, 0, 0, TAU); c.clip();
      const g = c.createRadialGradient(cx - bw * 0.3, cy - bw * 0.3, 0, cx, cy, bw); g.addColorStop(0, "rgba(255,150,200,.45)"); g.addColorStop(1, "rgba(150,40,110,.25)"); c.fillStyle = g; c.fillRect(cx - bw, cy - bw, bw * 2, bw * 2);
      c.strokeStyle = "rgba(255,170,220,.25)"; c.lineWidth = 3; for (let i = 0; i < 16; i++) { c.beginPath(); const y = cy - bw * 0.7 + i * bw * 0.1; for (let x = cx - bw; x <= cx + bw; x += 10) c.lineTo(x, y + Math.sin(x * 0.05 + i * 1.7) * 10 + Math.sin(x * 0.013 + i) * 14); c.stroke(); }
      c.restore();
      c.strokeStyle = "rgba(255,170,220,.6)"; c.lineWidth = 3; c.beginPath(); c.ellipse(cx, cy, bw, bw * 0.72, 0, 0, TAU); c.stroke();
      // neurons firing: signals race along the links
      c.lineWidth = 1.2; S.E.forEach(([a, b, o, v]) => { c.strokeStyle = "rgba(255,120,200,.16)"; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); const k = (t * 0.9 * v + o) % 1; glow(c, lerp(a.x, b.x, k), lerp(a.y, b.y, k), 7, "rgba(255,220,255,.95)"); });
      S.N.forEach((n) => { const f = 0.5 + 0.5 * Math.sin(t * 7 + n.ph); glow(c, n.x, n.y, 8 + 10 * f, `rgba(255,${120 + f * 100},230,.85)`); });
      if (t > 7.3) { const k = clamp((t - 7.3) / 1); glow(c, W / 2, H / 2, k * Math.hypot(W, H), `rgba(255,255,255,${k})`); }
    },
    // sparks jump from neuron to neuron and settle into the letters
    text: { mode: "dots", at: 2.9, spread: 1.4, dur: 0.55, crisp: 0.9, glow: "rgba(255,90,220,1)", color: "#ffd2f4", ink: ["#ff9ae8", "#ff4fd8", "#b44dff"], from(p, S) { const n = S.N[Math.floor(p.r * S.N.length)]; return [n.x, n.y]; } },
    sound(e) { e.whoosh(0, 2, 0.12); e.tone(110, 2, 6, 0.04); for (let i = 0; i < 16; i++) e.chime(rnd(700, 1600), 2.4 + i * 0.22, 0.02); e.whoosh(7, 1.4, 0.2); },
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

  return [umbrella, rainbow, pot, brain, iss, align];
});
