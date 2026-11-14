"""Congress stock trades from the free official sources, no API key needed.

House:  the Clerk's yearly index (https://disclosures-clerk.house.gov/public_disc/financial-pdfs/<year>FD.zip)
        lists every Periodic Transaction Report (PTR). Electronically filed PTRs are text PDFs we can read.
        Hand-written, scanned PTRs have no text and are skipped (the site says how many).
Senate: the eFD search site (https://efdsearch.senate.gov). After accepting its terms, its search returns
        PTRs, and electronically filed ones are plain HTML tables. Scanned paper filings are skipped.

Parsed filings are cached by id in site/data/congress_cache.json, so each PDF/page is read only once.

  python scripts/congress_official.py      # test run: prints what it found
"""
import io, json, os, re, sys, zipfile, datetime as dt
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "site", "data")
CACHE = os.path.join(DATA, "congress_cache.json")
LOOKBACK = 120          # days of filings to look at
MAX_NEW = 250           # most new filings to read in one run (the rest are picked up next run)
BROWSER_UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"


def load_cache():
    try:
        return json.load(open(CACHE))
    except Exception:
        return {}


def save_cache(c):
    json.dump(c, open(CACHE, "w"), separators=(",", ":"))


def iso(mdY):
    m, d, y = mdY.split("/")
    return f"{y}-{int(m):02d}-{int(d):02d}"


def kind(code):
    code = code.strip().upper()
    return "Buy" if code.startswith("P") else "Sell" if code.startswith("S") else "Exchange" if code.startswith("E") else code


# ---------------------------------------------------------------- House
ROW = re.compile(
    r"\(([A-Z][A-Z.\-]{0,6})\)\s*\[(?:ST|OP|OT)\]"            # (AAPL) [ST]
    r"[\s\S]{0,80}?\b(P|S\s*\(partial\)|S|E)\s+"                # transaction type
    r"(\d{1,2}/\d{1,2}/\d{4})\s*(\d{1,2}/\d{1,2}/\d{4})\s*"      # trade date, notification date
    r"((?:\$[\d,]+\s*-\s*\$[\d,]+)|(?:Over\s*\$[\d,]+)|(?:\$[\d,]+))",
)


def house_pdf_trades(pdf_bytes):
    from pypdf import PdfReader
    text = "\n".join((p.extract_text() or "") for p in PdfReader(io.BytesIO(pdf_bytes)).pages)
    text = text.replace("\x00", "")
    out = []
    for m in ROW.finditer(text):
        t, code, d, _n, amt = m.groups()
        out.append({"ticker": t, "type": kind(code), "date": iso(d), "amount": re.sub(r"\s+", " ", amt)})
    return out, bool(text.strip())


def house(s, cache, since):
    rows, scanned, new = [], 0, 0
    years = sorted({since.year, dt.date.today().year})
    for y in years:
        z = s.get(f"https://disclosures-clerk.house.gov/public_disc/financial-pdfs/{y}FD.zip", timeout=90)
        z.raise_for_status()
        zf = zipfile.ZipFile(io.BytesIO(z.content))
        xml = zf.read(next(n for n in zf.namelist() if n.lower().endswith(".xml")))
        for m in ET.fromstring(xml).iter("Member"):
            g = lambda k: (m.findtext(k) or "").strip()
            if g("FilingType") != "P":
                continue
            filed = iso(g("FilingDate"))
            if filed < since.isoformat():
                continue
            doc = g("DocID"); key = f"H{doc}"
            url = f"https://disclosures-clerk.house.gov/public_disc/ptr-pdfs/{y}/{doc}.pdf"
            if key not in cache:
                if new >= MAX_NEW:
                    continue
                new += 1
                try:
                    r = s.get(url, timeout=60); r.raise_for_status()
                    trades, has_text = house_pdf_trades(r.content)
                    cache[key] = {"t": trades, "scan": not has_text}
                except Exception as e:
                    print("house pdf failed", doc, e); continue
            c = cache[key]
            if c.get("scan"):
                scanned += 1
            who = " ".join(x for x in [g("Prefix"), g("First"), g("Last"), g("Suffix")] if x)
            for t in c["t"]:
                rows.append({**t, "who": who, "chamber": "House", "party": None, "district": g("StateDst"),
                             "filed": filed, "url": url})
    print(f"house: {len(rows)} trades, {scanned} scanned filings skipped, {new} new filings read")
    return rows, scanned


