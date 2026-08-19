export default function AppHeader({ children }) {
  return (
    <header className="flex items-center justify-between bg-blue-500 px-4 py-4 text-white shadow">
      <p className="text-lg font-semibold">File Transfer System</p>
      {children}
    </header>
  );
}
