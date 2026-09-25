import { z } from "zod";

/**
 * One schema per collection, shared by the admin forms and the server actions
 * that persist them. Empty strings are the "not set" value throughout, matching
 * the NOT NULL DEFAULT '' columns, so optional fields default to '' rather
 * than undefined.
 */

const text = z.string().trim().default("");
const optionalText = z.string().trim().optional().default("");

/** "AutoCAD, Rhino" and newline-separated lists both become string arrays. */
export const listFromText = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const aboutSchema = z.object({
  name: text.pipe(z.string().min(1, "Name is required")),
  jobTitle: optionalText,
  aboutText: optionalText,
  about: optionalText,
  skills: z.string().default("").transform(listFromText),
  portfolioUrl: z
    .string()
    .trim()
    .default("")
    .refine(
      (value) => value === "" || /^https?:\/\//.test(value),
      "Portfolio link must start with http:// or https://"
    ),
});

export const educationSchema = z.object({
  degree: text.pipe(z.string().min(1, "Degree is required")),
  school: optionalText,
  fieldOfStudy: optionalText,
  startDate: optionalText,
  endDate: optionalText,
  current: z.coerce.boolean().default(false),
  description: optionalText,
});

export const experienceSchema = z.object({
  role: text.pipe(z.string().min(1, "Role is required")),
  company: optionalText,
  startDate: optionalText,
  endDate: optionalText,
  current: z.coerce.boolean().default(false),
  summary: optionalText,
});

export const workSchema = z.object({
  title: text.pipe(z.string().min(1, "Title is required")),
  date: optionalText,
  description: optionalText,
  details: z.string().default("").transform(listFromText),
  location: optionalText,
  client: optionalText,
});

export type AboutInput = z.infer<typeof aboutSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type WorkInput = z.infer<typeof workSchema>;

/** Shape every action returns, so forms can render errors uniformly. */
export type ActionState = {
  ok?: boolean;
  error?: string;
};

export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input";
}
