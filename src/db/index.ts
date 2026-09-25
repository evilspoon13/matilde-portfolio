import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

/**
 * Neon over HTTP rather than a TCP pool: every query is a stateless fetch, so
 * there are no connections to leak across serverless invocations. Neon's free
 * tier scales to zero, which costs a cold start on the first query after ~5
 * minutes idle — invisible here because the public pages are ISR-cached and
 * only revalidation and admin saves actually touch the database.
 */
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
export { schema };
