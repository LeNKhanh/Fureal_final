import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../../config/typeorm.config';

async function updateProductsWithFengShui() {
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    console.log('📝 Updating products with Feng Shui attributes...\n');

    // Giường - thường hợp mệnh Thổ, Mộc
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Mộc, Thổ', huong = 'Đông, Đông Bắc, Tây Nam'
      WHERE category_id = 1
    `);

    // Bàn - Kim, Thổ
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Kim, Thổ', huong = 'Tây, Tây Bắc, Đông Bắc'
      WHERE category_id = 2
    `);

    // Ghế Sofa - Thổ, Hỏa
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Thổ, Hỏa', huong = 'Tây Nam, Đông Bắc, Nam'
      WHERE category_id = 3
    `);

    // Tủ - Mộc
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Mộc', huong = 'Đông, Đông Nam'
      WHERE category_id = 4
    `);

    // Kệ - Kim, Mộc
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Kim, Mộc', huong = 'Tây, Tây Bắc, Đông'
      WHERE category_id = 5
    `);

    // Tranh - Hỏa, Mộc
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Hỏa, Mộc', huong = 'Nam, Đông, Đông Nam'
      WHERE category_id = 6
    `);

    // Cây xanh - Mộc
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Mộc', huong = 'Đông, Đông Nam, Nam'
      WHERE category_id = 7
    `);

    // Gối trang trí - Hỏa, Thổ
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Hỏa, Thổ', huong = 'Nam, Tây Nam, Đông Bắc'
      WHERE category_id = 8
    `);

    // Đồ trang trí - Thổ, Kim
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Thổ, Kim', huong = 'Tây Nam, Tây, Đông Bắc'
      WHERE category_id = 9
    `);

    // Đèn trần - Hỏa
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Hỏa', huong = 'Nam, Đông Nam, Tây Nam'
      WHERE category_id = 10
    `);

    // Đèn bàn - Hỏa
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Hỏa', huong = 'Nam, Đông Nam'
      WHERE category_id = 11
    `);

    // Đèn sàn - Hỏa
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Hỏa', huong = 'Nam, Tây Nam'
      WHERE category_id = 12
    `);

    // Thảm - Thổ
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Thổ', huong = 'Tây Nam, Đông Bắc, Trung Tâm'
      WHERE category_id = 13
    `);

    // Rèm cửa - Mộc, Thủy
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Mộc, Thủy', huong = 'Đông, Bắc, Đông Nam'
      WHERE category_id = 14
    `);

    // Chăn gối - Thủy, Mộc
    await dataSource.query(`
      UPDATE products 
      SET menh = 'Thủy, Mộc', huong = 'Bắc, Đông, Đông Bắc'
      WHERE category_id = 15
    `);

    console.log('✅ Updated all products with Feng Shui attributes\n');

    // Show sample
    const samples = await dataSource.query(`
      SELECT name, menh, huong 
      FROM products 
      LIMIT 5
    `);

    console.log('📊 Sample products:\n');
    samples.forEach((p: any) => {
      console.log(`   ${p.name}`);
      console.log(`   🔮 Mệnh: ${p.menh}`);
      console.log(`   🧭 Hướng: ${p.huong}\n`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Products updated with Feng Shui successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error updating products:', error);
    process.exit(1);
  }
}

updateProductsWithFengShui();
