import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addOrEditLineFolderMap } from "../../services/lineFolderMapService";
import { getPlcData } from "../../services/subStationService";
import { getLines } from "../../services/lineService";

export default function AddLineFolderMap() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    lineId: "",
    partDataFolder: "",
    isActive: true,
  });

  const [lines, setLines] = useState<any[]>([]); // optional: fetch lines from API
  const [submitting, setSubmitting] = useState(false);
  const [plcs, setPlcs] = useState<any[]>([]);

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const lineRes = await getLines();
        setLines(lineRes);

        const plcRes = await getPlcData();
        setPlcs(plcRes);
      } catch (error) {
        console.error("Error loading dropdowns", error);
      }
    };

    fetchData();
  }, []);


  // Input change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Save handler (calls API)
  const handleSave = async () => {
    setSubmitting(true);
    try {
      // Prepare payload
      const payload = {
        lineId: form.lineId,
        partDataFolder: form.partDataFolder,
        isActive: form.isActive,
      };

      // Call API
      const response = await addOrEditLineFolderMap(payload);
      console.log("API response:", response);

      // Redirect after successful save
      navigate("/masters/linefoldermap");
    } catch (err) {
      console.error("Failed to save:", err);
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
              Add Line Report Folder Map
            </h1>
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
          Configure mapping between production lines and folders.
        </p>
      </div>

      {/* FORM */}
      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* LINE DROPDOWN */}
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
              {lines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.description || l.lineName}
                </option>
              ))}
            
            </select>
          </div>

          {/* FOLDER */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Report Folder Path
            </label>
            <input
              type="text"
              name="partDataFolder"
              value={form.partDataFolder}
              onChange={handleInputChange}
              placeholder="Enter folder path"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200
              dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save FolderMap
          </button>
        </div>
      </form>
    </div>
  );
}