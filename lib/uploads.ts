import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const uploadDirectory = path.join(
  process.cwd(),
  "public",
  "uploads",
  "sunbeds",
);
const publicUploadPath = "/uploads/sunbeds";
const maxUploadSize = 5 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export type StoredSunbedImage = {
  imagePath: string;
  imageFilename: string;
};

export async function saveSunbedImage(
  value: FormDataEntryValue | null,
): Promise<StoredSunbedImage> {
  if (!isFileLike(value) || value.size === 0) {
    throw new Error("Bir şezlong görseli seçin.");
  }

  if (value.size > maxUploadSize) {
    throw new Error("Görsel en fazla 5 MB olabilir.");
  }

  const extension = allowedTypes.get(value.type);
  if (!extension) {
    throw new Error("Yalnızca jpg, png veya webp görseller yüklenebilir.");
  }

  await mkdir(uploadDirectory, { recursive: true });

  const imageFilename = `${randomUUID()}.${extension}`;
  const absolutePath = path.join(uploadDirectory, imageFilename);
  const buffer = Buffer.from(await value.arrayBuffer());

  await writeFile(absolutePath, buffer);

  return {
    imageFilename,
    imagePath: `${publicUploadPath}/${imageFilename}`,
  };
}

export async function deleteSunbedImage(imagePath: string) {
  if (!imagePath.startsWith(`${publicUploadPath}/`)) {
    return;
  }

  const imageFilename = path.basename(imagePath);
  const absolutePath = path.join(uploadDirectory, imageFilename);

  if (!absolutePath.startsWith(uploadDirectory)) {
    return;
  }

  try {
    await unlink(absolutePath);
  } catch {
    // The DB record is the source of truth; a missing stale file should not block deletion.
  }
}

function isFileLike(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "size" in value &&
    "type" in value &&
    "name" in value
  );
}
