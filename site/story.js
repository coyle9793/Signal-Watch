// Weather stories: after each weather intro, a run of short scenes, each one revealing one key fact
// about today's market. The letters of each fact are thrown about inside the scene (swirled by the
// tornado, bounced off the umbrella, kicked up by the leprechaun...) and then land in place.
// Scenes live in story-*.js and register with WXS.add(name, (K) => [chapters]).
// Disaster scenes show buildings, objects and landscapes only (never people being hurt), and the
// facts beside them are worded plainly. No brands or logos anywhere.
(() => {
  const rnd = (a, b) => a + Math.random() * (b - a);
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const easeIO = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  const back = (x) => { x = clamp(x); const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
  const lerp = (a, b, k) => a + (b - a) * k;
  const TAU = Math.PI * 2;
  let W = 0, H = 0;
  const E = () => window.WXE; // engine hooks from intro.js (audio, walker, dogs)

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


  // ------------------------------------------------------------------ colours
  const hex = (h) => { h = h.replace("#", ""); if (h.length === 3) h = h.split("").map((x) => x + x).join(""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };
  function mix(cols, u) {
    const n = cols.length - 1, i = Math.min(n - 1, Math.floor(u * n)), k = u * n - i, a = hex(cols[i]), b = hex(cols[Math.min(n, i + 1)]);
    return `rgb(${a.map((v, j) => Math.round(lerp(v, b[j], k))).join(",")})`;
  }

  // ------------------------------------------------------------------ the fact's layout: letters, words, and (for some scenes) dots
  const bigFont = (s) => `italic 900 ${s}px 'Playfair Display', Georgia, serif`;
  function layoutFact(f, ch) {
    const T = ch.text || {}, cx = ch.cx ? ch.cx() : W / 2, cy = ch.cy ? ch.cy() : H * 0.5, maxW = ch.maxW ? ch.maxW() : W * 0.88;
    const m = document.createElement("canvas").getContext("2d");
    let s1 = clamp(W * 0.085, 30, 82); m.font = bigFont(s1);
    let tw = m.measureText(f.big).width; if (tw > maxW) { s1 *= maxW / tw; m.font = bigFont(s1); tw = m.measureText(f.big).width; }
    const ink = T.ink || ["#2ef2ff", "#6b5cff", "#b44dff"], x0 = cx - tw / 2, chars = [...f.big];
    const G = []; let pre = "";
    chars.forEach((g, i) => { const w = m.measureText(g).width, x = x0 + m.measureText(pre).width + w / 2; pre += g; if (g.trim()) G.push({ g, tx: x, ty: cy, w, u: chars.length > 1 ? i / (chars.length - 1) : 0.5, r: Math.random(), q: Math.random(), z: Math.random(), rot: rnd(-1, 1) }); });
    G.forEach((p) => { p.col = mix(ink, clamp((p.tx - x0) / Math.max(1, tw))); });
    // the plain sentence underneath, word by word
    const fs = clamp(s1 * 0.26, 13, 19), subFont = `600 ${fs}px Inter, system-ui, sans-serif`, lh = clamp(s1 * 0.32, 17, 25);
    m.font = subFont; const maxS = Math.min(maxW, 640), lines = []; let line = "";
    f.sub.split(" ").forEach((w) => { const tt = line ? line + " " + w : w; if (m.measureText(tt).width > maxS && line) { lines.push(line); line = w; } else line = tt; });
    lines.push(line);
    const SW = []; let sw = 0, nW = 0; lines.slice(0, 3).forEach((l) => { nW += l.split(" ").length; });
    let wi = 0;
    lines.slice(0, 3).forEach((l, li) => {
      const lw = m.measureText(l).width, sx = cx - lw / 2, ws = l.split(" "); sw = Math.max(sw, lw); let acc = "";
      ws.forEach((w) => { const px = sx + m.measureText(acc).width + m.measureText(w).width / 2; acc += w + " "; SW.push({ g: w, tx: px, ty: cy + s1 * 0.88 + li * lh, u: nW > 1 ? wi / (nW - 1) : 0.5, r: Math.random(), q: Math.random(), z: Math.random(), rot: rnd(-1, 1) }); wi++; });
    });
    const L = { f, cx, cy, s1, font: bigFont(s1), subFont, fs, G, SW, tw, sw, x0, ink, kicker: `${f.icon}  ${f.k.toUpperCase().split("").join(String.fromCharCode(8202))}`, ky: cy - s1 * 0.86 };
    if (T.mode === "dots") {
      const off = document.createElement("canvas"); off.width = W; off.height = H; const c = off.getContext("2d");
      c.font = L.font; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#fff"; c.fillText(f.big, cx, cy);
      const y0 = Math.max(0, Math.floor(cy - s1)), rows = Math.min(H - y0, Math.ceil(s1 * 2)), d = c.getImageData(0, y0, W, rows).data;
      let gap = T.gap || (W < 600 ? 3 : 4), pts;
      for (;;) {
        pts = [];
        for (let y = 0; y < rows; y += gap) for (let x = 0; x < W; x += gap) if (d[(y * W + x) * 4 + 3] > 120) pts.push({ tx: x, ty: y + y0 });
        if (pts.length <= (T.max || (W < 700 ? 900 : 1500))) break; gap++;
      }
      pts.forEach((p) => { p.u = clamp((p.tx - x0) / Math.max(1, tw)); p.r = Math.random(); p.q = Math.random(); p.z = Math.random(); p.col = mix(ink, p.u); });
      L.pts = pts; L.gap = gap; L.y0 = y0;
    }
    return L;
  }

  // timing of one chapter's words
  function timing(T) {
    const at = T.at ?? 1.2, spread = T.spread ?? 0.8, dur = T.dur ?? 1;
    return { at, spread, dur, land: at + spread + dur, subAt: at + spread + dur - 0.25 };
  }
  function glyph(c, p, x, y, rot, sc, a, L, sub, glow) {
    c.save(); c.globalAlpha = a; c.translate(x, y); if (rot) c.rotate(rot); if (sc !== 1) c.scale(sc, sc);
    c.lineWidth = sub ? 4 : L.s1 * 0.13; c.strokeStyle = "rgba(5,4,14,.78)"; c.strokeText(p.g, 0, 0);
    if (glow) { c.shadowColor = glow; c.shadowBlur = sub ? 6 : 16; }
    c.fillStyle = sub ? "#f6f3ff" : p.col; c.fillText(p.g, 0, 0); c.restore();
  }
  function drawFact(c, t, L, ch, S) {
    const T = ch.text || {}, { at, spread, dur, land, subAt } = timing(T), ink = L.ink;
    const delay = T.delay || ((p) => p.u * spread * 0.7 + p.r * spread * 0.3);
    const from = T.from || ((p) => [p.tx + (p.r - 0.5) * W * 0.6, -40 - p.q * 100]);
    const spinAt = (p, tt) => (T.spin ?? 1) * p.rot * tt * 2.4;
    // a soft dark glow behind the words so they read on any scene (no box)
    const hk = clamp((t - at - spread * 0.5) / 0.9) * (T.halo ?? 0.6);
    if (hk > 0) {
      const rw = Math.max(L.tw, L.sw) * 0.62 + L.s1, rh = L.s1 * 1.9;
      c.save(); c.globalAlpha = hk; c.translate(L.cx, L.cy + L.s1 * 0.3); c.scale(1, rh / rw);
      const g = c.createRadialGradient(0, 0, 0, 0, 0, rw); g.addColorStop(0, "rgba(5,4,14,.8)"); g.addColorStop(0.55, "rgba(5,4,14,.55)"); g.addColorStop(1, "rgba(5,4,14,0)");
      c.fillStyle = g; c.fillRect(-rw, -rw, rw * 2, rw * 2); c.restore();
    }
    c.save(); c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round";
    // kicker
    const ka = clamp((t - at - 0.2) / 0.6);
    if (ka > 0) { c.font = `800 ${Math.max(11, L.s1 * 0.2)}px Inter, sans-serif`; c.globalAlpha = ka; c.lineWidth = 4; c.strokeStyle = "rgba(5,4,14,.7)"; c.strokeText(L.kicker, L.cx, L.ky); c.fillStyle = T.kickCol || "#2ef2ff"; c.fillText(L.kicker, L.cx, L.ky); c.globalAlpha = 1; }
    c.font = L.font;
    if (T.mode === "dots") {
      const fin = clamp((t - land - 0.1) / 0.7), dd = T.delay || ((p) => p.r * spread);
      const g = Math.max(2, L.gap * 0.8), p1 = new Path2D(), p2 = new Path2D();
      for (const p of L.pts) {
        const k = (t - at - dd(p)) / dur;
        if (k < 0) { if (T.pre != null && t >= T.pre) { const [x, y] = from(p, S, t); T.dot ? T.dot(c, p, x, y, -1, t, S) : p1.rect(x - g / 2, y - g / 2, g, g); } continue; }
        let x = p.tx, y = p.ty;
        if (k < 1) { const [fx, fy] = from(p, S, T.pre != null ? at + dd(p) : t); const e = (T.ease || ease)(k); x = lerp(fx, p.tx, e); y = lerp(fy, p.ty, e); if (T.wobble) { x += Math.sin(t * 6 + p.r * 20) * T.wobble * (1 - e); y += Math.cos(t * 5 + p.q * 17) * T.wobble * (1 - e); } }
        if (T.dot) T.dot(c, p, x, y, clamp(k), t, S, 1 - fin * (T.crisp ?? 1) * 0.9); else (k < 1 ? p1 : p2).rect(x - g / 2, y - g / 2, g, g);
      }
      const cr = T.crisp ?? 1;
      if (!T.dot) { c.save(); c.globalAlpha = 1 - fin * cr * 0.9; c.fillStyle = T.color2 || T.color || "#fff"; c.fill(p1); c.fillStyle = T.color || "#fff"; c.shadowColor = T.glow || "rgba(107,92,255,.9)"; c.shadowBlur = 8; c.fill(p2); c.restore(); }
      if (fin > 0) L.G.forEach((p) => glyph(c, p, p.tx, p.ty, 0, 1, fin * cr, L, false, T.glow || "rgba(107,92,255,.8)"));
    } else {
      const ez = T.ease || back;
      for (const p of L.G) {
        const dep = at + delay(p), k = (t - dep) / dur;
        let x, y, rot = 0, sc = 1, a = 1, landed = false;
        if (k < 0) {
          if (T.pre == null || t < T.pre) continue;
          [x, y] = from(p, S, t); rot = spinAt(p, t); sc = T.preScale ?? 0.7;
          if (T.preDraw) { T.preDraw(c, p, x, y, t, S); c.font = L.font; continue; }
          if (T.preFade) a = clamp((t - T.pre) / T.preFade);
        } else if (k < 1) {
          const [fx, fy] = from(p, S, dep), e = ez(k);
          x = lerp(fx, p.tx, e); y = lerp(fy, p.ty, e) - (T.arc ? Math.sin(Math.PI * k) * T.arc * (0.6 + p.q * 0.6) : 0);
          rot = spinAt(p, dep) * (1 - ease(k)); sc = lerp(T.pre != null ? (T.preScale ?? 0.7) : (T.startScale ?? 0.35), 1, ease(k));
          if (T.pre == null) a = clamp(k / 0.12);
        } else { x = p.tx; y = p.ty; const pp = clamp((t - dep - dur) / 0.35); sc = 1 + 0.14 * Math.sin(pp * Math.PI); landed = true; }
        glyph(c, p, x, y, rot, sc, a, L, false, landed ? T.glow || "rgba(107,92,255,.8)" : null);
      }
    }
    // the plain sentence: its words are thrown in from the same place, a beat later
    c.font = L.subFont;
    const sfrom = T.subFrom || from;
    for (const p of L.SW) {
      const dep = subAt + p.u * 0.6 + p.r * 0.15, k = (t - dep) / 0.75; if (k < 0) continue;
      let x = p.tx, y = p.ty, rot = 0, sc = 1, a = 1;
      if (k < 1) { const [fx, fy] = sfrom(p, S, dep), e = back(k); x = lerp(fx, p.tx, e); y = lerp(fy, p.ty, e) - (T.arc ? Math.sin(Math.PI * k) * T.arc * 0.5 : 0); rot = p.rot * 2 * (1 - ease(k)); sc = lerp(0.4, 1, ease(k)); a = clamp(k / 0.12); }
      glyph(c, p, x, y, rot, sc, a, L, true, null);
    }
    c.restore();
  }

  // ------------------------------------------------------------------ shared drawing kit for the scenes
  function sky(c, stops, y0 = 0, y1 = H) { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); c.fillStyle = g; c.fillRect(-W, y0, W * 3, y1 - y0); }
  function glow(c, x, y, r, col) { if (r <= 0) return; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  const stars = (n, top = 0.8) => Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H * top, r: rnd(0.4, 1.6), ph: rnd(0, 6) }));
  function drawStars(c, arr, t, a = 1) { arr.forEach((s) => { c.fillStyle = `rgba(255,255,255,${a * (0.45 + 0.4 * Math.sin(t * 2 + s.ph))})`; c.fillRect(s.x, s.y, s.r * 1.4, s.r * 1.4); }); }
  // a smooth ridge line from a few sine waves (seeded so it does not jump between frames)
  const ridge = (seed, amp, base) => (x) => base + amp * (Math.sin(x * 0.004 + seed) * 0.5 + Math.sin(x * 0.011 + seed * 2.3) * 0.3 + Math.sin(x * 0.027 + seed * 5.1) * 0.2);
  function hill(c, f, col, x0 = -20, x1 = W + 20, bottom = H + 20) { c.fillStyle = col; c.beginPath(); c.moveTo(x0, bottom); for (let x = x0; x <= x1; x += 12) c.lineTo(x, f(x)); c.lineTo(x1, bottom); c.fill(); }
  function cloud(c, x, y, r, col, puffs = 6, seed = 1) {
    c.fillStyle = col; c.beginPath();
    for (let i = 0; i < puffs; i++) { const a = i / (puffs - 1), px = x + (a - 0.5) * r * 2.6, py = y - Math.sin(a * Math.PI) * r * 0.55 + Math.sin(seed + i * 2.1) * r * 0.1, pr = r * (0.45 + Math.sin(a * Math.PI) * 0.45 + Math.sin(seed * 3 + i) * 0.08); c.moveTo(px + pr, py); c.arc(px, py, pr, 0, TAU); }
    c.rect(x - r * 1.3, y - r * 0.1, r * 2.6, r * 0.45); c.fill();
  }
  function tree(c, x, gy, s, o = {}) { // round broadleaf tree with a bit of sway
    const sw = o.sway || 0, h = 70 * s, col = o.col || "#2f6a35", dk = o.dark || "#22522a";
    c.fillStyle = o.trunk || "#5a3b22"; c.beginPath(); c.moveTo(x - 5 * s, gy); c.lineTo(x - 3 * s + sw * 0.4, gy - h * 0.6); c.lineTo(x + 3 * s + sw * 0.4, gy - h * 0.6); c.lineTo(x + 5 * s, gy); c.fill();
    [[0, -0.75, 0.36, dk], [-0.24, -0.62, 0.26, dk], [0.24, -0.64, 0.27, col], [0, -0.92, 0.26, col], [-0.1, -0.72, 0.3, col]].forEach(([dx, dy, r, cc]) => { c.fillStyle = cc; c.beginPath(); c.arc(x + dx * h + sw, gy + dy * h, r * h, 0, TAU); c.fill(); });
  }
  function pine(c, x, gy, s, col = "#1e3a2a") { c.fillStyle = col; c.beginPath(); c.moveTo(x, gy - 70 * s); c.lineTo(x + 18 * s, gy - 20 * s); c.lineTo(x + 8 * s, gy - 22 * s); c.lineTo(x + 24 * s, gy); c.lineTo(x - 24 * s, gy); c.lineTo(x - 8 * s, gy - 22 * s); c.lineTo(x - 18 * s, gy - 20 * s); c.fill(); }
  function palm(c, x, gy, s, t = 0, col = "#1f6a3a", trunk = "#7a5a3a") {
    const sw = Math.sin(t * 1.3 + x) * 4 * s, tx = x + 16 * s + sw, ty = gy - 120 * s;
    c.strokeStyle = trunk; c.lineWidth = 7 * s; c.lineCap = "round"; c.beginPath(); c.moveTo(x, gy); c.quadraticCurveTo(x + 4 * s, gy - 70 * s, tx, ty); c.stroke();
    c.fillStyle = col; for (let i = 0; i < 7; i++) { const a = -Math.PI + (i / 6) * Math.PI + Math.sin(t * 1.6 + i) * 0.06; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + Math.cos(a) * 34 * s, ty + Math.sin(a) * 34 * s - 12 * s, tx + Math.cos(a) * 58 * s, ty + Math.sin(a) * 40 * s + 18 * s); c.quadraticCurveTo(tx + Math.cos(a) * 30 * s, ty + Math.sin(a) * 26 * s, tx, ty); c.fill(); }
  }
  // a cartoon person, side-ish view. Angles are from straight down (0) and swing forward with +.
  // o: { skin, hair, top, legs, armB:[upper, fore], armF, legB:[thigh, shin], legF, lean, hat, suit }
  function person(c, x, gy, s, o = {}) {
    const lean = o.lean || 0, hip = [x, gy - 36 * s], dir = (a) => [Math.sin(a), Math.cos(a)];
    const limb = (p, a1, a2, l1, l2, col, w) => { const [s1, c1] = dir(a1), k = [p[0] + s1 * l1, p[1] + c1 * l1], [s2, c2] = dir(a1 + a2), e = [k[0] + s2 * l2, k[1] + c2 * l2]; c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(...p); c.lineTo(...k); c.lineTo(...e); c.stroke(); return e; };
    c.save(); c.lineCap = "round"; c.lineJoin = "round";
    if (o.rot) { c.translate(hip[0], hip[1]); c.rotate(o.rot); c.translate(-hip[0], -hip[1]); }
    const lB = o.legB || [0.15, 0.05], lF = o.legF || [-0.15, 0.05], legs = o.legs || "#2a2350", shade = o.shade || "rgba(0,0,0,.25)";
    const sh = [hip[0] + Math.sin(lean) * 30 * s, hip[1] - Math.cos(lean) * 30 * s];
    const aB = o.armB || [-0.2, -0.2], aF = o.armF || [0.25, -0.3], top = o.top || "#ff4fd8", skin = o.skin || "#e8b48a";
    // back limbs
    const fb = limb(hip, lB[0], lB[1], 18 * s, 18 * s, legs, 6.5 * s); if (o.shoes !== false) { c.fillStyle = o.shoe || "#1a1530"; c.beginPath(); c.ellipse(fb[0] + 3 * s, fb[1], 5 * s, 2.6 * s, 0, 0, TAU); c.fill(); }
    const hb = limb(sh, aB[0], aB[1], 14 * s, 13 * s, o.sleeve || top, 5 * s); c.fillStyle = o.glove || skin; c.beginPath(); c.arc(hb[0], hb[1], (o.glove ? 3.6 : 2.6) * s, 0, TAU); c.fill();
    c.strokeStyle = shade; c.lineWidth = 6.5 * s; c.beginPath(); c.moveTo(hip[0], hip[1]); c.lineTo(hip[0], hip[1] + 0.1); c.stroke();
    // torso
    c.strokeStyle = top; c.lineWidth = 13 * s; c.beginPath(); c.moveTo(hip[0], hip[1] - 2 * s); c.lineTo(sh[0], sh[1] + 3 * s); c.stroke();
    // front limbs
    const ff = limb(hip, lF[0], lF[1], 18 * s, 18 * s, legs, 6.5 * s); if (o.shoes !== false) { c.fillStyle = o.shoe || "#1a1530"; c.beginPath(); c.ellipse(ff[0] + 3 * s, ff[1], 5 * s, 2.6 * s, 0, 0, TAU); c.fill(); }
    // head
    const hd = [sh[0] + Math.sin(lean) * 11 * s, sh[1] - Math.cos(lean) * 11 * s];
    if (o.suit) { c.fillStyle = "#f2f2f6"; c.beginPath(); c.arc(hd[0], hd[1], 10.5 * s, 0, TAU); c.fill(); c.fillStyle = "#1a2a4a"; c.beginPath(); c.arc(hd[0] + 3 * s, hd[1], 7 * s, -1.3, 1.3); c.fill(); c.fillStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.arc(hd[0] + 5 * s, hd[1] - 3 * s, 2 * s, 0, TAU); c.fill(); }
    else {
      c.fillStyle = skin; c.beginPath(); c.arc(hd[0], hd[1], 8.5 * s, 0, TAU); c.fill();
      if (o.hair !== false) { c.fillStyle = o.hair || "#3a2418"; c.beginPath(); c.arc(hd[0] - 1 * s, hd[1] - 2 * s, 8.8 * s, Math.PI * 0.95, Math.PI * 2.1); c.fill(); if (o.long) { c.fillRect(hd[0] - 9 * s, hd[1] - 2 * s, 5 * s, 14 * s); } }
      c.fillStyle = "#1a1530"; c.beginPath(); c.arc(hd[0] + 4 * s, hd[1] - 1 * s, 1.2 * s, 0, TAU); c.fill();
      if (o.smile !== false) { c.strokeStyle = "#8a3a2a"; c.lineWidth = 1.1 * s; c.beginPath(); c.arc(hd[0] + 4 * s, hd[1] + 2.5 * s, 2.6 * s, 0.2, 1.5); c.stroke(); }
      if (o.cap) { c.fillStyle = o.cap; c.beginPath(); c.arc(hd[0], hd[1] - 3 * s, 9 * s, Math.PI, TAU); c.fill(); c.fillRect(hd[0], hd[1] - 4 * s, 12 * s, 2.5 * s); }
    }
    const hf = limb(sh, aF[0], aF[1], 14 * s, 13 * s, o.sleeve || top, 5 * s); c.fillStyle = o.glove || skin; c.beginPath(); c.arc(hf[0], hf[1], (o.glove ? 3.6 : 2.6) * s, 0, TAU); c.fill();
    c.restore();
    return { hip, sh, head: hd, handB: hb, handF: hf, footB: fb, footF: ff };
  }
  function city(hMin, hMax, o = {}) { // a skyline: buildings with window grids
    let x = o.x0 ?? -20; const out = [], x1 = o.x1 ?? W + 20, sc = W < 600 ? 0.6 : 1;
    while (x < x1) { const w = rnd(o.wMin || 40, o.wMax || 90) * sc, h = rnd(hMin, hMax) * H; out.push({ x, w, h, roof: Math.random(), win: Array.from({ length: Math.ceil(h / 16) * Math.ceil(w / 14) }, () => Math.random()) }); x += w + rnd(2, 10) * sc; }
    return out;
  }
  function drawCity(c, B, gy, col, lit, opt = {}) {
    B.forEach((b, i) => {
      c.save();
      const tilt = opt.tilt ? opt.tilt(b, i) : 0, drop = opt.drop ? opt.drop(b, i) : 0, sink = opt.sink ? opt.sink(b, i) : 0;
      c.translate(b.x + (tilt > 0 ? b.w : 0), gy + drop + sink); c.rotate(tilt);
      const bx = tilt > 0 ? -b.w : 0;
      c.fillStyle = typeof col === "function" ? col(b, i) : col; c.fillRect(bx, -b.h, b.w, b.h);
      if (b.roof > 0.7) c.fillRect(bx + b.w * 0.4, -b.h - 14, 3, 14); else if (b.roof > 0.45) c.fillRect(bx + b.w * 0.2, -b.h - 6, b.w * 0.4, 6);
      if (lit) {
        const cols = Math.floor(b.w / 14), rows = Math.floor(b.h / 16);
        for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
          const v = b.win[r * cols + k]; const on = lit(b, i, k, r, v); if (!on) continue;
          c.fillStyle = on === true ? "rgba(255,214,120,.85)" : on; c.fillRect(bx + 5 + k * 14, -b.h + 6 + r * 16, 7, 9);
        }
      }
      if (opt.after) opt.after(c, b, i, bx);
      c.restore();
    });
  }
  function boltPath(x0, y0, x1, y1) {
    let p = [[x0, y0], [x1, y1]];
    for (let i = 0; i < 5; i++) { const n = [p[0]]; for (let j = 1; j < p.length; j++) { const [ax, ay] = p[j - 1], [bx, by] = p[j], l = Math.hypot(bx - ax, by - ay), o = rnd(-0.25, 0.25) * l; n.push([(ax + bx) / 2 + (o * (by - ay)) / l, (ay + by) / 2 - (o * (bx - ax)) / l], [bx, by]); } p = n; }
    const P = new Path2D(); P.moveTo(...p[0]); p.forEach((q) => P.lineTo(...q)); return P;
  }
  function bolt(c, P, a) { c.save(); c.strokeStyle = `rgba(200,180,255,${0.4 * a})`; c.lineWidth = 12; c.stroke(P); c.strokeStyle = `rgba(255,255,255,${a})`; c.lineWidth = 2.5; c.stroke(P); c.restore(); }
  function car(c, x, gy, s, col = "#c94a4a", o = {}) {
    c.save(); c.translate(x, gy); if (o.rot) c.rotate(o.rot); if (o.flip) c.scale(-1, 1);
    c.fillStyle = col; c.beginPath(); c.moveTo(-34 * s, -8 * s); c.lineTo(-32 * s, -20 * s); c.lineTo(-18 * s, -22 * s); c.lineTo(-10 * s, -34 * s); c.lineTo(14 * s, -34 * s); c.lineTo(24 * s, -22 * s); c.lineTo(34 * s, -19 * s); c.lineTo(35 * s, -8 * s); c.closePath(); c.fill();
    c.fillStyle = o.glass || "rgba(170,210,240,.85)"; c.beginPath(); c.moveTo(-14 * s, -22 * s); c.lineTo(-8 * s, -31 * s); c.lineTo(0, -31 * s); c.lineTo(0, -22 * s); c.fill(); c.beginPath(); c.moveTo(3 * s, -22 * s); c.lineTo(3 * s, -31 * s); c.lineTo(12 * s, -31 * s); c.lineTo(19 * s, -22 * s); c.fill();
    c.fillStyle = "#14121a"; [-20, 20].forEach((dx) => { c.beginPath(); c.arc(dx * s, -7 * s, 7 * s, 0, TAU); c.fill(); }); c.fillStyle = "#8a8a9a"; [-20, 20].forEach((dx) => { c.beginPath(); c.arc(dx * s, -7 * s, 3 * s, 0, TAU); c.fill(); });
    if (o.lights) { c.fillStyle = "#fff6c8"; c.fillRect(31 * s, -17 * s, 4 * s, 4 * s); c.fillStyle = "#ff4a4a"; c.fillRect(-35 * s, -17 * s, 3 * s, 4 * s); }
    c.restore();
  }
  function lamp(c, x, gy, s, on = 1, col = "#3a3a4a") {
    c.strokeStyle = col; c.lineWidth = 3.5 * s; c.lineCap = "round"; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy - 90 * s); c.quadraticCurveTo(x, gy - 100 * s, x + 12 * s, gy - 100 * s); c.stroke();
    c.fillStyle = col; c.fillRect(x + 8 * s, gy - 101 * s, 12 * s, 5 * s);
    if (on > 0) { glow(c, x + 14 * s, gy - 94 * s, 40 * s, `rgba(255,220,140,${0.55 * on})`); c.fillStyle = `rgba(255,236,180,${on})`; c.fillRect(x + 10 * s, gy - 96 * s, 8 * s, 3 * s); }
  }
  function rainLines(c, n, t, o = {}) {
    const sp = o.speed || 1.6, ang = o.slant ?? 0.15, len = o.len || 16;
    c.strokeStyle = o.col || "rgba(190,210,255,.35)"; c.lineWidth = o.w || 1.2; c.beginPath();
    for (let i = 0; i < n; i++) { const fx = (i * 0.6180339) % 1, fy = (i * 0.7548776) % 1, y = ((fy + t * sp * (0.8 + fx * 0.4)) % 1) * (H + 40) - 20, x = fx * (W + 200) - 100 - y * ang; if (o.skip && o.skip(x, y)) continue; c.moveTo(x, y); c.lineTo(x - len * ang, y + len); }
    c.stroke();
  }

  // ------------------------------------------------------------------ sound kit (WebAudio, nothing to download)
  function kit() {
    const e = E(); if (!e?.soundOn() || !e.ac) return null;
    const A = e.ac(), out = e.out(), NB = e.noiseBuf(), T0 = A.currentTime + 0.02, at = (a) => T0 + Math.max(0, a);
    const track = (n) => e.track(n);
    const shape = (p, pts) => { p.cancelScheduledValues(0); p.setValueAtTime(pts[0][1], at(pts[0][0])); for (let i = 1; i < pts.length; i++) p.linearRampToValueAtTime(pts[i][1], at(pts[i][0])); };
    function noise(type, f, q, a, d, vol, fpts) {
      const s = A.createBufferSource(); s.buffer = NB; s.loop = true;
      const fl = A.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q; const g = A.createGain(); g.gain.value = 0;
      s.connect(fl); fl.connect(g); g.connect(out); s.start(at(a), Math.random() * 2); s.stop(at(a + d + 0.1)); track(s);
      if (vol) shape(g.gain, vol); if (fpts) shape(fl.frequency, fpts); return { g: g.gain, f: fl.frequency };
    }
    function osc(type, f, a, d, vol, f2, lp) {
      const o = A.createOscillator(), g = A.createGain(); o.type = type; o.frequency.setValueAtTime(f, at(a)); if (f2) o.frequency.exponentialRampToValueAtTime(f2, at(a + d));
      g.gain.value = 0; let n = o; if (lp) { const fl = A.createBiquadFilter(); fl.type = "lowpass"; fl.frequency.value = lp; o.connect(fl); n = fl; }
      n.connect(g); g.connect(out); o.start(at(a)); o.stop(at(a + d + 0.05)); track(o);
      if (Array.isArray(vol)) shape(g.gain, vol); else shape(g.gain, [[a, 0], [a + Math.min(0.02, d * 0.2), vol], [a + d, 0]]); return o;
    }
    const K = {
      noise, osc,
      wind(a, d, v, f0 = 320, f1 = 700) { noise("bandpass", f0, 1.6, a, d, [[a, 0], [a + d * 0.2, v], [a + d * 0.5, v * 0.7], [a + d * 0.7, v], [a + d, 0]], [[a, f0], [a + d * 0.3, f1], [a + d * 0.55, f0 * 1.2], [a + d * 0.8, f1 * 0.9], [a + d, f0]]); noise("lowpass", 160, 0.7, a, d, [[a, 0], [a + d * 0.3, v * 0.8], [a + d, 0]]); },
      whoosh(a, d, v) { noise("bandpass", 400, 2, a, d, [[a, 0], [a + d * 0.6, v], [a + d, 0]], [[a, 300], [a + d * 0.7, 2400], [a + d, 900]]); },
      rain(a, d, v) { noise("highpass", 3500, 0.4, a, d, [[a, 0], [a + 0.5, v], [a + d - 0.4, v], [a + d, 0]]); noise("bandpass", 1300, 0.6, a, d, [[a, 0], [a + 0.5, v * 0.5], [a + d, 0]]); },
      waves(a, d, v, per = 3.2) { const pts = [[a, 0]]; for (let x = 0; x < d; x += per) { pts.push([a + x + per * 0.45, v], [a + x + per, v * 0.25]); } pts.push([a + d, 0]); noise("lowpass", 700, 0.5, a, d, pts); },
      crackle(a, d, rate, v) { for (let x = 0; x < d; x += 1 / rate) { const tt = a + x + Math.random() / rate; noise("highpass", 2000 + Math.random() * 3000, 1, tt, 0.05, [[tt, 0], [tt + 0.004, v * (0.4 + Math.random() * 0.6)], [tt + 0.04, 0]]); } },
      thud(a, v, f = 55) { osc("sine", f * 1.6, a, 0.5, [[a, 0], [a + 0.01, v], [a + 0.5, 0]], f); noise("lowpass", 200, 0.7, a, 0.4, [[a, 0], [a + 0.01, v * 0.7], [a + 0.35, 0]]); },
      crash(a, v) { K.thud(a, v); noise("bandpass", 900, 0.8, a, 1.6, [[a, 0], [a + 0.02, v * 0.8], [a + 1.5, 0]]); K.crackle(a + 0.05, 0.6, 30, v * 0.3); },
      rumble(a, d, v) { noise("lowpass", 90, 0.8, a, d, [[a, 0], [a + d * 0.25, v], [a + d, 0]]); },
      thunder(a, v) { noise("highpass", 1400, 0.6, a, 0.5, [[a, 0], [a + 0.01, v], [a + 0.35, 0]]); K.rumble(a + 0.05, 3, v * 1.2); },
      tone(f, a, d, v, type = "sine") { osc(type, f, a, d, [[a, 0], [a + d * 0.15, v], [a + d, 0]]); },
      bell(f, a, v) { [1, 2.0, 2.76, 5.4].forEach((m, i) => osc("sine", f * m, a, 3 - i * 0.5, [[a, 0], [a + 0.005, v / (i + 1)], [a + 3 - i * 0.5, 0]])); },
      chime(f, a, v) { osc("sine", f, a, 1.6, [[a, 0], [a + 0.005, v], [a + 1.6, 0]]); osc("sine", f * 3, a, 0.6, [[a, 0], [a + 0.005, v * 0.25], [a + 0.6, 0]]); },
      melody(notes, a, step, v, type = "triangle", len = 0.9) { notes.forEach((f, i) => { if (f) osc(type, f, a + i * step, step * len, [[a + i * step, 0], [a + i * step + 0.02, v], [a + i * step + step * len * 0.7, v * 0.6], [a + i * step + step * len, 0]]); }); },
      birds(a, n, v) { for (let i = 0; i < n; i++) { const tt = a + i * (0.25 + Math.random() * 0.6), f = 2600 + Math.random() * 1500; osc("sine", f, tt, 0.09, [[tt, 0], [tt + 0.01, v], [tt + 0.09, 0]], f * 1.35); osc("sine", f * 1.2, tt + 0.12, 0.07, [[tt + 0.12, 0], [tt + 0.13, v * 0.8], [tt + 0.19, 0]], f * 0.9); } },
      gull(a, v) { [0, 0.32, 0.6].forEach((o, i) => osc("sawtooth", 1300 - i * 80, a + o, 0.26, [[a + o, 0], [a + o + 0.03, v], [a + o + 0.26, 0]], 850, 2200)); },
      crowd(a, d, v, roarAt) { const pts = [[a, 0], [a + 0.6, v * 0.35]]; if (roarAt != null) pts.push([a + roarAt, v * 0.35], [a + roarAt + 0.3, v * 1.4], [a + roarAt + 2.5, v * 0.8]); pts.push([a + d - 0.3, v * 0.4], [a + d, 0]); noise("bandpass", 900, 0.6, a, d, pts); noise("bandpass", 2200, 1.2, a, d, pts.map(([x, y]) => [x, y * 0.4])); },
      whistle(a, v = 0.08) { for (let i = 0; i < 3; i++) { const tt = a + i * 0.18; osc("sine", 2900, tt, i === 2 ? 0.5 : 0.12, [[tt, 0], [tt + 0.01, v], [tt + (i === 2 ? 0.5 : 0.12), 0]], 2700); } },
      kick(a, v = 0.5) { osc("sine", 160, a, 0.15, [[a, 0], [a + 0.005, v], [a + 0.15, 0]], 60); noise("bandpass", 1200, 1, a, 0.06, [[a, 0], [a + 0.003, v * 0.6], [a + 0.06, 0]]); },
      engine(a, d, v, f = 85) { osc("sawtooth", f, a, d, [[a, 0], [a + d * 0.3, v], [a + d * 0.7, v], [a + d, 0]], f * 1.05, 500); osc("sawtooth", f * 1.51, a, d, [[a, 0], [a + d * 0.3, v * 0.5], [a + d, 0]], f * 1.5, 700); },
      firework(a, v) { osc("sine", 700, a - 0.6, 0.6, [[a - 0.6, 0], [a - 0.5, v * 0.25], [a, 0]], 2200); noise("highpass", 900, 0.6, a, 0.4, [[a, 0], [a + 0.005, v], [a + 0.3, 0]]); K.rumble(a, 1.4, v * 0.7); K.crackle(a + 0.3, 1.0, 25, v * 0.25); },
      hum(a, d, v) { osc("sawtooth", 50, a, d, [[a, 0], [a + 0.2, v], [a + d - 0.05, v], [a + d, 0]], 50, 300); osc("sine", 100, a, d, [[a, 0], [a + 0.2, v * 0.8], [a + d, 0]]); },
      zap(a, v) { K.crackle(a, 0.5, 60, v); osc("square", 120, a, 0.4, [[a, 0], [a + 0.01, v * 0.4], [a + 0.4, 0]], 40, 1500); },
      clop(a, d, rate, v) { for (let x = 0; x < d; x += 1 / rate) { const tt = a + x + (Math.floor(x * rate) % 2 ? 0.05 : 0); noise("bandpass", 1100 + Math.random() * 300, 6, tt, 0.06, [[tt, 0], [tt + 0.004, v], [tt + 0.05, 0]]); } },
      splash(a, v) { noise("bandpass", 1500, 0.5, a, 1.4, [[a, 0], [a + 0.03, v], [a + 1.3, 0]], [[a, 3000], [a + 1.3, 600]]); },
      beep(a, f = 660, v = 0.07) { osc("sine", f, a, 0.3, [[a, 0], [a + 0.01, v], [a + 0.25, v * 0.6], [a + 0.3, 0]]); },
      sparkle(a, d, v) { for (let i = 0; i < d * 10; i++) { const tt = a + i / 10 + Math.random() * 0.08; K.chime(1800 + Math.random() * 1600, tt, v); } },
    };
    return K;
  }
  const snd = (fn) => { const k = kit(); if (k) try { fn(k); } catch (x) { console.warn(x); } };

  // ------------------------------------------------------------------ registry and player
  const FACT = {};
  window.WXS = { add(name, fn) { FACT[name] = fn; } };
  let VIG = null;
  function vignette() {
    const v = document.createElement("canvas"); v.width = Math.max(1, Math.round(W / 4)); v.height = Math.max(1, Math.round(H / 4)); const c = v.getContext("2d");
    const g = c.createRadialGradient(v.width / 2, v.height / 2, Math.min(v.width, v.height) * 0.35, v.width / 2, v.height / 2, Math.hypot(v.width, v.height) * 0.6);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,10,.42)"); c.fillStyle = g; c.fillRect(0, 0, v.width, v.height); return v;
  }
  window.WX_STORY = {
    has: (name) => !!FACT[name],
    make(name, w, h) {
      W = w; H = h; VIG = vignette();
      const K = { W, H, rnd, clamp, ease, easeIO, back, lerp, TAU, sky, glow, stars, drawStars, ridge, hill, cloud, tree, pine, palm, person, city, drawCity, boltPath, bolt, car, lamp, rainLines, mix, E };
      const chs = FACT[name](K), F = assign(chs);
      const Dk = chs.map((c) => { const tm = timing(c.text || {}); return Math.max(c.D, tm.subAt + 1.2 + 2.6); });
      let S = {}, L = null, i = -1;
      return {
        n: chs.length,
        D: (k) => Dk[k],
        start(k) { i = k; S = {}; chs[k].init?.(S); L = layoutFact(F[k], chs[k]); S.y0 = L.y0; S.L = L; snd((e) => chs[k].sound?.(e, S)); },
        sound() { snd((e) => chs[i].sound?.(e, S)); },
        draw(c, t) {
          const ch = chs[i];
          c.save(); ch.draw(c, t, S, Dk[i]); c.restore();
          drawFact(c, t, L, ch, S);
          c.drawImage(VIG, 0, 0, W, H);
          const dk = 1 - clamp(t / 0.25); if (dk > 0) { c.fillStyle = `rgba(5,4,11,${dk * 0.3})`; c.fillRect(0, 0, W, H); }
        },
      };
    },
  };
})();
