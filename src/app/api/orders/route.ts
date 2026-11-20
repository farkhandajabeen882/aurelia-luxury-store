
import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";


type OrderItemInput = {
  productId: number;
  quantity: number;
};

type CustomerInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

type ShippingInput = {
  address: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
};

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

function getText(value: unknown, maximumLength: number) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maximumLength + 1);
}

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function validateCustomer(value: unknown): CustomerInput {
  if (!isObject(value)) {
    throw new Error("Customer information is required.");
  }

  const firstName = getText(value.firstName, 100);
  const lastName = getText(value.lastName, 100);
  const email = getText(value.email, 255).toLowerCase();
  const phone = getText(value.phone, 30);

  if (
    !firstName ||
    !lastName ||
    firstName.length > 100 ||
    lastName.length > 100
  ) {
    throw new Error("Please enter your full name.");
  }

  if (
    email.length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    throw new Error("Please enter a valid email address.");
  }

  if (!phone || phone.length > 30) {
    throw new Error("Please enter a valid phone number.");
  }

  return {
    firstName,
    lastName,
    email,
    phone,
  };
}

function validateShipping(value: unknown): ShippingInput {
  if (!isObject(value)) {
    throw new Error("Delivery information is required.");
  }

  const shipping: ShippingInput = {
    address: getText(value.address, 250),
    apartment: getText(value.apartment, 100),
    city: getText(value.city, 120),
    state: getText(value.state, 120),
    postalCode: getText(value.postalCode, 20),
    country: getText(value.country, 120),
    notes: getText(value.notes, 1000),
  };

  if (
    !shipping.address ||
    !shipping.city ||
    !shipping.state ||
    !shipping.postalCode ||
    !shipping.country
  ) {
    throw new Error("Please complete your delivery address.");
  }

  if (
    shipping.address.length > 250 ||
    shipping.apartment.length > 100 ||
    shipping.city.length > 120 ||
    shipping.state.length > 120 ||
    shipping.postalCode.length > 20 ||
    shipping.country.length > 120 ||
    shipping.notes.length > 1000
  ) {
    throw new Error("One or more delivery fields are too long.");
  }

  return shipping;
}

function validateItems(value: unknown): OrderItemInput[] {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.length > 50
  ) {
    throw new Error(
      "Please select between 1 and 50 products."
    );
  }

  const items: OrderItemInput[] = [];
  const uniqueProducts = new Set<number>();

  for (const item of value) {
    if (!isObject(item)) {
      throw new Error("Invalid shopping bag item.");
    }

    const productId = item.productId;
    const quantity = item.quantity;

    if (
      typeof productId !== "number" ||
      !Number.isSafeInteger(productId) ||
      productId <= 0 ||
      typeof quantity !== "number" ||
      !Number.isSafeInteger(quantity) ||
      quantity < 1 ||
      quantity > 1000
    ) {
      throw new Error("Invalid product or quantity.");
    }

    if (uniqueProducts.has(productId)) {
      throw new Error("Duplicate products are not allowed.");
    }

    uniqueProducts.add(productId);

    items.push({
      productId,
      quantity,
    });
  }

  return items;
}

