// Accounts (demo): sign up / log in so each person keeps their own watchlist, quiz streak and visit streak.
// Everything is stored in THIS browser only (localStorage). Passwords are never stored, only a salted
// PBKDF2 hash. There is no server, so accounts don't follow you to another device.
// How it works: the site reads its usual keys (sw-watch, snake-game). When you switch account we save
// those keys into the old account's box, load the new account's box into them, and reload the page.
(() => {
  const DATA_KEYS = ["sw-watch", "snake-game"];
  const AK = "ws-accounts", CK = "ws-current";
  const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} } };
  const all = () => { try { return JSON.parse(ls.get(AK) || "{}"); } catch (e) { return {}; } };
  const saveAll = (a) => ls.set(AK, JSON.stringify(a));
  const cur = () => ls.get(CK) || "";
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const today = () => new Date().toISOString().slice(0, 10);
  const AV = ["🦊", "🐼", "🦉", "🐯", "🐙", "🦄", "🐝", "🐧", "🦖", "🐸", "🌵", "🍄"];

  async function hash(pw, salt) {
    const enc = new TextEncoder();
    if (crypto?.subtle) {
      const key = await crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]);
      const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 120000, hash: "SHA-256" }, key, 256);
      return [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    let h = 2166136261; for (const c of salt + pw) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return "f" + (h >>> 0).toString(16);
  }
  const salt = () => [...crypto.getRandomValues(new Uint8Array(12))].map((b) => b.toString(16).padStart(2, "0")).join("");

  // move the site's data between the live keys and an account's box ("" = guest)
  function stash(a, who) { const box = {}; DATA_KEYS.forEach((k) => (box[k] = ls.get(k))); if (who) { if (a[who]) a[who].data = box; } else a.__guest = box; }
  function unstash(a, who) { const box = (who ? a[who]?.data : a.__guest) || {}; DATA_KEYS.forEach((k) => ls.set(k, box[k] ?? null)); }
  function switchTo(who) { const a = all(); stash(a, cur()); unstash(a, who); saveAll(a); ls.set(CK, who || null); location.reload(); }

  // daily visit streak for the signed-in account
  function visit() {
    const u = cur(), a = all(); if (!u || !a[u]) return;
    const v = a[u].visits || { last: "", streak: 0, best: 0, days: 0 }, d = today();
    if (v.last !== d) {
      const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      v.streak = v.last === y ? v.streak + 1 : 1; v.best = Math.max(v.best, v.streak); v.days = (v.days || 0) + 1; v.last = d;
      a[u].visits = v; saveAll(a);
    }
  }
  if (cur() && !all()[cur()]) ls.set(CK, null); // account was deleted elsewhere
  visit();

  // ---------------------------------------------------------------- UI
  let el;
  function shell() {
    if (el) return el;
    el = document.createElement("div"); el.className = "acc"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
    el.addEventListener("click", (e) => { if (e.target === el || e.target.closest("[data-x]")) hide(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape" && el.classList.contains("on")) hide(); });
    document.body.appendChild(el); return el;
  }
  function show(html) { shell().innerHTML = `<div class="acc-box"><button class="acc-x" data-x aria-label="Close">✕</button>${html}</div>`; el.classList.add("on"); document.documentElement.classList.add("wx-lock"); el.querySelector("input")?.focus(); }
  function hide() { el?.classList.remove("on"); document.documentElement.classList.remove("wx-lock"); }
  const note = `<p class="acc-fine">Demo accounts: saved in this browser only, so they won't follow you to another phone or computer. Please use a password you don't use anywhere else.</p>`;

  function loginPage(mode = "in", msg = "") {
    const a = all(), names = Object.keys(a).filter((k) => k !== "__guest");
    show(`<div class="acc-hero"><span class="acc-logo">☂︎</span><h2>Welcome to <i>Whistle Street</i></h2><p>Your own watchlist, quiz streak and daily visit streak, kept under your name.</p></div>
      <div class="acc-tabs" role="tablist"><button data-m="in" class="${mode === "in" ? "on" : ""}" role="tab">Log in</button><button data-m="up" class="${mode === "up" ? "on" : ""}" role="tab">Create account</button></div>
      <form class="acc-form" autocomplete="on">
        ${mode === "up" ? `<label>Display name<input name="name" maxlength="24" required placeholder="e.g. Sam" autocomplete="nickname"></label>` : ""}
        <label>Username<input name="user" maxlength="20" required pattern="[A-Za-z0-9_.-]{3,20}" placeholder="3-20 letters or numbers" autocomplete="username" ${mode === "in" && names.length === 1 ? `value="${esc(names[0])}"` : ""}></label>
        <label>Password<input name="pw" type="password" minlength="6" required placeholder="at least 6 characters" autocomplete="${mode === "up" ? "new-password" : "current-password"}"></label>
        ${mode === "up" ? `<div class="acc-av"><span>Pick an avatar</span>${AV.map((x, i) => `<label><input type="radio" name="av" value="${x}" ${i === 0 ? "checked" : ""}><b>${x}</b></label>`).join("")}</div>
          <label class="acc-chk"><input type="checkbox" name="bring" checked> Bring my current watchlist and quiz streak</label>` : ""}
        <p class="acc-err" role="alert">${esc(msg)}</p>
        <button class="acc-go" type="submit">${mode === "up" ? "Create my account" : "Log in"}</button>
      </form>
      ${mode === "in" && names.length ? `<p class="acc-saved">Accounts on this browser: ${names.map((n) => `<button class="acc-chip" data-u="${esc(n)}">${a[n].av || "🙂"} ${esc(n)}</button>`).join(" ")}</p>` : ""}
      ${note}`);
    el.querySelectorAll("[data-m]").forEach((b) => (b.onclick = () => loginPage(b.dataset.m)));
    el.querySelectorAll("[data-u]").forEach((b) => (b.onclick = () => { const i = el.querySelector('[name="user"]'); i.value = b.dataset.u; el.querySelector('[name="pw"]').focus(); }));
    el.querySelector("form").onsubmit = async (e) => {
      e.preventDefault(); const f = new FormData(e.target), user = String(f.get("user")).trim().toLowerCase(), pw = String(f.get("pw"));
      const err = (m) => (el.querySelector(".acc-err").textContent = m), A = all();
      if (!/^[a-z0-9_.-]{3,20}$/.test(user)) return err("Usernames are 3-20 letters, numbers, dots, dashes or underscores.");
      if (pw.length < 6) return err("Passwords need at least 6 characters.");
      if (mode === "up") {
        if (A[user] || user === "__guest") return err("That username is taken on this browser. Try another, or log in.");
        const s = salt();
        A[user] = { name: String(f.get("name")).trim().slice(0, 24) || user, av: f.get("av") || "🙂", salt: s, hash: await hash(pw, s), since: today(), data: {} };
        stash(A, cur()); // keep whatever is live safe in its current owner's box
        if (f.get("bring")) DATA_KEYS.forEach((k) => (A[user].data[k] = ls.get(k)));
        unstash(A, user); saveAll(A); ls.set(CK, user); location.reload();
      } else {
        if (!A[user] || (await hash(pw, A[user].salt)) !== A[user].hash) return err("That username and password don't match an account on this browser.");
        if (user === cur()) return hide();
        switchTo(user);
      }
    };
  }

  function profile() {
    const u = cur(), A = all(), me = A[u]; if (!me) return loginPage();
    let wl = [], sn = {}; try { wl = JSON.parse(ls.get("sw-watch") || "[]"); sn = JSON.parse(ls.get("snake-game") || "{}"); } catch (e) {}
    const v = me.visits || {};
    show(`<div class="acc-hero"><span class="acc-big">${me.av}</span><h2>${esc(me.name)}</h2><p>@${esc(u)} · member since ${esc(me.since)}</p></div>
      <div class="acc-stats">
        <div><b>${wl.length}</b><span>stocks on your watchlist</span></div>
        <div><b>${v.streak || 0}🔥</b><span>day visit streak<br><small>best ${v.best || 0} · ${v.days || 0} day${v.days === 1 ? "" : "s"} in all</small></span></div>
        <div><b>${sn.streak || 0}🐍</b><span>Snake quiz streak<br><small>best ${sn.best || 0}</small></span></div>
      </div>
      ${wl.length ? `<p class="acc-wl">${wl.map((t) => `<span>${esc(t)}</span>`).join("")}</p>` : `<p class="acc-wl muted">Tap ☆ next to any stock to add it to your watchlist.</p>`}
      <div class="acc-av acc-av-edit"><span>Avatar</span>${AV.map((x) => `<label><input type="radio" name="av" value="${x}" ${x === me.av ? "checked" : ""}><b>${x}</b></label>`).join("")}</div>
      <div class="acc-row"><button class="acc-go" data-a="out">Log out</button><button class="acc-ghost" data-a="sw">Switch account</button><button class="acc-ghost danger" data-a="del">Delete account</button></div>
      ${note}`);
    el.querySelectorAll('.acc-av-edit input').forEach((r) => (r.onchange = () => { const A2 = all(); A2[u].av = r.value; saveAll(A2); paint(); profile(); }));
    el.querySelector('[data-a="out"]').onclick = () => switchTo("");
    el.querySelector('[data-a="sw"]').onclick = () => loginPage("in");
    el.querySelector('[data-a="del"]').onclick = (e) => {
      const b = e.currentTarget; if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = "Tap again to delete for good"; return; }
      const A2 = all(); delete A2[u]; unstash(A2, ""); saveAll(A2); ls.set(CK, null); location.reload();
    };
  }

  // header button
  function paint() {
    const nav = document.querySelector("header.top"); if (!nav) return;
    let b = document.getElementById("acc-btn");
    if (!b) { b = document.createElement("button"); b.id = "acc-btn"; b.className = "acc-btn"; b.onclick = () => (cur() ? profile() : loginPage()); nav.appendChild(b); }
    const me = all()[cur()];
    b.innerHTML = me ? `<span class="acc-av1">${me.av}</span><span class="acc-nm">${esc(me.name)}</span>` : `<span class="acc-av1">👤</span><span class="acc-nm">Log in</span>`;
    b.title = me ? "Your account" : "Log in or create an account";
  }
  window.ACCOUNT = { current: () => all()[cur()] || null, open: () => (cur() ? profile() : loginPage()) };
  const boot = () => { paint(); if (/[?&]login\b/.test(location.search)) loginPage(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
