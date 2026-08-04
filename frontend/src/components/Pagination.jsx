const PAGE_SIZES = [10, 25, 50, 100];

export default function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const firstResult = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastResult = Math.min(page * pageSize, total);

  const changePage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    onPageChange(nextPage);
  };

  return (
    <div className="flex items-center justify-between border-t p-4 text-sm">
      <span>
        {firstResult}–{lastResult} / {total}
      </span>

      <div className="flex items-center gap-3">
        <span>1ページの表示件数</span>
        <select
          aria-label="results-per-page"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded border px-2 py-1 hover:bg-gray-100"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-label="previous-page"
          disabled={page === 1}
          onClick={() => changePage(page - 1)}
          className="rounded border px-3 py-1 hover:bg-gray-100 disabled:text-gray-300"
        >
          ‹
        </button>
        <span>
          ページ {page} / {totalPages}
        </span>
        <button
          type="button"
          aria-label="next-page"
          disabled={page === totalPages}
          onClick={() => changePage(page + 1)}
          className="rounded border px-3 py-1 hover:bg-gray-100 disabled:text-gray-300"
        >
          ›
        </button>
      </div>
    </div>
  );
}
