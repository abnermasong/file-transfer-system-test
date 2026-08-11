export default function DeleteConfirmationModal({
  fileName,
  onCancel,
  onConfirm,
}) {
  if (!fileName) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 p-4"
      onClick={onCancel}
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
