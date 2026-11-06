import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { EolParam, getEolParamById, updateEolParam } from "../../services/eolparamService";

export default function EditEolparam() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<EolParam>({
    id: 0,
    description: "",
    detailProcess: "",
    active: true,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // fetch record by id
  useEffect(() => {
  const fetchData = async () => {
    if (!id) {
      setError("Invalid ID");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getEolParamById(Number(id));
      setForm(data); // prefill form
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch record");
    } finally {
      setLoading(false); // stops loading
    }
  };

  fetchData();
}, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (!id) throw new Error("Invalid ID");
      await updateEolParam(Number(id), form); // update API
      navigate("/masters/eolparam"); // go back
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Masters</p>
            <h1 className="text-2xl font-semibold mt-1">Edit EOL Parameter</h1>
          </div>
          <button type="button" onClick={() => navigate("/masters/eolparam")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-slate-800">
            Back to EOL Params
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Edit this EOL parameter.</p>
      </div>

      {error && <div className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-rose-800 dark:bg-rose-950/40 dark:text-rose-100">{error}</div>}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="mt-6 rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Description */}
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="description" className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">Description*</label>
            <input type="text" id="description" name="description" value={form.description} onChange={handleInputChange} placeholder="Enter description" required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          </div>

          {/* Detail Process */}
          <div className="col-span-2 sm:col-span-1">
            <label htmlFor="detailProcess" className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">Detail Process*</label>
            <input type="text" id="detailProcess" name="detailProcess" value={form.detailProcess} onChange={handleInputChange} placeholder="Enter detail process" required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100" />
          </div>

          {/* Active Checkbox */}
          <div className="col-span-1 self-end">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
              <input type="checkbox" id="active" name="active" checked={form.active} onChange={handleInputChange} className="h-5 w-5 rounded border-slate-300 text-[#1c75bc] flex-shrink-0" />
              <span className="text-slate-900 dark:text-slate-100 text-sm flex-1">Active</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <button type="button" onClick={() => navigate("/masters/eolparam")} 
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm">
            Cancel</button>
          <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{submitting ? "Saving..." : "Save Parameter"}</button>
        </div>
      </form>
    </div>
  );
}
