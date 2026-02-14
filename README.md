🚢 FuelEU Maritime Compliance Platform
Sustainable Shipping Compliance, Banking, and Pooling
This platform is an end-to-end solution for maritime companies to track and manage carbon intensity compliance according to FuelEU Maritime regulations. It features a robust Hexagonal Architecture backend and a high-performance React frontend dashboard.

🛠️ Project Structure
This repository is organized into two main services:

/frontend: A React application featuring a real-time compliance dashboard and pooling interface.

/backend: A Node.js server implementing Hexagonal Architecture (Ports and Adapters) for secure maritime math and data persistence.

/database: Contains SQL schemas and seed scripts for PostgreSQL (Neon.tech optimized).

✨ Key Features
Compliance Dashboard: Real-time visualization of vessel actual intensity vs. target intensity.

Banking System: Safely carry over compliance surpluses to future periods to avoid penalties.

Pooling Engine: Strategically aggregate vessel data to offset deficits with surpluses across a fleet.

Data Integrity Enforcement: The backend recalibrates all domain math directly from the database, ignoring client-side payloads to ensure zero-trust security.

🚀 Quick Start
1. Database Setup
Ensure you have a PostgreSQL instance running.

Bash
# Register routes and compliance data
psql -d feuleu -f backend/src/infrastructure/db/schema.sql
psql -d feuleu -f backend/src/infrastructure/db/seed.sql
2. Backend Setup
Bash
cd backend
npm install
cp .env.example .env  # Add your DATABASE_URL here
npm run dev
3. Frontend Setup
Bash
cd frontend
npm install
npm run dev
The application will be accessible at http://localhost:5173.

🛠️ Technical Challenges & Solutions
1. Database Schema Deserialization
Challenge: Encountered SQLSTATE 42703 errors due to naming mismatches between the domain model (camelCase) and the PostgreSQL persistence layer (snake_case).
Solution: Implemented a robust mapping layer in the Outbound Adapters using parseFloat(String()) to ensure numeric precision and type safety during data hydration.

2. Zero-Trust Calculation Logic
Challenge: Initially, the frontend was passing compliance balances to the backend, creating a security risk where client-side data could be manipulated.
Solution: Refactored the CreatePoolUseCase to ignore client-side payloads. The backend now performs a secure, server-side lookup of all vessel data to recalculate balances directly from the source of truth.

3. Database Constraint Management
Challenge: Faced SQLSTATE 23502 (Not-Null) and Foreign Key constraints while migrating mock data to a production environment.
Solution: Engineered idempotent SQL seed scripts and manual ID injection protocols to ensure data integrity without breaking the strict relational schema.

🧠 Architecture Principles
Hexagonal Architecture: Decouples the FuelEU domain math from external frameworks and databases.

Clean Code & Type Safety: Developed with TypeScript to enforce strict contracts between the UI and the API.

Scalable Persistence: Optimized for cloud-native PostgreSQL (Neon.tech) with connection pooling.

🎓 About the Developer
This project was developed by a final-year student as a capstone project focusing on full-stack engineering, sustainable technology, and software architecture.
