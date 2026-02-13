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
