"""Daily Buy / Hold / Sell call for each S&P 100 stock, from simple, explainable rules.

Points (each comes with a plain-English reason):
  Pullback   +2 if it fell 7+ points behind the market over the past month (short-term
             overreactions tend to partly reverse), -2 if it ran 7+ points ahead
  Trend      shown for context (above/below the 200-day average), no points: in our 5-year
             backtest, trend-following rules did not beat the market for these stocks
  Insiders   +2 if 2+ insiders bought in the open market, +1 if one did; -1 if $5M+ unplanned selling
  Congress   +0.5 per net buy, capped at +/-1
  Shocks     -1.5 for an unexplained sell-off in the last 10 days, -0.5 explained; +0.5 for a surge
             +/-0.5 if after past shocks this stock usually bounced back / kept falling
  World      -0.5 if it is exposed to one of today's 5 riskiest world events
Score >= 2 Buy, <= -2 Sell, otherwise Hold.

Track record: the price-based rules (trend + momentum) are replayed on each of the last 250
trading days, and we measure what each call returned over the next 20 trading days.
Writes site/data/calls.json
"""
import json, os, datetime as dt
import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "site", "data")
UNIVERSE = json.load(open(os.path.join(DATA, "universe.json")))


def j(name, default):
    try:
        return json.load(open(os.path.join(DATA, name)))
    except Exception:
        return default


def label(score):
    return "Buy" if score >= 2 else "Sell" if score <= -2 else "Hold"


def price_points(c, spy):
    """Pullback points for every day (vectorised) -- used for today and the backtest."""
    rel = c.pct_change(21) - spy.pct_change(21)
    pts = np.where(rel < -0.07, 2.0, np.where(rel > 0.07, -2.0, 0.0))
    return pd.Series(pts, index=c.index).where(rel.notna())


def main():
    prices = {s["ticker"]: s for s in j("prices.json", {"stocks": []})["stocks"]}
    sig = j("insiders.json", {}).get("signals", {})
    shocks = j("shocks.json", {"shocks": []})["shocks"]
    events = j("events.json", {"events": []})["events"][:5]
    spyh = j("history/SPY.json", None)
    spy = pd.Series(spyh["close"], index=pd.to_datetime(spyh["dates"]))
    calls, record = [], {"Buy": [], "Hold": [], "Sell": []}
    for u in UNIVERSE:
        t = u["ticker"]; p = prices.get(t)
        h = j(f"history/{t}.json", None)
        if not p or not h:
            continue
        c = pd.Series(h["close"], index=pd.to_datetime(h["dates"]))
        score, why = 0.0, []

        def add(pts, text):
            nonlocal score
            score += pts
            why.append({"pts": pts, "text": text})

        rel = (p["chg_1m"] or 0) - (prices["SPY"]["chg_1m"] or 0)
        if rel < -0.07: add(2, f"Fell {-rel*100:.0f} points behind the market this month; pullbacks like this have tended to partly recover")
        elif rel > 0.07: add(-2, f"Ran {rel*100:.0f} points ahead of the market this month; spikes like this have tended to partly fade")
        if p["sma200"]:
            add(0, "Long-term uptrend (above its 200-day average)" if p["price"] > p["sma200"] else "Long-term downtrend (below its 200-day average)")
        g = sig.get(t, {})
        if g.get("insider_buyers", 0) >= 2: add(2, f"{g['insider_buyers']} company insiders bought shares with their own money")
        elif g.get("insider_buyers", 0) == 1: add(1, "A company insider bought shares with their own money")
        if g.get("unplanned_sell_value", 0) >= 5e6: add(-1, f"Insiders sold ${g['unplanned_sell_value']/1e6:.0f}M outside pre-planned schedules")
        elif g.get("insider_sellers", 0) >= 3 and not g.get("insider_buyers"): add(-1, f"{g['insider_sellers']} different insiders sold and none bought")
        net = g.get("congress_buys", 0) - g.get("congress_sells", 0)
        if net: add(max(-1, min(1, 0.5 * net)), f"Members of Congress were net {'buyers' if net > 0 else 'sellers'} ({g['congress_buys']} buys, {g['congress_sells']} sells)")
        mine = [s for s in shocks if s["ticker"] == t]
        if mine:
            s = mine[0]
            if s["ret"] < 0 and s["abnormal"] < 0:
                add(-1.5 if not s["explained"] else -0.5, f"{'Unexplained' if not s['explained'] else 'News-driven'} {s['kind'].lower()} on {s['date']} ({s['ret']*100:+.1f}%)")
            else:
                add(0.5, f"{s['kind']} on {s['date']} ({s['ret']*100:+.1f}%)")
            if s.get("past_up_rate") is not None and s["past_shocks"] >= 5:
                if s["past_up_rate"] >= 0.65: add(0.5, f"After past shocks it was higher a month later {s['past_up_rate']*100:.0f}% of the time")
                elif s["past_up_rate"] <= 0.35: add(-0.5, f"After past shocks it kept falling {100-s['past_up_rate']*100:.0f}% of the time")
        hit = [e for e in events if t in e["tickers"]]
        if hit: add(-0.5, f"Exposed to a major world event: {hit[0]['title']}")
        calls.append({"ticker": t, "name": u["name"], "sector": u["sector"], "price": p["price"], "chg_1d": p["chg_1d"],
                      "score": round(score, 1), "call": label(score), "reasons": sorted(why, key=lambda r: -abs(r["pts"]))})
        # backtest of the price-only rules
        pp = price_points(c, spy.reindex(c.index).ffill())
        fwd = c.shift(-20) / c - 1 - (spy.shift(-20) / spy - 1).reindex(c.index)
        bt = pd.concat([pp, fwd], axis=1, keys=["p", "f"], sort=True).dropna().iloc[-1000:][::5]   # weekly samples, last ~4 years
        for _, r in bt.iterrows():
            record[label(r.p)].append(float(r.f))
    calls.sort(key=lambda x: -x["score"])
    tr = {k: {"n": len(v), "avg_vs_market": round(float(np.mean(v)), 4) if v else None,
              "beat_rate": round(float(np.mean([x > 0 for x in v])), 3) if v else None} for k, v in record.items()}
    meta = {"updated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "counts": {k: sum(c["call"] == k for c in calls) for k in ("Buy", "Hold", "Sell")}, "track_record": tr,
            "demo": j("prices.json", {}).get("meta", {}).get("demo", False)}
    json.dump({"meta": meta, "calls": calls}, open(os.path.join(DATA, "calls.json"), "w"), separators=(",", ":"))
    print(meta)


if __name__ == "__main__":
    main()
