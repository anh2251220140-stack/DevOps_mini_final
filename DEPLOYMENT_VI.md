# Hướng dẫn Deploy lên Vercel

## 🚀 Chuẩn bị

- Tài khoản Vercel (https://vercel.com)
- Repository GitHub được sync
- Credentials Supabase

## 📋 Biến môi trường cần thiết

Cấu hình trong Vercel Project Settings > Environment Variables:

| Tên | Giá trị | Ghi chú |
|-----|--------|--------|
| `CORS_ORIGIN` | `https://your-project.vercel.app` | URL deployment của Vercel |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Từ Supabase Dashboard |
| `SUPABASE_ANON_KEY` | `xxx_key_xxx` | Từ Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | `xxx_key_xxx` | Từ Supabase |
| `SUPABASE_TABLE` | `transactions` | Tên bảng (mặc định) |

## 🌐 Các API endpoint sau khi deploy

```
Frontend:     https://your-project.vercel.app
API:          https://your-project.vercel.app/api/transactions
Health Check: https://your-project.vercel.app/health
Tasks:        https://your-project.vercel.app/api/tasks
```

## 📱 Deploy từ GitHub

1. Vào https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import GitHub repo: `anh2251220140-stack/DevOps_mini_final`
4. Cấu hình:
   - **Framework**: Chọn "Other"
   - **Build Command**: `cd Frontend && npm install && npm run build`
   - **Output Directory**: `Frontend/dist`
5. Thêm Environment Variables từ bảng trên
6. Click "Deploy"

## 💻 Deploy từ CLI

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Thêm env vars khi được hỏi
```

## 🔄 Cấu trúc Project

```
/                  → Frontend (React + Vite) - Static
/api/*             → Backend (Node.js) - Serverless Functions
```

## ✅ Xác minh sau deploy

1. Truy cập frontend: `https://your-project.vercel.app`
2. Test API: `https://your-project.vercel.app/health` (phải trả về `{"status":"OK"}`)
3. Test create transaction:
   ```bash
   curl -X POST https://your-project.vercel.app/api/transactions \
     -H "Content-Type: application/json" \
     -d '{"title":"Test","amount":50000,"category":"Khác","date":"2026-05-06"}'
   ```

## 🐛 Xử lý sự cố

### Health check thất bại
- Kiểm tra environment variables trong Vercel Dashboard
- Supabase credentials có chính xác không

### API 404 Not Found
- Xác nhận routes trong `vercel.json` đúng
- Check Backend/api/index.js được deploy

### CORS errors
- Cập nhật `CORS_ORIGIN` với URL Vercel thực tế

## 📊 Giám sát & Logs

- Logs: Dashboard → Project → Logs
- Function Logs: Dashboard → Project → Functions
- Error Tracking: Sentry integration (optional)

## 🔐 Bảo mật

- Không commit `.env` files
- Dùng Vercel Environment Variables
- Rotate keys định kỳ
- Enable 2FA trên Vercel account
