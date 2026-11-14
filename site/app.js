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

// ---- personal watchlist (saved in this browser only) ----
const WATCH = (() => {
  let set = new Set();
  try { set = new Set(JSON.parse(localStorage.getItem("sw-watch") || "[]")); } catch (e) {}
  const save = () => { try { localStorage.setItem("sw-watch", JSON.stringify([...set])); } catch (e) {} document.dispatchEvent(new Event("watch")); };
  return { has: (t) => set.has(t), list: () => [...set], toggle: (t) => { set.has(t) ? set.delete(t) : set.add(t); save(); }, add: (t) => { set.add(t); save(); }, clear: () => { set.clear(); save(); } };
})();
const star = (t) => `<button class="star ${WATCH.has(t) ? "on" : ""}" data-star="${t}" aria-label="Watchlist ${t}" title="${WATCH.has(t) ? "On your watchlist" : "Add to watchlist"}">${WATCH.has(t) ? "★" : "☆"}</button>`;
document.addEventListener("click", (e) => {
  const b = e.target.closest?.("[data-star]");
  if (!b) return;
  e.stopPropagation(); e.preventDefault();
  WATCH.toggle(b.dataset.star);
}, true);
document.addEventListener("watch", () => {
  document.querySelectorAll("[data-star]").forEach((b) => { const on = WATCH.has(b.dataset.star); b.classList.toggle("on", on); b.textContent = on ? "★" : "☆"; });
  const n = WATCH.list().length; const el = document.getElementById("watch-n"); if (el) el.textContent = n ? n : "";
  if (document.getElementById("c-w")?.checked) renderCalls();
  window.renderWatch?.(); window.renderToday?.();
});

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
  const spy = stocks.find((s) => s.ticker === "SPY"); window.SPY = spy || { chg_1d: 0 };
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
  window.startWeather?.(spy?.chg_1d, upN / STOCKS.length, upN, STOCKS.length);
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
    <td class="st">${star(s.ticker)}</td><td><b>${esc(s.ticker)}</b> <span class="n">${esc(s.name)}</span></td>
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
  const sb = $("#d-star");
  const paint = () => { sb.textContent = WATCH.has(t) ? "★ On your watchlist" : "☆ Add to watchlist"; sb.classList.toggle("on", WATCH.has(t)); };
  paint(); sb.onclick = () => { WATCH.toggle(t); paint(); };
  $("#drawer").hidden = false;
  curT = t;
  [hist] = await Promise.all([load(`history/${t}.json`), loadMoves()]);
  drawChart(252);
}
// ---- "Why did it move?": big moves pinned on the chart, each with its likely reason
let MOVES = null, curT = null;
const MK = { earnings: ["Earnings", "#ffd75c"], news: ["News", "#2ef2ff"], market: ["Whole market", "#a59fc9"], sector: ["Sector", "#6b5cff"], world: ["World event", "#ffa53d"], insider: ["Insiders", "#b44dff"], unknown: ["No clear reason", "#ff5c8a"] };
const loadMoves = () => MOVES ? Promise.resolve(MOVES) : load("moves.json").then((m) => (MOVES = m)).catch(() => (MOVES = { moves: {} }));
function drawChart(n) {
  document.querySelectorAll(".ranges button").forEach((b) => b.classList.toggle("on", +b.dataset.r === n));
  const d = hist.dates.slice(-n), c = hist.close.slice(-n);
  const col = c[c.length - 1] >= c[0] ? "#3ee08f" : "#ff5c8a";
  const all = (MOVES?.moves?.[curT] || []).filter((m) => m.date >= d[0]);
  // keep the chart readable: at most 12 pins, the biggest moves in view
  const shown = [...all].sort((a, b) => Math.abs(b.ret - b.market) - Math.abs(a.ret - a.market)).slice(0, 12);
  const at = Object.fromEntries(shown.map((m) => [m.date, m]));
  const pins = d.map((x, i) => (at[x] ? c[i] : null));
  chart?.destroy();
  chart = new Chart($("#d-chart"), {
    type: "line",
    data: { labels: d, datasets: [
      { data: c, borderColor: col, borderWidth: 1.5, pointRadius: 0, fill: true, backgroundColor: col + "22", tension: 0.1 },
      { data: pins, showLine: false, pointRadius: d.map((x) => (at[x] ? 7 : 0)), pointHoverRadius: 9, pointBorderColor: "#fff", pointBorderWidth: 1.5,
        pointBackgroundColor: d.map((x) => (at[x] ? MK[at[x].kind][1] : "transparent")), pointStyle: d.map((x) => (at[x] ? (at[x].ret < 0 ? "triangle" : "circle") : "circle")), pointRotation: d.map((x) => (at[x]?.ret < 0 ? 180 : 0)) },
    ] },
    options: { maintainAspectRatio: false, animation: false, plugins: { legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => ctx.datasetIndex === 0 ? `$${ctx.parsed.y.toFixed(2)}` : (() => { const m = at[d[ctx.dataIndex]]; return m ? [`${pct(m.ret)} (${MK[m.kind][0]})`, m.text.length > 70 ? m.text.slice(0, 68) + "…" : m.text] : ""; })() } } },
      interaction: { mode: "index", intersect: false },
      onClick: (e, els) => { const el = els.find((x) => x.datasetIndex === 1 && pins[x.index] != null); if (el) document.getElementById("mv-" + d[el.index])?.scrollIntoView({ behavior: "smooth", block: "nearest" }); },
      scales: { x: { ticks: { color: "#a59fc9", maxTicksLimit: 6 }, grid: { color: "#1c1838" } }, y: { ticks: { color: "#a59fc9" }, grid: { color: "#1c1838" } } } },
  });
  const list = shown.sort((a, b) => (a.date < b.date ? 1 : -1));
  $("#d-moves").innerHTML = list.length ? list.map((m) => `<li id="mv-${m.date}" class="mv"><span class="mvk" style="--k:${MK[m.kind][1]}"><span class="ex" data-ex="mv-${m.kind}">${MK[m.kind][0]}</span></span>
      <div><div><b class="${cls(m.ret)}">${pct(m.ret)}</b> <span class="meta">on ${esc(m.date)} · market ${pct(m.market)}</span></div>
      <div>${m.kind === "news" ? `“${esc(m.text)}”` : esc(m.text)}${m.url ? ` <a href="${esc(m.url)}" target="_blank" rel="noopener">${esc(m.src)}</a>` : m.src ? ` <span class="meta">(${esc(m.src)})</span>` : ""}</div></div></li>`).join("")
    : `<li class="meta">No big moves (3%+ beyond the market) in this period.</li>`;
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
  drawMap();
  if (w) $("#world-history").innerHTML = w.lessons.map((l) => `<div class="card">
    <h3>${esc(l.title)}</h3><div class="meta">${esc(l.date)}</div>
    <div class="row"><span>Market on the day</span><b class="${cls(l.market_day1)}">${pct(l.market_day1)}</b></div>
    <div class="row"><span>Market a month later</span><b class="${cls(l.market_day20)}">${pct(l.market_day20)}</b></div>
    <div class="why"><div class="secrow meta"><span>Sector</span><span>Day</span><span>Month</span></div>
    ${[...l.sectors.slice(0, 2), ...l.sectors.slice(-2)].map((s) => `<div class="secrow"><span>${esc(s.sector)}</span><span class="${cls(s.day1)}">${pct(s.day1)}</span><span class="${cls(s.day20)}">${pct(s.day20)}</span></div>`).join("")}
    <div class="meta" style="margin-top:6px">Hit hardest: ${l.worst.map(([t, v]) => `<span class="tk">${t}</span> ${pct(v)}`).join(", ")}</div></div></div>`).join("");
}
let MAP;
function drawMap() {
  if (!window.L || MAP) return;
  const { ev, w } = WORLD;
  MAP = L.map("map", { minZoom: 1, maxZoom: 6, zoomSnap: 0.5, maxBounds: [[-75, -200], [85, 200]] }).setView([28, 15], 1.5);
  // Self-hosted country outlines (Natural Earth, public domain, via world-atlas): no map key or tile server needed
  load("countries.geo.json").then((geo) => {
    L.geoJSON(geo, { interactive: false, style: { color: "#3b4452", weight: 0.7, fillColor: "#1c232d", fillOpacity: 1 } }).addTo(MAP).bringToBack();
  });
  MAP.attributionControl.addAttribution("Map: Natural Earth");
  const max = Math.max(...ev.events.map((e) => e.risk));
  ev.events.forEach((e, i) => {
    if (e.lat == null) return;
    const sz = Math.round(12 + 26 * (e.risk / max));
    const icon = L.divIcon({ className: `pulse ${e.kind}`, html: "<i></i><i></i><i></i>", iconSize: [sz, sz] });
    const imp = w?.impacts?.[i];
    const rows = e.tickers.slice(0, 6).map((t) => {
      const s = STOCKS.find((x) => x.ticker === t);
      return `<div class="ptk"><span class="tk">${esc(t)}</span><span class="${cls(s?.chg_1d)}">${s ? pct(s.chg_1d, 2) + " today" : ""}</span></div>`;
    }).join("");
    L.marker([e.lat, e.lon], { icon, riseOnHover: true, title: e.title }).addTo(MAP).bindPopup(`<h4>${esc(e.title)}</h4>
      <div class="meta">${esc(e.place)} · ${e.articles} articles · tone ${e.tone}</div>
      <div style="margin:8px 0 4px"><b>Stocks it could move</b></div>${rows}
      ${imp != null ? `<div class="ptk" style="margin-top:6px;border-top:1px solid var(--line);padding-top:6px"><span>Those stocks since, vs market</span><b class="${cls(imp)}">${pct(imp)}</b></div>` : ""}
      <div style="margin-top:6px"><a href="${esc(e.url)}" target="_blank" rel="noopener">Read the source</a></div>`);
  });
}
document.querySelector('#tabs [data-tab="world"]').addEventListener("click", () => setTimeout(() => MAP?.invalidateSize(), 50));

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
  const sum = (a) => a.reduce((x, y) => x + y.value, 0);
  const b = form4.filter((x) => x.type === "Buy"), s = form4.filter((x) => x.type === "Sell");
  const late = congress.filter((x) => x.delay_days > 45).length;
  $("#ins-kpis").innerHTML = [
    [`Insider buying (${meta.form4_days} days)`, `<span class="up">${money(sum(b))}</span>`],
    ["Insider selling", `<span class="down">${money(sum(s))}</span>`],
    ["Insiders buying / selling", `<span class="up">${new Set(b.map((x) => x.who)).size}</span> / <span class="down">${new Set(s.map((x) => x.who)).size}</span> <span class="meta" style="font-size:12px">people</span>`],
    ["Congress trades", meta.congress_source ? `${meta.congress_count}${late ? ` <span class="tag warn">${late} filed late</span>` : ""}` : `<span class="meta">Feed unavailable today</span>`],
  ].map(([l, v]) => `<div class="kpi"><div class="l">${l}</div><div class="v">${v}</div></div>`).join("");
  const rank = Object.entries(signals).map(([t, g]) => {
    const score = g.insider_buyers * 3 + g.congress_buys - g.congress_sells + (g.unplanned_sell_value > 5e6 || (g.insider_sellers >= 3 && !g.insider_buyers) ? -2 : 0);
    return { t, g, score };
  }).filter((x) => x.g.insider_buyers || x.g.congress_members || x.g.unplanned_sell_value > 5e6 || x.g.insider_sellers >= 3);
  rank.sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
  $("#ins-clusters").innerHTML = rank.slice(0, 6).map(({ t, g, score }) => `<div class="card">
    <h3><span class="tk" style="font-size:16px">${t}</span> <span class="${score >= 0 ? "buy" : "sell"}">${score >= 0 ? "Leaning buy" : "Leaning sell"}</span></h3>
    <div>${g.insider_buyers} insider${g.insider_buyers === 1 ? "" : "s"} bought ${g.insider_buy_value ? money(g.insider_buy_value) : ""}</div>
    <div>${g.insider_sellers} insider${g.insider_sellers === 1 ? "" : "s"} sold ${g.insider_sell_value ? money(g.insider_sell_value) : ""}${g.unplanned_sell_value ? ` <span class="tag warn">${money(g.unplanned_sell_value)} unplanned</span>` : ""}</div>
    ${meta.congress_source ? `<div>Congress: <span class="up">${g.congress_buys} buys</span>, <span class="down">${g.congress_sells} sells</span></div>` : ""}</div>`).join("");
  const cn = meta.congress_notes;
  if (cn) $("#cg-note").innerHTML = `Source: ${esc(meta.congress_source || "official House and Senate filings")}. ` + Object.entries(cn).map(([k, v]) => v.ok
      ? `${k}: ${v.trades} trades read${v.scanned_skipped ? `, ${v.scanned_skipped} hand-written filings skipped (scans can't be read automatically)` : ""}.`
      : `${k}: couldn't be reached today.`).join(" ");
  $("#ins-q").oninput = renderIns;
  $("#spy-only").onchange = renderSpy;
  renderIns();
  renderSpy();
}
const days = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
function caseFile(x, i) {
  const ev = [];
  let pts = 0;
  const shocks = (window.SH?.shocks || []).filter((s) => s.ticker === x.ticker);
  const after = shocks.filter((s) => { const d = days(x.date, s.date); return d > 0 && d <= 14; });
  const drop = after.find((s) => s.ret < 0), jump = after.find((s) => s.ret > 0);
  if (x.type === "Sell" && drop) { pts += 3; ev.push(`Sold ${days(x.date, drop.date)} days before a ${pct(drop.ret)} drop`); }
  if (x.type === "Buy" && jump) { pts += 3; ev.push(`Bought ${days(x.date, jump.date)} days before a ${pct(jump.ret)} jump`); }
  const senior = /\b(CEO|CFO|COO|Pres|Chair|Chief)/i.test(x.role || "");
  if (x.type === "Sell" && x.value >= 5e6) { pts += 1; ev.push(`Large sale: ${money(x.value)}`); }
  if (senior && x.value >= 1e6) { pts += 1; ev.push(`Trade by a top boss (${esc(x.role)})`); }
  if (x.type === "Buy") { pts += 1; ev.push("Bought with their own money (insiders rarely do)"); }
  const pack = INS.form4.filter((y) => y.ticker === x.ticker && y.type === x.type && y.who !== x.who && Math.abs(days(x.date, y.date)) <= 14);
  const crowd = new Set(pack.map((y) => y.who)).size;
  if (crowd >= 2) { pts += 1; ev.push(`${crowd} other insiders ${x.type === "Buy" ? "bought" : "sold"} within two weeks`); }
  if (x.planned === true) { pts -= 3; ev.push("Pre-planned sale (10b5-1 schedule)"); }
  if (!ev.length) ev.push("Nothing out of the ordinary");
  return { x, pts, unusual: pts >= 3, ev, id: `SW-${String(i + 1).padStart(4, "0")}` };
}
function renderSpy() {
  const files = INS.form4.map(caseFile).sort((a, b) => b.pts - a.pts || b.x.value - a.x.value);
  const only = $("#spy-only").checked, n = files.filter((f) => f.unusual).length;
  $("#spy-count").textContent = `${n} unusual of ${files.length} trades`;
  $("#spy").innerHTML = files.filter((f) => !only || f.unusual).slice(0, 24).map((f) => `<div class="file">
    <div class="stamp ${f.unusual ? "unusual" : "routine"}">${f.unusual ? "UNUSUAL" : "ROUTINE"}</div>
    <div class="case">CASE FILE ${f.id}</div>
    <div class="subj">${esc(f.x.who)}</div><div>${esc(f.x.role)}</div>
    <div class="line" style="margin-top:8px"><span>Stock</span><b>${esc(f.x.ticker)}</b></div>
    <div class="line"><span>Action</span><b>${f.x.type === "Buy" ? "BOUGHT" : "SOLD"} ${f.x.shares.toLocaleString()} sh</b></div>
    <div class="line"><span>Value</span><b>${money(f.x.value)}</b></div>
    <div class="line"><span>Date</span><span>${esc(f.x.date)}</span></div>
    <ul>${f.ev.map((e) => `<li>${e}</li>`).join("")}</ul>
    <div style="margin-top:8px;font-size:11px"><a href="${esc(f.x.url)}" target="_blank" rel="noopener">Source filing</a></div></div>`).join("") || `<div class="placeholder">No unusual trades right now.</div>`;
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
    <td class="r">${esc(x.amount || "")}</td></tr>`).join("") || `<tr><td colspan="5" class="meta">${INS.meta.congress_source ? "No matching trades." : "No Congress trades loaded today."}</td></tr>`;
}

var SH;
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
  alarm();
}
const isMajor = (s) => !s.explained && s.news_checked && (Math.abs(s.abnormal) >= 0.04 || s.vol_ratio >= 4 || Math.abs(s.z) >= 3);
function alarm() {
  const recent = [...new Set(SH.shocks.map((s) => s.date))].sort().slice(-3);
  const major = SH.shocks.filter((s) => isMajor(s) && recent.includes(s.date)).sort((a, b) => b.severity - a.severity);
  let dismissed = null;
  try { dismissed = sessionStorage.getItem("alarm-off"); } catch (e) {}
  if (!major.length || dismissed === SH.meta.updated) return;
  const s = major[0];
  const what = s.abnormal < 0 ? `dropped ${pct(s.ret)}` : `jumped ${pct(s.ret)}`;
  $("#alarm-msg").innerHTML = `<b>${esc(s.ticker)}</b> ${what} on ${esc(s.date)} (${Math.abs(s.z).toFixed(1)}× its normal swing, ${s.vol_ratio}× normal volume) with <u>no news and no insider filings</u>.${major.length > 1 ? ` Plus ${major.length - 1} more.` : ""}`;
  $("#alarm").hidden = false;
  document.body.classList.add("shake");
  setTimeout(() => document.body.classList.remove("shake"), 1400);
  $("#alarm-go").onclick = () => { document.querySelector('#tabs [data-tab="shocks"]').click(); $("#sh-only").checked = true; renderShocks(); window.scrollTo(0, 0); };
  $("#alarm-x").onclick = () => { $("#alarm").hidden = true; try { sessionStorage.setItem("alarm-off", SH.meta.updated); } catch (e) {} };
}

let SH_ALL = false;
function renderShocks() {
  const only = $("#sh-only").checked;
  // biggest unexplained-by-market moves first; show the top 5 until the viewer asks for more
  const all = SH.shocks.filter((s) => !only || !s.explained).sort((a, b) => Math.abs(b.abnormal) - Math.abs(a.abnormal));
  const shown = SH_ALL ? all : all.slice(0, 5);
  $("#sh-list").innerHTML = shown.map((s) => {
    const why = s.explained ? `Likely reason: ${s.reasons.map(esc).join("; ")}.`
      : s.news_checked ? `<b class="down">No clear reason found</b>: no news coverage and no insider filings.`
      : `No insider filings around this day. News for this day isn't loaded yet.`;
    const hist = s.past_shocks ? `History: after ${s.past_shocks} similar shocks in 5 years, ${s.ticker} was higher 20 trading days later ${Math.round(s.past_up_rate * 100)}% of the time (average ${pct(s.past_avg_20d)}).` : `First shock like this in 5 years.`;
    return `<div class="card clickable ${isMajor(s) ? "major" : !s.explained && s.news_checked ? "alert" : ""}" data-t="${esc(s.ticker)}">
      <h3><span class="tk" style="font-size:16px">${esc(s.ticker)}</span> <span class="${s.ret < 0 ? "sell" : "buy"}">${esc(s.kind)}</span> <span class="meta">${esc(s.date)}</span>${isMajor(s) ? '<span class="majortag">MAJOR</span>' : ""}</h3>
      <div class="row"><span>Stock</span><b class="${cls(s.ret)}">${pct(s.ret, 2)}</b></div>
      <div class="row"><span>Market that day</span><span class="${cls(s.market)}">${pct(s.market, 2)}</span></div>
      <div class="row"><span>Unexplained by market</span><span class="${cls(s.abnormal)}">${pct(s.abnormal, 2)} (${Math.abs(s.z).toFixed(1)}× normal)</span></div>
      <div class="row"><span>Shares traded</span><span class="${s.vol_ratio >= 2.5 ? "hot" : ""}">${s.vol_ratio}× normal</span></div>
      ${s.unplanned_insider_sells ? `<div class="row"><span class="tag warn">${s.unplanned_insider_sells} unplanned insider sale(s) nearby</span></div>` : ""}
      <div class="why">${why}<br><span class="meta">${hist}</span></div></div>`;
  }).join("") || `<div class="placeholder">No shocks match.</div>`;
  if (all.length > 5) $("#sh-list").insertAdjacentHTML("beforeend", `<button class="btn showmore" id="sh-more">${SH_ALL ? "Show only the top 5" : `Show ${all.length - 5} more shocks`}</button>`);
  $("#sh-more")?.addEventListener("click", () => { SH_ALL = !SH_ALL; renderShocks(); if (!SH_ALL) $("#shocks").scrollIntoView(); });
  document.querySelectorAll("#sh-list .card").forEach((c) => c.onclick = () => openStock(c.dataset.t));
}

