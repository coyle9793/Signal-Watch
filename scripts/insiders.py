"""Insider trades for the S&P 100: SEC Form 4 (company insiders) and Congress.

  python scripts/insiders.py          # real data (needs internet)
  python scripts/insiders.py --fake   # clearly-labelled fictional sample, for offline layout only

Sources
- Form 4: SEC EDGAR (free). Set SEC_USER_AGENT to "<name> <contact>" as the SEC asks.
- Congress: Quiver Quantitative if QUIVER_TOKEN is set, else the free House/Senate Stock
  Watcher datasets. If every Congress source fails, the site says so instead of guessing.
Writes site/data/insiders.json
"""
import json, os, sys, time, datetime as dt
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "site", "data")
UNIVERSE = {u["ticker"]: u for u in json.load(open(os.path.join(DATA, "universe.json")))}
TODAY = dt.date.today()
DAYS = 60            # Form 4 look-back
PER_TICKER = 12      # most recent Form 4s per company
UA = os.environ.get("SEC_USER_AGENT", "SignalWatch demo research contact@example.com")

CODES = {"P": "Buy", "S": "Sell", "A": "Award", "M": "Option exercise", "F": "Tax withholding",
         "G": "Gift", "D": "Sold to company", "C": "Conversion", "X": "Option exercise"}


def http():
    import requests
    s = requests.Session()
    s.headers.update({"User-Agent": UA, "Accept-Encoding": "gzip, deflate"})
    return s


def txt(node, path):
    el = node.find(path)
    return el.text.strip() if el is not None and el.text else None


def parse_form4(xml_text, url, filed):
    root = ET.fromstring(xml_text)
    ticker = (txt(root, "issuer/issuerTradingSymbol") or "").upper().replace(".", "-")
    owners = []
    for ro in root.findall("reportingOwner"):
        rel = ro.find("reportingOwnerRelationship")
        role = []
        if rel is not None:
            if txt(rel, "isDirector") in ("1", "true"): role.append("Director")
            if txt(rel, "isOfficer") in ("1", "true"): role.append(txt(rel, "officerTitle") or "Officer")
            if txt(rel, "isTenPercentOwner") in ("1", "true"): role.append("10% owner")
        owners.append({"name": txt(ro, "reportingOwnerId/rptOwnerName"), "role": ", ".join(role) or "Insider"})
    planned = txt(root, "aff10b5One") in ("1", "true")
    footnotes = " ".join((f.text or "") for f in root.iter("footnote")).lower()
    if "10b5-1" in footnotes:
        planned = True
    out = []
    for t in root.findall("nonDerivativeTable/nonDerivativeTransaction"):
        code = txt(t, "transactionCoding/transactionCode")
        if code not in ("P", "S"):          # only open-market buys and sells carry a signal
            continue
        shares = float(txt(t, "transactionAmounts/transactionShares/value") or 0)
        price = float(txt(t, "transactionAmounts/transactionPricePerShare/value") or 0)
        after = txt(t, "postTransactionAmounts/sharesOwnedFollowingTransaction/value")
        out.append({"ticker": ticker, "who": owners[0]["name"] if owners else "?", "role": owners[0]["role"] if owners else "",
                    "type": CODES[code], "date": txt(t, "transactionDate/value"), "filed": filed,
                    "shares": int(shares), "price": round(price, 2), "value": round(shares * price),
                    "owned_after": int(float(after)) if after else None, "planned": planned, "url": url})
    return out


def form4(s):
    r = s.get("https://www.sec.gov/files/company_tickers.json", timeout=30)
    if r.status_code != 200:
        raise SystemExit(f"SEC refused the request: HTTP {r.status_code} {r.text[:200]}")
    m = r.json()
    cik = {v["ticker"].upper().replace(".", "-"): int(v["cik_str"]) for v in m.values()}
    since = TODAY - dt.timedelta(days=DAYS)
    trades = []
    for t in UNIVERSE:
        c = cik.get(t)
        if not c:
            continue
        try:
            sub = s.get(f"https://data.sec.gov/submissions/CIK{c:010d}.json", timeout=30).json()["filings"]["recent"]
        except Exception as e:
            print("skip", t, e); continue
        time.sleep(0.12)
        n = 0
        for form, acc, filed, doc in zip(sub["form"], sub["accessionNumber"], sub["filingDate"], sub["primaryDocument"]):
            if filed < since.isoformat() or n >= PER_TICKER:
                break
            if form != "4":
                continue
            n += 1
            url = f"https://www.sec.gov/Archives/edgar/data/{c}/{acc.replace('-', '')}/{doc.split('/')[-1]}"
            try:
                r = s.get(url, timeout=30); time.sleep(0.12)
                for tr in parse_form4(r.text, url, filed):
                    tr["ticker"] = t
                    trades.append(tr)
            except Exception as e:
                print("bad form", url, e)
    return trades


