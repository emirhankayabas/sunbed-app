import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { isAdminRequestAuthenticated } from "@/lib/admin-session";
import {
  createProfession,
  deleteProfession,
  getAdminDashboardData,
  updateProfession,
} from "@/lib/repository";

export const runtime = "nodejs";

const createProfessionSchema = z.object({
  name: z.string().trim().min(1),
});

const updateProfessionSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().positive().optional(),
});

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return unauthorized();
  }

  const data = await getAdminDashboardData();
  return NextResponse.json({ professions: data.professions });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const result = createProfessionSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Meslek adı zorunlu." }, { status: 400 });
  }

  await createProfession(result.data.name);
  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const result = updateProfessionSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Güncelleme verisi geçerli değil." }, { status: 400 });
  }

  await updateProfession(result.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return unauthorized();
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Meslek id zorunlu." }, { status: 400 });
  }

  await deleteProfession(id);
  return NextResponse.json({ ok: true });
}

function unauthorized() {
  return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
}
