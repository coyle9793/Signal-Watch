const $ = (s) => document.querySelector(s);
const load = (f) => fetch(`data/${f}`).then((r) => r.json());
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

document.querySelectorAll("#tabs button").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll("#tabs button, .tab").forEach((x) => x.classList.remove("on"));
    b.classList.add("on");
    $("#" + b.dataset.tab).classList.add("on");
  })
);

const pct = (x, d = 1) => (x == null ? "–" : `${x > 0 ? "+" : ""}${(x * 100).toFixed(d)}%`);
const cls = (x) => (x == null ? "" : x >= 0 ? "up" : "down");
function spark(arr) {
  const w = 110, h = 28, mn = Math.min(...arr), mx = Math.max(...arr);
  const pts = arr.map((v, i) => `${((i / (arr.length - 1)) * w).toFixed(1)},${(h - ((v - mn) / (mx - mn || 1)) * h).toFixed(1)}`).join(" ");
  const col = arr[arr.length - 1] >= arr[0] ? "var(--up)" : "var(--down)";
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><polyline fill="none" stroke="${col}" stroke-width="1.5" points="${pts}"/></svg>`;
}

let STOCKS = [], sortK = "chg_1d", sortDir = -1;
async function market() {
  const { meta, stocks } = await load("prices.json");
  STOCKS = stocks.filter((s) => s.ticker !== "SPY");
  const spy = stocks.find((s) => s.ticker === "SPY");
  if (meta.demo) { $("#demo-banner").hidden = false; $("#demo-banner").textContent = "Showing demo prices while the live data feed is being set up."; }
  $("#updated").textContent = `Updated ${meta.updated} · ${meta.source}`;
  const upN = STOCKS.filter((s) => s.chg_1d > 0).length;
  const best = [...STOCKS].sort((a, b) => b.chg_1d - a.chg_1d)[0], worst = [...STOCKS].sort((a, b) => a.chg_1d - b.chg_1d)[0];
  const busy = [...STOCKS].sort((a, b) => b.vol_ratio - a.vol_ratio)[0];
  $("#market-summary").innerHTML = [
    ["Market (S&P 500)", `<span class="${cls(spy?.chg_1d)}">${pct(spy?.chg_1d, 2)}</span>`],
    ["Rising / falling", `<span class="up">${upN}</span> / <span class="down">${STOCKS.length - upN}</span>`],
    ["Best today", `${best.ticker} <span class="up">${pct(best.chg_1d)}</span>`],
    ["Worst today", `${worst.ticker} <span class="down">${pct(worst.chg_1d)}</span>`],
    ["Busiest trading", `${busy.ticker} <span class="hot">${busy.vol_ratio.toFixed(1)}×</span>`],
  ].map(([l, v]) => `<div class="kpi"><div class="l">${l}</div><div class="v">${v}</div></div>`).join("");
  const sectors = [...new Set(STOCKS.map((s) => s.sector))].sort();
  $("#sector").innerHTML += sectors.map((s) => `<option>${esc(s)}</option>`).join("");
  $("#q").oninput = $("#sector").onchange = renderTable;
  document.querySelectorAll("#mtable th[data-k]").forEach((th) => th.onclick = () => {
    sortDir = sortK === th.dataset.k ? -sortDir : -1; sortK = th.dataset.k; renderTable();
  });
  renderTable();
}
function renderTable() {
  const q = $("#q").value.trim().toLowerCase(), sec = $("#sector").value;
  const rows = STOCKS.filter((s) => (!sec || s.sector === sec) && (!q || s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)))
    .sort((a, b) => (a[sortK] > b[sortK] ? 1 : a[sortK] < b[sortK] ? -1 : 0) * sortDir);
  $("#mtable tbody").innerHTML = rows.map((s) => `<tr data-t="${esc(s.ticker)}">
    <td><b>${esc(s.ticker)}</b> <span class="n">${esc(s.name)}</span></td>
    <td class="r">$${s.price.toFixed(2)}</td>
    <td class="r ${cls(s.chg_1d)}">${pct(s.chg_1d, 2)}</td><td class="r ${cls(s.chg_1m)}">${pct(s.chg_1m)}</td><td class="r ${cls(s.chg_1y)}">${pct(s.chg_1y)}</td>
    <td class="r ${s.vol_ratio > 2 ? "hot" : ""}">${s.vol_ratio?.toFixed(1)}×</td><td>${spark(s.spark)}</td></tr>`).join("");
  document.querySelectorAll("#mtable tbody tr").forEach((tr) => tr.onclick = () => openStock(tr.dataset.t));
}

let chart, hist;
async function openStock(t) {
  const s = STOCKS.find((x) => x.ticker === t);
  $("#d-title").textContent = `${s.ticker} · ${s.name}`;
  $("#d-sub").innerHTML = `$${s.price.toFixed(2)} <span class="${cls(s.chg_1d)}">${pct(s.chg_1d, 2)} today</span> · ${esc(s.sector)}`;
  const f = [];
  f.push(`It is <b>${pct(s.drawdown)}</b> from its 5-year high; its worst fall in 5 years was <b>${pct(s.max_drawdown_5y)}</b>.`);
  f.push(`52-week range $${s.low_52w} to $${s.high_52w}. It moves about <b>${(s.volatility_1y * 100).toFixed(0)}%</b> a year (volatility)${s.beta ? `, and about ${s.beta.toFixed(1)}× as much as the market` : ""}.`);
  f.push(s.price > s.sma200 ? `The price is above its 200-day average, a sign of a longer-term uptrend.` : `The price is below its 200-day average, a sign of a longer-term downtrend.`);
  if (s.big_drops_5y) f.push(`It had <b>${s.big_drops_5y}</b> one-day drops of 5% or more in 5 years. A month later it was higher <b>${Math.round(s.rebound_rate_after_big_drop * 100)}%</b> of the time (average ${pct(s.avg_20d_after_big_drop)}).`);
  else f.push(`It has not had a one-day drop of 5% or more in 5 years.`);
  $("#d-history").innerHTML = f.map((x) => `<li>${x}</li>`).join("");
  const c = CALLS?.calls.find((x) => x.ticker === t);
  $("#d-call").innerHTML = c ? `<div class="callbox"><b>Today's call:</b> <span class="badge ${c.call}">${c.call}</span> <span class="meta">score ${c.score > 0 ? "+" : ""}${c.score}</span>${reasonList(c)}</div>` : "";
  $("#drawer").hidden = false;
  hist = await load(`history/${t}.json`);
  drawChart(252);
}
function drawChart(n) {
  document.querySelectorAll(".ranges button").forEach((b) => b.classList.toggle("on", +b.dataset.r === n));
  const d = hist.dates.slice(-n), c = hist.close.slice(-n);
  const col = c[c.length - 1] >= c[0] ? "#3fb950" : "#f85149";
  chart?.destroy();
  chart = new Chart($("#d-chart"), {
    type: "line",
    data: { labels: d, datasets: [{ data: c, borderColor: col, borderWidth: 1.5, pointRadius: 0, fill: true, backgroundColor: col + "22", tension: 0.1 }] },
    options: { maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } }, interaction: { mode: "index", intersect: false },
      scales: { x: { ticks: { color: "#8b949e", maxTicksLimit: 6 }, grid: { color: "#21262d" } }, y: { ticks: { color: "#8b949e" }, grid: { color: "#21262d" } } } },
  });
}
document.querySelectorAll(".ranges button").forEach((b) => b.onclick = () => drawChart(+b.dataset.r));
$("#close").onclick = () => ($("#drawer").hidden = true);
$("#drawer").onclick = (e) => { if (e.target.id === "drawer") $("#drawer").hidden = true; };

