"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { db } from "@/db";
import {
  about as aboutTable,
  education as educationTable,
  experience as experienceTable,
  workImages as workImagesTable,
  works as worksTable,
} from "@/db/schema";
import { CONTENT_CACHE_TAG } from "@/lib/content";
import { requireAdmin } from "@/lib/require-admin";
import { deleteObject, deleteObjects } from "@/lib/storage";
import {
  aboutSchema,
  educationSchema,
  experienceSchema,
  firstError,
  workSchema,
  type ActionState,
} from "@/lib/validation";

/**
 * Every export here starts with `await requireAdmin()`. Middleware cannot
 * protect a server action — see the note in src/lib/auth.ts.
 */

/** Drops the cached content everywhere it is read. */
function revalidateContent(...paths: string[]) {
  revalidateTag(CONTENT_CACHE_TAG);
  revalidatePath("/", "layout");
  for (const path of paths) revalidatePath(path);
}

const fields = (formData: FormData) =>
  Object.fromEntries(formData.entries()) as Record<string, string>;

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export async function updateAbout(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = aboutSchema.safeParse(fields(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const values = { ...parsed.data, updatedAt: new Date() };

  await db
    .insert(aboutTable)
    .values({ id: 1, ...values })
    .onConflictDoUpdate({ target: aboutTable.id, set: values });

  revalidateContent("/admin/about");
  return { ok: true };
}

/** Sets or clears one of About's file slots, deleting the object it replaces. */
export async function setAboutFile(
  field: "backgroundKey" | "resumeKey",
  key: string
): Promise<void> {
  await requireAdmin();

  const [current] = await db.select().from(aboutTable).limit(1);
  const previousKey = current?.[field] ?? "";

  await db
    .insert(aboutTable)
    .values({ id: 1, [field]: key, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: aboutTable.id,
      set: { [field]: key, updatedAt: new Date() },
    });

  // Row first, then the object: an orphaned file is invisible, whereas a row
  // pointing at a missing object is a broken image on the live site.
  if (previousKey && previousKey !== key) await deleteObject(previousKey);

  revalidateContent("/admin/about");
}

// ---------------------------------------------------------------------------
// Education / Experience
// ---------------------------------------------------------------------------

export async function saveEducation(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = educationSchema.safeParse(fields(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const id = String(formData.get("id") ?? "");
  if (id) {
    await db
      .update(educationTable)
      .set(parsed.data)
      .where(eq(educationTable.id, id));
  } else {
    const [{ next }] = await db
      .select({ next: sql<number>`coalesce(max(${educationTable.sortOrder}), -1) + 1` })
      .from(educationTable);
    await db.insert(educationTable).values({ ...parsed.data, sortOrder: next });
  }

  revalidateContent("/admin/education");
  return { ok: true };
}

export async function deleteEducation(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(educationTable).where(eq(educationTable.id, id));
  revalidateContent("/admin/education");
}

export async function saveExperience(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = experienceSchema.safeParse(fields(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const id = String(formData.get("id") ?? "");
  if (id) {
    await db
      .update(experienceTable)
      .set(parsed.data)
      .where(eq(experienceTable.id, id));
  } else {
    const [{ next }] = await db
      .select({ next: sql<number>`coalesce(max(${experienceTable.sortOrder}), -1) + 1` })
      .from(experienceTable);
    await db.insert(experienceTable).values({ ...parsed.data, sortOrder: next });
  }

  revalidateContent("/admin/experience");
  return { ok: true };
}

export async function deleteExperience(id: string): Promise<void> {
  await requireAdmin();
  await db.delete(experienceTable).where(eq(experienceTable.id, id));
  revalidateContent("/admin/experience");
}

// ---------------------------------------------------------------------------
// Works
// ---------------------------------------------------------------------------

export async function createWork(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState & { id?: string }> {
  await requireAdmin();

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required" };

  const [{ next }] = await db
    .select({ next: sql<number>`coalesce(max(${worksTable.sortOrder}), -1) + 1` })
    .from(worksTable);

  const [row] = await db
    .insert(worksTable)
    .values({ title, sortOrder: next })
    .returning({ id: worksTable.id });

  revalidateContent("/admin/works");
  return { ok: true, id: row.id };
}

export async function updateWork(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing work id" };

  const parsed = workSchema.safeParse(fields(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  await db.update(worksTable).set(parsed.data).where(eq(worksTable.id, id));

  revalidateContent("/admin/works", `/works/${id}`);
  return { ok: true };
}

export async function deleteWork(id: string): Promise<void> {
  await requireAdmin();

  const images = await db
    .select({ key: workImagesTable.key })
    .from(workImagesTable)
    .where(eq(workImagesTable.workId, id));
  const [work] = await db
    .select({ pdfKey: worksTable.pdfKey })
    .from(worksTable)
    .where(eq(worksTable.id, id));

  // work_images rows go with the cascade.
  await db.delete(worksTable).where(eq(worksTable.id, id));
  await deleteObjects([...images.map((i) => i.key), work?.pdfKey ?? ""]);

  revalidateContent("/admin/works");
}

export async function setWorkPdf(workId: string, key: string): Promise<void> {
  await requireAdmin();

  const [work] = await db
    .select({ pdfKey: worksTable.pdfKey })
    .from(worksTable)
    .where(eq(worksTable.id, workId));

  await db.update(worksTable).set({ pdfKey: key }).where(eq(worksTable.id, workId));
  if (work?.pdfKey && work.pdfKey !== key) await deleteObject(work.pdfKey);

  revalidateContent("/admin/works", `/works/${workId}`);
}

/** Persists a drag-reorder as one statement per row. */
export async function reorder(
  table: "works" | "education" | "experience",
  orderedIds: string[]
): Promise<void> {
  await requireAdmin();

  const target =
    table === "works"
      ? worksTable
      : table === "education"
        ? educationTable
        : experienceTable;

  await Promise.all(
    orderedIds.map((id, index) =>
      db.update(target).set({ sortOrder: index }).where(eq(target.id, id))
    )
  );

  revalidateContent(`/admin/${table}`);
}
