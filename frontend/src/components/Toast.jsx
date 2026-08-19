import { useEffect } from "react";

const TOAST_TYPE = {
  success: "border-green-500 bg-green-100 text-green-700",
  warning: "border-yellow-500 bg-yellow-100 text-yellow-700",
  error: "border-red-500 bg-red-100 text-red-700",
};

export default function Toast({
  type = "success",
  onDismiss,
  duration = 5000,
  children,
}) {
  useEffect(() => {
    if (!duration) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-left fixed right-6 top-20 z-50 w-85 max-w-[calc(100%-3rem)] shadow-lg">
      <button
        type="button"
        onClick={onDismiss}
        className="absolute right-2 top-2 z-10 px-2 text-xl leading-none text-gray-500 hover:text-gray-800"
      >
        ×
      </button>
      <div className={`rounded-lg border-l-4 p-4 pr-10 ${TOAST_TYPE[type]}`}>
        {children}
      </div>
    </div>
  );
}
