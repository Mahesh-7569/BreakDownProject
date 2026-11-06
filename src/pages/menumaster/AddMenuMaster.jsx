import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { addOrEditMenu, getAllMenus } from "../../services/menuService";
import { getMenuById } from "../../services/menuService";
export default function AddMenuMaster() {
  const navigate = useNavigate();
  const { id } = useParams();

const [form, setForm] = useState({
  id: 0,
  menuName: "",
  menuCode: "",
  parentMenuId: 0,
  routePath: "",
  icon: "",
  displayOrder: 0,
  isActive: true,
});
  const [menus, setMenus] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Prefill + load dropdown
  useEffect(() => {
  const fetchData = async () => {
    const allMenus = await getAllMenus();
    setMenus(allMenus);

    if (id) {
      const menu = await getMenuById(id); // ✅ IMPORTANT FIX

      console.log("EDIT MENU:", menu); // DEBUG

      setForm({
        id: menu.id ?? 0,
        menuName: menu.menuName ?? "",
        menuCode: menu.menuCode ?? "", // ✅ WILL NOW WORK
        parentMenuId: menu.parentMenuId ?? 0,
        routePath: menu.routePath ?? "",
        icon: menu.icon ?? "",
        displayOrder: menu.displayOrder ?? 0, // ✅ ADD THIS
        isActive: menu.isActive ?? true,
      });
    }
  };

  fetchData();
}, [id]);

  const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;

  setForm((prev) => ({
    ...prev,
   [name]:
  type === "checkbox"
    ? checked
: ["parentMenuId", "displayOrder"].includes(name)
    ? Number(value)   // ✅ always number
    : value,
  }));
};
 const handleSave = async () => {
  setSubmitting(true);

  try {
    const payload = {
      id: form.id || 0,
      menuName: form.menuName?.trim() || "",
      menuCode: form.menuCode?.trim() || "",
parentMenuId: Number(form.parentMenuId || 0),
        routePath: form.routePath?.trim() || "",
      icon: form.icon?.trim() || "",
      displayOrder: Number(form.displayOrder || 0), // ✅ ADD THIS
      isActive: form.isActive === true,
    };

    console.log("FINAL PAYLOAD:", payload);

    await addOrEditMenu(payload);
window.dispatchEvent(new Event("menuUpdated"));
setTimeout(() => {
  navigate("/masters/menumaster");
}, 100);

  } catch (err) {
    console.error("Failed to save menu:", err.response?.data || err);
  } finally {
    setSubmitting(false);
  }
};
  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">
      
      {/* HEADER (Same as Role Master) */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Masters
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              {id ? "Edit Menu" : "Add Menu"}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/masters/menumaster")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            Back to Menu Master
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {id
            ? "Edit existing menu and update its details."
            : "Configure a new menu for the application."}
        </p>
      </div>

      {/* FORM (Same UI style as Role Master) */}
      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800">
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          
          {/* Menu Name */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Menu Name*</label>
            <input
              type="text"
            name="menuName"
value={form.menuName}
              onChange={handleInputChange}
              placeholder="Enter menu name"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-slate-400
              dark:border-slate-700 dark:bg-slate-900"
            />
          </div>

          {/* Menu Code */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Menu Code</label>
            <input
  type="text"
  name="menuCode"
  value={form.menuCode || ""}
  onChange={handleInputChange}

              placeholder="Enter menu code"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm"
            />
          </div>

          {/* Route Path */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Route Path</label>
           <input
  type="text"
  name="routePath"
  value={form.routePath || ""}
  onChange={handleInputChange}

              placeholder="/dashboard"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Icon</label>
            <input
              type="text"
              name="icon"
              value={form.icon}
              onChange={handleInputChange}
              placeholder="dashboard / users"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm"
            />
          </div>

          {/* Display Order */}
         {/* Display Order */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Display Order</label>
            <input
              type="number"
              name="displayOrder"
              value={form.displayOrder}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm"
            />
          </div>

          {/* Parent Menu */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Parent Menu</label>
            <select
name="parentMenuId"
value={form.parentMenuId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm"
            >
               <option value="">No Parent</option>
  {menus.map((m) => (
    <option key={m.id} value={m.id}>
      {m.menuName}
    </option>
              ))}
            </select>
          </div>

          {/* Active */}
          <div className="self-end">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
name="isActive"
checked={form.isActive}
                onChange={handleInputChange}
                className="h-5 w-5"
              />
              <span className="text-sm">Active</span>
            </div>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/masters/menumaster")}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {id ? "Update Menu" : "Save Menu"}
          </button>
        </div>

      </form>
    </div>
  );
}