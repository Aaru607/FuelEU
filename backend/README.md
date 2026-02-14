
⚓ FuelEU Maritime Backend
Maritime Compliance & Sustainability Platform
A high-performance backend implementation designed to manage FuelEU Maritime compliance, banking, and pooling logic. This system utilizes Hexagonal Architecture (Ports and Adapters) to decouple core maritime domain logic from external infrastructure.

🏗️ Architecture Overview
The project follows a strict separation of concerns to ensure the maritime math remains pure and testable.

Core (Domain & Application): Contains the pure business logic, FuelEU intensity math, and use cases (Inbound Ports).

Adapters (Inbound/Outbound): Bridges the application with the outside world.

Inbound: REST API controllers using Express.js.

Outbound: PostgreSQL persistence layer using parameterized queries for security.

Infrastructure: Database connection pools (Neon.tech optimized) and server initialization.

📂 Folder Structure
Bash
src/
├── core/
│   ├── domain/        # Entities & FuelEU math (Zero external dependencies)
│   ├── ports/         # Repository interfaces (Outbound ports)
│   └── application/   # Use cases (Inbound ports)
├── adapters/
│   ├── inbound/http/  # Express controllers
│   └── outbound/pg/   # PostgreSQL implementations
├── infrastructure/
│   ├── db/            # Connection pool & SQL schemas
│   └── server/        # Express configuration
└── index.ts           # Application entry point
🚀 Getting Started
1. Prerequisites
Node.js (v18+)

PostgreSQL (Local or Neon.tech)

2. Installation
Bash
npm install
3. Environment Configuration
Create a .env file in the root directory. Do not commit this file to GitHub.

Bash
cp .env.example .env
Update the following values in .env:

DATABASE_URL: Your PostgreSQL connection string.

PORT: Backend port (default 3000).

4. Database Initialization
Run the schema and seed scripts to set up the maritime route registry:

Bash
psql -d feuleu -f src/infrastructure/db/schema.sql
psql -d feuleu -f src/infrastructure/db/seed.sql
5. Run the Application
Bash
# Development mode
npm run dev

# Production build
npm run build
npm start
📡 API Reference
🚢 Routes
GET /routes - Retrieve all registered shipping routes.

GET /routes/:id - Fetch details for a specific route.

💰 Banking (Carryover)
POST /banking/bank-surplus - Bank a ship's compliance surplus for future periods.

Payload: { routeId, fuelConsumption, actualIntensity, amountToBank, period }

🌊 Pooling
POST /pools - Aggregate multiple routes to balance deficits with surpluses.

Payload: { poolName, routeIds, period }

🛡️ Security & Integrity
Zero-Trust Backend: The backend ignores client-side math and recalculates all compliance balances directly from the database to prevent data tampering.

SQL Injection Prevention: All persistence adapters use parameterized queries.

Type Safety: Built with TypeScript to ensure domain objects remain consistent across all layers.

