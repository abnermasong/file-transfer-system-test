import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/", label: "アップロードページ", end: true },
  { to: "/admin", label: "管理者ページ" },
];

const getTabLinkClassName = ({ isActive }) =>
  `-mb-px px-4 py-2 text-xs ${
    isActive
      ? "font-bold text-gray-800 bg-gray-200 rounded-t-md"
      : "text-gray-400 hover:text-gray-600 hover:bg-gray-300 hover:rounded-t-md"
  }`;

export default function PageTabs() {
  return (
    <nav className="flex pt-1.5 bg-white">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={getTabLinkClassName}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
