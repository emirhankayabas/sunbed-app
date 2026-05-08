import { redirect } from "next/navigation";

import { LogoHeader } from "@/components/logo-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAdminAuthenticated } from "@/lib/admin-session";

import { loginAdmin } from "./actions";

export const runtime = "nodejs";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const { error } = await searchParams;

  return (
    <main className="flex min-h-svh flex-col bg-background">
      <LogoHeader />
      <section className="flex flex-1 items-center justify-center px-5 pb-10">
        <Card className="w-full max-w-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Admin girişi</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-5">
                <AlertTitle>Giriş yapılamadı</AlertTitle>
                <AlertDescription>
                  {error === "config"
                    ? "ADMIN_PASSWORD ve ADMIN_SESSION_SECRET değerlerini .env içinde tanımlayın."
                    : "Şifre hatalı. Lütfen tekrar deneyin."}
                </AlertDescription>
              </Alert>
            )}

            <form action={loginAdmin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="password">Admin şifresi</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="h-11 w-full text-base">
                Giriş yap
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
