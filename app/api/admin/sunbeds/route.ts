import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { isAdminRequestAuthenticated } from "@/lib/admin-session";
import {
  createSunbeds,
  deleteSunbed,
  getAdminDashboardData,
  updateSunbed,
} from "@/lib/repository";
import { deleteSunbedImage, saveSunbedImage } from "@/lib/uploads";

export const runtime = "nodejs";

const updateSunbedSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1).optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().positive().optional(),
});

export async function GET(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return unauthorized();
  }

  const data = await getAdminDashboardData();
  return NextResponse.json({ sunbeds: data.sunbeds });
}

export async function POST(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return unauthorized();
  }

  const storedImages: Array<Awaited<ReturnType<typeof saveSunbedImage>>> = [];

  try {
    const formData = await request.formData();
    const imageEntries = formData
      .getAll("images")
      .filter((entry) => typeof entry === "object");

    for (const imageEntry of imageEntries) {
      storedImages.push(await saveSunbedImage(imageEntry));
    }
    await createSunbeds(storedImages);

    return NextResponse.json(
      { ok: true, created: storedImages.length },
      { status: 201 },
    );
  } catch (error) {
    for (const storedImage of storedImages) {
      await deleteSunbedImage(storedImage.imagePath);
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Görsel yüklenemedi." },
      { status: 400 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return unauthorized();
  }

  const body = await request.json().catch(() => null);
  const result = updateSunbedSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: "Güncelleme verisi geçerli değil." }, { status: 400 });
  }

  await updateSunbed(result.data);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequestAuthenticated(request)) {
    return unauthorized();
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Şezlong id zorunlu." }, { status: 400 });
  }

  const deleted = await deleteSunbed(id);
  if (deleted?.imagePath) {
    await deleteSunbedImage(deleted.imagePath);
  }

  return NextResponse.json({ ok: true });
}

function unauthorized() {
  return NextResponse.json({ error: "Yetkisiz istek." }, { status: 401 });
}
