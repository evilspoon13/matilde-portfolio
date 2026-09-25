"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionValue,
  isCorrectPassword,
} from "@/lib/auth";
import type { ActionState } from "@/lib/validation";

/** Slows down online guessing without an ineffective in-memory rate limiter. */
const delay = () => new Promise((resolve) => setTimeout(resolve, 400));

export async function login(
  _previous: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin");

  await delay();

  if (!(await isCorrectPassword(password))) {
    return { error: "Incorrect password" };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // Only ever redirect within the admin, so a crafted ?next= cannot be used
  // to bounce someone off-site after login.
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}
