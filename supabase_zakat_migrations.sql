-- Zakat System Database Migrations
-- Run these migrations in your Supabase SQL editor

-- 1. Add Zakat-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS zakat_date_hijri DATE,
ADD COLUMN IF NOT EXISTS zakat_date_gregorian DATE,
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS face_id_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS device_tokens JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS location JSONB;

-- 2. Add location and dual date columns to expense_entries
ALTER TABLE expense_entries
ADD COLUMN IF NOT EXISTS location JSONB,
ADD COLUMN IF NOT EXISTS date_hijri DATE,
ADD COLUMN IF NOT EXISTS time TIME,
ADD COLUMN IF NOT EXISTS receipt_image_url TEXT,
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- 3. Add location and dual date columns to income_entries
ALTER TABLE income_entries
ADD COLUMN IF NOT EXISTS location JSONB,
ADD COLUMN IF NOT EXISTS date_hijri DATE,
ADD COLUMN IF NOT EXISTS time TIME,
ADD COLUMN IF NOT EXISTS invoice_image_url TEXT,
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- 4. Create nisab_prices table for daily price tracking
CREATE TABLE IF NOT EXISTS nisab_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  gold_price_per_gram DECIMAL(10,2) NOT NULL,
  silver_price_per_gram DECIMAL(10,2) NOT NULL,
  nisab_gold_value DECIMAL(10,2) NOT NULL,
  nisab_silver_value DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create zakat_history table for payment tracking
CREATE TABLE IF NOT EXISTS zakat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  year_hijri INTEGER NOT NULL,
  year_gregorian INTEGER NOT NULL,
  savings_amount DECIMAL(10,2) NOT NULL,
  nisab_threshold DECIMAL(10,2) NOT NULL,
  zakat_amount_paid DECIMAL(10,2) NOT NULL,
  date_paid_gregorian DATE,
  date_paid_hijri DATE,
  status VARCHAR(20) DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create zakat_calculations table for yearly tracking
CREATE TABLE IF NOT EXISTS zakat_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hijri_year INTEGER NOT NULL,
  gregorian_year INTEGER NOT NULL,
  total_savings DECIMAL(10,2) NOT NULL,
  nisab_threshold DECIMAL(10,2) NOT NULL,
  zakat_due DECIMAL(10,2) NOT NULL,
  is_obligatory BOOLEAN NOT NULL DEFAULT false,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, hijri_year)
);

-- 7. Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255),
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  ip_address VARCHAR(45),
  user_agent TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create security_logs table for authentication tracking
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_description TEXT,
  ip_address VARCHAR(45),
  device_info TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create transaction_archive table for soft deletes
CREATE TABLE IF NOT EXISTS transaction_archive (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_id UUID NOT NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expense_entries(user_id, date, date_hijri);
CREATE INDEX IF NOT EXISTS idx_income_user_date ON income_entries(user_id, date, date_hijri);
CREATE INDEX IF NOT EXISTS idx_expenses_location ON expense_entries USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_income_location ON income_entries USING GIN(location);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id, last_activity);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_zakat_history_user ON zakat_history(user_id, year_hijri);
CREATE INDEX IF NOT EXISTS idx_zakat_calculations_user ON zakat_calculations(user_id, hijri_year);
CREATE INDEX IF NOT EXISTS idx_nisab_prices_date ON nisab_prices(date DESC);
CREATE INDEX IF NOT EXISTS idx_security_logs_user ON security_logs(user_id, created_at DESC);

-- 11. Enable Row Level Security (RLS) on new tables
ALTER TABLE nisab_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE zakat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE zakat_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_archive ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policies for nisab_prices (public read, admin write)
CREATE POLICY "nisab_prices_public_read" ON nisab_prices
  FOR SELECT USING (true);

-- 13. Create RLS policies for zakat_history
CREATE POLICY "zakat_history_user_access" ON zakat_history
  FOR ALL USING (auth.uid() = user_id);

-- 14. Create RLS policies for zakat_calculations
CREATE POLICY "zakat_calculations_user_access" ON zakat_calculations
  FOR ALL USING (auth.uid() = user_id);

-- 15. Create RLS policies for user_sessions
CREATE POLICY "user_sessions_user_access" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- 16. Create RLS policies for security_logs
CREATE POLICY "security_logs_user_access" ON security_logs
  FOR ALL USING (auth.uid() = user_id);

-- 17. Create RLS policies for transaction_archive
CREATE POLICY "transaction_archive_user_access" ON transaction_archive
  FOR ALL USING (auth.uid() = user_id);

-- 18. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 19. Create triggers for updated_at
CREATE TRIGGER update_nisab_prices_updated_at BEFORE UPDATE ON nisab_prices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zakat_history_updated_at BEFORE UPDATE ON zakat_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 20. Create function to automatically archive deleted transactions
CREATE OR REPLACE FUNCTION archive_transaction()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO transaction_archive (original_id, transaction_type, user_id, data)
  VALUES (
    OLD.id,
    CASE 
      WHEN TG_TABLE_NAME = 'expense_entries' THEN 'expense'
      WHEN TG_TABLE_NAME = 'income_entries' THEN 'income'
    END,
    OLD.user_id,
    row_to_json(OLD)
  );
  RETURN OLD;
END;
$$ language 'plpgsql';

-- Note: Triggers for archiving would be set up if soft delete is implemented
-- This is a placeholder for future implementation

