const UploadSuccessMessage = ({ message, result }) => {
  return (
    <div className="mt-4 text-sm font-medium text-green-700">
      <p>{message}</p>
      <p>Storage path: {result?.storage_path}</p>
      <p>Size: {result?.file_size} bytes</p>

      {result?.email_warning && (
        <p className="mt-2 text-yellow-700">⚠ {result.email_warning}</p>
      )}
    </div>
  );
};

const UploadErrorMessage = ({ message }) => {
  return (
    <p className="mt-4 text-sm font-medium text-red-600">Error: {message}</p>
  );
};

export default function UploadStatus({ status, message, result }) {
  const renderByStatus = {
    success: <UploadSuccessMessage message={message} result={result} />,
    error: <UploadErrorMessage message={message} />,
  };

  return renderByStatus[status] ?? null;
}