const KIND = { conflict: "Conflict", sanctions: "Tension", unrest: "Unrest", cooperation: "Diplomacy" };
let WORLD;
async function world() {
  const [ev, w] = await Promise.all([load("events.json"), load("world.json").catch(() => null)]);
  WORLD = { ev, w };
  const { meta, events } = ev;
  const d = meta.date;
  $("#world-meta").textContent = `From ${meta.total_events.toLocaleString()} news events worldwide on ${d.slice(6)}/${d.slice(4, 6)}/${d.slice(0, 4)} (GDELT), ${meta.international_events.toLocaleString()} between countries.`;
  const spots = {};
  events.forEach((e) => e.countries.forEach((c) => { if (c !== "USA") spots[c] = (spots[c] || 0) + e.risk; }));
  const names = {};
  events.forEach((e) => e.title.split(":")[0].split(" & ").forEach((n, i) => (names[e.countries[i]] = n)));
  const top = Object.entries(spots).sort((a, b) => b[1] - a[1]).slice(0, 8), mx = top[0]?.[1] || 1;
  $("#world-spots").innerHTML = top.map(([c, v]) => `<div class="spot"><b>${esc(names[c] || c)}</b><span class="meta">risk ${Math.round(v)}</span><div class="bar"><i style="width:${(100 * v) / mx}%"></i></div></div>`).join("");
  $("#world-kind").onchange = renderWorld;
  renderWorld();
  if (w) $("#world-history").innerHTML = w.lessons.map((l) => `<div class="card">
    <h3>${esc(l.title)}</h3><div class="meta">${esc(l.date)}</div>
    <div class="row"><span>Market on the day</span><b class="${cls(l.market_day1)}">${pct(l.market_day1)}</b></div>
    <div class="row"><span>Market a month later</span><b class="${cls(l.market_day20)}">${pct(l.market_day20)}</b></div>
    <div class="why"><div class="secrow meta"><span>Sector</span><span>Day</span><span>Month</span></div>
    ${[...l.sectors.slice(0, 2), ...l.sectors.slice(-2)].map((s) => `<div class="secrow"><span>${esc(s.sector)}</span><span class="${cls(s.day1)}">${pct(s.day1)}</span><span class="${cls(s.day20)}">${pct(s.day20)}</span></div>`).join("")}
    <div class="meta" style="margin-top:6px">Hit hardest: ${l.worst.map(([t, v]) => `<span class="tk">${t}</span> ${pct(v)}`).join(", ")}</div></div></div>`).join("");
}
function renderWorld() {
  const { ev, w } = WORLD, k = $("#world-kind").value;
  const list = ev.events.map((e, i) => ({ ...e, impact: w?.impacts?.[i] })).filter((e) => !k || e.kind === k);
  const max = Math.max(...ev.events.map((e) => e.risk));
  $("#world-body").innerHTML = list.slice(0, 15).map((e) => `<div class="card">
      <h3>${esc(e.title)}</h3>
      <span class="pill ${e.kind}">${KIND[e.kind] || e.kind}</span><span class="pill">${e.articles} articles</span><span class="pill">tone ${e.tone}</span>
      <div class="bar" title="Market risk score"><i style="width:${(100 * e.risk) / max}%"></i></div>
      <div>Could move: ${e.tickers.map((t) => `<span class="tk">${esc(t)}</span>`).join(" ")}</div>
      ${e.impact != null ? `<div class="row" style="margin-top:6px"><span>Those stocks since, vs market</span><b class="${cls(e.impact)}">${pct(e.impact)}</b></div>` : ""}
      <div class="meta">${esc(e.sector)}${e.place ? " · " + esc(e.place) : ""} · <a href="${esc(e.url)}" target="_blank" rel="noopener">source</a></div>
    </div>`).join("");
}

