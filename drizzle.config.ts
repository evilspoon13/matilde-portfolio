import "dotenv/config";

import type { Config } from "drizzle-kit";

/**
 * drizzle-kit opens a real TCP connection to run DDL, which the pooled Neon
 * endpoint can mishandle. Use the direct (unpooled) URL when one is set; the
 * app itself always uses the pooled one over HTTP.
 */
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  },
} satisfies Config;
