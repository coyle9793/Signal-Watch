// Reality TV roles: a playful, generic archetype for each stock, worked out fresh from each day's data.
// Original archetypes only (no real shows or people). Used by the main site and the Ticker Tattler.
(() => {
  const ROLES = {
    voted:   { name: "Voted Off", icon: "🚪", color: "#ff5c8a", blurb: "The worst week in the whole cast." },
    wild:    { name: "The Wildcard", icon: "🃏", color: "#ffa53d", blurb: "A big move nobody can explain." },
    villain: { name: "The Villain", icon: "🦹", color: "#ff3d6e", blurb: "Insiders selling while the price slides." },
    front:   { name: "The Frontrunner", icon: "👑", color: "#ffd75c", blurb: "At or near its best price of the year." },
    under:   { name: "The Underdog", icon: "🐾", color: "#3ee08f", blurb: "Knocked down, now fighting back." },
    fan:     { name: "The Fan Favourite", icon: "💖", color: "#ff7ad9", blurb: "Steady climber that insiders are buying." },
    drama:   { name: "The Drama Queen", icon: "🎭", color: "#b44dff", blurb: "Wild swings, every single episode." },
    quiet:   { name: "The Quiet One", icon: "🤫", color: "#a59fc9", blurb: "Barely moves. Nobody knows what it's thinking." },
    extra:   { name: "Supporting Cast", icon: "🎬", color: "#6b5cff", blurb: "Nothing dramatic this week." },
  };
  const p = (x) => `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(1)}%`;
  window.ROLES = ROLES;
  // stocks: prices.json stocks (no SPY); signals: insiders.json signals; shocks: shocks.json shocks
  window.castRoles = function (stocks, signals = {}, shocks = []) {
    const out = {};
    const list = stocks.filter((s) => s.ticker !== "SPY");
    const worst = [...list].filter((s) => s.chg_5d != null).sort((a, b) => a.chg_5d - b.chg_5d)[0];
    for (const s of list) {
      const g = signals[s.ticker] || {};
      const sh = shocks.find((x) => x.ticker === s.ticker && !x.explained && x.news_checked);
      let k, why;
      if (worst && s.ticker === worst.ticker) { k = "voted"; why = `Worst week of all ${list.length}: ${p(s.chg_5d)} in five days.`; }
      else if (sh) { k = "wild"; why = `${sh.kind} of ${p(sh.ret)} on ${sh.date} with no news or filings to explain it.`; }
      else if (g.insider_sellers >= 3 && !g.insider_buyers && s.chg_1m <= -0.05) { k = "villain"; why = `${g.insider_sellers} insiders sold, none bought, and it's ${p(s.chg_1m)} this month.`; }
      else if (s.high_52w && s.price >= s.high_52w * 0.98) { k = "front"; why = `Within 2% of its best price this year ($${s.high_52w}).`; }
      else if ((s.chg_3m ?? 0) <= -0.1 && (s.chg_5d ?? 0) >= 0.03) { k = "under"; why = `Down ${p(s.chg_3m).slice(1)} over 3 months, but up ${p(s.chg_5d).slice(1)} this week.`; }
      else if ((g.insider_buyers >= 1 && s.chg_1m > 0) || ((s.chg_3m ?? 0) >= 0.08 && s.volatility_1y < 0.3)) { k = "fan"; why = g.insider_buyers >= 1 ? `Insiders bought, and it's ${p(s.chg_1m)} this month.` : `A calm ${p(s.chg_3m)} climb over 3 months.`; }
      else if (s.volatility_1y >= 0.45 || Math.abs(s.chg_1d) >= 0.04) { k = "drama"; why = Math.abs(s.chg_1d) >= 0.04 ? `${p(s.chg_1d)} in a single day.` : `Swings about ${(s.volatility_1y * 100).toFixed(0)}% a year.`; }
      else if (Math.abs(s.chg_1m ?? 0) < 0.02 && s.volatility_1y < 0.25) { k = "quiet"; why = `Only ${p(s.chg_1m)} this month.`; }
      else { k = "extra"; why = "Nothing dramatic this week."; }
      out[s.ticker] = { key: k, ...ROLES[k], why };
    }
    return out;
  };
  window.roleBadge = (r, small) => r ? `<span class="role${small ? " sm" : ""}${window.EX ? " ex" : ""}" data-ex="role-${r.key}" style="--rc:${r.color}" title="${r.why.replace(/"/g, "&quot;")}">${r.icon} ${r.name}</span>` : "";
  if (window.EX) Object.entries(ROLES).forEach(([k, r]) => (window.EX.G["role-" + k] = [`${r.icon} ${r.name}`, `${r.blurb} Reality TV roles are just for fun: we hand them out fresh each day from the price, insider trades and shocks.`]));
})();
