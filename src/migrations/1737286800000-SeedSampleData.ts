import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedSampleData1737286800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const managerPassword = await bcrypt.hash('Manager@123', 10);
    const userPassword = await bcrypt.hash('User@123', 10);

    // Insert sample users
    await queryRunner.query(`
      INSERT INTO users (id, email, password_hash, full_name, role_id, is_active) 
      VALUES 
        (gen_random_uuid(), 'admin@fureal.com', '${adminPassword}', 'System Administrator', 1, true),
        (gen_random_uuid(), 'manager@fureal.com', '${managerPassword}', 'Store Manager', 2, true),
        (gen_random_uuid(), 'user1@fureal.com', '${userPassword}', 'John Doe', 3, true),
        (gen_random_uuid(), 'user2@fureal.com', '${userPassword}', 'Jane Smith', 3, true),
        (gen_random_uuid(), 'user3@fureal.com', '${userPassword}', 'Bob Wilson', 3, true)
      ON CONFLICT (email) DO NOTHING;
    `);

    // Insert category groups
    await queryRunner.query(`
      INSERT INTO category_groups (id, name, description) 
      VALUES 
        (1, 'Electronics', 'Electronic devices and accessories'),
        (2, 'Fashion', 'Clothing and fashion accessories'),
        (3, 'Home & Living', 'Home appliances and furniture'),
        (4, 'Sports & Outdoors', 'Sports equipment and outdoor gear'),
        (5, 'Books & Media', 'Books, movies, and music')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert categories
    await queryRunner.query(`
      INSERT INTO categories (id, name, group_id, description) 
      VALUES 
        (1, 'Smartphones', 1, 'Mobile phones and accessories'),
        (2, 'Laptops', 1, 'Portable computers'),
        (3, 'Headphones', 1, 'Audio devices'),
        (4, 'Men''s Clothing', 2, 'Clothing for men'),
        (5, 'Women''s Clothing', 2, 'Clothing for women'),
        (6, 'Shoes', 2, 'Footwear'),
        (7, 'Furniture', 3, 'Home furniture'),
        (8, 'Kitchen', 3, 'Kitchen appliances'),
        (9, 'Fitness', 4, 'Fitness equipment'),
        (10, 'Books', 5, 'Physical books')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Get admin user id for created_by
    const adminUser = await queryRunner.query(`
      SELECT id FROM users WHERE email = 'admin@fureal.com' LIMIT 1;
    `);
    const adminId = adminUser[0]?.id;

    if (adminId) {
      // Insert sample products
      await queryRunner.query(`
        INSERT INTO products (id, name, description, price, stock, category_id, is_active, created_by) 
        VALUES 
          (gen_random_uuid(), 'iPhone 15 Pro', 'Latest Apple smartphone with A17 Pro chip', 999.99, 50, 1, true, '${adminId}'),
          (gen_random_uuid(), 'Samsung Galaxy S24', 'Flagship Android smartphone', 899.99, 45, 1, true, '${adminId}'),
          (gen_random_uuid(), 'MacBook Pro 14"', 'Professional laptop with M3 chip', 1999.99, 30, 2, true, '${adminId}'),
          (gen_random_uuid(), 'Dell XPS 15', 'High-performance Windows laptop', 1599.99, 25, 2, true, '${adminId}'),
          (gen_random_uuid(), 'Sony WH-1000XM5', 'Premium noise-cancelling headphones', 399.99, 100, 3, true, '${adminId}'),
          (gen_random_uuid(), 'AirPods Pro 2', 'Apple wireless earbuds', 249.99, 150, 3, true, '${adminId}'),
          (gen_random_uuid(), 'Men''s Casual Shirt', 'Cotton blend casual shirt', 29.99, 200, 4, true, '${adminId}'),
          (gen_random_uuid(), 'Men''s Jeans', 'Slim fit denim jeans', 49.99, 180, 4, true, '${adminId}'),
          (gen_random_uuid(), 'Women''s Summer Dress', 'Light floral summer dress', 39.99, 150, 5, true, '${adminId}'),
          (gen_random_uuid(), 'Women''s Blazer', 'Professional office blazer', 79.99, 100, 5, true, '${adminId}'),
          (gen_random_uuid(), 'Nike Air Max', 'Running shoes', 129.99, 120, 6, true, '${adminId}'),
          (gen_random_uuid(), 'Adidas Ultraboost', 'Premium running shoes', 149.99, 90, 6, true, '${adminId}'),
          (gen_random_uuid(), 'Modern Sofa', '3-seater fabric sofa', 599.99, 20, 7, true, '${adminId}'),
          (gen_random_uuid(), 'Dining Table Set', 'Wooden dining table with 6 chairs', 799.99, 15, 7, true, '${adminId}'),
          (gen_random_uuid(), 'Coffee Maker', 'Automatic espresso machine', 299.99, 60, 8, true, '${adminId}'),
          (gen_random_uuid(), 'Blender', 'High-speed blender', 89.99, 80, 8, true, '${adminId}'),
          (gen_random_uuid(), 'Yoga Mat', 'Non-slip exercise mat', 24.99, 200, 9, true, '${adminId}'),
          (gen_random_uuid(), 'Dumbbells Set', '5-25kg adjustable dumbbells', 149.99, 50, 9, true, '${adminId}'),
          (gen_random_uuid(), 'The Great Gatsby', 'Classic novel by F. Scott Fitzgerald', 12.99, 300, 10, true, '${adminId}'),
          (gen_random_uuid(), '1984', 'Dystopian novel by George Orwell', 14.99, 250, 10, true, '${adminId}')
        ON CONFLICT DO NOTHING;
      `);

      console.log('✅ Sample data seeded successfully!');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete in reverse order due to foreign key constraints
    await queryRunner.query(`DELETE FROM products WHERE created_by IN (SELECT id FROM users WHERE email LIKE '%@fureal.com');`);
    await queryRunner.query(`DELETE FROM categories WHERE id BETWEEN 1 AND 10;`);
    await queryRunner.query(`DELETE FROM category_groups WHERE id BETWEEN 1 AND 5;`);
    await queryRunner.query(`DELETE FROM users WHERE email LIKE '%@fureal.com';`);
  }
}
