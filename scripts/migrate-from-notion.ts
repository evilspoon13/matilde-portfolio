import "dotenv/config";

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { eq } from "drizzle-orm";
import sharp from "sharp";

import { db } from "@/db";
import { about, education, experience, workImages, works } from "@/db/schema";
import { Client } from "@notionhq/client";

import { objectExists, publicUrl, putObject } from "@/lib/storage";

/**
 * One-off migration: Notion -> Neon + R2.
 *
 *   npm run migrate:notion -- --dry-run
 *   npm run migrate:notion
 *   npm run migrate:notion -- --force        # re-upload files that already exist
 *   npm run migrate:notion -- --only=works
 *
 * Safe to re-run: rows are upserted by primary key, work galleries are
 * replaced wholesale, and R2 keys are DERIVED FROM the Notion file path
 * (rather than random) so a second run reuses the objects it already pushed
 * instead of duplicating them.
 *
 * Keep this file after the cutover. It is the written record of how Notion's
 * fields map onto the new schema, and the only path back if the migration has
 * to be redone.
 */

// ---------------------------------------------------------------------------
// Notion source
//
// Inlined here rather than imported from src/: this script is the only Notion
// consumer left, and keeping it self-contained is what lets the app ship with
// no Notion code and @notionhq/client as a devDependency.
// ---------------------------------------------------------------------------

const notion = new Client({ auth: process.env.NOTION_API_KEY });

/* eslint-disable @typescript-eslint/no-explicit-any */
const richText = (prop: any): string =>
  prop?.rich_text?.map((t: any) => t.plain_text).join("") || "";
const titleOf = (prop: any): string =>
  prop?.title?.map((t: any) => t.plain_text).join("") || "";
const fileUrl = (prop: any): string =>
  prop?.files?.[0]?.file?.url || prop?.files?.[0]?.external?.url || "";
const fileUrls = (prop: any): string[] =>
  prop?.files?.map((f: any) => f.file?.url || f.external?.url || "").filter(Boolean) || [];

/** The stable S3 path behind a signed Notion URL, minus the expiring signature. */
function notionFileKey(signedUrl: string): string | null {
  if (!signedUrl) return null;
  try {
    const url = new URL(signedUrl);
    if (!url.hostname.endsWith(".amazonaws.com")) return null;
    return url.pathname.replace(/^\/+/, "");
  } catch {
    return null;
  }
}

async function fetchAbout() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_ABOUT_DB_ID!,
  } as any);
  if (response.results.length === 0) return null;

  const page = response.results[0] as any;
  const props = page.properties;
  return {
    id: page.id as string,
    name: titleOf(props.Name),
    jobTitle: richText(props["Job Title"]),
    profileImage: fileUrl(props["Profile Image"]),
    aboutText: richText(props["About Text"]),
    about: richText(props["About"]),
    skills: (props.Skills?.multi_select?.map((s: any) => s.name) || []) as string[],
    resume: fileUrl(props.Resume),
    portfolio: fileUrl(props.Portfolio),
    background: fileUrl(props.Background),
  };
}

async function fetchEducation() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_EDUCATION_DB_ID!,
    sorts: [{ property: "Start Date", direction: "descending" }],
  } as any);

  return response.results.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id as string,
      degree: richText(props.Degree),
      school: titleOf(props.School),
      fieldOfStudy: richText(props["Field of Study"]),
      startDate: props["Start Date"]?.date?.start || "",
      endDate: props["End Date"]?.date?.start || "",
      current: props.Current?.checkbox || false,
      description: richText(props.Description),
    };
  });
}

async function fetchExperience() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_EXPERIENCE_DB_ID!,
    sorts: [{ property: "Start Date", direction: "descending" }],
  } as any);

  return response.results.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id as string,
      role: richText(props.Role),
      company: titleOf(props.Company),
      startDate: props["Start Date"]?.date?.start || "",
      endDate: props["End Date"]?.date?.start || "",
      current: props.Current?.checkbox || false,
      summary: richText(props.Summary),
    };
  });
}

