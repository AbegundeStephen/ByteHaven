import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const BUCKET = process.env.IMAGE_STORAGE_BUCKET ?? "product-images";

function getClient() {
  const url = process.env.IMAGE_STORAGE_URL;
  const key = process.env.IMAGE_STORAGE_SECRET_KEY;
  if (!url || !key) {
    throw new Error(
      "Image storage is not configured (IMAGE_STORAGE_URL / IMAGE_STORAGE_SECRET_KEY).",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

function extensionFor(contentType: string): string {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/jpeg":
    default:
      return "jpg";
  }
}

/** Uploads a product image and returns its public URL. Behind an
 * abstraction so the storage provider can be swapped later (SRS 4.6/FR-F2). */
export async function uploadProductImage(
  file: Buffer,
  contentType: string,
): Promise<string> {
  const client = getClient();
  const path = `products/${randomUUID()}.${extensionFor(contentType)}`;

  const { error } = await client.storage
    .from(BUCKET)
    .upload(path, file, { contentType, upsert: false });
  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteProductImage(url: string): Promise<void> {
  const client = getClient();
  const marker = `/${BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return;
  const path = url.slice(index + marker.length);
  await client.storage.from(BUCKET).remove([path]);
}

/** Idempotent — creates the bucket as public if it doesn't already exist. */
export async function ensureProductImageBucket(): Promise<void> {
  const client = getClient();
  const { data: buckets, error: listError } =
    await client.storage.listBuckets();
  if (listError)
    throw new Error(`Could not list buckets: ${listError.message}`);

  if (buckets.some((b) => b.name === BUCKET)) return;

  const { error } = await client.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "5MB",
  });
  if (error) throw new Error(`Could not create bucket: ${error.message}`);
}
