const LoadingMessage = () => {
  return <p className="text-gray-600">Loading...</p>;
};

const OtpRequest = ({ fileName }) => {
  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">{fileName}</h1>

      <button
        type="button"
        className="mt-4 w-full rounded-md bg-blue-600 px-6 py-3 font-semibold text-white"
      >
        Request OTP to Download File
      </button>
    </>
  );
};

const StatusMessage = ({ message }) => {
  return <h1 className="text-xl text-gray-600">{message}</h1>;
};

export default function DownloadStatus({ status, fileName }) {
  const renderByDownloadStatus = {
    loading: <LoadingMessage />,
    otp_required: <OtpRequest fileName={fileName} />,
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
