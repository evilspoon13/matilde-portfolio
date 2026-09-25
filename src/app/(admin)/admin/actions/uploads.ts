"use server";

import { asc, eq, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { db } from "@/db";
import { workImages as workImagesTable } from "@/db/schema";
import { CONTENT_CACHE_TAG } from "@/lib/content";
import { requireAdmin } from "@/lib/require-admin";
import { buildKey, createUploadUrl, deleteObject } from "@/lib/storage";

/**
 * Uploads go browser -> R2 directly, never through a serverless function:
 * Vercel caps request bodies at 4.5MB. The browser resizes the image first
 * (src/lib/image-resize.ts), asks for a presigned PUT here, uploads, and then
 * calls back to record the key.
 *
 * Ordering is deliberately fail-safe. If the PUT fails, no row was written and
 * the only residue is an object that was never created.
 */

export async function requestUploadUrl(input: {
  scope: "about" | "work";
  workId?: string;
  filename: string;
  contentType: string;
  extension: string;
}): Promise<{ uploadUrl: string; key: string }> {
  await requireAdmin();

  const key = buildKey(input.scope, {
    workId: input.workId,
    filename: input.filename,
    extension: input.extension,
  });

  return { uploadUrl: await createUploadUrl(key, input.contentType), key };
}

export async function attachWorkImage(input: {
  workId: string;
  key: string;
  width: number;
  height: number;
}): Promise<void> {
  await requireAdmin();

  const [{ next }] = await db
    .select({
      next: sql<number>`coalesce(max(${workImagesTable.sortOrder}), -1) + 1`,
    })
    .from(workImagesTable)
    .where(eq(workImagesTable.workId, input.workId));

  await db.insert(workImagesTable).values({ ...input, sortOrder: next });

  revalidateTag(CONTENT_CACHE_TAG);
  revalidatePath(`/works/${input.workId}`);
  revalidatePath(`/admin/works/${input.workId}`);
}

export async function deleteWorkImage(imageId: string): Promise<void> {
  await requireAdmin();

  const [image] = await db
    .select()
    .from(workImagesTable)
    .where(eq(workImagesTable.id, imageId));
  if (!image) return;

  await db.delete(workImagesTable).where(eq(workImagesTable.id, imageId));
  await deleteObject(image.key);

  revalidateTag(CONTENT_CACHE_TAG);
  revalidatePath(`/works/${image.workId}`);
  revalidatePath(`/admin/works/${image.workId}`);
}

export async function reorderWorkImages(
  workId: string,
  orderedIds: string[]
): Promise<void> {
  await requireAdmin();

  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(workImagesTable)
        .set({ sortOrder: index })
        .where(eq(workImagesTable.id, id))
    )
  );

  revalidateTag(CONTENT_CACHE_TAG);
  revalidatePath(`/works/${workId}`);
  revalidatePath(`/admin/works/${workId}`);
}

export async function listWorkImages(workId: string) {
  await requireAdmin();
  return db
    .select()
    .from(workImagesTable)
    .where(eq(workImagesTable.workId, workId))
    .orderBy(asc(workImagesTable.sortOrder));
}
