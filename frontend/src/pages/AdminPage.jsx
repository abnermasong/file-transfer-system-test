import { useCallback, useEffect, useRef, useState } from "react";
import { deleteTransfer, getAdminTransfers } from "../api/client";
import { useAuth } from "../context/AuthContext";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import Pagination from "../components/Pagination";

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

  const requestIdRef = useRef(0);

  const loadTransfers = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoadStatus("loading");
    setLoadError("");

    try {
      const data = await getAdminTransfers(page, pageSize, getAccessToken);
      if (requestId !== requestIdRef.current) return;
      setTransfers(data.transfers);
      setTotal(data.total);
      setLoadStatus("loaded");
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setLoadStatus("error");
      setLoadError(err.message);
    }
  }, [page, pageSize, getAccessToken]);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  const handleConfirmDelete = async () => {
    if (!transferToDelete) return;

    setDeletingId(transferToDelete.id);
    setDeleteError("");

    try {
      await deleteTransfer(transferToDelete.id, getAccessToken);
      setTransferToDelete(null);
      await loadTransfers();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (nextPage) => setPage(nextPage);

  const handlePageSizeChange = (nextPageSize) => {
    setPage(1);
    setPageSize(nextPageSize);
  };

  return (
    <div className="min-h-screen bg-gray-300">
      <header className="flex items-center justify-between bg-blue-500 px-4 py-4 text-white shadow">
        <p className="text-lg font-semibold">File Transfer System</p>
        <button
          type="button"
          onClick={signOut}
          className="border border-white bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
        >
          ログアウト
        </button>
      </header>
      <main className="p-8">
        <section className="overflow-x-auto bg-white shadow-lg rounded-md">
          {deleteError && (
            <p role="alert" className="p-3 text-sm text-red-600">
              {deleteError}
            </p>
          )}
          {loadStatus === "loading" && (
            <div className="flex items-center justify-center p-8">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
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
              <table className="w-full text-center text-sm text-gray-800">
                <thead className="border-b-4 border-black bg-gray-100 text-gray-900">
                  <tr>
                    <th className="p-3">ファイル名</th>
                    <th className="p-3">送信先</th>
                    <th>登録日時</th>
                    <th>ダウンロード数</th>
                    <th>ステータス</th>
                    <th>最終ダウンロード日時</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr key={transfer.id} className="border-b border-gray-300">
                      <td className="p-3 text-left max-w-md">
                        {transfer.file_name}
                      </td>
                      <td className="p-3 text-left w-1">
                        {transfer.recipient_email}
                      </td>
                      <td>{new Date(transfer.created_at).toLocaleString()}</td>
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
                          ? new Date(transfer.last_download_at).toLocaleString()
                          : "—"}
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
      <DeleteConfirmationModal
        fileName={transferToDelete?.file_name}
        onCancel={() => setTransferToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
