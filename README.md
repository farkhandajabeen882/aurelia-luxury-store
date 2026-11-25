# AURELIA Luxury E-Commerce Website

## Project Overview

AURELIA is a dynamic e-commerce website developed using Next.js and NeonDB PostgreSQL.

The website separates public product viewing from secure administrative product management.

## Technologies Used

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- NeonDB PostgreSQL
- Node.js Crypto
- REST API
- GitHub
- Vercel

## Public Features

- View products without logging in.
- Browse product categories.
- View product names, prices and descriptions.
- Read active product records from NeonDB.

## Admin Features

- Username and password authentication.
- Show and hide password functionality.
- Secure administrator dashboard.
- Add new products.
- Edit existing products.
- Remove products from the public storefront.
- Manage product inventory.
- Logout functionality.

## Authentication and Authorization

Admin credentials are configured using server-side environment variables.

Passwords are verified using scrypt hashing.

Successful authentication creates a signed, HTTP-only session cookie using built-in Node.js Crypto.

The session expires after eight hours.

All administrative product API operations require a valid admin session.

Unauthorized requests return HTTP 401 Unauthorized.

## Installation and Setup

1. Clone the GitHub repository.
2. Open the project folder in VS Code.
3. Install the required dependencies:

```bash
npm install
```

4. Create a NeonDB PostgreSQL database.
5. Configure the database schema and environment variables.
6. Start the development server:

```bash
npm run dev
```

For Windows PowerShell, if necessary:

```bash
npm.cmd run dev
```

Open http://localhost:3000 in your browser.

## Environment Variables

Create a `.env.local` file in the project root.

Required environment variable names:

- DATABASE_URL
- ADMIN_USERNAME
- ADMIN_PASSWORD_HASH
- ADMIN_SESSION_SECRET

ADMIN_PASSWORD_HASH uses the salt:hex_hash format generated using Node.js scrypt with a 64-byte output.

ADMIN_SESSION_SECRET must contain a securely generated secret of at least 32 characters.

Actual credentials and secret values must never be committed to GitHub.

## Website Routes

- `/` - Public storefront
- `/admin` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/api/products` - Public read-only products API
- `/api/admin/login` - Admin authentication
- `/api/admin/logout` - Admin logout
- `/api/admin/products` - Protected products API

## API Methods

| Method | Purpose | Access |
|--------|---------|--------|
| GET | View public products | Public |
| GET | View admin products | Admin |
| POST | Add product | Admin |
| PUT | Edit product | Admin |
| DELETE | Archive product | Admin |

## Database SQL Schema

The application uses six tables in NeonDB PostgreSQL.

The following SQL documents the column structure exported from the existing database.

### Categories Table

```sql
CREATE TABLE categories (
    id SERIAL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Products Table

```sql
CREATE TABLE products (
    id SERIAL,
    category_id INTEGER,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    old_price NUMERIC,
    image_url TEXT,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    badge VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Customers Table

```sql
CREATE TABLE customers (
    id SERIAL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(40),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Orders Table

```sql
CREATE TABLE orders (
    id SERIAL,
    customer_id INTEGER,
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    shipping_address TEXT,
    total_amount NUMERIC NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    payment_status VARCHAR(30) NOT NULL DEFAULT 'unpaid',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Order Items Table

```sql
CREATE TABLE order_items (
    id SERIAL,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC NOT NULL,
    subtotal NUMERIC
);
```

### Inventory Movements Table

```sql
CREATE TABLE inventory_movements (
    id SERIAL,
    product_id INTEGER NOT NULL,
    quantity_change INTEGER NOT NULL,
    reason VARCHAR(200) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Schema Note

The SQL definitions document the verified database column names, data types, character lengths, nullability and default values.

Primary keys, foreign keys, unique constraints, numeric precision and generated column expressions require separate verification before using these definitions to recreate the database.

## Database Operations

- SELECT: Retrieve database records.
- INSERT: Add new products.
- UPDATE: Edit existing products.
- Soft DELETE: Archive products using is_active.

Archived products remain in the database but are excluded from the public storefront.

Public product visitors cannot modify product records.

Administrative write operations require a valid signed session cookie.

## Testing Results

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
| Unauthorized POST request | 401 Passed |
| Unauthorized PUT request | 401 Passed |
| Unauthorized DELETE request | 401 Passed |

## Deployment

The application uses Vercel for deployment.

### Live Website

https://aurelia-luxury-store-i5ns.vercel.app/

### Admin Login

https://aurelia-luxury-store-i5ns.vercel.app/admin

### GitHub Repository

https://github.com/farkhandajabeen882/aurelia-luxury-store

## Security

Database credentials, password hashes and session secrets are kept on the server.

The `.env.local` file must not be submitted or uploaded to GitHub.

## Conclusion

AURELIA demonstrates a database-powered Next.js website with public product viewing, administrator authentication, server-side authorization, secure session management and persistent database operations.