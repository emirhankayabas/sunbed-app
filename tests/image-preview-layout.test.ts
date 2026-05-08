import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  imagePreviewCanvasClassName,
  imagePreviewDialogClassName,
} from "@/lib/image-preview-layout";

describe("image preview layout", () => {
  it("overrides the default small dialog width and keeps the image area wide", () => {
    assert.match(imagePreviewDialogClassName, /w-\[min\(1200px/);
    assert.match(imagePreviewDialogClassName, /sm:max-w-\[min\(1200px/);
    assert.match(imagePreviewDialogClassName, /max-w-none/);
    assert.match(imagePreviewCanvasClassName, /h-\[min\(72vh,760px\)\]/);
  });
});
