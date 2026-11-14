// The Ticker Tattler: turns Signal Watch's daily data into gossip.
// Every line is generated from site/data/*.json. Insiders are named by role only.
(function () {
  const NOOP = { set textContent(v) {}, get textContent() { return ""; }, set innerHTML(v) {}, hidden: true };
  const $ = (s) => document.querySelector(s) || NOOP;   // the diary and feed looks were retired; only the Issue is drawn
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pct = (x, d = 1) => `${x >= 0 ? "+" : "−"}${Math.abs(x * 100).toFixed(d)}%`;
  const apct = (x, d = 1) => `${Math.abs(x * 100).toFixed(d)}%`;
  const money = (v) => (v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${Math.round(v / 1e3)}K`);
  const day = (s) => new Date(s.slice(0, 10) + "T12:00:00Z");
  const fmt = (s, o = { day: "numeric", month: "short" }) => day(s).toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });
  const gdelt = (s) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  const WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  const num = (n) => WORDS[n] ?? String(n);
  const load = (f) => fetch(`../data/${f}`, { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error(f); return r.json(); });

  // company logos (Google's public favicon service); falls back to the ticker if one won't load
  const DOMAINS = {"AAPL":"apple.com","ABBV":"abbvie.com","ABT":"abbott.com","ACN":"accenture.com","ADBE":"adobe.com","AIG":"aig.com","AMD":"amd.com","AMGN":"amgen.com","AMT":"americantower.com","AMZN":"amazon.com","AVGO":"broadcom.com","AXP":"americanexpress.com","BA":"boeing.com","BAC":"bankofamerica.com","BK":"bnymellon.com","BKNG":"bookingholdings.com","BLK":"blackrock.com","BMY":"bms.com","BRK-B":"berkshirehathaway.com","C":"citigroup.com","CAT":"caterpillar.com","CHTR":"charter.com","CL":"colgatepalmolive.com","CMCSA":"comcast.com","COF":"capitalone.com","COST":"costco.com","CRM":"salesforce.com","CSCO":"cisco.com","CVS":"cvshealth.com","CVX":"chevron.com","DE":"deere.com","DHR":"danaher.com","DIS":"disney.com","DUK":"duke-energy.com","EMR":"emerson.com","F":"ford.com","FDX":"fedex.com","GD":"gd.com","GE":"ge.com","GILD":"gilead.com","GM":"gm.com","GOOGL":"google.com","GOOG":"google.com","GS":"goldmansachs.com","HD":"homedepot.com","HON":"honeywell.com","IBM":"ibm.com","INTC":"intel.com","INTU":"intuit.com","ISRG":"intuitive.com","JNJ":"jnj.com","JPM":"jpmorganchase.com","KO":"coca-cola.com","LIN":"linde.com","LLY":"lilly.com","LMT":"lockheedmartin.com","MA":"mastercard.com","MCD":"mcdonalds.com","MDLZ":"mondelezinternational.com","MDT":"medtronic.com","MET":"metlife.com","META":"meta.com","MMM":"3m.com","MO":"altria.com","MRK":"merck.com","MS":"morganstanley.com","MSFT":"microsoft.com","NEE":"nexteraenergy.com","NFLX":"netflix.com","NKE":"nike.com","NOW":"servicenow.com","NVDA":"nvidia.com","ORCL":"oracle.com","PEP":"pepsico.com","PFE":"pfizer.com","PG":"pg.com","PLTR":"palantir.com","PM":"pmi.com","PYPL":"paypal.com","QCOM":"qualcomm.com","RTX":"rtx.com","SBUX":"starbucks.com","SCHW":"schwab.com","SO":"southerncompany.com","SPG":"simon.com","T":"att.com","TGT":"target.com","TMO":"thermofisher.com","TMUS":"t-mobile.com","TSLA":"tesla.com","TXN":"ti.com","UNH":"unitedhealthgroup.com","UNP":"up.com","UPS":"ups.com","USB":"usbank.com","V":"visa.com","VZ":"verizon.com","WFC":"wellsfargo.com","WMT":"walmart.com"};
  window.ttLogoFail = (img) => { const s = document.createElement("span"); s.className = img.className + " lg-txt"; s.textContent = img.dataset.t; img.replaceWith(s); };
  const logo = (t) => DOMAINS[t] ? `<img class="lg" data-t="${esc(t)}" src="https://www.google.com/s2/favicons?domain=${DOMAINS[t]}&sz=128" alt="${esc(nameOf(t))} logo" loading="lazy" onload="if(this.naturalWidth&&this.naturalWidth<48)ttLogoFail(this)" onerror="ttLogoFail(this)">` : `<span class="lg lg-txt">${esc(t)}</span>`;
  const stick = (t) => `<span class="stick">${logo(t)}</span>`;

  document.body.className = "issue";

  // ---------- roles: never names ----------
  function role(r) {
    r = (r || "").toLowerCase();
    if (/vice cob|vice chair/.test(r)) return "vice chair";
    if (/^(co-)?ceo$|(pres|cob|chair), ceo|cob, pres, ceo/.test(r)) return "CEO";
    if (/cob|chair/.test(r)) return "chair";
    if (/\bcfo\b/.test(r)) return "CFO";
    if (/\bcoo\b/.test(r)) return "COO";
    if (/\bceo\b/.test(r)) return "division boss";
    if (/^dir\b/.test(r)) return "director";
    if (/10%/.test(r)) return "big shareholder";
    if (/\bgc\b|counsel/.test(r)) return "top lawyer";
    return "executive";
  }
  const solo = (t, r) => (["CEO", "CFO", "COO", "chair", "vice chair"].includes(r) ? `${nameOf(t)}'s ${r}` : `a ${nameOf(t)} ${r}`);
  let nameOf = (t) => t;
  const plural = (w) => (w === "division boss" ? "division bosses" : w === "big shareholder" ? "big shareholders" : w === "top lawyer" ? "top lawyers" : w + "s");

  // ---------- sections ----------
  function moodOf(spy, breadth) {
    const score = spy * 100 + (breadth - 0.5) * 2; // same rule as the main site's weather
    if (spy <= -0.015 || score <= -1.6) return ["stormy", "Total meltdown, darling.", "a total meltdown"];
    if (score <= -0.4) return ["rainy", "A little moody tonight.", "a bit gloomy"];
    if (score < 0.5) return ["cloudy", "Mixed, darling.", "mixed"];
    return ["sunny", "Glowing, darling.", "glowing"];
  }

  function render({ prices, insiders, shocks, events, calls }) {
    const all = prices.stocks;
    const spy = all.find((s) => s.ticker === "SPY") || { chg_1d: 0, chg_1m: 0, date: prices.meta.updated };
    const stocks = all.filter((s) => s.ticker !== "SPY" && s.chg_1d != null);
    const by = Object.fromEntries(all.map((s) => [s.ticker, s]));
    nameOf = (t) => by[t]?.name || t;

    // header
    const dateLong = day(spy.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
    $("#blast").textContent = `Blast · ${dateLong}`;
    $("#datesticker").textContent = `${dateLong.replace(/ \d{4}$/, "")} · mood: `;
    $("#updated").textContent = `Data updated ${prices.meta.updated}.`;

    // mood
    const upN = stocks.filter((s) => s.chg_1d > 0).length;
    const [mood, big, word] = moodOf(spy.chg_1d, upN / stocks.length);
    $("#datesticker").textContent += { sunny: "sunny ☀", cloudy: "mixed ☁", rainy: "rainy ☔", stormy: "stormy ⚡" }[mood];
    const moved = spy.chg_1d >= 0 ? `rose ${apct(spy.chg_1d, 2)}` : `slipped ${apct(spy.chg_1d, 2)}`;
    const half = upN > stocks.length / 2;
    const join = (spy.chg_1d >= 0) === half ? "and" : "but";
    const party = half ? "still showed up to the party" : "stayed home";
    const moodTxt = `The S&amp;P ${moved}, ${join} ${upN} of ${stocks.length} stocks ${party}.`;

    // scandal: biggest unexplained move where we checked the news
    const sus = (shocks.shocks || []).filter((s) => !s.explained && s.news_checked)
      .sort((a, b) => Math.abs(b.abnormal) - Math.abs(a.abnormal));
    const sc = sus.find((s) => Math.abs(s.z) >= 2.5) || sus[0];
    let scLine = "";
    if (sc) {
      const verb = sc.ret >= 0 ? "jumps" : "drops";
      const why = Math.abs(sc.z) >= 2.5
        ? `${sc.ticker} moved ${Math.abs(sc.z).toFixed(1)} times its usual swing`
        : `${sc.ticker} traded ${sc.vol_ratio.toFixed(1)} times its usual volume`;
      $("#alert").innerHTML = `
        ${stick(sc.ticker)}
        <p class="lbl"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/></svg>SCANDAL ALERT</p>
        <h3>${esc(sc.name)} ${verb} ${apct(sc.ret)} and nobody will say why</h3>
        <p class="txt">On ${fmt(sc.date)}, ${why}. No news. No insider filings. Somebody knew something, or nobody did. Either way, we're watching.</p>
        <a class="btn" href="../#shocks">See the evidence<span class="d-only"> &rarr;</span></a>`;
      $("#alert").hidden = false;
      scLine = ` And ${esc(sc.name)} ${sc.ret >= 0 ? "jumped" : "dropped"} ${apct(sc.ret)} on ${fmt(sc.date)} with no news at all?? <span class="hl">I'm watching.</span>`;
    }
    $("#mood").innerHTML = `
      <svg class="f-only" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#e9c46a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="9" r="3.2"/><path d="M9 2.5v1.3M9 14.2v1.3M2.5 9h1.3M14.2 9h1.3M4.4 4.4l.9.9M12.7 12.7l.9.9M4.4 13.6l.9-.9"/><path d="M10.5 20.5h8a3.5 3.5 0 0 0 .3-7 5 5 0 0 0-9.6 1.4 2.8 2.8 0 0 0 1.3 5.6z" fill="#17130d"/></svg>
      <div>
        <p class="lbl f-only">Tonight's mood</p>
        <p class="big f-only">${big}</p>
        <p class="txt f-only">${moodTxt}</p>
        <p class="dear d-only">Dear diary,</p>
        <p class="d-only">today felt ${word}. ${moodTxt}${scLine}</p>
      </div>`;
    $("#mood").hidden = false;

    // spotted: insider trade stories
    const f4 = insiders.form4 || [];
    const latest = f4.reduce((m, t) => (t.date > m ? t.date : m), "");
    const recent = f4.filter((t) => (day(latest) - day(t.date)) / 864e5 <= 30 && by[t.ticker]);
    const groups = {};
    recent.forEach((t) => {
      const k = t.ticker + "|" + t.type;
      const g = (groups[k] ||= { ticker: t.ticker, type: t.type, people: new Map(), value: 0, first: t.date, last: t.date, url: t.url });
      g.people.set(t.who, role(t.role));
      g.value += t.value || 0;
      if (t.date < g.first) g.first = t.date;
      if (t.date > g.last) g.last = t.date;
    });
    const G = Object.values(groups);
    const span = (g, w) => (g.first === g.last ? fmt(g.first) : w ? `${fmt(g.first)} and ${fmt(g.last)}` : `${fmt(g.first)}–${fmt(g.last)}`);
    const relM = (t) => (by[t]?.chg_1m ?? 0) - (spy.chg_1m ?? 0);
    const who = (g) => {
      const roles = [...new Set(g.people.values())];
      const n = g.people.size;
      if (n === 1) return solo(g.ticker, roles[0]);
      return `${num(n)} ${nameOf(g.ticker)} ${roles.length === 1 ? plural(roles[0]) : "insiders"}`;
    };
    const used = new Set();
    const cap = (s) => s[0].toUpperCase() + s.slice(1);
    const stories = [];

    const buys = G.filter((g) => g.type === "Buy").sort((a, b) => b.value - a.value);
    if (buys[0]) {
      const g = buys[0]; used.add(g.ticker);
      const r = relM(g.ticker);
      stories.push({ g, badge: "they<br>BOUGHT",
        lead: `${who(g)} buying, not selling, ${money(g.value)} of their own money.`,
        note: r < -0.03 ? `The stock has trailed the market by ${Math.round(-r * 100)} points this month. Do they know something we don't?` : "Putting their own money where their mouth is. Bold." });
    }
    const clusters = G.filter((g) => g.type === "Sell" && g.people.size >= 3 && !used.has(g.ticker))
      .sort((a, b) => b.people.size - a.people.size || b.value - a.value);
    if (clusters[0]) {
      const g = clusters[0]; used.add(g.ticker);
      const s = by[g.ticker];
      stories.push({ g,
        lead: `${who(g)} selling about ${money(g.value)} of stock between ${span(g, 1)}.`,
        note: s.chg_1m < -0.03 ? `${g.ticker} is down ${apct(s.chg_1m)} this month. Coincidence? Probably. But we noticed.`
          : relM(g.ticker) > 0 ? "And the stock's still beating the market. Maybe they just needed a new yacht."
          : "Same company, same direction. We're keeping an eye on it." });
    }
    const bigSale = recent.filter((t) => t.type === "Sell" && !used.has(t.ticker)).sort((a, b) => b.value - a.value)[0];
    if (bigSale) {
      used.add(bigSale.ticker);
      const others = new Set(recent.filter((t) => t.ticker === bigSale.ticker && t.type === "Sell" && t.who !== bigSale.who).map((t) => t.who)).size;
      stories.push({ g: { ticker: bigSale.ticker, first: bigSale.date, last: bigSale.date, url: bigSale.url },
        lead: `${solo(bigSale.ticker, role(bigSale.role))} cashing out ${money(bigSale.value)} of shares on ${fmt(bigSale.date)}.`,
        note: others ? `Big money, quiet exit. ${num(others)[0].toUpperCase() + num(others).slice(1)} other ${nameOf(bigSale.ticker)} insider${others > 1 ? "s" : ""} sold in the past month too.` : "Big money, quiet exit." });
    }
    if (buys[1] && buys[1].value >= 250e3 && !used.has(buys[1].ticker)) {
      const g = buys[1];
      stories.push({ g, badge: "they<br>BOUGHT", lead: `${who(g)} quietly buying ${money(g.value)} of stock.`, note: "Another vote of confidence. Cute." });
    }
    $("#spotted").innerHTML = stories.length ? stories.map(({ g, lead, note, badge }) => `
      <article class="clip">
        <span class="tape" aria-hidden="true"></span>
        ${stick(g.ticker)}
        <p class="meta">${logo(g.ticker)} ${esc(g.ticker)} · ${span(g)} · <a href="${esc(g.url)}" target="_blank" rel="noopener">Filings</a></p>
        <p class="lead"><b class="sp">Spotted:</b> ${esc(cap(lead))}</p>
        <p class="note">${esc(note)}</p>
        ${badge ? `<span class="badge" aria-hidden="true">${badge}</span>` : ""}
      </article>`).join("") : `<article class="clip"><p class="lead">Quiet week. Nobody's trading. Suspicious in itself.</p></article>`;

    // in / out
    const C = calls.calls || [];
    const ins = C.filter((c) => c.call === "Buy").sort((a, b) => b.score - a.score).slice(0, 3);
    const outs = C.filter((c) => c.call === "Sell").sort((a, b) => a.score - b.score).slice(0, 3);
    const li = (xs) => xs.map((c) => `<li title="${esc(c.ticker)}">${logo(c.ticker)}${esc(c.name)}</li>`).join("") || "<li>Nobody, for now</li>";
    $("#inout").innerHTML = `
      <div class="col in"><p class="lbl"><span class="d-only">totally in ✓</span><span class="f-only">IN</span></p><ul>${li(ins)}</ul><p class="cap">Fallen behind, ready for a comeback.</p></div>
      <div class="col out"><p class="lbl"><span class="d-only">so over it ✗</span><span class="f-only">OUT</span></p><ul>${li(outs)}</ul><p class="cap">Partied too hard. Expect a hangover.</p></div>`;

    // worst night + best and worst dressed
    const sorted = [...stocks].sort((a, b) => b.chg_1d - a.chg_1d);
    const worst = sorted[sorted.length - 1];
    const sp = (worst.spark || []).slice(-30);
    let poly = "";
    if (sp.length > 1) {
      const lo = Math.min(...sp), hi = Math.max(...sp) || 1, rng = hi - lo || 1;
      poly = sp.map((v, i) => `${(4 + (i * 84) / (sp.length - 1)).toFixed(1)},${(8 + (1 - (v - lo) / rng) * 54).toFixed(1)}`).join(" ");
    }
    $("#worst-h").textContent = `Page: ${worst.ticker} \u{1F494}`;
    const worstNote = sorted.length > 2
      ? `${esc(sorted[sorted.length - 2].name)} had a wardrobe malfunction too (${pct(sorted[sorted.length - 2].chg_1d)}). ${esc(sorted[0].name)} was belle of the ball, ${pct(sorted[0].chg_1d)} ✨`
      : "";
    $("#worst").innerHTML = `
      <figure class="polaroid">${stick(worst.ticker)}<svg viewBox="0 0 92 70" width="100%" role="img" aria-label="${esc(worst.name)} price over the last 30 trading days"><rect width="92" height="70" fill="#2a1a24"/><polyline points="${poly}" fill="none" stroke="#ff7aa2" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg><figcaption>last month&hellip;</figcaption></figure>
      <div>
        <p class="big">${esc(worst.name)}: ${pct(worst.chg_1d)} in one day. A very bad night.</p>
        <p class="txt"><span class="f-only">It's ${pct(worst.chg_1m)} over the past month. Somebody get this stock a glass of water.</span><span class="d-only">${worstNote}</span></p>
      </div>`;

    const BEST = ["belle of the ball", "fashionably late", "turning heads"];
    const WORST = ["a very bad night", "wardrobe malfunction", "left early"];
    const rows = [
      ...sorted.slice(0, 2).map((s, i) => [s, BEST[i]]),
      ...sorted.slice(-2).reverse().map((s, i) => [s, WORST[i]]).reverse(),
    ];
    $("#dressed").innerHTML = rows.map(([s, pun]) => `<div class="row"><span>${logo(s.ticker)}${esc(s.name)}, ${pun}</span><b class="${s.chg_1d >= 0 ? "up" : "down"}">${pct(s.chg_1d)}</b></div>`).join("");

    // world news: wars, conflicts and sanctions are written plainly and respectfully, never as gossip
    const seen = new Set();
    const evs = (events.events || []).filter((e) => e.kind !== "cooperation" && e.tickers?.length)
      .sort((a, b) => b.risk - a.risk)
      .filter((e) => { const k = [...e.countries].sort().join(); if (seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, 4);
    const SECTOR = { "Defence & energy": "Defence and energy stocks", "Trade-exposed tech & industrials": "Tech and industrial companies that trade abroad" };
    const world = evs.map((e) => {
      const names = e.tickers.slice(0, 3).map(nameOf);
      const list = names.length > 1 ? names.slice(0, -1).join(", ") + " and " + names[names.length - 1] : names[0];
      const [pair, label] = e.title.split(":").map((x) => x.trim());
      const where = pair.replace(" & ", " and ").replace(/\b(United States|United Kingdom|Netherlands|Philippines|Czech Republic|United Arab Emirates)\b/g, "the $1");
      const when = fmt(gdelt(e.date || events.meta.date));
      const group = SECTOR[e.sector] || "Some stocks";
      const head = e.kind === "conflict" ? `Conflict involving ${where}` : `Tension between ${where}`;
      const body = e.kind === "conflict"
        ? `The conflict was in ${e.articles} news stories on ${when}. ${group}, such as ${list}, are often sensitive to events like this.`
        : `Reports of ${(label || "pressure").toLowerCase()} between ${where} were in ${e.articles} news stories on ${when}. ${group}, such as ${list}, can be affected by sanctions and trade pressure.`;
      return { head, body, tickers: e.tickers.slice(0, 3) };
    });
    $("#abroad").innerHTML = world.map((w) => `<div class="note2"><h3>${esc(w.head)}</h3><p>${esc(w.body)}</p><p class="tickers">${w.tickers.map((t) => `<span>${esc(t)}</span>`).join("")}</p></div>`).join("") || `<div class="note2"><p>No major world events in the news today.</p></div>`;

    window.renderIssue?.({ spy, stocks, by, dateLong, moodTxt, big, sc, stories, span, cap, clusters, ins, outs, worst, sorted, rows, world, updated: prices.meta.updated, logo, esc, pct, apct, fmt, num, gdelt });
  }

  Promise.all(["prices.json", "insiders.json", "shocks.json", "events.json", "calls.json", "news.json"].map((f) => load(f).catch(() => ({}))))
    .then(([prices, insiders, shocks, events, calls, news]) => {
      window.TT_RAW = { prices, insiders, shocks, events, calls, news };
      $("#loading").hidden = true;
      if (!prices.stocks) { $("#loading").hidden = false; $("#loading").textContent = "The gossip line is down. Try again in a minute."; return; }
      render({ prices, insiders, shocks, events, calls });
    });
})();
