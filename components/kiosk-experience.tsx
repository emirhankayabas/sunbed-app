"use client";

import Image from "next/image";
import { ArrowRight, Briefcase, ChevronRight, Home, Send, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { LogoHeader } from "@/components/logo-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  advanceDuel,
  createInitialDuel,
  getRemainingComparisons,
  shuffleSunbeds,
  type DuelState,
} from "@/lib/kiosk-flow";
import {
  feedbackAcknowledgementSeconds,
  getDuelChoiceCardClassName,
  getDuelChoiceImageClassName,
  getKioskScreenClassNames,
  getProfessionScreenClassNames,
  getScenarioScreenClassNames,
  getThanksScreenClassNames,
  getWelcomeScreenClassNames,
  selectionAnimationMs,
  thanksResetSeconds,
  type DuelCardSide,
} from "@/lib/kiosk-presentation";
import type { KioskConfig, ProfessionDto, SunbedDto } from "@/lib/models";
import { cn } from "@/lib/utils";

type Screen = "welcome" | "scenario" | "profession" | "duel" | "thanks";

type KioskExperienceProps = KioskConfig & {
  setupError?: string;
};

export function KioskExperience({
  professions,
  sunbeds,
  setupError,
}: KioskExperienceProps) {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [selectedProfession, setSelectedProfession] =
    useState<ProfessionDto | null>(null);
  const [sessionSunbeds, setSessionSunbeds] = useState<SunbedDto[]>([]);
  const [duelState, setDuelState] = useState<DuelState | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "error">(
    "idle",
  );
  const [selectedSunbedId, setSelectedSunbedId] = useState<string | null>(null);
  const [completedResponseId, setCompletedResponseId] = useState<string | null>(
    null,
  );
  const [completedWinnerSunbedId, setCompletedWinnerSunbedId] = useState<
    string | null
  >(null);
  const selectionLockRef = useRef(false);

  const sunbedsById = useMemo(
    () => new Map(sessionSunbeds.map((sunbed) => [sunbed.id, sunbed])),
    [sessionSunbeds],
  );
  const canStart = professions.length > 0 && sunbeds.length >= 2 && !setupError;

  function resetExperience() {
    setScreen("welcome");
    setSelectedProfession(null);
    setSessionSunbeds([]);
    setDuelState(null);
    setStartedAt(null);
    setSaveStatus("idle");
    setSelectedSunbedId(null);
    setCompletedResponseId(null);
    setCompletedWinnerSunbedId(null);
    selectionLockRef.current = false;
  }

  function startScenarioStep() {
    if (canStart) {
      setScreen("scenario");
    }
  }

  function goToProfession() {
    setScreen("profession");
  }

  function chooseProfession(profession: ProfessionDto) {
    const orderedSunbeds = shuffleSunbeds(sunbeds);

    setSelectedProfession(profession);
    setSessionSunbeds(orderedSunbeds);
    setDuelState(createInitialDuel(orderedSunbeds));
    setStartedAt(new Date().toISOString());
    setSelectedSunbedId(null);
    selectionLockRef.current = false;
    setScreen("duel");
  }

  async function selectWinner(winnerSunbedId: string) {
    if (
      !duelState ||
      !selectedProfession ||
      !startedAt ||
      selectionLockRef.current
    ) {
      return;
    }

    selectionLockRef.current = true;
    setSelectedSunbedId(winnerSunbedId);

    await new Promise((resolve) =>
      window.setTimeout(resolve, selectionAnimationMs),
    );

    const nextState = advanceDuel(duelState, winnerSunbedId);
    setDuelState(nextState);
    setSelectedSunbedId(null);

    if (!nextState.completed || !nextState.finalWinnerSunbedId) {
      selectionLockRef.current = false;
      return;
    }

    setSaveStatus("saving");

    let responseOk = false;
    let responseId: string | null = null;

    try {
      const response = await fetch("/api/kiosk/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionId: selectedProfession.id,
          professionName: selectedProfession.name,
          comparisons: nextState.comparisons,
          finalWinnerSunbedId: nextState.finalWinnerSunbedId,
          startedAt,
          completedAt: new Date().toISOString(),
        }),
      });

      responseOk = response.ok;
      if (responseOk) {
        const payload = (await response.json().catch(() => null)) as
          | { id?: string }
          | null;
        responseId = payload?.id ?? null;
      }
    } catch {
      responseOk = false;
    }

    setCompletedResponseId(responseId);
    setCompletedWinnerSunbedId(nextState.finalWinnerSunbedId);
    setSaveStatus(responseOk ? "idle" : "error");
    selectionLockRef.current = false;
    setScreen("thanks");
  }

  const screenClassNames = getKioskScreenClassNames(screen);

  return (
    <main className={screenClassNames.main}>
      <LogoHeader tone="light" />
      <section className={screenClassNames.section}>
        {screen === "welcome" && (
          <WelcomeScreen
            canStart={canStart}
            setupError={setupError}
            professions={professions}
            sunbeds={sunbeds}
            onStart={startScenarioStep}
          />
        )}

        {screen === "scenario" && (
          <ScenarioScreen onContinue={goToProfession} />
        )}

        {screen === "profession" && (
          <ProfessionScreen
            professions={professions}
            onChoose={chooseProfession}
          />
        )}

        {screen === "duel" && duelState && (
          <DuelScreen
            state={duelState}
            sunbedsById={sunbedsById}
            selectedSunbedId={selectedSunbedId}
            onSelectWinner={selectWinner}
          />
        )}

        {screen === "thanks" && (
          <ThanksScreen
            saveStatus={saveStatus}
            onReset={resetExperience}
            responseId={completedResponseId}
            professionId={selectedProfession?.id ?? null}
            professionName={selectedProfession?.name ?? null}
            finalWinnerSunbedId={completedWinnerSunbedId}
          />
        )}
      </section>
    </main>
  );
}

