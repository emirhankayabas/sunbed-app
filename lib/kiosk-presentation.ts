export type DuelCardSide = "left" | "right";
export type KioskScreenName =
  | "welcome"
  | "scenario"
  | "profession"
  | "duel"
  | "thanks";

export const selectionAnimationMs = 180;
export const thanksResetSeconds = 10;
export const feedbackAcknowledgementSeconds = 5;

type DuelChoiceCardClassNameInput = {
  side: DuelCardSide;
  completedComparisonCount: number;
  isSelected: boolean;
  selectionInProgress: boolean;
};

export function getKioskScreenClassNames(screen: KioskScreenName) {
  return {
    main: "flex min-h-svh flex-col overflow-hidden bg-[#171746] text-white",
    section: (() => {
      const base = "flex flex-1 flex-col px-5 md:px-10";
      if (screen === "welcome" || screen === "scenario") {
        return [base, "pb-14 md:pb-16 pt-8 md:pt-14"].join(" ");
      }
      if (screen === "duel") {
        return [base, "min-h-0 pb-6 md:pb-8"].join(" ");
      }
      if (screen === "thanks") {
        return [base, "min-h-0 pb-4 md:pb-6 pt-2 md:pt-4"].join(" ");
      }
      return [base, "pb-8 md:pb-10 pt-0"].join(" ");
    })(),
  };
}

export function getWelcomeScreenClassNames() {
  return {
    root: "relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center text-center md:max-w-4xl",
    decor:
      "pointer-events-none absolute -top-28 left-1/2 h-[min(22rem,55vh)] w-[min(100vw,44rem)] -translate-x-1/2 rounded-[50%] bg-[#ff5722]/20 blur-[90px]",
    content: "relative z-10",
    badge:
      "mb-6 inline-flex max-w-full items-stretch overflow-hidden rounded-full border border-white/12 bg-white/[0.07] py-1 pl-1 pr-1 shadow-md shadow-black/15 backdrop-blur-md md:mb-7",
    badgeIcon:
      "flex size-9 shrink-0 items-center justify-center self-center rounded-full bg-gradient-to-br from-[#ff7043]/40 to-[#ff5722]/22 text-[#ffd4c2] ring-1 ring-white/10 md:size-10",
    badgeLabel:
      "flex items-center px-3.5 text-[0.8125rem] font-medium leading-none tracking-tight text-white/90 md:px-4 md:text-[0.9375rem]",
    heading:
      "text-[2rem] font-semibold leading-[1.12] tracking-tight text-white text-balance md:text-5xl md:leading-[1.08] lg:text-[3.25rem]",
    description:
      "mx-auto mt-5 max-w-4xl text-base leading-relaxed text-white/60 md:mt-7 md:text-lg md:leading-relaxed",
    alert:
      "relative z-10 mt-8 max-w-xl border-white/15 bg-white/[0.06] text-left text-white shadow-lg shadow-black/15 backdrop-blur-md [&_[data-slot=alert-description]]:text-white/70",
    ctaWrap: "relative z-10 mt-12 md:mt-16",
    button:
      "h-14 min-w-[min(100%,17.5rem)] gap-2.5 rounded-full border-0 bg-gradient-to-r from-[#ff7043] via-[#ff5722] to-[#f4511e] px-9 text-base font-semibold tracking-wide text-white shadow-[0_18px_48px_-14px_rgba(255,87,34,0.72)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#ff7a50] hover:via-[#ff6a36] hover:to-[#ff5722] hover:shadow-[0_22px_56px_-12px_rgba(255,87,34,0.8)] active:translate-y-0 md:h-16 md:min-w-[19rem] md:px-11 md:text-lg",
    buttonIcon:
      "size-[1.125rem] shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 md:size-5",
  };
}

