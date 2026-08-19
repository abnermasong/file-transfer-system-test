import { useState } from "react";
import { uploadFile } from "../api/client";
import { useAuth } from "../context/AuthContext";
import FileDropzone from "../components/FileDropzone";
import UploadStatus from "../components/UploadStatus";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PageHeader from "../components/ui/PageHeader";
import PageTabs from "../components/ui/PageTabs";
import RequiredAsterisk from "../components/ui/RequiredAsterisk";

const MAX_FILE_SIZE_MB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function UploadPage() {
  const { signOut } = useAuth();
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) return;

    setStatus("uploading");
    setMessage("");
    setResult(null);

    try {
      const data = await uploadFile(file, email);
      setResult(data);
      setStatus("success");
    } catch (error) {
      setStatus("error");
      setMessage(error.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-200">
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
      <main className="grid mb-20 flex-1 place-items-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-md"
        >
          <label htmlFor="email" className="text-2xl font-bold text-gray-900">
            メールアドレス
            <RequiredAsterisk />
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="abc@example.com"
            required
            className="w-full mb-6 px-3 py-2 border border-gray-300 rounded-md"
          ></input>
          <label
            htmlFor="file-input"
            className="text-2xl font-bold text-gray-900"
          >
            ファイル
            <RequiredAsterisk />
          </label>
          <FileDropzone
            onFileSelect={setFile}
            maxFileSizeBytes={MAX_FILE_SIZE_BYTES}
          />
          <button
            type="submit"
            disabled={!file || !email || status === "uploading"}
            className="flex w-full items-center justify-center gap-2 mt-6 px-6 py-3 text-white font-semibold bg-blue-600 rounded-md
              hover:bg-blue-700
              disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {status === "uploading" ? <LoadingSpinner /> : "ファイルを送信"}
          </button>
        </form>
        <UploadStatus
          status={status}
          message={message}
          result={result}
          onDismiss={() => setStatus("idle")}
        />
      </main>
    </div>
  );
}
