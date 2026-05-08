import Image from "next/image";

import { cn } from "@/lib/utils";

export function LogoHeader({
  compact = false,
  tone = "default",
  className,
}: {
  compact?: boolean;
  tone?: "default" | "light";
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex w-full justify-center px-4 py-5 md:pb-14 md:pt-24",
        className,
      )}
    >
      <Image
        src="/logo.svg"
        alt="Tilia"
        width={compact ? 64 : 86}
        height={compact ? 64 : 86}
        priority
        className={cn(
          "h-auto",
          compact ? "w-16" : "w-20 md:w-24",
          tone === "light" && "invert",
        )}
      />
    </header>
  );
}
