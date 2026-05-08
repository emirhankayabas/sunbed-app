export type DeleteConfirmationItemType = "profession" | "sunbed";

type DeleteConfirmationCopyInput = {
  itemType: DeleteConfirmationItemType;
  itemName: string;
};

export function getDeleteConfirmationCopy({
  itemType,
  itemName,
}: DeleteConfirmationCopyInput) {
  const subject =
    itemType === "profession" ? "mesleği" : "şezlong görseli";

  return {
    title:
      itemType === "profession"
        ? "Meslek silinsin mi?"
        : "Şezlong görseli silinsin mi?",
    description: `"${itemName}" ${subject} kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
    cancelLabel: "Vazgeç",
    confirmLabel: "Sil",
  };
}
