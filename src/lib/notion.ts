import { Client } from '@notionhq/client';
import { QueryDatabaseParameters } from '@notionhq/client/build/src/api-endpoints';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { About, Education, Experience, Work } from '@/types/notion';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

/**
 * Notion re-signs its S3 file URLs on every query (the path is stable, the
 * X-Amz-* signature is not, and it expires in an hour). A URL that changes on
 * every request can never be cached by next/image, so we hand the browser a
 * stable /api/img/<path> URL instead and re-sign server-side. See imageIndex.
 */
export const NOTION_CACHE_TAG = 'notion';
const REVALIDATE_SECONDS = 600;

const richText = (prop: any): string =>
  prop?.rich_text?.map((t: any) => t.plain_text).join('') || '';

const title = (prop: any): string =>
  prop?.title?.map((t: any) => t.plain_text).join('') || '';

const fileUrl = (prop: any): string =>
  prop?.files?.[0]?.file?.url || prop?.files?.[0]?.external?.url || '';

const fileUrls = (prop: any): string[] =>
  prop?.files?.map((f: any) => f.file?.url || f.external?.url || '').filter(Boolean) || [];

/** Stable cache key for a Notion-hosted file: the S3 path, minus the signature. */
export function notionFileKey(signedUrl: string): string | null {
  if (!signedUrl) return null;
  try {
    const u = new URL(signedUrl);
    if (!u.hostname.endsWith('.amazonaws.com')) return null;
    return u.pathname.replace(/^\/+/, '');
  } catch {
    return null;
  }
}

/** Browser-facing URL for a Notion file: stable, so it can actually be cached. */
export function proxiedFileUrl(signedUrl: string): string {
  const key = notionFileKey(signedUrl);
  if (!key) return signedUrl;
  return `/api/img/${key.split('/').map(encodeURIComponent).join('/')}`;
}

// ---------------------------------------------------------------------------
// Raw fetchers — these return live signed URLs and are what the cache wraps.
// ---------------------------------------------------------------------------

async function fetchAbout(): Promise<About | null> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_ABOUT_DB_ID!,
  } as QueryDatabaseParameters);

  if (response.results.length === 0) return null;

  const props = (response.results[0] as any).properties;

  return {
    id: response.results[0].id,
    name: title(props.Name),
    jobTitle: richText(props['Job Title']),
    profileImage: fileUrl(props['Profile Image']),
    aboutText: richText(props['About Text']),
    about: richText(props['About']),
    skills: props.Skills?.multi_select?.map((s: any) => s.name) || [],
    resume: fileUrl(props.Resume),
    portfolio: fileUrl(props.Portfolio),
    background: fileUrl(props.Background),
  };
}

async function fetchEducation(): Promise<Education[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_EDUCATION_DB_ID!,
    sorts: [{ property: 'Start Date', direction: 'descending' }],
  } as QueryDatabaseParameters);

  return response.results.map((page) => {
    const props = (page as any).properties;
    return {
      id: page.id,
      degree: richText(props.Degree),
      school: title(props.School),
      fieldOfStudy: richText(props['Field of Study']),
      level: props.Level?.select?.name || '',
      startDate: props['Start Date']?.date?.start || '',
      endDate: props['End Date']?.date?.start || '',
      current: props.Current?.checkbox || false,
      location: richText(props.Location),
      gpa: props.GPA?.number?.toString() || '',
      description: richText(props.Description),
    };
  });
}

async function fetchExperience(): Promise<Experience[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_EXPERIENCE_DB_ID!,
    sorts: [{ property: 'Start Date', direction: 'descending' }],
  } as QueryDatabaseParameters);

  return response.results.map((page) => {
    const props = (page as any).properties;
    return {
      id: page.id,
      role: richText(props.Role),
      company: title(props.Company),
      location: richText(props.Location),
      employmentType: props['Employment Type']?.multi_select?.map((t: any) => t.name).join(', ') || '',
      startDate: props['Start Date']?.date?.start || '',
      endDate: props['End Date']?.date?.start || '',
      current: props.Current?.checkbox || false,
      skills: props.Skills?.multi_select?.map((s: any) => s.name) || [],
      summary: richText(props.Summary),
      highlights: richText(props.Highlights).split('\n').filter((h: string) => h.trim()),
    };
  });
}

