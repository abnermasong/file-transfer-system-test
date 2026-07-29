import { useEffect, useState } from "react";
import { deleteTransfer, getAdminTransfers } from "../api/client";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const STATUS_LABELS = {
  available: "Available",
  download_limit_reached: "Download Limit Reached",
  expired: "Expired",
  deleted: "Deleted",
};

const STATUS_STYLES = {
  available: "bg-green-100 text-green-700",
  download_limit_reached: "bg-yellow-100 text-yellow-700",
  expired: "bg-gray-100 text-gray-600",
  deleted: "bg-red-100 text-red-700",
};

export default function AdminPage() {
  const [transfers, setTransfers] = useState([]);
  const [loadStatus, setLoadStatus] = useState("loading"); // loading | loaded | error
  const [loadError, setLoadError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [transferToDelete, setTransferToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const loadTransfers = async () => {
    setLoadStatus("loading");
    setLoadError("");

    try {
      const data = await getAdminTransfers();
      setTransfers(data);
      setLoadStatus("loaded");
    } catch (err) {
      setLoadStatus("error");
      setLoadError(err.message);
    }
  };

  useEffect(() => {
    getAdminTransfers()
      .then((data) => {
        setTransfers(data);
        setLoadStatus("loaded");
      })
      .catch((err) => {
        setLoadStatus("error");
        setLoadError(err.message);
      });
  }, []);

  const handleDelete = async () => {
    if (!transferToDelete) return;

    const transfer = transferToDelete;
    setTransferToDelete(null);
    setDeletingId(transfer.id);
    setDeleteError("");

    try {
      await deleteTransfer(transfer.id);
      await loadTransfers();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200">
      <header className="bg-blue-500 px-4 py-4 text-white shadow">
        <p className="text-sm font-semibold">File Transfer System</p>
      </header>
      <main className="p-6">
        <section className="overflow-x-auto bg-white shadow-lg rounded-md">
          {deleteError && (
            <p role="alert" className="p-3 text-sm text-red-600">
              {deleteError}
            </p>
          )}

          {loadStatus === "loading" && (
            <p className="p-4 text-gray-500">Loading transfers...</p>
          )}

          {loadStatus === "error" && (
            <div role="alert" className="p-4">
              <p className="mb-3 text-red-600">{loadError}</p>
              <button
                type="button"
                onClick={loadTransfers}
                className="rounded bg-blue-500 px-3 py-2 text-white"
              >
                Try again
              </button>
            </div>
          )}

          {loadStatus === "loaded" && (
            <>
              <table className="w-full text-center text-sm text-gray-800">
                <thead className="border-b bg-gray-100 text-gray-900">
                  <tr>
                    <th className="p-3 text-left">File Name</th>
                    <th>Recipient</th>
                    <th>Registration Date and Time</th>
                    <th>Downloads</th>
                    <th>Status</th>
                    <th>Last Download Date and Time</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((transfer) => (
                    <tr key={transfer.id} className="border-b border-gray-300">
                      <td className="p-3 text-left">{transfer.file_name}</td>
                      <td>{transfer.recipient_email}</td>
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
                          disabled:bg-red-300"
                        >
                          {transfer.status === "deleted"
                            ? "Deleted"
                            : deletingId === transfer.id
                              ? "Deleting..."
                              : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {transfers.length === 0 && (
                <p className="p-6 text-center text-gray-500">
                  No file transfer record.
                </p>
              )}
            </>
          )}
        </section>
      </main>

      <DeleteConfirmationModal
        fileName={transferToDelete?.file_name}
        onCancel={() => setTransferToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
