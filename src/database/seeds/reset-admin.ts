import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { dataSourceOptions } from '../../config/typeorm.config';

async function resetAdmin() {
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // Delete existing admin user
    await dataSource.query(
      `DELETE FROM users WHERE email = $1`,
      ['admin@fureal.com']
    );

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Insert new admin user
    await dataSource.query(
      `INSERT INTO users (email, password_hash, full_name, role_id, is_active) 
       VALUES ($1, $2, $3, $4, $5)`,
      ['admin@fureal.com', hashedPassword, 'System Administrator', 1, true]
    );

    console.log('');
    console.log('✅ Admin account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@fureal.com');
    console.log('🔑 Password: Admin@123');
    console.log('👤 Role:     ADMIN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('⚠️  Please change the password after first login!');
    console.log('');

    await dataSource.destroy();
  } catch (error) {
    console.error('Error resetting admin account:', error);
    process.exit(1);
  }
}

resetAdmin();
