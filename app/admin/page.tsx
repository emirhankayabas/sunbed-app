import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import {
  createProfessionAction,
  deleteProfessionAction,
  deleteSunbedAction,
  logoutAdminAction,
} from "@/app/admin/actions";
import { AdminSunbedUpload } from "@/components/admin-sunbed-upload";
import { DeleteConfirmationButton } from "@/components/delete-confirmation-button";
import { ImagePreviewDialog } from "@/components/image-preview-dialog";
import { LogoHeader } from "@/components/logo-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminSunbedsPaginationLink } from "@/lib/admin-pagination-link";
import { isAdminAuthenticated } from "@/lib/admin-session";
import { paginateItems } from "@/lib/pagination";
import { getAdminDashboardData } from "@/lib/repository";
import { cn } from "@/lib/utils";

export const runtime = "nodejs";
const sunbedsPageSize = 8;

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ sunbedsPage?: string }>;
}) {
  await connection();

  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  let dashboardData: Awaited<ReturnType<typeof getAdminDashboardData>> | null =
    null;
  let loadError: string | undefined;

  try {
    dashboardData = await getAdminDashboardData();
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "MongoDB bağlantısı veya admin yapılandırması denetlenmeli.";
  }

  if (loadError || !dashboardData) {
    return (
      <main className="min-h-svh bg-background text-foreground">
        <LogoHeader compact />
        <section className="mx-auto max-w-3xl px-5 pb-10">
          <Alert>
            <AlertTitle>Admin paneli açılamadı</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
        </section>
      </main>
    );
  }

  const { professions, sunbeds, summary } = dashboardData;
  const { sunbedsPage } = await searchParams;
  const paginatedSunbeds = paginateItems(
    sunbeds,
    Number(sunbedsPage ?? 1),
    sunbedsPageSize,
  );

  return (
    <main className="min-h-svh bg-background text-foreground">
      <LogoHeader compact />
      <section className="mx-auto w-full max-w-7xl px-5 pb-10 md:px-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Admin paneli</h1>
            <p className="mt-1 text-muted-foreground">
              Meslekleri, şezlong görsellerini ve seçim sonuçlarını yönetin.
            </p>
          </div>
          <form action={logoutAdminAction}>
            <Button type="submit" variant="outline">
              Çıkış yap
            </Button>
          </form>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Toplam katılım" value={summary.totalResponses} />
          <MetricCard label="Meslek sayısı" value={summary.totalProfessions} />
          <MetricCard label="Şezlong sayısı" value={summary.totalSunbeds} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Mesleğe göre katılım</CardTitle>
            </CardHeader>
            <CardContent>
              <ResultList
                emptyText="Henüz kayıtlı seçim yok."
                rows={summary.professionBreakdown.map((item) => ({
                  label: item.professionName,
                  value: `${item.count} katılım`,
                }))}
              />
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Final kazananları</CardTitle>
            </CardHeader>
            <CardContent>
              <FinalWinnerList winners={summary.finalWinnerBreakdown} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Meslek yönetimi</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                action={createProfessionAction}
                className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]"
              >
                <div className="space-y-2">
                  <Label htmlFor="profession-name">Meslek adı</Label>
                  <Input id="profession-name" name="name" required />
                </div>
                <Button type="submit" className="self-end">
                  Meslek ekle
                </Button>
              </form>
              <Separator className="mb-4" />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Meslek</TableHead>
                    <TableHead className="text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {professions.map((profession) => (
                    <TableRow key={profession.id}>
                      <TableCell className="font-medium">
                        {profession.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <DeleteConfirmationButton
                            action={deleteProfessionAction}
                            itemId={profession.id}
                            itemName={profession.name}
                            itemType="profession"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Şezlong görselleri</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminSunbedUpload />
              <Separator className="mb-4" />
              <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {paginatedSunbeds.totalItems} şezlong · sayfa{" "}
                  {paginatedSunbeds.page}/{paginatedSunbeds.totalPages}
                </span>
              </div>
              <div className="space-y-2">
                {paginatedSunbeds.items.map((sunbed) => (
                  <div
                    key={sunbed.id}
                    className="grid grid-cols-[56px_1fr_auto] items-center gap-3 rounded-lg border p-2"
                  >
                    <ImagePreviewDialog
                      imagePath={sunbed.imagePath}
                      title={sunbed.title}
                    >
                      <button
                        type="button"
                        className="relative h-12 w-14 overflow-hidden rounded-md bg-muted outline-none transition hover:ring-2 hover:ring-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <Image
                          src={sunbed.imagePath}
                          alt={sunbed.title}
                          fill
                          sizes="112px"
                          className="object-contain p-2"
                        />
                      </button>
                    </ImagePreviewDialog>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {sunbed.title}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        {sunbed.imageFilename}
                      </div>
                    </div>
                    <DeleteConfirmationButton
                      action={deleteSunbedAction}
                      itemId={sunbed.id}
                      itemName={sunbed.title}
                      itemType="sunbed"
                    />
                  </div>
                ))}
              </div>
              <PaginationControls
                page={paginatedSunbeds.page}
                totalPages={paginatedSunbeds.totalPages}
                hasPrevious={paginatedSunbeds.hasPrevious}
                hasNext={paginatedSunbeds.hasNext}
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-5">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-2 text-4xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function FinalWinnerList({
  winners,
}: {
  winners: Array<{
    title: string;
    imagePath: string;
    count: number;
    percentage: number;
  }>;
}) {
  if (winners.length === 0) {
    return <p className="text-sm text-muted-foreground">Henüz final kazananı yok.</p>;
  }

  return (
    <div className="space-y-2">
      {winners.map((winner) => (
        <div
          key={`${winner.title}-${winner.count}-${winner.percentage}`}
          className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-lg border p-2"
        >
          {winner.imagePath ? (
            <ImagePreviewDialog imagePath={winner.imagePath} title={winner.title}>
              <button
                type="button"
                className="relative h-10 w-12 overflow-hidden rounded-md bg-muted outline-none transition hover:ring-2 hover:ring-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Image
                  src={winner.imagePath}
                  alt={winner.title}
                  fill
                  sizes="96px"
                  className="object-contain p-1"
                />
              </button>
            </ImagePreviewDialog>
          ) : (
            <div className="h-10 w-12 rounded-md bg-muted" />
          )}
          <span className="truncate text-sm font-medium">{winner.title}</span>
          <span className="text-sm text-muted-foreground">
            {winner.count} kez · %{winner.percentage}
          </span>
        </div>
      ))}
    </div>
  );
}

function ResultList({
  rows,
  emptyText,
}: {
  rows: Array<{ label: string; value: string }>;
  emptyText: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div
          key={`${row.label}-${row.value}`}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <span className="font-medium">{row.label}</span>
          <span className="text-sm text-muted-foreground">{row.value}</span>
        </div>
      ))}
    </div>
  );
}

function PaginationControls({
  page,
  totalPages,
  hasPrevious,
  hasNext,
}: {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <Link
        {...getAdminSunbedsPaginationLink(page - 1)}
        aria-disabled={!hasPrevious}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          !hasPrevious && "pointer-events-none opacity-50",
        )}
      >
        Önceki
      </Link>
      <span className="text-sm text-muted-foreground">
        {page} / {totalPages}
      </span>
      <Link
        {...getAdminSunbedsPaginationLink(page + 1)}
        aria-disabled={!hasNext}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          !hasNext && "pointer-events-none opacity-50",
        )}
      >
        Sonraki
      </Link>
    </div>
  );
}
