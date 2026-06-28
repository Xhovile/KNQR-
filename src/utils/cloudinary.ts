/**
 * Utility function to upload media to Cloudinary using direct unsigned uploads.
 * Supports both base64 Data URLs and raw File / Blob objects.
 */
export async function uploadToCloudinary(fileInput: string | File | Blob): Promise<string> {
  const metaEnv = (import.meta as any).env || {};
  const cloudName = metaEnv.VITE_CLOUDINARY_CLOUD_NAME || "db3xx6mn4";
  const uploadPreset = metaEnv.VITE_CLOUDINARY_UPLOAD_PRESET || "KNQR";
  const folder = metaEnv.VITE_CLOUDINARY_FOLDER || "KNQR";

  const formData = new FormData();
  formData.append("file", fileInput);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = "Cloudinary upload failed";
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed.error && parsed.error.message) {
        errorMessage = parsed.error.message;
      }
    } catch {
      errorMessage = errorBody || response.statusText;
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * Helper to check if a string is a base64 Data URL.
 */
export function isBase64Image(str: string): boolean {
  return typeof str === "string" && str.startsWith("data:image/");
}
