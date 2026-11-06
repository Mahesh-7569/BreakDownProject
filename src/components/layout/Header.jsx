import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  ChevronDown,
  LogOut,
  Moon,
  Sun,
  UserRound,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import brandLogo from "../../assets/JRSS-colour logo.png";

import { getusername } from "../../services/Createdelayservice";

export default function Header({ onLogout, userId, headerHeight = 72 }) {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [now, setNow] = useState(new Date());
  const [userRole, setUserRole] = useState(""); // default is Operator

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");

      if (!userId || userId === "undefined") {
        setUserRole("Operator");
        return;
      }

      try {
        const user = await getusername(userId);
        console.log(user.username); // ✅

        setUserRole(user.username); // or whatever field you need
      } catch (error) {
        console.error(error);
        setUserRole("Operator");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    setIsMenuOpen(false);
    if (onLogout) onLogout();
  };

  const handleMenuNavigate = (path) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  const isDark = theme === "dark";
  const dayAndMonth = now.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const shortTime = now.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <header
      className="fixed inset-x-0 top-0 z-20 w-full text-slate-900 shadow-lg transition-colors duration-300 dark:text-slate-50"
      style={{ height: `${headerHeight}px` }}
    >
      <div className="relative flex h-full w-full flex-col header-surface">
        <div className="flex h-full items-center justify-between gap-3 px-4 py-2 sm:gap-4 sm:px-5 lg:px-6">
          <div className="flex items-center">
            {/* <img
              src={brandLogo}
              alt="JRSS Logo"
              className="max-h-12 w-auto rounded-lg bg-white/90 px-2 py-1 dark:bg-slate-900/90"
            /> */}
          </div>

          <div className="flex flex-1 items-center justify-end gap-3 sm:gap-5">
            <div className="hidden items-center gap-2 rounded-xl bg-white/30 px-3 py-2 text-sm font-semibold text-slate-800/90 backdrop-blur-[2px] sm:flex dark:bg-white/5 dark:text-slate-100/90">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1c75bc]/12 text-[#1c75bc] dark:bg-amber-300/10 dark:text-amber-200">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {dayAndMonth}
                </span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-100/85">
                  {shortTime}
                </span>
              </div>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="group flex items-center gap-2 rounded-full px-2.5 py-1.5 text-left transition focus:outline-none focus:ring-2 focus:ring-white/40 dark:focus:ring-amber-300/45"
                aria-label="Open user menu"
                aria-expanded={isMenuOpen}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`relative flex h-9 w-9 items-center justify-center rounded-full font-bold ring-2 ring-transparent transition group-hover:ring-amber-300/40 ${
                      isDark
                        ? "bg-gradient-to-br from-slate-900 to-slate-700 text-amber-100"
                        : "bg-gradient-to-br from-white/90 to-white/60 text-[#184b6d]"
                    }`}
                  >
                    <span className="text-sm">{(userRole || "O")[0]}</span>
                    <span className="pulse-dot absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="hidden text-right sm:flex sm:flex-col sm:leading-tight">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-50">
                      {userRole || "Operator"}
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-200/80">
                      Profile
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition ${isDark ? "text-amber-50/90" : "text-slate-700"} group-hover:translate-y-0.5`}
                />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white/95 p-3 text-slate-800 backdrop-blur-xl transition dark:bg-slate-950/95 dark:text-slate-100">
                  <div className="flex items-center gap-3 rounded-xl bg-white/98 p-3 dark:bg-slate-900/90">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#184b6d] to-sky-500 text-white">
                      <UserRound className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 text-slate-800 dark:text-slate-50">
                      <p className="truncate text-sm font-semibold">
                        {userId && userId !== "undefined" ? userId : ""}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-200/90">
                        {userRole} profile
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleMenuNavigate("/users")}
                      className="group flex w-full items-center justify-between rounded-xl bg-white/95 px-3 py-3 text-left text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#1c75bc]/30 dark:bg-slate-900/85 dark:text-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        <UserRound className="h-4 w-4" />
                        <span className="transition-colors text-slate-700 dark:text-slate-100">
                          User directory
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-200">
                        Sample roster
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="group flex w-full items-center justify-between rounded-xl bg-white/95 px-3 py-3 text-left text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-slate-500/40 dark:bg-slate-900/85 dark:text-slate-50"
                    >
                      <div className="flex items-center gap-2">
                        {theme === "dark" ? (
                          <Moon className="h-4 w-4" />
                        ) : (
                          <Sun className="h-4 w-4" />
                        )}
                        <span className="transition-colors text-slate-700 dark:text-slate-100">
                          {theme === "dark" ? "Dark" : "Light"} mode
                        </span>
                      </div>
                      <div
                        className={`relative inline-flex h-8 w-16 items-center rounded-full border transition-all duration-300 ${
                          theme === "dark"
                            ? "border-amber-200/45 bg-transparent"
                            : "border-slate-200 bg-gradient-to-r from-white via-slate-50 to-slate-100"
                        }`}
                      >
                        <Sun
                          className={`absolute left-2 h-3.5 w-3.5 ${isDark ? "text-amber-200/80" : "text-amber-400"}`}
                        />
                        <Moon
                          className={`absolute right-2 h-3.5 w-3.5 ${isDark ? "text-amber-100" : "text-slate-800"}`}
                        />
                        <span
                          className={`absolute left-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-slate-700 shadow transition-all duration-300 ${
                            theme === "dark"
                              ? "translate-x-7 bg-amber-200/90 text-slate-900 shadow-amber-200/40"
                              : "translate-x-0 bg-amber-300"
                          }`}
                        >
                          {theme === "dark" ? "D" : "L"}
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center justify-between rounded-xl bg-white/98 px-3 py-3 text-left text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200/60 dark:bg-slate-950/85 dark:text-slate-100 dark:hover:bg-slate-900/85"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-200">
                        End session
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
