export default function DeleteConfirmationModal({
  fileName,
  onCancel,
  onConfirm,
}) {
  if (!fileName) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded bg-white p-5 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">ファイルを削除しますか？</h2>
        <p className="mt-2 text-sm text-gray-600">
          <strong className="text-gray-900">{fileName}</strong>
          を削除します。
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            className="rounded border px-3 py-2
            hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded bg-red-600 px-3 py-2 text-white
            hover:bg-red-700"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  );
}
