import { useState } from "react";
import { ClipboardList, Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addEolParam } from "../../services/eolparamService";

const initialFormState = {
  description: "",
  detailProcess: "",
  isActive: true,
};

export default function AddEolparam() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const target = e.target as HTMLInputElement; // ✅ cast target
  const { name, value, type, checked } = target;

  setForm((prev) => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
};


  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    await addEolParam({
      description: form.description,
      detailProcess: form.detailProcess,
      active: form.isActive, // 🔥 mapping
    });

    // go back to list page
    navigate("/masters/eolparam");
  } catch (error) {
    console.error("Failed to save EOL Param", error);
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
            <h1 className="text-2xl font-semibold mt-1">Add EOL Parameter</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/masters/eolparam")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            Back to Eol Params
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Add a new EOL parameter to your dashboard.
        </p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Description */}
          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1"
            >
              Description*
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={form.description}
              onChange={handleInputChange}
              placeholder="Enter description"
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Detail Process */}
          <div className="col-span-2 sm:col-span-1">
            <label
              htmlFor="detailProcess"
              className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1"
            >
              Detail Process*
            </label>
            <input
              type="text"
              id="detailProcess"
              name="detailProcess"
              value={form.detailProcess}
              onChange={handleInputChange}
              placeholder="Enter detail process"
              required
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Active */}
         {/* Active */}
{/* Active */}
<div className="col-span-1 self-end">
  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
    <input
      type="checkbox"
      id="isActive"
      name="isActive"
      checked={form.isActive}
      onChange={handleInputChange}
      className="h-5 w-5 rounded border-slate-300 text-[#1c75bc] flex-shrink-0"
    />
    <span className="text-slate-900 dark:text-slate-100 text-sm flex-1">
      Active
    </span>
  </div>
</div>


        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <button
  type="button" // important!
  onClick={() => navigate('/masters/eolparam')}
  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
>
  Cancel
</button>


          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#16629b] focus:outline-none focus:ring-2 focus:ring-[#9ec4e3] disabled:cursor-not-allowed disabled:opacity-60 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {submitting ? "Saving..." : "Save Parameter"}
          </button>
        </div>
      </form>
    </div>
  );
}
