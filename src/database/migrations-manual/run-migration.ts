import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../../config/typeorm.config';

async function runManualMigration() {
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    console.log('📝 Running manual migration...\n');

    // Add columns to products
    await dataSource.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100)`);
    await dataSource.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS color VARCHAR(50)`);
    await dataSource.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS width DECIMAL(10, 2)`);
    await dataSource.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS height DECIMAL(10, 2)`);
    await dataSource.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS depth DECIMAL(10, 2)`);
    await dataSource.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS weight DECIMAL(10, 2)`);
    await dataSource.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS material VARCHAR(255)`);
    await dataSource.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS space VARCHAR(50)`);

    console.log('✅ Added columns to products table\n');

    // Add comments
    await dataSource.query(`COMMENT ON COLUMN products.width IS 'Width in cm'`);
    await dataSource.query(`COMMENT ON COLUMN products.height IS 'Height in cm'`);
    await dataSource.query(`COMMENT ON COLUMN products.depth IS 'Depth/Length in cm'`);
    await dataSource.query(`COMMENT ON COLUMN products.weight IS 'Weight in kg'`);
    await dataSource.query(`COMMENT ON COLUMN products.space IS 'livingroom, bedroom, dining, office, outdoor'`);

    // Add columns to order_items
    await dataSource.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_name VARCHAR(255)`);
    await dataSource.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_brand VARCHAR(100)`);
    await dataSource.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_color VARCHAR(50)`);
    await dataSource.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_size VARCHAR(100)`);
    await dataSource.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_material VARCHAR(255)`);
    await dataSource.query(`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image_url VARCHAR(500)`);

    console.log('✅ Added snapshot columns to order_items table\n');

    await dataSource.query(`COMMENT ON COLUMN order_items.product_size IS 'e.g. W120xH80xD60cm'`);

    // Create indexes
    await dataSource.query(`CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand)`);
    await dataSource.query(`CREATE INDEX IF NOT EXISTS idx_products_space ON products(space)`);
    await dataSource.query(`CREATE INDEX IF NOT EXISTS idx_products_color ON products(color)`);

    console.log('✅ Created indexes\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Migration completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

runManualMigration();
