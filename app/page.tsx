import { connection } from "next/server";

import { KioskExperience } from "@/components/kiosk-experience";
import type { KioskConfig } from "@/lib/models";
import { getKioskConfig } from "@/lib/repository";

export const runtime = "nodejs";

export default async function Home() {
  await connection();
  let config: KioskConfig = { professions: [], sunbeds: [] };
  let setupError: string | undefined;

  try {
    config = await getKioskConfig();
  } catch (error) {
    setupError =
      error instanceof Error
        ? error.message
        : "Kiosk yapılandırması alınamadı.";
  }

  return <KioskExperience {...config} setupError={setupError} />;
}
