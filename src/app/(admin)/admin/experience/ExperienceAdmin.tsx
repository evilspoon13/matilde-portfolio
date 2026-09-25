"use client";

import { useActionState, useState } from "react";

import {
  deleteExperience,
  reorder,
  saveExperience,
} from "@/app/(admin)/admin/actions/content";
import { Field, TextField } from "@/app/(admin)/admin/_components/Field";
import EntryList from "@/app/(admin)/admin/_components/EntryList";
import SaveBar from "@/app/(admin)/admin/_components/SaveBar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Experience } from "@/types/content";
import type { ActionState } from "@/lib/validation";

export default function ExperienceAdmin({
  experience,
}: {
  experience: Experience[];
}) {
  const [editing, setEditing] = useState<Experience | null>(null);
  const [creating, setCreating] = useState(false);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    async (previous, formData) => {
      const result = await saveExperience(previous, formData);
      if (result.ok) {
        setEditing(null);
        setCreating(false);
      }
      return result;
    },
    {}
  );

  const open = creating || editing !== null;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Experience</h1>
          <p className="mt-2 text-neutral-500">
            Drag to reorder; the site shows them in this order.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
        >
          Add entry
        </Button>
      </div>

      {open && (
        <form
          action={formAction}
          className="space-y-5 rounded-xl border border-neutral-200 bg-white p-6"
        >
          <input type="hidden" name="id" value={editing?.id ?? ""} />
          <Field label="Role" name="role" defaultValue={editing?.role} />
          <Field label="Company" name="company" defaultValue={editing?.company} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Start date"
              name="startDate"
              type="date"
              defaultValue={editing?.startDate.slice(0, 10)}
            />
            <Field
              label="End date"
              name="endDate"
              type="date"
              defaultValue={editing?.endDate.slice(0, 10)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="current-role"
              name="current"
              defaultChecked={editing?.current}
            />
            <Label htmlFor="current-role">Currently working here</Label>
          </div>
          <TextField
            label="Summary"
            name="summary"
            defaultValue={editing?.summary}
          />

          <div className="flex items-center gap-4">
            <SaveBar state={state} pending={pending} />
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditing(null);
                setCreating(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      <EntryList
        entries={experience.map((entry) => ({
          id: entry.id,
          primary: entry.role || "(no role)",
          secondary: entry.company,
          meta: entry.current
            ? `${entry.startDate.slice(0, 4)} – Present`
            : `${entry.startDate.slice(0, 4)} – ${entry.endDate.slice(0, 4)}`,
        }))}
        onReorder={(ids) => reorder("experience", ids)}
        onDelete={deleteExperience}
        onEdit={(id) => {
          setCreating(false);
          setEditing(experience.find((e) => e.id === id) ?? null);
        }}
      />
    </div>
  );
}