export function getScenarioScreenClassNames() {
  return {
    root: "relative mx-auto flex w-full max-w-4xl flex-1 flex-col items-center text-center md:max-w-5xl",
    decor:
      "pointer-events-none absolute -top-28 left-1/2 h-[min(22rem,55vh)] w-[min(100vw,44rem)] -translate-x-1/2 rounded-[50%] bg-[#ff5722]/20 blur-[90px]",
    content: "relative z-10",
    badge:
      "mb-6 inline-flex max-w-full items-stretch overflow-hidden rounded-full border border-white/12 bg-white/[0.07] py-1 pl-1 pr-1 shadow-md shadow-black/15 backdrop-blur-md md:mb-7",
    badgeIcon:
      "flex size-9 shrink-0 items-center justify-center self-center rounded-full bg-gradient-to-br from-[#ff7043]/40 to-[#ff5722]/22 text-[#ffd4c2] ring-1 ring-white/10 md:size-10",
    badgeLabel:
      "flex items-center px-3.5 text-[0.8125rem] font-medium leading-none tracking-tight text-white/90 md:px-4 md:text-[0.9375rem]",
    heading:
      "max-w-5xl text-[1.35rem] font-semibold leading-[1.35] tracking-tight text-white text-balance md:text-[1.75rem] md:leading-[1.32] lg:text-[2rem]",
    ctaWrap: "relative z-10 mt-12 md:mt-16",
    button:
      "h-14 min-w-[min(100%,17.5rem)] gap-2.5 rounded-full border-0 bg-gradient-to-r from-[#ff7043] via-[#ff5722] to-[#f4511e] px-9 text-base font-semibold tracking-wide text-white shadow-[0_18px_48px_-14px_rgba(255,87,34,0.72)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#ff7a50] hover:via-[#ff6a36] hover:to-[#ff5722] hover:shadow-[0_22px_56px_-12px_rgba(255,87,34,0.8)] active:translate-y-0 md:h-16 md:min-w-[19rem] md:px-11 md:text-lg",
    buttonIcon:
      "size-[1.125rem] shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 md:size-5",
  };
}

export function getProfessionScreenClassNames() {
  return {
    root: "relative mx-auto w-full max-w-2xl text-center md:max-w-4xl",
    decor:
      "pointer-events-none absolute -top-20 left-1/2 h-40 w-[26rem] max-w-[92vw] -translate-x-1/2 rounded-full bg-[#ff5722]/15 blur-[72px]",
    heading:
      "relative z-10 text-[1.75rem] font-semibold tracking-tight text-white md:text-4xl lg:text-[2.5rem]",
    subheading:
      "relative z-10 mx-auto mt-3 max-w-lg text-sm leading-relaxed text-white/55 md:mt-4 md:text-base",
    grid: "relative z-10 mt-9 grid grid-cols-1 gap-3 sm:mt-11 sm:grid-cols-2 sm:gap-4",
    optionButton:
      "group flex h-auto min-h-[4rem] w-full items-center gap-3.5 whitespace-normal rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3.5 text-left text-base font-medium leading-snug text-white shadow-md shadow-black/20 backdrop-blur-md transition-all duration-200 hover:border-[#ff5722]/40 hover:bg-[#ff5722]/10 hover:shadow-lg hover:shadow-[#ff5722]/10 focus-visible:border-[#ff5722] focus-visible:ring-2 focus-visible:ring-[#ff5722]/35 md:min-h-[4.5rem] md:px-5 md:py-4 md:text-lg",
    optionIcon:
      "flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/[0.14] to-white/[0.04] text-white ring-1 ring-white/12 md:size-12",
    optionLabel: "min-w-0 flex-1",
    optionChevron:
      "size-5 shrink-0 text-white/30 transition-colors duration-200 group-hover:text-[#ffab91] md:size-5",
  };
}

export function shouldHighlightPreviousWinner(
  side: DuelCardSide,
  completedComparisonCount: number,
) {
  return side === "right" && completedComparisonCount > 0;
}

