import Toast from "./Toast";

const UploadSuccessMessage = ({ warning }) => {
  if (warning) return <p>{warning}</p>;
  return <p>送信先にメールで通知しました。</p>;
};

export default function UploadStatus({ status, message, result, onDismiss }) {
  const toastByUploadStatus = {
    success: {
      type: result?.email_warning ? "warning" : "success",
      content: <UploadSuccessMessage warning={result?.email_warning} />,
    },
    error: {
      type: "error",
      content: <p>{message}</p>,
    },
  };

  const toast = toastByUploadStatus[status];

  if (!toast) return null;

  return (
    <Toast type={toast.type} onDismiss={onDismiss}>
      {toast.content}
    </Toast>
  );
}