const money = (v) => v >= 1e9 ? `$${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v}`;
let INS;
async function insiders() {
  INS = await load("insiders.json");
  const { meta, form4, congress, signals } = INS;
  if (meta.demo) { $("#ins-banner").hidden = false; $("#ins-banner").textContent = "Fictional sample trades for layout only. Real SEC and Congress filings load once the data feed is live."; }
  else if (!meta.congress_source) { $("#ins-banner").hidden = false; $("#ins-banner").textContent = "Congress trades are unavailable right now; company insider trades are live."; }
  const sum = (a) => a.reduce((x, y) => x + y.value, 0);
  const b = form4.filter((x) => x.type === "Buy"), s = form4.filter((x) => x.type === "Sell");
  const late = congress.filter((x) => x.delay_days > 45).length;
  $("#ins-kpis").innerHTML = [
    [`Insider buying (${meta.form4_days} days)`, `<span class="up">${money(sum(b))}</span>`],
    ["Insider selling", `<span class="down">${money(sum(s))}</span>`],
    ["Of which unplanned", `<span class="hot">${money(sum(s.filter((x) => !x.planned)))}</span>`],
    ["Congress trades", `${meta.congress_count}${late ? ` <span class="tag warn">${late} filed late</span>` : ""}`],
  ].map(([l, v]) => `<div class="kpi"><div class="l">${l}</div><div class="v">${v}</div></div>`).join("");
  const rank = Object.entries(signals).map(([t, g]) => {
    const score = g.insider_buyers * 3 + g.congress_buys - g.congress_sells + (g.unplanned_sell_value > 5e6 ? -2 : 0);
    return { t, g, score };
  }).filter((x) => x.g.insider_buyers || x.g.congress_members || x.g.unplanned_sell_value > 5e6);
  rank.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
  $("#ins-clusters").innerHTML = rank.slice(0, 6).map(({ t, g, score }) => `<div class="card">
    <h3><span class="tk" style="font-size:16px">${t}</span> <span class="${score >= 0 ? "buy" : "sell"}">${score >= 0 ? "Leaning buy" : "Leaning sell"}</span></h3>
    <div>${g.insider_buyers} insider${g.insider_buyers === 1 ? "" : "s"} bought ${g.insider_buy_value ? money(g.insider_buy_value) : ""}</div>
    <div>${g.insider_sellers} insider${g.insider_sellers === 1 ? "" : "s"} sold ${g.insider_sell_value ? money(g.insider_sell_value) : ""}${g.unplanned_sell_value ? ` <span class="tag warn">${money(g.unplanned_sell_value)} unplanned</span>` : ""}</div>
    <div>Congress: <span class="up">${g.congress_buys} buys</span>, <span class="down">${g.congress_sells} sells</span></div></div>`).join("");
  $("#ins-q").oninput = renderIns;
  renderIns();
}
function renderIns() {
  const q = $("#ins-q").value.trim().toLowerCase();
  const m = (x) => !q || x.ticker.toLowerCase().includes(q) || (x.who || "").toLowerCase().includes(q);
  $("#f4t tbody").innerHTML = INS.form4.filter(m).slice(0, 150).map((x) => `<tr>
    <td>${esc(x.date)}</td><td class="tk">${esc(x.ticker)}</td><td>${esc(x.who)}<div class="n">${esc(x.role)}</div></td>
    <td class="${x.type === "Buy" ? "buy" : "sell"}">${x.type}${x.planned ? '<span class="tag">planned</span>' : ""}</td>
    <td class="r"><a href="${esc(x.url)}" target="_blank" rel="noopener">${money(x.value)}</a></td></tr>`).join("");
  $("#cgt tbody").innerHTML = INS.congress.filter(m).slice(0, 150).map((x) => `<tr>
    <td>${esc(x.date)}</td><td class="tk">${esc(x.ticker)}</td><td>${esc(x.who)}<div class="n">${esc(x.chamber || "")}${x.party ? " · " + esc(x.party) : ""}</div></td>
    <td class="${x.type === "Buy" ? "buy" : "sell"}">${esc(x.type)}${x.delay_days > 45 ? `<span class="tag warn">filed ${x.delay_days}d later</span>` : ""}</td>
    <td class="r">${esc(x.amount || "")}</td></tr>`).join("");
}