export async function POST(request: NextRequest) {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      console.error("Orders API: DATABASE_URL is missing.");

      return errorResponse(
        "Database connection is not configured.",
        500
      );
    }

    const body: unknown = await request.json();

    if (!isObject(body)) {
      return errorResponse("Invalid checkout information.");
    }

    if (body.paymentMethod !== "demo") {
      return errorResponse(
        "Only demo checkout is supported."
      );
    }

    const customer = validateCustomer(body.customer);
    const shipping = validateShipping(body.shipping);
    const items = validateItems(body.items);

    const fullName =
      `${customer.firstName} ${customer.lastName}`.trim();

    const shippingAddress = [
      shipping.address,
      shipping.apartment,
      shipping.city,
      shipping.state,
      shipping.postalCode,
      shipping.country,
      shipping.notes
        ? `Notes: ${shipping.notes}`
        : "",
    ]
      .filter(Boolean)
      .join(", ");

    const itemsJson = JSON.stringify(
      items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      }))
    );

    const sql = neon(databaseUrl);

    /*
      This is a demo-order transaction expressed as one
      PostgreSQL statement.

      Product prices and stock are checked in NeonDB.
      The browser's displayed prices are never trusted.

      Product rows are locked during the stock check.
      Orders and order items are inserted using the
      database's current product information.

      No real payment or delivery is processed.
    */

    const result = await sql`
      WITH
      requested AS MATERIALIZED (
        SELECT
          product_id,
          quantity
        FROM jsonb_to_recordset(
          ${itemsJson}::jsonb
        ) AS input_items(
          product_id INTEGER,
          quantity INTEGER
        )
      ),

      locked_products AS MATERIALIZED (
        SELECT
          p.id,
          p.name,
          p.price,
          p.stock_quantity
        FROM products AS p
        INNER JOIN requested AS r
          ON r.product_id = p.id
        WHERE p.is_active = TRUE
        ORDER BY p.id
        FOR UPDATE OF p
      ),

      availability AS MATERIALIZED (
        SELECT
          (
            (
              SELECT COUNT(*)
              FROM requested
            ) = (
              SELECT COUNT(*)
              FROM locked_products
            )
          )
          AND NOT EXISTS (
            SELECT 1
            FROM requested AS r
            INNER JOIN locked_products AS p
              ON p.id = r.product_id
            WHERE
              p.stock_quantity < r.quantity
              OR p.price < 0
          ) AS is_available
      ),

      new_customer AS (
        INSERT INTO customers (
          full_name,
          email,
          phone
        )
        SELECT
          ${fullName},
          ${customer.email},
          ${customer.phone}
        WHERE (
          SELECT is_available
          FROM availability
        )
        RETURNING id
      ),

      updated_stock AS (
        UPDATE products AS p
        SET
          stock_quantity =
            p.stock_quantity - r.quantity,
          updated_at = NOW()
        FROM
          requested AS r,
          new_customer AS c
        WHERE
          p.id = r.product_id
          AND p.is_active = TRUE
          AND p.stock_quantity >= r.quantity
        RETURNING p.id
      ),

      new_order AS (
        INSERT INTO orders (
          customer_id,
          customer_name,
          customer_email,
          shipping_address,
          total_amount,
          status,
          payment_status
        )
        SELECT
          c.id,
          ${fullName},
          ${customer.email},
          ${shippingAddress},
          (
            SELECT
              COALESCE(
                SUM(
                  p.price * r.quantity
                ),
                0
              )
            FROM requested AS r
            INNER JOIN locked_products AS p
              ON p.id = r.product_id
          ),
          'pending',
          'unpaid'
        FROM new_customer AS c
        WHERE (
          SELECT COUNT(*)
          FROM updated_stock
        ) = (
          SELECT COUNT(*)
          FROM requested
        )
        RETURNING
          id,
          total_amount
      ),

      inserted_items AS (
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          quantity,
          unit_price
        )
        SELECT
          o.id,
          p.id,
          p.name,
          r.quantity,
          p.price
        FROM new_order AS o
        CROSS JOIN requested AS r
        INNER JOIN locked_products AS p
          ON p.id = r.product_id
        RETURNING id
      )

      SELECT
        o.id,
        o.total_amount,
        (
          SELECT COUNT(*)
          FROM inserted_items
        ) AS saved_item_count
      FROM new_order AS o
    `;

    if (result.length === 0) {
      return errorResponse(
        "One or more products are unavailable or have insufficient stock. Please return to the shop and refresh your bag.",
        409
      );
    }

    const order = result[0];

    const orderId = Number(order.id);

    const orderNumber =
      `AUR-${String(orderId).padStart(6, "0")}`;

    return NextResponse.json(
      {
        success: true,
        message: "Demo order placed successfully.",
        orderId,
        orderNumber,
        total: Number(order.total_amount),
        paymentStatus: "unpaid",
        orderStatus: "pending",
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    if (error instanceof Error) {
      const validationMessages = [
        "Customer information",
        "Please enter",
        "Delivery information",
        "Please complete",
        "One or more delivery",
        "Please select",
        "Invalid shopping bag",
        "Invalid product",
        "Duplicate products",
      ];

      if (
        validationMessages.some((message) =>
          error.message.startsWith(message)
        )
      ) {
        return errorResponse(error.message, 400);
      }
    }

    console.error("AURELIA Orders API error:", error);

    return errorResponse(
      "Unable to place the demo order. Please try again.",
      500
    );
  }
}
