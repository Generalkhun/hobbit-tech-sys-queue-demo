import type { ReactNode } from "react";

export function InfoGrid({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs text-slate-400">{item.label}</dt>
          <dd className="mt-1 text-sm font-medium text-slate-800">{item.value || "-"}</dd>
        </div>
      ))}
    </dl>
  );
}

/** รูปเอกสารพร้อมลิงก์เปิดดูและดาวน์โหลด */
export function DocumentGallery({
  documents,
}: {
  documents: { label: string; url?: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((doc) => (
        <figure key={doc.label} className="rounded-xl border border-slate-100 p-3">
          {doc.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={doc.url} alt={doc.label} className="h-36 w-full rounded-lg object-cover" />
          ) : (
            <div className="grid h-36 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
              ยังไม่มีเอกสาร
            </div>
          )}
          <figcaption className="mt-2 flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-700">{doc.label}</span>
            {doc.url && (
              <span className="flex gap-3 font-semibold text-sys-700">
                <a href={doc.url} target="_blank" rel="noreferrer" className="hover:underline">
                  เปิดดู
                </a>
                <a href={doc.url} download={doc.label} className="hover:underline">
                  ดาวน์โหลด
                </a>
              </span>
            )}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
