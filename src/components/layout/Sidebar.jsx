import React from "react";
import { NavLink, useLocation, useMatch } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  ListChecks,
  Users,
  Layers,
  FileStack,
  Activity,
  Settings,
} from "lucide-react";
import { getMenusByRole } from "../../services/rolemenumappingServics";
import { getAllMenus } from "../../services/menuService";
import * as Icons from "lucide-react";
import { useEffect } from "react";
const getIconComponent = (iconName) => {
  if (!iconName) return Icons.LayoutDashboard;

  const key = Object.keys(Icons).find(
    (k) => k.toLowerCase() === iconName.toLowerCase(),
  );

  return Icons[key] || Icons.LayoutDashboard;
};
// const navItems = [
//   { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
// { label: 'Live Data', to: '/Pages/Livedata', icon: Activity },
//   // { label: 'Production', to: '/production', icon: ListChecks },
//   { label: 'Users', to: '/users', icon: Users },
//   {
//     label: 'Masters',
//     to: '/masters',
//     icon: ClipboardList,
//     children: [
//       // { label: 'Customers', to: '/masters/customers' },
//       // { label: 'Plants', to: '/masters/plants' },
//       { label: 'Lines', to: '/masters/lines' },
//       { label: 'Variants', to: '/masters/variants' },
//       // { label: 'Shifts', to: '/masters/shifts' },
//       // { label: 'EOL Params', to: '/masters/eolparam' },
//       { label: 'Line Folder Map', to: '/masters/linefoldermap' },
//       { label: "Line Mapping", to: "/masters/linemapping" },
//       { label: "Plc", to: "/masters/plcmaster" },
//       { label: "Plc RFID", to: "/masters/plcrfid" },
//       { label: "Sub Station", to: "/masters/substation" },
//       { label: "Sub Station RFID", to: "/masters/SubstationRfid" },
//       { label: "Role Master", to: "/masters/rolemaster" },
//       { label: "Menu Master", to: "/masters/menumaster" },
//       { label: "Role Menu Mapping", to: "/masters/rolemenumapping" },
//     ],
//   },
// // {
// //   label: "Management",
// //   to: "/management",
// //   icon: Layers,
// //   children: [
// //     { label: "Workplan", to: "/management/workplan" },
// //   ],
// // },
// {
//   label: "Reports",
//   to: "/reports", // <-- add this
//   icon: BarChart3,
//   children: [
//     { label: "MES Bypass", to: "/reports/Mesbypass" },
//     { label: "Production", to: "/reports/Production" },
//     { label: "Production For Part", to: "/reports/ProductionforPart" },
//      { label: "Part Scan", to: "/reports/PartScanReport" },
//  ],
// },
// // {
// //   label: "DashboardPages",
// //   to: "/DashboardPages",
// //   icon: FileStack,
// //   children: [
// //     { label: "Production", to: "/DashboardPages/ProductionDashboard" },
// //      { label: "OEE", to: "/DashboardPages/OeeDashboard" },
// //   ],
// // },
// ]

const buildMenuTree = (menus) => {
  const map = {};
  const roots = [];

  menus.forEach((menu) => {
    map[menu.id] = {
      id: menu.id,
      label: menu.menuName, // ✅ correct
      to: menu.routePath, // ✅ correct
      icon: getIconComponent(menu.icon),
      children: [],
    };
  });

  menus.forEach((menu) => {
    if (menu.parentMenuId && map[menu.parentMenuId]) {
      map[menu.parentMenuId].children.push(map[menu.id]);
    } else {
      roots.push(map[menu.id]);
    }
  });

  return roots;
};

