// Ticker Tattler extras: "Opp of the day" and "Stockscopes" (sector horoscopes).
// Both are worked out from the site's real data. Rules kept here on purpose:
//  - Opp of the day is about a company's bad day, backed by a linked, reported news story.
//    Stories about anyone's private life, and rumours, are skipped entirely. We say "reported", never guilt.
//  - World events are worded plainly and kept apart from the jokes.
(function () {
  const NEG = new Set("fine fined fines penalty penalties lawsuit lawsuits sue sued sues recall recalls antitrust layoff layoffs cut cuts cutting slash slashes misses missed miss downgrade downgraded downgrades warns warning plunge plunges plunged slump slumps tumble tumbles tumbled fall falls fell drop drops dropped sink sinks sank outage breach hack hacked strike strikes ban banned halt halts halted charged charges settlement settles loss losses guidance delay delays delayed shortfall slowdown weak weaker".split(" "));
  const PRIVATE = new Set("affair affairs wife husband divorce sex sexual cheat cheating cheated girlfriend boyfriend mistress romance romantic dating lover spy spies agent honeytrap scandal rumor rumour rumors rumours controversy controversies nude pregnant marriage wedding relationship alleged allegedly allegation allegations".split(" "));
  const toks = (u) => u.toLowerCase().split(/[^a-z0-9]+/);
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } };
  function headline(u) {
    let segs = [];
    try { segs = new URL(u).pathname.split("/"); } catch (e) {}
    const s = segs.map((x) => x.replace(/\.(s?html?|php|aspx?)$/, "")).filter((x) => x.split("-").length >= 4).sort((a, b) => b.length - a.length)[0];
    if (!s) return null;
    const w = s.split("-").filter((x) => !/^\d{3,}$/.test(x) && !/^[a-f0-9]{8,}$/.test(x) && !/^article_/.test(x));
    while (w.length && /^\d{1,2}$/.test(w[w.length - 1])) w.pop();
    const t = w.join(" ").replace(/\s+/g, " ").trim();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : null;
  }
  const ymd = (iso) => iso.replace(/-/g, "");
  const KINDTXT = { conflict: "Armed conflict involving", sanctions: "Tension between", unrest: "Unrest involving", cooperation: "Talks between" };
  const the = (n) => (/^(United|Netherlands|Philippines|Czech|Democratic|Central African|Gambia|Bahamas)/.test(n) ? "the " + n : n);
  const plainTitle = (e) => `${KINDTXT[e.kind] || "Events involving"} ${e.title.split(":")[0].split(" & ").map(the).join(" and ")}`;

  // ------------------------------------------------------------ Opp of the day
  function findOpp(raw) {
    const links = raw.news?.links || {}, shocks = raw.shocks?.shocks || [];
    const stocks = raw.prices?.stocks || [];
    const by = Object.fromEntries(stocks.map((s) => [s.ticker, s]));
    const GENERIC = new Set(["bank", "general", "american", "united", "international", "the", "first", "capital"]);
    const keyOf = (t) => { const n = (by[t]?.name || "").toLowerCase(); const w = n.split(/[^a-z0-9]+/).filter(Boolean); return [n.replace(/[^a-z0-9]+/g, "-")].concat(w[0] && w[0].length >= 4 && !GENERIC.has(w[0]) ? [w[0]] : []); };
    const names = (t, tk, s) => keyOf(t).some((k) => k.includes("-") ? s.includes(k) : tk.includes(k));
    // the headline must name this company and no other S&P 100 company (so it's really about this one)
    const aboutCo = (t, u) => { const tk = toks(headline(u) || ""); const s = tk.join("-"); return names(t, tk, s) && !stocks.some((o) => o.ticker !== t && o.ticker !== "SPY" && keyOf(o.ticker)[0] !== keyOf(t)[0] && names(o.ticker, tk, s)); };
    function story(t, days) {
      for (const d of days) {
        const l = links[t]?.[d];
        if (!l?.length) continue;
        if (l.some((u) => toks(u).some((w) => PRIVATE.has(w)))) continue;          // private-life story or rumour: skip the whole day
        const hit = l.find((u) => headline(u) && aboutCo(t, u) && toks(headline(u)).some((w) => NEG.has(w)));
        if (hit && !toks(headline(hit)).some((w) => PRIVATE.has(w))) return { url: hit, head: headline(hit), src: host(hit), day: d };
      }
      return null;
    }
    const prev = (d) => { const x = new Date(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}T12:00:00Z`); x.setUTCDate(x.getUTCDate() - 1); return x.toISOString().slice(0, 10).replace(/-/g, ""); };
    const cands = shocks.filter((s) => s.ret < 0 && s.abnormal < 0).sort((a, b) => a.abnormal - b.abnormal);
    for (const s of cands) {
      const st = story(s.ticker, [ymd(s.date), prev(ymd(s.date))]);
      if (st && by[s.ticker]) return { s: by[s.ticker], ret: s.ret, date: s.date, ...st };
    }
    const days = (raw.news?.meta?.news_days || []).slice(-3).reverse();
    for (const s of [...stocks].filter((x) => x.ticker !== "SPY" && x.chg_1d <= -0.015).sort((a, b) => a.chg_1d - b.chg_1d)) {
      const st = story(s.ticker, days);
      if (st) return { s, ret: s.chg_1d, date: s.date, ...st };
    }
    return null;
  }
  const QUIPS = [
    ["cut", "cuts", "layoff", "layoffs", "slash", "slashes"], "Downsizing is never a good look, darling.",
    ["recall", "recalls"], "Sending things back? Not the kind of return investors wanted.",
    ["fine", "fined", "fines", "penalty", "penalties", "settlement", "settles"], "That's an expensive day out.",
    ["lawsuit", "lawsuits", "sue", "sued", "sues"], "Lawyers at the door are never good for the mood.",
    ["antitrust"], "Regulators asking questions? Investors started asking too.",
    ["misses", "missed", "miss", "shortfall", "guidance", "warns", "warning", "weak", "weaker", "slowdown"], "Promised the world, delivered a bit less of it.",
    ["downgrade", "downgraded", "downgrades"], "The critics have spoken, and they weren't kind.",
    ["outage", "breach", "hack", "hacked"], "Lights out, and the shareholders noticed.",
  ];
  function quip(head) {
    const w = toks(head);
    for (let i = 0; i < QUIPS.length; i += 2) if (QUIPS[i].some((k) => w.includes(k))) return QUIPS[i + 1];
    return "Not the headline anyone wanted on their big day.";
  }
  window.renderOpp = function (raw, h) {
    const { esc, pct, apct, fmt, logoBig } = h;
    const o = findOpp(raw);
    if (!o) return `<section class="panel opp-empty" id="opp-i"><p class="kick">08 · OPP OF THE DAY</p><h2>No opp today</h2><p class="note">No big fall this week came with a clear, reported company reason, so nobody gets the side-eye today.</p></section>`;
    return `<section class="panel opp" id="opp-i">
      <div class="opp-art">
        <div class="opp-frame">${logoBig(o.s.ticker)}<svg class="crack" viewBox="0 0 200 200" aria-hidden="true"><path d="M104 0 L92 46 L118 78 L84 118 L110 150 L96 200" /><path d="M118 78 L160 70 M84 118 L40 132 M110 150 L150 176" /></svg></div>
        <span class="opp-arrow" aria-hidden="true">▼ ${apct(o.ret)}</span>
      </div>
      <div class="opp-body">
        <p class="kick">08 · OPP OF THE DAY</p>
        <h2><span class="gt glow">${esc(o.s.name)}</span> had a bad day</h2>
        <p class="opp-num"><b class="neg">${pct(o.ret)}</b> on ${fmt(o.date)}</p>
        <p class="opp-q">“${esc(o.head)}”</p>
        <p class="note">As reported by <a href="${esc(o.url)}" target="_blank" rel="noopener">${esc(o.src)}</a>. ${esc(quip(o.head))}</p>
        <p class="note small">We pick the biggest fall this week that came with a reported company reason, such as job cuts, fines, recalls or a profit warning. It's about the company's day, not anyone's private life, and a report isn't proof of wrongdoing.</p>
      </div>
    </section>`;
  };

  // ------------------------------------------------------------ Stockscopes
  const SIGNS = {
    "Technology": ["The Circuit", "Tech", '<path d="M10 24h8l4-10 6 20 4-10h6"/><circle cx="24" cy="24" r="19"/>'],
    "Energy": ["The Flame", "Energy", '<path d="M24 6c6 9 12 13 12 22a12 12 0 0 1-24 0c0-6 4-9 6-14 2 4 3 6 6 7 0-6-1-10 0-15z"/>'],
    "Financials": ["The Vault", "Banks & finance", '<circle cx="24" cy="24" r="16"/><circle cx="24" cy="24" r="10"/><path d="M24 14v20M20 18h6a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h6"/>'],
    "Health Care": ["The Pulse", "Health care", '<path d="M24 40S8 30 8 19a8 8 0 0 1 16-3 8 8 0 0 1 16 3c0 11-16 21-16 21z"/><path d="M14 24h6l2-4 4 8 2-4h6"/>'],
    "Industrials": ["The Gear", "Industrials", '<circle cx="24" cy="24" r="7"/><path d="M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4"/><circle cx="24" cy="24" r="13"/>'],
    "Consumer Staples": ["The Pantry", "Everyday brands", '<path d="M10 20h28l-3 18H13z"/><path d="M17 20l5-10M31 20l-5-10"/><path d="M18 26v6M24 26v6M30 26v6"/>'],
    "Consumer Discretionary": ["The Splurge", "Shopping & fun", '<path d="M12 16h24l-2 24H14z"/><path d="M18 16a6 6 0 0 1 12 0"/><path d="M24 26l2 4 4 .5-3 3 1 4-4-2-4 2 1-4-3-3 4-.5z"/>'],
    "Communication": ["The Signal", "Media & telecoms", '<circle cx="24" cy="30" r="3"/><path d="M16 22a11 11 0 0 1 16 0M11 17a18 18 0 0 1 26 0M24 33v9"/>'],
    "Utilities": ["The Current", "Utilities", '<path d="M27 6L13 27h10l-3 15 15-22H25z"/>'],
    "Real Estate": ["The Key", "Real estate", '<path d="M8 23L24 9l16 14"/><path d="M13 20v19h22V20"/><circle cx="24" cy="29" r="4"/><path d="M24 33v6"/>'],
    "Materials": ["The Crystal", "Materials", '<path d="M24 6l14 12-14 24L10 18z"/><path d="M10 18h28M24 6l-6 12 6 24 6-24z"/>'],
  };
  const glyph = (svg, size = 36) => `<svg viewBox="0 0 48 48" style="width:${size}px;height:${size}px">${svg}</svg>`;
  function reading(x, pct, calm) {   // calm: the sign is linked to a world event today, so no nerves jokes
    const { n, up, d, m, ib, isl, shk } = x;
    let mood, a;
    if (d <= -0.01) { mood = "Eclipsed"; a = `A rough day: ${pct(d)} today and ${pct(m)} this month. Rest, recharge, and remember that pullbacks have tended to partly recover.`; }
    else if (up === n && n > 1) { mood = "Radiant"; a = `Every one of your ${n} stocks rose today. You're the friend everyone suddenly wants at the party.`; }
    else if (ib >= 3 && ib >= isl) { mood = "Lucky"; a = `Insiders bought ${ib} times and sold ${isl}: the people with the keys are buying more keys.`; }
    else if (!calm && shk >= 6) { mood = "Impulsive"; a = `${shk} surprise moves in two weeks. You're acting on feelings again, so keep the receipt.`; }
    else if (m >= 0.05) { mood = "Glowing"; a = `Up ${pct(m).replace("+", "")} this month, which is quite a sparkle. Enjoy the glow.`; }
    else if (d >= 0.005) { mood = "Confident"; a = `${up} of ${n} up today. Walk tall.`; }
    else if (d > 0) { mood = "Steady"; a = `A small step up today (${pct(d)}). Slow and steady suits you.`; }
    else { mood = "Grinding"; a = `${up} up and ${n - up} down. Head down, keep working.`; }
    let b = "";
    if (mood !== "Lucky" && isl >= 10 && ib <= 1) b = ` Insiders sold ${isl} times and bought ${ib}, so don't let the compliments go to your head.`;
    else if (mood !== "Lucky" && ib >= 3 && ib * 3 >= isl) b = ` Insiders bought ${ib} times. Someone believes in you.`;
    else if (!calm && mood !== "Impulsive" && shk >= 4) b = ` ${shk} surprise moves lately say your nerves are jangling.`;
    return { mood, text: a + b };
  }
  window.renderScopes = function (raw, h) {
    const { esc, pct, fmtG } = h;
    const stocks = (raw.prices?.stocks || []).filter((s) => s.ticker !== "SPY" && s.sector);
    const sig = raw.insiders?.signals || {}, shocks = raw.shocks?.shocks || [], evs = (raw.events?.events || []).slice(0, 5);
    const calls = Object.fromEntries((raw.calls?.calls || []).map((c) => [c.ticker, c]));
    const groups = {};
    stocks.forEach((s) => (groups[s.sector] ||= []).push(s));
    const list = Object.entries(groups).filter(([k]) => SIGNS[k]).map(([k, ss]) => {
      const ts = ss.map((s) => s.ticker);
      const x = {
        k, n: ss.length, up: ss.filter((s) => s.chg_1d > 0).length,
        d: ss.reduce((a, s) => a + s.chg_1d, 0) / ss.length, m: ss.reduce((a, s) => a + (s.chg_1m || 0), 0) / ss.length,
        ib: ts.reduce((a, t) => a + (sig[t]?.insider_buyers || 0), 0), isl: ts.reduce((a, t) => a + (sig[t]?.insider_sellers || 0), 0),
        shk: shocks.filter((s) => ts.includes(s.ticker)).length,
      };
      const ev = evs.find((e) => e.tickers.some((t) => ts.includes(t)));
      const lucky = [...ss].sort((a, b) => (calls[b.ticker]?.score ?? -9) - (calls[a.ticker]?.score ?? -9) || b.chg_1d - a.chg_1d)[0];
      return { ...x, ...reading(x, pct, !!ev), lucky, call: calls[lucky.ticker], ev, stars: Math.max(1, Math.min(5, Math.round(3 + x.d * 130))) };
    }).sort((a, b) => b.d - a.d);
    if (!list.length) return "";
    const top = list[0];
    const stars = (n) => `<span class="st">${"★".repeat(n)}<span class="st-off">${"★".repeat(5 - n)}</span></span>`;
    const world = (e) => e ? `<p class="sc-world">World watch: ${esc(plainTitle(e))} was in ${e.articles} news stories on ${fmtG(e.date)}. ${esc(e.sector)} stocks are often sensitive to events like this.</p>` : "";
    const card = (x) => {
      const [name, short, svg] = SIGNS[x.k];
      return `<article class="sc-card">
        <div class="sc-sign"><div class="sc-glyph">${glyph(svg)}</div><div><p class="sc-n gt">${name}</p><p class="sc-s">${esc(short)} · ${x.n} stock${x.n > 1 ? "s" : ""}</p></div></div>
        <div class="sc-mood"><span>Mood: <b>${x.mood}</b></span>${stars(x.stars)}</div>
        <p class="sc-fc">${esc(x.text)}</p>
        <div class="sc-reads"><div><span>Today</span><b class="${x.d >= 0 ? "pos" : "neg"}">${pct(x.d)}</b></div><div><span>Insiders</span><b><i class="pos">${x.ib}↑</i> <i class="neg">${x.isl}↓</i></b></div><div><span>Shocks</span><b>${x.shk}</b></div></div>
        ${world(x.ev)}
        <div class="sc-lucky"><span class="sc-lk">Lucky stock</span><span class="sc-tk">${esc(x.lucky.ticker)}</span><span class="sc-ln">${esc(x.lucky.name)}</span>${x.call ? `<span class="sc-b ${x.call.call}">${x.call.call} ${x.call.score > 0 ? "+" : ""}${x.call.score}</span>` : ""}</div>
      </article>`;
    };
    const [tn, ts, tsvg] = SIGNS[top.k];
    return `<section class="sec scopes" id="scopes-i">
      <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="ng" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#b44dff"/><stop offset=".55" stop-color="#6b5cff"/><stop offset="1" stop-color="#2ef2ff"/></linearGradient></defs></svg>
      <div class="sec-head"><div><p class="kick">09 · STOCKSCOPES</p><h2>What the <span class="gt glow">stars</span> say about your sector</h2></div>
        <p class="note">Every mood, star and lucky stock is read from real data. The stars are for fun. The numbers are real.</p></div>
      <div class="sc-hero"><div class="sc-glyph big">${glyph(tsvg, 80)}</div>
        <div><p class="kick">SIGN OF THE DAY</p><p class="sc-hn gt glow">${tn}</p><p class="sc-s">${esc(ts)} · ${top.up} of ${top.n} stocks up · ${pct(top.d)} today</p><p class="sc-fc big">“${esc(top.text)}”</p></div></div>
      <div class="sc-grid">${list.map(card).join("")}
        <article class="sc-card sc-key"><p class="kick">HOW TO READ YOUR STARS</p>
          <p class="sc-fc">★ Stars: how the sign did today, from one (rough day) to five (glowing).</p>
          <p class="sc-fc">Mood: today, the month, insider trades and shocks, read together.</p>
          <p class="sc-fc">Lucky stock: the sign's top Smart calls score.</p>
          <p class="sc-fc">World watch: plain facts about world events the sign is sensitive to.</p></article></div>
    </section>`;
  };

  // ------------------------------------------------------------ 10. The cast list (reality TV roles)
  window.renderCast = function (raw, h) {
    const { esc, logo } = h;
    if (!window.castRoles) return "";
    const stocks = (raw.prices?.stocks || []).filter((s) => s.ticker !== "SPY");
    const cast = window.castRoles(stocks, raw.insiders?.signals || {}, raw.shocks?.shocks || []);
    const strength = (s) => Math.abs(s.chg_5d ?? s.chg_1d ?? 0);
    const order = ["voted", "wild", "villain", "front", "under", "fan", "drama", "quiet"];
    const cards = order.map((k) => {
      const members = stocks.filter((s) => cast[s.ticker]?.key === k).sort((a, b) => k === "quiet" ? strength(a) - strength(b) : strength(b) - strength(a));
      if (!members.length) return "";
      const lead = members[0], r = cast[lead.ticker];
      return `<article class="cast-card" style="--rc:${r.color}">
        <p class="cast-role"><span class="cast-ic">${r.icon}</span>${r.name}</p>
        <p class="cast-who">${logo(lead.ticker)}<b>${esc(lead.name)}</b></p>
        <p class="cast-why">${esc(r.why)}</p>
        ${members.length > 1 ? `<p class="cast-also">Also cast: ${members.slice(1, 6).map((m) => esc(m.ticker)).join(" · ")}${members.length > 6 ? ` +${members.length - 6}` : ""}</p>` : ""}
      </article>`;
    }).join("");
    const n = Object.values(cast).filter((r) => r.key === "extra").length;
    return `<section class="sec cast" id="cast-i">
      <div class="sec-head"><div><p class="kick">10 · THE CAST LIST</p><h2>This week's <span class="gt glow">cast</span></h2></div>
        <p class="note">Every stock gets a role, recast daily from its price, insider trades and shocks. ${n} are supporting cast this week. All in good fun.</p></div>
      <div class="cast-grid">${cards}</div>
    </section>`;
  };
})();