function WelcomeScreen({
  canStart,
  setupError,
  professions,
  sunbeds,
  onStart,
}: {
  canStart: boolean;
  setupError?: string;
  professions: ProfessionDto[];
  sunbeds: SunbedDto[];
  onStart: () => void;
}) {
  const classNames = getWelcomeScreenClassNames();

  return (
    <div className={classNames.root}>
      <div className={classNames.decor} aria-hidden />
      <div className={classNames.content}>
        <p className={classNames.badge}>
          <span className={classNames.badgeIcon}>
            <Sparkles
              className="size-[1.05rem] md:size-[1.15rem]"
              aria-hidden
              strokeWidth={2}
            />
          </span>
          <span className={classNames.badgeLabel}>Tasarım geri bildirimi</span>
        </p>
        <h1 className={classNames.heading}>Merhaba!</h1>
        <p className={classNames.description}>
          Yeni şezlong tasarımımıza yön vermek için kısa bir
          değerlendirmeye davetlisiniz.
        </p>
      </div>

      {!canStart && (
        <Alert className={classNames.alert}>
          <AlertTitle>Başlamak için admin kurulumu gerekiyor</AlertTitle>
          <AlertDescription>
            {setupError ??
              (professions.length === 0
                ? "En az bir aktif meslek ekleyin."
                : "En az iki aktif şezlong görseli ekleyin.")}
            {sunbeds.length < 2 && professions.length > 0
              ? " En az iki aktif şezlong görseli gerekir."
              : ""}
          </AlertDescription>
        </Alert>
      )}

      <div className={classNames.ctaWrap}>
        <Button
          type="button"
          disabled={!canStart}
          onClick={onStart}
          className={cn("group", classNames.button)}
        >
          Başla
          <ArrowRight className={classNames.buttonIcon} aria-hidden />
        </Button>
      </div>
    </div>
  );
}

function ScenarioScreen({ onContinue }: { onContinue: () => void }) {
  const classNames = getScenarioScreenClassNames();

  return (
    <div className={classNames.root}>
      <div className={classNames.decor} aria-hidden />
      <div className={classNames.content}>
        <h1 className={classNames.heading}>
          Yaz turizminin yoğun olduğu bir ülkede tasarladığınız 500 odalı
          orta segment bir otelin mimarı olarak, hem havuz kenarında hem de beach
          alanında kullanılacak şezlong modellerini değerlendiriyorsunuz.
        </h1>
      </div>

      <div className={classNames.ctaWrap}>
        <Button
          type="button"
          onClick={onContinue}
          className={cn("group", classNames.button)}
        >
          Devam et
          <ArrowRight className={classNames.buttonIcon} aria-hidden />
        </Button>
      </div>
    </div>
  );
}

