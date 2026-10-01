import OtpVerification from "./OtpVerification";

const LoadingMessage = () => {
  return <p className="text-gray-600">Loading...</p>;
};

const StatusMessage = ({ message }) => {
  return <h1 className="text-xl text-gray-600">{message}</h1>;
};

export default function DownloadStatus({ status, fileName, downloadToken }) {
  const renderByDownloadStatus = {
    loading: <LoadingMessage />,
    otp_required: (
      <OtpVerification fileName={fileName} downloadToken={downloadToken} />
    ),
    download_limit_reached: (
      <StatusMessage message="ダウンロード回数の上限に達しました。" />
    ),
    expired: <StatusMessage message="このリンクの有効期限が切れています。" />,
    not_found: <StatusMessage message="このリンクは見つかりませんでした。" />,
    error: <StatusMessage message="エラーが発生しました。" />,
  };

  return (
    renderByDownloadStatus[status] ?? (
      <StatusMessage message="エラーが発生しました。" />
    )
  );
}
