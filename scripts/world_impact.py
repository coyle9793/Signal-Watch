"""How world events have moved the S&P 100: a history lesson computed from price data.

For a fixed list of well-known shocks in the last 5 years, measure how each sector and the
market moved on the day and over the next 20 trading days. Also, for today's GDELT events,
measure how the stocks they could move have done since (vs the market).
Writes site/data/world.json
"""
import json, os
import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "site", "data")
UNIVERSE = json.load(open(os.path.join(DATA, "universe.json")))

PAST = [
    {"date": "2022-02-24", "title": "Russia invades Ukraine", "kind": "conflict"},
    {"date": "2023-03-10", "title": "Silicon Valley Bank collapses", "kind": "financial"},
    {"date": "2023-10-09", "title": "Hamas attack on Israel, war begins", "kind": "conflict"},
    {"date": "2024-08-05", "title": "Japan rate shock: global sell-off", "kind": "financial"},
    {"date": "2025-04-03", "title": "US 'Liberation Day' tariffs announced", "kind": "trade"},
]


def closes():
    out = {}
    for u in UNIVERSE + [{"ticker": "SPY", "sector": "Market"}]:
        try:
            h = json.load(open(os.path.join(DATA, "history", f"{u['ticker']}.json")))
            out[u["ticker"]] = pd.Series(h["close"], index=pd.to_datetime(h["dates"]))
        except FileNotFoundError:
            pass
    return pd.DataFrame(out)


def move(px, start, days):
    i = px.index.searchsorted(pd.Timestamp(start))
    if i == 0 or i + days >= len(px):
        return None
    return px.iloc[i + days - 1] / px.iloc[i - 1] - 1   # from the close before the event


def main():
    px = closes()
    sector = {u["ticker"]: u["sector"] for u in UNIVERSE}
    lessons = []
    for e in PAST:
        d1, d20 = move(px, e["date"], 1), move(px, e["date"], 20)
        if d1 is None:
            continue
        by = {}
        for t, s in sector.items():
            if t in d1 and not np.isnan(d1[t]):
                by.setdefault(s, []).append((d1[t], d20[t] if d20 is not None else np.nan))
        secs = sorted(({"sector": s, "day1": round(float(np.nanmean([a for a, _ in v])), 4),
                        "day20": round(float(np.nanmean([b for _, b in v])), 4)} for s, v in by.items()), key=lambda x: x["day1"])
        movers = d1.drop("SPY").dropna().sort_values()
        lessons.append({**e, "market_day1": round(float(d1["SPY"]), 4),
                        "market_day20": round(float(d20["SPY"]), 4) if d20 is not None else None,
                        "sectors": secs, "worst": [[t, round(float(v), 4)] for t, v in movers.head(3).items()],
                        "best": [[t, round(float(v), 4)] for t, v in movers.tail(3)[::-1].items()]})
    ev = json.load(open(os.path.join(DATA, "events.json")))
    start = pd.Timestamp(ev["meta"]["date"])
    i = px.index.searchsorted(start)
    since = px.iloc[-1] / px.iloc[i - 1] - 1 if 0 < i < len(px) else None
    impacts = []
    for e in ev["events"]:
        vals = [float(since[t] - since["SPY"]) for t in e["tickers"] if since is not None and t in since and not np.isnan(since[t])]
        impacts.append(round(float(np.mean(vals)), 4) if vals else None)
    json.dump({"lessons": lessons, "since_date": ev["meta"]["date"], "impacts": impacts},
              open(os.path.join(DATA, "world.json"), "w"), separators=(",", ":"))
    print(len(lessons), "lessons;", sum(i is not None for i in impacts), "impacts")


if __name__ == "__main__":
    main()
