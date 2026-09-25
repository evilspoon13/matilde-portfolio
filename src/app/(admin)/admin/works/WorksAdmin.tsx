"use client";

import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";

import {
  createWork,
  deleteWork,
  reorder,
} from "@/app/(admin)/admin/actions/content";
import EntryList from "@/app/(admin)/admin/_components/EntryList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Work } from "@/types/content";
import type { ActionState } from "@/lib/validation";

export default function WorksAdmin({ works }: { works: Work[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  // A work needs an id before its gallery can be keyed, so creating one takes
  // just a title and then opens the full editor.
  const [state, formAction, pending] = useActionState<
    ActionState & { id?: string },
    FormData
  >(async (previous, formData) => {
    const result = await createWork(previous, formData);
    if (result.id) router.push(`/admin/works/${result.id}`);
    return result;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Works</h1>
          <p className="mt-2 text-neutral-500">
            This order is the order projects appear on /works.
          </p>
        </div>
        <Button onClick={() => setCreating(true)}>Add work</Button>
      </div>

      {creating && (
        <form
          action={formAction}
          className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4"
        >
          <Input name="title" placeholder="Project title" autoFocus />
          <Button type="submit" disabled={pending}>
            {pending ? "Creating…" : "Create"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setCreating(false)}>
            Cancel
          </Button>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        </form>
      )}

      <EntryList
        entries={works.map((work) => ({
          id: work.id,
          primary: work.title || "(untitled)",
          secondary: [work.location, work.client].filter(Boolean).join(" · "),
          meta: `${work.images.length} image${work.images.length === 1 ? "" : "s"}`,
        }))}
        onReorder={(ids) => reorder("works", ids)}
        onDelete={deleteWork}
        onEdit={(id) => router.push(`/admin/works/${id}`)}
      />
    </div>
  );
}
