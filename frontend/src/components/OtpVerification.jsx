import { useCallback, useEffect, useRef, useState } from "react";
import { requestOtp, verifyOtp } from "../api/client";
import FileDownload from "./FileDownload";
import OtpCodeInput from "./OtpCodeInput";
import LoadingSpinner from "./ui/LoadingSpinner";

export default function OtpVerification({ fileName, downloadToken }) {
  const [requestOtpStatus, setRequestOtpStatus] = useState("sending"); // sending | sent | error
  const [requestOtpMessage, setRequestOtpMessage] = useState("");
  const requestedToken = useRef(null);

  const [verifyOtpStatus, setVerifyOtpStatus] = useState("idle"); // verifying | verified | error
  const [verifyOtpMessage, setVerifyOtpMessage] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);

  const handleRequestOtp = useCallback(async () => {
    setRequestOtpStatus("sending");
    setRequestOtpMessage("");

    try {
      await requestOtp(downloadToken);
      setRequestOtpStatus("sent");
      setRequestOtpMessage(
        "送信先のメールアドレスにワンタイムコードを送信しました。",
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
      setVerifyOtpMessage("ワンタイムコードを確認しました。");
    } catch (err) {
      setVerifyOtpStatus("error");
      setVerifyOtpMessage(err.message);
      setAttemptCount((count) => count + 1);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 break-all">
        「{fileName}」
      </h1>

      {requestOtpStatus === "sending" && (
        <p className="mt-3 text-sm text-gray-600">OTPを送信中...</p>
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
          再試行
        </button>
      )}

      {requestOtpStatus === "sent" && verifyOtpStatus !== "verified" && (
        <div className="mt-6 border-t pt-6">
          <p className="mb-3 text-sm font-medium text-gray-700">
            6桁のOTPを入力してください
          </p>

          <OtpCodeInput
            key={attemptCount}
            onComplete={handleOtpComplete}
            disabled={verifyOtpStatus === "verifying"}
          />

          {verifyOtpStatus === "verifying" && (
            <p className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-600">
              <LoadingSpinner
                borderColor="border-gray-200"
                borderTopColor="border-t-blue-500"
              />
            </p>
          )}

          {verifyOtpStatus === "error" && (
            <p className="mt-3 text-sm text-red-600">{verifyOtpMessage}</p>
          )}
        </div>
      )}

      {verifyOtpStatus === "verified" && (
        <FileDownload downloadToken={downloadToken} />
      )}
    </>
  );
}
