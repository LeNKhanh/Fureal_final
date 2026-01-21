import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { dataSourceOptions } from '../../config/typeorm.config';

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // Check if admin user already exists
    const existingAdmin = await dataSource.query(
      `SELECT id FROM users WHERE email = $1`,
      ['admin@fureal.com']
    );

    if (existingAdmin.length > 0) {
      console.log('Admin user already exists');
      await dataSource.destroy();
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Insert admin user
    await dataSource.query(
      `INSERT INTO users (email, password_hash, full_name, role_id, is_active) 
       VALUES ($1, $2, $3, $4, $5)`,
      ['admin@fureal.com', hashedPassword, 'System Administrator', 1, true]
    );

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('📧 Email: admin@fureal.com');
    console.log('🔑 Password: Admin@123');
    console.log('');
    console.log('⚠️  Please change the password after first login!');

    await dataSource.destroy();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
