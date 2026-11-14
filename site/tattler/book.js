// Diary book: lays the .pg sections out as pages that turn like a real book.
// Content never scrolls inside a page: anything that doesn't fit flows onto the next page.
// One page at a time on phones, a two-page spread on wide screens.
(function () {
  const $ = (s) => document.querySelector(s);
  let pages = [], leaves = [], flips = 0, spread = false, active = false, busy = false, lastKey = "";
  const still = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PH = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--ph"));

  // ---------- pagination ----------
  function cleanClone(el, deep) {
    const c = el.cloneNode(deep);
    if (c.removeAttribute) c.removeAttribute("id");
    if (deep && c.querySelectorAll) c.querySelectorAll("[id]").forEach((x) => x.removeAttribute("id"));
    return c;
  }
  function paginate() {
    const meas = $("#measure");
    meas.innerHTML = "";
    const face = document.createElement("div");
    face.className = "face f-front";
    meas.appendChild(face);
    const limit = PH();
    const out = [];
    let cur;
    const fits = () => cur.offsetHeight <= limit + 0.5;
    const newPage = (src, cont) => {
      cur = cleanClone(src, false);
      if (cont) {
        const t = src.querySelector("h2 .d-only")?.textContent || "";
        const p = document.createElement("p");
        p.className = "cont";
        const name = t.replace(/[^\p{L}\p{N}\s&:,'!?.-]/gu, "").trim();
        p.textContent = name ? `${name}, continued…` : "…continued";
        cur.appendChild(p);
      }
      face.innerHTML = ""; face.appendChild(cur); out.push(cur);
      return cur;
    };
    const onlyCont = () => cur.children.length === 1 && cur.firstElementChild.classList.contains("cont");
    document.querySelectorAll("#flow > .pg").forEach((src) => {
      newPage(src, false);
      [...src.children].forEach((child) => {
        if (child.hidden || child.classList.contains("f-only")) return;
        if (child.hasAttribute("data-split") && child.children.length) {
          let shell = cleanClone(child, false); cur.appendChild(shell);
          [...child.children].forEach((item) => {
            const c = cleanClone(item, true);
            shell.appendChild(c);
            if (!fits() && !(shell.children.length === 1 && cur.children.length <= (cur.querySelector(".cont") ? 2 : 1))) {
              c.remove();
              if (!shell.children.length) shell.remove();
              // keep a heading with the first item that follows it
              const last = cur.lastElementChild;
              const carry = [];
              if (!shell.isConnected) {
                if (last?.classList.contains("sub")) { carry.unshift(last); if (last.previousElementSibling?.tagName === "H2") carry.unshift(last.previousElementSibling); }
                else if (last?.tagName === "H2") carry.unshift(last);
              }
              carry.forEach((x) => x.remove());
              newPage(src, carry.length === 0);
              carry.forEach((x) => cur.appendChild(x));
              shell = cleanClone(child, false); cur.appendChild(shell); shell.appendChild(c);
            }
          });
        } else {
          const c = cleanClone(child, true);
          cur.appendChild(c);
          if (!fits() && cur.children.length > 1 && !(cur.children.length === 2 && onlyCont() === false && cur.firstElementChild.classList.contains("cont"))) {
            c.remove();
            const last = cur.lastElementChild;
            const carry = [];
            if (last?.classList.contains("sub")) { carry.unshift(last); if (last.previousElementSibling?.tagName === "H2") carry.unshift(last.previousElementSibling); }
            else if (last?.tagName === "H2") carry.unshift(last);
            carry.forEach((x) => x.remove());
            newPage(src, carry.length === 0);
            carry.forEach((x) => cur.appendChild(x));
            cur.appendChild(c);
          }
        }
      });
    });
    // anything still too tall for an empty page gets shrunk to fit, never scrolled
    out.forEach((pg) => {
      face.innerHTML = ""; face.appendChild(pg);
      const h = pg.offsetHeight;
      if (h > limit) pg.style.zoom = String(Math.max(0.6, (limit - 2) / h));
    });
    meas.innerHTML = "";
    return out.filter((pg) => [...pg.children].some((c) => !c.classList.contains("cont")));
  }

  // ---------- leaves ----------
  function face(cls, pg, num) {
    const f = document.createElement("div");
    f.className = "face " + cls;
    if (pg) {
      if (pg.classList.contains("pg-cover")) f.classList.add("cover-face");
      else if (!pg.classList.contains("pg-end")) {
        const n = document.createElement("span");
        n.className = "pgnum"; n.textContent = num; pg.appendChild(n);
      }
      f.appendChild(pg);
    } else f.classList.add("blank");
    return f;
  }
  const maxFlips = () => (spread ? Math.floor(pages.length / 2) : pages.length - 1);
  const curPage = () => (spread ? Math.max(0, 2 * flips - 1) : flips);

  function build(keepPage) {
    pages = paginate();
    const book = $("#book");
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
    flips = Math.min(spread ? Math.ceil(keepPage / 2) : keepPage, maxFlips());
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
    document.body.classList.toggle("book-open", flips > 0);
    leaf.classList.toggle("flipped", dir > 0);
    const end = () => { leaf.classList.remove("turning"); busy = false; layout(false); };
    if (still()) end(); else setTimeout(end, 820);
  }

  function savedPage() {
    try { return Math.max(0, parseInt(sessionStorage.getItem("tt-page") || "0", 10) || 0); } catch (e) { return 0; }
  }

  function relayout(force) {
    if (!active) return;
    const wide = innerWidth >= 900;
    const barH = $(".bar").offsetHeight, pagerH = $(".pager").offsetHeight;
    const avH = Math.max(420, innerHeight - barH - pagerH - 28);
    const pw = Math.round(wide ? Math.min(470, (innerWidth - 80) / 2) : Math.min(innerWidth - 24, 520));
    const ph = Math.round(wide ? Math.min(avH, 760) : avH);
    const key = `${pw}x${ph}x${wide}`;
    if (!force && key === lastKey) return;
    const keep = leaves.length ? curPage() : savedPage();
    lastKey = key;
    const r = document.documentElement.style;
    r.setProperty("--pw", pw + "px");
    r.setProperty("--ph", ph + "px");
    spread = wide;
    document.body.classList.toggle("spread", wide);
    build(keep);
  }

  let t;
  const later = () => { clearTimeout(t); t = setTimeout(() => relayout(false), 150); };

  window.TTBook = {
    on() { active = true; lastKey = ""; relayout(true); },
    off() {
      active = false; lastKey = "";
      $("#book").innerHTML = ""; leaves = []; pages = [];
      document.body.classList.remove("spread", "book-open");
    },
    // call after the content changes (data loaded, fonts loaded)
    refresh() { if (active) relayout(true); },
  };

  addEventListener("resize", later);
  if (document.fonts?.ready) document.fonts.ready.then(() => window.TTBook.refresh());
  document.addEventListener("DOMContentLoaded", () => {
    $("#prev").addEventListener("click", () => turn(-1));
    $("#next").addEventListener("click", () => turn(1));
    const stage = $("#stage");
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
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) turn(dx < 0 ? 1 : -1);
    });
    addEventListener("keydown", (e) => {
      if (!active) return;
      if (e.key === "ArrowRight") turn(1);
      if (e.key === "ArrowLeft") turn(-1);
    });
  });
})();
