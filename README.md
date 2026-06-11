# TransitKit

The Sydney transit API developers actually want to use.

TransitKit wraps the [Transport for NSW](https://opendata.transport.nsw.gov.au/) Trip Planner API into a clean, modern REST API. Multi-leg trip planning, real-time departures across all modes (trains, metro, buses, light rail, ferries), nearby stops, and stop search — with full CORS support, proper error codes, and clean JSON.

### Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /v1/trips` | Plan journeys between two stops — legs, platforms, real-time times, route geometry |
| `GET /v1/departures` | Live departure board for a stop (`modes=all` for every transport mode) |
| `GET /v1/nearby` | Stops near a lat/lng with coordinates and served modes |
| `GET /v1/stops/search` | Stop name search with coordinates |
| `GET /v1/score` | Transit accessibility score for a location |

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
