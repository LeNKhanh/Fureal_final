# Google OAuth Setup Guide

## 1. Tạo Google OAuth Credentials

### Bước 1: Truy cập Google Cloud Console
1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn

### Bước 2: Enable Google+ API
1. Vào **APIs & Services** > **Library**
2. Tìm và enable **Google+ API**

### Bước 3: Tạo OAuth 2.0 Credentials
1. Vào **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Chọn **Application type**: Web application
4. Điền thông tin:
   - **Name**: Fureal E-commerce
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000`
     - `http://localhost:3001` (frontend URL nếu có)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/google/callback`
5. Click **Create**
6. Copy **Client ID** và **Client Secret**

### Bước 4: Cấu hình .env
Thêm thông tin vào file `.env`:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback
FRONTEND_URL=http://localhost:3001
```

## 2. Test Google OAuth

### Backend API Endpoints:

1. **Initiate Google Login**
   ```
   GET http://localhost:3000/api/auth/google
   ```
   - Redirect user đến Google login page
   
2. **Callback** (tự động sau khi user login Google)
   ```
   GET http://localhost:3000/api/auth/google/callback
   ```
   - Nhận code từ Google
   - Tạo/login user
   - Redirect về frontend với token

### Flow hoạt động:

1. User click "Login with Google" → Frontend redirect đến `GET /api/auth/google`
2. User đăng nhập Google và authorize app
3. Google redirect về `GET /api/auth/google/callback`
4. Backend:
   - Kiểm tra user đã tồn tại chưa (qua email hoặc providerId)
   - Nếu chưa: tạo user mới
   - Nếu rồi: login user
   - Lưu thông tin provider vào `auth_providers` table
5. Redirect về frontend với JWT token: `${FRONTEND_URL}/auth/callback?token=xxx`
6. Frontend lưu token và redirect user vào app

### Database Schema:

Table `auth_providers` lưu thông tin OAuth:
```sql
id              | integer (PK)
user_id         | uuid (FK -> users.id)
provider        | varchar(50)     -- 'google', 'facebook', etc.
provider_user_id| varchar(255)    -- Google user ID
created_at      | timestamp
```

## 3. Frontend Integration

### React Example:

```typescript
// Login button
<button onClick={() => window.location.href = 'http://localhost:3000/api/auth/google'}>
  Login with Google
</button>

// Callback page (e.g., /auth/callback)
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    localStorage.setItem('access_token', token);
    navigate('/dashboard');
  }
}, []);
```

## 4. Production Setup

Khi deploy lên production:

1. Update **Authorized redirect URIs** trong Google Console:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```

2. Update `.env`:
   ```env
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   FRONTEND_URL=https://yourdomain.com
   ```

3. Đảm bảo HTTPS được enable

## 5. Security Notes

- ✅ JWT token được tạo sau khi verify với Google
- ✅ User info được lấy trực tiếp từ Google (trusted source)
- ✅ Provider info được lưu để link/unlink accounts
- ⚠️ Không bao giờ commit GOOGLE_CLIENT_SECRET vào git
- ⚠️ Sử dụng HTTPS trong production
- ⚠️ Validate redirect URLs để tránh phishing attacks
