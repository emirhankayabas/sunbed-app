export type SunbedChoice = {
  id: string;
};

export type KioskComparison = {
  round: number;
  leftSunbedId: string;
  rightSunbedId: string;
  winnerSunbedId: string;
  loserSunbedId: string;
};

export type DuelState = {
  orderedSunbedIds: string[];
  leftSunbedId: string;
  rightSunbedId: string;
  nextIndex: number;
  totalComparisons: number;
  comparisons: KioskComparison[];
  completed: boolean;
  finalWinnerSunbedId?: string;
};

export function createInitialDuel<TSunbed extends SunbedChoice>(
  sunbeds: TSunbed[],
): DuelState {
  if (sunbeds.length < 2) {
    throw new Error("Kiosk flow requires at least two sunbeds.");
  }

  const orderedSunbedIds = sunbeds.map((sunbed) => sunbed.id);

  return {
    orderedSunbedIds,
    leftSunbedId: orderedSunbedIds[0],
    rightSunbedId: orderedSunbedIds[1],
    nextIndex: 2,
    totalComparisons: orderedSunbedIds.length - 1,
    comparisons: [],
    completed: false,
  };
}

export function advanceDuel(
  state: DuelState,
  winnerSunbedId: string,
): DuelState {
  if (state.completed) {
    throw new Error("Cannot advance a completed kiosk duel.");
  }

  if (
    winnerSunbedId !== state.leftSunbedId &&
    winnerSunbedId !== state.rightSunbedId
  ) {
    throw new Error("Winner must be one of the current duel sunbeds.");
  }

  const loserSunbedId =
    winnerSunbedId === state.leftSunbedId
      ? state.rightSunbedId
      : state.leftSunbedId;
  const comparisons = [
    ...state.comparisons,
    {
      round: state.comparisons.length + 1,
      leftSunbedId: state.leftSunbedId,
      rightSunbedId: state.rightSunbedId,
      winnerSunbedId,
      loserSunbedId,
    },
  ];

  if (state.nextIndex >= state.orderedSunbedIds.length) {
    return {
      ...state,
      comparisons,
      completed: true,
      finalWinnerSunbedId: winnerSunbedId,
    };
  }

  return {
    ...state,
    leftSunbedId: state.orderedSunbedIds[state.nextIndex],
    rightSunbedId: winnerSunbedId,
    nextIndex: state.nextIndex + 1,
    comparisons,
  };
}

export function getRemainingComparisons(state: DuelState) {
  return Math.max(state.totalComparisons - state.comparisons.length, 0);
}

export function shuffleSunbeds<TSunbed>(
  sunbeds: TSunbed[],
  random: () => number = Math.random,
) {
  const shuffled = [...sunbeds];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}
