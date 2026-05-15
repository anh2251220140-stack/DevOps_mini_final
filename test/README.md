# Bộ test local cho Expense Manager

Thư mục `test/` được tách theo 2 lớp:

- `test/incidents/`: test theo từng sự cố để phục vụ quy trình fail-first
- `test/regression/`: test smoke/final verify sau khi đã sửa

## Cấu trúc chạy test

1. Chạy full app từ root:

```powershell
cd D:\Web_QL_ChiTieu
npm run dev
```

2. Chạy từng incident để cố tình thấy fail trước:

```powershell
npm run test:incident:01
npm run test:incident:02
npm run test:incident:03
```

3. Sau khi sửa xong, chạy verify toàn bộ:

```powershell
npm test
```

## Ý nghĩa từng nhóm

### Incident 01

- File: `test/incidents/test_incident_01_frontend_env.py`
- Mục tiêu: bắt lỗi `Frontend/.env` trỏ sai backend local

### Incident 02

- File: `test/incidents/test_incident_02_backend_cors.py`
- Mục tiêu: bắt lỗi `Backend/.env` và CORS header

### Incident 03

- File: `test/incidents/test_incident_03_validation_status.py`
- Mục tiêu: bắt lỗi API validation trả sai status code

### Regression

- `test/regression/test_api_health.py`
- `test/regression/test_frontend_runtime.py`

Nhóm này dùng để xác nhận backend/frontend local vẫn sống ổn sau khi sửa.

## Biến môi trường tùy chọn

- `TEST_BACKEND_BASE_URL` mặc định: `http://localhost:3000`
- `TEST_FRONTEND_BASE_URL` mặc định: `http://localhost:5173`
- `TEST_FRONTEND_ORIGIN` mặc định: `http://localhost:5173`
- `TEST_EXPECT_LOCAL_STACK` mặc định: `1`
