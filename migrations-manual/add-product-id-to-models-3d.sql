-- Add product_id column to models_3d table
-- Links a 3D model to an e-commerce product for cart/checkout integration

ALTER TABLE models_3d
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_models3d_product ON models_3d(product_id);
