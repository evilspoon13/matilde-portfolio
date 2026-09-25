"use client";

import { useState, useTransition } from "react";

import {
  requestUploadUrl,
} from "@/app/(admin)/admin/actions/uploads";
import { Button } from "@/components/ui/button";
import { resizeForUpload } from "@/lib/image-resize";

/**
 * Upload one file and hand the resulting R2 key back to the caller.
 *
 * Images are downscaled in the browser before the presigned PUT, so a 17MB
 * source becomes a few hundred KB and never touches a serverless function.
 */
export default function FileField({
  label,
  currentUrl,
  accept,
  scope,
  workId,
  onUploaded,
}: {
  label: string;
  currentUrl: string;
  accept: string;
  scope: "about" | "work";
  workId?: string;
  onUploaded: (key: string, width: number, height: number) => Promise<void>;
}) {
  const [status, setStatus] = useState<string>("");
  const [pending, startTransition] = useTransition();

  async function handleFile(file: File) {
    setStatus("Preparing…");
    const resized = await resizeForUpload(file);

    setStatus("Uploading…");
    const { uploadUrl, key } = await requestUploadUrl({
      scope,
      workId,
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
      setStatus(`Upload failed (${response.status})`);
      return;
    }

    setStatus("Saving…");
    startTransition(async () => {
      await onUploaded(key, resized.width, resized.height);
      setStatus("Saved");
    });
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          {currentUrl ? (
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-xs text-brand hover:underline"
            >
              {currentUrl.split("/").pop()}
            </a>
          ) : (
            <p className="text-xs text-neutral-400">Nothing uploaded</p>
          )}
        </div>

        <Button asChild variant="outline" size="sm" disabled={pending}>
          <label className="cursor-pointer">
            Replace
            <input
              type="file"
              accept={accept}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
                event.target.value = "";
              }}
            />
          </label>
        </Button>
      </div>

      {status && <p className="mt-2 text-xs text-neutral-500">{status}</p>}
    </div>
  );
}
