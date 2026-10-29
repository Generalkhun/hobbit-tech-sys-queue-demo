/** ISO 8601 timestamp, e.g. 2026-10-30T01:00:00+07:00 */
export type IsoDateTime = string;

export interface NoteAttachment {
  name: string;
  url: string;
}

/** หมายเหตุพร้อมรูปแนบ ใช้ร่วมกันทุก flow ที่ต้องมีเหตุผลประกอบการทำรายการ */
export interface NoteWithAttachments {
  note: string;
  attachments: NoteAttachment[];
}
