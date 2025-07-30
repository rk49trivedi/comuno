-- Update database schema to include new columns for call tracking
-- Run this SQL script to update your existing call_logs table

-- Add new columns to existing table
ALTER TABLE call_logs
ADD COLUMN target_phone VARCHAR(20) DEFAULT 'broadcast' AFTER type,
ADD COLUMN agent_phone VARCHAR(20) DEFAULT NULL AFTER target_phone,
ADD COLUMN customer_phone VARCHAR(20) DEFAULT NULL AFTER agent_phone,
ADD COLUMN live_event VARCHAR(50) DEFAULT NULL AFTER customer_phone;

-- Update existing records to have 'broadcast' as target_phone
UPDATE call_logs
SET target_phone = 'broadcast'
WHERE target_phone IS NULL;

-- Optional: Add indexes for better performance
CREATE INDEX idx_target_phone ON call_logs(target_phone);
CREATE INDEX idx_agent_phone ON call_logs(agent_phone);
CREATE INDEX idx_customer_phone ON call_logs(customer_phone);
CREATE INDEX idx_live_event ON call_logs(live_event);
CREATE INDEX idx_type_target ON call_logs(type, target_phone);
CREATE INDEX idx_completed_calls ON call_logs(live_event, type) WHERE live_event = 'evt_completed_with_recording';

-- Show the updated table structure
DESCRIBE call_logs;