let CALLS;
const FACT = ["Price", "Insiders", "Congress", "Shocks", "World"];
const sgn = (x) => `${x > 0 ? "+" : ""}${x}`;
const reasonList = (c, n = 99) => `<ul class="reasons">${c.reasons.slice(0, n).map((r) => `<li><span class="p ${r.pts > 0 ? "up" : r.pts < 0 ? "down" : ""}">${r.pts ? sgn(r.pts) : "·"}</span><span>${r.f ? `<span class="ex rf" data-ex="f-${r.f}">${r.f}</span> ` : ""}${esc(r.text)}</span></li>`).join("")}</ul>`;
function meter(score) {
  const x = Math.max(-5, Math.min(5, score)), w = Math.abs(x) * 10;
  return `<div class="meter" title="Score ${sgn(score)}"><i class="mid"></i><b class="${x >= 0 ? "pos" : "neg"}" style="left:${x >= 0 ? 50 : 50 - w}%;width:${w}%"></b></div>`;
}
const factorChips = (c) => `<div class="fchips">${FACT.map((f) => { const v = c.factors?.[f] ?? 0; return `<span class="fchip ${v > 0 ? "pos" : v < 0 ? "neg" : "zero"}"><span class="fl ex" data-ex="f-${f}">${f}</span><b>${v ? sgn(v) : "0"}</b></span>`; }).join("")}</div>`;
async function calls() {
  CALLS = await load("calls.json");
  const { counts, track_record: tr, live_record: lr } = CALLS.meta;
  const trk = (k) => !tr[k]?.n ? "–" : `<span class="${cls(k === "Sell" ? -tr[k].avg_vs_market : tr[k].avg_vs_market)}">${pct(tr[k].avg_vs_market)}</span> <span class="meta" style="font-size:12px">${EX.ex("vsmarket", "vs market")} a month later, ${tr[k].n.toLocaleString()} replayed calls</span>`;
  $("#calls-kpis").innerHTML = [
    ["Today", `<span class="up">${counts.Buy} Buy</span> · ${counts.Hold} Hold · <span class="down">${counts.Sell} Sell</span>`],
    ["Track record: Buy calls", trk("Buy")],
    ["Track record: Sell calls", trk("Sell")],
  ].map(([l, v]) => `<div class="kpi"><div class="l">${l}</div><div class="v">${v}</div></div>`).join("");
  const live = (k) => lr?.[k]?.n
    ? `<b class="${cls(k === "Sell" ? -lr[k].avg_vs_market : lr[k].avg_vs_market)}">${pct(lr[k].avg_vs_market)}</b> vs market so far · beat it ${Math.round(lr[k].beat_rate * 100)}% of the time (${lr[k].n} calls)`
    : `<span class="meta">first results after the next trading day</span>`;
  $("#calls-record").innerHTML = `<div class="rec-h"><span class="ex" data-ex="record">Live track record</span> <span class="meta">since ${lr ? esc(lr.since) : "today"} · ${lr?.days_logged || 1} day${(lr?.days_logged || 1) === 1 ? "" : "s"} logged</span></div>
    <div class="rec-row"><span class="badge Buy">Buy</span><span>${live("Buy")}</span></div><div class="rec-row"><span class="badge Sell">Sell</span><span>${live("Sell")}</span></div>
    <div class="meta">Every call is saved with its price on the day we make it, then checked against the market. The ${EX.ex("backtest", "replayed record")} above shows how the price rule did over the past four years. Beating the market is hard, so treat these as a starting point for your own research, not advice.</div>`;
  $("#c-q").oninput = $("#c-f").onchange = $("#c-s").onchange = $("#c-w").onchange = renderCalls;
  renderCalls();
}
function renderCalls() {
  if (!CALLS) return;
  const q = $("#c-q").value.trim().toLowerCase(), f = $("#c-f").value, so = $("#c-s").value, w = $("#c-w").checked;
  const list = CALLS.calls.filter((c) => (!f || c.call === f) && (!w || WATCH.has(c.ticker)) && (!q || c.ticker.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)));
  if (so === "low") list.sort((a, b) => a.score - b.score);
  else if (so !== "score") list.sort((a, b) => Math.abs(b.factors?.[so] || 0) - Math.abs(a.factors?.[so] || 0) || b.score - a.score);
  else list.sort((a, b) => b.score - a.score);
  $("#calls-list").innerHTML = list.map((c) => {
    const pts = c.reasons.filter((r) => r.pts);
    return `<div class="card clickable callcard" data-t="${esc(c.ticker)}">
      <h3>${star(c.ticker)} <span class="badge ${c.call}">${c.call}</span> <span class="tk" style="font-size:16px">${esc(c.ticker)}</span> <span class="meta">${esc(c.name)}</span></h3>
      <div class="row"><span>$${c.price.toFixed(2)} <span class="${cls(c.chg_1d)}">${pct(c.chg_1d, 2)}</span></span><span class="sc ${c.score > 0 ? "up" : c.score < 0 ? "down" : ""}">${EX.ex("score", "score")} ${sgn(c.score)}</span></div>
      ${meter(c.score)}${factorChips(c)}
      ${reasonList(pts.length ? { reasons: pts } : c, 3)}</div>`;
  }).join("") || `<div class="placeholder">${w ? "No stocks on your watchlist yet. Tap ☆ on any stock to add it." : "No stocks match."}</div>`;
  document.querySelectorAll("#calls-list .card").forEach((el) => el.onclick = () => openStock(el.dataset.t));
}

(async () => {
  await market();
  await shocks();
  await insiders();
  await Promise.all([world(), calls()]);
  window.DATA_READY = true;
  document.dispatchEvent(new Event("watch"));
})();


// Open a tab from the URL, e.g. #shocks (used by the Ticker Tattler links)
const startTab = location.hash.slice(1);
if (startTab) document.querySelector(`#tabs [data-tab="${CSS.escape(startTab)}"]`)?.click();
