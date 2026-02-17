-- Script: Thêm ảnh cho sản phẩm "Giường Tầng Trẻ Em"
-- Product ID: 00572836-e33b-4d6f-88ef-749abb4574c6

-- Bước 1: Kiểm tra sản phẩm
SELECT id, name, price, stock, menh, huong
FROM products 
WHERE id = '00572836-e33b-4d6f-88ef-749abb4574c6';

-- Bước 2: Xóa ảnh cũ (nếu có)
DELETE FROM product_images 
WHERE product_id = '00572836-e33b-4d6f-88ef-749abb4574c6';

-- Bước 3: Thêm ảnh mới
INSERT INTO product_images (product_id, image_url, is_primary) 
VALUES 
('00572836-e33b-4d6f-88ef-749abb4574c6', 'https://res.cloudinary.com/dg8tosiyr/image/upload/v1770809301/giuong_tre_em_2_tang_qjm2lj.png', true);

-- Bước 4: Kiểm tra kết quả
SELECT 
  p.id AS "Product ID",
  p.name AS "Tên Sản Phẩm",
  p.price AS "Giá",
  p.stock AS "Tồn Kho",
  pi.image_url AS "URL Ảnh",
  pi.is_primary AS "Ảnh Chính",
  pi.id AS "Image ID"
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.id = '00572836-e33b-4d6f-88ef-749abb4574c6';

-- Hoặc test qua API:
-- GET http://localhost:3000/api/products/00572836-e33b-4d6f-88ef-749abb4574c6
