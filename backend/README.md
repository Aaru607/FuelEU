# FuelEU Maritime Backend

Hexagonal Architecture implementation for FuelEU Maritime compliance platform.

## Structure

```
src/
  core/
    domain/          Pure business logic, entities, math functions
    ports/           Outbound port interfaces (repositories)
    application/     Use cases (inbound ports)
  adapters/
    inbound/http/    Express controllers
    outbound/
      postgres/      PostgreSQL repository implementations
  infrastructure/
    db/              Database connection pool and utilities
    server/          Express app initialization
```

## Setup

### Install Dependencies

```bash
npm install
```

### Database

1. Create a PostgreSQL database:

```bash
createdb feuleu
```

2. Run schema migrations:

```bash
psql -U postgres -d feuleu -f src/infrastructure/db/schema.sql
```

3. Seed mock data:

```bash
psql -U postgres -d feuleu -f src/infrastructure/db/seed.sql
```

### Environment

Copy `.env.example` to `.env` and update as needed:

```bash
cp .env.example .env
```

## Development

Start the dev server (watches for changes):

```bash
npm run dev
```

Server will listen on `http://localhost:3000`.

## Test

Run tests:

```bash
npm test
```

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

## Production

Start the compiled server:

```bash
npm start
```

## API Endpoints

### Routes

- `GET /routes` - List all routes
- `GET /routes/:id` - Get route by ID

### Compliance

- `POST /compliance/calculate` - Calculate route compliance comparison
  - Body: `{ routeId, actualIntensity, baselineIntensity? }`

### Banking

- `POST /banking/bank-surplus` - Bank (carryover) surplus
  - Body: `{ routeId, fuelConsumption, actualIntensity, amountToBan, target?, period }`

### Pools

- `POST /pools` - Create a pool
  - Body: `{ poolId, poolName, members: [{recordId, complianceBalance}] }`
- `GET /pools/:poolId` - Get pool by ID

## Architecture Notes

- **No Framework Dependencies in Core**: Domain and application layers have zero external dependencies.
- **Dependency Injection**: Use cases receive port interfaces via constructor.
- **Error Handling**: Controllers catch errors and return clean JSON responses with appropriate HTTP status codes.
- **Parameterized Queries**: All database queries use parameterized statements to prevent SQL injection.
