import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createWorkOrderStatus } from "../../services/workOrderStatusService";

export default function AddWorkOrderStatus() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    description: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!form.description.trim()) {
      alert("Please fill in the description!");
      return;
    }

    try {
      setSubmitting(true);
      await createWorkOrderStatus({
        description: form.description.trim(),
      });

      alert("Work order status added successfully!");
      navigate("/masters/workorderstatus");
    } catch (error) {
      console.error("Error adding work order status:", error);
      alert("Failed to add work order status!");
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
            <h1 className="mt-1 text-2xl font-semibold">Add Work Order Status</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/masters/workorderstatus")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Back to Statuses
          </button>
        </div>
      </div>

      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <label className="mb-1 block text-sm font-semibold">Description*</label>
            <input 
              type="text" 
              name="description" 
              value={form.description} 
              onChange={handleInputChange} 
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-[#1c75bc] focus:ring-1 focus:ring-[#1c75bc] outline-none" 
              placeholder="e.g., In Progress, Completed" 
            />
          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => navigate("/masters/workorderstatus")} 
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button 
            type="button" 
            disabled={submitting} 
            onClick={handleSave} 
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16629b]"
          >
             {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Status
          </button>
        </div>
      </form>
    </div>
  );
}