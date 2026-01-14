-- Add nullable rating column to t_rider
ALTER TABLE IF EXISTS t_rider ADD COLUMN IF NOT EXISTS rating REAL;

