// Storm watch: spot danger (radar), know your exposure, prepare (what usually happens next + a storm plan)
// and look for the rainbow (bounce candidates, shelter sectors, insiders buying the dip).
// Uses the data app.js already loaded, plus data/storms.json. World events are worded plainly.
(() => {
  // Rough guide from public company reports: which big themes each company leans on.
  const THEMES = {
    "Chips made in Taiwan": ["AAPL", "NVDA", "AMD", "QCOM", "AVGO"],
    "Big sales in China": ["AAPL", "TSLA", "NKE", "SBUX", "QCOM", "NVDA", "AMD", "AVGO", "TXN", "INTC", "BA", "CAT", "GM"],
    "The AI boom": ["NVDA", "AMD", "AVGO", "MSFT", "GOOGL", "GOOG", "META", "AMZN", "ORCL", "PLTR", "NOW", "CRM", "ADBE", "IBM", "ACN", "INTC"],
    "Oil prices": ["XOM", "CVX", "COP", "UPS", "FDX"],
    "Interest rates": ["JPM", "BAC", "WFC", "C", "GS", "MS", "SCHW", "USB", "COF", "AXP", "BK", "BLK", "MET", "AIG", "SPG", "AMT", "NEE", "DUK", "SO"],
    "Shoppers' spending": ["AMZN", "WMT", "COST", "HD", "LOW", "TGT", "MCD", "SBUX", "NKE", "BKNG", "DIS", "TSLA", "GM", "F", "MA", "V", "AXP", "PYPL"],
    "Defence spending": ["LMT", "RTX", "GD", "BA", "GE", "HON"],
    "Health policy & drug prices": ["LLY", "JNJ", "MRK", "PFE", "ABBV", "BMY", "AMGN", "GILD", "UNH", "CVS", "TMO", "DHR", "ABT", "MDT", "ISRG"],
  };
  const PLACES = { "Taiwan": THEMES["Chips made in Taiwan"], "China": THEMES["Big sales in China"] };
  const COUNTRY_THEME = { TWN: "Taiwan", CHN: "China" };
  const LV = [["red", "Red warning", "⛈️"], ["amber", "Amber warning", "🌧️"], ["yellow", "Yellow warning", "🌦️"], ["clear", "Clear", "☀️"]];
  const lvOf = (s) => (s >= 6 ? 0 : s >= 4 ? 1 : s >= 2 ? 2 : 3);
  let STORMS = null, RADAR = [];

  const KINDTXT = { conflict: "Armed conflict involving", sanctions: "Tension between", unrest: "Unrest involving", cooperation: "Talks between" };
  const the = (n) => (/^(United|Netherlands|Philippines|Czech|Democratic|Central African|Gambia|Bahamas)/.test(n) ? "the " + n : n);
  const plain = (e) => `${KINDTXT[e.kind] || "Events involving"} ${e.title.split(":")[0].split(" & ").map(the).join(" and ")}`;
  window.plainEvent = plain;

  // ---------------------------------------------------------------- 1. radar
  function radar() {
    const spy = window.SPY || {};
    const evs = (WORLD?.ev.events || []).slice(0, 5);
    return STOCKS.map((s) => {
      let score = 0; const why = [];
      const add = (p, t, k) => { score += p; why.push({ p, t, k }); };
      const g = INS?.signals?.[s.ticker] || {};
      if (g.insider_sellers >= 3 && !g.insider_buyers) add(2, `${g.insider_sellers} insiders sold and none bought`, "cluster");
      if (g.unplanned_sell_value >= 5e6) add(1, `${money(g.unplanned_sell_value)} of unplanned insider selling`, "unplanned");
      const sh = (SH?.shocks || []).filter((x) => x.ticker === s.ticker && x.ret < 0 && x.abnormal < 0);
      if (sh.length) {
        const x = sh[0];
        if (!x.explained && x.news_checked) add(isMajor(x) ? 3 : 2, `Unexplained ${x.kind.toLowerCase()} on ${x.date} (${pct(x.ret)})`, "shock");
        else add(1, `${x.kind} on ${x.date} (${pct(x.ret)}), with news behind it`, "shock");
      }
      const ev = evs.find((e) => e.tickers.includes(s.ticker));
      if (ev) add(ev.kind === "conflict" ? 1.5 : 1, `Sensitive to: ${plain(ev)}`, "worldrisk");
      if (s.volatility_1y > 0.4) add(1, `Swings a lot: ${(s.volatility_1y * 100).toFixed(0)}% a year`, "volatility");
      if (s.vol_ratio >= 2 && s.chg_1d < 0) add(1, `Falling on ${s.vol_ratio.toFixed(1)}× normal volume`, "vol_ratio");
      if (s.sma200 && s.price < s.sma200) add(1, "Below its 200-day average (downtrend)", "sma200");
      const rel = (s.chg_1m ?? 0) - (spy.chg_1m ?? 0);
      if (rel <= -0.10) add(1, `Fell ${(-rel * 100).toFixed(0)} points behind the market this month`, "vsmarket");
      return { s, score: Math.round(score * 10) / 10, why: why.sort((a, b) => b.p - a.p), lv: lvOf(score) };
    }).sort((a, b) => b.score - a.score);
  }
  const lvBadge = (i) => `<span class="lvb lv-${LV[i][0]} ex" data-ex="lv-${LV[i][0]}">${LV[i][2]} ${LV[i][1]}</span>`;

  // ---------------------------------------------------------------- 3. prepare
  function next(s) {
    const st = STORMS?.stocks?.[s.ticker]; const out = [];
    if (st?.storms_5y) out.push(`${EX.ex("storm", "Storms")} like this (10%+ below its 3-month high) happened <b>${st.storms_5y}</b> times in 5 years. On average it fell another <b class="down">${pct(st.avg_extra_drop)}</b> before the bottom.`);
    if (st?.median_recovery_days) out.push(`It got back to its old high ${Math.round(st.recovered_share * 100)}% of the time, typically after <b>${st.median_recovery_days}</b> ${EX.ex("recovery", "trading days")} (about ${Math.max(1, Math.round(st.median_recovery_days / 21))} month${st.median_recovery_days >= 32 ? "s" : ""}).`);
    if (s.big_drops_5y) out.push(`After its ${s.big_drops_5y} one-day drops of 5%+, it was higher a month later <b>${Math.round(s.rebound_rate_after_big_drop * 100)}%</b> of the time.`);
    if (st?.vs_market_after_bad_days != null) out.push(`On the market's worst days, it then did <b class="${cls(st.vs_market_after_bad_days)}">${pct(st.vs_market_after_bad_days)}</b> ${EX.ex("vsmarket", "vs the market")} over the next month.`);
    return out;
  }
  const PLAN = [
    [`Have a plan before the next drop. Decide your ${EX.ex("stoploss", "stop-loss")} level now, while you're calm.`, `If it's a big part of what you own, think about ${EX.ex("trim", "trimming")} so one stock can't sink you.`, `Re-read why you bought it. If the reason has changed, that matters more than the price.`],
    [`Check how much of your money is in this one stock and its ${EX.ex("sector", "sector")}. ${EX.ex("diversify", "Diversifying")} spreads the risk.`, `Write down the price where you'd sell (a mental ${EX.ex("stoploss", "stop-loss")}).`, `Don't add more just because it's cheaper, unless the reason you own it still holds.`],
    [`Keep an eye on it. Set an alert or add it to your ${EX.ex("watch", "watchlist")}.`, `No action needed yet. Yellow means “be aware”, not “sell”.`],
  ];

  // ---------------------------------------------------------------- render: Storm tab
  window.renderStorm = function () {
    if (!window.DATA_READY || !STORMS) return;
    RADAR = radar();
    const counts = [0, 0, 0, 0]; RADAR.forEach((r) => counts[r.lv]++);
    const mood = counts[0] >= 5 ? LV[0] : counts[0] + counts[1] >= 8 ? LV[1] : counts[0] + counts[1] + counts[2] >= 15 ? LV[2] : LV[3];
    $("#st-kpis").innerHTML = `<div class="stormcast lv-${mood[0]}"><span class="big">${mood[2]}</span><div><div class="l">Today's storm forecast</div><div class="v">${mood[0] === "clear" ? "Mostly clear" : mood[1].replace(" warning", " skies")}</div></div></div>` +
      LV.slice(0, 3).map((l, i) => `<div class="kpi lvk lv-${l[0]}"><div class="l"><span class="ex" data-ex="lv-${l[0]}">${l[1]}s</span></div><div class="v">${counts[i]} <span class="meta" style="font-size:12px">stocks</span></div></div>`).join("");

    const ts = $("#t-storm");
    if (ts) { const hot = RADAR.filter((r) => r.lv <= 1).slice(0, 5);
      ts.innerHTML = `<div class="tlabel">${EX.ex("radar", "Storm radar")}</div><p>${mood[2]} <b>${mood[0] === "clear" ? "Mostly clear" : mood[1].replace(" warning", " skies")}</b> · ${counts[0]} red, ${counts[1]} amber and ${counts[2]} yellow warnings.</p>` +
        `<div class="wgrid">${hot.map((r) => `<div class="mini" data-open="${esc(r.s.ticker)}">${star(r.s.ticker)}${lvBadge(r.lv)}<b class="tk">${esc(r.s.ticker)}</b><span class="n">${esc(r.why[0]?.t || "")}</span></div>`).join("")}</div><button class="more" data-go="storm">See the storm plan →</button>`; }

    // sector radar
    const sec = {};
    RADAR.forEach((r) => (sec[r.s.sector] ||= []).push(r));
    $("#st-sectors").innerHTML = Object.entries(sec).map(([k, rs]) => {
      const avg = rs.reduce((a, r) => a + r.score, 0) / rs.length, hot = rs.filter((r) => r.lv <= 1).length;
      const lv = lvOf(avg + (hot >= 3 ? 2 : hot ? 1 : 0));
      return { k, avg, hot, lv, n: rs.length };
    }).sort((a, b) => a.lv - b.lv || b.avg - a.avg).map((x) => `<div class="secr lv-${LV[x.lv][0]}"><span class="dotl"></span><b>${esc(x.k)}</b><span class="meta">${x.hot ? `${x.hot} of ${x.n} on amber or red` : `${x.n} stocks, calm`}</span><span class="secs">${LV[x.lv][2]}</span></div>`).join("");

    // warnings
    const only = $("#st-w").checked;
    const list = RADAR.filter((r) => r.lv <= 2 && (!only || WATCH.has(r.s.ticker)));
    $("#st-list").innerHTML = list.slice(0, only ? 99 : 24).map((r) => `<div class="card stormcard lv-${LV[r.lv][0]}">
      <h3>${star(r.s.ticker)} ${lvBadge(r.lv)} <span class="tk" style="font-size:16px">${esc(r.s.ticker)}</span> <span class="meta">${esc(r.s.name)}</span></h3>
      <div class="row"><span>$${r.s.price.toFixed(2)} <span class="${cls(r.s.chg_1d)}">${pct(r.s.chg_1d, 2)}</span> · 1 month <span class="${cls(r.s.chg_1m)}">${pct(r.s.chg_1m)}</span></span><span class="sc">${EX.ex("radar", "storm score")} ${r.score}</span></div>
      <div class="smeter"><b style="width:${Math.min(100, r.score * 10)}%"></b></div>
      <ul class="reasons">${r.why.map((w) => `<li><span class="p down">+${w.p}</span><span><span class="ex rf" data-ex="${w.k}">${({ cluster: "Insiders", unplanned: "Insiders", shock: "Shock", worldrisk: "World", volatility: "Swings", vol_ratio: "Volume", sma200: "Trend", vsmarket: "Month" })[w.k]}</span> ${esc(w.t)}</span></li>`).join("")}</ul>
      <details class="prep"><summary>What usually happens next, and a storm plan</summary>
        <ul class="facts">${next(r.s).map((x) => `<li>${x}</li>`).join("")}</ul>
        <p class="planh">Storm plan (${LV[r.lv][1].toLowerCase()})</p><ul class="facts">${PLAN[r.lv].map((x) => `<li>${x}</li>`).join("")}</ul>
        <p class="meta">Ideas to think about, not advice. History is a guide, not a promise.</p></details>
    </div>`).join("") || `<div class="placeholder">${only ? "Nothing on your watchlist is under a warning. ☀️" : "No warnings today. ☀️"}</div>`;

    // rainbow watch
    const spy = window.SPY || {};
    const bounce = STOCKS.map((s) => ({ s, rel: (s.chg_1m ?? 0) - (spy.chg_1m ?? 0), r: RADAR.find((x) => x.s === s) }))
      .filter((x) => x.rel <= -0.07 && (x.s.rebound_rate_after_big_drop ?? 0) >= 0.55 && x.r.lv >= 1)
      .sort((a, b) => a.rel - b.rel).slice(0, 6);
    $("#st-rainbow").innerHTML = bounce.map(({ s, rel }) => `<div class="mini" data-open="${esc(s.ticker)}">${star(s.ticker)}<b class="tk">${esc(s.ticker)}</b><span class="n">${esc(s.name)}</span><span class="meta">${(-rel * 100).toFixed(0)} pts behind · bounced ${Math.round(s.rebound_rate_after_big_drop * 100)}%</span></div>`).join("") || `<p class="meta">No clear bounce candidates today.</p>`;

    // shelter sectors from past world shocks
    const L = WORLD?.w?.lessons || [], agg = {};
    L.forEach((l) => l.sectors.forEach((x) => { (agg[x.sector] ||= { d1: [], d20: [] }); agg[x.sector].d1.push(x.day1); agg[x.sector].d20.push(x.day20); }));
    const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
    const mkt = L.length ? mean(L.map((l) => l.market_day20)) : 0;
    const shel = Object.entries(agg).map(([k, v]) => ({ k, d1: mean(v.d1), d20: mean(v.d20) })).sort((a, b) => b.d20 - a.d20);
    $("#st-shelter").innerHTML = shel.slice(0, 4).map((x) => `<div class="row"><span><b>${esc(x.k)}</b></span><span>day 1 <span class="${cls(x.d1)}">${pct(x.d1)}</span> · a month later <b class="${cls(x.d20)}">${pct(x.d20)}</b></span></div>`).join("") +
      `<p class="meta">Average across ${L.length} big world shocks of the last five years (the market itself: ${pct(mkt)} a month later). Biggest laggard: ${esc(shel[shel.length - 1]?.k || "")}.</p>`;

    // insiders buying into the dip
    const dip = STOCKS.filter((s) => (INS?.signals?.[s.ticker]?.insider_buyers || 0) >= 1 && s.chg_1m <= -0.05)
      .sort((a, b) => (INS.signals[b.ticker].insider_buyers - INS.signals[a.ticker].insider_buyers) || a.chg_1m - b.chg_1m).slice(0, 6);
    $("#st-dip").innerHTML = dip.map((s) => { const g = INS.signals[s.ticker]; return `<div class="mini" data-open="${esc(s.ticker)}">${star(s.ticker)}<b class="tk">${esc(s.ticker)}</b><span class="n">${esc(s.name)}</span><span class="meta"><span class="down">${pct(s.chg_1m)}</span> month · ${g.insider_buyers} bought ${money(g.insider_buy_value)}</span></div>`; }).join("") || `<p class="meta">No insiders bought into a falling stock this month.</p>`;
  };

  // ---------------------------------------------------------------- 2. exposure (watchlist)
  window.renderExposure = function () {
    const box = $("#exposure"); if (!box || !window.DATA_READY) return;
    const w = WATCH.list().filter((t) => STOCKS.some((s) => s.ticker === t));
    if (!w.length) { box.innerHTML = ""; return; }
    const n = w.length, bar = (label, k, items, ex) => `<div class="exrow"><span class="exl">${ex ? EX.ex(ex, label) : esc(label)}</span><div class="exbar"><b style="width:${(100 * k) / n}%"></b></div><span class="exn">${Math.round((100 * k) / n)}%</span>${items ? `<span class="exi">${items.map(esc).join(" ")}</span>` : ""}</div>`;
    const secs = {}; w.forEach((t) => { const s = STOCKS.find((x) => x.ticker === t); (secs[s.sector] ||= []).push(t); });
    const th = Object.entries(THEMES).map(([k, ts]) => [k, w.filter((t) => ts.includes(t))]).filter(([, a]) => a.length).sort((a, b) => b[1].length - a[1].length);
    const pl = Object.entries(PLACES).map(([k, ts]) => [k, w.filter((t) => ts.includes(t))]).filter(([, a]) => a.length);
    const top = th[0], topS = Object.entries(secs).sort((a, b) => b[1].length - a[1].length)[0];
    const head = top && top[1].length / n >= 0.4 ? `${Math.round((100 * top[1].length) / n)}% of your picks rely on ${top[0].charAt(0).toLowerCase() + top[0].slice(1)}.`
      : topS[1].length / n >= 0.5 ? `${Math.round((100 * topS[1].length) / n)}% of your picks are in ${topS[0]}.` : "Nicely spread: no single theme dominates your list.";
    const lv = RADAR.filter((r) => WATCH.has(r.s.ticker) && r.lv <= 1);
    const evs = (WORLD?.ev.events || []).slice(0, 8).map((e) => ({ e, hit: touches(e) })).filter((x) => x.hit.length).sort((a, b) => b.hit.length - a.hit.length);
    box.innerHTML = `<div class="tcard exbox">
      <div class="tlabel">${EX.ex("exposure", "Your exposure")}</div>
      <p class="exhead">${esc(head)}</p>
      <div class="excols"><div><p class="exsub">By ${EX.ex("sector", "sector")}</p>${Object.entries(secs).sort((a, b) => b[1].length - a[1].length).map(([k, a]) => bar(k, a.length, a)).join("")}</div>
      <div><p class="exsub">By ${EX.ex("theme", "theme")}</p>${th.map(([k, a]) => bar(k, a.length, a)).join("") || '<p class="meta">None of the big themes.</p>'}</div>
      <div><p class="exsub">By ${EX.ex("place", "place")}</p>${bar("United States (home)", n)}${pl.map(([k, a]) => bar(k, a.length, a)).join("")}</div></div>
      ${lv.length ? `<p class="exwarn">⛈️ Under amber or red warning: ${lv.map((r) => `<b class="tk">${esc(r.s.ticker)}</b>`).join(", ")}. <button class="more" data-go="storm" style="padding:0">See the storm plan →</button></p>` : ""}
      ${evs.length ? `<p class="exsub">World events touching your list</p>${evs.slice(0, 4).map(({ e, hit }) => `<p class="exev">${esc(plain(e))} <span class="meta">(${e.articles} stories)</span>: ${hit.map((t) => `<b class="tk">${esc(t)}</b>`).join(", ")}</p>`).join("")}` : ""}
      <p class="meta">Themes and places are a rough guide from public company reports, not a full breakdown of each company's business.</p></div>`;
  };
  // which watched stocks a world event touches: listed tickers, plus Taiwan/China exposure
  function touches(e) {
    const w = new Set(WATCH.list()), hit = new Set(e.tickers.filter((t) => w.has(t)));
    e.countries.forEach((c) => (PLACES[COUNTRY_THEME[c]] || []).forEach((t) => w.has(t) && hit.add(t)));
    return [...hit];
  }
  window.eventTouches = touches;

  // tap a world event card: show what it touches on your list
  document.addEventListener("click", (e) => {
    const c = e.target.closest?.("#world-body .card");
    if (!c || e.target.closest("a")) return;
    const i = [...c.parentNode.children].indexOf(c);
    const k = $("#world-kind").value, list = WORLD.ev.events.filter((x) => !k || x.kind === k);
    const ev = list[i]; if (!ev) return;
    let box = c.querySelector(".touch");
    if (box) { box.remove(); return; }
    const hit = touches(ev);
    box = document.createElement("div"); box.className = "touch";
    box.innerHTML = hit.length ? `Touches your watchlist: ${hit.map((t) => `<b class="tk">${esc(t)}</b>`).join(", ")}` : WATCH.list().length ? "Doesn't touch anything on your watchlist." : "Add stocks to your watchlist to see which ones this touches.";
    c.appendChild(box);
  });

  // load storms.json, then draw; redraw when the watchlist changes
  fetch("data/storms.json").then((r) => r.json()).catch(() => ({ stocks: {} })).then((d) => { STORMS = d; window.renderStorm(); window.renderExposure(); });
  document.addEventListener("watch", () => { window.renderStorm?.(); window.renderExposure?.(); });
  const st = () => $("#st-w"); if (st()) st().onchange = () => window.renderStorm();
})();
