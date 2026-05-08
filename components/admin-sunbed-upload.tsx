"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Progress,
  ProgressLabel,
} from "@/components/ui/progress";
import {
  createUploadBatches,
  defaultUploadBatchSize,
} from "@/lib/upload-batches";

type UploadStatus = {
  state: "idle" | "uploading" | "success" | "error";
  message?: string;
  uploaded: number;
  total: number;
};

const initialStatus: UploadStatus = {
  state: "idle",
  uploaded: 0,
  total: 0,
};

export function AdminSunbedUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<UploadStatus>(initialStatus);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const files = Array.from(fileInputRef.current?.files ?? []);
    if (files.length === 0) {
      setStatus({
        state: "error",
        message: "Yüklemek için en az bir görsel seçin.",
        uploaded: 0,
        total: 0,
      });
      return;
    }

    const batches = createUploadBatches(files, defaultUploadBatchSize);
    let uploaded = 0;

    setStatus({
      state: "uploading",
      uploaded: 0,
      total: files.length,
      message: "Görseller yükleniyor.",
    });

    for (const batch of batches) {
      const formData = new FormData();
      for (const file of batch) {
        formData.append("images", file);
      }

      const response = await fetch("/api/admin/sunbeds", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        setStatus({
          state: "error",
          uploaded,
          total: files.length,
          message: body?.error ?? "Yükleme sırasında bir hata oluştu.",
        });
        return;
      }

      uploaded += batch.length;
      setStatus({
        state: "uploading",
        uploaded,
        total: files.length,
        message: `${uploaded}/${files.length} görsel yüklendi.`,
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setStatus({
      state: "success",
      uploaded,
      total: files.length,
      message: `${uploaded} görsel yüklendi.`,
    });
    router.refresh();
  }

  const progressValue =
    status.total === 0 ? 0 : Math.round((status.uploaded / status.total) * 100);

  return (
    <form onSubmit={handleSubmit} className="mb-5 space-y-3">
      <div className="space-y-2">
        <Label htmlFor="sunbed-images">Şezlong görselleri</Label>
        <Input
          ref={fileInputRef}
          id="sunbed-images"
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          required
          disabled={status.state === "uploading"}
        />
        <p className="text-sm text-muted-foreground">
          Birden fazla görsel seçebilirsiniz.
        </p>
      </div>

      {status.state === "uploading" && (
        <Progress value={progressValue}>
          <ProgressLabel>{status.message}</ProgressLabel>
        </Progress>
      )}

      {(status.state === "success" || status.state === "error") && (
        <Alert>
          <AlertTitle>
            {status.state === "success" ? "Yükleme tamamlandı" : "Yükleme hatası"}
          </AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={status.state === "uploading"}
      >
        {status.state === "uploading" ? "Yükleniyor" : "Toplu yükle"}
      </Button>
    </form>
  );
}
