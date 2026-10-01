export default function StatusFilter({ value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="status-filter" className="text-xs text-gray-700">
        ステータス
      </label>
      <select
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none hover:bg-gray-100"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">-</option>
        {Object.entries(options).map(([statusValue, label]) => (
          <option key={statusValue} value={statusValue}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