def congress(s):
    tok = os.environ.get("QUIVER_TOKEN")
    rows, source = [], None
    if tok:
        try:
            r = s.get("https://api.quiverquant.com/beta/bulk/congresstrading",
                      headers={"Authorization": f"Bearer {tok}", "Accept": "application/json"}, timeout=60)
            for x in r.json():
                rows.append({"who": x.get("Representative") or x.get("Name"), "chamber": x.get("House") or x.get("Chamber"),
                             "party": x.get("Party"), "ticker": x.get("Ticker"), "type": x.get("Transaction"),
                             "date": (x.get("TransactionDate") or x.get("Traded") or "")[:10],
                             "filed": (x.get("ReportDate") or x.get("Filed") or "")[:10], "amount": x.get("Range") or x.get("Trade_Size_USD")})
            source = "Quiver Quantitative"
        except Exception as e:
            print("quiver failed", e)
    if not rows:
        for url, chamber, who in [
            ("https://house-stock-watcher-data.s3-us-west-2.amazonaws.com/data/all_transactions.json", "House", "representative"),
            ("https://senate-stock-watcher-data.s3-us-west-2.amazonaws.com/aggregate/all_transactions.json", "Senate", "senator")]:
            try:
                for x in s.get(url, timeout=60).json():
                    d = x.get("transaction_date") or ""
                    if "/" in d:
                        mm, dd, yy = d.split("/"); d = f"{yy}-{mm}-{dd}"
                    f = x.get("disclosure_date") or ""
                    if "/" in f:
                        mm, dd, yy = f.split("/"); f = f"{yy}-{mm}-{dd}"
                    rows.append({"who": x.get(who), "chamber": chamber, "party": x.get("party"), "ticker": x.get("ticker"),
                                 "type": x.get("type"), "date": d, "filed": f, "amount": x.get("amount"), "url": x.get("ptr_link")})
                source = "House & Senate Stock Watcher"
            except Exception as e:
                print("watcher failed", chamber, e)
    out = []
    for r in rows:
        t = (r["ticker"] or "").upper().replace(".", "-")
        if t not in UNIVERSE or not r["date"]:
            continue
        typ = (r["type"] or "").lower()
        r["ticker"], r["type"] = t, "Buy" if "purchase" in typ or typ == "buy" else "Sell" if "sale" in typ or "sell" in typ else r["type"]
        try:
            r["delay_days"] = (dt.date.fromisoformat(r["filed"]) - dt.date.fromisoformat(r["date"])).days if r["filed"] else None
        except ValueError:
            r["delay_days"] = None
        out.append(r)
    out.sort(key=lambda r: r["date"], reverse=True)
    return out[:400], source


def signals(f4, cong):
    """Per-stock summary the Daily calls tab uses: cluster buying, heavy unplanned selling, Congress flow."""
    sig = {}
    for t in UNIVERSE:
        buys = [x for x in f4 if x["ticker"] == t and x["type"] == "Buy"]
        sells = [x for x in f4 if x["ticker"] == t and x["type"] == "Sell"]
        unplanned = [x for x in sells if not x["planned"]]
        cb = [x for x in cong if x["ticker"] == t and x["type"] == "Buy"]
        cs = [x for x in cong if x["ticker"] == t and x["type"] == "Sell"]
        sig[t] = {"insider_buyers": len({x["who"] for x in buys}), "insider_buy_value": sum(x["value"] for x in buys),
                  "insider_sellers": len({x["who"] for x in sells}), "insider_sell_value": sum(x["value"] for x in sells),
                  "unplanned_sell_value": sum(x["value"] for x in unplanned),
                  "congress_buys": len(cb), "congress_sells": len(cs),
                  "congress_members": len({x["who"] for x in cb + cs})}
    return sig


def fake():
    import random
    random.seed(3)
    tick = list(UNIVERSE)
    f4, cg = [], []
    for i in range(140):
        t = random.choice(tick); buy = random.random() < 0.25
        sh = random.randint(500, 60000); pr = round(random.uniform(40, 600), 2)
        d = (TODAY - dt.timedelta(days=random.randint(1, 60))).isoformat()
        f4.append({"ticker": t, "who": f"Sample Insider {i % 37 + 1}", "role": random.choice(["CEO", "CFO", "Director", "EVP", "10% owner"]),
                   "type": "Buy" if buy else "Sell", "date": d, "filed": d, "shares": sh, "price": pr, "value": round(sh * pr),
                   "owned_after": sh * random.randint(2, 40), "planned": (not buy) and random.random() < 0.6, "url": "#"})
    for i in range(80):
        t = random.choice(tick); d = TODAY - dt.timedelta(days=random.randint(5, 120)); delay = random.randint(3, 60)
        cg.append({"who": f"Sample Member {i % 23 + 1}", "chamber": random.choice(["House", "Senate"]), "party": random.choice(["D", "R"]),
                   "ticker": t, "type": random.choice(["Buy", "Sell"]), "date": d.isoformat(),
                   "filed": (d + dt.timedelta(days=delay)).isoformat(), "delay_days": delay,
                   "amount": random.choice(["$1,001 - $15,000", "$15,001 - $50,000", "$50,001 - $100,000", "$250,001 - $500,000"]), "url": "#"})
    return f4, cg, "FICTIONAL SAMPLE (layout only)"


def main():
    if "--fake" in sys.argv:
        f4, cg, csrc = fake(); demo = True
    else:
        s = http(); demo = False
        f4 = form4(s)
        cg, csrc = congress(s)
    f4.sort(key=lambda x: x["date"] or "", reverse=True)
    meta = {"demo": demo, "updated": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "form4_source": "SEC EDGAR Form 4" if not demo else "FICTIONAL SAMPLE (layout only)", "form4_days": DAYS,
            "congress_source": csrc, "congress_count": len(cg)}
    json.dump({"meta": meta, "form4": f4, "congress": cg, "signals": signals(f4, cg)},
              open(os.path.join(DATA, "insiders.json"), "w"), separators=(",", ":"))
    print(meta, len(f4), "form 4 trades")


if __name__ == "__main__":
    main()
