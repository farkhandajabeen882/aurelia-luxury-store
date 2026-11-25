# AURELIA Luxury E-Commerce Website

## Project Overview

AURELIA is a dynamic database-powered e-commerce website developed using Next.js and NeonDB PostgreSQL. It separates public product viewing from secure administrative product management.

## Technologies Used

- Next.js App Router
- React and TypeScript
- Tailwind CSS
- NeonDB PostgreSQL
- Node.js Crypto
- REST API
- GitHub and Vercel

## Public Features

- View products without logging in.
- Browse product categories.
- View product names, descriptions and prices.
- Load active products from NeonDB.

## Admin Features

- Username and password authentication.
- Show/hide password functionality.
- Administrator dashboard.
- Add, edit and remove products.
- Inventory management.
- Persistent database records.
- Logout functionality.

## Authentication and Authorization

Admin credentials are configured using server-side environment variables.

Passwords are verified using scrypt hashing.

Successful login creates an HTTP-only session cookie signed using the built-in Node.js HMAC-SHA256 algorithm.

The session expires after eight hours.

Administrative product API operations require a valid admin session.

Unauthorized requests return HTTP 401 Unauthorized.

## Installation and Setup

1. Clone the GitHub repository.
2. Open the project folder in VS Code.
3. Install dependencies:

```bash
npm install
```

4. Create a NeonDB PostgreSQL database.
5. Create the tables using the SQL schema below.
6. Insert the required product categories.
7. Configure the environment variables.
8. Run the development server:

```bash
npm run dev
```

For Windows PowerShell:

```bash
npm.cmd run dev
```

Open http://localhost:3000 in your browser.

## Environment Variables

Create a `.env.local` file in the project root.

Required variable names:

- DATABASE_URL
- ADMIN_USERNAME
- ADMIN_PASSWORD_HASH
- ADMIN_SESSION_SECRET

The password hash uses the salt:hex_hash format generated using Node.js scrypt with a 64-byte output.

The session secret must be securely generated and contain at least 32 characters.

Actual credentials must never be committed to GitHub.

## Website Routes

| Route | Purpose |
|-------|---------|
| / | Public storefront |
| /admin | Admin login |
| /admin/dashboard | Admin dashboard |
| /api/products | Public products API |
| /api/admin/login | Admin authentication |
| /api/admin/logout | Admin logout |
| /api/admin/products | Protected products API |

## API Operations

| Method | Purpose | Access |
|--------|---------|--------|
| GET | View public products | Public |
| GET | View admin products | Admin |
| POST | Add product | Admin |
| PUT | Edit product | Admin |
| DELETE | Archive product | Admin |

## Database SQL Schema

The following definitions are based on the verified NeonDB column metadata, constraints, numeric precision and generated column expressions.

### Categories Table

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Customers Table

```sql
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(40),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Products Table

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES categories(id)
        ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL
        CHECK (price >= 0),
    old_price NUMERIC(10,2)
        CHECK (old_price IS NULL OR old_price >= 0),
    image_url TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (stock_quantity >= 0),
    badge VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Orders Table

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id)
        ON DELETE SET NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    shipping_address TEXT,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0
        CHECK (total_amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled'
        )),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid'
        CHECK (payment_status IN (
            'unpaid',
            'paid',
            'refunded'
        )),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Order Items Table

```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id)
        ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id)
        ON DELETE SET NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL
        CHECK (unit_price >= 0),
    subtotal NUMERIC(12,2)
        GENERATED ALWAYS AS
        (quantity::numeric * unit_price) STORED
);
```

### Inventory Movements Table

```sql
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id)
        ON DELETE CASCADE,
    quantity_change INTEGER NOT NULL,
    reason VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Initial Product Categories

```sql
INSERT INTO categories (name, slug)
VALUES
    ('Fragrance', 'fragrance'),
    ('Skincare', 'skincare'),
    ('Makeup', 'makeup')
ON CONFLICT (slug) DO NOTHING;
```

## Database Operations

- SELECT: Retrieve records.
- INSERT: Add products.
- UPDATE: Edit products.
- Soft DELETE: Archive products.

Archived products remain in the database but are excluded from the public storefront.

## Local Testing Results

| Test | Result |
|------|--------|
| Public website access | Passed |
| Correct admin login | Passed |
| Incorrect credentials rejection | Passed |
| Admin dashboard access protection | Passed |
| Add product | Passed |
| Edit product | Passed |
| Remove product | Passed |
| Data persistence after refresh | Passed |
| Logout | Passed |
| Unauthorized POST | HTTP 401 Passed |
| Unauthorized PUT | HTTP 401 Passed |
| Unauthorized DELETE | HTTP 401 Passed |
| Production build | Passed |

## Deployment

Live Website:

https://aurelia-luxury-store-i5ns.vercel.app/

Admin Login:

https://aurelia-luxury-store-i5ns.vercel.app/admin

GitHub Repository:

https://github.com/farkhandajabeen882/aurelia-luxury-store

## Security

Database credentials, password hashes and session secrets are stored on the server.

The `.env.local` file must not be submitted or uploaded to GitHub.

## Conclusion

AURELIA demonstrates dynamic database integration, public product viewing, administrator authentication, server-side authorization, secure session management and persistent database operations.