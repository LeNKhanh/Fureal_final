# Test Google OAuth Login

## ✅ Implementation hoàn tất!

Google OAuth đã được tích hợp thành công vào hệ thống. Dưới đây là hướng dẫn test và sử dụng.

## 📋 Checklist

- [x] Install dependencies (`passport-google-oauth20`)
- [x] Tạo Google Strategy
- [x] Tạo Google Auth Guard
- [x] Cập nhật Auth Service với `googleLogin()` method
- [x] Thêm endpoints `/auth/google` và `/auth/google/callback`
- [x] Cập nhật Auth Module
- [x] Thêm Google config vào configuration
- [x] Build thành công

## 🔧 Setup Google Credentials

### Bước 1: Tạo Google OAuth App

Xem chi tiết trong file [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

Tóm tắt:
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo OAuth 2.0 Client ID
3. Thêm Authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
4. Copy Client ID và Client Secret

### Bước 2: Cấu hình .env

File `.env` đã được cập nhật với các biến sau:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:3001
```

**⚠️ QUAN TRỌNG:** Thay thế `your-google-client-id` và `your-google-client-secret` bằng credentials thực từ Google Console!

## 🚀 Test API

### 1. Start server

```bash
npm run start:dev
```

### 2. Test Google Login Flow

#### Option 1: Test bằng Browser (Recommended)

1. Mở browser và truy cập:
   ```
   http://localhost:3000/api/auth/google
   ```

2. Browser sẽ redirect đến Google login page
3. Chọn/đăng nhập tài khoản Google
4. Sau khi authorize, Google redirect về callback URL
5. Backend xử lý và redirect về frontend với token:
   ```
   http://localhost:3001/auth/callback?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

#### Option 2: Test bằng Postman

**Lưu ý:** OAuth flow yêu cầu browser nên khuyến nghị test bằng browser hoặc frontend.

Nếu dùng Postman:
1. Tắt "Automatically follow redirects"
2. GET `http://localhost:3000/api/auth/google`
3. Copy redirect URL từ response header `Location`
4. Paste URL vào browser để hoàn tất flow

### 3. Verify Database

Sau khi login thành công, kiểm tra database:

```sql
-- Check user created
SELECT * FROM users WHERE email = 'your-google-email@gmail.com';

-- Check auth provider record
SELECT * FROM auth_providers WHERE provider = 'google';
```

## 📊 API Endpoints

### 1. Initiate Google Login
```
GET /api/auth/google
```
- Redirect user đến Google OAuth
- Không cần authentication
- Response: 302 Redirect

### 2. Google Callback (tự động)
```
GET /api/auth/google/callback
```
- Xử lý callback từ Google
- Tạo/login user
- Response: 302 Redirect đến frontend với token

### 3. Existing Endpoints (vẫn hoạt động)
```
POST /api/auth/register - Register với email/password
POST /api/auth/login    - Login với email/password
```

## 🔄 Flow hoạt động

```
1. User click "Login with Google" 
   ↓
2. Frontend redirect: window.location.href = '/api/auth/google'
   ↓
3. Backend redirect đến Google OAuth
   ↓
4. User login & authorize trên Google
   ↓
5. Google redirect về: /api/auth/google/callback?code=xxx
   ↓
6. Backend xử lý:
   - Verify với Google
   - Check user exists (by email hoặc providerId)
   - Create new user HOẶC login existing user
   - Lưu vào auth_providers table
   - Generate JWT token
   ↓
7. Backend redirect về frontend: ${FRONTEND_URL}/auth/callback?token=xxx
   ↓
8. Frontend lưu token & redirect vào app
```

## 🗃️ Database Schema

### Table: auth_providers
```sql
CREATE TABLE auth_providers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50),           -- 'google', 'facebook', etc.
  provider_user_id VARCHAR(255),  -- Google user ID
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 💡 Features

### ✅ Automatic User Creation
- User chưa tồn tại → Tự động tạo user mới với email từ Google
- Role mặc định: USER (roleId: 3)
- Password: NULL (OAuth users không cần password)

### ✅ Account Linking
- User đã tồn tại (cùng email) → Link Google account vào user hiện tại
- Cho phép user login bằng cả email/password VÀ Google

### ✅ Multiple Provider Support
- Cấu trúc hỗ trợ nhiều providers (Facebook, GitHub, etc.)
- Dễ dàng mở rộng thêm providers khác

## 🔒 Security

- ✅ JWT token issued sau khi verify với Google
- ✅ User info được lấy trực tiếp từ Google API (trusted source)
- ✅ Provider credentials được lưu an toàn trong database
- ⚠️ Không commit GOOGLE_CLIENT_SECRET vào git
- ⚠️ Sử dụng HTTPS trong production

## 🐛 Troubleshooting

### Lỗi: "Redirect URI mismatch"
**Nguyên nhân:** Callback URL không khớp với Google Console

**Giải pháp:**
1. Kiểm tra GOOGLE_CALLBACK_URL trong .env
2. Đảm bảo URL trong Google Console chính xác
3. URL phải khớp 100% (bao gồm http/https, port)

### Lỗi: "Access blocked: This app's request is invalid"
**Nguyên nhân:** Thiếu scope hoặc app chưa verified

**Giải pháp:**
1. Kiểm tra scopes trong google.strategy.ts
2. Thêm test users trong Google Console (Development mode)
3. Verify app trong Google Console

### Lỗi: "Invalid credentials"
**Nguyên nhân:** Client ID/Secret sai

**Giải pháp:**
1. Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
2. Đảm bảo không có space thừa
3. Tạo credentials mới nếu cần

## 📝 Next Steps

### Frontend Integration
Tạo Google login button:

```tsx
// React Example
const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  return (
    <button onClick={handleGoogleLogin}>
      <img src="/google-icon.png" alt="Google" />
      Continue with Google
    </button>
  );
};

// Callback handler
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  
  if (token) {
    localStorage.setItem('access_token', token);
    navigate('/dashboard');
  }
}, []);
```

### Thêm Providers khác
Cấu trúc đã sẵn sàng để thêm:
- Facebook Login
- GitHub Login
- Twitter Login
- Etc.

Chỉ cần tạo strategy mới tương tự `google.strategy.ts`!

## 📚 Documentation

- [Passport Google OAuth20](http://www.passportjs.org/packages/passport-google-oauth20/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [NestJS Passport](https://docs.nestjs.com/security/authentication)
