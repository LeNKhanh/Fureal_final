# Feng Shui (Phong Thủy) Integration

## ✅ Hoàn tất!

Đã thêm các trường phong thủy vào bảng products để hỗ trợ khách hàng chọn nội thất phù hợp với mệnh và hướng nhà.

## 📊 Database Changes

### Bảng `products` - Thêm 2 trường mới

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| `menh` | VARCHAR(50) | Ngũ hành phù hợp | "Mộc, Thổ", "Kim", "Hỏa" |
| `huong` | VARCHAR(100) | Hướng đặt phù hợp | "Đông, Đông Bắc, Tây Nam" |

**Index:**
- `idx_products_menh` - Filter theo mệnh

## 🔮 Ngũ Hành (Mệnh)

Theo phong thủy Việt Nam, có 5 mệnh chính:

1. **Kim (金)** - Kim loại
2. **Mộc (木)** - Cây cối
3. **Thủy (水)** - Nước
4. **Hỏa (火)** - Lửa
5. **Thổ (土)** - Đất

## 🧭 Tám Hướng

| Hướng | Góc | Mệnh phù hợp |
|-------|-----|--------------|
| **Đông** | 67.5° - 112.5° | Mộc |
| **Đông Nam** | 112.5° - 157.5° | Mộc |
| **Nam** | 157.5° - 202.5° | Hỏa |
| **Tây Nam** | 202.5° - 247.5° | Thổ |
| **Tây** | 247.5° - 292.5° | Kim |
| **Tây Bắc** | 292.5° - 337.5° | Kim |
| **Bắc** | 337.5° - 22.5° | Thủy |
| **Đông Bắc** | 22.5° - 67.5° | Thổ |

## 📦 Phân Loại Sản Phẩm Theo Mệnh

### Giường (Category 1)
- **Mệnh:** Mộc, Thổ
- **Hướng:** Đông, Đông Bắc, Tây Nam
- **Lý do:** Giường làm từ gỗ (Mộc), nên nghỉ ngơi ổn định (Thổ)

### Bàn (Category 2)
- **Mệnh:** Kim, Thổ
- **Hướng:** Tây, Tây Bắc, Đông Bắc
- **Lý do:** Bàn làm việc cần sự tập trung (Kim), nền tảng vững chắc (Thổ)

### Ghế Sofa (Category 3)
- **Mệnh:** Thổ, Hỏa
- **Hướng:** Tây Nam, Đông Bắc, Nam
- **Lý do:** Chỗ ngồi ổn định (Thổ), ấm áp sum họp (Hỏa)

### Tủ (Category 4)
- **Mệnh:** Mộc
- **Hướng:** Đông, Đông Nam
- **Lý do:** Làm từ gỗ, chứa quần áo (sinh khí)

### Kệ (Category 5)
- **Mệnh:** Kim, Mộc
- **Hướng:** Tây, Tây Bắc, Đông
- **Lý do:** Kệ kim loại hoặc gỗ

### Tranh (Category 6)
- **Mệnh:** Hỏa, Mộc
- **Hướng:** Nam, Đông, Đông Nam
- **Lý do:** Nghệ thuật mang năng lượng sáng tạo

### Cây Xanh (Category 7)
- **Mệnh:** Mộc
- **Hướng:** Đông, Đông Nam, Nam
- **Lý do:** Cây cối thuộc hành Mộc

### Gối Trang Trí (Category 8)
- **Mệnh:** Hỏa, Thổ
- **Hướng:** Nam, Tây Nam, Đông Bắc
- **Lý do:** Mang lại ấm áp, thoải mái

### Đồ Trang Trí (Category 9)
- **Mệnh:** Thổ, Kim
- **Hướng:** Tây Nam, Tây, Đông Bắc
- **Lý do:** Gốm sứ (Thổ), kim loại (Kim)

### Đèn (Categories 10, 11, 12)
- **Mệnh:** Hỏa
- **Hướng:** Nam, Đông Nam, Tây Nam
- **Lý do:** Ánh sáng thuộc hành Hỏa

### Thảm (Category 13)
- **Mệnh:** Thổ
- **Hướng:** Tây Nam, Đông Bắc, Trung Tâm
- **Lý do:** Trải sàn, ổn định không gian

### Rèm Cửa (Category 14)
- **Mệnh:** Mộc, Thủy
- **Hướng:** Đông, Bắc, Đông Nam
- **Lý do:** Vải (Mộc), che chắn như nước

### Chăn Gối (Category 15)
- **Mệnh:** Thủy, Mộc
- **Hướng:** Bắc, Đông, Đông Bắc
- **Lý do:** Vải mềm mại (Thủy), vải lanh (Mộc)

## 🔧 API Usage

### 1. Filter theo Mệnh
```bash
GET /api/products?menh=Mộc
GET /api/products?menh=Kim
GET /api/products?menh=Thủy
GET /api/products?menh=Hỏa
GET /api/products?menh=Thổ
```

### 2. Tìm sản phẩm theo Hướng
```bash
GET /api/products?huong=Đông
GET /api/products?huong=Nam
GET /api/products?huong=Tây
GET /api/products?huong=Bắc
```