async function fetchWorks() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_WORKS_DB_ID!,
  } as any);

  return response.results.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id as string,
      title: titleOf(props.Title),
      date: props.Date?.date?.start || "",
      description: richText(props.Description),
      images: fileUrls(props.Image),
      details: (props.Details?.multi_select?.map((d: any) => d.name) || []) as string[],
      location: richText(props.Location),
      client: richText(props.Client),
      pdf: fileUrl(props.PDF),
    };
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const FORCE = args.includes("--force");
const ONLY = args.find((a) => a.startsWith("--only="))?.split("=")[1];

const shouldRun = (name: string) => !ONLY || ONLY === name;

const log = (...parts: unknown[]) => console.log(...parts);

let uploadedBytesBefore = 0;
let uploadedBytesAfter = 0;
let uploadedCount = 0;
let skippedCount = 0;

/** Stable short id for a Notion file, so re-runs land on the same R2 key. */
const digest = (value: string) =>
  createHash("sha1").update(value).digest("hex").slice(0, 12);

/**
 * The raw fetchers return live signed S3 URLs. `notionFileKey` strips the
 * signature down to the stable S3 path, which is what we hash for the R2 key —
 * so a re-run lands on the same object instead of uploading a duplicate.
 */
async function downloadNotionFile(
  signedUrl: string
): Promise<{ buffer: Buffer; notionKey: string } | null> {
  if (!signedUrl) return null;

  const notionKey = notionFileKey(signedUrl);
  if (!notionKey) {
    log(`    ! not a Notion-hosted file, skipping: ${signedUrl.slice(0, 60)}`);
    return null;
  }

  const response = await fetch(signedUrl);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}) for ${notionKey}`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    notionKey,
  };
}

type Uploaded = { key: string; width: number; height: number };

/**
 * Archive the untouched original, then store the web-sized version.
 *
 * The archive copy matters: Notion is currently the only place these files
 * exist, and its signed URLs expire within the hour. Once the integration is
 * revoked they are unrecoverable.
 */
async function uploadImage(
  proxiedUrl: string,
  prefix: string
): Promise<Uploaded | null> {
  const file = await downloadNotionFile(proxiedUrl);
  if (!file) return null;

  const id = digest(file.notionKey);
  const key = `${prefix}/${id}.webp`;
  const originalKey = `originals/${file.notionKey}`;

  if (!FORCE && (await objectExists(key))) {
    // Still need the dimensions for the database row.
    const meta = await sharp(file.buffer).metadata();
    skippedCount++;
    log(`    = ${key} (already uploaded)`);
    return { key, width: meta.width ?? 0, height: meta.height ?? 0 };
  }

  const { data, info } = await sharp(file.buffer)
    .rotate() // apply EXIF orientation before the metadata is dropped
    .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  if (!DRY_RUN) {
    await putObject(originalKey, file.buffer, "application/octet-stream");
    await putObject(key, data, "image/webp");
  }

  uploadedBytesBefore += file.buffer.byteLength;
  uploadedBytesAfter += data.byteLength;
  uploadedCount++;

  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)}MB`;
  log(`    + ${key}  ${mb(file.buffer.byteLength)} -> ${mb(data.byteLength)}`);

  return { key, width: info.width, height: info.height };
}

async function uploadDocument(
  proxiedUrl: string,
  prefix: string
): Promise<string | null> {
  const file = await downloadNotionFile(proxiedUrl);
  if (!file) return null;

  const key = `${prefix}/${digest(file.notionKey)}.pdf`;

  if (!FORCE && (await objectExists(key))) {
    skippedCount++;
    log(`    = ${key} (already uploaded)`);
    return key;
  }

  if (!DRY_RUN) {
    await putObject(key, file.buffer, "application/pdf");
  }
  uploadedCount++;
  log(`    + ${key}`);
  return key;
}

