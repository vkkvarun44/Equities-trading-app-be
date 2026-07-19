# TradeFlow API

Production-ready stock trading platform backend with Alpaca Broker API integration.

## Tech Stack

- Node.js 22+
- TypeScript
- Express.js
- PostgreSQL + Prisma ORM
- Redis
- JWT Authentication
- Winston Logger
- Zod Validation
- Docker

## Architecture

```
src/
├── config/           # Environment, logger, Redis
├── controllers/      # HTTP request handlers
├── services/         # Business logic
├── repositories/     # Data access layer
├── routes/           # API route definitions
├── middleware/       # Auth, validation, errors, logging
├── validators/       # Zod schemas
├── utils/            # Helpers and error classes
├── types/            # TypeScript types
├── integrations/
│   └── alpaca/       # Alpaca Broker & Market Data clients
├── database/         # Prisma client
├── app.ts            # Express app setup
└── server.ts         # Entry point
```

## Prerequisites

- Node.js 22+
- Docker & Docker Compose (recommended)
- Alpaca Broker API credentials ([sandbox](https://broker-api.sandbox.alpaca.markets))

## Quick Start (Docker)

1. Copy environment file and set Alpaca credentials:

```bash
cd server
cp .env.example .env
# Edit .env — set ALPACA_CLIENT_ID and ALPACA_CLIENT_SECRET
```

2. Start all services:

```bash
docker compose up --build
```

API available at `http://localhost:3000/api`

## Local Development

1. Start PostgreSQL and Redis:

```bash
docker compose up postgres redis -d
```

2. Install dependencies and run migrations:

```bash
npm install
cp .env.example .env
# Configure .env with your credentials
npm run db:migrate:dev
```

3. Start the dev server:

```bash
npm run dev
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `JWT_ACCESS_SECRET` | Access token secret (min 32 chars) | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret (min 32 chars) | Yes |
| `ALPACA_CLIENT_ID` | Alpaca OAuth client ID | Yes |
| `ALPACA_CLIENT_SECRET` | Alpaca OAuth client secret | Yes |
| `ALPACA_AUTH_URL` | OAuth token endpoint | No (default: authx.alpaca.markets) |
| `ALPACA_BASE_URL` | Broker API base URL | Yes |
| `ALPACA_DATA_URL` | Market data API base URL | Yes |
| `PORT` | Server port (default: 3000) | No |
| `CORS_ORIGIN` | Allowed CORS origin | No |

Alpaca uses **OAuth2 Client Credentials**. The server exchanges `client_id` + `client_secret` for a short-lived Bearer token (cached ~15 min) and attaches it to all Alpaca API calls. Secrets are never logged or returned in API responses. Legacy `ALPACA_API_KEY` / `ALPACA_API_SECRET` env vars are still accepted as aliases.

## API Endpoints

### Health

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/health` | No |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh tokens |
| POST | `/api/auth/logout` | Logout |

### User

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile |
| PATCH | `/api/users/profile` | Update profile |

### Broker (Alpaca)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/broker/accounts` | Create Alpaca account |
| GET | `/api/broker/accounts` | List accounts |
| GET | `/api/broker/accounts/:accountId` | Get account |
| GET | `/api/broker/portfolio` | Get portfolio |
| GET | `/api/broker/positions` | Get positions |
| GET | `/api/broker/orders` | List orders |
| POST | `/api/broker/orders` | Create order |
| DELETE | `/api/broker/orders/:orderId` | Cancel order |
| GET | `/api/broker/watchlists` | Get watchlists |
| POST | `/api/broker/watchlists` | Create watchlist |
| POST | `/api/broker/watchlists/:watchlistId/assets` | Add asset |
| DELETE | `/api/broker/watchlists/:watchlistId/assets/:symbol` | Remove asset |

### Market Data

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/market/assets` | No | List all Alpaca assets (first-request test) |
| GET | `/api/market/search?q=AAPL` | Yes | Search symbols |
| GET | `/api/market/assets/:symbol` | Yes | Asset details |
| GET | `/api/market/quotes/:symbol/latest` | Yes | Latest quote |
| GET | `/api/market/trades/:symbol/latest` | Yes | Latest trade |
| GET | `/api/market/bars/:symbol` | Yes | Historical bars |

## Response Format

Success:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Error message",
  "data": null
}
```

## Example Requests

### Alpaca token flow

1. Frontend calls `GET /api/alpaca/token` to obtain a short-lived Bearer token
2. Frontend sends `X-Alpaca-Token: {accessToken}` on market/broker API requests
3. Backend forwards that token to Alpaca as `Authorization: Bearer {token}`

Client credentials (`ALPACA_CLIENT_ID` / `ALPACA_CLIENT_SECRET`) never leave the server.

### Making Your First Request (Alpaca Assets)

Alpaca recommends `GET /v1/assets` as the first API call — it requires no request body and no brokerage accounts. TradeFlow exposes this at:

```bash
curl http://localhost:3000/api/market/assets
```

Optional filters (passed through to Alpaca):

```bash
curl "http://localhost:3000/api/market/assets?status=active&asset_class=us_equity"
```

A successful response confirms your Alpaca client credentials are configured correctly.

### Register

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "trader@example.com",
    "password": "SecurePass1",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "trader@example.com", "password": "SecurePass1"}'
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run db:migrate` | Run migrations (production) |
| `npm run db:migrate:dev` | Run migrations (development) |
| `npm run db:studio` | Open Prisma Studio |

## Security

- Helmet security headers
- CORS configuration
- Redis-backed rate limiting
- JWT access + refresh tokens
- bcrypt password hashing
- Zod request validation
- Environment variable validation on startup
- Sensitive data redaction in logs

## License

Private — TradeFlow
