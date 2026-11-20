
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
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

const allowedStatuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// GET - View customer orders and purchased items

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  try {
    const sql = getDatabase();

    const orders = await sql`
      SELECT
        o.id,
        o.customer_id,
        o.customer_name,
        o.customer_email,
        o.shipping_address,
        o.total_amount,
        o.status,
        o.payment_status,
        o.created_at,
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'subtotal', oi.subtotal
              )
              ORDER BY oi.id
            )
            FROM order_items AS oi
            WHERE oi.order_id = o.id
          ),
          '[]'::json
        ) AS items
      FROM orders AS o
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT 100
    `;

    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        orders,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Admin GET orders error:", error);

    return errorResponse(
      "Unable to load customer orders.",
      500
    );
  }
}

// PUT - Update order status

export async function PUT(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return unauthorized();
  }

  try {
    const body = await request.json();

    const id = Number(body?.id);
    const status = body?.status;

    if (!Number.isSafeInteger(id) || id <= 0) {
      return errorResponse("Invalid order ID.", 400);
    }

    if (
      typeof status !== "string" ||
      !allowedStatuses.includes(status)
    ) {
      return errorResponse(
        "Please select a valid order status.",
        400
      );
    }

    const sql = getDatabase();

    const result = await sql`
      UPDATE orders
      SET status = ${status}
      WHERE id = ${id}
      RETURNING
        id,
        customer_name,
        customer_email,
        total_amount,
        status,
        payment_status,
        created_at
    `;

    if (result.length === 0) {
      return errorResponse("Order not found.", 404);
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully.",
      order: result[0],
    });
  } catch (error) {
    console.error("Admin PUT order error:", error);

    return errorResponse(
      "Unable to update order status.",
      500
    );
  }
}
