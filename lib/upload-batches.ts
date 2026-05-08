export const defaultUploadBatchSize = 5;

export function createUploadBatches<TItem>(
  items: TItem[],
  batchSize = defaultUploadBatchSize,
) {
  if (batchSize < 1) {
    throw new Error("Batch size must be at least 1.");
  }

  const batches: TItem[][] = [];

  for (let index = 0; index < items.length; index += batchSize) {
    batches.push(items.slice(index, index + batchSize));
  }

  return batches;
}
