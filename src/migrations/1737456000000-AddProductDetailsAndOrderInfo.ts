import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductDetailsAndOrderInfo1737456000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns to products table
    await queryRunner.query(`
      ALTER TABLE products
      ADD COLUMN brand VARCHAR(100),
      ADD COLUMN color VARCHAR(50),
      ADD COLUMN width DECIMAL(10, 2) COMMENT 'Width in cm',
      ADD COLUMN height DECIMAL(10, 2) COMMENT 'Height in cm',
      ADD COLUMN depth DECIMAL(10, 2) COMMENT 'Depth/Length in cm',
      ADD COLUMN weight DECIMAL(10, 2) COMMENT 'Weight in kg',
      ADD COLUMN material VARCHAR(255),
      ADD COLUMN space VARCHAR(50) COMMENT 'livingroom, bedroom, dining, office, outdoor'
    `);

    // Add product snapshot columns to order_items table
    // This preserves product info at the time of order
    await queryRunner.query(`
      ALTER TABLE order_items
      ADD COLUMN product_name VARCHAR(255),
      ADD COLUMN product_brand VARCHAR(100),
      ADD COLUMN product_color VARCHAR(50),
      ADD COLUMN product_size VARCHAR(100) COMMENT 'e.g. W120xH80xD60cm',
      ADD COLUMN product_material VARCHAR(255),
      ADD COLUMN product_image_url VARCHAR(500)
    `);

    // Create index for product space filtering
    await queryRunner.query(`
      CREATE INDEX idx_products_space ON products(space)
    `);

    // Create index for product brand filtering
    await queryRunner.query(`
      CREATE INDEX idx_products_brand ON products(brand)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX idx_products_brand ON products`);
    await queryRunner.query(`DROP INDEX idx_products_space ON products`);

    // Remove columns from order_items
    await queryRunner.query(`
      ALTER TABLE order_items
      DROP COLUMN product_image_url,
      DROP COLUMN product_material,
      DROP COLUMN product_size,
      DROP COLUMN product_color,
      DROP COLUMN product_brand,
      DROP COLUMN product_name
    `);

    // Remove columns from products
    await queryRunner.query(`
      ALTER TABLE products
      DROP COLUMN space,
      DROP COLUMN material,
      DROP COLUMN weight,
      DROP COLUMN depth,
      DROP COLUMN height,
      DROP COLUMN width,
      DROP COLUMN color,
      DROP COLUMN brand
    `);
  }
}
