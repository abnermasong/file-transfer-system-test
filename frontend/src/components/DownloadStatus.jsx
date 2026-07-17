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
    download_limit_reached: <StatusMessage message="Download limit reached." />,
    expired: <StatusMessage message="This link has expired." />,
    not_found: <StatusMessage message="This link was not found." />,
    error: <StatusMessage message="Something went wrong." />,
  };

  return (
    renderByDownloadStatus[status] ?? (
      <StatusMessage message="Something went wrong." />
    )
  );
}
