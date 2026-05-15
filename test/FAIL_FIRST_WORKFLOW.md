# Quy trình test theo kiểu Fail First

Mục tiêu của cấu trúc này là:

1. Chủ động tạo điều kiện lỗi.
2. Chạy test để nhìn thấy `FAIL` trước.
3. Ghi nhận log, nguyên nhân và layer lỗi.
4. Áp dụng hướng giải quyết.
5. Chạy lại để xác nhận `PASS`.

## Incident 01: Frontend local trỏ sai backend deploy

### Cách tái hiện để test fail

Sửa [Frontend/.env](/D:/Web_QL_ChiTieu/Frontend/.env:1):

```env
VITE_API_URL=https://dev-ops-mini-final-biun.vercel.app
```

Sau đó chạy:

```powershell
cd D:\Web_QL_ChiTieu
npm run test:incident:01
```

### Fail mong đợi

- `test/incidents/test_incident_01_frontend_env.py`

### Hướng giải quyết

Đổi lại:

```env
VITE_API_URL=http://localhost:3000/api
```

Rồi chạy lại:

```powershell
npm run test:incident:01
```

## Incident 02: Backend local bị sai CORS origin

### Cách tái hiện để test fail

Sửa [Backend/.env](/D:/Web_QL_ChiTieu/Backend/.env:1):

```env
CORS_ORIGIN=https://dev-o1.vercel.app
```

Restart local stack:

```powershell
cd D:\Web_QL_ChiTieu
npm run dev
```

Terminal khác:

```powershell
npm run test:incident:02
```

### Fail mong đợi

- `test/incidents/test_incident_02_backend_cors.py`

### Hướng giải quyết

Đổi lại:

```env
CORS_ORIGIN=http://localhost:5173
```

Sau đó `Ctrl + C` rồi chạy lại `npm run dev`, cuối cùng chạy lại `npm test`.

## Incident 03: API validation trả sai mã lỗi

### Cách tái hiện để test fail

Tạm thời bỏ cơ chế `ApiError(400, ...)` trong [Backend/src/server.js](/D:/Web_QL_ChiTieu/Backend/src/server.js:18) hoặc đổi lại thành `throw new Error(...)`.

Chạy:

```powershell
cd D:\Web_QL_ChiTieu
npm run test:incident:03
```

### Fail mong đợi

- `test/incidents/test_incident_03_validation_status.py`

### Hướng giải quyết

Khôi phục `ApiError` và việc map lỗi input sang HTTP `400`.

## Luồng xác nhận cuối cùng

Sau khi sửa xong:

```powershell
cd D:\Web_QL_ChiTieu
npm run dev
```

Terminal khác:

```powershell
npm test
npm --prefix Frontend run lint
```

Kết quả mong đợi:

- `17 passed`
- `eslint .` không báo lỗi
