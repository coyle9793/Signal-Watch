// The Ticker Tattler, issue look: the day's data laid out as a neon magazine issue.
// Wars and conflicts stay plain and respectful (see the World news section).
(function () {
  const $ = (s) => document.querySelector(s);

  // a neon line chart from a list of prices, drawn into a w x h box
  function line(vals, w, h, pad = 6) {
    const v = (vals || []).filter((x) => x != null);
    if (v.length < 2) return { d: "", area: "", last: [w, h / 2] };
    const lo = Math.min(...v), hi = Math.max(...v), r = hi - lo || 1;
    const pts = v.map((x, i) => [(i * w) / (v.length - 1), pad + (1 - (x - lo) / r) * (h - pad * 2)]);
    const d = "M" + pts.map((p) => p.map((n) => n.toFixed(1)).join(" ")).join(" L");
    return { d, area: `${d} L${w} ${h} L0 ${h}Z`, last: pts[pts.length - 1], peak: pts.reduce((a, b) => (b[1] < a[1] ? b : a)) };
  }

  window.renderIssue = function (d) {
    const { spy, stocks, dateLong, moodTxt, sc, stories, span, cap, clusters, ins, outs, worst, sorted, rows, world, esc, pct, apct, fmt, num, logo, gdelt } = d;
    const helpers = { esc, pct, apct, fmt, fmtG: (s) => fmt(gdelt(String(s))), logoBig: (t) => logo(t).replace('class="lg"', 'class="lg lg-big"').replace('class="lg lg-txt"', 'class="lg lg-big lg-txt"') };
    const raw = window.TT_RAW || {};
    const oppHtml = window.renderOpp ? window.renderOpp(raw, helpers) : "";
    const scopesHtml = window.renderScopes ? window.renderScopes(raw, helpers) : "";
    const castHtml = window.renderCast ? window.renderCast(raw, { ...helpers, logo }) : "";
    const issueNo = Math.max(1, Math.round((new Date(spy.date) - new Date("2026-11-01")) / 864e5));
    const N = stocks.length;

    // headlines
    const coverHead = sc ? `The ${apct(sc.ret)} ${sc.ret >= 0 ? "jump" : "drop"} nobody will explain` : "A quiet week. Suspiciously quiet.";
    const cl = clusters?.[0];
    const spottedHead = cl ? `${cap(num(cl.people.size))} insiders, <span class="gt">one very quiet exit</span>` : `Who bought, <span class="gt">who sold</span>`;
    const spottedToc = cl ? `${cap(num(cl.people.size))} insiders, one very quiet exit` : "Who bought, who sold";
    const toc = [
      ["02", "Cover story", coverHead, "cover-story"],
      ["03", "Spotted", spottedToc, "spotted-i"],
      ["04", "The verdict", "Who's in, who's out", "verdict"],
      ["05", "Worst night", `${worst.name}'s ${pct(worst.chg_1d)}`, "worst-i"],
      ["06", "World news", "The events moving markets", "world-i"],
      ["07", "Best &amp; worst dressed", "The day's winners and losers", "dressed-i"],
      ["08", "Opp of the day", "The company that had a very bad day", "opp-i"],
      ["09", "Stockscopes", "What the stars say about your sector", "scopes-i"],
      ["10", "The cast list", "Villains, underdogs and fan favourites", "cast-i"],
    ];

    // cover chart: the S&P 500 over the last few months
    const sp60 = (spy.spark || []).slice(-60);
    const smooth = sp60.filter((_, i) => i % 5 === 4 || i === sp60.length - 1).map((v, i, arr) => (arr[i - 1] != null && arr[i + 1] != null ? (arr[i - 1] + 2 * v + arr[i + 1]) / 4 : v));
    const cv = line(smooth, 390, 300, 24);
    const peak = cv.peak || [260, 120];

    const why = sc ? (Math.abs(sc.z) >= 2.5 ? [`${Math.abs(sc.z).toFixed(1)}×`, "its usual swing"] : [`${sc.vol_ratio.toFixed(1)}×`, "its usual trading volume"]) : null;
    const wl = line((worst.spark || []).slice(-30), 300, 120, 8);
    const pcls = (x) => (x >= 0 ? "pos" : "neg");

    $("#issue").innerHTML = `
    <header class="mast">
      <a class="mast-logo" href="#top"><span class="mast-kick">THE TICKER</span><span class="gt glow">TATTLER</span></a>
      <nav class="mast-nav">${[toc[0], toc[1], toc[2], toc[6], toc[7], toc[4]].map(([, k, , id]) => `<a href="#${id}">${k}</a>`).join("")}<a href="../">Data desk</a></nav>
      <span class="pill">Issue ${issueNo} · ${esc(dateLong.replace(/ \d{4}$/, ""))}</span>
    </header>

    <section class="hero" id="top">
      <div class="cover" role="img" aria-label="This issue's cover">
        <p class="c-kick">THE TICKER</p>
        <p class="c-mast gt glow">TATTLER</p>
        <svg class="c-chart" viewBox="0 0 390 300" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id="cfill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2ef2ff" stop-opacity=".3"/><stop offset="1" stop-color="#2ef2ff" stop-opacity="0"/></linearGradient></defs>
          <path d="${cv.area}" fill="url(#cfill)"/>
          <path d="${cv.d}" fill="none" stroke="#2ef2ff" stroke-width="4" stroke-linejoin="round" class="neon-c"/>
          <circle cx="${peak[0]}" cy="${peak[1]}" r="8" fill="#fff" class="neon-c"/>
        </svg>
        <div class="c-story"><p class="c-k">THE ${spy.chg_1m >= 0 ? "COMEBACK" : "SECRETS"} ISSUE</p><p class="c-h">Fallen, fabulous &amp; ready to rise</p></div>
        <div class="c-num"><b>${N}</b><span>STOCKS RANKED</span><small>who's in, who's out</small></div>
        <div class="c-low"><p><b>INSIDER SECRETS</b><br>What the boardroom bought (and sold) this month</p><span class="c-tag">+ THE SCANDAL</span></div>
        <div class="c-foot"><i>${esc(day(spy.date))}</i><span class="barcode" aria-hidden="true">${[2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 3, 1, 2, 2, 1].map((w) => `<i style="width:${w}px"></i>`).join("")}</span></div>
      </div>
      <div class="hero-side">
        <p class="kick">IN THIS ISSUE</p>
        <h1>Fallen, fabulous &amp; <span class="gt glow">ready to rise</span></h1>
        <ol class="toc">${toc.map(([n, k, t, id]) => `<li><a href="#${id}"><span class="gt n">${n}</span><span><b>${k.toUpperCase()}</b><i>${esc(t).replace(/&amp;amp;/g, "&amp;")}</i></span></a></li>`).join("")}</ol>
        <div class="letter"><p class="kick k-p">EDITOR'S LETTER</p><p class="lt">Darlings, ${moodTxt.charAt(0).toLowerCase() + moodTxt.slice(1)} Somebody always knows something. This week, we found out who.</p><p class="sig">— T.T.</p></div>
      </div>
    </section>

    ${sc ? `
    <section class="panel story" id="cover-story">
      <div>
        <p class="kick">02 · COVER STORY</p>
        <h2 class="huge">The <span class="gt glow">${apct(sc.ret)}</span> ${sc.ret >= 0 ? "jump" : "drop"} nobody will explain</h2>
        <p class="body">On ${fmt(sc.date)}, ${esc(sc.name)} moved ${why[0].replace("×", "")} times ${why[1]}. There was no news. There were no insider filings. Somebody knew something, or nobody did. Either way, we're watching.</p>
        <a class="btn" href="../#shocks">See the evidence →</a>
      </div>
      <div class="stats">
        <div><b class="gt">${pct(sc.ret)}</b><span>one day, ${fmt(sc.date)}</span></div>
        <div><b class="gt">${why[0]}</b><span>${why[1]}</span></div>
        <div><b class="gt">0</b><span>news stories found</span></div>
        <div><b class="gt">0</b><span>insider filings</span></div>
      </div>
    </section>` : ""}

    <section class="sec" id="spotted-i">
      <div class="sec-head"><div><p class="kick">03 · SPOTTED</p><h2>${spottedHead}</h2></div><p class="note">From SEC Form 4 filings · insiders named by role only</p></div>
      <div class="clips">${stories.map(({ g, lead, note, badge }) => `
        <article class="clip-i">${badge ? '<span class="bought">BOUGHT</span>' : ""}
          <p class="meta">${logo(g.ticker)} ${esc(g.ticker)} · ${span(g)} · <a href="${esc(g.url)}" target="_blank" rel="noopener">Filings</a></p>
          <p class="lead"><span class="gt">Spotted:</span> ${esc(cap(lead))}</p>
          <p class="note">${esc(note)}</p>
        </article>`).join("") || '<article class="clip-i"><p class="lead">Quiet week. Nobody\'s trading. Suspicious in itself.</p></article>'}</div>
    </section>

    <section class="sec two">
      <div class="panel" id="verdict">
        <p class="kick">04 · THE VERDICT</p>
        <h2>Who's in, <span class="gt">who's out</span></h2>
        <div class="io">
          <div><p class="io-l in">IN</p>${ins.map((c) => `<p class="io-n">${logo(c.ticker)}${esc(c.name)}</p>`).join("") || '<p class="io-n">Nobody, for now</p>'}<p class="note">Fallen behind, ready for a comeback.</p></div>
          <div><p class="io-l out">OUT</p>${outs.map((c) => `<p class="io-n x">${logo(c.ticker)}${esc(c.name)}</p>`).join("") || '<p class="io-n">Nobody, for now</p>'}<p class="note">Partied too hard. Expect a hangover.</p></div>
        </div>
        <p class="note small">Based on the 1-month pullback rule, not our feelings. <a href="../#calls">How the calls work</a></p>
      </div>
      <div class="panel" id="worst-i">
        <p class="kick">05 · WORST NIGHT</p>
        <h2>${esc(worst.name)}: <span class="gt">${pct(worst.chg_1d)}</span> in a day</h2>
        <p class="note">A very bad night. Somebody get this stock a glass of water.</p>
        <svg class="wchart" viewBox="0 0 300 120" preserveAspectRatio="none" role="img" aria-label="${esc(worst.name)} over the last 30 trading days">
          <defs><linearGradient id="wfill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#b44dff" stop-opacity=".35"/><stop offset="1" stop-color="#b44dff" stop-opacity="0"/></linearGradient></defs>
          <path d="${wl.area}" fill="url(#wfill)"/><path d="${wl.d}" fill="none" stroke="#b44dff" stroke-width="3" class="neon-p"/>
        </svg>
        <p class="kick k-m">LAST 30 TRADING DAYS · ${pct(worst.chg_1m)} THIS MONTH</p>
      </div>
    </section>

    <section class="sec two wide-left">
      <div id="world-i">
        <p class="kick k-m">06 · WORLD NEWS</p>
        <h2>The events moving markets</h2>
        <p class="note">Wars and conflicts are covered plainly here, without the gossip.</p>
        <div class="world">${world.slice(0, 4).map((w) => `<div class="wcard"><p class="wh">${esc(w.head)}</p><p class="note">${esc(w.body)}</p><p class="wt">${w.tickers.map(esc).join(" · ")}</p></div>`).join("") || '<div class="wcard"><p class="note">No major world events in the news today.</p></div>'}</div>
      </div>
      <div class="panel" id="dressed-i">
        <p class="kick">07 · BEST &amp; WORST DRESSED</p>
        ${rows.map(([s, pun]) => `<div class="drow"><span>${logo(s.ticker)}${esc(s.name)}, <i>${pun}</i></span><b class="${pcls(s.chg_1d)}">${pct(s.chg_1d)}</b></div>`).join("")}
      </div>
    </section>

    ${oppHtml}
    ${scopesHtml}
    ${castHtml}

    <section class="desk">
      <div class="desk-head"><div><p class="kick">THE DATA DESK</p><h2>Whistle Street, <span class="gt">dressed to match</span></h2></div>
        <div class="desk-tabs"><a href="../#market">Market</a><a href="../#insiders">Insider trades</a><a href="../#shocks">Surprise shocks</a><a href="../#world">World events</a><a href="../#calls">Smart calls</a><a href="../#storm">Storm watch</a></div></div>
      <div class="dtable" role="table">
        <div class="dr dh" role="row"><span>TICKER</span><span>NAME</span><span>PRICE</span><span>1 DAY</span><span>1 MONTH</span></div>
        ${rows.map(([s]) => `<div class="dr" role="row"><span>${esc(s.ticker)}</span><span>${esc(s.name)}</span><span>$${s.price.toFixed(2)}</span><span class="${pcls(s.chg_1d)}">${pct(s.chg_1d)}</span><span class="${pcls(s.chg_1m)}">${pct(s.chg_1m)}</span></div>`).join("")}
      </div>
    </section>

    <footer class="ifoot">
      <p class="gt glow bye">Until next issue, stay liquid.</p>
      <p class="note small">The gossip is for fun. The data is real and updates every 30 minutes in market hours. Insiders are named by role only, and nothing here says anyone broke the law. Not financial advice. Data updated ${esc(d.updated)}.</p>
    </footer>`;

    function day(s) { return new Date(s.slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }); }
  };
})();
