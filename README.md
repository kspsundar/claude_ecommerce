# MarketPlace — Multi-vendor E-commerce (Node.js + EJS + REST API)

A core-MVP multi-vendor marketplace: buyers, sellers, and an admin, built with
Express, EJS (server-rendered UI) and SQLite (via Sequelize), plus a parallel
JSON REST API secured with JWT.

## Stack

- **Server**: Node.js, Express
- **Views**: EJS + express-ejs-layouts, Bootstrap 5 (CDN)
- **Database**: SQLite via Sequelize ORM
- **Web auth**: session cookies (`express-session`)
- **API auth**: JWT bearer tokens
- **File uploads**: Multer (product images, seller KYC documents)

## Features included (Core MVP)

- Registration/login (buyer & seller), roles: buyer / seller / admin
- Seller onboarding with admin approval workflow
- Seller dashboard (products, orders, revenue)
- Product catalogue: categories/subcategories, images, stock, admin moderation
- Search, category filter, price filter, sorting, pagination
- Cart, multi-seller checkout (one order split into per-seller sub-orders)
- Saved addresses
- Order lifecycle (placed → confirmed → shipped → delivered → completed / cancelled)
  tracked per seller sub-order and rolled up to the overall order
- Order cancellation (restocks items)
- Admin panel: dashboard/GMV, user ban/unban, seller approval, product
  moderation, category management, order overview

**Deferred / stubbed** (flagged in the original spec as out of scope for this
first build): real payment gateway integration, shipping carrier APIs, coupons
& marketing tools, reviews/ratings, notifications (email/SMS/push), search
engine (Elasticsearch/Algolia), analytics/BI integrations, OAuth login.

## Getting started

```bash
npm install
npm run seed   # creates the SQLite DB and demo data (drops existing data)
npm run dev    # or: npm start
```

The app runs at `http://localhost:3000`.

### Demo accounts (created by `npm run seed`)

| Role   | Email                | Password   |
|--------|-----------------------|------------|
| Admin  | admin@example.com     | Admin123!  |
| Seller | seller@example.com    | Seller123! |
| Buyer  | buyer@example.com     | Buyer123!  |

## Project structure

```
config/       Sequelize/SQLite setup
models/       Sequelize models + associations
services/     Business logic shared by web controllers and API controllers
middleware/   Session auth, JWT auth, file upload, error handling
controllers/
  web/        Renders EJS views (session-based)
  api/        Returns JSON (JWT-based)
routes/
  web/        Server-rendered app routes ("/")
  api/        REST API routes ("/api/v1")
views/        EJS templates
public/       Static assets (css, uploaded images)
seed/         Database seed script
```

## REST API (`/api/v1`)

All authenticated endpoints expect `Authorization: Bearer <token>`.

- `POST /api/v1/auth/register` — `{ name, email, password, role? }` → `{ token, user }`
- `POST /api/v1/auth/login` — `{ email, password }` → `{ token, user }`
- `GET  /api/v1/auth/me` — current user
- `GET  /api/v1/products` — query: `q, category, minPrice, maxPrice, sort, page`
- `GET  /api/v1/products/:slug`
- `POST /api/v1/products` — seller only, must be approved
- `PUT  /api/v1/products/:id` — owning seller only
- `DELETE /api/v1/products/:id` — owning seller only
- `GET  /api/v1/categories`
- `GET  /api/v1/cart` / `POST /api/v1/cart` / `PUT /api/v1/cart/:id` / `DELETE /api/v1/cart/:id`
- `POST /api/v1/orders` — checkout, `{ addressId? }`
- `GET  /api/v1/orders` / `GET /api/v1/orders/:id`
- `POST /api/v1/orders/:id/cancel`

## Notes

- Product and seller applications must be **admin-approved** before they go
  live — this mirrors the "Seller Onboarding" / "Product Approval Workflow"
  requirements in the spec.
- A single buyer `Order` is split into one `OrderItem` sub-order per seller,
  each with its own status, so sellers only manage their own line items while
  the buyer sees one consolidated order.
- `.env` holds secrets (session/JWT) and the SQLite file path — change them
  before deploying anywhere real.