async function migrateAbout() {
  log("\nAbout");
  const source = await fetchAbout();
  if (!source) {
    log("  ! no About row in Notion, skipping");
    return;
  }

  const background = await uploadImage(source.background, "about");
  const resumeKey = await uploadDocument(source.resume, "about");

  // The profile image is not part of the new schema — nothing on the site has
  // ever rendered it — but Notion is its only copy, so archive the bytes
  // before the integration goes away.
  if (source.profileImage) {
    const file = await downloadNotionFile(source.profileImage);
    if (file) {
      const archiveKey = `originals/${file.notionKey}`;
      if (FORCE || !(await objectExists(archiveKey))) {
        if (!DRY_RUN) {
          await putObject(archiveKey, file.buffer, "application/octet-stream");
        }
        log(`    + ${archiveKey} (archive only — profile image is not in the schema)`);
      }
    }
  }

  // The portfolio book is an external Heyzine link now, set in /admin, so
  // there is no PDF to carry over.

  if (DRY_RUN) return;

  await db
    .insert(about)
    .values({
      id: 1,
      name: source.name,
      jobTitle: source.jobTitle,
      aboutText: source.aboutText,
      about: source.about,
      skills: source.skills,
      resumeKey: resumeKey ?? "",
      backgroundKey: background?.key ?? "",
    })
    .onConflictDoUpdate({
      target: about.id,
      set: {
        name: source.name,
        jobTitle: source.jobTitle,
        aboutText: source.aboutText,
        about: source.about,
        skills: source.skills,
        resumeKey: resumeKey ?? "",
          backgroundKey: background?.key ?? "",
        updatedAt: new Date(),
      },
    });

  log(`  ok — ${source.name}, ${source.skills.length} skills`);
}

async function migrateEducation() {
  log("\nEducation");
  const rows = await fetchEducation();
  if (DRY_RUN) {
    log(`  would insert ${rows.length} rows`);
    return;
  }

  for (const [index, row] of rows.entries()) {
    await db
      .insert(education)
      .values({
        id: row.id,
        degree: row.degree,
        school: row.school,
        fieldOfStudy: row.fieldOfStudy,
        startDate: row.startDate,
        endDate: row.endDate,
        current: row.current,
        description: row.description,
        // Notion sorted by Start Date desc; freeze that as the initial order.
        sortOrder: index,
      })
      .onConflictDoUpdate({
        target: education.id,
        set: {
          degree: row.degree,
          school: row.school,
          fieldOfStudy: row.fieldOfStudy,
          startDate: row.startDate,
          endDate: row.endDate,
          current: row.current,
          description: row.description,
          sortOrder: index,
        },
      });
  }
  log(`  ok — ${rows.length} rows`);
}

async function migrateExperience() {
  log("\nExperience");
  const rows = await fetchExperience();
  if (DRY_RUN) {
    log(`  would insert ${rows.length} rows`);
    return;
  }

  for (const [index, row] of rows.entries()) {
    await db
      .insert(experience)
      .values({
        id: row.id,
        role: row.role,
        company: row.company,
        startDate: row.startDate,
        endDate: row.endDate,
        current: row.current,
        summary: row.summary,
        sortOrder: index,
      })
      .onConflictDoUpdate({
        target: experience.id,
        set: {
          role: row.role,
          company: row.company,
          startDate: row.startDate,
          endDate: row.endDate,
          current: row.current,
          summary: row.summary,
          sortOrder: index,
        },
      });
  }
  log(`  ok — ${rows.length} rows`);
}

