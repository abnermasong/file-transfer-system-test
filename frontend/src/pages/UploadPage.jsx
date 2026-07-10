import { useState } from "react";
import FileDropzone from "../components/FileDropzone";
import RequiredAsterisk from "../components/RequiredAsterisk";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export default function FileUploadPage() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!file) return;

    console.log("File to be uploaded: ", file);
    console.log("Email:", email);
  };

  return (
    <main className="grid min-h-screen place-items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-md"
      >
        <label htmlFor="email" className="text-2xl font-bold text-gray-900">
          Email
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
          Attachment
          <RequiredAsterisk />
        </label>

        <FileDropzone
          onFileSelect={setFile}
          maxFileSizeBytes={MAX_FILE_SIZE_BYTES}
        />
        <button
          type="submit"
          disabled={!file || !email}
          className="w-full mt-6 px-6 py-3 text-white font-semibold bg-blue-600 rounded-md
            hover:bg-blue-700
            disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          Send File
        </button>
      </form>
    </main>
  );
}
