const sizes = [5, 10, 25, 50];

/** ตัวแบ่งหน้าแบบเลือกจำนวนแถวต่อหน้า และแสดงช่วง "1-5 จาก 5" */
export function RowsPagination({
  page,
  pageCount,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const arrow =
    "grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30";
  return (
    <div className="flex flex-wrap items-center justify-end gap-5 border-t border-slate-100 px-5 py-3 text-xs text-slate-500 sm:px-6">
      <label className="flex items-center gap-2">
        แถวต่อหน้า:
        <select
          className="rounded-md border border-slate-200 bg-white px-2 py-1"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
      <span>
        {from}-{to} จาก {total}
      </span>
      <div className="flex gap-1">
        <button type="button" aria-label="หน้าก่อนหน้า" className={arrow} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          ‹
        </button>
        <button type="button" aria-label="หน้าถัดไป" className={arrow} disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
          ›
        </button>
      </div>
    </div>
  );
}
