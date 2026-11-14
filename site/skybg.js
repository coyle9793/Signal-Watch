// Live weather backdrop behind the whole page, matching the market weather (and the intro scenes).
// Kept faint and slow so the cards stay easy to read. Preview any of them with ?sky=hurricane | thunder | rain | windy | sunny | eclipse
(() => {
  const MOODS = { hurricane: ["🌀", "Hurricane"], thunder: ["⛈️", "Thunderstorm"], rain: ["🌧️", "Rain"], windy: ["🍃", "Breezy"], sunny: ["☀️", "Sunny"], eclipse: ["🌑", "Eclipse"] };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cv, c, W, H, dpr, mood, S, raf, t0;

  function cloudSprite(r, col) { // a soft cloud drawn once, reused every frame
    const o = document.createElement("canvas"); o.width = r * 4; o.height = r * 2.2; const x = o.getContext("2d");
    for (let i = 0; i < 9; i++) {
      const cx = r * (0.7 + Math.random() * 2.6), cy = r * (0.8 + Math.random() * 0.6), rr = r * rnd(0.45, 0.85);
      const g = x.createRadialGradient(cx, cy, 0, cx, cy, rr); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = g; x.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
    }
    return o;
  }
  const leafCols = ["#ff8a3d", "#ffb63d", "#e2552e", "#c9d24a"];

  function init() {
    S = { t: 0 };
    const k = Math.max(W, H) / 1400;
    S.clouds = Array.from({ length: { hurricane: 0, thunder: 9, rain: 8, windy: 7, sunny: 3, eclipse: 0 }[mood] }, (_, i) => ({
      x: Math.random(), y: rnd(-0.05, mood === "windy" ? 0.55 : 0.28), v: rnd(0.004, 0.012) * (mood === "windy" ? 2.2 : 1), sp: cloudSprite(rnd(80, 160) * k,
        { thunder: "rgba(130,95,220,.42)", rain: "rgba(110,145,215,.3)", windy: "rgba(190,200,255,.2)", sunny: "rgba(255,230,200,.12)" }[mood]),
    }));
    const nd = { hurricane: 260, thunder: 300, rain: 220 }[mood] || 0;
    S.drops = Array.from({ length: W < 700 ? nd / 2 : nd }, () => ({ x: Math.random(), y: Math.random(), l: rnd(12, 30), v: rnd(0.5, 1), z: Math.random() }));
    S.leaves = Array.from({ length: mood === "windy" ? 16 : mood === "hurricane" ? 22 : 0 }, () => ({ x: Math.random(), y: Math.random(), v: rnd(0.04, 0.09), rot: rnd(0, 6), spin: rnd(-2, 2), sz: rnd(4, 8), c: leafCols[Math.floor(rnd(0, 4))], ph: rnd(0, 6) }));
    S.glints = Array.from({ length: mood === "sunny" ? 50 : mood === "eclipse" ? 90 : 0 }, () => ({ x: Math.random(), y: Math.random(), ph: rnd(0, 6), s: rnd(0.6, 1.8), v: rnd(0.005, 0.02) }));
    S.stars = Array.from({ length: mood === "eclipse" ? 140 : 0 }, () => ({ x: Math.random(), y: Math.random() * 0.8, r: rnd(0.4, 1.3), ph: rnd(0, 6) }));
    S.gusts = Array.from({ length: mood === "windy" ? 8 : mood === "hurricane" ? 14 : 0 }, () => ({ y: Math.random(), d: Math.random(), l: rnd(120, 280), v: rnd(0.08, 0.16) }));
    S.flash = 0; S.bolt = null; S.next = 1.5;
  }
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
  }
  function bg(stops) { const g = c.createLinearGradient(0, 0, 0, H); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  function glow(x, y, r, col) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
  function rain(t, slant, alpha, speed) {
    c.lineWidth = 1; c.strokeStyle = `rgba(160,190,255,${alpha})`; c.beginPath();
    S.drops.forEach((d) => {
      const sp = (0.6 + d.z) * speed, y = ((d.y + t * d.v * sp) % 1) * (H + 60) - 30, x = (((d.x * W - y * slant) % W) + W) % W, l = d.l * (0.5 + d.z);
      c.moveTo(x, y); c.lineTo(x + l * slant, y + l);
    });
    c.stroke();
  }
  function clouds(t) { S.clouds.forEach((k) => { const w = k.sp.width, x = ((k.x + t * k.v) % 1.4 - 0.2) * W; c.drawImage(k.sp, x - w / 2, k.y * H); }); }
  function leaves(t, speed) {
    S.leaves.forEach((l) => {
      const x = ((l.x + t * l.v * speed) % 1.1 - 0.05) * W, y = ((l.y + Math.sin(t * 0.8 + l.ph) * 0.03 + t * 0.01) % 1) * H;
      c.save(); c.translate(x, y); c.rotate(l.rot + t * l.spin); c.globalAlpha = 0.8; c.fillStyle = l.c; c.beginPath(); c.ellipse(0, 0, l.sz, l.sz * 0.5, 0, 0, 7); c.fill(); c.restore();
    });
  }
  function gusts(t, a) {
    c.strokeStyle = `rgba(220,230,255,${a})`; c.lineWidth = 1.5; c.lineCap = "round";
    S.gusts.forEach((g) => { const x = ((g.d + t * g.v) % 1.4 - 0.2) * W, y = g.y * H; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + g.l * 0.3, y - 10, x + g.l * 0.7, y + 8, x + g.l, y - 3); c.stroke(); });
  }
  function bolt(x0) {
    const p = [[x0, -10]]; let x = x0, y = -10;
    while (y < H * 0.55) { x += rnd(-40, 40); y += rnd(25, 55); p.push([x, y]); }
    return p;
  }

  const DRAW = {
    sunny(t) {
      bg(["#120d24", "#0b0818", "#06050c"]);
      const sx = W * 0.86, sy = H * 0.04, R = Math.max(W, H) * 0.55;
      glow(sx, sy, R, "rgba(255,190,90,.34)"); glow(sx, sy, R * 0.25, "rgba(255,225,150,.45)");
      c.save(); c.translate(sx, sy); c.rotate(t * 0.02); c.fillStyle = "rgba(255,200,110,.08)";
      for (let i = 0; i < 14; i++) { c.rotate((Math.PI * 2) / 14); c.beginPath(); c.moveTo(0, 0); c.lineTo(R * 1.6, -R * 0.07); c.lineTo(R * 1.6, R * 0.07); c.fill(); }
      c.restore();
      clouds(t);
      S.glints.forEach((g) => { const y = ((g.y - t * g.v) % 1 + 1) % 1 * H, a = 0.5 + 0.45 * Math.sin(t * 2 + g.ph); c.fillStyle = `rgba(255,225,160,${a})`; c.beginPath(); c.arc(g.x * W, y, g.s * 1.4, 0, 7); c.fill(); });
      glow(W * 0.1, H * 1.05, H * 0.6, "rgba(255,120,180,.06)");
    },
    windy(t) {
      bg(["#0f1022", "#0b0a1a", "#06050c"]);
      glow(W * 0.8, H * 0.02, Math.max(W, H) * 0.35, "rgba(255,200,120,.08)");
      clouds(t); gusts(t, 0.22); leaves(t, 1);
    },
    rain(t) {
      bg(["#0a1226", "#070b18", "#04050c"]);
      clouds(t); rain(t, 0.12, 0.32, 0.35);
      glow(W * 0.5, H * 1.1, H * 0.5, "rgba(80,140,255,.07)");
    },
    thunder(t) {
      bg(["#0d0820", "#08061a", "#040309"]);
      if (t > S.next) { S.flash = 1; S.bolt = bolt(rnd(0.1, 0.9) * W); S.next = t + rnd(4, 9); }
      clouds(t);
      if (S.flash > 0) {
        c.globalCompositeOperation = "lighter"; c.globalAlpha = S.flash * 0.8; clouds(t); c.globalAlpha = 1; c.globalCompositeOperation = "source-over";
        c.fillStyle = `rgba(190,170,255,${S.flash * 0.18})`; c.fillRect(0, 0, W, H);
        if (S.flash > 0.55 && S.bolt) { c.strokeStyle = `rgba(230,220,255,${S.flash * 0.7})`; c.lineWidth = 2; c.beginPath(); S.bolt.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); }
        S.flash -= 0.035 * (Math.random() > 0.2 ? 1 : -0.5); if (S.flash < 0) S.flash = 0;
      }
      rain(t, 0.22, 0.34, 0.55);
    },
    hurricane(t) {
      bg(["#060a1a", "#050814", "#03040a"]);
      const cx = W * 0.08, cy = H * 0.06, Rm = Math.hypot(W, H) * 1.05;
      c.save(); c.translate(cx, cy); c.rotate(-t * 0.06); c.lineCap = "round";
      for (let arm = 0; arm < 4; arm++) {
        c.beginPath();
        for (let th = 0.4; th < 4 * Math.PI; th += 0.08) { const r = Rm * Math.pow(th / (4 * Math.PI), 1.1), a = -th + (arm * Math.PI) / 2; th < 0.45 ? c.moveTo(Math.cos(a) * r, Math.sin(a) * r) : c.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
        c.strokeStyle = `rgba(150,180,255,${0.15 - arm * 0.025})`; c.lineWidth = 60 - arm * 10; c.stroke();
      }
      c.restore();
      glow(cx, cy, 90, "rgba(0,0,0,.6)");
      rain(t, 0.6, 0.26, 0.8); gusts(t, 0.2); leaves(t, 2.5);
    },
    eclipse(t) {
      bg(["#0b0718", "#09061a", "#050310"]);
      S.stars.forEach((s) => { c.fillStyle = `rgba(255,255,255,${0.35 + 0.3 * Math.sin(t * 1.5 + s.ph)})`; c.beginPath(); c.arc(s.x * W, s.y * H, s.r, 0, 7); c.fill(); });
      const sx = W * 0.9, sy = H * 0.34, R = Math.min(W, H) * 0.08;
      glow(sx, sy, R * 7, "rgba(255,180,80,.18)");
      const co = c.createRadialGradient(sx, sy, R * 0.95, sx, sy, R * 2.6); co.addColorStop(0, "rgba(255,240,210,.7)"); co.addColorStop(0.3, "rgba(255,190,110,.25)"); co.addColorStop(1, "rgba(255,160,80,0)"); c.fillStyle = co; c.beginPath(); c.arc(sx, sy, R * 2.6, 0, 7); c.fill();
      c.fillStyle = "#05030c"; c.beginPath(); c.arc(sx, sy, R, 0, 7); c.fill();
      const pulse = 0.5 + 0.5 * Math.sin(t * 0.6), a = -0.7;
      glow(sx + Math.cos(a) * R, sy + Math.sin(a) * R, R * 1.2, `rgba(255,255,255,${0.35 * pulse})`);
      S.glints.forEach((g) => { const y = ((g.y - t * g.v) % 1 + 1) % 1 * H; c.fillStyle = `rgba(255,210,130,${0.5 + 0.4 * Math.sin(t * 2 + g.ph)})`; c.beginPath(); c.arc(g.x * W, y, g.s * 1.2, 0, 7); c.fill(); });
    },
  };

  function frame() {
    const t = (performance.now() - t0) / 1000;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); DRAW[mood](t);
    if (!still && !document.hidden) raf = requestAnimationFrame(frame); else if (!still) setTimeout(() => (raf = requestAnimationFrame(frame)), 1000);
  }

  window.startSky = function (m, preview) {
    cv = document.getElementById("sky"); if (!cv || !DRAW[m]) return;
    c = cv.getContext("2d"); mood = m; cancelAnimationFrame(raf);
    size(); init(); t0 = performance.now(); frame();
    document.body.dataset.sky = m;
    if (!window.__skyResize) { window.__skyResize = 1; addEventListener("resize", () => { size(); init(); }); }
    if (preview && !document.getElementById("sky-pick")) {
      const b = document.createElement("div"); b.id = "sky-pick"; b.className = "sky-pick";
      b.innerHTML = `<span>Background</span>${Object.entries(MOODS).map(([k, [i, n]]) => `<button data-sky="${k}">${i} ${n}</button>`).join("")}`;
      document.body.appendChild(b);
      b.onclick = (e) => { const k = e.target.closest("[data-sky]")?.dataset.sky; if (k) { window.startSky(k, true); history.replaceState(null, "", `?sky=${k}${location.hash}`); } };
    }
    document.querySelectorAll("#sky-pick [data-sky]").forEach((x) => x.classList.toggle("on", x.dataset.sky === m));
  };
})();
