const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** คืนข้อความ error หรือ null เมื่อไฟล์รูปใช้ได้ */
export function validateImageFile(file: Pick<File, "type" | "size">): string | null {
  if (!file.type.startsWith("image/")) return "แนบได้เฉพาะไฟล์รูปภาพ";
  if (file.size > MAX_IMAGE_BYTES) return "ไฟล์รูปต้องมีขนาดไม่เกิน 5 MB";
  return null;
}
