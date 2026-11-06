import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createDowntimeReason } from "../../services/downtimeReasonService";
import { getAllCategories } from "../../services/categoryService"; // Needed for dropdown

export default function AddDowntimeReason() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    downtimeCategoryId: "",
    reasonName: "",
    isActive: true,
  });

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!form.downtimeCategoryId || !form.reasonName) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      setSubmitting(true);
      await createDowntimeReason({
        downtimeCategoryId: parseInt(form.downtimeCategoryId), // Convert to number
        reasonName: form.reasonName.trim(),
        isActive: form.isActive,
      });

      alert("Downtime reason added successfully!");
      navigate("/masters/downtimereason");
    } catch (error) {
      console.error("Error adding downtime reason:", error);
      alert("Failed to add downtime reason!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Masters</p>
            <h1 className="mt-1 text-2xl font-semibold">Add Downtime Reason</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/masters/downtimereason")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Back to Reasons
          </button>
        </div>
      </div>

      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Category*</label>
            <select 
              name="downtimeCategoryId" 
              value={form.downtimeCategoryId} 
              onChange={handleInputChange} 
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-[#1c75bc] focus:ring-1 focus:ring-[#1c75bc] outline-none"
            >
              <option value="" disabled>Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.description} ({cat.code})
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Reason Name*</label>
            <input 
              type="text" 
              name="reasonName" 
              value={form.reasonName} 
              onChange={handleInputChange} 
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-[#1c75bc] focus:ring-1 focus:ring-[#1c75bc] outline-none" 
              placeholder="e.g., Mechanical Failure" 
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Status</label>
            <div className="flex h-[48px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
              <input 
                type="checkbox" 
                name="isActive" 
                checked={form.isActive} 
                onChange={handleInputChange} 
                className="h-5 w-5 rounded border-slate-300 text-[#1c75bc] focus:ring-[#1c75bc]" 
              />
              <span className="text-sm font-semibold text-slate-700">Active</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/masters/downtime-reasons")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50">Cancel</button>
          <button type="button" disabled={submitting} onClick={handleSave} className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16629b]">
             {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Reason
          </button>
        </div>
      </form>
    </div>
  );
}