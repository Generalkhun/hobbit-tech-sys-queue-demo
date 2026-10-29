const CODE_LENGTH = 6;

export function generateVerificationCode():
  | { code: string }
  | { error: string } {
  if (typeof crypto === "undefined" || !crypto.getRandomValues) {
    return { error: "ไม่สามารถสร้างรหัสยืนยันแบบสุ่มได้ในเบราว์เซอร์นี้" };
  }
  const randomValue = new Uint32Array(1);
  crypto.getRandomValues(randomValue);
  const base = 10 ** (CODE_LENGTH - 1);
  return { code: String(base + (randomValue[0] % (9 * base))) };
}

/** คืนข้อความ error หรือ null เมื่อรหัสถูกต้อง */
export function verifyDriverCode(
  expectedCode: string | undefined,
  submittedCode: string,
): string | null {
  if (!expectedCode) {
    return "ยังไม่มีรหัสยืนยันสำหรับงานนี้ กรุณาติดต่อผู้ส่งเหล็ก";
  }
  if (submittedCode !== expectedCode) {
    return "รหัสยืนยันไม่ถูกต้อง กรุณาตรวจสอบรหัสจากผู้ส่งเหล็ก";
  }
  return null;
}
