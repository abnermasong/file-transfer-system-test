import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDownloadStatus } from "../api/client";
import DownloadStatus from "../components/DownloadStatus";

export default function DownloadPage() {
  const { downloadToken } = useParams();
  const [status, setStatus] = useState("loading"); // loading | otp_required | download_limit_reached | expired | not_found | error
  const [fileName, setFileName] = useState(null);

  useEffect(() => {
    getDownloadStatus(downloadToken)
      .then((data) => {
        setStatus(data.state);
        setFileName(data.file_name ?? null);
      })
      .catch(() => setStatus("error"));
  }, [downloadToken]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-200">
      <header className="flex items-center justify-between bg-blue-500 px-4 py-4 text-white shadow">
        <p className="text-lg font-semibold">File Transfer System</p>
      </header>
      <main className="grid flex-1 mb-20 place-items-center">
        <div className="w-full max-w-xl bg-white p-6 text-center shadow-lg rounded-md">
          <DownloadStatus
            status={status}
            fileName={fileName}
            downloadToken={downloadToken}
          />
        </div>
      </main>
    </div>
  );
}
