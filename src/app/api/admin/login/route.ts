
import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_COOKIE,
  createAdminToken,
  verifyAdminPassword,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const password = body?.password;

    if (
      typeof password !== "string" ||
      password.length === 0 ||
      password.length > 1024
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid password.",
        },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid admin credentials.",
        },
        { status: 401 }
      );
    }

    const token = await createAdminToken();

    const response = NextResponse.json({
      success: true,
      message: "Admin login successful.",
    });

    response.cookies.set({
      name: ADMIN_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to process admin login.",
      },
      { status: 500 }
    );
  }
}
