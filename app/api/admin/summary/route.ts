import { type NextRequest, NextResponse } from "next/server";

import { isAdminRequestAuthenticated } from "@/lib/admin-session";
import { getDashboardSummary } from "@/lib/repository";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
  }

  return NextResponse.json({ summary: await getDashboardSummary() });
}
