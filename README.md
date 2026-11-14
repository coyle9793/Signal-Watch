# Signal Watch

A demo site that watches the S&P 100 for insider trades (Congress and SEC Form 4),
surprise market shocks and major world events, and gives a plain daily Buy, Hold or
Sell call with reasons. Not financial advice.

- `site/` is the static website (open `site/index.html` through any web server).
- `site/data/` holds the JSON the site reads.
- `scripts/` builds that JSON from the data sources.

Preview locally: `cd site && python3 -m http.server 8000`, then open http://localhost:8000
