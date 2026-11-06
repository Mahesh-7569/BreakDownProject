import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import brandLogo from "../assets/sarthiiLogo.png";
import { login, persistAuth } from "../services/authService";
import { getMenusByRole } from "../services/rolemenumappingServics";

// ✅ IMPORT THIS
import { getAllMenus } from "../services/menuService";

function LoginPage({
  isAuthenticated,
  redirectPath = "/dashboard",
  onLoginSuccess,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const version = useMemo(() => "10.5.0.1", []);

  useEffect(() => {
    if (isAuthenticated) {
      // navigate(destination, { replace: true })
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!userId.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(userId.trim(), password);

      if (result?.success) {
        localStorage.setItem("token", result.accessToken);
        localStorage.setItem("roleId", result.roleId);
        localStorage.setItem("userId", result.userId);

        // ✅ 1. Fetch BOTH permissions and menu details
        const roleMenus = await getMenusByRole(result.roleId);
        const allMenus = await getAllMenus();

        // ✅ 2. Merge them so we get the ACTUAL route paths
        const menus = roleMenus.map((m) => {
          // Find the matching menu detail from getAllMenus
          const menuDetail = allMenus.find(
            (menu) => Number(menu.id) === Number(m.menuId),
          );

          return {
            id: m.menuId,
            label: menuDetail?.menuName || "", // Get from menuDetail
            to: (menuDetail?.routePath || "").trim().toLowerCase(), // Get from menuDetail
            icon: menuDetail?.icon || "LayoutDashboard",
            parentMenuId: menuDetail?.parentMenuId || 0,
            canView: m.canView,
          };
        });

        localStorage.setItem("permissions", JSON.stringify(menus));

        const firstMenu = menus.find(
          (m) => m.canView && m.to && m.to.trim() !== "",
        );

        const hasDashboardAccess = menus.some(
          (m) => m.canView && m.to === "/dashboard",
        );

        if (hasDashboardAccess) {
          navigate("/dashboard", { replace: true });
        } else if (firstMenu) {
          navigate(firstMenu.to, { replace: true });
        } else {
          navigate("/unauthorized", { replace: true });
        }
      } else {
        setError(
          result.message || "Login failed. Please check your credentials.",
        );
      }
    } catch (err) {
      setError(err.message || "Unable to login right now.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-slate-100 text-slate-900 transition-colors duration-500 d-flex flex-column dark:bg-slate-950 dark:text-slate-100">
      <header className="px-4 py-3">
        <div className="container">
          {/* Simple brand placement */}
          {/* <img
            src={brandLogo}
            alt="sarthiiLogo"
            className="h-auto"
            style={{ maxHeight: 36 }}
          /> */}
        </div>
      </header>

      <main className="flex-grow-1 d-flex align-items-center justify-content-center px-3 pb-5">
        <div className="w-100" style={{ maxWidth: 460 }}>
          <div className="rounded-4 border border-slate-200 bg-slate-50 px-4 px-md-4 py-4 shadow-sm transition-colors duration-500 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none">
            <div className="text-center mb-4">
              <p className="mb-1 text-uppercase text-xs fw-semibold text-slate-600 dark:text-slate-400">
                Welcome to
              </p>
              <h1 className="h4 fw-semibold mb-1" style={{ color: "#0066ff" }}>
                CMMS 
              </h1>
              <div className="d-flex justify-content-center">
                <span
                  className="d-inline-block"
                  style={{ height: 3, width: 64, backgroundColor: "#0037a8" }}
                />
              </div>
            </div>

            <form
              className="needs-validation"
              noValidate
              onSubmit={handleSubmit}
            >
              <div className="mb-3">
                <label className="form-label small fw-semibold text-slate-700 dark:text-slate-200">
                  Username
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3 border-slate-200 bg-slate-50 text-slate-900 shadow-none transition-colors duration-300 placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                  placeholder="Enter your username"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  autoComplete="username"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-slate-700 dark:text-slate-200">
                  Password
                </label>
                <input
                  type="password"
                  className="form-control form-control-lg rounded-3 border-slate-200 bg-slate-50 text-slate-900 shadow-none transition-colors duration-300 placeholder:text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="alert alert-danger py-2" role="alert">
                  <span className="fw-semibold">Login failed:</span> {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold transition-colors duration-300 dark:bg-blue-600 dark:border-blue-600"
                disabled={isLoading}
              >
                {isLoading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="text-center mt-3">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Use your credentials to continue.
              </span>
            </div>
          </div>

          <div className="text-center mt-4 text-slate-600 text-sm transition-colors duration-300 dark:text-slate-300">
            <div className="mb-1">Version {version}</div>
            <div className="d-flex justify-content-center gap-3 text-sm">
              <a
                href="#"
                className="text-primary text-decoration-none dark:text-blue-300"
              >
                What&apos;s New
              </a>
              <a
                href="#"
                className="text-primary text-decoration-none dark:text-blue-300"
              >
                Terms and Conditions
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LoginPage;
