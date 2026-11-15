// Your market reading: four tarot-style cards picked from today's real numbers (not magic).
// Plays straight after the weather intro (once per session), and from the 🔮 button by the logo.
// Card art lives in tarot-cards.js. Rules: README in the tarot hand-off. Not financial advice.
(() => {
  const G = (n) => { try { return (0, eval)(n); } catch (e) { return undefined; } };
  const SS = { get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pc = (x, d = 1) => `${Math.abs(x * 100).toFixed(d)}%`;
  const sgn = (x, d = 1) => `${x >= 0 ? "+" : "−"}${pc(x, d)}`;
  const POS = ["I · THE PAST", "II · RIGHT NOW", "III · YOUR STOCKS", "IV · WHAT TO DO"];

  let SHELTER = null;
  fetch("data/scenarios.json").then((r) => r.json()).then((d) => {
    const best = {};
    Object.values(d.ratings || {}).forEach((ev) => Object.entries(ev).forEach(([t, r]) => { best[t] = best[t] || { w: 0, n: 0 }; best[t].w += Math.round(r.hit * r.n); best[t].n += r.n; }));
    const top = Object.entries(best).filter(([t]) => t !== "BIL" && d.shelters[t]).sort((a, b) => b[1].w / b[1].n - a[1].w / a[1].n)[0];
    if (top) SHELTER = { name: d.shelters[top[0]].name, w: top[1].w, n: top[1].n };
  }).catch(() => {});

  // ---------------------------------------------------------------- numbers
  function numbers() {
    const st = (G("STOCKS") || []).filter((s) => s.sector !== "Index"), spy = window.SPY || {};
    if (!st.length) return null;
    const m30 = spy.chg_1m ?? st.reduce((a, s) => a + (s.chg_1m || 0), 0) / st.length;
    const d1 = spy.chg_1d ?? 0;
    // fear gauge: we have no VIX feed, so estimate it from how much the S&P has been swinging (last ~21 days, yearly terms)
    let vix = 18; const sp = spy.spark || [];
    if (sp.length > 10) {
      const p = sp.slice(-22), r = p.slice(1).map((v, i) => Math.log(v / p[i]));
      const mu = r.reduce((a, b) => a + b, 0) / r.length, sd = Math.sqrt(r.reduce((a, b) => a + (b - mu) ** 2, 0) / (r.length - 1));
      vix = Math.round(sd * Math.sqrt(252) * 100 + 4);
    }
    const wlT = G("WATCH")?.list() || [], wl = wlT.map((t) => st.find((s) => s.ticker === t)).filter(Boolean);
    const mine = wl.length ? wl : st, own = wl.length > 0;
    const w30 = mine.reduce((a, s) => a + (s.chg_1m || 0), 0) / mine.length;
    const cnt = {}; mine.forEach((s) => (cnt[s.sector] = (cnt[s.sector] || 0) + 1));
    const [topSec, topN] = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0];
    const top = topN / mine.length, nsec = Object.keys(cnt).length;
    const secRet = {}; st.forEach((s) => { (secRet[s.sector] = secRet[s.sector] || []).push(s.chg_1m || 0); });
    const secs = Object.entries(secRet).filter(([, a]) => a.length >= 2).map(([k, a]) => [k, a.reduce((x, y) => x + y, 0) / a.length]).sort((a, b) => a[1] - b[1]);
    return { m30, d1, vix, w30, top, topSec, nsec, own, n: mine.length, worst: secs[0], best: secs.at(-1) };
  }
  function pick(N) {
    const { m30, d1, vix, w30, top, nsec } = N;
    const past = m30 <= -0.05 ? "tower" : m30 >= 0.05 ? "sun" : Math.abs(m30) < 0.02 ? "temperance" : m30 < 0 ? "tower" : "sun";
    const now = vix > 25 ? "moon" : Math.sign(d1) && Math.sign(d1) !== Math.sign(m30) ? "wheel" : "strength";
    const gap = (w30 - m30) * 100;
    const yours = top >= 0.5 ? "chariot" : gap <= -5 ? "hermit" : gap >= 5 ? "magician" : nsec >= 5 ? "world" : "chariot";
    const todo = top >= 0.6 ? "justice" : m30 <= -0.03 || vix > 22 ? "star" : "fool";
    return [past, now, yours, todo];
  }
  const low = (s) => s.toLowerCase().replace("communication", "communication services");
  function caption(id, N) {
    const { m30, d1, vix, w30, top, topSec, nsec, own, n, worst, best } = N;
    const who = own ? "Your picks" : "S&amp;P 100 stocks", whoS = own ? "your watchlist" : "S&P 100 (star stocks to make this yours)";
    const up = d1 >= 0 ? "up" : "down", trend = m30 >= 0 ? "climb" : "slide";
    const fear = `fear gauge (our estimate) <b>${vix}</b>`;
    const C = {
      tower: [`The market fell <b>${pc(m30)}</b> over the past month.`, `${worst[0]} took the biggest knock (${sgn(worst[1])}). The tower shook, but towers get rebuilt.`, "S&amp;P 500 · last month"],
      sun: [`The market rose <b>${pc(m30)}</b> over the past month.`, `${best[0]} led the way (${sgn(best[1])}). Sunny days, but sunshine never lasts forever.`, "S&amp;P 500 · last month"],
      temperance: [`A calm month: the market moved just <b>${sgn(m30)}</b>.`, "Nothing poured out too fast either way. Balance is its own kind of good news.", "S&amp;P 500 · last month"],
      wheel: [`Today the market is ${up} <b>${pc(d1, 2)}</b>, against last month's ${trend}.`, `The wheel is turning: today runs the other way to the recent trend, and the ${fear}.`, "S&amp;P 500 today · our fear estimate"],
      moon: [`The ${fear}: that's high.`, "Prices are jumpy and hard to read right now. In the fog, go slowly and don't rush.", "S&amp;P 500 swings · last 21 days"],
      strength: [`Today the market is ${up} <b>${pc(d1, 2)}</b> and the ${fear}.`, "Steady hands: today follows the trend and nerves look calm.", "S&amp;P 500 today · our fear estimate"],
      chariot: [`<b>${Math.round(top * 100)}%</b> of ${own ? "your picks" : "the stocks"} are in ${low(topSec)}.`, "One team is pulling the whole cart: quick on good days, wobbly on bad ones.", `${whoS} · ${n} stocks`],
      hermit: [`${who} moved <b>${sgn(w30)}</b> this month, <b>${pc(m30 - w30)}</b> behind the market.`, "The hermit walks alone with a lantern. A quiet patch, so look at why before you move.", `${whoS} · last month`],
      magician: [`${who} moved <b>${sgn(w30)}</b> this month, <b>${pc(w30 - m30)}</b> ahead of the market.`, "Every tool on the table is working. Remember that tricks can't be repeated forever.", `${whoS} · last month`],
      world: [`${who} are spread over <b>${nsec}</b> sectors, and moved <b>${sgn(w30)}</b> this month.`, "No single team carries you, so a bad day in one corner hurts less.", `${whoS} · by sector`],
      justice: [`<b>Rebalance</b>: ${Math.round(top * 100)}% sits in ${low(topSec)}.`, "When one side of the scales gets too heavy, a fall there hits harder. Spreading out evens it.", "your watchlist · by sector · not advice"],
      star: [`<b>Hold steady</b>, and look for shelter.`, SHELTER ? `In past market storms, ${SHELTER.name} beat the market in ${SHELTER.w} of ${SHELTER.n}. Storms pass. See Storm plan.` : "Storms pass. See the Storm plan tab for where money hid in past ones.", "past storm matches · not advice"],
      fool: [`<b>Start small</b>, and keep learning.`, "Markets are fairly calm. Small, steady first steps are the gentlest way in.", "S&amp;P 500 · our fear estimate · not advice"],
    };
    return C[id];
  }

  // ---------------------------------------------------------------- overlay
  let el, busy = false;
  function build() {
    if (el) return el;
    el = document.createElement("div"); el.className = "tr"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Your market reading");
    el.innerHTML = `<div class="tr-sky" aria-hidden="true"></div><div class="tr-wrap">
      <header class="tr-head"><div class="tr-kick"><span class="tr-ws">WHISTLE STREET · </span>YOUR MARKET READING</div><h2 class="tr-h">The cards are drawn</h2>
      <p class="tr-sub">Four cards picked by today's numbers: what the market just did, where it is now, how your stocks stand, and what to do next. Tap a card to turn it over.</p></header>
      <section class="tr-spread"></section>
      <div class="tr-deck" aria-hidden="true"><div class="tr-dk"></div><div class="tr-dk"></div><div class="tr-dk"></div></div>
      <footer class="tr-foot"><p class="tr-note"><b>Based on real data, not magic</b> · Not financial advice</p>
      <div class="tr-btns"><button class="tr-btn ghost" data-a="deal">Shuffle &amp; deal again</button><button class="tr-btn" data-a="go">Continue to the site →</button></div></footer></div>
      <button class="tr-x" data-a="go" aria-label="Close the reading">✕</button>`;
    document.body.appendChild(el);
    el.querySelectorAll(".tr-dk").forEach((d) => (d.innerHTML = TAROT.back()));
    el.addEventListener("click", (e) => {
      const a = e.target.closest("[data-a]")?.dataset.a; if (a === "go") close(); if (a === "deal") deal();
      const c = e.target.closest(".tr-card"); if (c && !busy) c.classList.toggle("flipped");
    });
    addEventListener("keydown", (e) => { if (el.classList.contains("on") && e.key === "Escape") close(); });
    return el;
  }
  function fill() {
    const N = numbers(); if (!N) return false;
    const ids = pick(N), sp = el.querySelector(".tr-spread");
    sp.innerHTML = ids.map((id, i) => { const c = TAROT.byId(id), [stat, why, src] = caption(id, N);
      return `<div class="tr-slot"><div class="tr-pos">${POS[i]}</div>
        <div class="tr-card flipped" style="opacity:0" tabindex="0" role="button" aria-label="${c.title}, tap to turn over"><div class="tr-in">
          <div class="tr-face">${TAROT.card(id)}</div><div class="tr-face tr-back">${TAROT.back()}</div></div></div>
        <div class="tr-cap"><div class="tr-stat">${stat}</div><div class="tr-why">${why}</div><div class="tr-src">${src}</div></div></div>`; }).join("");
    sp.querySelectorAll(".tr-card").forEach((c) => c.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); c.classList.toggle("flipped"); } }));
    return true;
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  async function deal() {
    if (busy) return; busy = true;
    if (!fill()) { busy = false; return; }
    const cards = [...el.querySelectorAll(".tr-card")], caps = [...el.querySelectorAll(".tr-cap")], slots = [...el.querySelectorAll(".tr-slot")];
    caps.forEach((c) => c.classList.remove("in")); slots.forEach((s) => s.classList.remove("lit"));
    if (reduced) { cards.forEach((c) => { c.classList.remove("flipped"); c.style.opacity = "1"; }); caps.forEach((c) => c.classList.add("in")); busy = false; return; }
    // the deck slides up, every card starts on it face down, then each one flies to its spot
    cards.forEach((c) => { c.style.transition = "none"; c.style.opacity = "0"; });
    el.querySelector(".tr-deck").classList.add("deal");
    await wait(560);
    const dk = el.querySelector(".tr-deck").getBoundingClientRect();
    cards.forEach((c, i) => {
      const r = c.getBoundingClientRect(), s = dk.width / r.width;
      const dx = dk.left + dk.width / 2 - (r.left + r.width / 2), dy = dk.top + dk.height / 2 - (r.top + r.height / 2);
      c.style.transition = "none"; c.style.opacity = "0";
      c.style.transform = `translate(${dx}px,${dy}px) scale(${s}) rotate(${(i - 1.5) * 4}deg)`;
    });
    await wait(40);
    for (let i = 0; i < cards.length; i++) {
      const c = cards[i]; c.style.transition = "transform .8s cubic-bezier(.2,.75,.25,1), opacity .25s"; c.style.opacity = "1"; c.style.transform = "";
      await wait(230);
    }
    await wait(700);
    el.querySelector(".tr-deck").classList.remove("deal");
    for (let i = 0; i < cards.length; i++) {
      cards[i].classList.remove("flipped"); slots[i].classList.add("lit");
      setTimeout(() => caps[i].classList.add("in"), 520);
      await wait(450);
    }
    await wait(500); cards.forEach((c) => (c.style.transition = "")); busy = false;
  }
  function open(fromIntro) {
    if (!window.TAROT || !numbers()) return;
    build(); SS.set("tr-seen", "1");
    el.classList.toggle("from-intro", !!fromIntro); el.classList.remove("out"); el.classList.add("on");
    document.documentElement.classList.add("wx-lock"); el.scrollTop = 0;
    fill(); setTimeout(deal, reduced ? 0 : fromIntro ? 650 : 350);
  }
  function close() {
    if (!el) return; el.classList.add("out"); document.documentElement.classList.remove("wx-lock");
    setTimeout(() => el.classList.remove("on", "out"), 500);
  }
  window.TAROT_READING = { open, close };

  // after the weather intro ends (or is skipped), go straight to the reading, once per session
  addEventListener("wx:closed", () => { if (!SS.get("tr-seen") || /[?&]tarot\b/.test(location.search)) setTimeout(() => open(true), 450); });
  // button by the logo
  function addBtn() {
    const brand = document.querySelector(".brand"); if (!brand || document.getElementById("tr-open")) return;
    const b = document.createElement("button"); b.id = "tr-open"; b.className = "wx-open"; b.title = "See today's market reading";
    b.innerHTML = `🔮 <span>Your reading</span>`; b.onclick = () => open(false); brand.appendChild(b);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addBtn); else addBtn();
})();
