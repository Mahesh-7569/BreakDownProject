import { useEffect, useState } from "react";
import {
  Save,
  Loader2,
  FolderGit2,
  CheckCircle2,
  Shuffle,
  Settings2,
} from "lucide-react";
import { getAllRoles } from "../../services/roleService";
import { getAllMenus } from "../../services/menuService";
import {
  addOrEditRoleMenuMapping,
  getMenusByRole,
  deleteMappingsByRole,
} from "../../services/rolemenumappingServics";
import PageHero from "../../components/PageHero";
import React from "react";

export default function RoleMenuMapping() {
  const [roles, setRoles] = useState([]);
  const [menus, setMenus] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState([]);

  const normalizeMenus = (data) =>
    data.map((m) => ({
      id: m.id,
      menuName: m.menuName || m.menuname,
      parentMenuId: m.parentMenuId ?? m.parentmenuid ?? 0,
    }));

  const toggleExpand = (id) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // ✅ 1. Load roles & menus on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const roleData = await getAllRoles();
        const menuData = normalizeMenus(await getAllMenus());
        setRoles(roleData);
        setMenus(menuData);

        if (roleData.length === 0) return;

        const firstRoleId = roleData[0].id;
        setSelectedRole(firstRoleId); // ✅ select first role

        // 🔥 immediately load mapping for first role
        const response = await getMenusByRole(firstRoleId);

        const rawMapping = response?.data || response || [];

        const mapping = rawMapping.map((m) => ({
          menuId: Number(m.menuId ?? m.menuid),
          canview: m.canView ?? m.canview ?? false,
          canadd: m.canAdd ?? m.canadd ?? false,
          canedit: m.canEdit ?? m.canedit ?? false,
          candelete: m.canDelete ?? m.candelete ?? false,
        }));
        const initialPermissions = menuData.map((menu) => {
          const existing = mapping.find(
            (m) => Number(m.menuId) === Number(menu.id),
          );
          return {
            id: existing?.id || 0,
            menuid: menu.id,
            canview: existing?.canview || false,
            canadd: existing?.canadd || false,
            canedit: existing?.canedit || false,
            candelete: existing?.candelete || false,
            isactive: true,
          };
        });

        setPermissions(initialPermissions); // ✅ set directly
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    loadData();
  }, []);

  // ✅ 2. Load existing role-menu mapping when role changes
  useEffect(() => {
    const loadMapping = async () => {
      if (!selectedRole || menus.length === 0) return;

      try {
        // setPermissions([]); // ✅ IMPORTANT RESET (ADD THIS)

        // Replace the mapping logic inside both useEffects with this:
        const response = await getMenusByRole(selectedRole);
        // Since your new service returns an array of mapped objects directly:
        const mapping = response || [];

        const updatedPermissions = menus.map((menu) => {
          const existing = mapping.find(
            (m) => Number(m.menuId) === Number(menu.id),
          );
          return {
            id: existing?.id || 0,
            menuid: menu.id,
            canview: existing?.canView ?? false, // ✅ Use camelCase from service response
            canadd: existing?.canAdd ?? false,
            canedit: existing?.canEdit ?? false,
            candelete: existing?.canDelete ?? false,
            isactive: true,
          };
        });
        setPermissions(updatedPermissions);
      } catch (err) {
        console.error("Error loading role-menu mapping:", err);
      }
    };

    loadMapping();
  }, [selectedRole, menus]);

  const handleSave = async () => {
    if (!selectedRole) return alert("Select role");
    setLoading(true);

    try {
      // ✅ JUST SEND THE PAYLOAD.
      // The backend 'saveOrUpdate' logic will handle the rest!
      const payload = permissions.map((perm) => ({
        roleId: Number(selectedRole),
        menuId: Number(perm.menuid),
        canView: perm.canview,
        canAdd: perm.canadd,
        canEdit: perm.canedit,
        canDelete: perm.candelete,
      }));

      // Send each permission to the new Upsert endpoint
      for (const item of payload) {
        await addOrEditRoleMenuMapping(item);
      }

      alert("Saved Successfully ✅");
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save mapping. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roles.length > 0 && menus.length > 0 && !selectedRole) {
      setSelectedRole(roles[0].id);
    }
  }, [roles, menus]);

  useEffect(() => {
    if (menus.length > 0) {
      const parentIds = menus.filter((m) => !m.parentMenuId).map((m) => m.id);
      setExpanded(parentIds); // ✅ open all by default
    }
  }, [menus]);

  // ✅ 3. Handle checkbox toggle
  const handleParentToggle = (parentId, isChecked) => {
    setPermissions((prev) =>
      prev.map((p) => {
        const menu = menus.find((m) => m.id === p.menuid);
        if (!menu) return p;

        if (menu.id === parentId || menu.parentMenuId === parentId) {
          return {
            ...p,
            canview: isChecked,
            canadd: isChecked,
            canedit: isChecked,
            candelete: isChecked,
          };
        }

        return p;
      }),
    );
  };

  const handleChildToggle = (childId, parentId, isChecked) => {
    setPermissions((prev) =>
      prev.map((p) => {
        if (Number(p.menuid) === Number(childId)) {
          return {
            ...p,
            canview: isChecked,
            canadd: isChecked,
            canedit: isChecked,
            candelete: isChecked,
          };
        }
        return p;
      }),
    );
  };

  const parentMenus = menus.filter((m) => !m.parentMenuId);

  return (
    <div className="container py-6 min-h-screen text-slate-900 dark:text-slate-100">
      <PageHero
        eyebrow="Masters"
        title="Role Menu Mapping"
        description="Assign permissions (View, Add, Edit, Delete) to roles."
        icon={Settings2}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Live catalogue
          </div>
        }
      />

      <div className="grid grid-cols-3 gap-6 mt-6">
        {/* 🔹 LEFT SIDE - ROLE LIST */}
        <div className="col-span-1 bg-white rounded-2xl shadow p-4 h-[calc(100vh-220px)] min-h-[400px] overflow-y-auto">
          <h2 className="font-semibold mb-3">Role List</h2>

          {roles.map((role) => (
            <div
              key={role.id}
              className={`p-2 rounded cursor-pointer flex items-center gap-2 
                ${selectedRole === role.id ? "bg-blue-100" : "hover:bg-gray-100"}`}
              onClick={() => setSelectedRole(role.id)}
            >
              <input
                type="radio"
                checked={selectedRole === role.id}
                onChange={() => setSelectedRole(role.id)}
              />
              {role.roleName} {/* ✅ FIXED */}
            </div>
          ))}
        </div>

        {/* 🔹 RIGHT SIDE - TREE MENU */}
        <div className="col-span-2 bg-white rounded-2xl shadow flex flex-col h-[calc(100vh-220px)] min-h-[400px]">
          {/* 🔹 HEADER (FIXED) */}
          <div className="flex justify-between items-center p-4 border-b shrink-0">
            <h2 className="font-semibold">Menu Assignment</h2>

            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-[#1c75bc] text-white px-4 py-1 rounded"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>

          {/* 🔹 SCROLLABLE CONTENT (min-h-0 is the scroll fix) */}
          <div className="overflow-y-auto flex-1 min-h-0 p-4">
            {parentMenus.map((menu) => {
              const perm = permissions.find(
                (p) => Number(p.menuid) === Number(menu.id),
              );
              const childMenus = menus.filter(
                (m) => m.parentMenuId === menu.id,
              );
              const isOpen = expanded.includes(menu.id);

              return (
                <div key={menu.id} className="mb-2">
                  {/* Parent */}
                  <div className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                    {childMenus.length > 0 && (
                      <span onClick={() => toggleExpand(menu.id)}>
                        {isOpen ? "▼" : "▶"}
                      </span>
                    )}

                    <input
                      type="checkbox"
                      checked={perm?.canview === true}
                      onChange={(e) =>
                        handleParentToggle(menu.id, e.target.checked)
                      }
                    />

                    <span className="font-medium">{menu.menuName}</span>
                  </div>

                  {/* Children */}
                  {isOpen && (
                    <div className="ml-6 border-l pl-4">
                      {childMenus.map((child) => {
                        const childPerm = permissions.find(
                          (p) => Number(p.menuid) === Number(child.id),
                        );
                        return (
                          <div
                            key={child.id}
                            className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={childPerm?.canview === true}
                              onChange={(e) =>
                                handleChildToggle(
                                  child.id,
                                  menu.id,
                                  e.target.checked,
                                )
                              }
                            />
                            <span>{child.menuName}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        {/* <button
          onClick={handleSave}
          disabled={loading}
          className="bg-[#1c75bc] text-white px-5 py-2 rounded-xl flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Save />
          )}
          Save Mapping
        </button> */}
      </div>
    </div>
  );
}
