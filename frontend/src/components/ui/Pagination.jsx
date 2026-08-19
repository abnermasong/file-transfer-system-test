const PAGE_SIZES = [25, 50, 100];
const MAX_VISIBLE_PAGE_NUMBERS = 10;

export default function Pagination({
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  /* total: 243 results
   * pageSize: 25 per page
   * totalPages: 243/25 = ceil(9.72) = 10
   */
  let totalPages = Math.ceil(total / pageSize);

  if (totalPages < 1) {
    totalPages = 1;
  }

  /* MAX_VISIBLE_PAGE_NUMBERS: 10
   * page: 13
   * pageIndex: 13-1 = 12
   * pageGroupIndex: 12/10 = floor(1.2) = 1
   * firstPageInGroup: 1*10 + 1 = 11
   * lastPageInGroup: 11 + 10 - 1 = 20
   */
  const pageIndex = page - 1;
  const pageGroupIndex = Math.floor(pageIndex / MAX_VISIBLE_PAGE_NUMBERS);
  const firstPageInGroup = pageGroupIndex * MAX_VISIBLE_PAGE_NUMBERS + 1;
  let lastPageInGroup = firstPageInGroup + MAX_VISIBLE_PAGE_NUMBERS - 1;

  // A final partial group ends at the actual last page
  // Example: 11-14, not 11-20
  if (lastPageInGroup > totalPages) {
    lastPageInGroup = totalPages;
  }

  // Display the page numbers in the current group
  const visiblePages = [];
  for (
    let pageNumber = firstPageInGroup;
    pageNumber <= lastPageInGroup;
    pageNumber += 1
  ) {
    visiblePages.push(pageNumber);
  }

  /* Display the first and last result numbers for the current page
   * total: 243 results
   * pageSize: 25 per page
   * page: 1
   * firstResult: (1-1)*25 + 1 = 1
   * lastResult: min(1*25, 243) = 25
   * Displayed: {firstResult}-{lastResult} / {total} = 1-25 / 243
   */
  let firstResult = 0;
  if (total > 0) {
    firstResult = (page - 1) * pageSize + 1;
  }
  const lastResult = Math.min(page * pageSize, total);

  // State for the navigation buttons
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;
  const hasPreviousPageGroup = firstPageInGroup > 1;
  const hasNextPageGroup = lastPageInGroup < totalPages;

  function changePage(nextPage) {
    if (nextPage < 1) {
      return;
    }

    if (nextPage > totalPages) {
      return;
    }

    if (nextPage === page) {
      return;
    }

    onPageChange(nextPage);
  }

  /* firstPageInGroup: 11
   * MAX_VISIBLE_PAGE_NUMBERS: 10
   * previousGroupFirstPage: 11 - 10 = 1
   */
  function goToPreviousPageGroup() {
    const previousGroupFirstPage = firstPageInGroup - MAX_VISIBLE_PAGE_NUMBERS;
    changePage(previousGroupFirstPage);
  }

  function goToPreviousPage() {
    changePage(page - 1);
  }

  function goToNextPage() {
    changePage(page + 1);
  }

  /* lastPageInGroup: 20
   * nextGroupFirstPage: 20 + 1 = 21
   */
  function goToNextPageGroup() {
    const nextGroupFirstPage = lastPageInGroup + 1;
    changePage(nextGroupFirstPage);
  }

  function handlePageSizeChange(event) {
    const selectedPageSize = Number(event.target.value);
    onPageSizeChange(selectedPageSize);
  }

  return (
    <nav className="grid grid-cols-[1fr_auto_1fr] items-center border-t-4 p-4 text-sm">
      <span>
        {firstResult}-{lastResult} / {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!hasPreviousPageGroup}
          onClick={goToPreviousPageGroup}
          aria-label="Previous 10 pages"
          className="min-w-8 rounded border px-2 py-1
          enabled:hover:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          «
        </button>
        <button
          type="button"
          disabled={isFirstPage}
          onClick={goToPreviousPage}
          className="min-w-8 rounded border px-2 py-1
          enabled:hover:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          ‹
        </button>
        {visiblePages.map((pageNumber) => {
          const isCurrentPage = pageNumber === page;
          let buttonClassName = "min-w-8 rounded border px-2 py-1";

          if (isCurrentPage) {
            buttonClassName += " border-blue-600 bg-blue-600 text-white";
          } else {
            buttonClassName += " hover:bg-gray-200";
          }

          function handleClick() {
            changePage(pageNumber);
          }

          return (
            <button
              key={pageNumber}
              type="button"
              onClick={handleClick}
              className={buttonClassName}
            >
              {pageNumber}
            </button>
          );
        })}
        <button
          type="button"
          disabled={isLastPage}
          onClick={goToNextPage}
          className="min-w-8 rounded border px-2 py-1
          enabled:hover:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          ›
        </button>
        <button
          type="button"
          disabled={!hasNextPageGroup}
          onClick={goToNextPageGroup}
          aria-label="Next 10 pages"
          className="min-w-8 rounded border px-2 py-1
          enabled:hover:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          »
        </button>
      </div>
      <label className="justify-self-end">
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="rounded border px-2 py-1 hover:bg-gray-200"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </nav>
  );
}
