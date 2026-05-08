export function createSunbedTitle(sortOrder: number) {
  return `Şezlong ${sortOrder}`;
}

export function createSunbedTitles({
  startSortOrder,
  count,
}: {
  startSortOrder: number;
  count: number;
}) {
  return Array.from({ length: count }, (_, index) =>
    createSunbedTitle(startSortOrder + index),
  );
}
