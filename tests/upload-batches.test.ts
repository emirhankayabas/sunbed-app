import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { createUploadBatches } from "@/lib/upload-batches";

describe("upload batches", () => {
  it("splits large file selections into fixed-size batches", () => {
    const files = Array.from({ length: 12 }, (_, index) => `file-${index + 1}`);

    assert.deepEqual(createUploadBatches(files, 5), [
      ["file-1", "file-2", "file-3", "file-4", "file-5"],
      ["file-6", "file-7", "file-8", "file-9", "file-10"],
      ["file-11", "file-12"],
    ]);
  });
});
