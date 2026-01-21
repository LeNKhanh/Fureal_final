-- Add new columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS color VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS width DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS height DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS depth DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS material VARCHAR(255);
ALTER TABLE products ADD COLUMN IF NOT EXISTS space VARCHAR(50);

-- Add comments
COMMENT ON COLUMN products.width IS 'Width in cm';
COMMENT ON COLUMN products.height IS 'Height in cm';
COMMENT ON COLUMN products.depth IS 'Depth/Length in cm';
COMMENT ON COLUMN products.weight IS 'Weight in kg';
COMMENT ON COLUMN products.space IS 'livingroom, bedroom, dining, office, outdoor';

-- Add product snapshot columns to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name VARCHAR(255);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_brand VARCHAR(100);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_color VARCHAR(50);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_size VARCHAR(100);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_material VARCHAR(255);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image_url VARCHAR(500);

-- Add comment
COMMENT ON COLUMN order_items.product_size IS 'e.g. W120xH80xD60cm';

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_space ON products(space);
CREATE INDEX IF NOT EXISTS idx_products_color ON products(color);

-- Display results
SELECT 'Migration completed successfully!' AS status;