let SH;
async function shocks() {
  SH = await load("shocks.json");
  const m = SH.meta, list = SH.shocks;
  $("#sh-kpis").innerHTML = [
    [`Shocks (last ${m.lookback_days} trading days)`, m.count],
    ["With no clear reason", `<span class="down">${m.unexplained}</span>`],
    ["Biggest sell-off", (() => { const x = [...list].sort((a, b) => a.abnormal - b.abnormal)[0]; return x ? `${x.ticker} <span class="down">${pct(x.ret)}</span>` : "–"; })()],
    ["Biggest volume spike", (() => { const x = [...list].sort((a, b) => b.vol_ratio - a.vol_ratio)[0]; return x ? `${x.ticker} <span class="hot">${x.vol_ratio}×</span>` : "–"; })()],
  ].map(([l, v]) => `<div class="kpi"><div class="l">${l}</div><div class="v">${v}</div></div>`).join("");
  $("#sh-only").onchange = renderShocks;
  renderShocks();
}
function renderShocks() {
  const only = $("#sh-only").checked;
  $("#sh-list").innerHTML = SH.shocks.filter((s) => !only || !s.explained).map((s) => {
    const why = s.explained ? `Likely reason: ${s.reasons.map(esc).join("; ")}.`
      : s.news_checked ? `<b class="down">No clear reason found</b>: no news coverage and no insider filings.`
      : `No insider filings around this day. News for this day isn't loaded yet.`;
    const hist = s.past_shocks ? `History: after ${s.past_shocks} similar shocks in 5 years, ${s.ticker} was higher 20 trading days later ${Math.round(s.past_up_rate * 100)}% of the time (average ${pct(s.past_avg_20d)}).` : `First shock like this in 5 years.`;
    return `<div class="card clickable ${!s.explained && s.news_checked ? "alert" : ""}" data-t="${esc(s.ticker)}">
      <h3><span class="tk" style="font-size:16px">${esc(s.ticker)}</span> <span class="${s.abnormal < 0 ? "sell" : "buy"}">${esc(s.kind)}</span> <span class="meta">${esc(s.date)}</span></h3>
      <div class="row"><span>Stock</span><b class="${cls(s.ret)}">${pct(s.ret, 2)}</b></div>
      <div class="row"><span>Market that day</span><span class="${cls(s.market)}">${pct(s.market, 2)}</span></div>
      <div class="row"><span>Unexplained by market</span><span class="${cls(s.abnormal)}">${pct(s.abnormal, 2)} (${Math.abs(s.z).toFixed(1)}× normal)</span></div>
      <div class="row"><span>Shares traded</span><span class="${s.vol_ratio >= 2.5 ? "hot" : ""}">${s.vol_ratio}× normal</span></div>
      ${s.unplanned_insider_sells ? `<div class="row"><span class="tag warn">${s.unplanned_insider_sells} unplanned insider sale(s) nearby</span></div>` : ""}
      <div class="why">${why}<br><span class="meta">${hist}</span></div></div>`;
  }).join("") || `<div class="placeholder">No shocks match.</div>`;
  document.querySelectorAll("#sh-list .card").forEach((c) => c.onclick = () => openStock(c.dataset.t));
}

