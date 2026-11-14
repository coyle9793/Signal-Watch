"""Turn a GDELT 1.0 daily events export into a small events.json for the site.

Keeps international, widely reported events, groups duplicates, labels the kind of
event, and tags which sectors / S&P 100 stocks it could move.
Usage:
  python scripts/gdelt_events.py <export.CSV> [more.CSV ...]   # local files
  python scripts/gdelt_events.py --fetch 7                       # download the last 7 daily files
Writes site/data/events.json. Also counts news mentions of each S&P 100 company per day
(by name in the article URL or actor name), which the shock detector uses for "no clear news".
"""
import io, json, os, re, sys, zipfile, datetime as dt
import pandas as pd

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "site", "data", "events.json")
UNIVERSE = json.load(open(os.path.join(ROOT, "site", "data", "universe.json")))
ALIASES = {"BRK-B": ["berkshire"], "GOOGL": ["alphabet", "google"], "GOOG": ["alphabet", "google"], "META": ["meta-platforms", "facebook", "zuckerberg"],
           "JPM": ["jpmorgan"], "BAC": ["bank-of-america"], "WFC": ["wells-fargo"], "GS": ["goldman"], "MS": ["morgan-stanley"],
           "AMZN": ["amazon"], "MSFT": ["microsoft"], "NVDA": ["nvidia"], "TSLA": ["tesla", "elon-musk"], "AAPL": ["apple"],
           "UNH": ["unitedhealth"], "XOM": ["exxon"], "CVX": ["chevron"], "LMT": ["lockheed"], "RTX": ["raytheon", "rtx"],
           "BA": ["boeing"], "GE": ["ge-aerospace"], "MMM": ["3m"], "T": ["at-t", "at-and-t"], "V": ["visa-inc", "visa-card"],
           "F": ["ford-motor"], "TGT": ["target-corp", "target-store"], "PG": ["procter"], "JNJ": ["johnson-johnson", "johnson-and-johnson"],
           "KO": ["coca-cola", "coke"], "HD": ["home-depot"], "LLY": ["eli-lilly", "lilly"], "MCD": ["mcdonald"], "DIS": ["disney"], "C": ["citigroup", "citibank"]}


def keywords(u):
    if u["ticker"] in ALIASES:
        return ALIASES[u["ticker"]]
    return [re.sub(r"[^a-z0-9]+", "-", u["name"].lower()).strip("-")]


def mentions(df):
    out = {}
    url = df["url"].fillna("").str.lower()
    actors = (df["a1name"].fillna("") + " " + df["a2name"].fillna("")).str.lower()
    for u in UNIVERSE:
        hit = pd.Series(False, index=df.index)
        for k in keywords(u):
            pat = r"(?<![a-z0-9])" + re.escape(k) + r"(?![a-z0-9])"
            hit |= url.str.contains(pat, regex=True) | actors.str.contains(pat.replace(r"\-", " "), regex=True)
        by_day = df.loc[hit].groupby("dateadded")["url"].nunique()
        if len(by_day):
            out[u["ticker"]] = {str(d): int(n) for d, n in by_day.items()}
    return out


def fetch(days):
    import requests
    frames = []
    for i in range(1, days + 4):
        d = (dt.date.today() - dt.timedelta(days=i)).strftime("%Y%m%d")
        r = requests.get(f"http://data.gdeltproject.org/events/{d}.export.CSV.zip", timeout=120)
        if r.status_code != 200:
            continue
        z = zipfile.ZipFile(io.BytesIO(r.content))
        frames.append(read(z.open(z.namelist()[0])))
        if len(frames) >= days:
            break
    return frames

COLS = ["id","sqldate","monthyear","year","fracdate",
 "a1code","a1name","a1country","a1group","a1eth","a1rel1","a1rel2","a1t1","a1t2","a1t3",
 "a2code","a2name","a2country","a2group","a2eth","a2rel1","a2rel2","a2t1","a2t2","a2t3",
 "isroot","code","basecode","rootcode","quad","goldstein","mentions","sources","articles","tone",
 "a1geotype","a1geo","a1geocc","a1adm1","a1lat","a1lon","a1fid",
 "a2geotype","a2geo","a2geocc","a2adm1","a2lat","a2lon","a2fid",
 "geotype","geo","geocc","adm1","lat","lon","fid","dateadded","url"]

ROOT = {"01":"Statement","02":"Appeal","03":"Pledge to cooperate","04":"Diplomacy","05":"Cooperation",
 "06":"Material cooperation","07":"Aid","08":"Concession","09":"Investigation","10":"Demand",
 "11":"Criticism","12":"Rejection","13":"Threat","14":"Protest","15":"Military posturing",
 "16":"Cut ties / sanctions","17":"Coercion","18":"Attack","19":"Armed conflict","20":"Mass violence"}

# Which stocks a kind of event or region tends to move. Simple, explainable rules.
SECTORS = {
 "conflict": {"label":"Defence & energy","tickers":["LMT","RTX","GD","BA","XOM","CVX","COP"]},
 "sanctions":{"label":"Trade-exposed tech & industrials","tickers":["AAPL","NVDA","QCOM","INTC","CAT","BA"]},
 "cooperation":{"label":"Global trade & industrials","tickers":["CAT","DE","FDX","UPS","HON"]},
 "unrest":{"label":"Consumer & travel","tickers":["BKNG","MCD","SBUX","NKE","KO"]},
}
REGION = {"CHN":["AAPL","NVDA","QCOM","TSLA","NKE","SBUX"],"TWN":["NVDA","AAPL","QCOM","AMD","AVGO"],
 "RUS":["XOM","CVX","COP","LMT","RTX"],"UKR":["LMT","RTX","GD","XOM"],"ISR":["LMT","RTX","XOM","CVX"],
 "IRN":["XOM","CVX","COP","LMT"],"SAU":["XOM","CVX","COP"],"MEX":["GM","F","CAT"],"CAN":["GM","F","CVX"],
 "JPN":["TSLA","GM","AAPL"],"KOR":["AAPL","NVDA"],"IND":["AAPL","ACN","IBM"],"VEN":["XOM","CVX","COP"]}

