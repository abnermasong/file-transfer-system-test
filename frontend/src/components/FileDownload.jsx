import { useState } from "react";
import { getFileDownloadUrl } from "../api/client";
import LoadingSpinner from "./LoadingSpinner";
import Toast from "./Toast";

export default function FileDownload({ downloadToken }) {
  const [downloadStatus, setDownloadStatus] = useState("idle"); // idle | loading | error
  const [downloadMessage, setDownloadMessage] = useState("");

  const handleDownload = async () => {
    setDownloadStatus("loading");
    setDownloadMessage("");

    try {
      const data = await getFileDownloadUrl(downloadToken);
      window.location.href = data.download_url;
      setDownloadStatus("idle");
    } catch (err) {
      setDownloadStatus("error");
      setDownloadMessage(err.message);
    }
  };

  return (
    <>
      {downloadStatus === "error" && (
        <Toast
          type="error"
          yPosition="top-15"
          onDismiss={() => {
            setDownloadStatus("idle");
            setDownloadMessage("");
          }}
        >
          <p>{downloadMessage}</p>
        </Toast>
      )}
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloadStatus === "loading" || downloadStatus === "error"}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 font-semibold text-white
        disabled:cursor-not-allowed disabled:bg-gray-400 enabled:hover:bg-blue-700"
      >
        {downloadStatus === "loading" ? <LoadingSpinner /> : "ダウンロード"}
      </button>
    </>
  );
}
