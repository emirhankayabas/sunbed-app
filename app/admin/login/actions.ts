"use server";

import { redirect } from "next/navigation";

import { getAdminPassword, setAdminSessionCookie } from "@/lib/admin-session";

export async function loginAdmin(formData: FormData) {
  const configuredPassword = getAdminPassword();
  const password = String(formData.get("password") ?? "");

  if (!configuredPassword) {
    redirect("/admin/login?error=config");
  }

  if (password !== configuredPassword) {
    redirect("/admin/login?error=invalid");
  }

  await setAdminSessionCookie();
  redirect("/admin");
}
