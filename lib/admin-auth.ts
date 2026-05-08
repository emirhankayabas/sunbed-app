import { createHmac, timingSafeEqual } from "node:crypto";

const separator = ".";

type SignAdminSessionInput = {
  secret: string;
  expiresAt: Date;
};

type VerifyAdminSessionInput = {
  token: string | undefined;
  secret: string | undefined;
  now?: Date;
};

type VerifyAdminSessionResult = {
  valid: boolean;
  expiresAt?: Date;
};

export const adminSessionCookieName = "sunbed_admin_session";

export function signAdminSession({
  secret,
  expiresAt,
}: SignAdminSessionInput) {
  const payload = base64UrlEncode(
    JSON.stringify({ expiresAt: expiresAt.toISOString() }),
  );
  const signature = signPayload(payload, secret);

  return `${payload}${separator}${signature}`;
}

export function verifyAdminSession({
  token,
  secret,
  now = new Date(),
}: VerifyAdminSessionInput): VerifyAdminSessionResult {
  if (!token || !secret) {
    return { valid: false };
  }

  const [payload, signature, extra] = token.split(separator);
  if (!payload || !signature || extra !== undefined) {
    return { valid: false };
  }

  const expectedSignature = signPayload(payload, secret);
  if (!safeEqual(signature, expectedSignature)) {
    return { valid: false };
  }

  try {
    const decoded = JSON.parse(base64UrlDecode(payload)) as {
      expiresAt?: string;
    };
    if (!decoded.expiresAt) {
      return { valid: false };
    }

    const expiresAt = new Date(decoded.expiresAt);
    if (Number.isNaN(expiresAt.valueOf()) || expiresAt <= now) {
      return { valid: false };
    }

    return { valid: true, expiresAt };
  } catch {
    return { valid: false };
  }
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}
