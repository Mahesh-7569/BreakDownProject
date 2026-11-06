import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { addOrEditRole, getAllRoles } from "../../services/roleService";

export default function AddRoleMaster() {
  const navigate = useNavigate();
  const { id } = useParams(); // id from edit route

  const [form, setForm] = useState({
    id: 0,
roleName: "",
isActive: true, // ✅ Added isActive
  });
  const [submitting, setSubmitting] = useState(false);

  // Prefill form if editing
  useEffect(() => {
    const fetchRoleData = async () => {
      if (id) {
        try {
          const roles = await getAllRoles(); // fetch all roles
          const role = roles.find((r) => r.id === parseInt(id));
          if (role) setForm(role); // prefill form
        } catch (err) {
          console.error("Error fetching role data:", err);
        }
      }
    };
    fetchRoleData();
  }, [id]);

  // Handle input change
 const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save / Update role using same API
  const handleSave = async () => {
    setSubmitting(true);
    try {
      await addOrEditRole(form); // same API for Add & Edit
      navigate("/masters/rolemaster"); // back to list
    } catch (err) {
      console.error("Failed to save role:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Masters
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              {id ? "Edit Role" : "Add Role"}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/masters/rolemaster")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            Back to Role Master
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {id
            ? "Edit existing role and update its details."
            : "Configure a new role for users."}
        </p>
      </div>

      {/* FORM */}
      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end w-full max-w-3xl">
  
  {/* Role Name Input */}
  <div>
    <label className="mb-1 block text-sm font-semibold">
      Role Name*
    </label>
    <input
      type="text"
      name="roleName"
      value={form.roleName}
      onChange={handleInputChange}
      placeholder="Enter role name"
      className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm
        focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200
        dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
    />
  </div>

  {/* Active Checkbox UI */}
  <div>
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
      <input
        type="checkbox"
        name="isActive"
        checked={form.isActive}
        onChange={handleInputChange}
        className="h-5 w-5"
      />
      <span className="text-sm font-semibold">Active</span>
    </div>
  </div>

</div>
        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/masters/rolemaster")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16629b] disabled:opacity-60 dark:bg-amber-400 dark:text-slate-950"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {id ? "Update Role" : "Save Role"}
          </button>
        </div>
      </form>
    </div>
  );
}