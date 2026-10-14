

## nhớ cài mấy này nha

- Node.js 18+ ,npm
- Python 3.10+

trước khi chạy file nhớ tạo môi trường ảo rồi mới chạy 
## Chạy frontend

```bash
cd Django_08/frontend
npm install
npm run dev
```

Mặc định frontend gọi API tại `http://127.0.0.1:8000/api`. Có thể đặt `VITE_API_URL` trong `Django_08/frontend/.env` để đổi địa chỉ API.

## Chạy backend Django API

mở cái terminal mới oánh mấy lệnh này dô :

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Các luồng API chính gồm đăng ký/đăng nhập và hồ sơ tại `/api/auth/`, danh mục và mô hình tại `/api/categories/` và `/api/models/`, tải mô hình lên khi đăng nhập, checkout/lịch sử đơn hàng tại `/api/payments/`, và tải xuống/lịch sử tải tại `/api/downloads/`. Danh sách mô hình hỗ trợ tìm kiếm theo `search`, lọc theo `category` (slug) và `price=free|paid`.

Tạo tài khoản quản trị bằng `python manage.py createsuperuser`. Các file trong `MEDIA_ROOT` chỉ nên được phục vụ trực tiếp trong môi trường phát triển; cần cấu hình storage riêng trước khi triển khai.
