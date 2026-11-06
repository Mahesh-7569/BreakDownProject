import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getLines } from "../../services/lineService";
import { getVariants } from "../../services/variantService";
import { addOrEditLineMapping } from "../../services/lineMappingService";
import { getToken } from "../../services/authService";
import { useLocation } from "react-router-dom";
export default function AddLineMapping() {

  const navigate = useNavigate();
  const location = useLocation();
const mappingData = location.state;
const { lineId, previousLineId, variantId } = useParams();
  const [form, setForm] = useState({
    lineId: "",
    previousLineId: "",
    variantId: "",
    isActive: true,
  });

  const [lines, setLines] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [lineError, setLineError] = useState("");
  /* FETCH DROPDOWNS */
 useEffect(() => {

  if (!getToken()) {
    navigate("/login");
    return;
  }

  const fetchDropdowns = async () => {

    const linesRes = await getLines();
    const variantsRes = await getVariants();

    setLines(linesRes);
    setVariants(variantsRes);

    if (mappingData) {
      setForm({
        lineId: mappingData.lineId?.toString() || "",
        previousLineId: mappingData.previousLineId?.toString() || "",
        variantId: mappingData.variantId?.toString() || "",
        isActive: mappingData.isActive ?? true
      });
    }

  };

  fetchDropdowns();

}, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {

    const { name, value, type, checked } = e.target as HTMLInputElement;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    /* VALIDATION */
    if (name === "previousLineId") {

      if (value === form.lineId) {
        setLineError("Previous line cannot be the same as Line.");
      } else {
        setLineError("");
      }

    }

    if (name === "lineId") {

      if (value === form.previousLineId) {
        setLineError("Line cannot be the same as Previous line.");
      } else {
        setLineError("");
      }

    }

  };

  /* SAVE LOGIC */

  const handleSave = async () => {

    if (!form.lineId || !form.previousLineId || !form.variantId) {
      alert("Please fill all required fields");
      return;
    }

    if (lineError) {
      alert(lineError);
      return;
    }

    try {

      setSubmitting(true);

      await addOrEditLineMapping({
        id: 0,
        lineId: Number(form.lineId),
        previousLineId: Number(form.previousLineId),
        variantId: Number(form.variantId),
        isActive: form.isActive
      });

      navigate("/masters/linemapping");

    } catch (error) {

      console.error("Error saving mapping", error);

    } finally {

      setSubmitting(false);

    }

  };

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">

      {/* HEADER */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Masters
            </p>

            <h1 className="mt-1 text-2xl font-semibold">
              Add Line Mapping
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/masters/linemapping")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Line Mapping
          </button>

        </div>

        <p className="mt-2 text-sm text-slate-600">
          Configure mapping between line, previous line, and variant.
        </p>

      </div>

      {/* FORM */}
      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80">

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* LINE */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Line*
            </label>

            <select
              name="lineId"
value={form.lineId}
onChange={handleInputChange}   
disabled      
 className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option value="">Select Line</option>

              {lines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.lineName}
                </option>
              ))}

            </select>

          </div>

          {/* PREVIOUS LINE */}
          <div>

            <label className="mb-1 block text-sm font-semibold">
              Previous Line*
            </label>

            <select
              name="previousLineId"
              value={form.previousLineId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            >

              <option value="">Select Previous Line</option>

              {lines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.lineName}
                </option>
              ))}

            </select>

            {lineError && (
              <p className="mt-1 text-sm text-red-600">{lineError}</p>
            )}

          </div>

          {/* VARIANT */}
          <div>

            <label className="mb-1 block text-sm font-semibold">
              Variant*
            </label>

            <select
              name="variantId"
              value={form.variantId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            >

              <option value="">Select Variant</option>

              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.description}
                </option>
              ))}

            </select>

          </div>

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

 

        

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-3">

          <button
            type="button"
            onClick={() => navigate("/masters/linemapping")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white"
          >

            {submitting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Save className="h-4 w-4" />
            }

            Save Mapping

          </button>

        </div>

      </form>

    </div>
  );
}