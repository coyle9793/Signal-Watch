"""'Why did it move?' -- the biggest jumps and drops of each stock over 5 years, each with its likely reason.

Reasons we can check, strongest first:
  earnings  company results that day or the evening before (Yahoo Finance earnings calendar, via yfinance)
  news      a news article naming the company that day (GDELT links, archived from 14 Nov 2026 onwards)
  market    the whole market moved the same way (S&P 500 down/up 2%+ and the stock moved about as much)
  sector    most of its sector moved the same way that day
  world     a big world event from our history list happened that day
  insider   an insider filing within 3 days
Otherwise: "no clear reason in our data".

Keeps two caches on the data branch: earnings.json (refreshed once a day) and news_archive.json (grows every run).
Writes site/data/moves.json
"""
import json, os, sys, time, datetime as dt
import numpy as np, pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "site", "data")
U = json.load(open(os.path.join(DATA, "universe.json")))
SECTOR = {u["ticker"]: u["sector"] for u in U}
NAME = {u["ticker"]: u["name"] for u in U}
PER_STOCK = 40


def j(name, default):
    try:
        return json.load(open(os.path.join(DATA, name)))
    except Exception:
        return default


def series(t):
    h = j(f"history/{t}.json", None)
    return pd.Series(h["close"], index=pd.to_datetime(h["dates"])).dropna() if h else None


# ---------------------------------------------------------------- caches
def earnings(offline=False):
    path = os.path.join(DATA, "earnings.json")
    old = j("earnings.json", {})
    fresh = old.get("updated", "") >= (dt.datetime.now(dt.timezone.utc) - dt.timedelta(hours=20)).strftime("%Y-%m-%d %H:%M")
    if offline or fresh:
        return old.get("stocks", {})
    try:
        import yfinance as yf
    except Exception:
        return old.get("stocks", {})
    out = dict(old.get("stocks", {}))
    for u in U:
        t = u["ticker"]
        try:
            df = yf.Ticker(t).get_earnings_dates(limit=24)
            rows = []
            for idx, r in df.iterrows():
                ts = pd.Timestamp(idx)
                if ts.tzinfo is not None:
                    ts = ts.tz_convert("America/New_York")
                if ts > pd.Timestamp.now(tz=ts.tzinfo):
                    continue
                g = lambda k: (None if pd.isna(r.get(k)) else float(r.get(k)))
                rows.append({"date": ts.strftime("%Y-%m-%d"), "after_close": ts.hour >= 12,
                             "est": g("EPS Estimate"), "eps": g("Reported EPS"), "surprise": g("Surprise(%)")})
            if rows:
                out[t] = rows
        except Exception as e:
            print("earnings failed", t, str(e)[:80])
        time.sleep(0.3)
    json.dump({"updated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M"), "stocks": out}, open(path, "w"), separators=(",", ":"))
    return out


def news_archive():
    arc = j("news_archive.json", {})
    for t, days in j("news.json", {}).get("links", {}).items():
        a = arc.setdefault(t, {})
        for d, links in days.items():
            a[d] = list(dict.fromkeys((a.get(d) or []) + links))[:8]
    json.dump(arc, open(os.path.join(DATA, "news_archive.json"), "w"), separators=(",", ":"))
    return arc


PRIVATE = set("affair affairs wife husband divorce sex sexual cheat cheating cheated girlfriend boyfriend mistress romance romantic dating lover spy spies agent honeytrap scandal rumor rumour rumors rumours nude pregnant marriage wedding relationship alleged allegedly allegation allegations controversy".split())


def headline(u):
    import re
    from urllib.parse import urlparse
    p = urlparse(u)
    segs = [re.sub(r"\.(s?html?|php|aspx?)$", "", s) for s in p.path.split("/")]
    segs = [s for s in segs if len(s.split("-")) >= 4]
    if not segs:
        return None
    w = [x for x in max(segs, key=len).split("-") if not re.fullmatch(r"\d{3,}|[a-f0-9]{8,}", x)]
    while w and re.fullmatch(r"\d{1,2}", w[-1]):
        w.pop()
    t = " ".join(w).strip()
    if not t or set(re.split(r"[^a-z0-9]+", t.lower())) & PRIVATE:
        return None
    return t[0].upper() + t[1:], p.netloc.replace("www.", "")


