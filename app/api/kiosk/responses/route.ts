import { NextResponse } from "next/server";
import { z } from "zod";

import { recordKioskResponse } from "@/lib/repository";

export const runtime = "nodejs";

const comparisonSchema = z.object({
  round: z.number().int().positive(),
  leftSunbedId: z.string().min(1),
  rightSunbedId: z.string().min(1),
  winnerSunbedId: z.string().min(1),
  loserSunbedId: z.string().min(1),
});

const responseSchema = z.object({
  professionId: z.string().min(1),
  professionName: z.string().min(1),
  comparisons: z.array(comparisonSchema).min(1),
  finalWinnerSunbedId: z.string().min(1),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = responseSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Gönderilen seçim verisi geçerli değil." },
      { status: 400 },
    );
  }

  const { id } = await recordKioskResponse({
    professionId: result.data.professionId,
    professionName: result.data.professionName,
    comparisons: result.data.comparisons,
    finalWinnerSunbedId: result.data.finalWinnerSunbedId,
    startedAt: new Date(result.data.startedAt),
    completedAt: new Date(result.data.completedAt),
  });

  return NextResponse.json({ ok: true, id });
}
