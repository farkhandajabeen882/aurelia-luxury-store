import "server-only";

import { cookies } from "next/headers";
import { connection } from "next/server";

import {
  createHmac,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export const ADMIN_COOKIE = "aurelia_admin_session";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("Admin session secret is not configured securely.");
  }

  return secret;
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

function signPayload(payload: string): string {
  return createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

export async function createAdminToken(): Promise<string> {
  const payload = Buffer.from(
    JSON.stringify({
      role: "admin",
      exp: Date.now() + 8 * 60 * 60 * 1000,
    })
  ).toString("base64url");

  const signature = signPayload(payload);

  return `${payload}.${signature}`;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  await connection();

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!token) {
    return false;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 2) {
      return false;
    }

    const [payload, signature] = parts;

    const expected = Buffer.from(
      signPayload(payload),
      "base64url"
    );

    const actual = Buffer.from(signature, "base64url");

    if (actual.length !== expected.length) {
      return false;
    }

    if (!timingSafeEqual(actual, expected)) {
      return false;
    }

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );

    return (
      data.role === "admin" &&
      typeof data.exp === "number" &&
      data.exp > Date.now()
    );
  } catch {
    return false;
  }
}