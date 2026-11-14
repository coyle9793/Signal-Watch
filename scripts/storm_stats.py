"""'What usually happens next' for Storm watch, from each stock's own 5-year price history.

A storm = the stock falls 10% or more below its high of the previous 3 months.
For each past storm we measure:
  - how much further it fell before the bottom (extra drop)
  - how many trading days it took to get back to the old high (recovery), if it did
Also, per stock: how it did in the 20 days after the market's worst days (S&P down 2%+).
Writes site/data/storms.json
"""
import json, os
import numpy as np, pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "site", "data")
U = json.load(open(os.path.join(DATA, "universe.json")))


def series(t):
    h = json.load(open(os.path.join(DATA, "history", f"{t}.json")))
    return pd.Series(h["close"], index=pd.to_datetime(h["dates"])).dropna()


def storms(c):
    hi = c.rolling(63, min_periods=20).max()
    dd = c / hi - 1
    out, i, n = [], 0, len(c)
    while i < n:
        if dd.iloc[i] <= -0.10:
            peak = hi.iloc[i]
            j = i
            while j < n and c.iloc[j] < peak:
                j += 1
            seg = c.iloc[i:j] if j > i else c.iloc[i:i + 1]
            extra = float(seg.min() / c.iloc[i] - 1)
            out.append({"start": str(c.index[i].date()), "extra_drop": extra, "recovery_days": (j - i) if j < n else None})
            i = j + 1
        else:
            i += 1
    return out


def main():
    spy = series("SPY")
    bad = spy.pct_change()
    bad_days = bad[bad <= -0.02].index
    res = {}
    for u in U:
        t = u["ticker"]
        try:
            c = series(t)
        except Exception:
            continue
        st = storms(c)
        rec = [s["recovery_days"] for s in st if s["recovery_days"] is not None]
        after = []
        for d in bad_days:
            if d in c.index:
                k = c.index.get_loc(d)
                if k + 20 < len(c):
                    after.append(c.iloc[k + 20] / c.iloc[k] - 1 - (spy.reindex(c.index).iloc[k + 20] / spy.reindex(c.index).iloc[k] - 1))
        res[t] = {
            "storms_5y": len(st),
            "avg_extra_drop": round(float(np.mean([s["extra_drop"] for s in st])), 4) if st else None,
            "median_recovery_days": int(np.median(rec)) if rec else None,
            "recovered_share": round(len(rec) / len(st), 2) if st else None,
            "vs_market_after_bad_days": round(float(np.mean(after)), 4) if after else None,
            "bad_days": len(after),
        }
    json.dump({"stocks": res, "market_bad_days_5y": int(len(bad_days))}, open(os.path.join(DATA, "storms.json"), "w"), separators=(",", ":"))
    print(len(res), "stocks;", len(bad_days), "bad market days")


if __name__ == "__main__":
    main()
