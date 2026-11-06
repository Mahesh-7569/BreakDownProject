import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import { ClipboardList, Pencil, CheckCircle2, Trash2 } from "lucide-react";
import { getAllItemTypes, deleteItemType } from "../../services/itemTypeService";

export default function ItemTypeMaster() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await getAllItemTypes();
      setData(result);
    } catch (err) {
      console.error("Failed to fetch item types:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (row) => {
    navigate(`/masters/itemtype/edit/${row.id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Item Type?")) {
      try {
        await deleteItemType(id);
        fetchData(); 
      } catch (err) {
        console.error("Failed to delete item type:", err);
        alert(`Failed to delete. Error: ${err.response?.status || err.message}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Masters"
        title="Item Type Master"
        description="Manage item types and classifications."
        icon={ClipboardList}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Live tracking
          </div>
        }
      />

      {/* ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">Type Actions</p>
          <p className="text-sm text-slate-6 font-semibold0 text-slate-600 dark:text-slate-300">Create or browse item types.</p>
        </div>

        <button
          onClick={() => navigate("/masters/itemtype/add")}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
        >
          <ClipboardList className="h-4 w-4" /> Add New Item Type
        </button>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white/95 shadow-sm ring-1 ring-slate-200 dark:bg-slate-955/70 dark:ring-slate-800/80">
        {loading ? (
          <p className="p-4 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="p-4 text-sm">No item types found.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/90 dark:divide-slate-800 dark:bg-slate-900/70">
              {data.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/70">
                  <td className="px-4 py-3 font-semibold">{row.id}</td>
                  <td className="px-4 py-3 font-semibold">{row.description}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(row)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
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