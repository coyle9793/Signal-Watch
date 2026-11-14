// Today front page and the Watchlist tab. Uses the data app.js has already loaded.
(() => {
  const go = (tab) => `<button class="more" data-go="${tab}">See more →</button>`;
  document.addEventListener("click", (e) => {
    const b = e.target.closest?.("[data-go]");
    if (b) { document.querySelector(`#tabs [data-tab="${b.dataset.go}"]`)?.click(); scrollTo(0, 0); }
    const o = e.target.closest?.("[data-open]");
    if (o && !e.target.closest("[data-star]")) openStock(o.dataset.open);
  });
  const callOf = (t) => CALLS?.calls.find((c) => c.ticker === t);
  const stockOf = (t) => STOCKS.find((s) => s.ticker === t);
  const fmtDate = (iso) => new Date(iso.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const shortDate = (yyyymmdd) => new Date(`${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6)}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const KINDTXT = { conflict: "Armed conflict involving", sanctions: "Tension between", unrest: "Unrest involving", cooperation: "Talks between" };
  const plainTitle = (e) => { const [who] = e.title.split(":"); const the = (n) => /^(United|Netherlands|Philippines|Czech|Democratic|Central African|Gambia|Bahamas)/.test(n) ? "the " + n : n;
    return `${KINDTXT[e.kind] || "Events involving"} ${who.split(" & ").map(the).join(" and ")}`; };
  const mini = (t, extra = "") => { const s = stockOf(t); return `<div class="mini" data-open="${esc(t)}">${star(t)}<b class="tk">${esc(t)}</b><span class="n">${esc(s?.name || "")}</span>${extra}<span class="${cls(s?.chg_1d)}">${pct(s?.chg_1d, 1)}</span></div>`; };

  window.renderToday = function () {
    if (!window.DATA_READY || !STOCKS.length) return;
    const spy = window.SPY || { chg_1d: 0 }, up = STOCKS.filter((s) => s.chg_1d > 0).length, n = STOCKS.length;
    const sorted = [...STOCKS].sort((a, b) => b.chg_1d - a.chg_1d);
    const best = sorted[0], worst = sorted[n - 1];
    const updated = document.querySelector("#updated")?.textContent.replace("Updated ", "") || "";
    $("#t-date").textContent = `${fmtDate(updated)} · S&P 100 daily briefing`;
    const mood = spy.chg_1d <= -0.015 ? ["⛈️", "Stormy"] : up / n < 0.4 ? ["🌧️", "Rainy"] : up / n > 0.6 && spy.chg_1d > 0 ? ["☀️", "Sunny"] : ["⛅", "Mixed"];
    $("#t-mood").innerHTML = `<span class="big">${mood[0]}</span><div><div class="ex" data-ex="weather">${mood[1]} market</div><div class="meta">${up} of ${n} stocks up</div></div>`;

    // headline
    const dir = spy.chg_1d >= 0 ? "rose" : "fell";
    const breadth = (spy.chg_1d < 0 && up > n / 2) ? `, but most stocks (${up} of ${n}) still rose` : (spy.chg_1d > 0 && up < n / 2) ? `, though most stocks (${n - up} of ${n}) fell` : "";
    const sh = SH?.shocks || [], major = sh.filter(isMajor).sort((a, b) => b.severity - a.severity);
    const top = CALLS?.calls[0];
    const know = [
      `${EX.ex("market", "The market")} ${dir} <b class="${cls(spy.chg_1d)}">${pct(Math.abs(spy.chg_1d), 2).replace("+", "")}</b>${breadth}.`,
      `<b>${esc(best.ticker)}</b> had the best day (<span class="up">${pct(best.chg_1d)}</span>) and <b>${esc(worst.ticker)}</b> the worst (<span class="down">${pct(worst.chg_1d)}</span>).`,
      major.length ? `${major.length} ${EX.ex("major", major.length === 1 ? "big unexplained move" : "big unexplained moves")} in the last two weeks, led by <b>${esc(major[0].ticker)}</b> (${pct(major[0].ret)}).` : `No big ${EX.ex("shock", "unexplained moves")} in the last two weeks.`,
      top ? `Our highest ${EX.ex("score", "score")} today is <b>${esc(top.ticker)}</b> (${sgn(top.score)}): ${esc(top.reasons.find((r) => r.pts)?.text.toLowerCase() || "")}.` : "",
    ].filter(Boolean);
    $("#t-headline").innerHTML = `<div class="tlabel">The day in four lines</div><ol class="know">${know.map((k) => `<li>${k}</li>`).join("")}</ol>`;

    // alarm
    const a = major[0] || sh.filter((s) => !s.explained && s.news_checked).sort((x, y) => y.severity - x.severity)[0];
    $("#t-alarm").innerHTML = `<div class="tlabel">${EX.ex("alarm", "Shock watch")}</div>` + (a
      ? `<div class="tbig" data-open="${esc(a.ticker)}"><b class="tk">${esc(a.ticker)}</b> <span class="${cls(a.ret)}">${pct(a.ret)}</span></div>
         <p>${esc(a.kind)} on ${esc(a.date)}: ${Math.abs(a.z).toFixed(1)}× its ${EX.ex("zscore", "normal swing")}, ${a.vol_ratio}× ${EX.ex("vol_ratio", "normal volume")}, and no news or insider filing to explain it.</p>`
      : `<p>All quiet: every recent big move has a clear reason.</p>`) + go("shocks");

    // calls
    if (CALLS) {
      const buys = CALLS.calls.filter((c) => c.call === "Buy").slice(0, 3), sells = [...CALLS.calls].reverse().filter((c) => c.call === "Sell").slice(0, 3);
      const row = (c) => `<div class="mini" data-open="${esc(c.ticker)}">${star(c.ticker)}<span class="badge ${c.call}">${c.call}</span><b class="tk">${esc(c.ticker)}</b><span class="n">${esc(c.name)}</span><span class="sc ${c.score > 0 ? "up" : "down"}">${sgn(c.score)}</span></div>`;
      $("#t-calls").innerHTML = `<div class="tlabel">${EX.ex("score", "Smart calls")}</div>${buys.map(row).join("")}${sells.map(row).join("")}` + go("calls");
    }

    // insiders (named by role, never accused of anything)
    if (INS) {
      const buys = INS.form4.filter((x) => x.type === "Buy").sort((a, b) => b.value - a.value);
      const clusters = Object.entries(INS.signals).filter(([, g]) => g.insider_buyers >= 2).sort((a, b) => b[1].insider_buyers - a[1].insider_buyers);
      const roleName = (r) => ({ Dir: "A director", CEO: "The CEO", CFO: "The CFO", COO: "The COO", Pres: "The president", "10%": "A big shareholder" }[r] || (r ? `An insider (${r})` : "An insider"));
      $("#t-insiders").innerHTML = `<div class="tlabel">${EX.ex("insider", "Insider moves")}</div>` +
        (clusters.length ? `<p><b>${clusters.length}</b> ${clusters.length === 1 ? "stock has" : "stocks have"} ${EX.ex("cluster", "several insiders buying")}: ${clusters.slice(0, 4).map(([t]) => `<b class="tk">${esc(t)}</b>`).join(", ")}.</p>` : "") +
        (buys[0] ? `<p>Biggest own-money buy: ${roleName(buys[0].role)} of <b class="tk">${esc(buys[0].ticker)}</b> bought ${money(buys[0].value)} on ${esc(buys[0].date)}.</p>` : "<p>No insider buying in the last 60 days.</p>") +
        `<p class="meta">${INS.meta.congress_count ? `${INS.meta.congress_count} ${EX.ex("congress", "Congress trades")} on file.` : `${EX.ex("congress", "Congress trades")}: none loaded today.`}</p>` + go("insiders");
    }

    // world: plain, respectful wording
    if (WORLD) {
      const e = WORLD.ev.events[0];
      $("#t-world").innerHTML = `<div class="tlabel">${EX.ex("gdelt", "World news")}</div>` + (e
        ? `<p><b>${esc(plainTitle(e))}</b></p><p>In ${e.articles} news stories on ${shortDate(e.date || WORLD.ev.meta.date)}. ${esc(e.sector)} stocks such as ${e.tickers.slice(0, 3).map((t) => `<b class="tk">${esc(t)}</b>`).join(", ")} are often sensitive to events like this.</p>`
        : "<p>No major international events logged.</p>") + go("world");
    }

    // movers
    const mv = (s) => mini(s.ticker);
    $("#t-movers").innerHTML = `<div class="tlabel">${EX.ex("chg_1d", "Biggest moves")}</div>${sorted.slice(0, 3).map(mv).join("")}${sorted.slice(-3).reverse().map(mv).join("")}` + go("market");

    // watchlist summary
    const w = WATCH.list();
    $("#t-watch").innerHTML = `<div class="tlabel">${EX.ex("watch", "Your watchlist")}</div>` + (w.length
      ? `<div class="wgrid">${w.slice(0, 8).map((t) => { const c = callOf(t); return mini(t, c ? `<span class="badge ${c.call}">${c.call}</span>` : ""); }).join("")}</div>` + go("watch")
      : `<p>Follow stocks by tapping ☆. Try a few:</p><div class="wgrid">${["AAPL", "NVDA", "KO", "TSLA"].filter(stockOf).map((t) => mini(t)).join("")}</div>`);
  };

  // ---- Watchlist tab
  window.renderWatch = function () {
    if (!window.DATA_READY) return;
    const opts = $("#w-opts");
    if (!opts.children.length) opts.innerHTML = STOCKS.map((s) => `<option value="${esc(s.ticker)}">${esc(s.name)}</option>`).join("");
    const w = WATCH.list();
    $("#watch-list").innerHTML = w.map((t) => {
      const s = stockOf(t); if (!s) return "";
      const c = callOf(t);
      const ins = INS?.form4.filter((x) => x.ticker === t) || [];
      const cg = INS?.congress.filter((x) => x.ticker === t) || [];
      const shock = SH?.shocks.find((x) => x.ticker === t);
      const ev = WORLD?.ev.events.slice(0, 5).find((e) => e.tickers.includes(t));
      const lines = [
        ins.length ? `${ins.filter((x) => x.type === "Buy").length} insider buys and ${ins.filter((x) => x.type === "Sell").length} sells in 60 days` : "No insider trades in 60 days",
        cg.length ? `${cg.length} ${EX.ex("congress", "Congress trades")} on file` : "",
        shock ? `${EX.ex("shock", "Shock")}: ${esc(shock.kind.toLowerCase())} on ${esc(shock.date)} (${pct(shock.ret)})` : "",
        ev ? `Sensitive to: ${esc(plainTitle(ev))}` : "",
      ].filter(Boolean);
      return `<div class="card clickable" data-open="${esc(t)}">
        <h3>${star(t)} <span class="tk" style="font-size:16px">${esc(t)}</span> <span class="meta">${esc(s.name)}</span></h3>
        ${window.CAST?.[t] ? `<div class="rolewhy">${roleBadge(window.CAST[t])} <span class="meta">${esc(window.CAST[t].why)}</span></div>` : ""}
        <div class="row"><span>$${s.price.toFixed(2)} <span class="${cls(s.chg_1d)}">${pct(s.chg_1d, 2)}</span></span>${c ? `<span><span class="badge ${c.call}">${c.call}</span> <span class="sc">${sgn(c.score)}</span></span>` : ""}</div>
        <div class="row"><span class="meta">1 month <span class="${cls(s.chg_1m)}">${pct(s.chg_1m)}</span> · 1 year <span class="${cls(s.chg_1y)}">${pct(s.chg_1y)}</span></span>${spark(s.spark)}</div>
        ${c ? meter(c.score) + factorChips(c) : ""}
        <ul class="facts">${lines.map((l) => `<li>${l}</li>`).join("")}</ul></div>`;
    }).join("") || `<div class="placeholder">Your watchlist is empty. Tap ☆ next to any stock, or add one above.</div>`;
  };
  const add = () => { const v = $("#w-add").value.trim().toUpperCase(); const s = STOCKS.find((x) => x.ticker === v || x.name.toUpperCase() === v); if (s) { WATCH.add(s.ticker); $("#w-add").value = ""; } else $("#w-add").setCustomValidity?.("Not in the S&P 100"), $("#w-add").reportValidity?.(), setTimeout(() => $("#w-add").setCustomValidity?.(""), 1500); };
  $("#w-go").onclick = add;
  $("#w-add").onkeydown = (e) => { if (e.key === "Enter") add(); };
  $("#w-clear").onclick = () => { if (WATCH.list().length) WATCH.clear(); };
})();
