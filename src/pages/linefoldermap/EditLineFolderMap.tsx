import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getToken } from "../../services/authService";
import { getPlcData } from "../../services/subStationService";
import { getLineFolderMapByLineId, addOrEditLineFolderMap } from "../../services/lineFolderMapService";
import { getLines } from "../../services/lineService";

type Line = {
  id: number;
  lineName?: string;
  description?: string;
};

export default function EditLineFolderMap() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState({
    lineId: "",
    partDataFolder: "",
    isActive: true,
  });
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
  if (!getToken()) {
    navigate("/login");
    return;
  }

  const fetchData = async () => {
    try {

      // 1️⃣ Fetch lines for dropdown (same as Add page)
      const lineRes = await getLines();
      setLines(lineRes);

      // 2️⃣ Fetch existing record
      if (id) {
        const lineFolder = await getLineFolderMapByLineId(parseInt(id));

        if (lineFolder) {
          setForm({
            lineId: lineFolder.lineId.toString(),
            partDataFolder: lineFolder.partDataFolder,
            isActive: lineFolder.isActive,
          });
        }
      }

    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [id, navigate]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!form.lineId || !form.partDataFolder) {
      alert("Please fill all required fields!");
      return;
    }

    setSubmitting(true);
    try {
      await addOrEditLineFolderMap({
        id: id ? parseInt(id) : 0,
        lineId: parseInt(form.lineId),
        partDataFolder: form.partDataFolder,
        isActive: form.isActive,
      });
      alert("Line Folder Map updated successfully!");
      navigate("/masters/linefoldermap");
    } catch (err) {
      console.error("Error saving LineFolderMap:", err);
      alert("Failed to save.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Masters
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Edit Line Folder Map</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/masters/linefoldermap")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            Back to Line Folder Map
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Edit mapping between production line and data folder.
        </p>
      </div>

      {/* FORM */}
      <div className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* LINE */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Line*</label>
           <select
  name="lineId"
  value={form.lineId}
  onChange={handleInputChange}
  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm
  focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200
  bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
>
  <option value="">Select Line</option>

  {lines.map((l: Line) => (
    <option key={l.id} value={l.id}>
      {l.description || l.lineName}
    </option>
  ))}

</select>
          </div>

          {/* FOLDER */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Folder*</label>
            <input
              type="text"
              name="partDataFolder"
              value={form.partDataFolder}
              onChange={handleInputChange}
              placeholder="Enter folder path"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* ACTIVE */}
          <div className="self-end">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleInputChange}
                className="h-5 w-5 rounded border-slate-300 text-[#1c75bc]"
              />
              <span className="text-sm">Active</span>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/masters/linefoldermap")}
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
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
