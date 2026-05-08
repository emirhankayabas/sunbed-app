import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { signAdminSession, verifyAdminSession } from "@/lib/admin-auth";

describe("admin auth session", () => {
  it("verifies a token signed with the same secret before it expires", () => {
    const token = signAdminSession({
      secret: "strong-secret",
      expiresAt: new Date("2026-05-04T12:30:00.000Z"),
    });

    const result = verifyAdminSession({
      token,
      secret: "strong-secret",
      now: new Date("2026-05-04T12:00:00.000Z"),
    });

    assert.equal(result.valid, true);
  });

  it("rejects expired, tampered, and wrong-secret tokens", () => {
    const token = signAdminSession({
      secret: "strong-secret",
      expiresAt: new Date("2026-05-04T12:30:00.000Z"),
    });

    assert.equal(
      verifyAdminSession({
        token,
        secret: "strong-secret",
        now: new Date("2026-05-04T13:00:00.000Z"),
      }).valid,
      false,
    );
    assert.equal(
      verifyAdminSession({
        token: `${token.slice(0, -2)}xx`,
        secret: "strong-secret",
        now: new Date("2026-05-04T12:00:00.000Z"),
      }).valid,
      false,
    );
    assert.equal(
      verifyAdminSession({
        token,
        secret: "different-secret",
        now: new Date("2026-05-04T12:00:00.000Z"),
      }).valid,
      false,
    );
  });
});
