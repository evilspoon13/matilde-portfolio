/**
 * The shapes the public pages consume.
 *
 * Every string is non-nullable and uses '' for "not set" — the components all
 * guard with truthiness (`work.location &&`, `resumeUrl || "#"`), and the
 * database columns are NOT NULL DEFAULT '' to match, so nothing in between
 * needs a null check.
 *
 * File fields hold fully-resolved public URLs, built from R2 object keys at
 * the query boundary in src/lib/content.ts.
 */

export interface About {
  id: string;
  name: string;
  jobTitle: string;
  /** Short headline statement; falls back to the opening of `about`. */
  aboutText: string;
  about: string;
  skills: string[];
  resume: string;
  /** External link to the portfolio book (Heyzine). */
  portfolio: string;
  background: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  summary: string;
}

export interface Work {
  id: string;
  title: string;
  date: string;
  description: string;
  images: string[];
  details: string[];
  location: string;
  client: string;
  pdf: string;
}
