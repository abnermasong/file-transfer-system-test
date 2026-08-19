export default function PageHeader({ children }) {
  return (
    <header className="flex items-center justify-between bg-blue-500 px-4 py-2 text-white shadow">
      <p className="text-md font-semibold">File Transfer System</p>
      {children}
    </header>
  );
}
