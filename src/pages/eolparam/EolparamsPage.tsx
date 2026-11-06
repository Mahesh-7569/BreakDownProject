import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import { SlidersHorizontal, CheckCircle2 } from "lucide-react";
import EolparamsTable, { EolParam } from "./EolparamsTable";
import { useState, useEffect } from "react";
import { getEolParams, deleteEolParam } from "../../services/eolparamService";

export default function EolparamsPage() {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState<EolParam[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const apiData: any[] = await getEolParams(); // temporarily allow any
        const mappedData: EolParam[] = apiData.map(item => ({
          id: item.id,
          description: item.description,
          detailProcess: item.detailProcess,
          active: item.isActive, // map backend isActive -> frontend active
        }));
        setTableData(mappedData);
      } catch (err) {
        console.error("Error fetching EOL Params:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (row: EolParam) => {
    navigate(`/masters/eolparam/${row.id}/edit`);
  };

  const handleDelete = async (row: EolParam) => {
    if (!confirm("Are you sure you want to delete this parameter?")) return;
    try {
      setDeletingId(row.id);
      await deleteEolParam(row.id);
      setTableData(prev => prev.filter(p => p.id !== row.id));
    } catch (err) {
      console.error("Error deleting EOL Param:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Masters"
        title="EOL Params"
        description="Manage end-of-line parameters for your plant dashboard."
        icon={SlidersHorizontal}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Live catalogue
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">EOL Param Actions</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Create, reload, or browse the live catalogue.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/masters/eolparam/add")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
          >
            <SlidersHorizontal className="h-4 w-4" /> Add EOL Param
          </button>

          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-4 w-4" /> Auto refresh on demand
          </div>
        </div>
      </div>

      <div className="mt-6">
        <EolparamsTable
          data={tableData}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      </div>
    </div>
  );
}
