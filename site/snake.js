// "Who's the Snake?" -- a daily guessing game. Six companies sit at the round table; one had the worst week
// of the whole S&P 100 (the snake). Read the clue cards, vote, and see the reveal with the evidence.
// Original game: no show names or terms. Reported news only, never private-life rumours.
(() => {
  const PRIVATE = new Set("affair affairs wife husband divorce sex sexual cheat cheating cheated girlfriend boyfriend mistress romance romantic dating lover spy spies agent honeytrap scandal rumor rumour rumors rumours nude pregnant marriage wedding relationship alleged allegedly allegation allegations controversy controversies".split(" "));
  const toks = (u) => String(u).toLowerCase().split(/[^a-z0-9]+/);
  const p = (x, d = 1) => (x == null ? "–" : `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(d)}%`);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const KEY = "snake-game";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } };
  const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
  function rng(seed) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296; }
  function headline(u) {
    let segs = []; try { segs = new URL(u).pathname.split("/"); } catch (e) {}
    const s = segs.map((x) => x.replace(/\.(s?html?|php|aspx?)$/, "")).filter((x) => x.split("-").length >= 4).sort((a, b) => b.length - a.length)[0];
    if (!s) return null;
    const w = s.split("-").filter((x) => !/^\d{3,}$/.test(x) && !/^[a-f0-9]{8,}$/.test(x)); while (w.length && /^\d{1,2}$/.test(w[w.length - 1])) w.pop();
    const t = w.join(" ").trim(); if (!t || toks(t).some((x) => PRIVATE.has(x))) return null;
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function story(t, name, news) {
    const key = (name || "").toLowerCase().split(/[^a-z0-9]+/)[0];
    const days = Object.keys(news?.links?.[t] || {}).sort().reverse().slice(0, 5);
    for (const d of days) {
      const l = news.links[t][d];
      if (l.some((u) => toks(u).some((w) => PRIVATE.has(w)))) continue;
      const u = l.find((u) => { const h = headline(u); return h && key && toks(h).includes(key); });
      if (u) { let src = ""; try { src = new URL(u).hostname.replace(/^www\./, ""); } catch (e) {} return { head: headline(u), url: u, src }; }
    }
    return null;
  }

  // build today's table from the data
  function table(d) {
    const stocks = d.stocks.filter((s) => s.ticker !== "SPY" && s.chg_5d != null);
    const day = d.day || stocks[0]?.date || "today";
    const snake = [...stocks].sort((a, b) => a.chg_5d - b.chg_5d)[0];
    const r = rng(day);
    const sig = d.signals || {}, sh = d.shocks || [];
    const interesting = (s) => Math.abs(s.chg_1d) >= 0.015 || (sig[s.ticker]?.insider_sellers || 0) >= 3 || sh.some((x) => x.ticker === s.ticker) || s.chg_1m <= -0.05;
    // red herrings: suspicious-looking stocks that did NOT have the worst week
    const pool = stocks.filter((s) => s !== snake && interesting(s)).sort(() => r() - 0.5);
    const suspects = [snake, ...pool.slice(0, 5)].sort(() => r() - 0.5);
    const clues = (s) => {
      const g = sig[s.ticker] || {}, x = sh.find((y) => y.ticker === s.ticker);
      return [
        ["Today", p(s.chg_1d), s.chg_1d < 0 ? "neg" : "pos"],
        ["This month", p(s.chg_1m), s.chg_1m < 0 ? "neg" : "pos"],
        ["Insiders", `${g.insider_buyers || 0} bought · ${g.insider_sellers || 0} sold`, (g.insider_sellers || 0) >= 3 && !g.insider_buyers ? "neg" : ""],
        ["Shock", x ? `${x.kind.toLowerCase()} on ${x.date.slice(5)}` : "none", x ? (x.ret < 0 ? "neg" : "pos") : ""],
        ["Volume", `${(s.vol_ratio ?? 1).toFixed(1)}× normal`, s.vol_ratio >= 2 ? "warn" : ""],
      ];
    };
    return { day, snake, suspects, clues, story: story(snake.ticker, snake.name, d.news) };
  }

  window.renderSnake = function (el, d, opts = {}) {
    if (!el || !d?.stocks?.length) return;
    const T = table(d), st = load();
    const pick = st.played?.[T.day];
    const logo = opts.logo || ((t) => `<span class="sn-tk">${esc(t)}</span>`);
    const seat = (s, i) => {
      const n = T.suspects.length, a = (i / n) * Math.PI * 2 - Math.PI / 2;
      return `style="--x:${(50 + 41 * Math.cos(a)).toFixed(1)}%;--y:${(50 + 38 * Math.sin(a)).toFixed(1)}%"`;
    };
    const revealed = !!pick, right = pick === T.snake.ticker;
    el.innerHTML = `
      <div class="sn-head"><div><p class="sn-kick">Daily game · ${esc(T.day)}</p><h2 class="sn-title">Who's the <span class="sn-gt">Snake?</span> 🐍</h2>
        <p class="sn-sub">Six companies at the table. One of them had the <b>worst week of all ${d.stocks.length - 1}</b>. Read the clues and vote.</p></div>
        <div class="sn-streak"><b>${st.streak || 0}</b><span>day streak</span><small>best ${st.best || 0}</small></div></div>
      <div class="sn-table">
        <div class="sn-round" aria-hidden="true"><span>🐍</span></div>
        ${T.suspects.map((s, i) => `<button class="sn-seat${revealed ? (s === T.snake ? " is-snake" : pick === s.ticker ? " is-wrong" : " is-out") : ""}" data-snake="${esc(s.ticker)}" ${seat(s, i)} ${revealed ? "disabled" : ""}>
          <span class="sn-logo">${logo(s.ticker)}</span><b>${esc(s.ticker)}</b><small>${esc(s.name)}</small>${revealed ? `<em>${p(s.chg_5d)} week</em>` : ""}</button>`).join("")}
      </div>
      <div class="sn-clues">${T.suspects.map((s) => `<div class="sn-card${revealed && s === T.snake ? " is-snake" : ""}"><p class="sn-ch">${logo(s.ticker)} <b>${esc(s.ticker)}</b>${revealed && s === T.snake ? " 🐍" : ""}</p>
        ${T.clues(s).map(([k, v, c]) => `<div class="sn-row"><span>${k}</span><b class="${c}">${esc(v)}</b></div>`).join("")}</div>`).join("")}</div>
      ${revealed ? `<div class="sn-reveal ${right ? "ok" : "no"}">
          <p class="sn-verdict">${right ? "You found the snake! 🎉" : `Not this time. You voted ${esc(pick)}.`}</p>
          <p>The snake was <b>${esc(T.snake.name)}</b>: <b class="neg">${p(T.snake.chg_5d)}</b> in five days, the worst week of the whole S&amp;P 100.${T.story ? ` In the news: “${esc(T.story.head)}” (<a href="${esc(T.story.url)}" target="_blank" rel="noopener">${esc(T.story.src)}</a>).` : ""}</p>
          <p class="sn-fine">New table tomorrow. The snake is picked from real price data, and any headline is as reported, not proof of wrongdoing. Just a game, not financial advice.</p></div>`
        : `<p class="sn-hint">Hint: the snake's week was worse than its day or month might suggest. Tap a company to vote. You get one vote a day.</p>`}`;
    el.querySelectorAll("[data-snake]").forEach((b) => b.addEventListener("click", () => {
      const s = load(); s.played = s.played || {};
      if (s.played[T.day]) return;
      s.played[T.day] = b.dataset.snake;
      const ok = b.dataset.snake === T.snake.ticker;
      s.streak = ok ? (s.lastWin && s.lastWin !== T.day ? (s.streak || 0) + 1 : 1) : 0;
      if (ok) s.lastWin = T.day;
      s.best = Math.max(s.best || 0, s.streak);
      const keys = Object.keys(s.played).sort(); while (keys.length > 60) delete s.played[keys.shift()];
      save(s); window.renderSnake(el, d, opts);
      document.dispatchEvent(new Event("snake"));
    }));
  };
})();
