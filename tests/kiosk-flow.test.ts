import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  advanceDuel,
  createInitialDuel,
  getRemainingComparisons,
} from "@/lib/kiosk-flow";

const sunbeds = [
  { id: "sunbed-a", title: "A" },
  { id: "sunbed-b", title: "B" },
  { id: "sunbed-c", title: "C" },
];

describe("kiosk duel flow", () => {
  it("starts with the first two sunbeds and knows the total comparison count", () => {
    const state = createInitialDuel(sunbeds);

    assert.equal(state.leftSunbedId, "sunbed-a");
    assert.equal(state.rightSunbedId, "sunbed-b");
    assert.equal(state.nextIndex, 2);
    assert.equal(state.totalComparisons, 2);
    assert.equal(getRemainingComparisons(state), 2);
  });

  it("keeps the winner on the right, brings the next sunbed on the left, and completes with a final winner", () => {
    const firstState = createInitialDuel(sunbeds);

    const secondState = advanceDuel(firstState, "sunbed-b");

    assert.equal(secondState.completed, false);
    assert.equal(secondState.leftSunbedId, "sunbed-c");
    assert.equal(secondState.rightSunbedId, "sunbed-b");
    assert.equal(secondState.nextIndex, 3);
    assert.equal(getRemainingComparisons(secondState), 1);
    assert.deepEqual(secondState.comparisons[0], {
      round: 1,
      leftSunbedId: "sunbed-a",
      rightSunbedId: "sunbed-b",
      winnerSunbedId: "sunbed-b",
      loserSunbedId: "sunbed-a",
    });

    const completedState = advanceDuel(secondState, "sunbed-c");

    assert.equal(completedState.completed, true);
    assert.equal(completedState.finalWinnerSunbedId, "sunbed-c");
    assert.equal(getRemainingComparisons(completedState), 0);
    assert.equal(completedState.comparisons.length, 2);
  });

  it("rejects flows with fewer than two active sunbeds", () => {
    assert.throws(
      () => createInitialDuel(sunbeds.slice(0, 1)),
      /at least two sunbeds/i,
    );
  });
});
