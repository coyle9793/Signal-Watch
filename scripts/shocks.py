"""Surprise shock detector.

For each S&P 100 stock and each of the last 15 trading days, flag:
  - an abnormal price move: the stock's return after removing what the market did
    (return - beta * market return) is 2.5+ standard deviations from normal, and/or
  - a volume spike: volume 2.5x+ its 50-day median (lots of shares changing hands at once).
Then ask "is there a clear reason?": news mentions that day (GDELT) or an insider filing.
A shock with no news and no filing is "unexplained" -- the most interesting kind.
History: how did this stock do 20 trading days after similar past shocks?
Reads site/data/history/*.json, insiders.json, events.json. Writes site/data/shocks.json
"""
import json, os, datetime as dt
import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "site", "data")
UNIVERSE = json.load(open(os.path.join(DATA, "universe.json")))
LOOKBACK = 10


def hist(t):
    h = json.load(open(os.path.join(DATA, "history", f"{t}.json")))
    return pd.DataFrame({"close": h["close"], "volume": h["volume"]}, index=pd.to_datetime(h["dates"]))


def loadj(name, default):
    try:
        return json.load(open(os.path.join(DATA, name)))
    except Exception:
        return default


def main():
    spy = hist("SPY")["close"].pct_change()
    ins = loadj("insiders.json", {"form4": [], "meta": {}})
    ev = loadj("events.json", {"mentions": {}, "meta": {}})
    news_days = set(ev.get("meta", {}).get("news_days", []))
    out = []
    for u in UNIVERSE:
        t = u["ticker"]
        try:
            df = hist(t)
        except FileNotFoundError:
            continue
        r = df["close"].pct_change()
        j = pd.concat([r, spy], axis=1, keys=["r", "m"], sort=True).dropna()
        beta = float(j.r.iloc[-250:].cov(j.m.iloc[-250:]) / j.m.iloc[-250:].var())
        ab = (j.r - beta * j.m)
        sd = ab.rolling(250, min_periods=120).std().shift(1)
        z = ab / sd
        vr = df["volume"] / df["volume"].rolling(50, min_periods=20).median().shift(1)
        flags = (z.abs() >= 2.5) | (vr.reindex(z.index) >= 3)
        # history: every past flagged day before the look-back window
        past = [d for d in z.index[flags][:-LOOKBACK] if z.index.get_loc(d) + 20 < len(z)]
        close = df["close"]
        fwd = [float(close.iloc[close.index.get_loc(d) + 20] / close.loc[d] - 1) for d in past if close.index.get_loc(d) + 20 < len(close)]
        for d in z.index[-LOOKBACK:]:
            if not flags.loc[d]:
                continue
            ds, dk = d.strftime("%Y-%m-%d"), d.strftime("%Y%m%d")
            news = ev.get("mentions", {}).get(t, {}).get(dk, 0)
            filings = [f for f in ins.get("form4", []) if f["ticker"] == t and f["date"] and abs((pd.Timestamp(f["date"]) - d).days) <= 3]
            unplanned_sells = [f for f in filings if f["type"] == "Sell" and f["planned"] is False]
            reasons = []
            if news: reasons.append(f"{news} news articles that day")
            if filings: reasons.append(f"{len(filings)} insider trade{'s' if len(filings) > 1 else ''} within 3 days")
            known = dk in news_days
            out.append({
                "ticker": t, "name": u["name"], "sector": u["sector"], "date": ds,
                "ret": round(float(j.r.loc[d]), 4), "market": round(float(j.m.loc[d]), 4), "abnormal": round(float(ab.loc[d]), 4),
                "z": round(float(z.loc[d]), 2), "vol_ratio": round(float(vr.loc[d]), 2),
                "kind": ("Sell-off" if ab.loc[d] < 0 else "Surge") if abs(z.loc[d]) >= 2.5 else ("Heavy trading, price down" if j.r.loc[d] < 0 else "Heavy trading, price up"),
                "explained": bool(reasons), "news_checked": known, "reasons": reasons,
                "unplanned_insider_sells": len(unplanned_sells),
                "past_shocks": len(fwd), "past_avg_20d": round(float(np.mean(fwd)), 4) if fwd else None,
                "past_up_rate": round(float(np.mean([x > 0 for x in fwd])), 2) if fwd else None,
                "severity": round(float(abs(z.loc[d]) + max(0, vr.loc[d] - 1)), 2),
            })
    out.sort(key=lambda s: (s["date"], s["severity"]), reverse=True)
    meta = {"updated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC"), "lookback_days": LOOKBACK,
            "news_days": sorted(news_days), "count": len(out), "unexplained": sum(not s["explained"] for s in out)}
    json.dump({"meta": meta, "shocks": out}, open(os.path.join(DATA, "shocks.json"), "w"), separators=(",", ":"))
    print(meta)


if __name__ == "__main__":
    main()
