
import "server-only";

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { scryptSync, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "aurelia_admin_session";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("Admin session secret is not configured securely.");
  }

  return new TextEncoder().encode(secret);
}

export function verifyAdminPassword(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH;

  if (!stored || !password) {
    return false;
  }

  const parts = stored.split(":");

  if (parts.length !== 2) {
    return false;
  }

  const [salt, expectedHex] = parts;

  try {
    const expected = Buffer.from(expectedHex, "hex");

    if (expected.length !== 64) {
      return false;
    }

    const actual = scryptSync(password, salt, 64);

    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE)?.value;

    if (!token) {
      return false;
    }

    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });

    return payload.role === "admin";
  } catch {
    return false;
  }
}