function SidebarItem({
  label,
  to,
  icon,
  isOpen,
  children,
  isExpanded,
  onToggleExpand,
  collapsedPopover,
  onCollapsedToggle,
  onCloseCollapsedPopover,
}) {
  const safeTo = to || "/";
  const match = useMatch(to || "/");
  const isActive = Boolean(match);
  const IconComponent = icon || LayoutDashboard;
  const hasChildren = Array.isArray(children) && children.length > 0;

  const baseItemClasses = `group relative flex items-center rounded-2xl ${
    isOpen ? "justify-start gap-3 px-3" : "justify-center px-2"
  } py-2.5 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
    isActive
      ? "bg-transparent text-[#1c75bc] ring-1 ring-[#1c75bc]/25 hover:bg-transparent hover:text-[#1c75bc] dark:bg-transparent dark:text-amber-300 dark:ring-amber-200/55 dark:hover:bg-transparent dark:hover:text-amber-300"
      : "bg-transparent text-slate-700 hover:bg-transparent hover:text-slate-900 dark:bg-transparent dark:text-amber-50/85 dark:hover:bg-transparent dark:hover:text-amber-50"
  }`;

  const itemContent = (
    <>
      <span
        className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#1c75bc] transition-opacity duration-300 dark:bg-amber-300/80 ${
          isActive || (isOpen && isExpanded) ? "opacity-100" : "opacity-0"
        }`}
      />
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm leading-none transition ${
          isActive
            ? "bg-transparent text-[#1c75bc] dark:bg-transparent dark:text-amber-300"
            : "bg-transparent text-slate-600 dark:bg-transparent dark:text-amber-200/90"
        }`}
      >
        <IconComponent className="h-5 w-5" />
      </span>
      <span
        className={`ml-3 whitespace-nowrap transition-all duration-200 ${
          isOpen ? "opacity-100" : "pointer-events-none w-0 opacity-0"
        }`}
      >
        {label}
      </span>
    </>
  );

  return (
    <div className="relative">
      {hasChildren ? (
        <>
          <NavLink
            to={to}
            end={!hasChildren}
            title={label}
            className={`${baseItemClasses} ${
              isOpen && isExpanded
                ? "bg-white/70 shadow-inner ring-1 ring-slate-200/80 dark:bg-slate-800/70 dark:ring-slate-700"
                : ""
            }`}
            onClick={(e) => {
              if (hasChildren) {
                e.preventDefault();
                if (isOpen) {
                  onToggleExpand(label);
                } else {
                  onCollapsedToggle(label);
                }
              }
            }}
          >
            {itemContent}
          </NavLink>

          {isOpen && isExpanded && (
            <div className="mt-1 space-y-1 rounded-xl bg-white/70 p-1 pl-10 ring-1 ring-slate-200/70 transition-all duration-300 dark:bg-slate-800/60 dark:ring-slate-700/60">
              {children.map((child) => (
                <NavLink
                  key={child.to}
                  to={child.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-slate-100/80 dark:hover:bg-slate-700/40 ${
                      isActive
                        ? "text-[#1c75bc] ring-1 ring-[#1c75bc]/25 dark:text-amber-300 dark:ring-amber-200/55"
                        : "text-slate-700 hover:text-slate-900 dark:text-amber-50/85 dark:hover:text-amber-50"
                    }`
                  }
                >
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#1c75bc] ring-2 ring-[#1c75bc]/20 dark:bg-amber-300/90 dark:ring-amber-200/45" />
                  <span>{child.label}</span>
                </NavLink>
              ))}
            </div>
          )}

          {!isOpen && collapsedPopover === label && (
            <div className="absolute left-full top-0 z-20 ml-3 min-w-[190px] rounded-2xl border border-slate-200/90 bg-white/95 p-3 text-sm shadow-xl backdrop-blur-lg dark:border-slate-800/80 dark:bg-slate-900/95">
              <div className="space-y-1">
                {children.map((child) => (
                  <NavLink
                    key={child.to}
                    to={child.to}
                    end
                    onClick={onCloseCollapsedPopover}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition hover:-translate-y-0.5 hover:bg-slate-100/80 dark:hover:bg-slate-800 ${
                        isActive
                          ? "text-[#1c75bc] ring-1 ring-[#1c75bc]/25 dark:text-amber-300 dark:ring-amber-200/55"
                          : "text-slate-700 hover:text-slate-900 dark:text-amber-50/85 dark:hover:text-amber-50"
                      }`
                    }
                  >
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#1c75bc] ring-2 ring-[#1c75bc]/20 dark:bg-amber-300/90 dark:ring-amber-200/45" />
                    <span>{child.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <NavLink to={to} end title={label} className={baseItemClasses}>
          {itemContent}
        </NavLink>
      )}
    </div>
  );
}

// Helper to map string icon name to icon component

export default function Sidebar({ isOpen, onToggle, headerHeight = 72 }) {
  const [expandedItem, setExpandedItem] = React.useState(null);
  const [collapsedPopover, setCollapsedPopover] = React.useState(null);
  const sidebarRef = React.useRef(null);
  const location = useLocation();
  const [menuItems, setMenuItems] = React.useState([]);

  const handleToggleExpand = (label) => {
    setExpandedItem((prev) => (prev === label ? null : label));
  };

  const handleCollapsedToggle = (label) => {
    setCollapsedPopover((prev) => (prev === label ? null : label));
  };

  React.useEffect(() => {
    if (isOpen) {
      setCollapsedPopover(null);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const activeParent = menuItems.find((item) =>
      item.children?.some((child) => location.pathname === child.to),
    );

    if (activeParent) {
      setExpandedItem(activeParent.label);
      if (!isOpen) {
        setCollapsedPopover(activeParent.label);
      }
    }
  }, [isOpen, location.pathname, menuItems]);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setCollapsedPopover(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const fetchMenus = async () => {
    try {
      const roleId = localStorage.getItem("roleId");

      if (!roleId) return;

      const roleMenus = await getMenusByRole(roleId);
      const allMenusRaw = await getAllMenus();

      const allMenus = [...allMenusRaw].sort((a, b) => {
        // ✅ Parent menus before child menus
        if (a.parentMenuId === 0 && b.parentMenuId !== 0) return -1;
        if (a.parentMenuId !== 0 && b.parentMenuId === 0) return 1;

        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });

      const allowedIds = new Set(
        roleMenus.filter((m) => m.canView).map((m) => Number(m.menuId)),
      );

      const tree = buildMenuTree(allMenus);

      const filterAllowed = (node) => {
        const children = (node.children || [])
          .map(filterAllowed)
          .filter(Boolean);

        // ✅ show parent if child allowed
        if (allowedIds.has(Number(node.id)) || children.length > 0) {
          return {
            ...node,
            children,
          };
        }

        return null;
      };

      const filtered = tree.map(filterAllowed).filter(Boolean);

      setMenuItems(filtered);
    } catch (err) {
      console.error("Sidebar menu load error", err);
    }
  };

  React.useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      fetchMenus();
    };

    window.addEventListener("menuUpdated", handleUpdate);

    return () => window.removeEventListener("menuUpdated", handleUpdate);
  }, []);
  return (
    <aside
      ref={sidebarRef}
      // 1. ADDED: flex flex-col
      className={`fixed left-0 bottom-0 z-30 ${
        isOpen ? "w-64" : "w-20"
      } flex flex-col bg-slate-100/90 text-slate-900 backdrop-blur-sm transition-all duration-300 dark:bg-slate-900/75 dark:text-slate-100`}
      style={{ top: `${headerHeight}px` }}
    >
      {/* 2. ADDED: shrink-0 to prevent the toggle button from being squished */}
      <div className="flex shrink-0 items-center justify-start px-3 py-2">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-transparent text-lg font-semibold leading-none text-slate-700 transition hover:bg-transparent focus:outline-none focus:ring-1 focus:ring-[#c3b260]/35 dark:bg-transparent dark:text-amber-200 dark:hover:bg-transparent"
          aria-label="Toggle navigation"
        >
          &laquo;
        </button>
      </div>

      {/* 3. ADDED: flex-1 overflow-y-auto overflow-x-hidden to make it scrollable */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-6 pt-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {" "}
        {menuItems
          ?.filter((item) => item?.to)
          ?.map((item) => (
            <SidebarItem
              key={item.id}
              {...item}
              isOpen={isOpen}
              isExpanded={expandedItem === item.label}
              onToggleExpand={handleToggleExpand}
              collapsedPopover={collapsedPopover}
              onCollapsedToggle={handleCollapsedToggle}
              onCloseCollapsedPopover={() => setCollapsedPopover(null)}
            />
          ))}
      </nav>
    </aside>
  );
}
