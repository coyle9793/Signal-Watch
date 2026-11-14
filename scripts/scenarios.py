"""Storm simulator + shelter planner data: how every S&P 100 stock and a set of classic "shelters"
did during past storms caused by world events (conflicts, oil shocks, elections, currency crises,
trade wars, bank failures, a pandemic).

For each past episode we keep the daily path (cumulative return from the last close before the
storm) for every stock, the market (SPY) and each shelter, plus how long the market took to get
back to its pre-storm level. Shelters get a 1-3 umbrella rating per kind of storm from how
reliably they beat the market across those episodes.

History only changes when the episode list does, so the result is cached (restored from the
data branch) and rebuilt only when this file's episode list or the universe changes.
Writes site/data/scenarios.json
"""
import hashlib, json, os, sys
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "site", "data")
OUT = os.path.join(DATA, "scenarios.json")
U = json.load(open(os.path.join(DATA, "universe.json")))

# key, name, icon, plain description. Wars and conflicts are described plainly and respectfully.
EVENTS = [
    ("war", "War or conflict scare", "⚔️", "Fighting breaks out or escalates somewhere that matters to trade or energy. Markets often fall at first on the uncertainty."),
    ("oil", "Oil price shock", "🛢️", "Oil jumps suddenly, for example after supply is disrupted. It raises costs for airlines, shippers and shoppers."),
    ("election", "Election surprise", "🗳️", "A big vote lands differently from what markets expected, or the outcome is uncertain for days."),
    ("currency", "Currency crisis", "💱", "A major currency drops sharply or a borrowing trade unwinds, and money rushes to safer places."),
    ("trade", "Trade war or tariffs", "🚢", "New tariffs or trade threats between big economies hit companies that sell or build abroad."),
    ("bank", "Banking scare", "🏦", "Banks fail or wobble and people worry their money is not safe."),
    ("pandemic", "Pandemic shock", "🦠", "A health emergency shuts down travel and business across the world."),
]
# (event, name, last close before the storm, end of the storm)
EPISODES = [
    ("war", "Russia's invasion of Ukraine (Feb–Mar 2022)", "2022-02-11", "2022-03-08"),
    ("war", "The 7 October attack on Israel and the war in Gaza (Oct 2023)", "2023-10-06", "2023-10-27"),
    ("war", "Iran and Israel exchange strikes (Apr 2024)", "2024-04-11", "2024-04-19"),
    ("war", "War between Israel and Iran (Jun 2025)", "2025-06-12", "2025-06-23"),
    ("war", "US–Iran tensions after a US strike (Jan 2020)", "2020-01-02", "2020-01-08"),
    ("oil", "Attack on Saudi oil facilities (Sep 2019)", "2019-09-13", "2019-10-02"),
    ("oil", "Oil spikes after the invasion of Ukraine (Mar 2022)", "2022-03-01", "2022-03-08"),
    ("oil", "Oil climbs towards $95 (Sep 2023)", "2023-09-15", "2023-10-03"),
    ("election", "UK votes to leave the EU (Jun 2016)", "2016-06-23", "2016-06-27"),
    ("election", "US presidential election (Nov 2016)", "2016-11-07", "2016-11-15"),
    ("election", "US presidential election (Nov 2020)", "2020-11-02", "2020-11-09"),
    ("election", "US presidential election (Nov 2024)", "2024-11-04", "2024-11-11"),
    ("currency", "China devalues the yuan (Aug 2015)", "2015-08-10", "2015-08-25"),
    ("currency", "Turkish lira crisis (Aug 2018)", "2018-08-09", "2018-08-15"),
    ("currency", "UK pound and government bond crisis (Sep–Oct 2022)", "2022-09-22", "2022-10-12"),
    ("currency", "Japanese yen borrowing trade unwinds (Aug 2024)", "2024-07-31", "2024-08-05"),
    ("trade", "Tariff and rates sell-off (Oct–Dec 2018)", "2018-10-03", "2018-12-24"),
    ("trade", "US–China tariffs escalate (May 2019)", "2019-05-03", "2019-06-03"),
    ("trade", "Sweeping US tariffs announced (Apr 2025)", "2025-04-02", "2025-04-08"),
    ("bank", "US regional bank failures (Mar 2023)", "2023-03-08", "2023-03-15"),
    ("bank", "Banking stress in Europe and the US (Mar 2023, second wave)", "2023-03-15", "2023-03-24"),
    ("pandemic", "COVID-19 crash (Feb–Mar 2020)", "2020-02-19", "2020-03-23"),
]
SHELTERS = {
    "GLD": ("Gold", "🪙", "Pays no dividend, and it can fall too when the dollar is strong or rates rise."),
    "TLT": ("US government bonds (long)", "📜", "Can fall hard when inflation or interest rates are the cause of the storm."),
    "BIL": ("Cash (US Treasury bills)", "💵", "Very steady, but it won't grow much and you can miss the rebound."),
    "XLU": ("Utilities", "💡", "Steady demand, but sensitive to interest rates."),
    "XLP": ("Consumer staples", "🛒", "People still buy food and soap, but these grow slowly."),
    "XLV": ("Healthcare", "🩺", "Needed in any weather, but drug-price politics can hit it."),
    "ITA": ("Defence companies", "🛡️", "Has tended to rise in conflicts, but it depends on government budgets and can fall when tensions ease."),
    "UUP": ("US dollar", "💲", "Often rises in a panic, but a strong dollar can reverse quickly."),
    "FXF": ("Swiss franc", "🇨🇭", "A traditional safe place, but Switzerland's central bank sometimes steps in to weaken it."),
}
TICKERS = [u["ticker"] for u in U] + ["SPY"] + list(SHELTERS)
SIG = hashlib.sha1(json.dumps([EPISODES, sorted(TICKERS), 2]).encode()).hexdigest()[:12]


