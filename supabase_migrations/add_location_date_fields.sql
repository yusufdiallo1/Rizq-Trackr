-- Location, Date & Dual Calendar System Migration
-- Adds location detection, dual calendar (Hijri/Gregorian), time, timezone, and soft delete support

-- 1. Add location fields to expense_entries table
ALTER TABLE expense_entries
ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS location_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS date_hijri DATE,
ADD COLUMN IF NOT EXISTS time TIME,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. Add location fields to income_entries table
ALTER TABLE income_entries
ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS location_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS date_hijri DATE,
ADD COLUMN IF NOT EXISTS time TIME,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 3. Add location fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS location_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_country VARCHAR(100);

-- 4. Add date and location fields to zakat_payments table
ALTER TABLE zakat_payments
ADD COLUMN IF NOT EXISTS date_hijri DATE,
ADD COLUMN IF NOT EXISTS time TIME,
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_address TEXT,
ADD COLUMN IF NOT EXISTS location_city VARCHAR(100),
ADD COLUMN IF NOT EXISTS location_country VARCHAR(100),
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 5. Create nisab_prices table if it doesn't exist
CREATE TABLE IF NOT EXISTS nisab_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  gold_price_per_gram DECIMAL(10, 2) NOT NULL,
  silver_price_per_gram DECIMAL(10, 2) NOT NULL,
  nisab_gold_value DECIMAL(10, 2) NOT NULL,
  nisab_silver_value DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expense_entries_date_gregorian ON expense_entries(user_id, date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_expense_entries_date_hijri ON expense_entries(user_id, date_hijri) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_expense_entries_location_city ON expense_entries(location_city) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_expense_entries_deleted_at ON expense_entries(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_income_entries_date_gregorian ON income_entries(user_id, date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_income_entries_date_hijri ON income_entries(user_id, date_hijri) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_income_entries_location_city ON income_entries(location_city) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_income_entries_deleted_at ON income_entries(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_zakat_payments_date_gregorian ON zakat_payments(user_id, paid_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_zakat_payments_date_hijri ON zakat_payments(user_id, date_hijri) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_zakat_payments_deleted_at ON zakat_payments(deleted_at) WHERE deleted_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_nisab_prices_date ON nisab_prices(date DESC);
CREATE INDEX IF NOT EXISTS idx_users_location_city ON users(location_city);

-- 7. Add comments for documentation
COMMENT ON COLUMN expense_entries.location_latitude IS 'Latitude coordinate of transaction location';
COMMENT ON COLUMN expense_entries.location_longitude IS 'Longitude coordinate of transaction location';
COMMENT ON COLUMN expense_entries.location_address IS 'Full formatted address of transaction location';
COMMENT ON COLUMN expense_entries.location_city IS 'City name of transaction location';
COMMENT ON COLUMN expense_entries.location_country IS 'Country name of transaction location';
COMMENT ON COLUMN expense_entries.date_hijri IS 'Hijri (Islamic) calendar date of transaction';
COMMENT ON COLUMN expense_entries.time IS 'Time of transaction in HH:MM:SS format';
COMMENT ON COLUMN expense_entries.timezone IS 'Timezone of transaction (e.g., America/New_York)';
COMMENT ON COLUMN expense_entries.deleted_at IS 'Soft delete timestamp - NULL means not deleted';

COMMENT ON COLUMN income_entries.location_latitude IS 'Latitude coordinate of transaction location';
COMMENT ON COLUMN income_entries.location_longitude IS 'Longitude coordinate of transaction location';
COMMENT ON COLUMN income_entries.location_address IS 'Full formatted address of transaction location';
COMMENT ON COLUMN income_entries.location_city IS 'City name of transaction location';
COMMENT ON COLUMN income_entries.location_country IS 'Country name of transaction location';
COMMENT ON COLUMN income_entries.date_hijri IS 'Hijri (Islamic) calendar date of transaction';
COMMENT ON COLUMN income_entries.time IS 'Time of transaction in HH:MM:SS format';
COMMENT ON COLUMN income_entries.timezone IS 'Timezone of transaction (e.g., America/New_York)';
COMMENT ON COLUMN income_entries.deleted_at IS 'Soft delete timestamp - NULL means not deleted';

COMMENT ON COLUMN zakat_payments.date_hijri IS 'Hijri (Islamic) calendar date of Zakat payment';
COMMENT ON COLUMN zakat_payments.time IS 'Time of Zakat payment in HH:MM:SS format';
COMMENT ON COLUMN zakat_payments.timezone IS 'Timezone of payment (e.g., America/New_York)';
COMMENT ON COLUMN zakat_payments.deleted_at IS 'Soft delete timestamp - NULL means not deleted';

-- 8. Enable RLS on nisab_prices if not already enabled
ALTER TABLE nisab_prices ENABLE ROW LEVEL SECURITY;

-- 9. Create public read policy for nisab_prices (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'nisab_prices' 
    AND policyname = 'nisab_prices_public_read'
  ) THEN
    CREATE POLICY "nisab_prices_public_read" ON nisab_prices
      FOR SELECT USING (true);
  END IF;
END $$;

-- 10. Create function to update updated_at timestamp for nisab_prices
CREATE OR REPLACE FUNCTION update_nisab_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Create trigger for nisab_prices updated_at (if not exists)
DROP TRIGGER IF EXISTS update_nisab_prices_updated_at ON nisab_prices;
CREATE TRIGGER update_nisab_prices_updated_at 
  BEFORE UPDATE ON nisab_prices
  FOR EACH ROW 
  EXECUTE FUNCTION update_nisab_prices_updated_at();

