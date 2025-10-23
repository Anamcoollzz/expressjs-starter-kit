# Express Mahasiswa API (TS + EJS + Sequelize)

Fitur:
- Auth JWT (login, register)
- CRUD Mahasiswa
- i18n (en/id) dengan middleware
- Signed URL helper (untuk unduhan/verifikasi)
- Search Builder (filter, sort, paginate via query string)
- Admin UI (EJS + Bootstrap) + session
- Migrations & Seeders (sequelize-cli)
- TypeScript + ts-node-dev

## Quick Start

```bash
cp .env.example .env
# Sesuaikan koneksi database di .env
npm install

# Siapkan DB kosong sesuai .env (default: MySQL "mahasiswa_db")
npx sequelize db:migrate
npx sequelize db:seed:all

# Run dev
npm run dev
# App: http://localhost:3000
# Admin: http://localhost:3000/admin
```

### Akun admin default
- email: admin@example.com
- password: password

### Endpoints (ringkas)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/mahasiswa` (query: `q`, `sort`, `order`, `page`, `limit`)
- `POST /api/mahasiswa`
- `GET /api/mahasiswa/:id`
- `PUT /api/mahasiswa/:id`
- `DELETE /api/mahasiswa/:id`

Admin UI:
- `/admin` dashboard
- `/admin/mahasiswa` list + create + edit + delete

Signed URL example:
- `/api/mahasiswa/:id/signed-download?sig=...&exp=...`

## Struktur
- `src/app.ts` mengkonfigurasi Express, i18n, session, views, routes
- `src/models/*` Sequelize models
- `src/controllers/*` logic
- `src/utils/*` signed url & search builder
- `src/middleware/*` auth jwt, i18n, error handler

## Ganti ke Postgres
- Ubah `DB_DIALECT=postgres` dan pasang `pg` + `pg-hstore` jika diperlukan
- Update port/host user pass di `.env`
```