def main():
    if os.path.exists(OUT):
        try:
            if json.load(open(OUT)).get("meta", {}).get("sig") == SIG:
                print("scenarios.json is up to date"); return
        except Exception:
            pass
    import yfinance as yf
    raw = yf.download(TICKERS, start="2015-06-01", interval="1d", group_by="ticker", auto_adjust=True, threads=False, progress=False)
    close = {}
    for t in TICKERS:
        try:
            s = raw[t]["Close"].dropna()
        except KeyError:
            s = pd.Series(dtype=float)
        if len(s) < 50:
            try:
                h = yf.Ticker(t).history(start="2015-06-01", auto_adjust=True)["Close"].dropna()
                h.index = pd.to_datetime(h.index, utc=True).tz_localize(None).normalize()
                s = h
            except Exception as e:
                print("missing", t, e)
        if len(s) >= 50:
            close[t] = s
    if "SPY" not in close:
        print("no market data; keeping the old file"); sys.exit(1)
    spy = close["SPY"]
    eps = []
    for i, (ev, name, start, end) in enumerate(EPISODES):
        d0, d1 = pd.Timestamp(start), pd.Timestamp(end)
        idx = spy.index[(spy.index >= d0) & (spy.index <= d1)]
        if len(idx) < 2:
            print("skip", name); continue
        paths = {}
        for t, s in close.items():
            s2 = s.reindex(idx).ffill()
            if s2.isna().iloc[0] or s2.iloc[0] <= 0:
                continue
            paths[t] = [round(float(x), 4) for x in (s2 / s2.iloc[0] - 1).values]
        base = float(spy.loc[idx[0]])
        after = spy[spy.index > idx[-1]]
        back = next((k + 1 for k, v in enumerate(after.values[:500]) if v >= base), None)
        eps.append({"id": f"e{i}", "event": ev, "name": name, "start": str(idx[0].date()), "end": str(idx[-1].date()),
                    "days": [str(d.date()) for d in idx], "paths": paths, "market_back_days": back,
                    "market": paths["SPY"][-1], "market_low": min(paths["SPY"])})
    # umbrella ratings: per event, how reliably each shelter beat the market
    ratings = {}
    for ev, *_ in EVENTS:
        E = [e for e in eps if e["event"] == ev]
        ratings[ev] = {}
        for t in SHELTERS:
            r = [(e["paths"][t][-1], e["paths"]["SPY"][-1]) for e in E if t in e["paths"]]
            if not r:
                continue
            hit = sum(a > b for a, b in r) / len(r)
            excess = sum(a - b for a, b in r) / len(r)
            avg = sum(a for a, _ in r) / len(r)
            um = 3 if hit >= 0.75 and excess >= 0.02 else 2 if hit >= 0.6 and excess > 0 else 1 if hit >= 0.5 and excess > 0 else 0
            ratings[ev][t] = {"umbrellas": um, "hit": round(hit, 2), "excess": round(excess, 4), "avg": round(avg, 4), "n": len(r)}
    json.dump({
        "meta": {"sig": SIG, "source": "Yahoo Finance daily closes (adjusted)", "built": pd.Timestamp.utcnow().strftime("%Y-%m-%d")},
        "events": [{"key": k, "name": n, "icon": i, "about": a} for k, n, i, a in EVENTS],
        "shelters": {t: {"name": n, "icon": i, "catch": c} for t, (n, i, c) in SHELTERS.items()},
        "ratings": ratings, "episodes": eps,
    }, open(OUT, "w"), separators=(",", ":"))
    print("wrote", OUT, len(eps), "episodes", round(os.path.getsize(OUT) / 1e3), "KB")


if __name__ == "__main__":
    main()
