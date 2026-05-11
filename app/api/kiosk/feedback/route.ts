import { NextResponse } from "next/server";
import { z } from "zod";

import { recordKioskFeedback } from "@/lib/repository";

export const runtime = "nodejs";

const feedbackSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  responseId: z.string().min(1).optional(),
  professionId: z.string().min(1).optional(),
  professionName: z.string().min(1).optional(),
  finalWinnerSunbedId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = feedbackSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Geri bildirim metni geçerli değil." },
      { status: 400 },
    );
  }

  await recordKioskFeedback({
    message: result.data.message,
    responseId: result.data.responseId,
    professionId: result.data.professionId,
    professionName: result.data.professionName,
    finalWinnerSunbedId: result.data.finalWinnerSunbedId,
  });

  return NextResponse.json({ ok: true });
}
