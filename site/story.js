// Weather stories: after each weather intro, a run of short scenes, each one revealing one key fact
// about today's market. The weather (or the scene) builds the fact's words.
// Disaster scenes show buildings, objects and landscapes only (never people being hurt), and the
// facts beside them are worded plainly. The blimp is generic: no brands.
(() => {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const easeIO = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const lerp = (a, b, k) => a + (b - a) * k;
  const TAU = Math.PI * 2;
  let W = 0, H = 0;
  const E = () => window.WXE; // engine helpers from intro.js (sound, walker)

  // ------------------------------------------------------------------ today's facts
  let SHELTER = null;
  fetch("data/scenarios.json").then((r) => r.json()).then((d) => {
    const best = {};
    Object.values(d.ratings || {}).forEach((ev) => Object.entries(ev).forEach(([t, r]) => { best[t] = best[t] || { w: 0, n: 0 }; best[t].w += Math.round(r.hit * r.n); best[t].n += r.n; }));
    const top = Object.entries(best).filter(([t]) => t !== "BIL").sort((a, b) => b[1].w / b[1].n - a[1].w / a[1].n)[0];
    if (top) SHELTER = { name: d.shelters[top[0]].name, icon: d.shelters[top[0]].icon, w: top[1].w, n: top[1].n };
  }).catch(() => {});

  // app.js keeps its data in top-level `let`s, which are global but not on window
  const G = (n) => { try { return (0, eval)(n); } catch (e) { return undefined; } };
  const pc = (x, d = 1) => `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(d)}%`;
  function facts() {
    const F = {}, st = G("STOCKS") || [], spy = window.SPY || {};
    if (!st.length) return F;
    const up = st.filter((s) => s.chg_1d > 0).length;
    F.market = { icon: spy.chg_1d >= 0 ? "📈" : "📉", k: "The market today", big: `Market ${pc(spy.chg_1d ?? 0, 2)}`, sub: `${up} of ${st.length} big US stocks rose today.` };
    const srt = [...st].sort((a, b) => b.chg_1d - a.chg_1d), b = srt[0], w = srt.at(-1);
    F.best = { icon: "🏆", k: "Best day", big: `${b.ticker} ${pc(b.chg_1d)}`, sub: `${b.name} had the best day of the S&P 100.` };
    F.worst = { icon: "🧯", k: "Toughest day", big: `${w.ticker} ${pc(w.chg_1d)}`, sub: `${w.name} had the worst day of the S&P 100.` };
    const sh = (window.SH?.shocks || []).slice().sort((a, b) => (b.severity || 0) - (a.severity || 0))[0];
    if (sh) F.shock = { icon: "⚡", k: "Biggest surprise", big: `${sh.ticker} ${pc(sh.ret)}`, sub: `A ${sh.kind.toLowerCase()} on ${sh.date}${sh.explained ? ", with news behind it." : ", and nothing in the news explains it."}` };
    const r = (window.RADAR_NOW || []).find((x) => x.lv <= 1);
    if (r) F.warning = { icon: r.lv ? "🌧️" : "⛈️", k: r.lv ? "Amber storm warning" : "Red storm warning", big: `${r.s.ticker} on alert`, sub: `${r.why[0]?.t || "Several warning signs at once"}.` };
    const buy = (G("INS")?.form4 || []).filter((x) => x.type === "Buy").sort((a, b) => b.value - a.value)[0];
    const role = (x) => ({ Dir: "A director", CEO: "The CEO", CFO: "The CFO", COO: "The COO", Pres: "The president", "10%": "A big shareholder" }[x] || "An insider");
    if (buy) F.insider = { icon: "🕵️", k: "Biggest insider buy", big: `${G("money") ? G("money")(buy.value) : "$" + Math.round(buy.value).toLocaleString()} of ${buy.ticker}`, sub: `${role(buy.role)} bought with their own money on ${buy.date}.` };
    const call = G("CALLS")?.calls?.[0];
    if (call) F.call = { icon: "🧠", k: "Highest smart score", big: `${call.ticker} ${call.score > 0 ? "+" : ""}${call.score}`, sub: `${(call.reasons.find((x) => x.pts)?.text || "Several signals line up")}.`.replace(/^./, (c) => c.toUpperCase()) };
    const e = G("WORLD")?.ev?.events?.[0];
    if (e) F.world = { icon: "🌍", k: "In the world", big: e.tickers.slice(0, 3).join(" · "), sub: `${window.plainEvent ? plainEvent(e) : e.title}. These stocks are often sensitive to it.` };
    const busy = [...st].sort((a, b) => b.vol_ratio - a.vol_ratio)[0];
    F.busiest = { icon: "🔊", k: "Busiest trading", big: `${busy.ticker} ${busy.vol_ratio.toFixed(1)}×`, sub: `${busy.name} traded ${busy.vol_ratio.toFixed(1)} times its normal volume.` };
    if (SHELTER) F.shelter = { icon: SHELTER.icon, k: "Where money hid in past storms", big: SHELTER.name, sub: `It beat the market in ${SHELTER.w} of ${SHELTER.n} past storms. See Storm plan.` };
    const wl = (window.WATCH?.list() || []).map((t) => st.find((s) => s.ticker === t)).filter(Boolean);
    if (wl.length) { const avg = wl.reduce((s, x) => s + x.chg_1d, 0) / wl.length; F.watch = { icon: "⭐", k: "Your watchlist", big: `${wl.length} stocks ${pc(avg)}`, sub: "The average move of the stocks you follow today." }; }
    return F;
  }
  function assign(chapters) {
    const F = facts(), used = new Set(), order = ["market", "best", "worst", "shock", "warning", "insider", "call", "busiest", "shelter", "world", "watch"];
    return chapters.map((ch) => {
      // world events (often conflicts) are left out of the stories: they do not belong in a playful show
      const k = (ch.facts || []).find((x) => F[x] && !used.has(x)) || order.find((x) => F[x] && !used.has(x) && x !== "world");
      if (k) used.add(k);
      return F[k] || { icon: "✨", k: "Whistle Street", big: "Stay curious", sub: "Tap any dotted word on the site to learn what it means." };
    });
  }

  // ------------------------------------------------------------------ the fact's words, built from particles
  function factLayout(f, cy) {
    let s1 = clamp(W * 0.085, 30, 82);
    const m = document.createElement("canvas").getContext("2d");
    m.font = `italic 900 ${s1}px 'Playfair Display', Georgia, serif`;
    const w = m.measureText(f.big).width; if (w > W * 0.88) s1 *= (W * 0.88) / w;
    const font = `italic 900 ${s1}px 'Playfair Display', Georgia, serif`;
    const off = document.createElement("canvas"); off.width = W; off.height = H; const c = off.getContext("2d");
    c.font = font; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#fff"; c.fillText(f.big, W / 2, cy);
    const d = c.getImageData(0, Math.max(0, cy - s1), W, Math.min(H, s1 * 2)).data, y0 = Math.max(0, cy - s1), rows = Math.min(H, s1 * 2);
    let gap = W < 600 ? 3 : 4, pts;
    for (;;) {
      pts = [];
      for (let y = 0; y < rows; y += gap) for (let x = 0; x < W; x += gap) if (d[(y * W + x) * 4 + 3] > 120) pts.push({ tx: x, ty: y + y0 });
      if (pts.length <= (W < 700 ? 900 : 1500)) break; gap++;
    }
    const xs = pts.map((p) => p.tx); const x0 = Math.min(...xs), xr = Math.max(1, Math.max(...xs) - x0);
    pts.forEach((p) => { p.u = (p.tx - x0) / xr; p.r = Math.random(); });
    return { f, cy, s1, font, pts, gap, x0, xr, width: Math.min(W * 0.94, Math.max(xr + s1, W < 600 ? W * 0.92 : W * 0.6)) };
  }
  // ch.text: { at, dur, from(p, S, t), delay(p), color, dot } ; returns nothing, draws particles + crisp fact + plate
  function drawFact(c, t, L, ch, S) {
    const T = ch.text || {}, at = T.at ?? 1.2, dur = T.dur ?? 0.9, spread = T.spread ?? 1.0;
    const delay = T.delay || ((p) => p.r * spread);
    const land = at + spread + dur, fin = clamp((t - land - 0.1) / 0.6);
    // plate first, so the words sit on it and stay readable on busy scenes
    const pa = clamp((t - at - 0.2) / 0.8) * (T.plate ?? 0.72);
    if (pa > 0) {
      const pw = L.width, ph = L.s1 * 2.5 + 30, px = W / 2 - pw / 2, py = L.cy - L.s1 * 1.05 - 26;
      c.save(); c.globalAlpha = pa; c.fillStyle = "rgba(8,6,20,.9)"; c.strokeStyle = "rgba(107,92,255,.6)"; c.lineWidth = 1.5;
      c.beginPath(); c.roundRect ? c.roundRect(px, py, pw, ph, 18) : c.rect(px, py, pw, ph); c.fill(); c.stroke(); c.restore();
    }
    const g = Math.max(2.2, L.gap * 0.8), p1 = new Path2D(), p2 = new Path2D();
    for (const p of L.pts) {
      const k = (t - at - delay(p)) / dur; if (k < 0) continue;
      let x = p.tx, y = p.ty;
      if (k < 1) { const [fx, fy] = T.from ? T.from(p, S, t) : [p.tx + rnd(-200, 200), -20]; const e = (T.ease || ease)(k); x = lerp(fx, p.tx, e); y = lerp(fy, p.ty, e); if (T.wobble) { x += Math.sin(t * 6 + p.r * 20) * T.wobble * (1 - e); y += Math.cos(t * 5 + p.r * 17) * T.wobble * (1 - e); } }
      (k < 1 ? p1 : p2).rect(x - g / 2, y - g / 2, g, g);
    }
    c.save(); c.globalAlpha = 1 - fin * 0.85;
    c.fillStyle = T.color2 || T.color || "#fff"; c.fill(p1);
    c.fillStyle = T.color || "#fff"; c.shadowColor = T.glow || "rgba(107,92,255,.9)"; c.shadowBlur = 8; c.fill(p2); c.restore();
    // crisp words, the kicker above and the plain sentence below
    c.save(); c.textAlign = "center"; c.textBaseline = "middle";
    if (fin > 0) { c.globalAlpha = fin; c.font = L.font; const m = c.measureText(L.f.big).width, gr = c.createLinearGradient(W / 2 - m / 2, 0, W / 2 + m / 2, 0); (T.ink || ["#2ef2ff", "#6b5cff", "#b44dff"]).forEach((x, i, a) => gr.addColorStop(i / (a.length - 1), x)); c.fillStyle = gr; c.shadowColor = "rgba(107,92,255,.8)"; c.shadowBlur = 18; c.fillText(L.f.big, W / 2, L.cy); }
    const ka = clamp((t - at - 0.3) / 0.6);
    c.shadowBlur = 0; c.globalAlpha = ka; c.font = `800 ${Math.max(11, L.s1 * 0.2)}px Inter, sans-serif`; c.fillStyle = "#2ef2ff";
    c.fillText(`${L.f.icon}  ${L.f.k.toUpperCase().split("").join(String.fromCharCode(8202))}`, W / 2, L.cy - L.s1 * 0.85);
    c.globalAlpha = fin; c.fillStyle = "#f1eeff"; c.font = `500 ${clamp(L.s1 * 0.24, 13, 19)}px Inter, sans-serif`;
    wrap(c, L.f.sub, W / 2, L.cy + L.s1 * 0.85, Math.min(W * 0.86, 640), clamp(L.s1 * 0.3, 16, 24));
    c.restore();
  }
  function wrap(c, s, x, y, max, lh) {
    const words = s.split(" "), out = []; let line = "";
    words.forEach((w) => { const tt = line ? line + " " + w : w; if (c.measureText(tt).width > max && line) { out.push(line); line = w; } else line = tt; });
    out.push(line); out.slice(0, 3).forEach((l, i) => c.fillText(l, x, y + i * lh));
  }

  // ------------------------------------------------------------------ drawing helpers
  function sky(c, stops, y0 = 0, y1 = H) { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); c.fillStyle = g; c.fillRect(-W, y0, W * 3, y1 - y0); }
  function glow(c, x, y, r, col) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  function stars(S, n, top = 0.8) { return Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H * top, r: rnd(0.4, 1.5), ph: rnd(0, 6) })); }
  function drawStars(c, arr, t, a = 1) { arr.forEach((s) => { c.fillStyle = `rgba(255,255,255,${a * (0.45 + 0.4 * Math.sin(t * 2 + s.ph))})`; c.fillRect(s.x, s.y, s.r * 1.4, s.r * 1.4); }); }
  function city(n, hMin, hMax, seed = 1) { // a skyline: buildings with window grids
    let x = -20; const out = [];
    while (x < W + 20) { const w = rnd(40, 90) * (W < 600 ? 0.6 : 1), h = rnd(hMin, hMax) * H; out.push({ x, w, h, win: Array.from({ length: Math.floor(h / 16) * Math.floor(w / 14) }, () => Math.random()) }); x += w + rnd(2, 10); }
    return out;
  }
  function drawCity(c, B, gy, col, lit, t, opt = {}) {
    B.forEach((b, i) => {
      c.save();
      const tilt = opt.tilt ? opt.tilt(b, i) : 0, drop = opt.drop ? opt.drop(b, i) : 0;
      c.translate(b.x + (tilt > 0 ? b.w : 0), gy + drop); c.rotate(tilt);
      const bx = tilt > 0 ? -b.w : 0;
      c.fillStyle = col; c.fillRect(bx, -b.h, b.w, b.h);
      if (lit) {
        const cols = Math.floor(b.w / 14), rows = Math.floor(b.h / 16);
        for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
          const v = b.win[r * cols + k]; const on = lit(b, i, k, r, v); if (!on) continue;
          c.fillStyle = on === true ? "rgba(255,214,120,.85)" : on; c.fillRect(bx + 5 + k * 14, -b.h + 6 + r * 16, 7, 9);
        }
      }
      c.restore();
    });
  }
  function boltPath(x0, y0, x1, y1) {
    let p = [[x0, y0], [x1, y1]];
    for (let i = 0; i < 5; i++) { const n = [p[0]]; for (let j = 1; j < p.length; j++) { const [ax, ay] = p[j - 1], [bx, by] = p[j], l = Math.hypot(bx - ax, by - ay), o = rnd(-0.25, 0.25) * l; n.push([(ax + bx) / 2 + (o * (by - ay)) / l, (ay + by) / 2 - (o * (bx - ax)) / l], [bx, by]); } p = n; }
    const P = new Path2D(); P.moveTo(...p[0]); p.forEach((q) => P.lineTo(...q)); return P;
  }
  const snd = (fn) => { const e = E(); if (e?.soundOn()) try { fn(e); } catch (x) {} };

  // ================================================================== HURRICANE story
  const tornado = {
    D: 6.5, facts: ["market"], calm: false,
    init(S) { S.deb = Array.from({ length: 70 }, () => ({ h: Math.random(), a: rnd(0, TAU), v: rnd(2, 5), s: rnd(2, 6) })); },
    tx: (t) => lerp(-0.15, 0.62, easeIO(t / 3.2)) * W,
    draw(c, t, S) {
      sky(c, ["#2a3a32", "#4a5a4a", "#7a8a6a"], 0, H * 0.72); sky(c, ["#3b4a2c", "#25301c"], H * 0.72, H);
      for (let i = 0; i < 6; i++) glow(c, (i / 5) * W, H * 0.08, W * 0.3, "rgba(20,26,22,.5)");
      const x0 = this.tx(t), gy = H * 0.74, top = H * 0.05;
      for (let k = 0; k <= 40; k++) { // the funnel
        const f = k / 40, y = lerp(gy, top, f), w = lerp(8, W * 0.22, Math.pow(f, 1.6)), x = x0 + Math.sin(t * 3 + f * 5) * 18 * f + Math.sin(t * 7 + f * 11) * 6;
        c.fillStyle = `rgba(${lerp(120, 70, f)},${lerp(118, 80, f)},${lerp(110, 80, f)},${0.55 - f * 0.2})`;
        c.beginPath(); c.ellipse(x, y, w, w * 0.18 + 4, 0, 0, TAU); c.fill();
        if (k % 4 === 0) { c.strokeStyle = "rgba(220,220,210,.18)"; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, w * 0.9, w * 0.14 + 3, 0, t * 4 + k, t * 4 + k + 2.2); c.stroke(); }
      }
      glow(c, x0, gy, 80, "rgba(140,120,90,.5)");
      c.fillStyle = "#3a2a1a"; S.deb.forEach((d) => { const f = d.h, a = d.a + t * d.v, w = lerp(20, W * 0.2, f); c.fillRect(x0 + Math.cos(a) * w, lerp(gy, top, f) + Math.sin(a) * w * 0.18, d.s, d.s * 0.6); });
      snd(() => {});
    },
    text: { at: 2.2, spread: 0.9, dur: 1.1, wobble: 30, color: "#f4efe0", from(p, S, t) { const x0 = tornado.tx(Math.min(t, 3)), f = p.r, a = p.r * 40 + t * 5, w = lerp(20, W * 0.2, f); return [x0 + Math.cos(a) * w, lerp(H * 0.74, H * 0.05, f)]; } },
    sound(e, S) { const w = e.noise("bandpass", 380, 1.4, 0, 8); e.env(w.g, [[0, 0.1], [1.5, 0.5], [5, 0.35], [6.5, 0]]); e.env(w.f, [[0, 300], [2, 600], [5, 450]]); },
  };
  const quake = {
    D: 6.5, facts: ["worst"], calm: false,
    init(S) { S.B = city(0, 0.22, 0.52); S.fall = S.B.map(() => (Math.random() < 0.35 ? rnd(1.2, 2.6) : null)); S.dust = []; },
    draw(c, t, S) {
      const sh = t < 3.4 ? Math.sin(t * 60) * 6 * clamp(t / 0.5) * (1 - clamp((t - 2.8) / 0.6)) : 0;
      c.save(); c.translate(sh, Math.cos(t * 47) * sh * 0.4);
      sky(c, ["#1a1530", "#3a2a40", "#6a4048"], -20, H * 0.8);
      const gy = H * 0.8;
      drawCity(c, S.B, gy, "#2a2140", (b, i, k, r, v) => v > 0.55 && (!S.fall[i] || t < S.fall[i]), t, {
        tilt: (b, i) => (S.fall[i] && t > S.fall[i] ? (i % 2 ? 1 : -1) * Math.min(1.45, Math.pow((t - S.fall[i]) * 1.6, 2)) : 0),
      });
      sky(c, ["#3a3040", "#1f1a28"], gy, H + 20);
      c.strokeStyle = "#0a0810"; c.lineWidth = 4; c.beginPath(); let x = 0, y = gy + 20; c.moveTo(x, y); while (x < W) { x += rnd(20, 50); y = gy + 20 + rnd(-10, 25) * clamp(t - 0.6); c.lineTo(x, y); } c.stroke();
      S.B.forEach((b, i) => { const f = S.fall[i]; if (f && t > f + 0.5 && t < f + 3) { const a = (t - f - 0.5) / 2.5; glow(c, b.x + b.w / 2, gy - 20, 60 + a * 120, `rgba(160,140,130,${0.5 * (1 - a)})`); } });
      c.restore();
    },
    text: { at: 3.0, spread: 0.6, dur: 0.8, color: "#ffd2a8", ease: (k) => { const b = ease(k); return b + Math.sin(k * Math.PI) * 0.08; }, from: (p) => [p.tx, -40 - p.r * 200] },
    sound(e) { e.rumble(0.1, 3.4, 1); [1.4, 2, 2.6].forEach((a) => e.crack(a, 0.25)); },
  };
  const sinkhole = {
    D: 6.5, facts: ["shock"], calm: false,
    init(S) { S.B = city(0, 0.12, 0.3); S.hx = W * 0.5; S.hy = H * 0.78; },
    draw(c, t, S) {
      sky(c, ["#16203a", "#2a3354", "#3d4566"], 0, H * 0.62);
      drawCity(c, S.B, H * 0.62, "#1b1f33", (b, i, k, r, v) => v > 0.7, t);
      sky(c, ["#4a4a55", "#33333d"], H * 0.62, H + 10);
      c.strokeStyle = "rgba(255,220,120,.6)"; c.setLineDash([24, 18]); c.lineWidth = 4; c.beginPath(); c.moveTo(0, H * 0.84); c.lineTo(W, H * 0.84); c.stroke(); c.setLineDash([]);
      const r = ease((t - 0.6) / 2.2) * Math.min(W * 0.32, 260);
      // things near the edge tip in: a lamp post and a bench
      const lamp = Math.min(1.5, Math.max(0, (t - 1.8) * 1.4));
      c.save(); c.translate(S.hx + r * 0.75, S.hy - 10 + lamp * 30); c.rotate(-lamp); c.strokeStyle = "#7a7a8a"; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -110); c.lineTo(18, -118); c.stroke(); glow(c, 18, -112, 30, `rgba(255,220,140,${0.8 * (1 - lamp / 1.5)})`); c.restore();
      if (r > 2) {
        const g = c.createRadialGradient(S.hx, S.hy, 0, S.hx, S.hy, r); g.addColorStop(0, "#000"); g.addColorStop(0.75, "#0d0a12"); g.addColorStop(1, "#3a2c22");
        c.fillStyle = g; c.beginPath(); for (let a = 0; a <= TAU + 0.01; a += 0.2) { const rr = r * (1 + Math.sin(a * 5 + 1) * 0.06); c.lineTo(S.hx + Math.cos(a) * rr, S.hy + Math.sin(a) * rr * 0.35); } c.fill();
        c.fillStyle = "#5a4a3a"; for (let i = 0; i < 18; i++) { const a = rnd(0, TAU), q = (t * 2 + i * 0.37) % 1; c.fillRect(S.hx + Math.cos(a) * r * (1 - q), S.hy + Math.sin(a) * r * 0.35 * (1 - q) + q * 10, 3, 3); }
      }
    },
    text: { at: 2.6, spread: 0.9, dur: 1, color: "#ffd98a", from: (p) => [sinkholeX() + rnd(-40, 40), H * 0.78] },
    sound(e) { e.rumble(0.4, 2.8, 0.8); },
  };
  const sinkholeX = () => W * 0.5;
  const recede = {
    D: 6.5, facts: ["warning"], calm: false,
    init(S) { S.shells = Array.from({ length: 24 }, () => ({ x: Math.random() * W, y: rnd(0.45, 0.95) * H, c: ["#fff1e0", "#ffc7a8", "#e8d9ff"][Math.floor(rnd(0, 3))] })); S.fish = Array.from({ length: 5 }, () => ({ x: rnd(0.1, 0.9) * W, y: rnd(0.4, 0.62) * H, ph: rnd(0, 6) })); },
    edge: (t) => lerp(H * 0.62, H * 0.27, easeIO((t - 0.4) / 3.2)),
    draw(c, t, S) {
      sky(c, ["#ffb380", "#ffd6a0", "#ffe9c2"], 0, H * 0.25);
      const sea = this.edge(t);
      sky(c, ["#e8c58e", "#d9ae6e"], H * 0.25, H);
      c.fillStyle = "rgba(120,90,50,.25)"; c.fillRect(0, sea, W, H * 0.62 - sea + 30);
      S.shells.forEach((s) => { if (s.y > sea) { c.fillStyle = s.c; c.beginPath(); c.ellipse(s.x, s.y, 5, 3.5, 0.4, 0, TAU); c.fill(); } });
      S.fish.forEach((f) => { if (f.y > sea + 10) { c.save(); c.translate(f.x, f.y); c.rotate(Math.sin(t * 9 + f.ph) * 0.4); c.fillStyle = "#8ad1ff"; c.beginPath(); c.ellipse(0, 0, 10, 5, 0, 0, TAU); c.moveTo(-8, 0); c.lineTo(-16, -6); c.lineTo(-16, 6); c.fill(); c.restore(); } });
      const g = c.createLinearGradient(0, H * 0.25, 0, sea); g.addColorStop(0, "#1a6fb0"); g.addColorStop(1, "#3fb6d9"); c.fillStyle = g;
      c.beginPath(); c.moveTo(0, H * 0.25); for (let x = 0; x <= W + 20; x += 20) c.lineTo(x, sea + Math.sin(x * 0.02 + t * 2) * 6); c.lineTo(W, H * 0.25); c.fill();
      c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= W + 20; x += 20) c[x ? "lineTo" : "moveTo"](x, sea + Math.sin(x * 0.02 + t * 2) * 6); c.stroke();
    },
    text: { at: 2.3, spread: 1.2, dur: 0.6, color: "#6e4c22", glow: "rgba(255,240,200,.5)", delay: (p) => p.r * 0.3 + (1 - p.ty / H) * 0.9, from: (p) => [p.tx, p.ty + 30], ink: ["#fff3c4", "#ffd36b", "#ff9d2e"], plate: 0.75 },
    sound(e) { const n = e.noise("lowpass", 600, 0.6, 0, 8); e.env(n.g, [[0, 0.3], [3.5, 0.05], [6, 0]]); },
  };
  const tsunami = {
    D: 7.5, facts: ["shelter", "busiest"], calm: false,
    // the far-off sea rises into one huge wave, rolls in over the empty beach and breaks into foam;
    // the words come out of the foam as the water settles
    init(S) { S.foam = Array.from({ length: 160 }, () => ({ x: rnd(-0.1, 1.1), y: rnd(0, 1), r: rnd(10, 46), v: rnd(0.6, 1.4) })); },
    draw(c, t, S) {
      const hz = H * 0.42, dark = clamp(t / 2);
      sky(c, [`rgb(${lerp(150, 70, dark)},${lerp(180, 90, dark)},${lerp(205, 120, dark)})`, "#c9d6de"], 0, hz);
      sky(c, ["#e6cf9c", "#d2b27a"], hz, H);
      c.fillStyle = "rgba(255,255,255,.5)"; for (let i = 0; i < 18; i++) { c.beginPath(); c.arc((i * 97) % W, hz + 30 + ((i * 53) % (H - hz - 40)), 2.5, 0, TAU); c.fill(); }
      // the wave: base comes towards us, height grows, a curling lip on top
      const k = easeIO(t / 2.6), base = lerp(hz + 4, H * 1.05, k), hgt = lerp(8, H * 0.8, Math.pow(clamp(t / 2.6), 1.3));
      const top = base - hgt;
      if (t < 3.2) {
        const g = c.createLinearGradient(0, top, 0, base); g.addColorStop(0, "#0f3f66"); g.addColorStop(0.5, "#1c6a9a"); g.addColorStop(1, "#3c9cc4");
        c.fillStyle = g; c.beginPath(); c.moveTo(-20, base);
        for (let x = -20; x <= W + 20; x += 16) c.lineTo(x, top + Math.sin(x * 0.012 + t * 3) * hgt * 0.06 + Math.sin(x * 0.031 - t * 2) * hgt * 0.025);
        c.lineTo(W + 20, base); c.fill();
        // curling white lip
        c.strokeStyle = "rgba(255,255,255,.9)"; c.lineWidth = Math.max(3, hgt * 0.05); c.beginPath();
        for (let x = -20; x <= W + 20; x += 16) { const y = top + Math.sin(x * 0.012 + t * 3) * hgt * 0.06 + Math.sin(x * 0.031 - t * 2) * hgt * 0.025; x < 0 ? c.moveTo(x, y) : c.lineTo(x, y); }
        c.stroke();
        c.fillStyle = "rgba(255,255,255,.75)";
        for (let i = 0; i < 60; i++) { const x = (i / 60) * W + Math.sin(t * 4 + i) * 10, y = top + Math.sin(x * 0.012 + t * 3) * hgt * 0.06 - rnd(0, hgt * 0.08); c.beginPath(); c.arc(x, y, rnd(2, 4 + hgt * 0.015), 0, TAU); c.fill(); }
        // streaks of spray on the face
        c.strokeStyle = "rgba(255,255,255,.25)"; c.lineWidth = 2; for (let i = 0; i < 14; i++) { const x = (i * 131 + t * 40) % W; c.beginPath(); c.moveTo(x, top + hgt * 0.2); c.lineTo(x - 20, top + hgt * 0.8); c.stroke(); }
      }
      // the crash: foam bursts across the screen, then settles into calm shallow water
      if (t > 2.3) {
        const b = clamp((t - 2.3) / 0.9), settle = clamp((t - 3.4) / 2.2);
        c.fillStyle = `rgba(40,120,160,${clamp((t - 2.6) / 0.6)})`; c.fillRect(0, 0, W, H);
        sky(c, ["#4a6c88", "#7fa6bf"], 0, H * 0.35); c.globalAlpha = 1;
        c.fillStyle = "#2a7aa4"; c.beginPath(); c.moveTo(0, H); c.lineTo(0, H * 0.35); for (let x = 0; x <= W; x += 20) c.lineTo(x, H * 0.35 + Math.sin(x * 0.02 + t * 2) * 5 * (1 - settle * 0.6)); c.lineTo(W, H); c.fill();
        S.foam.forEach((f) => {
          const r = f.r * (W < 600 ? 0.6 : 1) * (0.4 + b) * (1 - settle * 0.85), y = lerp(H * 1.1, f.y * H, ease(b * f.v)) - settle * 30 * f.v;
          if (r < 1) return; c.fillStyle = `rgba(255,255,255,${0.9 * (1 - settle * 0.8)})`; c.beginPath(); c.arc(f.x * W, y, r, 0, TAU); c.fill();
        });
        c.strokeStyle = `rgba(255,255,255,${0.35 * settle})`; c.lineWidth = 2; for (let i = 0; i < 10; i++) { const y = H * 0.42 + i * (H * 0.055); c.beginPath(); for (let x = 0; x <= W; x += 20) { const yy = y + Math.sin(x * 0.015 + t * 1.5 + i) * 4; x ? c.lineTo(x, yy) : c.moveTo(x, yy); } c.stroke(); }
      }
    },
    text: { at: 2.9, spread: 1.4, dur: 0.8, color: "#ffffff", color2: "#dff6ff", glow: "rgba(46,242,255,.9)", delay: (p) => p.r * 1.4, from: (p) => [p.tx + (p.r - 0.5) * 300, H + 20], ink: ["#ffffff", "#9fefff", "#2ef2ff"] },
    sound(e) { const n = e.noise("lowpass", 300, 0.7, 0, 9); e.env(n.g, [[0.2, 0.05], [2.3, 0.9], [2.8, 1.1], [4, 0.4], [7, 0]]); const h = e.noise("highpass", 1800, 0.5, 2.3, 3); e.env(h.g, [[2.3, 0], [2.5, 0.35], [4.5, 0]]); },
  };

  // ================================================================== THUNDERSTORM story
  const tree = {
    D: 6.5, facts: ["market"], calm: false,
    init(S) { S.bolt = null; S.leaves = Array.from({ length: 40 }, () => ({ a: rnd(0, TAU), r: rnd(0, 1), v: rnd(0.5, 1.5) })); },
    draw(c, t, S) {
      const hit = 1.4, fl = t > hit && t < hit + 0.35 ? 1 - (t - hit) / 0.35 : 0;
      sky(c, ["#0b0a1c", "#1b1838", "#2a2440"], 0, H * 0.75); sky(c, ["#1f2a1c", "#121a10"], H * 0.75, H);
      const tx = W * (W < 600 ? 0.3 : 0.62), gy = H * 0.76, th = Math.min(H * 0.42, 300);
      const ft = t - hit - 0.3, fall = ft <= 0 ? 0 : ft < 1.05 ? 1.32 * Math.pow(ft / 1.05, 2) : 1.32 - Math.sin(clamp((ft - 1.05) / 0.4) * Math.PI) * 0.08;
      const sh = th * 0.2;
      c.fillStyle = "#5a3b22"; c.fillRect(tx - 12, gy - sh, 24, sh);
      c.save(); c.translate(tx, gy - sh); c.rotate(fall);
      c.fillStyle = "#5a3b22"; c.beginPath(); c.moveTo(-11, 0); c.lineTo(-8, -th * 0.65); c.lineTo(8, -th * 0.65); c.lineTo(11, 0); c.fill();
      c.translate(0, -th * 0.25); c.fillStyle = "#2f5a30"; [[0, -th * 0.55, th * 0.3], [-th * 0.2, -th * 0.42, th * 0.22], [th * 0.2, -th * 0.45, th * 0.24], [0, -th * 0.75, th * 0.22]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); });
      c.restore();
      if (t > hit && t < hit + 2.5) { const k = (t - hit) / 2.5; glow(c, tx, gy - sh, 60, `rgba(255,140,60,${0.7 * (1 - k)})`); c.fillStyle = `rgba(255,170,80,${1 - k})`; for (let i = 0; i < 20; i++) c.fillRect(tx + rnd(-40, 40) * k * 3, gy - sh - rnd(0, 80) * k, 2, 2); }
      if (fl > 0) { if (!S.bolt) S.bolt = boltPath(tx + rnd(-60, 60), -10, tx, gy - th * 0.85); c.strokeStyle = `rgba(200,180,255,${0.4 * fl})`; c.lineWidth = 10; c.stroke(S.bolt); c.strokeStyle = `rgba(255,255,255,${fl})`; c.lineWidth = 2.5; c.stroke(S.bolt); c.fillStyle = `rgba(220,210,255,${fl * 0.4})`; c.fillRect(0, 0, W, H); }
    },
    text: { at: 2.2, spread: 0.7, dur: 0.9, color: "#fff2c8", glow: "rgba(255,170,80,.9)", from: (p) => [W * (W < 600 ? 0.3 : 0.62) + rnd(-20, 20), H * 0.76 - Math.min(H * 0.42, 300) * 0.85] },
    sound(e) { e.rumble(0, 1.3, 0.4); e.crack(1.4, 0.9); },
  };
  const outage = {
    D: 6.5, facts: ["warning"], calm: false,
    init(S) { S.B = city(0, 0.25, 0.6); },
    draw(c, t, S) {
      sky(c, ["#060814", "#0c1024", "#131834"], 0, H * 0.85);
      const front = lerp(-0.1, 1.15, (t - 0.6) / 1.6) * W;
      drawCity(c, S.B, H * 0.85, "#0f1326", (b, i, k, r, v) => v > 0.45 && b.x + k * 14 > front ? true : v > 0.97 && Math.sin(t * 20 + v * 99) > 0.7 ? "rgba(255,240,200,.25)" : false, t);
      sky(c, ["#0b0d18", "#05060c"], H * 0.85, H + 10);
      if (t > 0.6 && t < 2.4) { c.fillStyle = `rgba(255,240,200,${0.05 * Math.random()})`; c.fillRect(0, 0, W, H); }
    },
    // the words light up like windows coming back on, left to right
    text: { at: 2.8, spread: 1.4, dur: 0.15, color: "rgba(255,214,120,.95)", glow: "rgba(255,200,90,.9)", delay: (p) => p.u * 1.2 + p.r * 0.2, from: (p) => [p.tx, p.ty], ink: ["#ffe9a8", "#ffd36b", "#ffb347"] },
    sound(e) { const n = e.noise("lowpass", 120, 0.5, 0, 3); e.env(n.g, [[0.6, 0.4], [2.2, 0]]); },
  };
  const flood = {
    D: 6.5, facts: ["shock"], calm: false,
    init(S) { S.B = city(0, 0.12, 0.32); S.rain = Array.from({ length: 160 }, () => ({ x: Math.random(), y: Math.random(), v: rnd(0.9, 1.4) })); S.bits = Array.from({ length: 10 }, () => ({ x: Math.random(), ph: rnd(0, 6), c: ["#c96", "#7aa", "#a77"][Math.floor(rnd(0, 3))] })); },
    level: (t) => lerp(H * 0.95, H * 0.68, ease(t / 3.5)),
    draw(c, t, S) {
      sky(c, ["#1a2236", "#2a3550", "#3a4866"], 0, H * 0.78);
      drawCity(c, S.B, H * 0.78, "#26304a", (b, i, k, r, v) => v > 0.75, t);
      sky(c, ["#3c3c44", "#2c2c34"], H * 0.78, H + 10);
      c.strokeStyle = "rgba(170,200,255,.35)"; c.lineWidth = 1; c.beginPath(); S.rain.forEach((d) => { const y = ((d.y + t * d.v) % 1) * H, x = d.x * W - y * 0.1; c.moveTo(x, y); c.lineTo(x + 2, y + 14); }); c.stroke();
      const L = this.level(t), g = c.createLinearGradient(0, L, 0, H); g.addColorStop(0, "rgba(90,110,120,.85)"); g.addColorStop(1, "rgba(40,55,70,.95)");
      c.fillStyle = g; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W + 20; x += 20) c.lineTo(x, L + Math.sin(x * 0.03 + t * 2.4) * 5); c.lineTo(W, H); c.fill();
      S.bits.forEach((b) => { c.fillStyle = b.c; c.fillRect(((b.x + t * 0.02) % 1) * W, L - 4 + Math.sin(t * 2 + b.ph) * 3, 18, 6); });
    },
    text: { at: 2.4, spread: 1.0, dur: 1.2, color: "#cfefff", wobble: 10, from: (p) => [p.tx + rnd(-10, 10), H + 20] },
    sound(e) { const n = e.noise("bandpass", 1800, 0.5, 0, 8); e.env(n.g, [[0, 0.15], [6, 0.12], [6.5, 0]]); const w = e.noise("lowpass", 300, 0.6, 0, 8); e.env(w.g, [[0, 0], [2, 0.25], [6.5, 0]]); },
  };
  const fire = {
    D: 7, facts: ["worst"], calm: false,
    init(S) { S.bx = W * 0.5; S.bw = Math.min(W * 0.36, 280); S.bh = H * 0.5; S.fl = Array.from({ length: 70 }, () => ({ x: rnd(-0.5, 0.5), ph: rnd(0, 6), s: rnd(0.5, 1.2) })); },
    draw(c, t, S) {
      sky(c, ["#120a14", "#2a1218", "#3a1a14"], 0, H * 0.85);
      const gy = H * 0.85, x0 = S.bx - S.bw / 2;
      glow(c, S.bx, gy - S.bh, S.bw * 1.4, "rgba(255,110,40,.35)");
      c.fillStyle = "#1a1418"; c.fillRect(x0, gy - S.bh, S.bw, S.bh);
      for (let r = 0; r < 8; r++) for (let k = 0; k < 5; k++) { const lit = (r < 3) ? 0.6 + 0.4 * Math.sin(t * 9 + r + k) : 0.08; c.fillStyle = `rgba(255,${120 + r * 10},50,${lit})`; c.fillRect(x0 + 10 + k * (S.bw - 20) / 5, gy - S.bh + 12 + r * (S.bh - 20) / 8, (S.bw - 20) / 5 - 10, (S.bh - 20) / 8 - 10); }
      S.fl.forEach((f) => { const h = (70 + 45 * Math.sin(t * 6 + f.ph)) * f.s * (W < 600 ? 0.8 : 1.3), x = S.bx + f.x * S.bw; const g = c.createLinearGradient(0, gy - S.bh - h, 0, gy - S.bh + 10); g.addColorStop(0, "rgba(255,230,120,0)"); g.addColorStop(0.5, "rgba(255,150,40,.7)"); g.addColorStop(1, "rgba(255,80,30,.9)"); c.fillStyle = g; c.beginPath(); c.ellipse(x, gy - S.bh - h / 2 + 8, 12 * f.s, h / 2, 0, 0, TAU); c.fill(); });
      sky(c, ["#1a1214", "#0a0608"], gy, H + 10);
      for (let i = 0; i < 9; i++) { const k = ((t * 0.18 + i / 9) % 1); glow(c, S.bx + Math.sin(i * 3 + t) * 40 * k, gy - S.bh - k * H * 0.5, 40 + k * 90, `rgba(90,85,90,${0.4 * (1 - k)})`); }
    },
    // smoke rises from the roof and forms the words
    text: { at: 2.0, spread: 1.6, dur: 1.6, wobble: 26, color: "#e8e4ea", color2: "rgba(170,165,175,.7)", glow: "rgba(255,150,80,.6)", ease: (k) => easeIO(k), from: (p) => [W * 0.5 + rnd(-60, 60), H * 0.85 - H * 0.5], ink: ["#f1eeff", "#d9d3ff", "#b9b0e0"] },
    sound(e) { const n = e.noise("bandpass", 900, 0.6, 0, 9); e.env(n.g, [[0, 0.2], [6.5, 0.15], [7, 0]]); },
  };

  // ================================================================== CALM story
  const umbrella = {
    D: 7, facts: ["market"],
    init(S) { S.s = Math.min(W, H) / 640; },
    draw(c, t, S) {
      const s = S.s * 1.2, x = W * 0.5, gy = H * 0.86, top = gy - 108 * s;
      sky(c, ["#3a4a66", "#5b6c88", "#8a98ae"], 0, H * 0.7); sky(c, ["#4a7a52", "#2f5a38"], H * 0.7, H);
      c.strokeStyle = "rgba(220,235,255,.45)"; c.lineWidth = 1; c.beginPath();
      for (let i = 0; i < 90; i++) { const xx = (i * 97.3) % W, y = ((i * 0.137 + t * 0.6) % 1) * H; if (Math.abs(xx - x) < 70 * s && y > top - 40 * s) continue; c.moveTo(xx, y); c.lineTo(xx - 1, y + 10); } c.stroke();
      E().walker(c, x - 8 * s, gy, s, 0, 0.1);
      // umbrella
      const ux = x, uy = top - 34 * s, R = 62 * s;
      c.strokeStyle = "#ddd"; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(ux, uy); c.lineTo(ux, top + 40 * s); c.stroke();
      const g = c.createLinearGradient(ux - R, 0, ux + R, 0); g.addColorStop(0, "#ff4fd8"); g.addColorStop(0.5, "#b44dff"); g.addColorStop(1, "#2ef2ff");
      c.fillStyle = g; c.beginPath(); c.arc(ux, uy, R, Math.PI, TAU); for (let i = 4; i >= 0; i--) c.quadraticCurveTo(ux - R + (i + 0.5) * R * 0.4, uy + 10 * s, ux - R + i * R * 0.4, uy); c.fill();
      // drops hitting the canopy and bouncing away
      c.fillStyle = "rgba(220,240,255,.9)"; for (let i = 0; i < 26; i++) { const k = (t * 1.6 + i / 26) % 1, side = i % 2 ? 1 : -1, sx = ux + side * (R * 0.2 + (i % 5) * R * 0.15); c.beginPath(); c.arc(sx + side * k * 90 * s, uy - R * 0.6 - Math.sin(k * Math.PI) * 50 * s + k * 40 * s, 2.2, 0, TAU); c.fill(); }
    },
    text: { at: 2.4, spread: 1.4, dur: 0.9, color: "#cdeeff", glow: "rgba(120,190,255,.9)", ease: (k) => k, from(p, S) { const s = S.s * 1.2, R = 62 * s, side = p.tx < W / 2 ? -1 : 1; return [W / 2 + side * R * 0.9, H * 0.86 - 108 * s - 34 * s - R * 0.3]; } },
    sound(e) { const n = e.noise("bandpass", 3000, 0.5, 0, 9); e.env(n.g, [[0, 0.12], [6.5, 0.1], [7, 0]]); },
  };
  const rainbow = {
    D: 6.5, facts: ["best"],
    init() {},
    draw(c, t, S) {
      const k = ease(t / 1.6);
      sky(c, [`rgb(${lerp(80, 110, k)},${lerp(110, 180, k)},${lerp(150, 240, k)})`, "#cfe8ff"], 0, H * 0.78); sky(c, ["#5aa860", "#3c8a44"], H * 0.78, H);
      glow(c, W * 0.85, H * 0.12, H * 0.3, `rgba(255,240,180,${0.6 * k})`);
      const cx = W * 0.5, cy = H * 0.9, R = Math.min(W * 0.62, H * 0.75), arc = ease((t - 0.3) / 2) * Math.PI;
      ["#ff3b3b", "#ff9a3b", "#ffe23b", "#4cd964", "#3bb3ff", "#5a5bff", "#b44dff"].forEach((col, i) => { c.strokeStyle = col; c.globalAlpha = 0.75; c.lineWidth = R * 0.035; c.beginPath(); c.arc(cx, cy, R - i * R * 0.035, Math.PI, Math.PI + arc); c.stroke(); });
      c.globalAlpha = 1;
      for (let i = 0; i < 5; i++) glow(c, (i / 4) * W, H * 0.16, 90, "rgba(255,255,255,.5)");
    },
    text: { at: 2.2, spread: 0.9, dur: 1, color: "#fff", glow: "rgba(255,200,255,.9)", from(p) { const a = Math.PI + p.u * Math.PI, R = Math.min(W * 0.62, H * 0.75); return [W * 0.5 + Math.cos(a) * R, H * 0.9 + Math.sin(a) * R]; }, ink: ["#ff3b3b", "#ffe23b", "#4cd964", "#3bb3ff", "#b44dff"] },
    sound(e) { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => e.tone(f, 0.4 + i * 0.25, 2.5, 0.04)); },
  };
  const pot = {
    D: 7, facts: ["worst"],
    init(S) { S.s = Math.min(W, H) / 600; },
    draw(c, t, S) {
      const s = S.s, gy = H * 0.84, px = W * 0.38, lx = W * 0.62;
      sky(c, ["#7cc6ff", "#d6efff"], 0, gy); sky(c, ["#4fa65a", "#2f7a3a"], gy, H + 10);
      ["#ff3b3b", "#ff9a3b", "#ffe23b", "#4cd964", "#3bb3ff", "#5a5bff", "#b44dff"].forEach((col, i) => { c.strokeStyle = col; c.globalAlpha = 0.5; c.lineWidth = 10 * s; c.beginPath(); c.moveTo(px - 30 * s + i * 9 * s, -10); c.lineTo(px - 30 * s + i * 9 * s, gy - 70 * s); c.stroke(); }); c.globalAlpha = 1;
      // the pot: empty!
      c.fillStyle = "#1a1a22"; c.beginPath(); c.ellipse(px, gy - 34 * s, 46 * s, 40 * s, 0, 0, TAU); c.fill();
      c.fillStyle = "#08080c"; c.beginPath(); c.ellipse(px, gy - 66 * s, 40 * s, 10 * s, 0, 0, TAU); c.fill();
      c.strokeStyle = "#2a2a34"; c.lineWidth = 6 * s; c.beginPath(); c.ellipse(px, gy - 66 * s, 42 * s, 11 * s, 0, 0, TAU); c.stroke();
      if (t > 1 && t < 3.2) { c.fillStyle = "#fff"; c.font = `800 ${16 * s}px Inter`; c.textAlign = "center"; c.fillText("…empty!", px, gy - 96 * s); }
      // a jolly leprechaun: green hat and coat, bright ginger hair and beard, big grin, waving
      const bob = Math.sin(t * 5) * 3 * s, x = lx, y = gy - 4 * s + bob;
      c.fillStyle = "#1d6b2e"; c.fillRect(x - 16 * s, y - 70 * s, 32 * s, 46 * s);
      c.fillStyle = "#14141a"; c.fillRect(x - 16 * s, y - 40 * s, 32 * s, 6 * s); c.fillStyle = "#ffd36b"; c.fillRect(x - 4 * s, y - 40 * s, 8 * s, 6 * s);
      c.strokeStyle = "#1d6b2e"; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(x - 10 * s, y - 24 * s); c.lineTo(x - 12 * s, y); c.moveTo(x + 10 * s, y - 24 * s); c.lineTo(x + 12 * s, y); c.stroke();
      c.beginPath(); c.moveTo(x + 14 * s, y - 62 * s); c.lineTo(x + 34 * s, y - 84 * s + Math.sin(t * 8) * 8 * s); c.stroke();
      c.fillStyle = "#f2c9a0"; c.beginPath(); c.arc(x, y - 86 * s, 15 * s, 0, TAU); c.fill();
      c.fillStyle = "#ff7a1a"; c.beginPath(); c.arc(x, y - 76 * s, 14 * s, 0, Math.PI); c.fill(); for (let i = -3; i <= 3; i++) { c.beginPath(); c.arc(x + i * 5 * s, y - 98 * s, 5 * s, 0, TAU); c.fill(); }
      c.fillStyle = "#f2c9a0"; c.beginPath(); c.arc(x, y - 84 * s, 10 * s, Math.PI * 1.05, Math.PI * 1.95, true); c.fill();
      c.fillStyle = "#1a1210"; c.beginPath(); c.arc(x - 5 * s, y - 90 * s, 1.8 * s, 0, TAU); c.arc(x + 5 * s, y - 90 * s, 1.8 * s, 0, TAU); c.fill();
      c.strokeStyle = "#7a2a1a"; c.lineWidth = 2 * s; c.beginPath(); c.arc(x, y - 84 * s, 6 * s, 0.2, Math.PI - 0.2); c.stroke();
      c.fillStyle = "#1d6b2e"; c.fillRect(x - 18 * s, y - 104 * s, 36 * s, 5 * s); c.fillRect(x - 11 * s, y - 128 * s, 22 * s, 25 * s); c.fillStyle = "#14141a"; c.fillRect(x - 11 * s, y - 110 * s, 22 * s, 4 * s);
    },
    text: { at: 2.6, spread: 0.8, dur: 1, color: "#ffd36b", glow: "rgba(255,210,90,.9)", from: () => [W * 0.62 + 30, H * 0.84 - 90], ink: ["#ffe9a8", "#ffd36b", "#4cd964"] },
    sound(e) { [392, 523.25, 659.25, 523.25, 783.99].forEach((f, i) => e.tone(f, 0.8 + i * 0.18, 0.4, 0.05)); },
  };
  const brain = {
    D: 7, facts: ["call"],
    init(S) { S.N = Array.from({ length: 70 }, () => ({ x: Math.random() * W, y: Math.random() * H, ph: rnd(0, 6) })); S.E = []; S.N.forEach((a, i) => S.N.forEach((b, j) => { if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < Math.min(W, H) * 0.2) S.E.push([a, b, rnd(0, 1)]); })); },
    draw(c, t, S) {
      if (t < 1.8) { // zooming into bright ginger hair
        const z = Math.exp(t * 1.6);
        sky(c, ["#ff7a1a", "#e05a0a"], 0, H);
        c.strokeStyle = "rgba(255,190,90,.7)"; c.lineWidth = 3 * z; for (let i = 0; i < 22; i++) { c.beginPath(); const x = ((i * 53) % W - W / 2) * z + W / 2; c.moveTo(x, -20); c.bezierCurveTo(x + 80 * z, H * 0.3, x - 80 * z, H * 0.6, x + 20 * z, H + 20); c.stroke(); }
        c.fillStyle = `rgba(20,8,30,${clamp((t - 1.2) / 0.6)})`; c.fillRect(0, 0, W, H); return;
      }
      sky(c, ["#1a0a24", "#240a30", "#12061a"]);
      c.lineWidth = 1.2; S.E.forEach(([a, b, o]) => { c.strokeStyle = "rgba(255,120,200,.18)"; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); const k = (t * 0.8 + o) % 1; glow(c, lerp(a.x, b.x, k), lerp(a.y, b.y, k), 8, "rgba(255,200,255,.9)"); });
      S.N.forEach((n) => glow(c, n.x, n.y, 10 + 6 * Math.sin(t * 6 + n.ph), "rgba(255,120,220,.8)"));
      if (t > 5.6) { const k = clamp((t - 5.6) / 1.2); glow(c, W / 2, H / 2, k * Math.hypot(W, H), `rgba(255,255,255,${k})`); }
    },
    text: { at: 2.6, spread: 1.2, dur: 0.5, color: "#ffd2f4", glow: "rgba(255,90,220,1)", from(p, S) { const n = S.N[Math.floor(p.r * S.N.length)]; return [n.x, n.y]; }, ink: ["#ff9ae8", "#ff4fd8", "#b44dff"] },
    sound(e) { for (let i = 0; i < 12; i++) e.tone(rnd(600, 1400), 2 + i * 0.2, 0.15, 0.03); },
  };
  const iss = {
    D: 7, facts: ["world", "insider"],
    init(S) { S.st = stars(S, 160, 1); },
    draw(c, t, S) {
      sky(c, ["#000005", "#02030c"]); drawStars(c, S.st, t);
      const R = W * 1.4, ex = W * 0.5, ey = H + R * 0.72;
      const g = c.createRadialGradient(ex, ey - R * 0.3, R * 0.5, ex, ey, R); g.addColorStop(0, "#2f86d6"); g.addColorStop(0.9, "#174a8a"); g.addColorStop(1, "#5fb0ff"); c.fillStyle = g; c.beginPath(); c.arc(ex, ey, R, 0, TAU); c.fill();
      glow(c, ex, ey - R, R * 0.12, "rgba(120,190,255,.5)");
      // the station: a long truss, gold solar wings, modules, and a round window with two astronauts looking at Earth
      const x = lerp(W * 0.2, W * 0.5, ease(t / 3)), y = H * 0.3, s = Math.min(W, H) / 700;
      c.fillStyle = "#c9ccd6"; c.fillRect(x - 180 * s, y - 4 * s, 360 * s, 8 * s);
      [-150, -100, 100, 150].forEach((dx) => { c.fillStyle = "#c9a23a"; c.fillRect(x + dx * s - 18 * s, y - 70 * s, 36 * s, 60 * s); c.fillRect(x + dx * s - 18 * s, y + 10 * s, 36 * s, 60 * s); c.strokeStyle = "rgba(60,40,0,.5)"; c.lineWidth = 1; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(x + dx * s - 18 * s, y - 70 * s + k * 10 * s); c.lineTo(x + dx * s + 18 * s, y - 70 * s + k * 10 * s); c.stroke(); } });
      c.fillStyle = "#e6e8ee"; c.fillRect(x - 40 * s, y - 14 * s, 80 * s, 28 * s); c.fillRect(x - 12 * s, y + 14 * s, 24 * s, 24 * s);
      c.fillStyle = "#0b1a2e"; c.beginPath(); c.arc(x, y + 40 * s, 14 * s, 0, TAU); c.fill();
      c.fillStyle = "#fff"; c.beginPath(); c.arc(x - 5 * s, y + 42 * s, 4 * s, 0, TAU); c.arc(x + 5 * s, y + 42 * s, 4 * s, 0, TAU); c.fill();
      c.fillStyle = "#ffcf6b"; c.beginPath(); c.arc(x - 5 * s, y + 42 * s, 2.4 * s, 0, TAU); c.arc(x + 5 * s, y + 42 * s, 2.4 * s, 0, TAU); c.fill();
    },
    text: { at: 2.8, spread: 1, dur: 1, color: "#cfe9ff", glow: "rgba(90,170,255,.9)", from: () => [W * 0.5, H * 0.3 + 40] },
    sound(e) { [220, 330, 440].forEach((f, i) => e.tone(f, 0.2 + i * 0.4, 5, 0.04)); },
  };
  const align = {
    D: 7, facts: ["insider", "busiest"],
    init(S) { S.st = stars(S, 220, 1); },
    draw(c, t, S) { sky(c, ["#02020a", "#070a1e", "#0d0a24"]); drawStars(c, S.st, t); glow(c, W * 0.2, H * 0.3, W * 0.4, "rgba(107,92,255,.12)"); glow(c, W * 0.8, H * 0.7, W * 0.4, "rgba(255,79,216,.08)"); },
    text: { at: 1.2, spread: 1.4, dur: 1.6, color: "#fff", glow: "rgba(200,220,255,1)", ease: easeIO, from: (p) => [((p.r * 9301) % 1) * W, ((p.r * 4973) % 1) * H] },
    sound(e) { [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => e.tone(f, 1.2 + i * 0.3, 2, 0.03)); },
  };

  // ================================================================== SUNNY story
  const skywriter = {
    D: 8, facts: ["market"],
    init(S) {},
    plane: (t) => lerp(-0.1, 1.1, (t - 1.4) / 3.4) * W,
    draw(c, t, S) {
      const pan = ease(t / 1.4) * H * 0.6; // pan up from the beach to the sky
      c.save(); c.translate(0, pan);
      sky(c, ["#3aa8ff", "#7cc8ff", "#cdeeff"], -H * 0.7, H * 0.55); sky(c, ["#2a9fd0", "#1a7ab0"], H * 0.55, H * 0.7); sky(c, ["#f0d39b", "#e3bd7c"], H * 0.7, H + 10);
      c.restore();
      glow(c, W * 0.85, H * 0.15, H * 0.25, "rgba(255,240,180,.7)");
      // a generic blimp drifting past
      const bx = lerp(W * 1.2, W * 0.15, t / 8), by = H * 0.22, s = Math.min(W, H) / 600;
      c.fillStyle = "#d9dce6"; c.beginPath(); c.ellipse(bx, by, 90 * s, 28 * s, 0, 0, TAU); c.fill();
      c.fillStyle = "#6b5cff"; c.fillRect(bx - 60 * s, by - 4 * s, 120 * s, 8 * s); c.fillStyle = "#b9bcc8"; c.beginPath(); c.moveTo(bx + 80 * s, by); c.lineTo(bx + 104 * s, by - 22 * s); c.lineTo(bx + 104 * s, by + 22 * s); c.fill(); c.fillRect(bx - 16 * s, by + 26 * s, 32 * s, 10 * s);
      // a paraglider
      const gx = lerp(W * 0.1, W * 0.35, t / 8), gy = H * 0.72 + Math.sin(t) * 10;
      c.strokeStyle = "#ff4fd8"; c.lineWidth = 9 * s; c.beginPath(); c.arc(gx, gy, 46 * s, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
      c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 1; c.beginPath(); c.moveTo(gx - 38 * s, gy - 24 * s); c.lineTo(gx, gy + 34 * s); c.lineTo(gx + 38 * s, gy - 24 * s); c.stroke(); c.fillStyle = "#222"; c.beginPath(); c.arc(gx, gy + 38 * s, 4 * s, 0, TAU); c.fill();
      // the skywriting plane
      const px = this.plane(t), py = H * 0.42 + Math.sin(t * 2) * 6;
      if (px > -40 && px < W + 40) { c.fillStyle = "#ff3b5c"; c.beginPath(); c.moveTo(px + 22 * s, py); c.lineTo(px - 14 * s, py - 5 * s); c.lineTo(px - 14 * s, py + 5 * s); c.fill(); c.fillRect(px - 4 * s, py - 14 * s, 6 * s, 28 * s); c.fillRect(px - 16 * s, py - 8 * s, 4 * s, 10 * s); }
    },
    text: { at: 1.4, spread: 3.4, dur: 0.5, color: "#fff", color2: "rgba(255,255,255,.6)", glow: "rgba(255,255,255,.7)", plate: 0.82, delay: (p) => p.u * 3.4, wobble: 6, from: (p) => [p.tx - 20, p.ty], ink: ["#ffffff", "#e8f4ff", "#cfe7ff"] },
    sound(e) { const n = e.noise("bandpass", 220, 2, 0, 9); e.env(n.g, [[1.2, 0.08], [3, 0.12], [5, 0.05], [8, 0]]); },
    cy: () => H * 0.42,
  };
  const goal = {
    D: 7, facts: ["best"],
    init(S) { S.crowd = Array.from({ length: W < 600 ? 500 : 1100 }, () => ({ x: Math.random() * W, y: rnd(0, 0.38) * H, c: ["#ff4fd8", "#2ef2ff", "#ffd36b", "#fff", "#6b5cff"][Math.floor(rnd(0, 5))], ph: rnd(0, 6) })); S.conf = Array.from({ length: 120 }, () => ({ x: Math.random() * W, v: rnd(60, 160), ph: rnd(0, 6), c: ["#ff4fd8", "#2ef2ff", "#ffd36b"][Math.floor(rnd(0, 3))] })); },
    draw(c, t, S) {
      sky(c, ["#0a0a1a", "#1a1a34"], 0, H * 0.4);
      const cheer = t > 1.5 ? 1 : 0;
      S.crowd.forEach((p) => { c.fillStyle = p.c; c.globalAlpha = 0.7; c.fillRect(p.x, p.y - (cheer ? Math.abs(Math.sin(t * 10 + p.ph)) * 4 : 0), 3, 3); }); c.globalAlpha = 1;
      for (let i = 0; i < 4; i++) glow(c, (i + 0.5) / 4 * W, 0, 120, "rgba(255,255,230,.5)");
      for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? "#2f8f3a" : "#38a045"; c.fillRect(0, H * 0.4 + (i * H * 0.6) / 8, W, H * 0.6 / 8 + 1); }
      c.strokeStyle = "rgba(255,255,255,.8)"; c.lineWidth = 3; c.strokeRect(W * 0.3, H * 0.4, W * 0.4, H * 0.16);
      // the goal and its net
      const gx = W * 0.5, gy = H * 0.5, gw = Math.min(W * 0.34, 300), gh = gw * 0.33, bulge = t > 1.5 && t < 2.4 ? Math.sin(((t - 1.5) / 0.9) * Math.PI) * 18 : 0;
      c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 1; for (let i = 0; i <= 12; i++) { c.beginPath(); c.moveTo(gx - gw / 2 + (i * gw) / 12, gy - gh); c.quadraticCurveTo(gx - gw / 2 + (i * gw) / 12, gy - gh / 2 - bulge, gx - gw / 2 + (i * gw) / 12, gy); c.stroke(); }
      c.strokeStyle = "#fff"; c.lineWidth = 5; c.beginPath(); c.moveTo(gx - gw / 2, gy); c.lineTo(gx - gw / 2, gy - gh); c.lineTo(gx + gw / 2, gy - gh); c.lineTo(gx + gw / 2, gy); c.stroke();
      // the ball, from the bottom of the screen into the top corner
      const k = clamp(t / 1.5), bx = lerp(W * 0.5, gx + gw * 0.36, k), by = lerp(H * 1.05, gy - gh * 0.75, k) - Math.sin(k * Math.PI) * H * 0.15, br = lerp(26, 9, k);
      if (t < 2.4) { c.fillStyle = "#fff"; c.beginPath(); c.arc(bx, by, br, 0, TAU); c.fill(); c.fillStyle = "#111"; c.beginPath(); c.arc(bx, by, br * 0.35, 0, TAU); c.fill(); }
      if (t > 1.5 && t < 3.6) { c.save(); c.globalAlpha = clamp((3.6 - t) / 0.5); c.font = `italic 900 ${Math.min(W * 0.16, 120)}px 'Playfair Display', serif`; c.textAlign = "center"; c.fillStyle = "#ffd36b"; c.shadowColor = "#ff4fd8"; c.shadowBlur = 24; c.fillText("GOAL!", W / 2, H * 0.28); c.restore(); }
      if (t > 1.5) S.conf.forEach((p) => { c.fillStyle = p.c; c.fillRect(p.x + Math.sin(t * 3 + p.ph) * 10, ((t - 1.5) * p.v) % H, 4, 7); });
    },
    text: { at: 3.4, spread: 0.6, dur: 0.9, color: "#fff", glow: "rgba(255,210,90,.9)", from: () => [W * 0.5 + rnd(-100, 100), H * 0.4], ink: ["#ffd36b", "#ff4fd8", "#2ef2ff"] },
    cy: () => H * 0.72,
    sound(e) { const n = e.noise("bandpass", 1200, 0.5, 0, 8); e.env(n.g, [[0, 0.05], [1.5, 0.05], [1.8, 0.5], [4, 0.3], [7, 0]]); },
  };
  const mountain = {
    D: 7.5, facts: ["call"],
    init(S) { S.r = [0.45, 0.55, 0.65].map((b) => Array.from({ length: 12 }, () => b + rnd(-0.12, 0.08))); },
    draw(c, t, S) {
      const sun = lerp(H * 0.42, H * 0.5, t / 7.5);
      sky(c, ["#2a1a4a", "#c24a6a", "#ff9a4a", "#ffd27a"], 0, H * 0.62);
      glow(c, W * 0.5, sun, H * 0.4, "rgba(255,200,120,.6)"); c.fillStyle = "#ffe2a0"; c.beginPath(); c.arc(W * 0.5, sun, Math.min(W, H) * 0.07, 0, TAU); c.fill();
      ["#5a2a5a", "#3a1a40", "#1f0f26"].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, H); S.r[i].forEach((y, j) => c.lineTo((j / 11) * W, y * H + (i === 2 ? 0 : 0))); c.lineTo(W, H); c.fill(); });
      // the nearest ridge rises to a peak where two horses arrive
      const peakX = W * 0.62, peakY = H * 0.5;
      c.fillStyle = "#0f0814"; c.beginPath(); c.moveTo(0, H); c.lineTo(0, H * 0.85); c.lineTo(peakX, peakY); c.lineTo(W, H * 0.8); c.lineTo(W, H); c.fill();
      const k = ease(t / 3.4), s = Math.min(W, H) / 650;
      [0, 1].forEach((i) => { const x = lerp(W * 0.08 + i * 50 * s, peakX - 30 * s - i * 46 * s, k), y = lerp(H * 0.85 - (W * 0.08) / peakX * (H * 0.35), peakY, (x - 0) / peakX) ; horse(c, x, Math.min(y, H * 0.85) , s * (1 - i * 0.08), t, k < 1); });
    },
    text: { at: 3.4, spread: 1.0, dur: 1.2, color: "#ffe9b8", glow: "rgba(255,170,80,.9)", from: () => [W * 0.5, H * 0.45], ink: ["#fff3c4", "#ffd36b", "#ff9d2e"] },
    cy: () => H * 0.2,
    sound(e) { [196, 246.94, 293.66].forEach((f, i) => e.tone(f, 0.3 + i * 0.5, 6, 0.05)); },
  };
  function horse(c, x, y, s, t, walking) {
    const ph = walking ? t * 7 : 0;
    c.save(); c.translate(x, y); c.fillStyle = "#06030a"; c.strokeStyle = "#06030a"; c.lineCap = "round";
    c.beginPath(); c.ellipse(0, -30 * s, 24 * s, 10 * s, 0, 0, TAU); c.fill();
    c.lineWidth = 7 * s; c.beginPath(); c.moveTo(18 * s, -34 * s); c.lineTo(30 * s, -54 * s); c.stroke();
    c.beginPath(); c.ellipse(36 * s, -56 * s, 9 * s, 5 * s, 0.5, 0, TAU); c.fill();
    c.lineWidth = 4 * s; [[-16, 0], [-10, 2], [12, 1], [18, 3]].forEach(([dx, o]) => { c.beginPath(); c.moveTo(dx * s, -24 * s); c.lineTo(dx * s + Math.sin(ph + o) * 5 * s, 0); c.stroke(); });
    c.lineWidth = 3 * s; c.beginPath(); c.moveTo(-24 * s, -32 * s); c.quadraticCurveTo(-36 * s, -26 * s, -34 * s, -12 * s); c.stroke();
    c.restore();
  }
  const fireworks = {
    D: 7.5, facts: ["insider", "busiest"],
    init(S) { S.bursts = Array.from({ length: 9 }, (_, i) => ({ x: rnd(0.15, 0.85) * W, y: rnd(0.12, 0.45) * H, at: 0.3 + i * 0.55, c: ["#ff4fd8", "#2ef2ff", "#ffd36b", "#3ee08f", "#b44dff"][i % 5], n: 40 })); S.B = city(0, 0.08, 0.2); },
    draw(c, t, S) {
      sky(c, ["#05040e", "#0d0a24", "#1a1238"], 0, H);
      S.bursts.forEach((b) => {
        const a = t - b.at; if (a < 0) return;
        if (a < 0.6) { c.fillStyle = "#fff"; c.fillRect(b.x, lerp(H, b.y, a / 0.6), 2, 8); return; }
        const k = a - 0.6; if (k > 2.2) return;
        c.fillStyle = b.c; c.globalAlpha = 1 - k / 2.2;
        for (let i = 0; i < b.n; i++) { const an = (i / b.n) * TAU, r = ease(k / 1.2) * 90; c.fillRect(b.x + Math.cos(an) * r, b.y + Math.sin(an) * r + k * k * 20, 3, 3); }
        c.globalAlpha = 1; if (k < 0.15) glow(c, b.x, b.y, 80, "rgba(255,255,255,.5)");
      });
      drawCity(c, S.B, H, "#08060f", (b, i, k, r, v) => v > 0.6, t);
    },
    text: { at: 2.2, spread: 1.2, dur: 1, color: "#fff", color2: "#ffd36b", glow: "rgba(255,79,216,.9)", from(p, S) { const b = S.bursts[Math.floor(p.r * S.bursts.length)]; return [b.x, b.y]; }, ink: ["#ff4fd8", "#ffd36b", "#2ef2ff"] },
    sound(e, S) { S.bursts.forEach((b) => e.crack(b.at + 0.6, 0.25)); },
  };

  // ================================================================== ECLIPSE story
  const shooting = {
    D: 7, facts: ["best"],
    init(S) { S.st = stars(S, 200, 1); },
    head: (t) => [lerp(-0.1, 1.1, (t - 0.8) / 2.6) * W, lerp(H * 0.2, H * 0.5, (t - 0.8) / 2.6)],
    draw(c, t, S) {
      sky(c, ["#03031a", "#0a0a2e", "#141038"]); drawStars(c, S.st, t);
      c.fillStyle = "#0a0816"; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 30) c.lineTo(x, H * 0.85 + Math.sin(x * 0.01) * 20); c.lineTo(W, H); c.fill();
      const [x, y] = this.head(t);
      if (t > 0.8 && t < 3.6) { const g = c.createLinearGradient(x - 220, y - 55, x, y); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(255,255,255,.95)"); c.strokeStyle = g; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 220, y - 55); c.lineTo(x, y); c.stroke(); glow(c, x, y, 26, "rgba(220,230,255,.9)"); }
    },
    text: { at: 0.9, spread: 2.6, dur: 0.6, color: "#fff7d6", glow: "rgba(255,230,160,1)", delay: (p) => p.u * 2.5, from: (p) => [p.tx - 30, p.ty - 30] },
    cy: () => H * 0.42,
    sound(e) { e.tone(1318.5, 0.8, 2.5, 0.03); e.tone(1760, 1.4, 2, 0.02); },
  };
  const eiffel = {
    D: 8.5, facts: ["insider", "call"],
    init(S) { S.sp = Array.from({ length: 160 }, () => ({ u: Math.random(), v: Math.random(), ph: rnd(0, 6) })); S.st = stars(S, 120, 0.6); },
    tower(x, base, h) { return (u, v) => { const w = h * 0.32 * Math.pow(1 - v, 1.6) + h * 0.012; return [x + (u - 0.5) * 2 * w, base - v * h]; }; },
    draw(c, t, S) {
      sky(c, ["#060a24", "#121a44", "#2a2050"], 0, H); drawStars(c, S.st, t, 0.7);
      const base = H * 0.86, h = Math.min(H * 0.62, W * 1.3), x = W * 0.5, T = this.tower(x, base, h);
      c.fillStyle = "#0b0a18"; for (let i = 0; i < 14; i++) c.fillRect((i / 14) * W, base - rnd(30, 70), W / 14 - 4, 80);
      c.fillStyle = "#1a1a30"; c.fillRect(0, base, W, H - base); c.fillStyle = "rgba(255,200,120,.25)"; for (let i = 0; i < 30; i++) c.fillRect(((i * 37) % W), base + 10 + (i % 5) * 6, 18, 2);
      // the tower: warm-lit lattice
      c.strokeStyle = "rgba(255,190,90,.85)"; c.lineWidth = 2;
      const leg = (u) => { c.beginPath(); for (let v = 0; v <= 1; v += 0.02) { const [px, py] = T(u, v); v ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); };
      leg(0); leg(1); leg(0.25); leg(0.75);
      for (let v = 0.04; v < 0.95; v += 0.045) { const [a, b] = T(0, v), [d, e] = T(1, v + 0.045); c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); const [f, g] = T(1, v), [h2, i2] = T(0, v + 0.045); c.moveTo(f, g); c.lineTo(h2, i2); c.stroke(); }
      [0.17, 0.42].forEach((v) => { const [a, b] = T(-0.05, v), [d] = T(1.05, v); c.fillStyle = "rgba(255,190,90,.9)"; c.fillRect(a, b - 3, d - a, 6); });
      const [ax, ay] = T(0.5, 1); c.strokeStyle = "#ffd36b"; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax, ay - 20); c.stroke();
      glow(c, ax, ay - 20, 30 + 10 * Math.sin(t * 3), "rgba(255,255,220,.6)");
      const n = t < 1 ? null : t < 2 ? "3" : t < 3 ? "2" : t < 4 ? "1" : null;
      if (n) { const k = (t % 1); c.save(); c.globalAlpha = 1 - k * 0.6; c.font = `italic 900 ${Math.min(W * 0.3, 220) * (1 + k * 0.3)}px 'Playfair Display', serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#fff"; c.shadowColor = "#ffd36b"; c.shadowBlur = 30; c.fillText(n, W / 2, H * 0.4); c.restore(); }
      if (t > 4) S.sp.forEach((p) => { if (Math.sin(t * 14 + p.ph * 10) > 0.4) { const [px, py] = T(p.u, p.v * 0.95); c.fillStyle = "#fff"; c.fillRect(px - 1.5, py - 1.5, 3, 3); glow(c, px, py, 6, "rgba(255,255,255,.7)"); } });
    },
    text: { at: 4.1, spread: 1, dur: 1, color: "#fff", glow: "rgba(255,255,255,1)", from(p) { const h = Math.min(H * 0.62, W * 1.3), v = p.r * 0.9, w = h * 0.32 * Math.pow(1 - v, 1.6); return [W * 0.5 + (p.u - 0.5) * 2 * w, H * 0.86 - v * h]; }, ink: ["#fff7d6", "#ffd36b", "#ffffff"] },
    cy: () => H * 0.5,
    sound(e) { [0, 1, 2, 3].forEach((i) => e.tone(i < 3 ? 660 : 990, 1 + i, 0.35, 0.06)); for (let i = 0; i < 10; i++) e.tone(rnd(1800, 2600), 4.1 + i * 0.12, 0.1, 0.02); },
  };
  const colmar = {
    D: 8.5, facts: ["call", "shelter", "watch"],
    init(S) { const cols = ["#f6b3a6", "#ffd98a", "#a9d8f0", "#b7e3b0", "#e7b8f0", "#ffc48a", "#9fd6c8"]; let x = -20; S.h = []; while (x < W + 40) { const w = rnd(60, 100) * (W < 600 ? 0.7 : 1); S.h.push({ x, w, h: rnd(0.16, 0.26) * H, c: cols[S.h.length % cols.length], side: Math.random() > 0.5 }); x += w; } },
    draw(c, t, S) {
      const sunY = lerp(H * 0.42, H * 0.18, ease(t / 6)), wl = H * 0.66;
      sky(c, ["#3a4a8a", "#ff9a7a", "#ffd9a0"], 0, wl);
      glow(c, W * 0.75, sunY, H * 0.4, "rgba(255,210,140,.7)"); c.fillStyle = "#fff0c8"; c.beginPath(); c.arc(W * 0.75, sunY, Math.min(W, H) * 0.05, 0, TAU); c.fill();
      // half-timbered houses along the canal
      S.h.forEach((b) => {
        const y = wl - b.h; c.fillStyle = b.c; c.fillRect(b.x, y, b.w - 2, b.h);
        c.fillStyle = "#7a3a2a"; c.beginPath(); c.moveTo(b.x - 4, y); c.lineTo(b.x + b.w / 2, y - b.h * 0.55); c.lineTo(b.x + b.w + 2, y); c.fill();
        c.strokeStyle = "#4a2a1a"; c.lineWidth = 3; c.strokeRect(b.x, y, b.w - 2, b.h); c.beginPath(); c.moveTo(b.x, y + b.h * 0.45); c.lineTo(b.x + b.w, y + b.h * 0.45); c.moveTo(b.x, y); c.lineTo(b.x + b.w / 2, y + b.h * 0.45); c.lineTo(b.x + b.w, y); c.stroke();
        c.fillStyle = "rgba(255,240,200,.85)"; c.fillRect(b.x + b.w * 0.2, y + b.h * 0.55, b.w * 0.18, b.h * 0.2); c.fillRect(b.x + b.w * 0.6, y + b.h * 0.55, b.w * 0.18, b.h * 0.2);
        c.fillStyle = "#e05a7a"; c.fillRect(b.x + b.w * 0.18, y + b.h * 0.76, b.w * 0.22, 4);
      });
      // the canal with reflections
      const g = c.createLinearGradient(0, wl, 0, H); g.addColorStop(0, "#5a6aa0"); g.addColorStop(1, "#2a3060"); c.fillStyle = g; c.fillRect(0, wl, W, H - wl);
      c.save(); c.globalAlpha = 0.25; c.translate(0, wl * 2); c.scale(1, -1); S.h.forEach((b) => { c.fillStyle = b.c; c.fillRect(b.x, wl - b.h, b.w - 2, b.h); }); c.restore();
      c.strokeStyle = "rgba(255,230,180,.4)"; c.lineWidth = 2; for (let i = 0; i < 14; i++) { const y = wl + 10 + i * 12, x = W * 0.75 + Math.sin(t * 2 + i) * 20; c.beginPath(); c.moveTo(x - 30 + i * 2, y); c.lineTo(x + 30 - i * 2, y); c.stroke(); }
      // a punt gliding along, someone standing with the pole
      const s = Math.min(W, H) / 650, px = lerp(-0.1, 0.7, t / 8.5) * W, py = wl + (H - wl) * 0.45;
      c.fillStyle = "#5a3a1a"; c.beginPath(); c.moveTo(px - 70 * s, py); c.lineTo(px + 70 * s, py); c.lineTo(px + 60 * s, py + 10 * s); c.lineTo(px - 60 * s, py + 10 * s); c.fill();
      c.fillStyle = "#2a2350"; c.fillRect(px + 30 * s, py - 44 * s, 10 * s, 44 * s); c.fillStyle = "#f2c9a0"; c.beginPath(); c.arc(px + 35 * s, py - 52 * s, 8 * s, 0, TAU); c.fill(); c.fillStyle = "#e8d48a"; c.fillRect(px + 25 * s, py - 62 * s, 20 * s, 4 * s);
      c.strokeStyle = "#8a6a3a"; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(px + 52 * s, py - 70 * s); c.lineTo(px + 20 * s + Math.sin(t) * 6 * s, py + 40 * s); c.stroke();
      c.fillStyle = "#ff7ab8"; c.beginPath(); c.arc(px - 20 * s, py - 12 * s, 9 * s, 0, TAU); c.fill(); c.fillStyle = "#f2c9a0"; c.beginPath(); c.arc(px - 20 * s, py - 26 * s, 7 * s, 0, TAU); c.fill();
    },
    // the words appear as the sunrise light reaches them
    text: { at: 1.8, spread: 2.2, dur: 0.4, color: "#ffe6b0", glow: "rgba(255,190,110,1)", delay: (p) => clamp(Math.hypot(p.tx - W * 0.75, p.ty - H * 0.3) / Math.hypot(W, H)) * 2.4, from: (p) => [p.tx, p.ty], ink: ["#fff3c4", "#ffd36b", "#ff9d2e"] },
    cy: () => H * 0.24,
    sound(e) { [261.63, 329.63, 392, 523.25].forEach((f, i) => e.tone(f, 0.3 + i * 0.6, 6, 0.04)); },
  };

  const STORIES = {
    hurricane: [tornado, quake, sinkhole, recede, tsunami],
    thunder: [tree, outage, flood, fire],
    rain: [umbrella, rainbow, pot, brain, iss, align],
    windy: [umbrella, rainbow, pot, brain, iss, align],
    sunny: [skywriter, goal, mountain, fireworks],
    eclipse: [shooting, eiffel, colmar],
  };
  window.WX_STORY = {
    has: (name) => !!STORIES[name],
    // returns a player for one story: { n, start(i), draw(c, t), D(i) }
    make(name, w, h) {
      W = w; H = h;
      const chs = STORIES[name], F = assign(chs);
      let S = {}, L = null, i = -1;
      // every fact stays on screen, crisp, for at least 2.6 seconds so there is time to read it
      const Dk = chs.map((c) => { const T = c.text || {}; return Math.max(c.D, (T.at ?? 1.2) + (T.spread ?? 1) + (T.dur ?? 0.9) + 0.7 + 2.6 + 0.35); });
      return {
        n: chs.length,
        D: (k) => Dk[k],
        start(k) { i = k; S = {}; chs[k].init?.(S); L = factLayout(F[k], (chs[k].cy ? chs[k].cy() : H * 0.5)); snd((e) => chs[k].sound?.(e, S)); },
        sound() { snd((e) => chs[i].sound?.(e, S)); },
        draw(c, t) {
          const ch = chs[i];
          c.save(); ch.draw(c, t, S); c.restore();
          drawFact(c, t, L, ch, S);
          const din = 1 - clamp(t / 0.45), dout = clamp((t - (Dk[i] - 0.35)) / 0.35), dk = Math.max(din, dout);
          if (dk > 0) { c.fillStyle = `rgba(5,4,11,${dk})`; c.fillRect(0, 0, W, H); }
        },
      };
    },
  };
})();
