// Storm plan: a "What if?" storm simulator and a shelter planner, built from how stocks and classic
// shelters actually moved during past storms caused by world events (data/scenarios.json).
// Education only ("what history shows"), never advice. Wars and conflicts are worded plainly.
(() => {
  let D = null, ev = null, ep = null, mix = new Set(), share = 0.2, chart = null;
  const SAMPLE = ["AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "BRK-B", "JPM", "LLY", "XOM"];
  const LIVE = { conflict: "war", sanctions: "trade", unrest: "election" };
  const umb = (n) => (n ? "☂".repeat(n) + `<span class="um-off">${"☂".repeat(3 - n)}</span>` : `<span class="um-leak">leaky</span>`);
  const pp = (x, d = 1) => (x == null ? "–" : `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(d)}%`);
  const cl = (x) => (x >= 0 ? "up" : "down");
  const evName = (k) => D.events.find((e) => e.key === k);
  const eps = (k) => D.episodes.filter((e) => e.event === k);

  function portfolio() {
    const w = WATCH.list().filter((t) => STOCKS.some((s) => s.ticker === t));
    return w.length ? { list: w, mine: true } : { list: SAMPLE.filter((t) => STOCKS.some((s) => s.ticker === t)), mine: false };
  }
  // equal amounts in each stock: the portfolio path is the average of the stocks' paths
  function pathOf(e, list) {
    const got = list.filter((t) => e.paths[t]); if (!got.length) return null;
    return e.days.map((_, i) => got.reduce((s, t) => s + e.paths[t][i], 0) / got.length);
  }
  function shelterPath(e) {
    const got = [...mix].filter((t) => e.paths[t]); if (!got.length) return e.days.map(() => 0);
    return e.days.map((_, i) => got.reduce((s, t) => s + e.paths[t][i], 0) / got.length);
  }
  const blend = (a, b, k) => a.map((x, i) => x * (1 - k) + b[i] * k);

  function liveOptions() {
    const out = [];
    (WORLD?.ev?.events || []).slice(0, 6).forEach((e) => { const k = LIVE[e.kind]; if (k && !out.some((o) => o.k === k)) out.push({ k, label: window.plainEvent ? window.plainEvent(e) : e.title }); });
    return out.slice(0, 2);
  }

  window.renderPlan = function () {
    const box = $("#plan-body"); if (!box || !window.DATA_READY || !STOCKS.length) return;
    if (!D) { box.innerHTML = `<p class="meta">Loading past storms…</p>`; return; }
    if (!D.episodes?.length) { box.innerHTML = `<p class="meta">The storm history isn't available right now. It's rebuilt with each data update.</p>`; return; }
    const live = liveOptions();
    if (!ev) ev = live[0]?.k || "war";
    const P = portfolio(), E = eps(ev), info = evName(ev);
    // ------------------------------------------------ 1. simulator
    const rows = P.list.map((t) => {
      const r = E.filter((e) => e.paths[t]).map((e) => ({ e, v: e.paths[t].at(-1) }));
      if (!r.length) return null;
      const avg = r.reduce((s, x) => s + x.v, 0) / r.length, worst = r.reduce((a, b) => (b.v < a.v ? b : a));
      return { t, avg, worst, n: r.length };
    }).filter(Boolean).sort((a, b) => a.avg - b.avg);
    const pr = E.map((e) => ({ e, v: pathOf(e, P.list)?.at(-1) })).filter((x) => x.v != null);
    const pAvg = pr.reduce((s, x) => s + x.v, 0) / (pr.length || 1), pWorst = pr.reduce((a, b) => (b.v < a.v ? b : a), pr[0]);
    const mAvg = E.reduce((s, e) => s + e.market, 0) / E.length;
    const back = E.map((e) => e.market_back_days).filter((x) => x != null).sort((a, b) => a - b), backMed = back.length ? back[Math.floor(back.length / 2)] : null;
    const maxAbs = Math.max(0.05, ...rows.map((r) => Math.max(Math.abs(r.avg), Math.abs(r.worst.v))));
    if (!ep || ep.event !== ev) ep = pWorst?.e || E[0];
    // ------------------------------------------------ 2. shelters
    const R = Object.fromEntries(Object.entries(D.ratings[ev] || {}).map(([t, r]) => {
      let u = r.hit >= 0.75 && r.excess >= 0.03 ? 3 : r.hit >= 0.6 && r.excess > 0.005 ? 2 : r.hit >= 0.5 && r.excess > 0 ? 1 : 0;
      if (r.n < 3) u = Math.min(u, 2); // too few examples to be sure
      return [t, { ...r, umbrellas: u }];
    }));
    const sh = Object.entries(D.shelters).map(([t, s]) => ({ t, ...s, r: R[t] })).filter((s) => s.r).sort((a, b) => b.r.umbrellas - a.r.umbrellas || b.r.excess - a.r.excess);
    if (!mix.size || [...mix].some((t) => !R[t])) { mix = new Set(sh.filter((s) => s.r.umbrellas >= 2).slice(0, 2).map((s) => s.t)); if (!mix.size && sh[0]) mix.add(sh[0].t); }
    const withAll = E.map((e) => { const a = pathOf(e, P.list); return a ? { e, a: a.at(-1), b: blend(a, shelterPath(e), share).at(-1) } : null; }).filter(Boolean);
    const avgA = withAll.reduce((s, x) => s + x.a, 0) / (withAll.length || 1), avgB = withAll.reduce((s, x) => s + x.b, 0) / (withAll.length || 1);
    const mixNames = [...mix].map((t) => D.shelters[t].name).join(" + ") || "shelter";

    box.innerHTML = `
      <div class="pl-pick"><span class="pl-q">Pick a storm</span>
        ${live.map((o) => `<button class="pl-chip live ${o.k === ev ? "on" : ""}" data-ev="${o.k}" title="Based on today's world news"><i>LIVE</i> ${esc(o.label)}</button>`).join("")}
        ${D.events.map((e) => `<button class="pl-chip ${e.key === ev && !live.some((o) => o.k === ev) ? "on" : ""}" data-ev="${e.key}">${e.icon} ${esc(e.name)}</button>`).join("")}
      </div>
      <p class="pl-about">${info.icon} <b>${esc(info.name)}.</b> ${esc(info.about)} We found <b>${E.length}</b> past ${E.length === 1 ? "example" : "examples"}${E.length < 3 ? ", so treat this as a rough guide" : ""}.${mAvg > 0 ? " <b>In these examples the market actually rose on average</b>, so sheltering usually cost money." : ""}</p>

      <div class="pl-grid">
        <section class="tcard pl-sim">
          <div class="tlabel">1 · What if? <span class="ex" data-ex="simulator">Storm simulator</span></div>
          <p class="pl-big">In past storms like this, ${P.mine ? "your watchlist" : "a sample of 10 big companies"} moved <b class="${cl(pAvg)}">${pp(pAvg)}</b> on average.</p>
          <p class="meta">Worst case: <b class="${cl(pWorst?.v)}">${pp(pWorst?.v)}</b> during ${esc(pWorst?.e.name || "")}. The whole market moved ${pp(mAvg)} on average.${backMed != null ? ` Afterwards the market got back to where it started in a median of <b>${backMed}</b> trading days.` : ""}</p>
          ${P.mine ? "" : `<p class="pl-note">Add stocks to your ${EX.ex("watch", "watchlist")} (tap ☆) to test your own.</p>`}
          <div class="pl-bars">${rows.map((r) => `<div class="pl-bar" title="${esc(r.t)}: average ${pp(r.avg)}, worst ${pp(r.worst.v)} (${esc(r.worst.e.name)})">
              <b class="tk">${esc(r.t)}</b><span class="track"><i class="zero"></i><em class="${cl(r.avg)}" style="${r.avg < 0 ? `right:50%;width:${(Math.abs(r.avg) / maxAbs) * 50}%` : `left:50%;width:${(r.avg / maxAbs) * 50}%`}"></em><u style="left:${50 + (r.worst.v / maxAbs) * 50}%"></u></span>
              <span class="${cl(r.avg)}">${pp(r.avg)}</span></div>`).join("")}</div>
          <p class="meta pl-key"><span class="k-bar"></span> average across past storms <span class="k-tick"></span> worst one</p>
          <details class="pl-eps"><summary>The ${E.length} past storms we used</summary><ul>${E.map((e) => `<li><b>${esc(e.name)}</b>: market ${pp(e.market)} over ${e.days.length} trading days${e.market_back_days != null ? `, back to its start ${e.market_back_days} days later` : ""}.</li>`).join("")}</ul></details>
        </section>

        <section class="tcard pl-shel">
          <div class="tlabel">2 · <span class="ex" data-ex="shelter-plan">Shelter planner</span></div>
          <p class="meta">Places money has gone in this kind of storm. <span class="ex" data-ex="umbrella">Umbrellas</span> show how reliably each one beat the market in the past examples. Tap to add it to your shelter mix.</p>
          <div class="pl-shelters">${sh.map((s) => `<button class="pl-sh ${mix.has(s.t) ? "on" : ""}" data-sh="${s.t}">
              <span class="ic">${s.icon}</span><span class="nm"><b>${esc(s.name)}</b><small>beat the market in ${Math.round(s.r.hit * s.r.n)} of ${s.r.n} · avg ${pp(s.r.avg)}</small></span><span class="um">${umb(s.r.umbrellas)}</span>
              <span class="catch">The catch: ${esc(s.catch)}</span></button>`).join("")}</div>
          <label class="pl-slider"><span>Move <b id="pl-share">${Math.round(share * 100)}%</b> of ${P.mine ? "your watchlist" : "the sample"} into ${esc(mixNames)}</span>
            <input type="range" id="pl-range" min="0" max="30" step="5" value="${Math.round(share * 100)}"></label>
          <div class="pl-replay"><label>Replay <select id="pl-ep">${E.map((e) => `<option value="${e.id}" ${e === ep ? "selected" : ""}>${esc(e.name)}</option>`).join("")}</select></label></div>
          <div class="chartbox pl-chart"><canvas id="pl-canvas"></canvas></div>
          <p class="pl-result" id="pl-result"></p>
          <p class="meta">Across all ${withAll.length} past examples: <b class="${cl(avgA)}">${pp(avgA)}</b> without shelter, <b class="${cl(avgB)}">${pp(avgB)}</b> with ${Math.round(share * 100)}% in shelter.</p>
        </section>

        <section class="tcard pl-clear" id="pl-clear"></section>
      </div>
      <p class="meta pl-fine">This is what history shows, for learning only. Past storms never repeat exactly, shelters can fall too, and moving money has costs and taxes. It assumes equal amounts in each stock. Not financial advice.</p>`;

    box.querySelectorAll("[data-ev]").forEach((b) => (b.onclick = () => { ev = b.dataset.ev; mix = new Set(); window.renderPlan(); }));
    box.querySelectorAll("[data-sh]").forEach((b) => (b.onclick = () => { const t = b.dataset.sh; mix.has(t) ? mix.delete(t) : mix.add(t); window.renderPlan(); }));
    $("#pl-range").oninput = (e) => { share = +e.target.value / 100; $("#pl-share").textContent = `${e.target.value}%`; drawReplay(P); };
    $("#pl-range").onchange = () => window.renderPlan();
    $("#pl-ep").onchange = (e) => { ep = D.episodes.find((x) => x.id === e.target.value); drawReplay(P); };
    drawReplay(P); renderClear(E, backMed, P);
  };

  function drawReplay(P) {
    const a = pathOf(ep, P.list); if (!a) return;
    const b = blend(a, shelterPath(ep), share), m = ep.paths.SPY;
    const res = $("#pl-result");
    const saved = a.at(-1) - b.at(-1);
    res.innerHTML = `${esc(ep.name)}: ${P.mine ? "your watchlist" : "the sample"} would have gone <b class="${cl(a.at(-1))}">${pp(a.at(-1))}</b>${share ? `, or <b class="${cl(b.at(-1))}">${pp(b.at(-1))}</b> with ${Math.round(share * 100)}% in shelter` : ""}. ${share && Math.abs(saved) >= 0.001 ? (saved < 0 ? `Shelter softened the fall by <b class="up">${(Math.abs(saved) * 100).toFixed(1)} points</b>.` : `This time shelter would have <b class="down">cost ${(saved * 100).toFixed(1)} points</b>. Shelters don't always work.`) : ""}`;
    const cfg = {
      type: "line",
      data: { labels: ep.days.map((d) => d.slice(5)), datasets: [
        { label: "Without shelter", data: a.map((x) => x * 100), borderColor: "#ff5c8a", backgroundColor: "rgba(255,92,138,.12)", fill: "origin", tension: 0.25, pointRadius: 0, borderWidth: 2.5 },
        { label: `With ${Math.round(share * 100)}% shelter`, data: b.map((x) => x * 100), borderColor: "#2ef2ff", tension: 0.25, pointRadius: 0, borderWidth: 2.5 },
        { label: "Whole market", data: m.map((x) => x * 100), borderColor: "rgba(165,159,201,.7)", borderDash: [5, 5], tension: 0.25, pointRadius: 0, borderWidth: 1.5 },
      ] },
      options: { responsive: true, maintainAspectRatio: false, animation: { duration: 300 }, interaction: { mode: "index", intersect: false },
        plugins: { legend: { labels: { color: "#cfc9ea", boxWidth: 14, font: { size: 11 } } }, tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${c.parsed.y >= 0 ? "+" : ""}${c.parsed.y.toFixed(1)}%` } } },
        scales: { x: { ticks: { color: "#a59fc9", maxTicksLimit: 7 }, grid: { color: "rgba(42,35,80,.5)" } }, y: { ticks: { color: "#a59fc9", callback: (v) => `${v}%` }, grid: { color: "rgba(42,35,80,.5)" } } } },
    };
    if (chart && chart.canvas === $("#pl-canvas")) { chart.data = cfg.data; chart.update(); } else { chart?.destroy(); chart = new Chart($("#pl-canvas"), cfg); }
  }

  // "Skies clearing": three simple checks for when people have historically moved back out of shelter
  function renderClear(E, backMed, P) {
    const spy = window.SPY || {}, today = STOCKS[0]?.date || "";
    const recent = (d) => today && (new Date(today) - new Date(d)) / 864e5 <= 7;
    const radar = window.RADAR_NOW || [];
    const reds = radar.filter((r) => r.lv === 0 && (!P.mine || WATCH.has(r.s.ticker))).length;
    const drops = (SH?.shocks || []).filter((x) => x.ret < 0 && isMajor(x) && recent(x.date)).length;
    const checks = [
      [spy.price && spy.sma50 && spy.price > spy.sma50, `The market is ${spy.price > spy.sma50 ? "above" : "below"} its ${EX.ex("sma50", "50-day average")}`],
      [reds === 0, reds ? `${reds} red ${reds === 1 ? "warning" : "warnings"} ${P.mine ? "on your watchlist" : "in the S&P 100"}` : `No red warnings ${P.mine ? "on your watchlist" : "in the S&P 100"}`],
      [drops === 0, drops ? `${drops} big unexplained ${drops === 1 ? "drop" : "drops"} in the last week` : "No big unexplained drops in the last week"],
    ];
    const ok = checks.filter((c) => c[0]).length;
    const st = ok === 3 ? ["☀️", "Skies clearing", "clear", "All three checks pass. Historically this is when people start moving back out of shelter, a little at a time."]
      : ok === 2 ? ["🌤️", "Brightening", "bright", "Most checks pass. People often wait for the last one before leaving shelter."]
      : ["⛈️", "Still stormy", "storm", "Most checks are still failing. Historically, shelters have mattered most in weather like this."];
    $("#pl-clear").innerHTML = `<div class="tlabel">3 · When to come out</div>
      <div class="pl-sky ${st[2]}"><span class="big">${st[0]}</span><div><b>${st[1]}</b><p class="meta">${st[3]}</p></div></div>
      <ul class="pl-checks">${checks.map(([o, t]) => `<li class="${o ? "ok" : "no"}">${o ? "✓" : "✕"} ${t}</li>`).join("")}</ul>
      ${backMed != null ? `<p class="meta">After past ${esc(evName(ev).name.toLowerCase())} storms, the market took a median of <b>${backMed}</b> trading days (about ${Math.max(1, Math.round(backMed / 21))} ${Math.round(backMed / 21) > 1 ? "months" : "month"}) to get back to where it started.</p>` : ""}`;
  }

  fetch("data/scenarios.json").then((r) => r.json()).catch(() => ({ episodes: [] })).then((d) => { D = d; window.renderPlan(); });
  document.addEventListener("watch", () => window.renderPlan?.());
})();
