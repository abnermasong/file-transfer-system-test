const UploadSuccessMessage = ({ warning }) => {
  if (warning) {
    return (
      <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-100 p-4 pr-10 text-yellow-700">
        <p className="text-lg font-semibold">Warning</p>
        <p>{warning}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-l-4 border-green-500 bg-green-100 p-4 pr-10 text-green-700">
      <p className="text-lg font-semibold">Success</p>
      <p>送信先にメールで通知しました。</p>
    </div>
  );
};

const UploadErrorMessage = ({ message }) => {
  return (
    <div className="rounded-lg border-l-4 border-red-500 bg-red-100 p-4 pr-10 text-red-700">
      <p className="text-lg font-semibold">Error</p>
      <p>{message}</p>
    </div>
  );
};

export default function UploadStatus({ status, message, result, onDismiss }) {
  const renderByUploadStatus = {
    success: <UploadSuccessMessage warning={result?.email_warning} />,
    error: <UploadErrorMessage message={message} />,
  };

  const statusMessage = renderByUploadStatus[status];

  if (!statusMessage) return null;

  return (
    <div className="fixed right-6 top-20 z-50 w-96 max-w-[calc(100%-3rem)] shadow-lg">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2 top-2 z-10 px-2 text-xl leading-none text-gray-500 hover:text-gray-800"
      >
        ×
      </button>
      {statusMessage}
    </div>
  );
}
