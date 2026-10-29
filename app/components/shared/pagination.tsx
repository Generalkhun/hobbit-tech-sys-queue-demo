export function Pagination({
  currentPage,
  pageCount,
  total,
  onChange,
}: {
  currentPage: number;
  pageCount: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const buttonClass =
    "rounded-lg border border-slate-200 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:px-6">
      <span>
        หน้า {currentPage} จาก {pageCount} · ทั้งหมด {total} รายการ
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onChange(currentPage - 1)}
          className={buttonClass}
        >
          ก่อนหน้า
        </button>
        <button
          type="button"
          disabled={currentPage === pageCount}
          onClick={() => onChange(currentPage + 1)}
          className={buttonClass}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}
