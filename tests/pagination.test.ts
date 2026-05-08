import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { paginateItems } from "@/lib/pagination";

describe("pagination", () => {
  it("returns the requested page and clamps out-of-range page numbers", () => {
    const items = Array.from({ length: 21 }, (_, index) => index + 1);

    assert.deepEqual(paginateItems(items, 2, 8), {
      items: [9, 10, 11, 12, 13, 14, 15, 16],
      page: 2,
      pageSize: 8,
      totalItems: 21,
      totalPages: 3,
      hasPrevious: true,
      hasNext: true,
    });

    assert.equal(paginateItems(items, 99, 8).page, 3);
    assert.equal(paginateItems(items, 0, 8).page, 1);
  });
});
