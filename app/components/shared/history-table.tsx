import { AttachmentThumbs } from "@/app/components/note-attachment-field";
import { Panel } from "@/app/components/ui";
import { formatDateTime } from "@/app/data/format";
import type { HistoryRow } from "@/app/types/seller";

export function HistoryTable({
  rows,
  emptyText,
}: {
  rows: HistoryRow[];
  emptyText: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="px-6 py-12 text-center text-sm text-slate-400">
        {emptyText}
      </p>
    );
  }
  return (
    <div className="scrollbar-thin overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead className="bg-slate-50 text-[10px] font-semibold text-slate-400">
          <tr>
            <th className="px-6 py-3.5">วัน-เวลา</th>
            <th className="px-4 py-3.5">รายการ</th>
            <th className="px-4 py-3.5">ผู้ทำรายการ</th>
            <th className="px-4 py-3.5">หมายเหตุ / รูป</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="align-top">
              <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                {formatDateTime(row.at)}
              </td>
              <td className="px-4 py-4">
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    row.tone === "in"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {row.action}
                </span>
              </td>
              <td className="px-4 py-4 text-slate-500">{row.by}</td>
              <td className="px-4 py-4 text-slate-500">
                {row.note || "—"}
                <AttachmentThumbs attachments={row.attachments} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HistoryPanel({
  title,
  rows,
  emptyText,
}: {
  title: string;
  rows: HistoryRow[];
  emptyText: string;
}) {
  return (
    <Panel className="overflow-hidden">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h3 className="font-bold text-sys-900">{title}</h3>
      </div>
      <HistoryTable rows={rows} emptyText={emptyText} />
    </Panel>
  );
}