let CALLS;
const reasonList = (c, n = 99) => `<ul class="reasons">${c.reasons.slice(0, n).map((r) => `<li><span class="p ${r.pts > 0 ? "up" : "down"}">${r.pts > 0 ? "+" : ""}${r.pts}</span><span>${esc(r.text)}</span></li>`).join("")}</ul>`;
async function calls() {
  CALLS = await load("calls.json");
  const { counts, track_record: tr } = CALLS.meta;
  const trk = (k) => !tr[k]?.n ? "–" : k === "Sell"
    ? `${Math.round((1 - tr[k].beat_rate) * 100)}% <span class="meta" style="font-size:12px">of Sell calls then lagged the market (avg ${pct(tr[k].avg_vs_market)} vs market)</span>`
    : `${Math.round(tr[k].beat_rate * 100)}% <span class="meta" style="font-size:12px">of Buy calls then beat the market (avg ${pct(tr[k].avg_vs_market)})</span>`;
  $("#calls-kpis").innerHTML = [
    ["Today", `<span class="up">${counts.Buy} Buy</span> · ${counts.Hold} Hold · <span class="down">${counts.Sell} Sell</span>`],
    ["Track record: Buy calls", trk("Buy")],
    ["Track record: Sell calls", trk("Sell")],
  ].map(([l, v]) => `<div class="kpi"><div class="l">${l}</div><div class="v">${v}</div></div>`).join("") +
    `<div class="meta" style="grid-column:1/-1">Track record replays the trend and momentum rules on each week of the past year and checks the next month (20 trading days).</div>`;
  $("#c-q").oninput = $("#c-f").onchange = renderCalls;
  renderCalls();
}
function renderCalls() {
  const q = $("#c-q").value.trim().toLowerCase(), f = $("#c-f").value;
  $("#calls-list").innerHTML = CALLS.calls.filter((c) => (!f || c.call === f) && (!q || c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)))
    .map((c) => `<div class="card clickable" data-t="${esc(c.ticker)}">
      <h3><span class="badge ${c.call}">${c.call}</span> <span class="tk" style="font-size:16px">${esc(c.ticker)}</span> <span class="meta">${esc(c.name)}</span></h3>
      <div class="row"><span>$${c.price.toFixed(2)} <span class="${cls(c.chg_1d)}">${pct(c.chg_1d, 2)}</span></span><span class="meta">score ${c.score > 0 ? "+" : ""}${c.score}</span></div>
      ${reasonList(c, 3)}</div>`).join("") || `<div class="placeholder">No stocks match.</div>`;
  document.querySelectorAll("#calls-list .card").forEach((el) => el.onclick = () => openStock(el.dataset.t));
}

market();
insiders();
shocks();
world();
calls();

