// Diary book: moves the .pg sections into page leaves that turn like a real book.
// One page at a time on phones, a two-page spread on wide screens.
(function () {
  const $ = (s) => document.querySelector(s);
  let pages = [], leaves = [], flips = 0, spread = null, active = false, busy = false;
  const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pageList() {
    if (!pages.length) pages = [...document.querySelectorAll("#flow > .pg, #book .pg")];
    return pages;
  }
  const maxFlips = () => (spread ? Math.floor(pages.length / 2) : pages.length - 1);
  // the page the reader is looking at (left page on a spread, if any)
  const curPage = () => (spread ? Math.max(0, 2 * flips - 1) : flips);

  function face(cls, pg, num) {
    const f = document.createElement("div");
    f.className = "face " + cls;
    if (pg) {
      f.appendChild(pg);
      pg.querySelector(":scope > .pgnum")?.remove();
      if (num && !pg.classList.contains("pg-cover") && !pg.classList.contains("pg-end")) {
        const n = document.createElement("span");
        n.className = "pgnum"; n.textContent = num; pg.appendChild(n);
      }
      if (pg.classList.contains("pg-cover")) f.classList.add("cover-face");
    } else f.classList.add("blank");
    return f;
  }

  function build(keepPage) {
    const book = $("#book");
    pageList();
    book.innerHTML = "";
    leaves = [];
    const per = spread ? 2 : 1;
    for (let i = 0; i < pages.length; i += per) {
      const leaf = document.createElement("div");
      leaf.className = "leaf";
      leaf.appendChild(face("f-front", pages[i], i + 1));
      leaf.appendChild(face("f-back", spread ? pages[i + 1] : null, i + 2));
      book.appendChild(leaf);
      leaves.push(leaf);
    }
    flips = spread ? Math.ceil(keepPage / 2) : keepPage;
    flips = Math.min(flips, maxFlips());
    layout(true);
  }

  function layout(instant) {
    leaves.forEach((l, k) => {
      if (instant) l.style.transition = "none";
      const done = k < flips;
      l.classList.toggle("flipped", done);
      l.style.zIndex = done ? k + 1 : leaves.length - k + 1;
      if (instant) { void l.offsetWidth; l.style.transition = ""; }
    });
    const n = pages.length, p = curPage();
    $("#pnum").textContent = flips === 0 ? "cover" : spread && 2 * flips < n ? `pages ${p + 1}–${p + 2} of ${n}` : `page ${p + 1} of ${n}`;
    $("#prev").disabled = flips === 0;
    $("#next").disabled = flips >= maxFlips();
    document.body.classList.toggle("book-open", flips > 0);
    try { sessionStorage.setItem("tt-page", String(curPage())); } catch (e) {}
  }

  function turn(dir) {
    if (!active || busy) return;
    const target = flips + dir;
    if (target < 0 || target > maxFlips()) return;
    const leaf = leaves[dir > 0 ? flips : flips - 1];
    leaf.style.zIndex = leaves.length + 10;
    leaf.classList.add("turning");
    busy = true;
    flips = target;
    leaf.classList.toggle("flipped", dir > 0);
    const end = () => { leaf.classList.remove("turning"); busy = false; layout(false); };
    if (still()) end(); else setTimeout(end, 820);
    // reset scroll of the newly shown pages
    leaves.forEach((l) => l.querySelectorAll(".face").forEach((f) => (f.scrollTop = 0)));
  }

  function size() {
    if (!active) return;
    const wide = innerWidth >= 900;
    const barH = $(".bar").offsetHeight, pagerH = $(".pager").offsetHeight;
    const avH = Math.max(420, innerHeight - barH - pagerH - 28);
    const pw = wide ? Math.min(470, (innerWidth - 80) / 2) : Math.min(innerWidth - 24, 520);
    const ph = wide ? Math.min(avH, 760) : avH;
    const r = document.documentElement.style;
    r.setProperty("--pw", pw + "px");
    r.setProperty("--ph", ph + "px");
    if (wide !== spread) {
      const keep = spread === null ? readSaved() : curPage();
      spread = wide;
      document.body.classList.toggle("spread", wide);
      build(keep);
    }
  }
  function readSaved() {
    try { return Math.max(0, Math.min(pageList().length - 1, parseInt(sessionStorage.getItem("tt-page") || "0", 10) || 0)); } catch (e) { return 0; }
  }

  window.TTBook = {
    on() {
      if (active) return;
      active = true; spread = null;
      size();
    },
    off() {
      if (!active && !document.querySelector("#book .pg")) return;
      active = false; spread = null;
      const flow = $("#flow");
      pageList().forEach((p) => flow.appendChild(p));
      $("#book").innerHTML = "";
      leaves = [];
      document.body.classList.remove("spread", "book-open");
    },
  };

  addEventListener("resize", size);
  document.addEventListener("DOMContentLoaded", () => {
    $("#prev").addEventListener("click", () => turn(-1));
    $("#next").addEventListener("click", () => turn(1));
    const stage = $("#stage");
    // tap near the outer edges of the book to turn
    stage.addEventListener("click", (e) => {
      if (e.target.closest("a,button")) return;
      const r = stage.getBoundingClientRect(), x = (e.clientX - r.left) / r.width;
      if (x > 0.78) turn(1); else if (x < 0.22) turn(-1);
      else if (flips === 0 && x > 0.5) turn(1);
    });
    let sx = 0, sy = 0;
    stage.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) turn(dx < 0 ? 1 : -1);
    });
    addEventListener("keydown", (e) => {
      if (!active) return;
      if (e.key === "ArrowRight") turn(1);
      if (e.key === "ArrowLeft") turn(-1);
    });
  });
})();