function ProfessionScreen({
  professions,
  onChoose,
}: {
  professions: ProfessionDto[];
  onChoose: (profession: ProfessionDto) => void;
}) {
  const classNames = getProfessionScreenClassNames();

  return (
    <div className={classNames.root}>
      <div className={classNames.decor} aria-hidden />
      <h1 className={classNames.heading}>Mesleğinizi seçin</h1>
      <p className={classNames.subheading}>
        Profilini belirle; ardından sana gösterilen şezlongları yan yana
        karşılaştırarak tercihini işaretle.
      </p>
      <div className={classNames.grid}>
        {professions.map((profession) => (
          <Button
            key={profession.id}
            type="button"
            variant="ghost"
            onClick={() => onChoose(profession)}
            className={classNames.optionButton}
          >
            <span className={classNames.optionIcon}>
              <Briefcase className="size-4.5 md:size-5" aria-hidden />
            </span>
            <span className={classNames.optionLabel}>{profession.name}</span>
            <ChevronRight className={classNames.optionChevron} aria-hidden />
          </Button>
        ))}
      </div>
    </div>
  );
}

function DuelScreen({
  state,
  sunbedsById,
  selectedSunbedId,
  onSelectWinner,
}: {
  state: DuelState;
  sunbedsById: Map<string, SunbedDto>;
  selectedSunbedId: string | null;
  onSelectWinner: (winnerSunbedId: string) => void;
}) {
  const leftSunbed = sunbedsById.get(state.leftSunbedId);
  const rightSunbed = sunbedsById.get(state.rightSunbedId);
  const completed = state.comparisons.length;
  const progressValue = Math.round((completed / state.totalComparisons) * 100);
  const remaining = getRemainingComparisons(state);

  if (!leftSunbed || !rightSunbed) {
    return (
      <Alert>
        <AlertTitle>Şezlong bulunamadı</AlertTitle>
        <AlertDescription>
          Admin panelindeki aktif görselleri kontrol edin.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-3 md:gap-4">
      <div
        className={cn(
          "grid min-h-0 grid-cols-1 grid-rows-2 gap-4 md:grid-cols-2 md:grid-rows-1 md:gap-5",
          "h-[min(34rem,calc(100svh-23rem))] md:h-[min(28rem,calc(100svh-24rem))]",
        )}
      >
        <SunbedChoiceCard
          side="left"
          sunbed={leftSunbed}
          completedComparisonCount={completed}
          selectedSunbedId={selectedSunbedId}
          onSelect={() => onSelectWinner(leftSunbed.id)}
        />
        <SunbedChoiceCard
          side="right"
          sunbed={rightSunbed}
          completedComparisonCount={completed}
          selectedSunbedId={selectedSunbedId}
          onSelect={() => onSelectWinner(rightSunbed.id)}
        />
      </div>

      <div className="mx-auto mt-2 w-full max-w-3xl shrink-0 md:mt-8">
        <div className="mb-3 flex items-center text-sm font-medium text-white">
          <span>İlerleme</span>
          <span className="ml-auto text-white/70 tabular-nums">
            {remaining} seçim kaldı
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-[#ff5722] transition-all duration-300"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function SunbedChoiceCard({
  side,
  sunbed,
  completedComparisonCount,
  selectedSunbedId,
  onSelect,
}: {
  side: DuelCardSide;
  sunbed: SunbedDto;
  completedComparisonCount: number;
  selectedSunbedId: string | null;
  onSelect: () => void;
}) {
  const isSelected = selectedSunbedId === sunbed.id;
  const selectionInProgress = selectedSunbedId !== null;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={selectionInProgress}
      aria-pressed={isSelected}
      className={cn(
        "group h-full min-h-0 w-full rounded-xl text-left outline-none transition duration-200 focus-visible:ring-3 focus-visible:ring-emerald-500/40 disabled:cursor-default",
        selectionInProgress && !isSelected && "opacity-70",
      )}
    >
      <Card
        className={getDuelChoiceCardClassName({
          side,
          completedComparisonCount,
          isSelected,
          selectionInProgress,
        })}
      >
        <CardContent className="flex h-full flex-col p-4">
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg">
            <Image
              src={sunbed.imagePath}
              alt={sunbed.title}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className={getDuelChoiceImageClassName(isSelected)}
            />
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

type FeedbackPhase = "prompt" | "submitting" | "submitted";

function ThanksScreen({
  saveStatus,
  onReset,
  responseId,
  professionId,
  professionName,
  finalWinnerSunbedId,
}: {
  saveStatus: "idle" | "saving" | "error";
  onReset: () => void;
  responseId: string | null;
  professionId: string | null;
  professionName: string | null;
  finalWinnerSunbedId: string | null;
}) {
  const classNames = getThanksScreenClassNames();
  const [phase, setPhase] = useState<FeedbackPhase>("prompt");
  const [feedback, setFeedback] = useState("");
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(thanksResetSeconds);

  const totalSeconds =
    phase === "submitted" ? feedbackAcknowledgementSeconds : thanksResetSeconds;

  const handleReset = useCallback(() => {
    onReset();
  }, [onReset]);

  useEffect(() => {
    if (phase === "submitting") {
      return;
    }
    if (phase === "prompt" && paused) {
      return;
    }

    if (secondsLeft <= 0) {
      handleReset();
      return;
    }

    const id = window.setTimeout(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);

    return () => window.clearTimeout(id);
  }, [phase, paused, secondsLeft, handleReset]);

  function handleFocus() {
    if (phase === "prompt") {
      setPaused(true);
    }
  }

  async function handleSubmit() {
    const trimmed = feedback.trim();
    if (!trimmed) {
      setFeedbackError("Lütfen göndermeden önce birkaç kelime yazın.");
      return;
    }

    setFeedbackError(null);
    setPhase("submitting");

    try {
      const response = await fetch("/api/kiosk/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          ...(responseId ? { responseId } : {}),
          ...(professionId ? { professionId } : {}),
          ...(professionName ? { professionName } : {}),
          ...(finalWinnerSunbedId ? { finalWinnerSunbedId } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error("save failed");
      }
    } catch {
      setFeedbackError(
        "Görüşün şu anda kaydedilemedi; yine de ilgilendiğin için teşekkürler.",
      );
    }

    setPhase("submitted");
    setSecondsLeft(feedbackAcknowledgementSeconds);
  }

  const autoReturnProgress =
    totalSeconds <= 0
      ? 100
      : Math.min(
          100,
          Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100),
        );

  const showError = saveStatus === "error" && phase !== "submitted";
  const isSubmitted = phase === "submitted";
  const heading = isSubmitted
    ? "Görüşün için teşekkürler!"
    : "Değerli fikirlerin için\nteşekkür ederiz!";

  return (
    <div className={classNames.root}>
      <div className={classNames.decor} aria-hidden />
      <div className={classNames.content}>
        <h1 className={classNames.heading} style={{ whiteSpace: "pre-line" }}>
          {heading}
        </h1>
        {showError && (
          <p className={classNames.description}>
            Yanıt sunucuya tam yazılamadı; görevliye haber vermen yeterli.
          </p>
        )}
      </div>

      {showError && (
        <Alert className={classNames.alert}>
          <AlertTitle>Kayıt tamamlanamadı</AlertTitle>
          <AlertDescription>
            Lütfen görevliye haber verin; ağ veya MongoDB bağlantısı
            denetlenmeli.
          </AlertDescription>
        </Alert>
      )}

      {!isSubmitted && (
        <div className={classNames.feedbackWrap}>
          <label htmlFor="kiosk-feedback" className={classNames.feedbackLabel}>
            Seçim nedenlerinizi belirtiniz.
          </label>
          <Textarea
            id="kiosk-feedback"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            onFocus={handleFocus}
            placeholder="Tasarımla ilgili düşüncelerinizi buraya yazabilirsiniz…"
            className={classNames.feedbackTextarea}
            disabled={phase === "submitting"}
            maxLength={2000}
          />
          {feedbackError && (
            <p className={classNames.feedbackError}>{feedbackError}</p>
          )}
          <div className={classNames.feedbackActions}>
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={phase === "submitting"}
              className={classNames.feedbackSecondary}
            >
              <Home className="size-4 md:size-5" aria-hidden />
              Atla
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={phase === "submitting" || feedback.trim().length === 0}
              className={classNames.feedbackSubmit}
            >
              {phase === "submitting" ? "Gönderiliyor…" : "Gönder"}
              <Send className="size-4 md:size-5" aria-hidden />
            </Button>
          </div>
        </div>
      )}

      <div className={classNames.autoReturnWrap}>
        <div className={classNames.autoReturnHint}>
          <span>
            {isSubmitted
              ? "Ana sayfaya dönülüyor"
              : paused
                ? "Görüşünü yazıyorsun…"
                : "Ana sayfaya dönüş"}
          </span>
          <span className={classNames.autoReturnMeta}>
            {phase === "submitting"
              ? "…"
              : paused && !isSubmitted
                ? "duraklatıldı"
                : `${secondsLeft} sn`}
          </span>
        </div>
        <div className={classNames.autoReturnTrack}>
          <div
            className={classNames.autoReturnFill}
            style={{
              width: `${
                phase === "submitting" || (paused && !isSubmitted)
                  ? 0
                  : autoReturnProgress
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
