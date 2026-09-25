import { asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { db } from "@/db";
import {
  about as aboutTable,
  education as educationTable,
  experience as experienceTable,
  workImages as workImagesTable,
  works as worksTable,
} from "@/db/schema";
import { publicUrl } from "@/lib/storage";
import type { About, Education, Experience, Work } from "@/types/content";

/**
 * The read side of the CMS. Replaces the old Notion data layer with the same
 * five functions and the same return shapes, so the pages and components that
 * consume them did not change.
 *
 * Two layers of caching, as before: unstable_cache persists across requests
 * (so a build or a revalidation pass hits the database once per collection
 * rather than once per page), and React cache() dedupes within a single
 * render (the layout and the page both ask for `about`).
 *
 * Writes in /admin call revalidateTag(CONTENT_CACHE_TAG), so the time-based
 * window below is only a backstop.
 */
export const CONTENT_CACHE_TAG = "content";
const REVALIDATE_SECONDS = 3600;

const cacheOptions = {
  revalidate: REVALIDATE_SECONDS,
  tags: [CONTENT_CACHE_TAG],
};

async function fetchAbout(): Promise<About | null> {
  const [row] = await db.select().from(aboutTable).limit(1);
  if (!row) return null;

  return {
    id: String(row.id),
    name: row.name,
    jobTitle: row.jobTitle,
    aboutText: row.aboutText,
    about: row.about,
    skills: row.skills,
    resume: publicUrl(row.resumeKey),
    portfolio: row.portfolioUrl,
    background: publicUrl(row.backgroundKey),
  };
}

async function fetchEducation(): Promise<Education[]> {
  const rows = await db
    .select()
    .from(educationTable)
    .orderBy(asc(educationTable.sortOrder));

  return rows.map((row) => ({
    id: row.id,
    degree: row.degree,
    school: row.school,
    fieldOfStudy: row.fieldOfStudy,
    startDate: row.startDate,
    endDate: row.endDate,
    current: row.current,
    description: row.description,
  }));
}

async function fetchExperience(): Promise<Experience[]> {
  const rows = await db
    .select()
    .from(experienceTable)
    .orderBy(asc(experienceTable.sortOrder));

  return rows.map((row) => ({
    id: row.id,
    role: row.role,
    company: row.company,
    startDate: row.startDate,
    endDate: row.endDate,
    current: row.current,
    summary: row.summary,
  }));
}

async function fetchWorks(): Promise<Work[]> {
  // Two queries rather than a join: the gallery would multiply the work rows,
  // and at this size collapsing them in JS is simpler and just as fast.
  const [rows, images] = await Promise.all([
    db.select().from(worksTable).orderBy(asc(worksTable.sortOrder)),
    db
      .select()
      .from(workImagesTable)
      .orderBy(asc(workImagesTable.workId), asc(workImagesTable.sortOrder)),
  ]);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    date: row.date,
    description: row.description,
    images: images
      .filter((image) => image.workId === row.id)
      .map((image) => publicUrl(image.key)),
    details: row.details,
    location: row.location,
    client: row.client,
    pdf: publicUrl(row.pdfKey),
  }));
}

const cachedAbout = unstable_cache(fetchAbout, ["content:about"], cacheOptions);
const cachedEducation = unstable_cache(
  fetchEducation,
  ["content:education"],
  cacheOptions
);
const cachedExperience = unstable_cache(
  fetchExperience,
  ["content:experience"],
  cacheOptions
);
const cachedWorks = unstable_cache(fetchWorks, ["content:works"], cacheOptions);

export const getAbout = cache(async (): Promise<About | null> => cachedAbout());

export const getEducation = cache(
  async (): Promise<Education[]> => cachedEducation()
);

export const getExperience = cache(
  async (): Promise<Experience[]> => cachedExperience()
);

export const getWorks = cache(async (): Promise<Work[]> => cachedWorks());

export const getWorkById = cache(async (id: string): Promise<Work | null> => {
  // Reads the cached list rather than querying by id: /works/[id] is
  // prerendered for every work, so the list is already warm and a per-id
  // query would just add a second cache entry.
  const works = await getWorks();
  return works.find((work) => work.id === id) ?? null;
});

/** Uncached reads for /admin, which must never see stale data. */
export const adminQueries = {
  about: fetchAbout,
  education: fetchEducation,
  experience: fetchExperience,
  works: fetchWorks,
  async workImages(workId: string) {
    return db
      .select()
      .from(workImagesTable)
      .where(eq(workImagesTable.workId, workId))
      .orderBy(asc(workImagesTable.sortOrder));
  },
};
