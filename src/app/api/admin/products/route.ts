
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import { isAdminAuthenticated } from "@/lib/admin-auth";

function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return neon(databaseUrl);
}

function unauthorized() {
  return NextResponse.json(
    {
      success: false,
      message: "Admin login required.",
    },
    { status: 401 }
  );
}

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

function getId(value: unknown): number | null {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function slugify(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "product";
}

function validateProduct(body: Record<string, unknown>) {
  const name =
    typeof body.name === "string"
      ? body.name.trim()
      : "";

  const description =
    typeof body.description === "string"
      ? body.description.trim()
      : "";

  const category =
    typeof body.category === "string"
      ? body.category.trim()
      : "";

  const imageUrl =
    typeof body.image_url === "string"
      ? body.image_url.trim()
      : "";

  const badge =
    typeof body.badge === "string"
      ? body.badge.trim()
      : "";

  const price = Number(body.price);
  const stock = Number(body.stock_quantity);

  if (!name || name.length > 200) {
    throw new Error("Please enter a valid product name.");
  }

  if (!description || description.length > 5000) {
    throw new Error("Please enter a valid product description.");
  }

  if (
    !["Fragrance", "Skincare", "Makeup"].includes(category)
  ) {
    throw new Error("Please select a valid product category.");
  }

  if (
    body.price === "" ||
    body.price === null ||
    body.price === undefined ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 99999999
  ) {
    throw new Error("Please enter a valid product price.");
  }

  if (
    body.stock_quantity === "" ||
    body.stock_quantity === null ||
    body.stock_quantity === undefined ||
    !Number.isSafeInteger(stock) ||
    stock < 0 ||
    stock > 1000000
  ) {
    throw new Error("Please enter a valid stock quantity.");
  }

  if (badge.length > 100) {
    throw new Error("Product badge is too long.");
  }

  if (imageUrl.length > 2000) {
    throw new Error("Image URL is too long.");
  }

  if (imageUrl) {
    try {
      const parsed = new URL(imageUrl);

      if (
        parsed.protocol !== "https:" ||
        parsed.username ||
        parsed.password
      ) {
        throw new Error("Invalid image URL.");
      }
    } catch {
      throw new Error("Please enter a valid HTTPS image URL.");
    }
  }

  return {
    name,
    description,
    category,
    price: Math.round(price * 100) / 100,
    stock,
    imageUrl: imageUrl || null,
    badge: badge || null,
    isFeatured: body.is_featured === true,
  };
}

// GET - Load all products for authenticated admin

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  try {
    const sql = getDatabase();

    const products = await sql`
      SELECT
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.old_price,
        p.image_url,
        p.stock_quantity,
        p.badge,
        p.is_featured,
        p.is_active,
        c.name AS category
      FROM products AS p
      LEFT JOIN categories AS c
        ON p.category_id = c.id
      ORDER BY p.id DESC
    `;

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Admin GET products error:", error);

    return errorResponse(
      "Unable to load products from NeonDB.",
      500
    );
  }
}

// POST - Add a new product

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const data = validateProduct(body);
    const sql = getDatabase();

    const categories = await sql`
      SELECT id
      FROM categories
      WHERE LOWER(name) = LOWER(${data.category})
      LIMIT 1
    `;

    if (categories.length === 0) {
      return errorResponse("Product category not found.", 400);
    }

    const categoryId = Number(categories[0].id);

    const slug = `${slugify(data.name)}-${randomUUID().slice(0, 8)}`;

    const result = await sql`
      INSERT INTO products (
        category_id,
        name,
        slug,
        description,
        price,
        image_url,
        stock_quantity,
        badge,
        is_featured,
        is_active
      )
      VALUES (
        ${categoryId},
        ${data.name},
        ${slug},
        ${data.description},
        ${data.price},
        ${data.imageUrl},
        ${data.stock},
        ${data.badge},
        ${data.isFeatured},
        TRUE
      )
      RETURNING *
    `;

    return NextResponse.json(
      {
        success: true,
        message: "Product added successfully.",
        product: result[0],
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Please")
    ) {
      return errorResponse(error.message, 400);
    }

    console.error("Admin POST product error:", error);

    return errorResponse("Unable to add product.", 500);
  }
}

// PUT - Edit an existing product

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const id = getId(body.id);

    if (!id) {
      return errorResponse("Invalid product ID.", 400);
    }

    const data = validateProduct(body);
    const sql = getDatabase();

    const categories = await sql`
      SELECT id
      FROM categories
      WHERE LOWER(name) = LOWER(${data.category})
      LIMIT 1
    `;

    if (categories.length === 0) {
      return errorResponse("Product category not found.", 400);
    }

    const categoryId = Number(categories[0].id);

    const result = await sql`
      UPDATE products
      SET
        category_id = ${categoryId},
        name = ${data.name},
        description = ${data.description},
        price = ${data.price},
        image_url = ${data.imageUrl},
        stock_quantity = ${data.stock},
        badge = ${data.badge},
        is_featured = ${data.isFeatured},
        updated_at = NOW()
      WHERE id = ${id}
        AND is_active = TRUE
      RETURNING *
    `;

    if (result.length === 0) {
      return errorResponse("Active product not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      product: result[0],
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Please")
    ) {
      return errorResponse(error.message, 400);
    }

    console.error("Admin PUT product error:", error);

    return errorResponse("Unable to update product.", 500);
  }
}

// DELETE - Archive product without erasing its record

export async function DELETE(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  try {
    const body = await request.json();
    const id = getId(body.id);

    if (!id) {
      return errorResponse("Invalid product ID.", 400);
    }

    const sql = getDatabase();

    const result = await sql`
      UPDATE products
      SET
        is_active = FALSE,
        updated_at = NOW()
      WHERE id = ${id}
        AND is_active = TRUE
      RETURNING id
    `;

    if (result.length === 0) {
      return errorResponse("Active product not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Product removed from the storefront.",
    });
  } catch (error) {
    console.error("Admin DELETE product error:", error);

    return errorResponse("Unable to remove product.", 500);
  }
}
