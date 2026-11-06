import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import { Clock, Pencil, CheckCircle2, CircleDashed, Trash2, AlertTriangle } from "lucide-react";
import { getAllDowntimeReasons, deleteDowntimeReason } from "../../services/downtimeReasonService";
import { getAllCategories } from "../../services/categoryService"; // ✅ Import category service

export default function DowntimeReasonMaster() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [categoryMap, setCategoryMap] = useState({}); // ✅ State to hold our ID-to-Name map
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // ✅ Fetch both APIs at the same time for better performance
      const [reasonsResult, categoriesResult] = await Promise.all([
        getAllDowntimeReasons(),
        getAllCategories()
      ]);

      // ✅ Create a dictionary mapping: { 1: "Mechanical Issue", 2: "Electrical Issue" }
      // Using `description` based on your CategoryMaster API structure
      const catMap = {};
      categoriesResult.forEach((category) => {
        catMap[category.id] = category.description; 
      });
      
      setCategoryMap(catMap);
      setData(reasonsResult);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (row) => {
    navigate(`/masters/downtime-reasons/edit/${row.id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this downtime reason?")) {
      try {
        await deleteDowntimeReason(id);
        fetchData(); // Reload table after delete
      } catch (err) {
        console.error("Failed to delete downtime reason:", err);
      }
    }
  };

  function StatusBadge({ active }) {
    const tone = active 
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-100 dark:ring-emerald-400/30" 
      : "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-400/15 dark:text-rose-100 dark:ring-rose-400/30";
    const Icon = active ? CheckCircle2 : CircleDashed;

    return (
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${tone}`}>
        <Icon className="h-4 w-4" />
        {active ? "Active" : "Inactive"}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Masters"
        title="Downtime Reason Master"
        description="Manage machine downtime reasons and categories."
        icon={AlertTriangle}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Live tracking
          </div>
        }
      />

      {/* ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">Reason Actions</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Create or browse downtime reasons.</p>
        </div>

        <button
          onClick={() => navigate("/masters/downtime-reasons/add")}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
        >
          <Clock className="h-4 w-4" /> Add New Reason
        </button>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white/95 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950/70 dark:ring-slate-800/80">
        {loading ? (
          <p className="p-4 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="p-4 text-sm">No downtime reasons found.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Category</th> {/* ✅ Changed header title */}
                <th className="px-4 py-3">Reason Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/90 dark:divide-slate-800 dark:bg-slate-900/70">
              {data.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/70">
                  <td className="px-4 py-3 font-semibold">{row.id}</td>
                  
                  {/* ✅ Lookup the category name using the map, fallback to ID if missing */}
                  <td className="px-4 py-3">
                    {categoryMap[row.downtimeCategoryId] || `Unknown (ID: ${row.downtimeCategoryId})`}
                  </td>
                  
                  <td className="px-4 py-3 font-semibold">{row.reasonName}</td>
                  <td className="px-4 py-3">
                    <StatusBadge active={row.isActive} />
                  </td>
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