### 3. Kết hợp Mệnh + Space
```bash
# Tìm sản phẩm Mộc cho phòng ngủ
GET /api/products?menh=Mộc&space=bedroom

# Tìm đèn Hỏa cho phòng khách
GET /api/products?menh=Hỏa&space=livingroom
```

### 4. Create Product với Phong Thủy
```json
POST /api/products
{
  "name": "Tủ Gỗ Sồi Phong Thủy",
  "description": "Tủ gỗ sồi tự nhiên, phù hợp mệnh Mộc",
  "price": 9500000,
  "stock": 20,
  "categoryId": 4,
  "brand": "Fureal Home",
  "color": "Nâu Gỗ",
  "width": 120,
  "height": 200,
  "depth": 55,
  "weight": 68.0,
  "material": "Gỗ Sồi Tự Nhiên",
  "space": "bedroom",
  "menh": "Mộc",
  "huong": "Đông, Đông Nam"
}
```

### 5. Get Product Response
```json
{
  "id": "uuid",
  "name": "Giường Ngủ Gỗ Sồi Tự Nhiên 1m6",
  "price": 15000000,
  "brand": "Fureal Home",
  "color": "Nâu Gỗ",
  "material": "Gỗ Sồi Tự Nhiên, Nệm Bọc Vải",
  "space": "bedroom",
  "menh": "Mộc, Thổ",
  "huong": "Đông, Đông Bắc, Tây Nam",
  "width": 160,
  "height": 100,
  "depth": 200
}
```

## 💡 Use Cases

### 1. Tư Vấn Theo Mệnh Người Dùng

```typescript
// Frontend: User nhập ngày sinh -> tính mệnh
const userBirthYear = 1990;
const menh = calculateMenh(userBirthYear); // => "Kim"

// API: Lấy sản phẩm phù hợp
GET /api/products?menh=Kim&space=bedroom
```

### 2. Gợi Ý Sản Phẩm Theo Hướng Nhà

```typescript
// User chọn hướng nhà: "Đông"
GET /api/products?huong=Đông&space=livingroom

// Kết quả: Cây xanh, Tranh, Rèm cửa...
```

### 3. Bộ Lọc Nâng Cao

```typescript
// Tìm giường cho người mệnh Mộc, nhà hướng Đông
GET /api/products?category=1&menh=Mộc&huong=Đông

// Tìm đèn cho người mệnh Hỏa
GET /api/products?category=10,11,12&menh=Hỏa
```

## 📱 Frontend Integration Examples

### Search Filter Component
```tsx
// React Example
<Form>
  <Select name="menh" placeholder="Chọn mệnh">
    <Option value="Kim">Kim (金)</Option>
    <Option value="Mộc">Mộc (木)</Option>
    <Option value="Thủy">Thủy (水)</Option>
    <Option value="Hỏa">Hỏa (火)</Option>
    <Option value="Thổ">Thổ (土)</Option>
  </Select>

  <Select name="huong" placeholder="Hướng nhà">
    <Option value="Đông">Đông</Option>
    <Option value="Tây">Tây</Option>
    <Option value="Nam">Nam</Option>
    <Option value="Bắc">Bắc</Option>
    <Option value="Đông Bắc">Đông Bắc</Option>
    <Option value="Đông Nam">Đông Nam</Option>
    <Option value="Tây Bắc">Tây Bắc</Option>
    <Option value="Tây Nam">Tây Nam</Option>
  </Select>
</Form>
```

### Product Card Display
```tsx
<ProductCard>
  <h3>{product.name}</h3>
  <p>{product.price.toLocaleString('vi-VN')} ₫</p>
  
  <FengShuiTag>
    <Icon>🔮</Icon>
    <span>Mệnh: {product.menh}</span>
  </FengShuiTag>
  
  <FengShuiTag>
    <Icon>🧭</Icon>
    <span>Hướng: {product.huong}</span>
  </FengShuiTag>
</ProductCard>
```

## 🛠️ Commands

```bash
# Chạy migration
npm run migrate:fengshui

# Update sản phẩm hiện có với thông tin phong thủy
npm run seed:fengshui

# Build project
npm run build
```

## 📊 Benefits

1. ✅ **Tăng trải nghiệm khách hàng**: Tư vấn sản phẩm phù hợp với phong thủy
2. ✅ **Unique selling point**: Khác biệt so với competitors
3. ✅ **Tăng conversion rate**: Khách hàng tin tưởng hơn khi có tư vấn phong thủy
4. ✅ **SEO friendly**: Keywords như "giường mệnh Mộc", "sofa hướng Đông"
5. ✅ **Filter mạnh mẽ**: Dễ dàng tìm kiếm theo mệnh và hướng

## 🎯 Future Enhancements

- [ ] API tính mệnh theo năm sinh
- [ ] API gợi ý combo sản phẩm theo phong thủy
- [ ] Tích hợp la bàn điện tử xác định hướng nhà
- [ ] Bài viết blog về phong thủy nội thất
- [ ] Tư vấn trực tuyến với chuyên gia phong thủy

---

**Migration hoàn tất! Build thành công!** ✅
