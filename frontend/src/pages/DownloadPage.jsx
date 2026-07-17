import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDownloadStatus } from "../api/client";
import DownloadStatus from "../components/DownloadStatus";

export default function DownloadPage() {
  const { downloadToken } = useParams();
  const [status, setStatus] = useState("loading");
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
    <main className="grid min-h-screen place-items-center bg-gray-100">
      <div className="w-full max-w-xl bg-white p-6 text-center shadow-lg rounded-md">
        <DownloadStatus
          status={status}
          fileName={fileName}
          downloadToken={downloadToken}
        />
      </div>
    </main>
  );
}
