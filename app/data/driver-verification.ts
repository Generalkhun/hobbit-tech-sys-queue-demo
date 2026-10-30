const TOKEN_LENGTH = 6;

/** สร้าง token สุ่มสำหรับ link เช็คอินคนขับ (unique ต่องาน) */
export function generateDriverLinkToken(): string | null {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    return null;
  }
  const randomValue = new Uint32Array(1);
  crypto.getRandomValues(randomValue);
  const base = 10 ** (TOKEN_LENGTH - 1);
  return String(base + (randomValue[0] % (9 * base)));
}

/** ตรวจว่า token ที่ส่งมาจาก link ตรงกับ token ที่สร้างให้งานนี้หรือไม่ */
export function isValidDriverLinkToken(
  expectedToken: string | undefined,
  submittedToken: string,
): boolean {
  return expectedToken !== undefined && expectedToken === submittedToken;
}
