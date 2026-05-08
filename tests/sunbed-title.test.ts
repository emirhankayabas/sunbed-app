import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createSunbedTitle,
  createSunbedTitles,
} from "@/lib/sunbed-title";

describe("sunbed auto titles", () => {
  it("creates simple sequential titles from sort order numbers", () => {
    assert.equal(createSunbedTitle(1), "Şezlong 1");
    assert.deepEqual(createSunbedTitles({ startSortOrder: 4, count: 3 }), [
      "Şezlong 4",
      "Şezlong 5",
      "Şezlong 6",
    ]);
  });
});
