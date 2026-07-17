import { useCallback, useEffect, useRef, useState } from "react";
import { requestOtp } from "../api/client";

export default function OtpVerification({ fileName, downloadToken }) {
  const [requestStatus, setRequestStatus] = useState("sending");
  const [requestMessage, setRequestMessage] = useState("");
  const requestedToken = useRef(null);

  const handleRequestOtp = useCallback(async () => {
    setRequestStatus("sending");
    setRequestMessage("");

    try {
      await requestOtp(downloadToken);
      setRequestStatus("sent");
      setRequestMessage(
        "A one-time code has been sent to the recipient's email.",
      );
    } catch (err) {
      setRequestStatus("error");
      setRequestMessage(err.message);
    }
  }, [downloadToken]);

  useEffect(() => {
    if (requestedToken.current === downloadToken) return;

    requestedToken.current = downloadToken;
    handleRequestOtp();
  }, [downloadToken, handleRequestOtp]);

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{fileName}</h1>

      {requestStatus === "sending" && (
        <p className="mt-3 text-sm text-gray-600">Sending one-time code...</p>
      )}

      {requestMessage && (
        <p
          className={`mt-3 text-sm ${requestStatus === "error" ? "text-red-600" : "text-green-700"}`}
        >
          {requestMessage}
        </p>
      )}

      {requestStatus === "error" && (
        <button
          type="button"
          onClick={handleRequestOtp}
          className="mt-4 w-full rounded-md bg-blue-600 px-6 py-3 font-semibold text-white"
        >
          Retry sending code
        </button>
      )}
    </>
  );
}
