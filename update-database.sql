-- Update database schema to include target_phone column
-- Run this SQL script to update your existing call_logs table

-- Add target_phone column to existing table
ALTER TABLE call_logs 
ADD COLUMN target_phone VARCHAR(20) DEFAULT 'broadcast' AFTER type;

-- Update existing records to have 'broadcast' as target_phone
UPDATE call_logs 
SET target_phone = 'broadcast' 
WHERE target_phone IS NULL;

-- Optional: Add index for better performance
CREATE INDEX idx_target_phone ON call_logs(target_phone);
CREATE INDEX idx_type_target ON call_logs(type, target_phone);

-- Show the updated table structure
DESCRIBE call_logs;
