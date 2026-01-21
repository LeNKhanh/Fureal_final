import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { dataSourceOptions } from '../../config/typeorm.config';

async function seedData() {
  const dataSource = new DataSource(dataSourceOptions);
  
  try {
    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    // Hash passwords
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const managerPassword = await bcrypt.hash('Manager@123', 10);
    const userPassword = await bcrypt.hash('User@123', 10);

    // Insert sample users
    console.log('📝 Inserting sample users...');
    await dataSource.query(`
      INSERT INTO users (id, email, password_hash, full_name, role_id, is_active) 
      VALUES 
        (gen_random_uuid(), 'manager@fureal.com', $1, 'Store Manager', 2, true),
        (gen_random_uuid(), 'user1@fureal.com', $2, 'John Doe', 3, true),
        (gen_random_uuid(), 'user2@fureal.com', $2, 'Jane Smith', 3, true),
        (gen_random_uuid(), 'user3@fureal.com', $2, 'Bob Wilson', 3, true)
      ON CONFLICT (email) DO NOTHING;
    `, [managerPassword, userPassword]);
    console.log('✅ Users created\n');

    // Insert category groups (4 nhóm chính)
    console.log('📝 Inserting category groups...');
    await dataSource.query(`
      INSERT INTO category_groups (id, name, description) 
      VALUES 
        (1, 'Furniture', 'Giường, bàn, ghế, tủ, kệ - mạnh đến bộ cục phong thủy'),
        (2, 'Decor', 'Tranh treo tường, cây xanh, gối xúc không gian và nội hành'),
        (3, 'Lighting', 'Đèn trần, đèn bàn, đèn sàn, năng lượng'),
        (4, 'Fabrics', 'Thảm, rèm, chăn gối - hỗ trợ mềm')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Category groups created\n');

    // Insert categories (Danh mục chi tiết)
    console.log('📝 Inserting categories...');
    await dataSource.query(`
      INSERT INTO categories (id, name, group_id, description) 
      VALUES 
        -- Furniture
        (1, 'Giường', 1, 'Giường ngủ các loại'),
        (2, 'Bàn', 1, 'Bàn làm việc, bàn ăn, bàn trà'),
        (3, 'Ghế', 1, 'Ghế sofa, ghế ăn, ghế văn phòng'),
        (4, 'Tủ', 1, 'Tủ quần áo, tủ giày, tủ đựng đồ'),
        (5, 'Kệ', 1, 'Kệ sách, kệ tivi, kệ trang trí'),
        -- Decor
        (6, 'Tranh treo tường', 2, 'Tranh trang trí, tranh nghệ thuật'),
        (7, 'Cây xanh', 2, 'Cây cảnh, cây trang trí nội thất'),
        (8, 'Gối trang trí', 2, 'Gối tựa, gối ôm trang trí'),
        (9, 'Đồ trang trí', 2, 'Bình hoa, tượng, đồ decor'),
        -- Lighting
        (10, 'Đèn trần', 3, 'Đèn chùm, đèn ốp trần'),
        (11, 'Đèn bàn', 3, 'Đèn để bàn làm việc, đèn ngủ'),
        (12, 'Đèn sàn', 3, 'Đèn cây, đèn đứng trang trí'),
        -- Fabrics
        (13, 'Thảm', 4, 'Thảm trải sàn, thảm trang trí'),
        (14, 'Rèm cửa', 4, 'Rèm vải, rèm cửa sổ'),
        (15, 'Chăn gối', 4, 'Bộ chăn ga gối đệm')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ Categories created\n');

    // Get admin user id for created_by
    const adminUser = await dataSource.query(`
      SELECT id FROM users WHERE email = 'admin@fureal.com' LIMIT 1;
    `);
    
    if (adminUser.length === 0) {
      console.error('❌ Admin user not found. Please run seed:admin first.');
      await dataSource.destroy();
      return;
    }

    const adminId = adminUser[0].id;

    // Insert sample products (Sản phẩm nội thất)
    console.log('📝 Inserting sample products...');
    await dataSource.query(`
      INSERT INTO products (id, name, description, price, stock, category_id, brand, color, width, height, depth, weight, material, space, is_active, created_by) 
      VALUES 
        -- Furniture - Giường
        (gen_random_uuid(), 'Giường Ngủ Gỗ Sồi Tự Nhiên 1m6', 'Giường ngủ gỗ sồi nguyên khối, đầu giường bọc nệm sang trọng', 15000000, 20, 1, 'Fureal Home', 'Nâu Gỗ', 160, 100, 200, 85.5, 'Gỗ Sồi Tự Nhiên, Nệm Bọc Vải', 'bedroom', true, $1),
        (gen_random_uuid(), 'Giường Ngủ Bọc Da Cao Cấp 1m8', 'Giường ngủ bọc da PU cao cấp, có hộc kéo tiện lợi', 18500000, 15, 1, 'Luxury Sleep', 'Đen', 180, 110, 200, 95.0, 'Khung Gỗ MDF, Da PU Cao Cấp', 'bedroom', true, $1),
        (gen_random_uuid(), 'Giường Tầng Trẻ Em Gỗ Thông', 'Giường tầng cho bé, cầu thang an toàn, chắc chắn', 12000000, 12, 1, 'KidZone', 'Trắng Kem', 100, 160, 200, 65.0, 'Gỗ Thông Tự Nhiên, Sơn PU', 'bedroom', true, $1),
        
        -- Furniture - Bàn
        (gen_random_uuid(), 'Bàn Ăn Gỗ Sồi 6 Ghế', 'Bộ bàn ăn gỗ sồi tự nhiên, mặt bàn 1.4m', 18000000, 15, 2, 'Fureal Home', 'Nâu Gỗ', 140, 75, 80, 52.0, 'Gỗ Sồi Tự Nhiên', 'dining', true, $1),
        (gen_random_uuid(), 'Bàn Trà Mặt Đá Marble Trắng', 'Bàn sofa mặt đá marble sang trọng, chân inox mạ vàng', 7200000, 20, 2, 'Marble Luxury', 'Trắng Vân Vàng', 120, 45, 60, 28.5, 'Mặt Đá Marble, Chân Inox Mạ Vàng', 'livingroom', true, $1),
        (gen_random_uuid(), 'Bàn Làm Việc Gỗ MDF 1m2', 'Bàn làm việc hiện đại, có ngăn kéo đựng đồ', 3500000, 35, 2, 'WorkSpace', 'Xám Bạc', 120, 75, 60, 22.0, 'Gỗ MDF Phủ Melamine, Chân Sắt', 'office', true, $1),
        (gen_random_uuid(), 'Bàn Trà Tròn Phong Cách Bắc Âu', 'Bàn trà tròn gỗ cao su, thiết kế tối giản', 3800000, 35, 2, 'Nordic Style', 'Gỗ Tự Nhiên', 80, 45, 80, 12.5, 'Gỗ Cao Su Tự Nhiên', 'livingroom', true, $1),
        
        -- Furniture - Ghế
        (gen_random_uuid(), 'Sofa Vải Nỉ 3 Chỗ Hiện Đại', 'Sofa 3 chỗ bọc vải nỉ cao cấp, màu xám nhạt', 8500000, 25, 3, 'Comfort Living', 'Xám Nhạt', 200, 85, 90, 68.0, 'Khung Gỗ, Mút D40, Vải Nỉ Cao Cấp', 'livingroom', true, $1),
        (gen_random_uuid(), 'Sofa Da Thật L-Shape Sang Trọng', 'Sofa góc L bọc da thật, phù hợp phòng khách rộng', 25000000, 10, 3, 'Luxury Living', 'Nâu Đậm', 280, 90, 160, 125.0, 'Khung Gỗ Sồi, Da Thật Cao Cấp', 'livingroom', true, $1),
        (gen_random_uuid(), 'Ghế Ăn Bọc Nệm Vải Cao Cấp', 'Ghế ăn bọc vải nỉ, chân gỗ sồi tự nhiên', 1200000, 100, 3, 'Fureal Home', 'Be Nhạt', 45, 95, 50, 5.8, 'Chân Gỗ Sồi, Nệm Bọc Vải Nỉ', 'dining', true, $1),
        (gen_random_uuid(), 'Ghế Văn Phòng Lưng Lưới', 'Ghế xoay lưng lưới thoáng khí, nâng hạ linh hoạt', 2500000, 60, 3, 'ErgoChair', 'Đen', 60, 110, 60, 12.5, 'Lưới Thoáng Khí, Chân Nhựa ABS, Piston Gas', 'office', true, $1),
        (gen_random_uuid(), 'Ghế Giám Đốc Da Massage', 'Ghế giám đốc bọc da cao cấp, tính năng massage', 8500000, 20, 3, 'Boss Chair', 'Nâu Cafe', 70, 120, 70, 22.0, 'Da PU Cao Cấp, Khung Thép, Motor Massage', 'office', true, $1),
        
        -- Furniture - Tủ
        (gen_random_uuid(), 'Tủ Quần Áo 4 Cánh Lùa MDF', 'Tủ áo 4 cánh lùa, gỗ MDF phủ melamine bền đẹp', 16000000, 18, 4, 'Fureal Home', 'Trắng Bóng', 240, 220, 60, 125.0, 'Gỗ MDF Phủ Melamine, Ray Lùa Inox', 'bedroom', true, $1),
        (gen_random_uuid(), 'Tủ Áo 2 Cánh Gỗ Sồi', 'Tủ quần áo 2 cánh gỗ sồi, có ngăn kéo phía dưới', 9500000, 25, 4, 'Wooden Classic', 'Nâu Gỗ', 120, 200, 55, 68.0, 'Gỗ Sồi Tự Nhiên', 'bedroom', true, $1),
        (gen_random_uuid(), 'Tủ Giày Thông Minh 5 Tầng', 'Tủ đựng giày dép 5 tầng, tiết kiệm không gian', 3200000, 40, 4, 'SmartHome', 'Xám Xi Măng', 80, 150, 35, 18.5, 'Gỗ MDF, Cánh Lật Nhựa ABS', 'livingroom', true, $1),
        (gen_random_uuid(), 'Tủ Đầu Giường Gỗ Sồi 2 Ngăn', 'Tủ đầu giường 2 ngăn kéo, thiết kế tinh tế', 2500000, 40, 4, 'Fureal Home', 'Nâu Gỗ', 50, 50, 40, 12.0, 'Gỗ Sồi Tự Nhiên', 'bedroom', true, $1),
        
        -- Furniture - Kệ
        (gen_random_uuid(), 'Kệ Tivi Gỗ MDF 1m8', 'Kệ tivi hiện đại, có ngăn kéo và kệ mở', 4500000, 40, 5, 'Modern Home', 'Xám Ghi', 180, 45, 40, 28.0, 'Gỗ MDF Phủ Melamine', 'livingroom', true, $1),
        (gen_random_uuid(), 'Kệ Sách Gỗ 5 Tầng', 'Kệ sách gỗ 5 tầng, thiết kế chắc chắn', 3200000, 25, 5, 'BookLovers', 'Nâu Gỗ', 80, 180, 30, 22.5, 'Gỗ Cao Su Tự Nhiên', 'office', true, $1),
        (gen_random_uuid(), 'Kệ Trang Trí Treo Tường', 'Kệ gỗ treo tường tiết kiệm diện tích', 1500000, 50, 5, 'WallDecor', 'Trắng', 60, 20, 20, 3.5, 'Gỗ MDF Sơn Trắng', 'livingroom', true, $1),
        
        -- Decor - Tranh treo tường
        (gen_random_uuid(), 'Tranh Canvas Trừu Tượng 3 Tấm', 'Bộ 3 tranh canvas hiện đại, kích thước 40x60cm', 2500000, 30, 6, 'ArtWall', 'Đa Màu', 120, 60, 3, 2.5, 'Canvas In UV, Khung Gỗ', 'livingroom', true, $1),
        (gen_random_uuid(), 'Tranh Sơn Dầu Phong Cảnh', 'Tranh sơn dầu vẽ tay, khung gỗ sang trọng', 4500000, 15, 6, 'HandPainted', 'Xanh Dương', 80, 60, 5, 3.2, 'Sơn Dầu, Canvas, Khung Gỗ Tự Nhiên', 'livingroom', true, $1),
        (gen_random_uuid(), 'Tranh Scandinavian Tối Giản', 'Tranh phong cách Bắc Âu, tông màu nhẹ nhàng', 1800000, 40, 6, 'Nordic Art', 'Be Nhạt', 50, 70, 3, 1.8, 'In Canvas, Khung Nhôm', 'bedroom', true, $1),
        
        -- Decor - Cây xanh
        (gen_random_uuid(), 'Cây Kim Tiền Để Bàn', 'Cây Kim Tiền mini, chậu gốm cao cấp', 350000, 100, 7, 'GreenLife', 'Xanh Lá', 20, 35, 20, 1.2, 'Cây Sống, Chậu Gốm', 'office', true, $1),
        (gen_random_uuid(), 'Cây Trầu Bà Cẩm Thạch', 'Cây trầu bà lá đẹp, dễ chăm sóc', 280000, 120, 7, 'PlantShop', 'Xanh Lá Vằn', 15, 25, 15, 0.8, 'Cây Sống, Chậu Nhựa', 'livingroom', true, $1),
        (gen_random_uuid(), 'Cây Phát Tài Lớn', 'Cây phát tài cao 1.2m, chậu composite', 1200000, 25, 7, 'Lucky Tree', 'Xanh Đậm', 40, 120, 40, 8.5, 'Cây Sống, Chậu Composite', 'livingroom', true, $1),
        
        -- Decor - Gối trang trí
        (gen_random_uuid(), 'Gối Tựa Sofa Vải Nhung', 'Gối tựa vải nhung cao cấp, nhiều màu', 250000, 150, 8, 'SoftTouch', 'Xám Bạc', 45, 45, 15, 0.5, 'Vỏ Vải Nhung, Ruột Bông Gòn', 'livingroom', true, $1),
        (gen_random_uuid(), 'Gối Ôm Hình Học Scandinavian', 'Gối ôm phong cách Bắc Âu 40x60cm', 320000, 100, 8, 'Nordic Home', 'Trắng Đen', 40, 60, 15, 0.7, 'Vỏ Vải Canvas, Ruột Bông PP', 'bedroom', true, $1),
        (gen_random_uuid(), 'Bộ 4 Gối Trang Trí Phòng Ngủ', 'Bộ gối trang trí họa tiết đồng bộ', 850000, 60, 8, 'Fureal Home', 'Be Pastel', 45, 45, 15, 2.0, 'Vỏ Vải Cotton, Ruột Bông Gòn', 'bedroom', true, $1),
        
        -- Decor - Đồ trang trí
        (gen_random_uuid(), 'Bình Hoa Gốm Sứ Cao Cấp', 'Bình hoa gốm sứ Bát Tràng, thiết kế tinh xảo', 450000, 80, 9, 'Bát Tràng', 'Trắng Xanh', 15, 30, 15, 1.5, 'Gốm Sứ Bát Tràng', 'livingroom', true, $1),
        (gen_random_uuid(), 'Tượng Trang Trí Trừu Tượng', 'Tượng nhựa composite màu đồng', 680000, 50, 9, 'ArtDecor', 'Đồng Cổ', 12, 25, 12, 1.2, 'Nhựa Composite', 'livingroom', true, $1),
        (gen_random_uuid(), 'Nến Thơm Cao Cấp Set 3', 'Bộ 3 nến thơm hương hoa, chậu thủy tinh', 550000, 70, 9, 'Aroma Home', 'Trắng Kem', 25, 8, 8, 0.6, 'Sáp Đậu Nành, Tinh Dầu Thơm, Ly Thủy Tinh', 'bedroom', true, $1),
        
        -- Lighting - Đèn trần
        (gen_random_uuid(), 'Đèn Chùm Pha Lê 6 Bóng', 'Đèn chùm pha lê cao cấp, ánh sáng sang trọng', 12000000, 10, 10, 'Crystal Light', 'Bạc Trong', 80, 60, 80, 15.5, 'Khung Inox, Pha Lê K9', 'livingroom', true, $1),
        (gen_random_uuid(), 'Đèn Ốp Trần LED Tròn', 'Đèn LED ốp trần 24W, ánh sáng trắng/vàng', 850000, 100, 10, 'SmartLED', 'Trắng', 40, 8, 40, 1.2, 'Nhựa ABS, Chip LED Samsung', 'bedroom', true, $1),
        (gen_random_uuid(), 'Đèn Thả Hiện Đại Kim Loại', 'Đèn thả trang trí phong cách công nghiệp', 2200000, 35, 10, 'Industrial', 'Đen Nhám', 30, 120, 30, 2.8, 'Kim Loại Sơn Tĩnh Điện', 'dining', true, $1),
        
        -- Lighting - Đèn bàn
        (gen_random_uuid(), 'Đèn Bàn Làm Việc LED', 'Đèn học LED chống cận, điều chỉnh độ sáng', 650000, 80, 11, 'StudyLight', 'Trắng Bạc', 15, 45, 20, 0.8, 'Nhựa ABS, LED 10W', 'office', true, $1),
        (gen_random_uuid(), 'Đèn Ngủ Cảm Ứng', 'Đèn ngủ cảm ứng, 3 chế độ ánh sáng', 450000, 100, 11, 'TouchLight', 'Trắng Kem', 12, 18, 12, 0.5, 'Silicone, LED RGB', 'bedroom', true, $1),
        (gen_random_uuid(), 'Đèn Bàn Trang Trí Vintage', 'Đèn bàn phong cách retro, chao vải', 1200000, 40, 11, 'Vintage Home', 'Đồng Cổ', 25, 50, 25, 2.2, 'Chân Đồng, Chao Vải Lanh', 'livingroom', true, $1),
        
        -- Lighting - Đèn sàn
        (gen_random_uuid(), 'Đèn Cây Đứng Phòng Khách', 'Đèn sàn cao 1.6m, chao vải cao cấp', 2800000, 25, 12, 'FloorLight', 'Xám Ghi', 35, 160, 35, 5.5, 'Chân Kim Loại, Chao Vải', 'livingroom', true, $1),
        (gen_random_uuid(), 'Đèn Đọc Sách Góc Sofa', 'Đèn đứng góc đọc sách, điều chỉnh chiều cao', 1850000, 35, 12, 'ReadingLight', 'Đen Nhám', 30, 150, 30, 4.2, 'Thép Sơn Tĩnh Điện, Đầu Đèn Xoay', 'livingroom', true, $1),
        (gen_random_uuid(), 'Đèn Sàn LED RGB Hiện Đại', 'Đèn cây LED đổi màu, điều khiển remote', 3200000, 20, 12, 'SmartLED Pro', 'Bạc', 25, 180, 25, 3.8, 'Nhôm Anodized, LED RGB 20W', 'livingroom', true, $1),
        
        -- Fabrics - Thảm
        (gen_random_uuid(), 'Thảm Trải Sàn Phòng Khách 2x3m', 'Thảm lông ngắn, dễ vệ sinh, nhiều màu', 3500000, 30, 13, 'CarpetPro', 'Xám Nhạt', 200, 1, 300, 8.5, 'Sợi Polyester, Đế Cao Su Chống Trượt', 'livingroom', true, $1),
        (gen_random_uuid(), 'Thảm Lông Xù Scandinavian', 'Thảm lông dài phong cách Bắc Âu 1.6x2.3m', 2800000, 25, 13, 'Nordic Carpet', 'Trắng Kem', 160, 3, 230, 6.5, 'Sợi Polyester Lông Dài, Đế PVC', 'bedroom', true, $1),
        (gen_random_uuid(), 'Thảm Chùi Chân Cửa Ra Vào', 'Thảm sợi cói tự nhiên 60x90cm', 280000, 100, 13, 'EcoMat', 'Nâu Đất', 60, 1.5, 90, 1.2, 'Sợi Cói Tự Nhiên, Đế Cao Su', 'outdoor', true, $1),
        
        -- Fabrics - Rèm cửa
        (gen_random_uuid(), 'Rèm Vải Cao Cấp Chống Nắng', 'Rèm vải dày, chống nắng tốt, nhiều màu', 850000, 80, 14, 'SunBlock', 'Xám Đậm', 200, 260, 2, 2.5, 'Vải Polyester Dày, Lớp Phủ PVC Chống Nắng', 'bedroom', true, $1),
        (gen_random_uuid(), 'Rèm Cửa Sổ Voan Thêu Hoa', 'Rèm voan nhẹ nhàng, họa tiết thêu tinh tế', 650000, 100, 14, 'LaceCurtain', 'Trắng Kem', 150, 220, 1, 1.2, 'Vải Voan Thêu Hoa, Polyester', 'livingroom', true, $1),
        (gen_random_uuid(), 'Rèm Cầu Vồng Phòng Trẻ Em', 'Rèm vải họa tiết dễ thương cho bé', 550000, 60, 14, 'KidsRoom', 'Đa Màu', 140, 200, 1.5, 1.5, 'Vải Cotton Blend In Hình', 'bedroom', true, $1),
        
        -- Fabrics - Chăn gối
        (gen_random_uuid(), 'Bộ Chăn Ga Gối Cotton 100%', 'Bộ chăn ga cotton Hàn Quốc, mềm mịn', 1200000, 50, 15, 'KoreanBedding', 'Trắng Hoa Nhí', 160, 200, 5, 2.5, '100% Cotton Hàn Quốc', 'bedroom', true, $1),
        (gen_random_uuid(), 'Chăn Mền Lông Cừu Cao Cấp', 'Chăn lông cừu ấm áp, kích thước 2x2.2m', 2500000, 35, 15, 'WoolBlanket', 'Be Đậm', 200, 220, 8, 3.5, 'Lông Cừu Úc, Vỏ Cotton', 'bedroom', true, $1),
        (gen_random_uuid(), 'Bộ Ga Gối Tencel Silk', 'Bộ ga gối Tencel mát lạnh, sang trọng', 3200000, 25, 15, 'SilkTouch', 'Xanh Ngọc', 180, 200, 3, 2.0, 'Tencel Silk Cao Cấp', 'bedroom', true, $1)
      ON CONFLICT DO NOTHING;
    `, [adminId]);
    console.log('✅ Products created\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Sample data seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    console.log('📊 Summary:');
    console.log('   • 4 Users (1 Manager + 3 Regular Users)');
    console.log('   • 4 Category Groups (Furniture, Decor, Lighting, Fabrics)');
    console.log('   • 15 Categories');
    console.log('   • 51 Products (Sản phẩm nội thất đầy đủ)\n');
    
    console.log('👥 Test Accounts:');
    console.log('   📧 admin@fureal.com / 🔑 Admin@123 (ADMIN)');
    console.log('   📧 manager@fureal.com / 🔑 Manager@123 (MANAGER)');
    console.log('   📧 user1@fureal.com / 🔑 User@123 (USER)');
    console.log('   📧 user2@fureal.com / 🔑 User@123 (USER)');
    console.log('   📧 user3@fureal.com / 🔑 User@123 (USER)\n');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
