import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getDeleteConfirmationCopy } from "@/lib/admin-delete-confirmation";

describe("admin delete confirmation copy", () => {
  it("makes the destructive action explicit for a profession", () => {
    assert.deepEqual(
      getDeleteConfirmationCopy({
        itemType: "profession",
        itemName: "Mimar",
      }),
      {
        title: "Meslek silinsin mi?",
        description:
          '"Mimar" mesleği kalıcı olarak silinecek. Bu işlem geri alınamaz.',
        cancelLabel: "Vazgeç",
        confirmLabel: "Sil",
      },
    );
  });

  it("makes the destructive action explicit for a sunbed image", () => {
    assert.equal(
      getDeleteConfirmationCopy({
        itemType: "sunbed",
        itemName: "Şezlong 12",
      }).title,
      "Şezlong görseli silinsin mi?",
    );
  });
});
