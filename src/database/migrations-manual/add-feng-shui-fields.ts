import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../../config/typeorm.config';

async function addFengShuiFields() {
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    console.log('📝 Adding Feng Shui fields to products table...\n');

    // Add feng shui columns to products
    await dataSource.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS menh VARCHAR(50)`);
    await dataSource.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS huong VARCHAR(100)`);

    console.log('✅ Added feng shui columns to products table\n');

    // Add comments
    await dataSource.query(`COMMENT ON COLUMN products.menh IS 'Ngũ hành: Kim, Mộc, Thủy, Hỏa, Thổ'`);
    await dataSource.query(`COMMENT ON COLUMN products.huong IS 'Hướng phù hợp: Đông, Tây, Nam, Bắc, Đông Bắc, Đông Nam, Tây Bắc, Tây Nam'`);

    // Create index for filtering
    await dataSource.query(`CREATE INDEX IF NOT EXISTS idx_products_menh ON products(menh)`);

    console.log('✅ Created index for menh filtering\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Feng Shui fields migration completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
}

addFengShuiFields();
