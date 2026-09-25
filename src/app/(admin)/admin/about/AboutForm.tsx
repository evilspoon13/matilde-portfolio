"use client";

import { useActionState } from "react";

import { setAboutFile, updateAbout } from "@/app/(admin)/admin/actions/content";
import { Field, TextField } from "@/app/(admin)/admin/_components/Field";
import FileField from "@/app/(admin)/admin/_components/FileField";
import SaveBar from "@/app/(admin)/admin/_components/SaveBar";
import type { About } from "@/types/content";
import type { ActionState } from "@/lib/validation";

export default function AboutForm({ about }: { about: About | null }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateAbout,
    {}
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-medium tracking-tight">About</h1>
        <p className="mt-2 text-neutral-500">
          The name in the hero, the headline statement, and the files the site
          links to.
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        <Field label="Name" name="name" defaultValue={about?.name} />
        <Field
          label="Job title"
          name="jobTitle"
          defaultValue={about?.jobTitle}
          hint="Shown in small caps under the hero."
        />
        <TextField
          label="Headline statement"
          name="aboutText"
          rows={3}
          defaultValue={about?.aboutText}
          hint="The large text below the hero. Leave empty to use the first two sentences of the bio."
        />
        <TextField
          label="Bio"
          name="about"
          rows={8}
          defaultValue={about?.about}
        />
        <TextField
          label="Skills"
          name="skills"
          rows={3}
          defaultValue={about?.skills.join(", ")}
          hint="Separated by commas or new lines."
        />
        <Field
          label="Portfolio book link"
          name="portfolioUrl"
          defaultValue={about?.portfolio}
          placeholder="https://heyzine.com/flip-book/..."
          hint="Where the Portfolio page sends people. Opens in a new tab."
        />
        <SaveBar state={state} pending={pending} />
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Files</h2>
        <FileField
          label="Background image"
          currentUrl={about?.background ?? ""}
          accept="image/*"
          scope="about"
          onUploaded={async (key) => setAboutFile("backgroundKey", key)}
        />
        <FileField
          label="Résumé (PDF)"
          currentUrl={about?.resume ?? ""}
          accept="application/pdf"
          scope="about"
          onUploaded={async (key) => setAboutFile("resumeKey", key)}
        />
      </section>
    </div>
  );
}
