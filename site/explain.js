// "What does this mean?" for every term on the site.
// Any element with class "ex" and data-ex="<key>" gets a dotted underline and a pop-up explanation.
// Labels, headers, pills and tags are also matched by their text automatically (see ALIAS).
(() => {
  const G = {
    "ex-demo": ["Like this!", "Every dotted word on Signal Watch has a plain-English explanation. Tap it on a phone, or hover on a laptop."],
    market: ["The market (S&P 500)", "The S&P 500 is an index of 500 of the biggest US companies. When people say “the market was up 1%”, they usually mean this. We use it as the yardstick for every stock."],
    sp100: ["S&P 100", "The 100 largest companies in the S&P 500, such as Apple, Microsoft and Coca-Cola. These are the stocks Signal Watch follows."],
    rising: ["Rising / falling", "How many of the 100 stocks went up today versus down. Lots of risers with a falling index means a few giants dragged it down."],
    chg_1d: ["Today", "How much the price changed since yesterday's close, in percent."],
    chg_1m: ["1 month", "Price change over the last 21 trading days (about a calendar month)."],
    chg_1y: ["1 year", "Price change over the last 252 trading days (about a calendar year)."],
    vol_ratio: ["Volume vs normal", "How many shares changed hands today compared with a normal day (the 50-day average). 3× means three times the usual trading: someone big is buying or selling."],
    busiest: ["Busiest trading", "The stock with the highest volume versus its normal. Unusual volume is often the first sign that something is going on."],
    spark: ["60-day line", "A tiny chart of the last 60 trading days. Green if it ended higher than it started, pink if lower."],
    price: ["Price", "The latest share price in US dollars, from Yahoo Finance. Prices can be delayed by up to 15 minutes."],
    insider: ["Insider", "A company's directors, top bosses (CEO, CFO and so on) and anyone owning 10%+ of it. They must report every trade in their own company's shares."],
    form4: ["SEC Form 4", "The form insiders file with the US Securities and Exchange Commission (SEC) within two business days of trading their company's shares. It's public, which is how we can see them."],
    unplanned: ["Unplanned sale", "A sale that wasn't set up in advance. Many insiders sell on a pre-agreed schedule (a 10b5-1 plan) for taxes or diversification, which tells you little. Unplanned sales are more interesting."],
    planned: ["Planned (10b5-1)", "A trade set up months in advance on a fixed schedule, so it can't be based on new information. Usually routine."],
    cluster: ["Where insiders agree", "When several insiders buy (or sell) the same stock around the same time. Cluster buying is one of the best-studied signals in finance research."],
    spy: ["Spy files", "A case file for every insider trade. We stamp it UNUSUAL if it fits a pattern worth a closer look. Unusual never means illegal: it only means interesting."],
    unusual: ["Unusual", "This trade fits a pattern worth a closer look, such as a sale just before a drop, or several insiders moving together. It does not mean anyone did anything wrong."],
    routine: ["Routine", "Nothing stands out about this trade."],
    congress: ["Congress trades", "Members of the US House and Senate must report stock trades within 45 days (the STOCK Act). We read the official House Clerk and Senate filings for free."],
    late: ["Filed late", "The law asks members of Congress to report trades within 45 days. “Filed late” means the report came after that."],
    amount: ["Amount", "Congress reports trades as a range (e.g. $1,001–$15,000), not an exact figure."],
    shock: ["Surprise shock", "A day when a stock moved far more than the market explains, or traded 3× its normal volume. We then check the news and insider filings for a reason."],
    unexplained: ["Unexplained by the market", "The part of the move the market can't account for. If the market fell 1% and the stock fell 6%, about 5% is the stock's own story."],
    zscore: ["× normal swing", "How big the move was compared with this stock's usual daily wobble. 2.5× or more is rare: it happens on only a few days a year."],
    major: ["Major shock", "A big unexplained move (4%+ beyond the market, 4× normal volume, or 3× its normal swing) with no news and no insider filings. That's what sets off the shock alarm."],
    alarm: ["Shock alarm", "The siren goes off when a major shock happened in the last three trading days and we can't find any reason for it."],
    gdelt: ["GDELT", "The Global Database of Events, Language and Tone. It reads news from around the world every day and logs who did what to whom. It's free and public."],
    tone: ["Tone", "How positive or negative the news coverage was, from about −10 (very negative) to +10 (very positive)."],
    risk: ["Market risk score", "Our estimate of how likely an event is to move stocks: how serious it is, how much it's in the news, and which countries are involved."],
    conflict: ["Conflict", "Fighting or the use of force between countries or groups. Energy and defence stocks are often sensitive to these events."],
    sanctions: ["Tension", "Threats, sanctions, protests between governments and other non-violent pressure. Can affect trade and companies that sell abroad."],
    unrest: ["Unrest", "Protests, strikes or instability inside a country."],
    cooperation: ["Diplomacy", "Agreements, aid, talks and other cooperation between countries."],
    score: ["Score", "We add up points from five rules (price, insiders, Congress, shocks and world events). +2 or more is a Buy, −2 or less a Sell, otherwise Hold. Every point shows its reason."],
    Buy: ["Buy", "The score is +2 or more: our rules see more reasons for the stock to do better than the market than worse. Not financial advice."],
    Hold: ["Hold", "The score is between −2 and +2: not enough evidence either way."],
    Sell: ["Sell", "The score is −2 or less: our rules see more reasons for the stock to lag the market. Not financial advice."],
    "f-Price": ["Price points", "Stocks that fell well behind the market over a month have tended to partly bounce back, and big runs have tended to partly fade. +2 or −2."],
    "f-Insiders": ["Insider points", "Insiders buying with their own money is a good sign (+1 or +2). Lots of unplanned selling is a mild bad sign (−1)."],
    "f-Congress": ["Congress points", "+0.5 for each net buy by members of Congress, capped at ±1. Their trades are reported late, so this is a weak signal."],
    "f-Shocks": ["Shock points", "An unexplained sell-off in the last 10 days costs points (−1.5). How the stock recovered after past shocks adds or removes 0.5."],
    "f-World": ["World points", "−0.5 if the stock is in a sector exposed to one of today's five biggest world events."],
    record: ["Live track record", "Every day we save each call and its price. Later we check how the stock did against the market since. This is the honest scoreboard, and it grows every day."],
    backtest: ["Backtest", "Replaying a rule on past prices to see how it would have done. Useful, but the past doesn't guarantee the future."],
    beat: ["Beat rate", "The share of calls where the stock did better than the market afterwards. 50% is a coin flip."],
    vsmarket: ["Vs market", "The stock's return minus the S&P 500's return over the same time. +2% means it beat the market by 2 points."],
    sma200: ["200-day average", "The average closing price over the last 200 trading days. Above it usually means a long-term uptrend; below means a downtrend."],
    volatility: ["Volatility", "How much the price swings in a typical year. 20% is calm for a stock; 50% is wild."],
    beta: ["Beta", "How much a stock moves when the market moves. 1.5 means it tends to move 1.5% when the market moves 1%."],
    drawdown: ["From its high", "How far the price is below its highest point in the last five years."],
    weather: ["Market weather", "A one-glance mood: sunny when most stocks are up, rain when most are down, storms when the market falls hard."],
    watch: ["Watchlist", "Stocks you follow. Saved in this browser only, so it stays private and needs no account."],
    sector: ["Sector", "The part of the economy a company is in, like Technology, Energy or Health Care. Stocks in the same sector often move together."],
  };
  // label text (lower case) -> glossary key
  const ALIAS = {
    "market (s&p 500)": "market", "rising / falling": "rising", "best today": "chg_1d", "worst today": "chg_1d", "busiest trading": "busiest",
    "insider buying (60 days)": "insider", "insider selling": "insider", "insiders buying / selling": "insider", "congress trades": "congress",
    "where insiders agree": "cluster", "spy files": "spy", "company insiders": "insider", "sec form 4": "form4", "members of congress": "congress",
    "unusual": "unusual", "routine": "routine", "planned": "planned", "amount": "amount", "with no clear reason": "unexplained",
    "biggest sell-off": "shock", "biggest volume spike": "vol_ratio", "unexplained by market": "unexplained", "shares traded": "vol_ratio",
    "market that day": "market", "major": "major", "shock alarm": "alarm", "conflict": "conflict", "tension": "sanctions", "unrest": "unrest",
    "diplomacy": "cooperation", "buy": "Buy", "hold": "Hold", "sell": "Sell", "hot spots today": "risk", "events most likely to move markets": "risk",
    "what history says": "backtest", "track record: buy calls": "backtest", "track record: sell calls": "backtest", "stock": "sp100",
    "traded": "congress", "member": "congress", "trade": "form4", "value": "form4", "who": "insider",
  };
  const SEL = ".kpi .l, h2.h2, .pill, .tag, .badge, .stamp, .row > span:first-child, .maplegend span, th, .majortag, .fchip .fl";
  let pop;
  function show(el) {
    const g = G[el.dataset.ex]; if (!g) return;
    pop ||= Object.assign(document.createElement("div"), { className: "expop", role: "tooltip" });
    pop.innerHTML = `<b>${g[0]}</b><div>${g[1]}</div>`;
    document.body.appendChild(pop);
    const r = el.getBoundingClientRect(), w = Math.min(300, innerWidth - 24);
    pop.style.width = w + "px";
    pop.style.left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2)) + "px";
    const below = r.bottom + 8 + pop.offsetHeight < innerHeight;
    pop.style.top = (below ? r.bottom + 8 : r.top - pop.offsetHeight - 8) + scrollY + "px";
    pop.hidden = false;
  }
  const hide = () => pop && (pop.hidden = true);
  document.addEventListener("mouseover", (e) => { const el = e.target.closest?.(".ex"); if (el && matchMedia("(hover:hover)").matches) show(el); });
  document.addEventListener("mouseout", (e) => { if (e.target.closest?.(".ex")) hide(); });
  document.addEventListener("focusin", (e) => { if (e.target.classList?.contains("ex")) show(e.target); });
  document.addEventListener("focusout", hide);
  document.addEventListener("click", (e) => {
    const el = e.target.closest?.(".ex");
    if (el && el.closest("th") && matchMedia("(hover:hover)").matches) return;   // let header clicks sort on laptops
    if (el) { e.stopPropagation(); e.preventDefault(); pop && !pop.hidden && pop._for === el ? hide() : (show(el), pop && (pop._for = el)); }
    else hide();
  }, true);
  addEventListener("scroll", hide, { passive: true });

  function tag(root = document) {
    root.querySelectorAll(SEL).forEach((el) => {
      if (el.querySelector(".ex") || el.closest(".ex") || el.dataset.exDone) return;
      el.dataset.exDone = 1;
      const txt = el.textContent.trim().toLowerCase().replace(/\s+/g, " ");
      const key = ALIAS[txt] || ALIAS[txt.replace(/\s*\(.*\)$/, "")];
      if (key && G[key]) { el.classList.add("ex"); el.dataset.ex = key; el.tabIndex = 0; }
    });
    root.querySelectorAll(".ex:not([tabindex])").forEach((el) => (el.tabIndex = 0));
  }
  let t;
  new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => tag(), 120); }).observe(document.documentElement, { childList: true, subtree: true });
  window.EX = { G, tag, ex: (key, label) => `<span class="ex" data-ex="${key}" tabindex="0">${label}</span>` };
  document.addEventListener("DOMContentLoaded", () => tag());
})();
