import { Navigate, useLocation, Outlet } from "react-router-dom";
import { isAuthenticated } from "../../services/authService";
import { useEffect, useState } from "react";

function PrivateRoute({ children, redirectPath = "/login" }) {
  const location = useLocation();
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    // 1. Fetch permissions from storage
    const permissions = JSON.parse(localStorage.getItem("permissions")) || [];

    // 2. Safely normalize paths, preserving "/" for the root route
    const normalize = (path) => {
      if (!path) return "";
      const cleaned = path.toLowerCase().replace(/\s+/g, "").trim();
      return cleaned === "/" ? "/" : cleaned.replace(/\/$/, "");
    };

    const currentPath = normalize(location.pathname);

    // ❌ If no permissions → deny
    if (!permissions.length) {
      console.warn("PrivateRoute: No permissions found in localStorage!");
      setAllowed(false);
      return;
    }

    // ✅ SMARTER DYNAMIC MATCHING
    const hasAccess = permissions.some((menu) => {
      const route = normalize(menu.to || menu.routePath);
      const canView = menu.canView === true || menu.canView === 1;

      if (!route || !canView) return false;

      // 1. Allow exact match (e.g., exactly /masters/menumaster)
      if (currentPath === route) return true;

      // 2. Allow specific action sub-routes (add, edit, create)
      // This ensures if they have access to /masters/menumaster, 
      // they get access to /masters/menumaster/add, but having access 
      // to /masters does NOT give access to /masters/menumaster.
      if (
        currentPath.startsWith(`${route}/add`) || 
        currentPath.startsWith(`${route}/edit`) ||
        currentPath.startsWith(`${route}/create`)
      ) {
        return true;
      }

      return false;
    });
    if (!hasAccess) {
      console.log("🚫 ACCESS DENIED TO:", currentPath);
    }

    setAllowed(hasAccess);
  }, [location.pathname]);

  // Auth check
  if (!isAuthenticated()) {
    return <Navigate to={redirectPath} replace state={{ from: location.pathname }} />;
  }

  // Loading state
  if (allowed === null) return null;

  // Unauthorized
  if (!allowed) return <Navigate to="/unauthorized" replace />;

  return children ? children : <Outlet />;
}

export default PrivateRoute;