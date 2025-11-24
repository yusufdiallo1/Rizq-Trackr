-- Add icon column to savings_goals table
ALTER TABLE savings_goals 
ADD COLUMN IF NOT EXISTS icon TEXT;

-- Add target_date column as well (optional field mentioned in the code)
ALTER TABLE savings_goals 
ADD COLUMN IF NOT EXISTS target_date DATE;

-- Add comment for documentation
COMMENT ON COLUMN savings_goals.icon IS 'Emoji icon for the savings goal (e.g., 🏠, 🚗, ✈️)';
COMMENT ON COLUMN savings_goals.target_date IS 'Optional target date for the savings goal';

