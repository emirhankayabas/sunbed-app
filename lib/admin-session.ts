import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import {
  adminSessionCookieName,
  signAdminSession,
  verifyAdminSession,
} from "@/lib/admin-auth";

const sessionMaxAgeSeconds = 8 * 60 * 60;

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD;
}

export function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET;
}

export function isAdminTokenValid(token: string | undefined) {
  return verifyAdminSession({
    token,
    secret: getAdminSessionSecret(),
  }).valid;
}

export function isAdminRequestAuthenticated(request: NextRequest) {
  return isAdminTokenValid(request.cookies.get(adminSessionCookieName)?.value);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return isAdminTokenValid(cookieStore.get(adminSessionCookieName)?.value);
}

export async function setAdminSessionCookie() {
  const secret = getAdminSessionSecret();

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET must be set in .env.");
  }

  const expiresAt = new Date(Date.now() + sessionMaxAgeSeconds * 1000);
  const cookieStore = await cookies();

  cookieStore.set(adminSessionCookieName, signAdminSession({ secret, expiresAt }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(adminSessionCookieName);
}
