"use client";

import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/validation";

export default function SaveBar({
  state,
  pending,
  label = "Save",
}: {
  state: ActionState;
  pending: boolean;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : label}
      </Button>
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.ok && !pending && (
        <p className="text-sm text-neutral-500">Saved</p>
      )}
    </div>
  );
}
