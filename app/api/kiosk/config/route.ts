import { NextResponse } from "next/server";

import { getKioskConfig } from "@/lib/repository";

export const runtime = "nodejs";

export async function GET() {
  try {
    const config = await getKioskConfig();
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: getErrorMessage(error, "Kiosk yapılandırması alınamadı.") },
      { status: 500 },
    );
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
