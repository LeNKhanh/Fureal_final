-- Add price column to models_3d table
ALTER TABLE models_3d ADD COLUMN IF NOT EXISTS price BIGINT DEFAULT 0;
