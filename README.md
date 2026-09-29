

## nhớ cài mấy này nha

- Node.js 18+ ,npm
- Python 3.10+

trước khi chạy file nhớ tạo môi trường ảo rồi mới chạy 
## chạy front end frontend

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The interface includes demo artwork immediately and quietly falls back to the built-in sample cards if the API is offline. To set a custom API URL, create `frontend/.env` with `VITE_API_URL=http://127.0.0.1:8000/api/models/`.
end
## chạy backend Django API

mở cái terminal mới oánh mấy lệnh này dô :

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
python manage.py makemigrations library
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

API routes:
dô
- `GET /api/models/` — paginated model catalog; supports `?search=`, `?category=architecture`, `?featured=true`, and `?ordering=-likes`
- `GET /api/models/{slug}/` — model details
- `GET /api/models/trending/` — top models by likes and views
- `GET /api/categories/` and `GET /api/collections/`
- Django admin: `http://127.0.0.1:8000/admin/`

Create an admin account with `python manage.py createsuperuser`. Model uploads and user accounts are intentionally left for a later authenticated creator workflow; the current upload button is a front-end onboarding placeholder. Replace the local development `SECRET_KEY`, disable `DEBUG`, and configure production hosts/storage before deployment.
