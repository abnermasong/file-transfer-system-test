export default function LoadingSpinner({
  height = "h-4",
  width = "w-4",
  borderWidth = "border-2",
  borderColor = "border-white/40",
  borderTopColor = "border-t-white",
}) {
  return (
    <span
      className={`${height} ${width} animate-spin rounded-full ${borderWidth} ${borderColor} ${borderTopColor}`}
    />
  );
}
