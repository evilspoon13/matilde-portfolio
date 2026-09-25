import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2, driven through the S3 SDK — R2 is S3-compatible, so the only
 * differences from real S3 are the endpoint, `region: "auto"` and the checksum
 * settings below. Moving to S3 later is an env change, not a code change.
 *
 * Objects are addressed by KEY everywhere in the app; public URLs are built
 * here from R2_PUBLIC_URL, so the delivery domain can change without
 * rewriting stored data.
 *
 * Images are resized in the BROWSER before upload (src/lib/image-resize.ts),
 * so nothing here decodes pixels and sharp is not part of the deployment. The
 * only sharp usage is the migration script, which runs locally.
 *
 * Deliberately no `import "server-only"`: this module is also imported by
 * scripts/ under plain Node, where that guard throws. It reads server-only env
 * vars and would fail loudly in a client bundle anyway.
 */

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
};

let client: S3Client | null = null;

const s3 = (): S3Client => {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
      },
      // Required for R2. Since v3.729 the AWS SDK adds CRC32 streaming
      // checksum trailers by default; R2 rejects them and surfaces it as an
      // opaque 400/501 on otherwise valid requests, including presigned PUTs.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return client;
};

const bucket = () => requireEnv("R2_BUCKET");

/** Public URL for a stored object. An empty key means "no file", not a bad URL. */
export function publicUrl(key: string): string {
  if (!key) return "";
  return `${requireEnv("R2_PUBLIC_URL").replace(/\/$/, "")}/${key}`;
}

const slugify = (filename: string): string =>
  filename
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "file";

/**
 * Keys are never reused — every upload gets a fresh random prefix. That is what
 * makes the immutable cache headers and next/image's one-year minimumCacheTTL
 * safe: replacing a file produces a new key, so it is a new URL, so there is
 * nothing to invalidate.
 */
export function buildKey(
  scope: "about" | "work",
  options: { workId?: string; filename: string; extension: string }
): string {
  const random = crypto.randomUUID().slice(0, 8);
  const base = `${random}-${slugify(options.filename)}.${options.extension}`;
  if (scope === "work") {
    if (!options.workId) throw new Error("workId is required for work uploads");
    // Prefixed by work so deleting a work can sweep its objects by prefix.
    return `works/${options.workId}/${base}`;
  }
  return `about/${base}`;
}

/**
 * Presigned PUT so the browser uploads straight to R2.
 *
 * Vercel caps serverless request bodies at 4.5MB; even post-resize this keeps
 * the upload off the function entirely. The bucket needs a CORS rule allowing
 * PUT from the admin's origin or this fails with an opaque browser error.
 */
export async function createUploadUrl(
  key: string,
  contentType: string
): Promise<string> {
  return getSignedUrl(
    s3(),
    new PutObjectCommand({ Bucket: bucket(), Key: key, ContentType: contentType }),
    { expiresIn: 60 * 15 }
  );
}

/** Server-side upload. Used by the migration script, not by the admin UI. */
export async function putObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  await s3().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  return key;
}

export async function deleteObject(key: string): Promise<void> {
  if (!key) return;
  await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
}

export async function deleteObjects(keys: string[]): Promise<void> {
  const present = keys.filter(Boolean);
  if (present.length === 0) return;

  for (let i = 0; i < present.length; i += 1000) {
    await s3().send(
      new DeleteObjectsCommand({
        Bucket: bucket(),
        Delete: { Objects: present.slice(i, i + 1000).map((Key) => ({ Key })) },
      })
    );
  }
}

/** Used by the migration script to skip files it has already uploaded. */
export async function objectExists(key: string): Promise<boolean> {
  try {
    await s3().send(new HeadObjectCommand({ Bucket: bucket(), Key: key }));
    return true;
  } catch {
    return false;
  }
}
