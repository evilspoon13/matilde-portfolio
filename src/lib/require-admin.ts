import { cookies } from "next/headers";

import { SESSION_COOKIE, isValidSession } from "@/lib/auth";

/**
 * The actual authorization boundary — see the note in src/lib/auth.ts.
 *
 * Middleware cannot protect server actions, because an action is a POST to
 * whatever path the browser is on. Every mutating action calls this first.
 */
export async function requireAdmin(): Promise<void> {
  const store = await cookies();
  const valid = await isValidSession(store.get(SESSION_COOKIE)?.value);
  if (!valid) {
    throw new Error("Not authorised");
  }
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return isValidSession(store.get(SESSION_COOKIE)?.value);
}
