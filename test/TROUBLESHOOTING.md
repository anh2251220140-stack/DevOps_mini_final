# Loi thuong gap va huong xu ly

## 1. `Khong the goi http://localhost:3000/...`

Nguyen nhan:
- Backend chua chay
- Port 3000 dang bi chiem

Huong xu ly:
- Chay `npm run dev` o root repo
- Kiem tra log `[backend]`

## 2. `Khong the goi http://localhost:5173`

Nguyen nhan:
- Frontend chua chay
- Vite khong len do thieu dependency

Huong xu ly:
- Chay `npm run install:all`
- Chay lai `npm run dev`
- Kiem tra log `[frontend]`

## 3. `VITE_API_URL` khong phai `http://localhost:3000/api`

Nguyen nhan:
- Frontend dang tro den backend tren Vercel

Huong xu ly:
- Sua `Frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

## 4. `CORS_ORIGIN` khong phai `http://localhost:5173`

Nguyen nhan:
- Backend dang chi cho phep frontend tren Vercel

Huong xu ly:
- Sua `Backend/.env`

```env
CORS_ORIGIN=http://localhost:5173
```

## 5. `/api/transactions` khong tra ve JSON list

Nguyen nhan:
- Backend tra sai contract
- Supabase query loi

Huong xu ly:
- Kiem tra log backend
- Dam bao endpoint tra ve `[]` hoac `[{}, ...]`

## 6. POST invalid payload tra 500 thay vi 400

Nguyen nhan:
- Backend gom loi validate vao nhom loi he thong

Huong xu ly:
- Da duoc sua trong `Backend/src/server.js`
- Giu quy uoc: loi input -> `400`, loi he thong -> `500`

## 7. `supabase.configured` hoac `supabase.connected` khong hop le trong health

Nguyen nhan:
- Gọi sai ham `isSupabaseConfigured()`

Huong xu ly:
- Da duoc sua trong `Backend/src/server.js` va `Backend/src/supabase.js`

## 8. `/api/tasks` loi 500

Nguyen nhan:
- Bang tasks khong ton tai
- `SUPABASE_TASK_TABLE` sai

Huong xu ly:
- Kiem tra ten bang trong `Backend/.env`
- Dam bao Supabase co bang `tasks`
