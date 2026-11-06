import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import {
  FolderGit2,
  Pencil,
  CheckCircle2,
  CircleDashed,
  Trash2,
  Menu,
} from "lucide-react";
import { getAllMenus,deleteMenu } from "../../services/menuService";

export default function MenuMaster() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMenus = async () => {
  setLoading(true);
  try {
    const result = await getAllMenus();
const sortedMenus = [...result].sort((a, b) => {
  // parent menus first
  if (a.parentMenuId === 0 && b.parentMenuId !== 0) return -1;
  if (a.parentMenuId !== 0 && b.parentMenuId === 0) return 1;

  // then sort by id
return (a.displayOrder || 0) - (b.displayOrder || 0);});

setData(sortedMenus);
  } catch (err) {
    console.error(err);
  }
  setLoading(false);
};


  useEffect(() => {
  fetchMenus();
}, []);



  const handleEdit = (row) => {
    navigate(`/masters/menumaster/edit/${row.id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu?")) {
      try {
        await deleteMenu(id);
        window.dispatchEvent(new Event("menuUpdated"));
        fetchMenus();
      } catch (err) {
        console.error("Failed to delete menu:", err);
      }
    }
  };

  // Status badge
  function StatusBadge({ active }) {
    const tone = active
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : "bg-rose-50 text-rose-700 ring-rose-100";

    const dot = active ? "bg-emerald-500" : "bg-rose-500";
    const Icon = active ? CheckCircle2 : CircleDashed;
const menuMap = new Map(data.map((m) => [m.id, m.menuName]));
    return (
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone}`}>
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <Icon className="h-4 w-4" />
        {active ? "Active" : "Inactive"}
      </span>
    );
  }
  



  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Masters"
        title="Menu Master"
        description="Manage application menus."
        icon={Menu}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Live catalogue
          </div>
        }
      />

      {/* ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Menu Actions
          </p>
          <p className="text-sm text-slate-600">
            Create, reload, or browse menus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/masters/menumaster/add")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white"
          >
            <FolderGit2 className="h-4 w-4" /> Add Menu
          </button>

          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-4 w-4" /> Auto refresh
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <p className="p-4 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="p-4 text-sm">No menus found.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Menu Name</th>
                <th className="px-4 py-3">Path</th>
                <th className="px-4 py-3">Parent</th>
                 <th className="px-4 py-3">Display Order</th>  
                  <th className="px-4 py-3">Icon</th> 
                <th className="px-4 py-3">MenuCode</th>

                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

           <tbody className="divide-y">
  {data.map((row) => (
    <tr key={row.id}>

      <td className="px-4 py-3 font-semibold">{row.id}</td>

      <td className="px-4 py-3">{row.menuName}</td>

      <td className="px-4 py-3">{row.routePath}</td>

      <td className="px-4 py-3">
       {Number(row.parentMenuId) > 0
  ? data.find((m) => m.id === Number(row.parentMenuId))?.menuName || "-"
  : "-"}
      </td>
      {/* ADD THIS NEW TD FOR DISPLAY ORDER */}
      <td className="px-4 py-3 text-center">
        {row.displayOrder || 0}
      </td>

      <td className="px-4 py-3">
        {row.icon || "-"}
      </td>

        <td className="px-4 py-3">
{row.menuCode || "-"}      </td>

      <td className="px-4 py-3">
        <StatusBadge active={row.isActive} />
      </td>

      <td className="px-4 py-3 flex gap-2">
        <button
          onClick={() => handleEdit(row)}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1 text-xs text-blue-700"
        >
          <Pencil className="h-4 w-4" /> Edit
        </button>

        <button
          onClick={() => handleDelete(row.id)}
          className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1 text-xs text-rose-700"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </td>

    </tr>
  ))}
</tbody>
          </table>
        )}
      </div>
    </div>
  );
}