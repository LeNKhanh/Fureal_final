import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../../config/typeorm.config';

async function clearData() {
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    console.log('🗑️  Clearing old data...');
    
    // Delete in reverse order due to foreign key constraints
    await dataSource.query(`DELETE FROM cart_items;`);
    await dataSource.query(`DELETE FROM carts;`);
    await dataSource.query(`DELETE FROM order_items;`);
    await dataSource.query(`DELETE FROM order_status_history;`);
    await dataSource.query(`DELETE FROM payments;`);
    await dataSource.query(`DELETE FROM orders;`);
    await dataSource.query(`DELETE FROM addresses;`);
    await dataSource.query(`DELETE FROM product_images;`);
    await dataSource.query(`DELETE FROM products;`);
    await dataSource.query(`DELETE FROM audit_logs;`);
    await dataSource.query(`DELETE FROM inventory_logs;`);
    await dataSource.query(`DELETE FROM categories;`);
    await dataSource.query(`DELETE FROM category_groups;`);
    await dataSource.query(`DELETE FROM auth_providers;`);
    await dataSource.query(`DELETE FROM users;`);
    
    console.log('✅ All data cleared successfully!\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    process.exit(1);
  }
}

clearData();
