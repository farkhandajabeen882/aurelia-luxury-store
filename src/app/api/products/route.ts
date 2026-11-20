
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// AURELIA - Public Products API
// Customers can view active products without admin login.

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection is not configured.",
        },
        { status: 500 }
      );
    }

    const sql = neon(databaseUrl);

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
        c.name AS category,
        c.slug AS category_slug
      FROM products AS p
      LEFT JOIN categories AS c
        ON p.category_id = c.id
      WHERE p.is_active = TRUE
      ORDER BY p.is_featured DESC, p.id ASC
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
    console.error("Public products API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load products from NeonDB.",
      },
      { status: 500 }
    );
  }
}