# ---------------------------------------------------------------- Senate
def senate(s, cache, since):
    from lxml import html as LH
    base = "https://efdsearch.senate.gov"
    s.headers.update({"User-Agent": BROWSER_UA})
    home = s.get(f"{base}/search/home/", timeout=60); home.raise_for_status()
    tok = LH.fromstring(home.text).xpath("//input[@name='csrfmiddlewaretoken']/@value")[0]
    s.post(f"{base}/search/home/", data={"prohibition_agreement": "1", "csrfmiddlewaretoken": tok},
           headers={"Referer": f"{base}/search/home/"}, timeout=60).raise_for_status()
    csrf = s.cookies.get("csrftoken") or s.cookies.get("csrf")
    rows, scanned, new, start = [], 0, 0, 0
    while True:
        r = s.post(f"{base}/search/report/data/", headers={"X-CSRFToken": csrf, "Referer": f"{base}/search/"}, timeout=60, data={
            "start": str(start), "length": "100", "report_types": "[11]", "filer_types": "[]",
            "submitted_start_date": since.strftime("%m/%d/%Y 00:00:00"), "submitted_end_date": "",
            "candidate_state": "", "senator_state": "", "office_id": "", "first_name": "", "last_name": "",
            "csrfmiddlewaretoken": csrf})
        r.raise_for_status()
        page = r.json().get("data", [])
        for first, last, _full, link, filed in page:
            href = LH.fromstring(link).xpath("//a/@href")[0]
            who = f"Sen. {first.strip()} {last.strip()}".replace("  ", " ")
            filed = iso(filed)
            if "/paper/" in href:
                scanned += 1; continue
            key = "S" + href.rstrip("/").split("/")[-1]
            if key not in cache:
                if new >= MAX_NEW:
                    continue
                new += 1
                try:
                    p = s.get(base + href, headers={"Referer": f"{base}/search/"}, timeout=60); p.raise_for_status()
                    trades = []
                    for tr in LH.fromstring(p.text).xpath("//table//tbody/tr"):
                        td = [" ".join(x.text_content().split()) for x in tr.xpath("./td")]
                        if len(td) < 8:
                            continue
                        _n, d, _owner, tick, _asset, atype, typ, amt = td[:8]
                        if not re.fullmatch(r"[A-Z][A-Z.\-]{0,6}", tick or "") or "Stock" not in atype:
                            continue
                        trades.append({"ticker": tick, "type": kind("P" if "Purchase" in typ else "S" if "Sale" in typ else "E" if "Exchange" in typ else typ),
                                       "date": iso(d), "amount": amt})
                    cache[key] = {"t": trades, "scan": False}
                except Exception as e:
                    print("senate ptr failed", href, e); continue
            for t in cache[key]["t"]:
                rows.append({**t, "who": who, "chamber": "Senate", "party": None, "filed": filed, "url": base + href})
        if len(page) < 100:
            break
        start += 100
    print(f"senate: {len(rows)} trades, {scanned} paper filings skipped, {new} new filings read")
    return rows, scanned


def fetch(s=None):
    """Returns (rows, notes). rows use the same shape as the other Congress sources."""
    import requests
    s = s or requests.Session()
    since = dt.date.today() - dt.timedelta(days=LOOKBACK)
    cache, rows, notes = load_cache(), [], {}
    for name, fn in (("House", house), ("Senate", senate)):
        try:
            sess = requests.Session(); sess.headers.update({"User-Agent": BROWSER_UA})
            r, scanned = fn(sess, cache, since)
            rows += r; notes[name] = {"ok": True, "trades": len(r), "scanned_skipped": scanned}
        except Exception as e:
            print(name, "failed:", repr(e)); notes[name] = {"ok": False, "error": str(e)[:200]}
    save_cache(cache)
    return rows, notes


if __name__ == "__main__":
    rows, notes = fetch()
    print(json.dumps(notes, indent=1))
    for r in rows[:15]:
        print(r)
    sys.exit(0 if any(n["ok"] for n in notes.values()) else 1)
