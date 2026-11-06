import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

export default function OnlyHeaderLayout({ onLogout, userId }) {
  const HEADER_HEIGHT = 72;
  const location = useLocation();

  // Hide header only for Production Dashboard
  const hideHeader = location.pathname.includes("ProductionDashboard");

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      <div className="relative z-10">
        {!hideHeader && (
          <Header
            onLogout={onLogout}
            userId={userId}
            headerHeight={HEADER_HEIGHT}
          />
        )}

        <main className="animate-fade-slide px-4 pb-10 pt-24 sm:px-6 lg:px-8">
          <div className="mx-auto w-[91%]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
