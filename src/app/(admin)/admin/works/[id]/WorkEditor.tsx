"use client";

import Image from "next/image";
import Link from "next/link";
import { Reorder } from "framer-motion";
import { useActionState, useState, useTransition } from "react";

import { setWorkPdf, updateWork } from "@/app/(admin)/admin/actions/content";
import {
  attachWorkImage,
  deleteWorkImage,
  reorderWorkImages,
  requestUploadUrl,
} from "@/app/(admin)/admin/actions/uploads";
import { Field, TextField } from "@/app/(admin)/admin/_components/Field";
import FileField from "@/app/(admin)/admin/_components/FileField";
import SaveBar from "@/app/(admin)/admin/_components/SaveBar";
import { Button } from "@/components/ui/button";
import { resizeForUpload } from "@/lib/image-resize";
import type { ActionState } from "@/lib/validation";
import type { Work } from "@/types/content";

type GalleryImage = { id: string; url: string; width: number; height: number };

export default function WorkEditor({
  work,
  images,
}: {
  work: Work;
  images: GalleryImage[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateWork,
    {}
  );
  const [gallery, setGallery] = useState(images);
  const [uploading, setUploading] = useState<string>("");
  const [, startTransition] = useTransition();

  async function uploadImages(files: FileList) {
    let index = 0;
    for (const file of Array.from(files)) {
      index++;
      setUploading(`Uploading ${index} of ${files.length}…`);

      const resized = await resizeForUpload(file);
      const { uploadUrl, key } = await requestUploadUrl({
        scope: "work",
        workId: work.id,
        filename: file.name,
        contentType: resized.contentType,
        extension: resized.extension,
      });

      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: resized.blob,
        headers: { "content-type": resized.contentType },
      });
      if (!response.ok) {
        setUploading(`Upload failed (${response.status})`);
        return;
      }

      await attachWorkImage({
        workId: work.id,
        key,
        width: resized.width,
        height: resized.height,
      });
    }

    setUploading("");
    // Pull the new rows (and their ids) back from the server.
    window.location.reload();
  }

  const persistOrder = (next: GalleryImage[]) => {
    setGallery(next);
    startTransition(async () => {
      await reorderWorkImages(
        work.id,
        next.map((image) => image.id)
      );
    });
  };

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/admin/works"
          className="text-xs uppercase tracking-[0.25em] text-neutral-400 hover:text-brand"
        >
          ← All works
        </Link>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">
          {work.title || "(untitled)"}
        </h1>
        <Link
          href={`/works/${work.id}`}
          target="_blank"
          className="text-sm text-brand hover:underline"
        >
          View on site ↗
        </Link>
      </div>

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="id" value={work.id} />
        <Field label="Title" name="title" defaultValue={work.title} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Date"
            name="date"
            type="date"
            defaultValue={work.date.slice(0, 10)}
          />
          <Field label="Location" name="location" defaultValue={work.location} />
        </div>
        <Field label="Client" name="client" defaultValue={work.client} />
        <TextField
          label="Description"
          name="description"
          rows={7}
          defaultValue={work.description}
        />
        <TextField
          label="Details"
          name="details"
          rows={3}
          defaultValue={work.details.join(", ")}
          hint="Shown as bullet points. Separated by commas or new lines."
        />
        <SaveBar state={state} pending={pending} />
      </form>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Project PDF</h2>
        <FileField
          label="PDF"
          currentUrl={work.pdf}
          accept="application/pdf"
          scope="work"
          workId={work.id}
          onUploaded={async (key) => setWorkPdf(work.id, key)}
        />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium">Gallery</h2>
            <p className="text-sm text-neutral-500">
              Drag to reorder. Images are resized before upload.
            </p>
          </div>
          <Button asChild variant="outline">
            <label className="cursor-pointer">
              Add images
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files?.length) {
                    void uploadImages(event.target.files);
                  }
                  event.target.value = "";
                }}
              />
            </label>
          </Button>
        </div>

        {uploading && <p className="text-sm text-neutral-500">{uploading}</p>}

        {gallery.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-neutral-400">
            No images yet.
          </p>
        ) : (
          <Reorder.Group
            axis="y"
            values={gallery}
            onReorder={persistOrder}
            className="space-y-2"
          >
            {gallery.map((image, index) => (
              <Reorder.Item
                key={image.id}
                value={image}
                className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-3"
              >
                <span className="cursor-grab select-none text-neutral-300" aria-hidden>
                  ≡
                </span>
                <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded bg-neutral-100">
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <p className="flex-1 text-sm text-neutral-500">
                  {index + 1} · {image.width}×{image.height}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    startTransition(async () => {
                      setGallery((current) =>
                        current.filter((i) => i.id !== image.id)
                      );
                      await deleteWorkImage(image.id);
                    })
                  }
                >
                  Delete
                </Button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </section>
    </div>
  );
}
