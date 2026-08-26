import { useCallback, useEffect, useRef, useState } from "react";
import { deleteTransfer, getAdminTransfers } from "../api/client";
import { useAuth } from "../context/AuthContext";
import DeleteModal from "../components/DeleteModal";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PageHeader from "../components/ui/PageHeader";
import PageTabs from "../components/ui/PageTabs";
import Pagination from "../components/ui/Pagination";
import StatusFilter from "../components/StatusFilter";

const STATUS_LABELS = {
  available: "在庫あり",
  download_limit_reached: "ダウンロード制限に達しました",
  expired: "有効期限切れ",
  deleted: "削除済み",
};

const STATUS_STYLES = {
  available: "bg-green-100 text-green-700",
  download_limit_reached: "bg-yellow-100 text-yellow-700",
  expired: "bg-gray-100 text-gray-600",
  deleted: "bg-red-100 text-red-700",
};

export default function AdminPage() {
  const { getAccessToken, signOut } = useAuth();

  const [transfers, setTransfers] = useState([]);

  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [loadStatus, setLoadStatus] = useState("loading"); // loading | loaded | error
  const [loadError, setLoadError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [transferToDelete, setTransferToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // "" = all

  const requestIdRef = useRef(0);

  const loadTransfers = useCallback(
    async ({ showTransferListLoading = true } = {}) => {
      const requestId = ++requestIdRef.current;
      if (showTransferListLoading) {
        setLoadStatus("loading");
        setLoadError("");
      }

      try {
        const data = await getAdminTransfers(
          page,
          pageSize,
          getAccessToken,
          statusFilter,
        );
        if (requestId !== requestIdRef.current) return;
        setTransfers(data.transfers);
        setTotal(data.total);
        setLoadStatus("loaded");
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        setLoadStatus("error");
        setLoadError(err.message);
      }
    },
    [page, pageSize, statusFilter, getAccessToken],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTransfers();
  }, [loadTransfers]);

  const handleConfirmDelete = async () => {
    if (!transferToDelete) return;

    setDeletingId(transferToDelete.id);
    setDeleteError("");

    try {
      await deleteTransfer(transferToDelete.id, getAccessToken);
      await loadTransfers({ showTransferListLoading: false });
      setTransferToDelete(null);
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusFilterChange = (nextStatus) => {
    setSelectedStatus(nextStatus);
  };

  const handleStatusFilterSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setStatusFilter(selectedStatus);
  };

  const handlePageChange = (nextPage) => {
    setSelectedStatus(statusFilter);
    setPage(nextPage);
  };

  const handlePageSizeChange = (nextPageSize) => {
    setSelectedStatus(statusFilter);
    setPage(1);
    setPageSize(nextPageSize);
  };

  const formatDateTime = (dateTime) =>
    new Date(dateTime).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });

  return (
    <div className="min-h-screen bg-gray-200">
      <PageHeader>
        <button
          type="button"
          onClick={signOut}
          className="border border-white bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
        >
          ログアウト
        </button>
      </PageHeader>
      <PageTabs />
      <main className="px-8 py-4">
        <section className="mb-4 rounded-md bg-white p-2.5 shadow-lg">
          <form
            onSubmit={handleStatusFilterSearch}
            className="flex items-end gap-2"
          >
            <StatusFilter
              value={selectedStatus}
              onChange={handleStatusFilterChange}
              options={STATUS_LABELS}
            />
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-2 py-1 text-sm font-medium text-white hover:bg-blue-700"
            >
              検索
            </button>
          </form>
        </section>

        <section className="overflow-x-auto rounded-md bg-white shadow-lg">
          {deleteError && (
            <p role="alert" className="p-3 text-sm text-red-600">
              {deleteError}
            </p>
          )}
          {loadStatus === "loading" && (
            <div className="flex items-center justify-center p-8">
              <LoadingSpinner
                height="h-8"
                width="w-8"
                borderWidth="border-4"
                borderColor="border-gray-200"
                borderTopColor="border-t-blue-500"
              />
            </div>
          )}
          {loadStatus === "error" && (
            <div role="alert" className="p-4">
              <p className="mb-3 text-red-600">{loadError}</p>
              <button
                type="button"
                onClick={loadTransfers}
                className="rounded bg-blue-500 px-3 py-2 text-white
                hover:bg-blue-600"
              >
                再試行
              </button>
            </div>
          )}
          {loadStatus === "loaded" && (
            <>
              <table className="w-full table-fixed text-center text-sm text-gray-800">
                <colgroup>
                  <col className="w-[26%]" /> {/* ファイル名 */}
                  <col className="w-[17%]" /> {/* 送信先 */}
                  <col className="w-[11%]" /> {/* 登録日時 */}
                  <col className="w-[11%]" /> {/* 有効期限日時 */}
                  <col className="w-[07%]" /> {/* ダウンロード数 */}
                  <col className="w-[10%]" /> {/* ステータス */}
                  <col className="w-[11%]" /> {/*   最終ダウンロード日時 */}
                  <col className="w-[06%]" /> {/* Delete button */}
                </colgroup>
                <thead className="border-b-4">
                  <tr>
                    <th className="p-3">ファイル名</th>
                    <th>送信先</th>
                    <th>登録日時</th>
                    <th>有効期限日時</th>
                    <th>ダウンロード数</th>
                    <th>ステータス</th>
                    <th>最終ダウンロード日時</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr key={transfer.id} className="border-b border-gray-300">
                      <td className="p-3 text-left wrap-break-word">
                        {transfer.file_name}
                      </td>
                      <td className="p-3 text-left wrap-break-word">
                        {transfer.recipient_email}
                      </td>
                      <td> {formatDateTime(transfer.created_at)}</td>
                      <td> {formatDateTime(transfer.expired_at)}</td>
                      <td>
                        {transfer.download_count}/{transfer.max_downloads}
                      </td>
                      <td>
                        <span
                          className={`rounded-md px-2 py-1 text-xs ${
                            STATUS_STYLES[transfer.status] ??
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {STATUS_LABELS[transfer.status] ?? transfer.status}
                        </span>
                      </td>
                      <td>
                        {transfer.last_download_at
                          ? formatDateTime(transfer.last_download_at)
                          : "-"}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setTransferToDelete(transfer)}
                          disabled={
                            deletingId !== null || transfer.status === "deleted"
                          }
                          className="rounded bg-red-600 px-3 py-1 text-white
                          hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                        >
                          {transfer.status === "deleted"
                            ? "削除済み"
                            : deletingId === transfer.id
                              ? "削除中..."
                              : "削除"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transfers.length === 0 && (
                <p className="p-6 text-center text-gray-500">
                  データが見つかりませんでした。
                </p>
              )}
              <Pagination
                total={total}
                page={page}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </section>
      </main>
      <DeleteModal
        fileName={transferToDelete?.file_name}
        isDeleting={deletingId === transferToDelete?.id}
        onCancel={() => setTransferToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
