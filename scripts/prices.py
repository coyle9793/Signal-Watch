"""Fetch S&P 100 prices and 5 years of daily history; write the JSON the site reads.

  python scripts/prices.py            # real data from Yahoo Finance (via yfinance)
  python scripts/prices.py --fake     # random-walk demo data, for building offline

Writes site/data/prices.json (latest snapshot + stats) and site/data/history/<T>.json.
"""
import json, os, sys, datetime as dt
import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "site", "data")
UNIVERSE = json.load(open(os.path.join(DATA, "universe.json")))
TICKERS = [u["ticker"] for u in UNIVERSE] + ["SPY"]  # SPY = the market benchmark


def fetch_real():
    import yfinance as yf
    raw = yf.download(TICKERS, period="5y", interval="1d", group_by="ticker",
                      auto_adjust=True, threads=True, progress=False)
    out = {}
    for t in TICKERS:
        try:
            df = raw[t][["Open", "High", "Low", "Close", "Volume"]].dropna()
        except KeyError:
            continue
        if len(df) > 50:
            out[t] = df
    return out, "Yahoo Finance"


def fetch_fake():
    rng = np.random.default_rng(7)
    days = pd.bdate_range(end=dt.date.today(), periods=1260)
    out = {}
    market = rng.normal(0.0004, 0.011, len(days))
    for i, t in enumerate(TICKERS):
        beta = rng.uniform(0.6, 1.5)
        r = beta * market + rng.normal(0.0001, 0.012, len(days))
        close = 50 * (1 + i % 9) * np.exp(np.cumsum(r))
        vol = rng.lognormal(15, 0.35, len(days))
        out[t] = pd.DataFrame({"Open": close * (1 - r / 2), "High": close * 1.01, "Low": close * 0.99,
                               "Close": close, "Volume": vol}, index=days)
    return out, "DEMO DATA (random walk, not real prices)"


def stats(df, spy):
    c, v = df["Close"], df["Volume"]
    r = c.pct_change()
    ch = lambda n: float(c.iloc[-1] / c.iloc[-1 - n] - 1) if len(c) > n else None
    peak = c.cummax()
    dd = (c / peak - 1)
    # History lesson: after a 1-day drop of 5%+ how did the stock do 20 trading days later?
    drops = r[r <= -0.05].index
    after = [float(c.iloc[c.index.get_loc(d) + 20] / c.loc[d] - 1)
             for d in drops if c.index.get_loc(d) + 20 < len(c)]
    rs = r.dropna()
    joined = pd.concat([rs, spy["Close"].pct_change()], axis=1, sort=True).dropna()
    beta = float(np.cov(joined.iloc[:, 0], joined.iloc[:, 1])[0, 1] / joined.iloc[:, 1].var()) if len(joined) > 60 else None
    return {
        "price": round(float(c.iloc[-1]), 2), "date": c.index[-1].strftime("%Y-%m-%d"),
        "chg_1d": ch(1), "chg_5d": ch(5), "chg_1m": ch(21), "chg_3m": ch(63), "chg_1y": ch(252), "chg_5y": ch(len(c) - 1),
        "vol_ratio": float(v.iloc[-1] / v.iloc[-21:-1].mean()) if v.iloc[-21:-1].mean() > 0 else None,
        "volatility_1y": float(rs.iloc[-252:].std() * np.sqrt(252)),
        "drawdown": float(dd.iloc[-1]), "max_drawdown_5y": float(dd.min()),
        "high_52w": round(float(c.iloc[-252:].max()), 2), "low_52w": round(float(c.iloc[-252:].min()), 2),
        "sma50": float(c.iloc[-50:].mean()), "sma200": float(c.iloc[-200:].mean()) if len(c) >= 200 else None,
        "big_drops_5y": len(drops), "avg_20d_after_big_drop": float(np.mean(after)) if after else None,
        "rebound_rate_after_big_drop": float(np.mean([a > 0 for a in after])) if after else None,
        "beta": beta, "spark": [round(float(x), 2) for x in c.iloc[-60:]],
    }


def main():
    fake = "--fake" in sys.argv
    frames, source = fetch_fake() if fake else fetch_real()
    os.makedirs(os.path.join(DATA, "history"), exist_ok=True)
    spy = frames["SPY"]
    names = {u["ticker"]: u for u in UNIVERSE}
    rows = []
    for t, df in frames.items():
        s = stats(df, spy)
        s.update({"ticker": t, "name": names.get(t, {}).get("name", "S&P 500 ETF"),
                  "sector": names.get(t, {}).get("sector", "Index")})
        rows.append(s)
        json.dump({"ticker": t, "dates": [d.strftime("%Y-%m-%d") for d in df.index],
                   "close": [round(float(x), 2) for x in df["Close"]],
                   "volume": [int(x) for x in df["Volume"]]},
                  open(os.path.join(DATA, "history", f"{t}.json"), "w"), separators=(",", ":"))
    rows = [{k: (round(v, 4) if isinstance(v, float) else v) for k, v in r.items()} for r in rows]
    meta = {"source": source, "demo": fake, "updated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "count": len(rows)}
    json.dump({"meta": meta, "stocks": rows}, open(os.path.join(DATA, "prices.json"), "w"), separators=(",", ":"))
    print(meta)


if __name__ == "__main__":
    main()
