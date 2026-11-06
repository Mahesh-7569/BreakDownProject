import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Save, Loader2 } from "lucide-react";
import PageHero from "../../components/PageHero";
import { getLines, getShifts, getVariants, addWorkplan } from "../../services/workplanService";
import { getToken } from "../../services/authService";

export default function AddWorkplan() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    planDate: new Date().toISOString().split("T")[0],
    line: "",
    shift: "",
    variant: "", 
    starttime: "",

    status: "1",
    workOrderNo: "",
    quantity: "",
    insertedBy: 1,
    
  });

  const [lines, setLines] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);


  
  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }

    const fetchDropdowns = async () => {
      const linesRes = await getLines();
      const shiftsRes = await getShifts();
      const variantsRes = await getVariants();
      setLines(linesRes.data.data);
      setShifts(shiftsRes.data.data); // ✅ shiftname is now used
      setVariants(variantsRes.data.data);
    };

    fetchDropdowns();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  const lineId = Number(form.line);
  const shiftId = Number(form.shift);
  const variantId = Number(form.variant);

  if (!lineId || !shiftId || !variantId) {
    alert("Please select Line, Shift, and Variant");
    setSubmitting(false);
    return;
  }

  try {
    await addWorkplan({
      planDate: form.planDate,
      lineId,
      shiftId,
      variantId,
      startTime: form.starttime,
      status: 1,
      workOrderNo: form.workOrderNo,
      quantity: Number(form.quantity),
      insertedBy: 1,
      
    });

// In AddWorkplan.tsx
navigate("/management/workplan", { state: { refresh: true } });
  } catch (err) {
    console.error("Failed to add workplan:", err);
    alert("Failed to add workplan. Check console for details.");
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
              Management
            </p>
            <h1 className="text-2xl font-semibold mt-1">Add Workplan</h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/management/workplan")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            Back to Workplans
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Create a new production workplan.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800"
      >
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">


          {/* Start Time */}
<div>
  <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
    Start Time*
  </label>

  <div className="relative">
    <input
      type="time"
      name="starttime"
      step={1}
      value={form.starttime}
      onChange={handleInputChange}
      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm
      focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200
      dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      required
    />
  </div>
</div>


          {/* Plan Date */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Plan Date*
            </label>
            <input
              type="date"
              name="planDate"
              value={form.planDate}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200
              appearance-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>


            {/* Work Order No */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Work Order No*
            </label>
            <input
              type="text"
              name="workOrderNo"
              value={form.workOrderNo}
              onChange={handleInputChange}
              placeholder="Enter work order number"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200
              dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Line */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Line*
            </label>
            <select
              name="line"
              value={form.line}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200
               bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Select Line</option>
             {lines.map(l => (
    <option key={l.id} value={l.id}>{l.description}</option>
  ))}
            </select>
          </div>

          {/* Shift */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Shift*
            </label>
            <select
              name="shift"
              value={form.shift}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200
               bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Select Shift</option>
              {shifts.map(s => (
    <option key={s.id} value={s.id}>{s.shiftname}</option>
  ))}


            </select>
          </div>

          {/* Variant */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Variant*
            </label>
            <select
              name="variant"
              value={form.variant}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm
              focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200
               bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Select Variant</option>
                {variants.map(v => (
    <option key={v.id} value={v.id}>{v.variantcode}</option>
  ))}
            </select>
          </div>


          {/* Quantity */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Quantity*
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleInputChange}
              placeholder="Enter quantity"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200
              dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>


          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Status
            </label>
            <input
              type="text"
              value="NEW"
              disabled
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500
              cursor-not-allowed dark:border-slate-700 dark:bg-slate-800"
            />
          </div>

        

          

          {/* Inserted By */}
          {/* <div>
            <label className="block text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
              Inserted By
            </label>
            <input
              type="text"
              value="1"
              disabled
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500
              dark:border-slate-700 dark:bg-slate-800"
            />
          </div> */}

         
         

        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/management/workplan")}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2
            text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50
            focus:outline-none focus:ring-2 focus:ring-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5
            text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#16629b]
            focus:outline-none focus:ring-2 focus:ring-[#9ec4e3] disabled:cursor-not-allowed disabled:opacity-60
            dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Workplan
          </button>
        </div>
      </form>
    </div>
  );
}
