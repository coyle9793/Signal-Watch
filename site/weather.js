// Market weather: an animated background that shows how the market is doing today.
// sunny = good day, cloudy = mixed, rainy = not great, stormy = bad.
// Try any of them with ?weather=sunny | cloudy | rainy | stormy
(function () {
  const MOODS = {
    sunny: { icon: "☀️", label: "Sunny", sky: ["#1b2a3f", "#0d1117"] },
    cloudy: { icon: "⛅", label: "Mixed", sky: ["#1a2029", "#0d1117"] },
    rainy: { icon: "🌧️", label: "Rainy", sky: ["#141b26", "#0b0f14"] },
    stormy: { icon: "⛈️", label: "Stormy", sky: ["#120f1c", "#08090d"] },
  };

  function pickMood(spy, breadth) {
    // spy = S&P 500 daily move (0.01 = 1%), breadth = share of the 100 stocks that rose
    const score = spy * 100 + (breadth - 0.5) * 2;
    if (spy <= -0.015 || score <= -1.6) return "stormy";
    if (score <= -0.4) return "rainy";
    if (score < 0.5) return "cloudy";
    return "sunny";
  }

  window.startWeather = function (spy, breadth, upN, total) {
    const forced = new URLSearchParams(location.search).get("weather");
    const mood = MOODS[forced] ? forced : pickMood(spy ?? 0, breadth ?? 0.5);
    const m = MOODS[mood];
    const badge = document.getElementById("weather");
    if (badge) {
      badge.hidden = false;
      badge.className = `weather ${mood}`;
      badge.title = "Market weather: based on today's S&P 500 move and how many of the 100 stocks rose";
      badge.innerHTML = `<span class="wi">${m.icon}</span> ${m.label} market <span class="meta">${spy != null ? `${spy >= 0 ? "+" : ""}${(spy * 100).toFixed(2)}%` : ""}${upN != null ? ` · ${upN}/${total} up` : ""}</span>`;
    }
    const cv = document.getElementById("sky");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W, H, dpr;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr;
      cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px";
    }
    size(); addEventListener("resize", size);
    const rnd = (a, b) => a + Math.random() * (b - a);
    const nClouds = { sunny: 2, cloudy: 6, rainy: 8, stormy: 10 }[mood];
    const clouds = Array.from({ length: nClouds }, () => ({ x: rnd(0, 1), y: rnd(0.02, 0.35), s: rnd(0.6, 1.4), v: rnd(0.00003, 0.0001) }));
    const nDrops = { sunny: 0, cloudy: 0, rainy: 140, stormy: 320 }[mood];
    const drops = Array.from({ length: nDrops }, () => ({ x: rnd(0, 1), y: rnd(0, 1), l: rnd(0.015, 0.035), v: rnd(0.008, 0.016) }));
    let flash = 0, t = 0;

    function cloud(x, y, s, shade) {
      const r = 60 * s * dpr;
      ctx.fillStyle = shade;
      [[0, 0, 1], [0.9, -0.25, 0.8], [1.7, 0.05, 0.9], [0.8, 0.25, 0.9], [-0.8, 0.15, 0.75]].forEach(([dx, dy, k]) => {
        ctx.beginPath(); ctx.arc(x + dx * r, y + dy * r, r * k, 0, 7); ctx.fill();
      });
    }

    function frame() {
      t++;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, m.sky[0]); g.addColorStop(1, m.sky[1]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      if (mood === "sunny" || mood === "cloudy") {
        const sx = W * 0.85, sy = H * 0.12, R = Math.min(W, H) * (mood === "sunny" ? 0.5 : 0.3);
        const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, R);
        sun.addColorStop(0, mood === "sunny" ? "rgba(255,200,90,0.35)" : "rgba(255,200,90,0.16)");
        sun.addColorStop(0.25, "rgba(255,170,60,0.12)"); sun.addColorStop(1, "rgba(255,170,60,0)");
        ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H);
        if (mood === "sunny") {
          ctx.save(); ctx.translate(sx, sy); ctx.rotate(t * 0.0008);
          for (let i = 0; i < 12; i++) {
            ctx.rotate(Math.PI / 6);
            ctx.fillStyle = "rgba(255,210,120,0.045)";
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R * 1.6, -R * 0.08); ctx.lineTo(R * 1.6, R * 0.08); ctx.fill();
          }
          ctx.restore();
        }
      }
      const shade = { sunny: "rgba(200,215,235,0.05)", cloudy: "rgba(170,185,205,0.07)", rainy: "rgba(120,135,155,0.10)", stormy: "rgba(90,90,115,0.14)" }[mood];
      clouds.forEach((c) => { c.x += c.v; if (c.x > 1.2) c.x = -0.2; cloud(c.x * W, c.y * H, c.s, shade); });
      if (nDrops) {
        ctx.strokeStyle = mood === "stormy" ? "rgba(170,190,230,0.22)" : "rgba(150,180,220,0.18)";
        ctx.lineWidth = dpr;
        ctx.beginPath();
        drops.forEach((d) => {
          d.y += d.v; d.x -= d.v * (mood === "stormy" ? 0.35 : 0.15);
          if (d.y > 1) { d.y = -0.05; d.x = rnd(0, 1.2); }
          ctx.moveTo(d.x * W, d.y * H);
          ctx.lineTo((d.x - d.l * 0.3) * W, (d.y + d.l) * H);
        });
        ctx.stroke();
      }
      if (mood === "stormy") {
        if (flash <= 0 && Math.random() < 0.004) flash = 14;
        if (flash > 0) {
          ctx.fillStyle = `rgba(200,210,255,${0.012 * flash})`; ctx.fillRect(0, 0, W, H);
          if (flash > 10) {
            ctx.strokeStyle = "rgba(220,225,255,0.5)"; ctx.lineWidth = 2 * dpr; ctx.beginPath();
            let x = rnd(0.2, 0.8) * W, y = 0; ctx.moveTo(x, y);
            while (y < H * 0.45) { x += rnd(-30, 30) * dpr; y += rnd(20, 45) * dpr; ctx.lineTo(x, y); }
            ctx.stroke();
          }
          flash--;
        }
      }
      if (!still) requestAnimationFrame(frame);
    }
    frame();
  };
})();
