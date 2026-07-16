import { useRef, useState } from "react";

export default function FileDropzone({ onFileSelect, maxFileSizeBytes }) {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const maxSizeMb = Math.round(maxFileSizeBytes / (1024 * 1024));

  const selectFile = (file) => {
    if (!file) return;

    if (file.size > maxFileSizeBytes) {
      setSelectedFile(null);
      setFileError(`File must be smaller than ${maxSizeMb} MB.`);
      onFileSelect?.(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    setSelectedFile(file);
    setFileError("");
    onFileSelect?.(file);
  };

  const handleInputChange = (event) => {
    selectFile(event.target.files?.[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const renderDropzoneContent = () => {
    if (fileError) {
      return (
        <>
          <p className="font-semibold text-red-600">{fileError}</p>
          <p className="mt-2 text-sm text-gray-500">
            Click or drop another file
          </p>
        </>
      );
    }

    if (selectedFile) {
      return (
        <>
          <p className="max-w-full font-semibold text-gray-900">
            {selectedFile.name}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Click or drop another file to replace it
          </p>
        </>
      );
    }

    return (
      <>
        <p className="font-semibold text-gray-900">Drag and drop a file here</p>
        <p className="mt-2 text-sm text-gray-500">
          Maximum file size: {maxSizeMb} MB
        </p>
      </>
    );
  };

  return (
    <div
      id="file-dropzone"
      className={`flex flex-col min-h-32 text-center cursor-pointer
        items-center justify-center border-2 border-dashed rounded-lg ${
          isDragging
            ? "border-blue-600 bg-blue-50"
            : "border-gray-300 hover:border-blue-600 hover:bg-blue-50"
        }`}
      onClick={openFilePicker}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      tabIndex={0}
    >
      <input
        id="file-input"
        ref={inputRef}
        type="file"
        onChange={handleInputChange}
        className="hidden"
      />

      {renderDropzoneContent()}
    </div>
  );
}
