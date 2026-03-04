-- Migration: Create models_3d table for Fureal 3D model management
-- Run this on your Supabase/Postgres database

CREATE TABLE IF NOT EXISTS models_3d (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  model_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category VARCHAR(100),
  tags TEXT, -- comma-separated via TypeORM simple-array
  file_name VARCHAR(255),
  file_size BIGINT,
  file_format VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_models3d_created_by ON models_3d(created_by_id);
CREATE INDEX IF NOT EXISTS idx_models3d_category ON models_3d(category);
CREATE INDEX IF NOT EXISTS idx_models3d_is_active ON models_3d(is_active);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_models3d_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_models3d_updated_at ON models_3d;
CREATE TRIGGER trg_models3d_updated_at
  BEFORE UPDATE ON models_3d
  FOR EACH ROW EXECUTE FUNCTION update_models3d_updated_at();