export function getDuelChoiceCardClassName({
  side,
  completedComparisonCount,
  isSelected,
  selectionInProgress,
}: DuelChoiceCardClassNameInput) {
  const isPreviousWinner = shouldHighlightPreviousWinner(
    side,
    completedComparisonCount,
  );

  return [
    "h-full rounded-xl border-2 bg-card ring-0 transition-transform duration-200 ease-out",
    isPreviousWinner ? "border-emerald-500 shadow-md" : "border-border",
    isSelected ? "scale-[0.99] shadow-lg" : "",
    !selectionInProgress ? "group-hover:shadow-md" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function getDuelChoiceImageClassName(isSelected: boolean) {
  return [
    "object-contain p-4 transition-transform duration-200 ease-out",
    isSelected ? "scale-[1.015]" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function getThanksScreenClassNames() {
  return {
    root: "relative mx-auto flex w-full max-w-3xl min-h-0 flex-1 flex-col items-center text-center md:max-w-4xl",
    decor:
      "pointer-events-none absolute -top-24 left-1/2 h-[min(18rem,42vh)] w-[min(100vw,40rem)] -translate-x-1/2 rounded-[50%] bg-[#ff5722]/20 blur-[90px]",
    content: "relative z-10 flex flex-col items-center",
    heading:
      "max-w-2xl text-2xl font-semibold leading-[1.12] tracking-tight text-white text-balance md:text-4xl md:leading-[1.08] lg:text-5xl",
    description:
      "mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/60 md:mt-4 md:text-base md:leading-relaxed",
    alert:
      "relative z-10 mt-4 w-full max-w-xl border-white/15 bg-white/[0.06] text-left text-white shadow-lg shadow-black/15 backdrop-blur-md [&_[data-slot=alert-description]]:text-white/70",
    autoReturnWrap: "relative z-10 mt-9 w-full max-w-md shrink-0 md:mt-11",
    autoReturnHint:
      "mb-3 flex items-center text-sm font-medium text-white md:text-base",
    autoReturnMeta: "ml-auto text-white/70 tabular-nums",
    autoReturnTrack: "h-1.5 overflow-hidden rounded-full bg-white/15",
    autoReturnFill:
      "h-full rounded-full bg-[#ff5722] transition-[width] duration-700 ease-linear",
    feedbackWrap:
      "relative z-10 mt-9 w-full max-w-xl shrink-0 md:mt-11",
    feedbackLabel:
      "mb-3 block text-left text-sm font-medium text-white/85 md:text-base",
    feedbackTextarea:
      "min-h-[5.5rem] w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 py-3 text-base leading-relaxed text-white shadow-md shadow-black/20 backdrop-blur-md transition-colors placeholder:text-white/40 focus-visible:border-[#ff5722]/60 focus-visible:ring-2 focus-visible:ring-[#ff5722]/40 md:min-h-[6.5rem] md:px-5 md:py-3.5 md:text-lg",
    feedbackActions:
      "mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between",
    feedbackSecondary:
      "h-11 gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-base font-medium tracking-wide text-white/80 backdrop-blur-md transition-colors hover:border-white/30 hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 md:h-12 md:px-7 md:text-base",
    feedbackSubmit:
      "h-11 gap-2 rounded-full border-0 bg-gradient-to-r from-[#ff7043] via-[#ff5722] to-[#f4511e] px-7 text-base font-semibold tracking-wide text-white shadow-[0_18px_40px_-14px_rgba(255,87,34,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-12px_rgba(255,87,34,0.8)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 md:h-12 md:px-8 md:text-base",
    feedbackError:
      "mt-2 text-left text-sm text-[#ffb199]",
  };
}

export function getThanksCountdownProgress(
  remainingSeconds: number,
  totalSeconds = thanksResetSeconds,
) {
  if (totalSeconds <= 0) {
    return 0;
  }

  const clampedRemaining = Math.min(
    Math.max(remainingSeconds, 0),
    totalSeconds,
  );

  return Math.round((clampedRemaining / totalSeconds) * 100);
}
