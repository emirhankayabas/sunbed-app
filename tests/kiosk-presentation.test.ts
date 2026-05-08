import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getDuelChoiceCardClassName,
  getKioskScreenClassNames,
  getProfessionScreenClassNames,
  getThanksScreenClassNames,
  getThanksCountdownProgress,
  getWelcomeScreenClassNames,
  shouldHighlightPreviousWinner,
  thanksResetSeconds,
} from "@/lib/kiosk-presentation";

describe("kiosk presentation helpers", () => {
  it("highlights only the right card after at least one comparison", () => {
    assert.equal(shouldHighlightPreviousWinner("right", 1), true);
    assert.equal(shouldHighlightPreviousWinner("right", 0), false);
    assert.equal(shouldHighlightPreviousWinner("left", 3), false);
  });

  it("maps the thank-you countdown to a clamped radial progress value", () => {
    assert.equal(thanksResetSeconds, 10);
    assert.equal(getThanksCountdownProgress(10), 100);
    assert.equal(getThanksCountdownProgress(5), 50);
    assert.equal(getThanksCountdownProgress(0), 0);
    assert.equal(getThanksCountdownProgress(99), 100);
    assert.equal(getThanksCountdownProgress(-5), 0);
  });

  it("uses a single green border for the previous winner", () => {
    const className = getDuelChoiceCardClassName({
      side: "right",
      completedComparisonCount: 1,
      isSelected: false,
      selectionInProgress: false,
    });

    assert.match(className, /border-emerald-500/);
    assert.match(className, /ring-0/);
    assert.doesNotMatch(className, /ring-emerald/);
  });

  it("does not add a black primary border during selection", () => {
    const className = getDuelChoiceCardClassName({
      side: "left",
      completedComparisonCount: 1,
      isSelected: true,
      selectionInProgress: true,
    });

    assert.doesNotMatch(className, /border-primary/);
    assert.doesNotMatch(className, /ring-primary/);
  });

  it("keeps the thank-you screen compact for tablet height", () => {
    const classNames = getThanksScreenClassNames();

    assert.match(classNames.root, /justify-center/);
    assert.match(classNames.heading, /text-3xl/);
    assert.match(classNames.autoReturnFill, /#ff5722/);
    assert.equal("imageFrame" in classNames, false);
    assert.equal("countdown" in classNames, false);
  });

  it("uses the designer kiosk palette and spacing", () => {
    const screen = getKioskScreenClassNames("welcome");
    const welcome = getWelcomeScreenClassNames();
    const profession = getProfessionScreenClassNames();

    assert.match(screen.main, /bg-\[#171746\]/);
    assert.match(screen.main, /text-white/);
    assert.match(welcome.button, /#ff5722/);
    assert.match(welcome.description, /text-white/);
    assert.match(profession.grid, /sm:grid-cols-2/);
    assert.match(profession.optionButton, /#ff5722/);
  });
});