CNAME = {"USA":"United States","CHN":"China","RUS":"Russia","UKR":"Ukraine","ISR":"Israel","PSE":"Palestine","IRN":"Iran","IRQ":"Iraq",
 "SAU":"Saudi Arabia","GBR":"United Kingdom","FRA":"France","DEU":"Germany","JPN":"Japan","KOR":"South Korea","PRK":"North Korea",
 "TWN":"Taiwan","IND":"India","PAK":"Pakistan","MEX":"Mexico","CAN":"Canada","BRA":"Brazil","VEN":"Venezuela","TUR":"Turkey",
 "SYR":"Syria","LBN":"Lebanon","YEM":"Yemen","EGY":"Egypt","ETH":"Ethiopia","SDN":"Sudan","AFG":"Afghanistan","ARG":"Argentina",
 "AUS":"Australia","ITA":"Italy","ESP":"Spain","POL":"Poland","IRL":"Ireland","QAT":"Qatar","ARE":"UAE","EUR":"Europe","NGA":"Nigeria",
 "ZAF":"South Africa","COL":"Colombia","PAN":"Panama","ECU":"Ecuador","CUB":"Cuba","PHL":"Philippines","VNM":"Vietnam","IDN":"Indonesia"}


def kind(root):
    r = int(root)
    if r >= 18 or r == 15: return "conflict"
    if r in (16, 17, 13): return "sanctions"
    if r == 14: return "unrest"
    if r in (10, 11, 12): return "sanctions"
    return "cooperation"

def read(f):
    return pd.read_csv(f, sep="\t", header=None, names=COLS, dtype=str, quoting=3)


def main(args):
    frames = fetch(int(args[1])) if args[0] == "--fetch" else [read(a) for a in args]
    if not frames:
        sys.exit("no GDELT files")
    df = pd.concat(frames, ignore_index=True)
    latest = df.dateadded.max()
    news = mentions(df)
    df = df[df.dateadded == latest]
    for c in ["goldstein","mentions","sources","articles","tone"]:
        df[c] = pd.to_numeric(df[c], errors="coerce")
    df["rootcode"] = df["rootcode"].str.zfill(2)
    intl = df[df.a1country.notna() & df.a2country.notna() & (df.a1country != df.a2country)]
    intl = intl[intl.isroot == "1"]
    pair = intl.apply(lambda r: "-".join(sorted([r.a1country, r.a2country])), axis=1)
    intl = intl.assign(pair=pair)
    g = intl.groupby(["pair","rootcode"]).agg(
        articles=("articles","sum"), sources=("sources","sum"), events=("id","count"),
        tone=("tone","mean"), goldstein=("goldstein","mean"),
        a1=("a1name", lambda s: s.mode().iat[0] if len(s.mode()) else ""),
        a2=("a2name", lambda s: s.mode().iat[0] if len(s.mode()) else ""),
        place=("geo", lambda s: s.dropna().mode().iat[0] if len(s.dropna().mode()) else ""),
        url=("url", lambda s: s.iloc[0]), date=("dateadded","max"),
        countries=("a1country", lambda s: sorted(set(s))),
    ).reset_index()
    g = g.sort_values("articles", ascending=False).head(80)
    out = []
    for _, r in g.iterrows():
        k = kind(r.rootcode)
        cc = r.pair.split("-")
        tickers = []
        for c in cc:
            for t in REGION.get(c, []):
                if t not in tickers: tickers.append(t)
        for t in SECTORS[k]["tickers"]:
            if t not in tickers: tickers.append(t)
        # risk score: bigger coverage, more negative Goldstein and tone => more market risk
        risk = max(0.0, -r.goldstein) * 6 + max(0.0, -r.tone) * 4 + min(r.articles, 400) / 10
        # relevance: does it touch the US or a country S&P 100 firms depend on?
        relevant = any(c in REGION or c == "USA" for c in cc)
        risk *= 1.0 if relevant else 0.35
        names = [CNAME.get(c, c) for c in cc]
        out.append({"title": f"{' & '.join(names)}: {ROOT.get(r.rootcode,'Event')}", "actors": f"{(r.a1 or '').title()} / {(r.a2 or '').title()}",
            "kind": k, "sector": SECTORS[k]["label"], "countries": cc, "place": r.place,
            "articles": int(r.articles), "events": int(r.events), "tone": round(float(r.tone),2),
            "goldstein": round(float(r.goldstein),2), "risk": round(float(risk),1),
            "tickers": tickers[:8], "url": r.url, "date": r.date})
    out.sort(key=lambda e: -e["risk"])
    seen, dedup = set(), []
    for e in out:                      # same story reported under different actor names
        if e["url"] in seen: continue
        seen.add(e["url"]); dedup.append(e)
    out = dedup
    meta = {"source":"GDELT 1.0 daily export","date": latest, "news_days": sorted(set(frames_dates(frames))),
            "total_events": int(len(df)), "international_events": int(len(intl))}
    json.dump({"meta": meta, "events": out, "mentions": news}, open(OUT, "w"), indent=1)
    print(meta, len(out))

def frames_dates(frames):
    for f in frames:
        yield f.dateadded.mode().iat[0]


if __name__ == "__main__":
    main(sys.argv[1:])
