export function getAdminSunbedsPaginationLink(page: number) {
  return {
    href: `/admin?sunbedsPage=${page}`,
    scroll: false as const,
  };
}
