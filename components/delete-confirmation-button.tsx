"use client";

import { Trash2Icon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  getDeleteConfirmationCopy,
  type DeleteConfirmationItemType,
} from "@/lib/admin-delete-confirmation";

type DeleteConfirmationButtonProps = {
  action: (formData: FormData) => Promise<void>;
  itemId: string;
  itemName: string;
  itemType: DeleteConfirmationItemType;
};

export function DeleteConfirmationButton({
  action,
  itemId,
  itemName,
  itemType,
}: DeleteConfirmationButtonProps) {
  const copy = getDeleteConfirmationCopy({ itemType, itemName });

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button type="button" variant="destructive" size="sm" />
        }
      >
        <Trash2Icon />
        Sil
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <form action={action}>
          <input type="hidden" name="id" value={itemId} />
          <AlertDialogFooter>
            <AlertDialogClose
              render={
                <Button type="button" variant="outline" />
              }
            >
              {copy.cancelLabel}
            </AlertDialogClose>
            <Button type="submit" variant="destructive">
              <Trash2Icon />
              {copy.confirmLabel}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