# ---------------------------------------------------------------- main
def main():
    offline = "--offline" in sys.argv
    spy = series("SPY")
    closes = {t: series(t) for t in SECTOR}
    closes = {t: c for t, c in closes.items() if c is not None}
    rets = pd.DataFrame({t: c.pct_change() for t, c in closes.items()})
    m = spy.pct_change().reindex(rets.index)
    sec_ret = {s: rets[[t for t in rets if SECTOR[t] == s]] for s in set(SECTOR.values())}
    E = earnings(offline)
    arc = news_archive()
    lessons = {l["date"]: l for l in j("world.json", {}).get("lessons", [])}
    f4 = j("insiders.json", {}).get("form4", [])
    out = {}
    for t, c in closes.items():
        r = rets[t]
        ab = (r - m).dropna()
        big = ab[(ab.abs() >= 0.03) & (r.reindex(ab.index).abs() >= 0.025)].abs().sort_values(ascending=False).head(PER_STOCK).index
        moves = []
        ed = {e["date"]: e for e in E.get(t, [])}
        for d in sorted(big):
            ds = d.strftime("%Y-%m-%d"); prev = r.index[r.index.get_loc(d) - 1].strftime("%Y-%m-%d")
            ret, mk = float(r[d]), float(m[d])
            why = None
            e = ed.get(ds) if ds in ed and not ed[ds]["after_close"] else ed.get(prev) if prev in ed and ed[prev]["after_close"] else ed.get(ds)
            if e:
                s = e.get("surprise")
                txt = "Earnings day" + (f": profit {'beat' if s >= 0 else 'missed'} forecasts by {abs(s):.0f}%" if s is not None else ": the company reported results")
                why = {"kind": "earnings", "text": txt, "src": "Yahoo Finance earnings calendar"}
            if not why:
                for dk in (ds.replace("-", ""), prev.replace("-", "")):
                    for u in arc.get(t, {}).get(dk, []):
                        h = headline(u)
                        if h:
                            why = {"kind": "news", "text": h[0], "src": h[1], "url": u}; break
                    if why: break
            if not why and abs(mk) >= 0.02 and np.sign(mk) == np.sign(ret):
                why = {"kind": "market", "text": f"The whole market {'fell' if mk < 0 else 'rose'} {abs(mk) * 100:.1f}% that day"}
            if not why:
                peers = sec_ret[SECTOR[t]].drop(columns=[t]).loc[d].dropna()
                if len(peers) >= 2 and (np.sign(peers - mk) == np.sign(ret - mk)).mean() >= 0.7 and abs((peers - mk).mean()) >= 0.015:
                    why = {"kind": "sector", "text": f"Most of {SECTOR[t]} moved the same way (average {(peers.mean()) * 100:+.1f}%)"}
            if not why:
                l = lessons.get(ds) or lessons.get(prev)
                if l:
                    why = {"kind": "world", "text": l["title"]}
            if not why:
                ins = [x for x in f4 if x["ticker"] == t and x["date"] and abs((dt.date.fromisoformat(x["date"]) - d.date()).days) <= 3]
                if ins:
                    why = {"kind": "insider", "text": f"No news found, but {len(ins)} insider trade{'s were' if len(ins) > 1 else ' was'} filed around then"}
            moves.append({"date": ds, "ret": round(ret, 4), "market": round(mk, 4), **(why or {"kind": "unknown", "text": "No clear reason in our data"})})
        out[t] = moves
    kinds = pd.Series([x["kind"] for v in out.values() for x in v]).value_counts().to_dict()
    json.dump({"updated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC"), "earnings_loaded": len(E), "kinds": kinds, "moves": out},
              open(os.path.join(DATA, "moves.json"), "w"), separators=(",", ":"))
    print(len(out), "stocks;", kinds, "; earnings for", len(E))


if __name__ == "__main__":
    main()
