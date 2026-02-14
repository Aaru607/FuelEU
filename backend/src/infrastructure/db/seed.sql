-- Seed data for FuelEU Maritime Compliance Platform
-- 5 mock routes as specified

INSERT INTO routes (id, origin, destination, distance_km, is_baseline)
VALUES
  ('R001', 'Rotterdam', 'Shanghai', 11000, TRUE),
  ('R002', 'Singapore', 'Los Angeles', 8000, FALSE),
  ('R003', 'Hamburg', 'Dubai', 8500, FALSE),
  ('R004', 'Port Said', 'Hong Kong', 6500, FALSE),
  ('R005', 'Barcelona', 'Singapore', 9200, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Seed compliance records with actual_intensity values
INSERT INTO ship_compliance (id, route_id, fuel_consumption, actual_intensity, period)
VALUES
  ('compliance-R001-2025-001', 'R001', 250, 85.5, '2025'),
  ('compliance-R002-2025-001', 'R002', 200, 92.3, '2025'),
  ('compliance-R003-2025-001', 'R003', 220, 88.1, '2025'),
  ('compliance-R004-2025-001', 'R004', 180, 91.8, '2025'),
  ('compliance-R005-2025-001', 'R005', 240, 87.2, '2025')
ON CONFLICT (route_id, period) DO NOTHING;
