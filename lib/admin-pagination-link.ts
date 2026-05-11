export function getAdminSunbedsPaginationLink(
  page: number,
  options?: { feedbacksPage?: number },
) {
  const params = new URLSearchParams();
  params.set("sunbedsPage", String(page));
  if (options?.feedbacksPage !== undefined && options.feedbacksPage > 1) {
    params.set("feedbacksPage", String(options.feedbacksPage));
  }
  return {
    href: `/admin?${params.toString()}`,
    scroll: false as const,
  };
}

export function getAdminFeedbacksPaginationLink(
  page: number,
  options?: { sunbedsPage?: number },
) {
  const params = new URLSearchParams();
  params.set("feedbacksPage", String(page));
  if (options?.sunbedsPage !== undefined && options.sunbedsPage > 1) {
    params.set("sunbedsPage", String(options.sunbedsPage));
  }
  return {
    href: `/admin?${params.toString()}`,
    scroll: false as const,
  };
}
