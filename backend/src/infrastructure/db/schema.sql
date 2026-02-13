-- FuelEU Maritime Compliance Platform Schema
-- PostgreSQL

-- Routes table
CREATE TABLE IF NOT EXISTS routes (
  id VARCHAR(50) PRIMARY KEY,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  distance_km NUMERIC(10, 2),
  is_baseline BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance records (per route per period)
CREATE TABLE IF NOT EXISTS ship_compliance (
  id VARCHAR(50) PRIMARY KEY,
  route_id VARCHAR(50) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  fuel_consumption NUMERIC(15, 6) NOT NULL,
  actual_intensity NUMERIC(10, 6) NOT NULL,
  period VARCHAR(20) NOT NULL,
  pool_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(route_id, period)
);

-- Bank entries (surplus carryover)
CREATE TABLE IF NOT EXISTS bank_entries (
  id SERIAL PRIMARY KEY,
  route_id VARCHAR(50) NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  amount NUMERIC(15, 6) NOT NULL,
  period VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pools (coalition of routes/ships)
CREATE TABLE IF NOT EXISTS pools (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pool members (many-to-many: pools and compliance records)
CREATE TABLE IF NOT EXISTS pool_members (
  id SERIAL PRIMARY KEY,
  pool_id VARCHAR(50) NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  record_id VARCHAR(50) NOT NULL REFERENCES ship_compliance(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pool_id, record_id)
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_ship_compliance_route_id ON ship_compliance(route_id);
CREATE INDEX IF NOT EXISTS idx_ship_compliance_pool_id ON ship_compliance(pool_id);
CREATE INDEX IF NOT EXISTS idx_ship_compliance_period ON ship_compliance(period);
CREATE INDEX IF NOT EXISTS idx_bank_entries_route_id ON bank_entries(route_id);
CREATE INDEX IF NOT EXISTS idx_pool_members_pool_id ON pool_members(pool_id);
