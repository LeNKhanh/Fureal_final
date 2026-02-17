-- SQL Script: Thêm Ảnh Mẫu Cho Các Sản Phẩm
-- Chạy script này để thêm ảnh cho các sản phẩm đã có trong database

-- 1. Thêm ảnh cho "Kệ Sách" (ID: 51eb3583-3045-4006-aeb2-aaeadd0eef19)
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
('51eb3583-3045-4006-aeb2-aaeadd0eef19', 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800', true),
('51eb3583-3045-4006-aeb2-aaeadd0eef19', 'https://images.unsplash.com/photo-1585663924851-a7e4c0d5d7f5?w=800', false),
('51eb3583-3045-4006-aeb2-aaeadd0eef19', 'https://images.unsplash.com/photo-1629079447777-1e605162bb22?w=800', false);

-- 2. Kiểm tra kết quả
SELECT 
  p.name AS "Tên Sản Phẩm",
  p.price AS "Giá",
  pi.image_url AS "URL Ảnh",
  pi.is_primary AS "Ảnh Chính",
  pi.id AS "Image ID"
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.id = '51eb3583-3045-4006-aeb2-aaeadd0eef19'
ORDER BY pi.is_primary DESC, pi.id;

-- 3. Thêm ảnh cho TẤT CẢ sản phẩm chưa có ảnh (ví dụ)
-- Lấy danh sách sản phẩm chưa có ảnh:
SELECT p.id, p.name, p.category_id
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE pi.id IS NULL
ORDER BY p.created_at DESC;

-- 4. Template để thêm ảnh cho sản phẩm khác
-- Thay {PRODUCT_ID} bằng ID sản phẩm thực tế
/*
INSERT INTO product_images (product_id, image_url, is_primary) VALUES
('{PRODUCT_ID}', 'https://example.com/image1.jpg', true),
('{PRODUCT_ID}', 'https://example.com/image2.jpg', false);
*/

-- 5. Ảnh mẫu từ Unsplash (miễn phí sử dụng)
-- Nội thất phòng khách:
-- https://images.unsplash.com/photo-1555041469-a586c61ea9bc (Sofa)
-- https://images.unsplash.com/photo-1567016432779-094069958ea5 (Phòng khách)
-- https://images.unsplash.com/photo-1586023492125-27b2c045efd7 (Bàn)

-- Nội thất phòng ngủ:
-- https://images.unsplash.com/photo-1505693416388-ac5ce068fe85 (Giường)
-- https://images.unsplash.com/photo-1540518614846-7eded433c457 (Phòng ngủ)

-- Kệ/Tủ:
-- https://images.unsplash.com/photo-1594620302200-9a762244a156 (Kệ sách)
-- https://images.unsplash.com/photo-1595428774223-ef52624120d2 (Tủ)

-- 6. Xóa ảnh của sản phẩm (nếu cần)
-- DELETE FROM product_images WHERE product_id = '{PRODUCT_ID}';

-- 7. Cập nhật ảnh chính
-- UPDATE product_images SET is_primary = false WHERE product_id = '{PRODUCT_ID}';
-- UPDATE product_images SET is_primary = true WHERE id = {IMAGE_ID};

-- 8. Thống kê ảnh
SELECT 
  COUNT(DISTINCT p.id) AS "Tổng Sản Phẩm",
  COUNT(pi.id) AS "Tổng Ảnh",
  COUNT(DISTINCT p.id) FILTER (WHERE pi.id IS NOT NULL) AS "Sản Phẩm Có Ảnh",
  COUNT(DISTINCT p.id) FILTER (WHERE pi.id IS NULL) AS "Sản Phẩm Chưa Có Ảnh"
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id;
