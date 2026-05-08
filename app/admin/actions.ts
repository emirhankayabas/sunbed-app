"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSessionCookie,
  isAdminAuthenticated,
} from "@/lib/admin-session";
import {
  createProfession,
  deleteProfession,
  deleteSunbed,
} from "@/lib/repository";
import { deleteSunbedImage } from "@/lib/uploads";

export async function createProfessionAction(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();

  if (name) {
    await createProfession(name);
    revalidatePath("/admin");
  }
}

export async function deleteProfessionAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (id) {
    await deleteProfession(id);
    revalidatePath("/admin");
  }
}

export async function deleteSunbedAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");

  if (id) {
    const deleted = await deleteSunbed(id);
    if (deleted?.imagePath) {
      await deleteSunbedImage(deleted.imagePath);
    }
    revalidatePath("/admin");
  }
}

export async function logoutAdminAction() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}
