import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Every text column is NOT NULL with a '' default rather than nullable.
 *
 * The public components all guard with truthiness (`work.location &&`,
 * `resumeUrl || "#"`), which only works today because the Notion coercers in
 * the old data layer never returned null. Keeping '' as the empty value in the
 * database preserves that contract end to end, so nothing downstream needs a
 * null check and the query layer needs no coercion pass.
 *
 * Files are stored as R2 object KEYS, never full URLs — `src/lib/storage.ts`
 * builds the URL from R2_PUBLIC_URL, so the bucket's public domain can change
 * without a data migration.
 */

/** Single row, always id = 1. */
export const about = pgTable(
  "about",
  {
    id: integer("id").primaryKey().default(1),
    name: text("name").notNull().default(""),
    jobTitle: text("job_title").notNull().default(""),
    /** Short headline statement. Falls back to the opening of `about`. */
    aboutText: text("about_text").notNull().default(""),
    about: text("about").notNull().default(""),
    skills: text("skills").array().notNull().default(sql`'{}'::text[]`),
    resumeKey: text("resume_key").notNull().default(""),
    /**
     * The portfolio book lives on Heyzine rather than in the bucket, so this
     * is an external URL the admin can change, not an R2 key.
     */
    portfolioUrl: text("portfolio_url").notNull().default(""),
    backgroundKey: text("background_key").notNull().default(""),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [check("about_singleton", sql`${table.id} = 1`)]
);

export const education = pgTable("education", {
  id: uuid("id").primaryKey().defaultRandom(),
  degree: text("degree").notNull().default(""),
  school: text("school").notNull().default(""),
  fieldOfStudy: text("field_of_study").notNull().default(""),
  /** ISO date strings — consumers only ever read the year out of these. */
  startDate: text("start_date").notNull().default(""),
  endDate: text("end_date").notNull().default(""),
  current: boolean("current").notNull().default(false),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const experience = pgTable("experience", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: text("role").notNull().default(""),
  company: text("company").notNull().default(""),
  startDate: text("start_date").notNull().default(""),
  endDate: text("end_date").notNull().default(""),
  current: boolean("current").notNull().default(false),
  summary: text("summary").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const works = pgTable("works", {
  /**
   * The migration carries over Notion's page UUIDs verbatim: these ids are in
   * the public /works/<id> URLs and in generateStaticParams, so changing them
   * would 404 every existing link.
   */
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull().default(""),
  date: text("date").notNull().default(""),
  description: text("description").notNull().default(""),
  details: text("details").array().notNull().default(sql`'{}'::text[]`),
  location: text("location").notNull().default(""),
  client: text("client").notNull().default(""),
  pdfKey: text("pdf_key").notNull().default(""),
  /** Manual drag-to-reorder on /admin/works drives the public order. */
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const workImages = pgTable("work_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  workId: uuid("work_id")
    .notNull()
    .references(() => works.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  /** Captured by sharp at upload, so galleries render without layout shift. */
  width: integer("width").notNull().default(0),
  height: integer("height").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type AboutRow = typeof about.$inferSelect;
export type EducationRow = typeof education.$inferSelect;
export type ExperienceRow = typeof experience.$inferSelect;
export type WorkRow = typeof works.$inferSelect;
export type WorkImageRow = typeof workImages.$inferSelect;
