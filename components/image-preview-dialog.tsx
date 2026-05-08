"use client";

import Image from "next/image";
import type { ReactElement } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  imagePreviewCanvasClassName,
  imagePreviewDialogClassName,
} from "@/lib/image-preview-layout";

type ImagePreviewDialogProps = {
  imagePath: string;
  title: string;
  children: ReactElement;
};

export function ImagePreviewDialog({
  imagePath,
  title,
  children,
}: ImagePreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger render={children} />
      <DialogContent className={imagePreviewDialogClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className={imagePreviewCanvasClassName}>
          <Image
            src={imagePath}
            alt={title}
            fill
            sizes="90vw"
            className="object-contain p-4"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
