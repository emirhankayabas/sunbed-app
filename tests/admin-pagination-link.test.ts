import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getAdminSunbedsPaginationLink } from "@/lib/admin-pagination-link";

describe("admin sunbed pagination links", () => {
  it("keeps the current scroll position when changing pages", () => {
    assert.deepEqual(getAdminSunbedsPaginationLink(3), {
      href: "/admin?sunbedsPage=3",
      scroll: false,
    });
  });
});
