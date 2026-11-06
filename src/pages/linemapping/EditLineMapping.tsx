import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getLines } from "../../services/lineService";
import { getVariants } from "../../services/variantService";
import { getLineMappingById } from "../../services/lineMappingService";
import { addOrEditLineMapping } from "../../services/lineMappingService";
export default function EditLineMapping() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get ID from route
  const [form, setForm] = useState({
    lineId: "",
    previousLineId: "",
    variantId: "",
    isActive: true,
  });

  const [lines, setLines] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

 useEffect(() => {

  const fetchData = async () => {
    try {

      setLoading(true);

      const linesRes = await getLines();
      const variantsRes = await getVariants();
      const mappingRes = await getLineMappingById(Number(id));

      setLines(linesRes);
      setVariants(variantsRes);

      if (mappingRes) {
        setForm({
          lineId: mappingRes.lineId.toString(),
          previousLineId: mappingRes.previousLineId.toString(),
          variantId: mappingRes.variantId.toString(),
          isActive: mappingRes.isActive
        });
      }

    } catch (error) {
      console.error("Error fetching mapping:", error);
    } finally {
      setLoading(false);   // ⭐ THIS WAS MISSING
    }
  };

  fetchData();

}, [id]);

  

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
const handleSubmit = async () => {
  try {
    setSubmitting(true);

    const payload = {
      id: Number(id),
      lineId: Number(form.lineId),
      previousLineId: Number(form.previousLineId),
      variantId: Number(form.variantId),
      isActive: form.isActive
    };

    await addOrEditLineMapping(payload);

    navigate("/masters/linemapping");

  } catch (error) {
    console.error("Error saving line mapping:", error);
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
            <h1 className="mt-1 text-2xl font-semibold">Edit Line Mapping</h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/masters/linemapping")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            Back to Line Mapping
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Edit mapping between line, previous line, and variant.
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
              disabled
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Select Line</option>
              {lines.map((l) => (
                <option key={l.id} value={l.id}>{l.lineName}</option>
              ))}
            </select>
          </div>

          {/* PREVIOUS LINE */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Previous Line*</label>
            <select
              name="previousLineId"
              value={form.previousLineId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Select Previous Line</option>
              {lines.map((l) => (
                <option key={l.id} value={l.id}>{l.lineName}</option>
              ))}
            </select>
          </div>

          {/* VARIANT */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Variant*</label>
            <select
              name="variantId"
              value={form.variantId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Select Variant</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>{v.description}</option>
              ))}
            </select>
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
            onClick={() => navigate("/masters/linemapping")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16629b] disabled:opacity-60 dark:bg-amber-400 dark:text-slate-950"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