async function migrateWorks() {
  log("\nWorks");
  const rows = await fetchWorks();

  for (const [index, work] of rows.entries()) {
    log(`  ${work.title || "(untitled)"}  [${work.id}]`);

    const pdfKey = work.pdf
      ? await uploadDocument(work.pdf, `works/${work.id}`)
      : null;

    const images: Uploaded[] = [];
    for (const imageUrl of work.images) {
      const uploaded = await uploadImage(imageUrl, `works/${work.id}`);
      if (uploaded) images.push(uploaded);
    }

    if (DRY_RUN) continue;

    await db
      .insert(works)
      .values({
        // The Notion page UUID is carried over verbatim. These ids are in the
        // public /works/<id> URLs and in generateStaticParams — change them
        // and every existing link 404s.
        id: work.id,
        title: work.title,
        date: work.date,
        description: work.description,
        details: work.details,
        location: work.location,
        client: work.client,
        pdfKey: pdfKey ?? "",
        // Notion's Works database had no sort, so the API's default order IS
        // the order the site shows today. Freeze it.
        sortOrder: index,
      })
      .onConflictDoUpdate({
        target: works.id,
        set: {
          title: work.title,
          date: work.date,
          description: work.description,
          details: work.details,
          location: work.location,
          client: work.client,
          pdfKey: pdfKey ?? "",
          sortOrder: index,
        },
      });

    // Replace the gallery wholesale — keys are deterministic, so the R2
    // objects are reused and only the rows are rewritten.
    await db.delete(workImages).where(eq(workImages.workId, work.id));
    if (images.length > 0) {
      await db.insert(workImages).values(
        images.map((image, imageIndex) => ({
          workId: work.id,
          key: image.key,
          width: image.width,
          height: image.height,
          sortOrder: imageIndex,
        }))
      );
    }
  }

  log(`  ok — ${rows.length} works`);
}

async function verify() {
  log("\nVerification");

  const [aboutRows, educationRows, experienceRows, workRows, imageRows] =
    await Promise.all([
      db.select().from(about),
      db.select().from(education),
      db.select().from(experience),
      db.select().from(works),
      db.select().from(workImages),
    ]);

  log(`  about        ${aboutRows.length}`);
  log(`  education    ${educationRows.length}`);
  log(`  experience   ${experienceRows.length}`);
  log(`  works        ${workRows.length}`);
  log(`  work_images  ${imageRows.length}`);

  const problems: string[] = [];

  const notionWorks = await fetchWorks();
  const notionIds = new Set(notionWorks.map((w) => w.id));
  const migratedIds = new Set(workRows.map((w) => w.id));
  for (const id of notionIds) {
    if (!migratedIds.has(id)) problems.push(`work ${id} did not migrate`);
  }

  for (const work of workRows) {
    const count = imageRows.filter((i) => i.workId === work.id).length;
    if (count === 0) problems.push(`work "${work.title}" has no images`);
  }

  const aboutRow = aboutRows[0];
  if (!aboutRow) problems.push("no about row");
  // background is optional — the site renders nothing when it is unset.
  if (aboutRow && !aboutRow.resumeKey) problems.push("about.resume_key is empty");

  if (problems.length > 0) {
    log("\n  PROBLEMS:");
    for (const problem of problems) log(`   - ${problem}`);
  } else {
    log("  no problems found");
  }

  const sample = imageRows.slice(0, 3).map((i) => publicUrl(i.key));
  if (sample.length > 0) {
    log("\n  Spot-check these URLs in a browser:");
    for (const url of sample) log(`   ${url}`);
  }

  return problems.length;
}

async function main() {
  log(
    `Migrating Notion -> Neon + R2${DRY_RUN ? "  (DRY RUN, no writes)" : ""}${
      ONLY ? `  (only: ${ONLY})` : ""
    }`
  );

  if (shouldRun("about")) await migrateAbout();
  if (shouldRun("education")) await migrateEducation();
  if (shouldRun("experience")) await migrateExperience();
  if (shouldRun("works")) await migrateWorks();

  const mb = (n: number) => `${(n / 1024 / 1024).toFixed(1)}MB`;
  log(
    `\nFiles: ${uploadedCount} uploaded, ${skippedCount} already present` +
      (uploadedCount > 0
        ? `  (${mb(uploadedBytesBefore)} -> ${mb(uploadedBytesAfter)})`
        : "")
  );

  if (DRY_RUN) {
    log("\nDry run complete — nothing was written.");
    return;
  }

  const problems = await verify();
  if (problems > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error("\nMigration failed:", error);
  process.exit(1);
});
