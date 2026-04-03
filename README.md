# TransitKit

The Sydney transit API developers actually want to use.

TransitKit wraps the [Transport for NSW](https://opendata.transport.nsw.gov.au/) Trip Planner API into a clean, modern REST API. Real-time bus departures, nearby stops, and route search — with full CORS support, proper error codes, and clean JSON.

**Website:** [transitkit.dev](https://transitkit.dev)

## Project Structure

```
/              → Marketing site + docs (Next.js 15, static export)
/api           → API backend (Express + TypeScript)
```

## Website (Next.js)

```bash
npm install
npm run dev       # local dev server
npm run build     # static export → /out
```

Deployed on Cloudflare Pages. Build output is the `out/` directory.

## API (Express)

```bash
cd api
npm install
cp .env.example .env    # add your TfNSW key + API keys
npm run build           # compile TypeScript
npm run start           # run on PORT (default 3001)
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `TFNSW_API_KEY` | JWT from [TfNSW Open Data](https://opendata.transport.nsw.gov.au/) |
| `API_KEYS` | Comma-separated valid TransitKit API keys |
| `PORT` | Server port (default 3001) |

### Example Request

```bash
curl "https://api.transitkit.dev/v1/departures?stop=204210&limit=5" \
  -H "Authorization: Bearer tk_live_xxxxxxxxxxxx"
```

## Data Attribution

TransitKit uses data from the Transport for NSW Open Data platform under the Transport for NSW data licence.

## License

MIT