async function fetchWorks(): Promise<Work[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_WORKS_DB_ID!,
  } as QueryDatabaseParameters);

  return response.results.map((page) => {
    const props = (page as any).properties;
    return {
      id: page.id,
      title: title(props.Title),
      date: props.Date?.date?.start || '',
      description: richText(props.Description),
      images: fileUrls(props.Image),
      details: props.Details?.multi_select?.map((d: any) => d.name) || [],
      location: richText(props.Location),
      client: richText(props.Client),
      pdf: fileUrl(props.PDF),
    };
  });
}

// ---------------------------------------------------------------------------
// Cached layer. unstable_cache persists across requests (Vercel Data Cache);
// react cache() dedupes repeat calls inside a single render.
// ---------------------------------------------------------------------------

const cachedAbout = unstable_cache(fetchAbout, ['notion:about'], {
  revalidate: REVALIDATE_SECONDS,
  tags: [NOTION_CACHE_TAG],
});

const cachedEducation = unstable_cache(fetchEducation, ['notion:education'], {
  revalidate: REVALIDATE_SECONDS,
  tags: [NOTION_CACHE_TAG],
});

const cachedExperience = unstable_cache(fetchExperience, ['notion:experience'], {
  revalidate: REVALIDATE_SECONDS,
  tags: [NOTION_CACHE_TAG],
});

const cachedWorks = unstable_cache(fetchWorks, ['notion:works'], {
  revalidate: REVALIDATE_SECONDS,
  tags: [NOTION_CACHE_TAG],
});

// ---------------------------------------------------------------------------
// Public API — image/file URLs are rewritten to the stable proxy.
// ---------------------------------------------------------------------------

export const getAbout = cache(async (): Promise<About | null> => {
  const about = await cachedAbout();
  if (!about) return null;
  return {
    ...about,
    profileImage: proxiedFileUrl(about.profileImage),
    background: proxiedFileUrl(about.background),
    resume: proxiedFileUrl(about.resume),
    portfolio: proxiedFileUrl(about.portfolio),
  };
});

export const getEducation = cache(async (): Promise<Education[]> => cachedEducation());

export const getExperience = cache(async (): Promise<Experience[]> => cachedExperience());

export const getWorks = cache(async (): Promise<Work[]> => {
  const works = await cachedWorks();
  return works.map((w) => ({
    ...w,
    images: w.images.map(proxiedFileUrl),
    pdf: proxiedFileUrl(w.pdf),
  }));
});

export const getWorkById = cache(async (id: string): Promise<Work | null> => {
  const works = await getWorks();
  return works.find((w) => w.id === id) ?? null;
});

/**
 * Stable-key -> live-signed-URL map for every Notion file we serve. Used only
 * by /api/img to re-sign a request. `fresh` bypasses the cache, for when a
 * cached signature has already expired.
 */
async function buildImageIndex(): Promise<Record<string, string>> {
  const [about, works] = await Promise.all([fetchAbout(), fetchWorks()]);

  const index: Record<string, string> = {};
  const add = (url: string) => {
    const key = notionFileKey(url);
    if (key) index[key] = url;
  };

  if (about) {
    add(about.profileImage);
    add(about.background);
    add(about.resume);
    add(about.portfolio);
  }
  for (const work of works) {
    work.images.forEach(add);
    add(work.pdf);
  }

  return index;
}

const cachedImageIndex = unstable_cache(buildImageIndex, ['notion:image-index'], {
  revalidate: REVALIDATE_SECONDS,
  tags: [NOTION_CACHE_TAG],
});

export async function getSignedFileUrl(key: string, fresh = false): Promise<string | null> {
  const index = fresh ? await buildImageIndex() : await cachedImageIndex();
  return index[key] ?? null;
}
