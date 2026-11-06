import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import {
  FolderGit2,
  CheckCircle2,
  CircleDashed,
  Pencil,
} from "lucide-react";
import { getLineFolderMaps } from "../../services/lineFolderMapService";

export default function LineFolderMap() {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch API data
  useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const result = await getLineFolderMaps(); // no parameters needed
    setData(result);
    setLoading(false);
  };

  fetchData();
}, []);

  const handleEdit = (row: any) => {
    navigate(`/masters/linefoldermap/edit/${row.id}`);
  };

  const getLineName = (id: number) =>
    data.find((l) => l.lineId === id)?.lineName || "-";

  // Status badge component
  function StatusBadge({ active }: { active: boolean }) {
    const tone = active
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-100 dark:ring-emerald-400/30"
      : "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-400/15 dark:text-rose-100 dark:ring-rose-400/30";
    const dot = active
      ? "bg-emerald-500 dark:bg-emerald-300"
      : "bg-rose-500 dark:bg-rose-300";
    const Icon = active ? CheckCircle2 : CircleDashed;

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${tone}`}
      >
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
        title="Line Report Folder Map"
        description="Manage line to folder mapping configuration."
        icon={FolderGit2}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Live catalogue
          </div>
        }
      />

      {/* ACTION BAR */}
<div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">
      Line Folder Map Actions
    </p>
    <p className="text-sm text-slate-600 dark:text-slate-300">
      Create, reload, or browse mapping records.
    </p>
  </div>

  <div className="flex items-center gap-3">
    <button
      onClick={() => navigate("/masters/linefoldermap/add")}
      className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
    >
      <FolderGit2 className="h-4 w-4" /> Add New Map
    </button>

    <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
      <CheckCircle2 className="h-4 w-4" /> Auto refresh on demand
    </div>
  </div>
</div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white/95 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950/70 dark:ring-slate-800/80">
        {loading ? (
          <p className="p-4 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="p-4 text-sm">No records found.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Line</th>
                <th className="px-4 py-3 font-semibold">Line Report Folder Path</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/90 dark:divide-slate-800 dark:bg-slate-900/70">
              {data.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/70">
                  <td className="px-4 py-3 font-semibold">{row.id}</td>
                  <td className="px-4 py-3 font-semibold">{getLineName(row.lineId)}</td>
                  <td className="px-4 py-3">{row.partDataFolder}</td>
                  <td className="px-4 py-3"><StatusBadge active={row.isActive} /></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(row)}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100"
                    >
                      <Pencil className="h-4 w-4" /> Edit
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