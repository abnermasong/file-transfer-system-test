export default function DeleteModal({
  fileName,
  isDeleting = false,
  onCancel,
  onConfirm,
}) {
  if (!fileName) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 p-4"
      onClick={isDeleting ? undefined : onCancel}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded bg-white p-5 shadow-lg mb-20"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="-mx-5 -mt-5 mb-5 bg-red-600 px-5 py-3 text-lg font-semibold text-white">
          削除を確認する
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          <strong className="text-gray-900">「{fileName}」 </strong>
          を削除してもよろしいですか？
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded border px-3 py-2
            hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 rounded bg-red-600 px-3 py-2 text-white
            hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {isDeleting ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              "削除"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
