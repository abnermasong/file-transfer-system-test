import { useCallback, useEffect, useRef, useState } from "react";
import { getFileDownloadUrl, requestOtp, verifyOtp } from "../api/client";
import OtpCodeInput from "./OtpCodeInput";

export default function OtpVerification({ fileName, downloadToken }) {
  const [requestOtpStatus, setRequestOtpStatus] = useState("sending");
  const [requestOtpMessage, setRequestOtpMessage] = useState("");
  const requestedToken = useRef(null);

  const [verifyOtpStatus, setVerifyOtpStatus] = useState("idle");
  const [verifyOtpMessage, setVerifyOtpMessage] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);

  const [downloadStatus, setDownloadStatus] = useState("idle"); // idle | loading | error
  const [downloadMessage, setDownloadMessage] = useState("");

  const handleRequestOtp = useCallback(async () => {
    setRequestOtpStatus("sending");
    setRequestOtpMessage("");

    try {
      await requestOtp(downloadToken);
      setRequestOtpStatus("sent");
      setRequestOtpMessage(
        "A one-time code has been sent to the recipient's email.",
      );
    } catch (err) {
      setRequestOtpStatus("error");
      setRequestOtpMessage(err.message);
    }
  }, [downloadToken]);

  useEffect(() => {
    if (requestedToken.current === downloadToken) return;

    requestedToken.current = downloadToken;
    handleRequestOtp();
  }, [downloadToken, handleRequestOtp]);

  const handleOtpComplete = async (otp) => {
    setVerifyOtpStatus("verifying");
    setVerifyOtpMessage("");

    try {
      await verifyOtp(downloadToken, otp);
      setRequestOtpMessage("");
      setVerifyOtpStatus("verified");
      setVerifyOtpMessage("Code verified.");
    } catch (err) {
      setVerifyOtpStatus("error");
      setVerifyOtpMessage(err.message);
      setAttemptCount((count) => count + 1);
    }
  };

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
      <h1 className="text-2xl font-bold text-gray-900">{fileName}</h1>

      {requestOtpStatus === "sending" && (
        <p className="mt-3 text-sm text-gray-600">Sending one-time code...</p>
      )}

      {requestOtpMessage && (
        <p
          className={`mt-3 text-sm ${requestOtpStatus === "error" ? "text-red-600" : "text-green-700"}`}
        >
          {requestOtpMessage}
        </p>
      )}

      {requestOtpStatus === "error" && (
        <button
          type="button"
          onClick={handleRequestOtp}
          className="mt-4 w-full rounded-md bg-blue-600 px-6 py-3 font-semibold text-white"
        >
          Retry sending code
        </button>
      )}

      {requestOtpStatus === "sent" && verifyOtpStatus !== "verified" && (
        <div className="mt-6 border-t pt-6">
          <p className="mb-3 text-sm font-medium text-gray-700">
            Enter the 6-digit code
          </p>

          <OtpCodeInput
            key={attemptCount}
            onComplete={handleOtpComplete}
            disabled={verifyOtpStatus === "verifying"}
          />

          {verifyOtpStatus === "verifying" && (
            <p className="mt-3 text-sm text-gray-600">Verifying...</p>
          )}

          {verifyOtpStatus === "error" && (
            <p className="mt-3 text-sm text-red-600">{verifyOtpMessage}</p>
          )}
        </div>
      )}

      {verifyOtpStatus === "verified" && (
        <>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloadStatus === "loading"}
            className="mt-4 w-full rounded-md bg-blue-600 px-6 py-3 font-semibold text-white
            disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {downloadStatus === "loading"
              ? "Preparing download..."
              : "Download"}
          </button>

          {downloadStatus === "error" && (
            <p className="mt-3 text-sm text-red-600">{downloadMessage}</p>
          )}
        </>
      )}
    </>
  );
}
