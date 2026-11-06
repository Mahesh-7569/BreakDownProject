import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createCategory } from "../../services/categoryService";

export default function AddCategory() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: "",
    description: "",
    color: "#1c75bc", // Default color
    isActive: true,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!form.code || !form.description) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      setSubmitting(true);
      await createCategory({
        code: form.code.trim(),
        description: form.description.trim(),
        color: form.color,
        isActive: form.isActive,
      });

      alert("Category added successfully!");
      navigate("/masters/categories");
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category!");
    } finally {
      setSubmitting(false);
    }
  };

 return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">
      {/* HEADER WITH BACK BUTTON */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Masters</p>
            <h1 className="mt-1 text-2xl font-semibold">Add Category</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/masters/categories")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Back to Categories
          </button>
        </div>
      </div>

      {/* FORM */}
      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80">
        {/* Adjusted Grid to fit items better */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Code*</label>
            <input type="text" name="code" value={form.code} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm" placeholder="e.g., BRK" />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Description*</label>
            <input type="text" name="description" value={form.description} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm" placeholder="e.g., Breakdown" />
          </div>

          {/* COLOR PICKER ALIGNED */}
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Color</label>
            <div className="flex h-[48px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm">
              <div 
                className="h-8 w-8 rounded-xl border border-slate-200 cursor-pointer shadow-sm relative overflow-hidden"
                style={{ backgroundColor: form.color }}
                onClick={() => document.getElementById('colorInput').click()}
              >
                <input id="colorInput" type="color" name="color" value={form.color} onChange={handleInputChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
              </div>
              <span className="text-sm font-mono text-slate-500">{form.color}</span>
            </div>
          </div>

         {/* ACTIVE CHECKBOX */}
<div className="col-span-1">
  <label className="mb-1 block text-sm font-semibold">Status</label>
  <div className="flex h-[48px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <input 
      type="checkbox" 
      name="isActive" 
      checked={form.isActive} 
      onChange={handleInputChange} 
      className="h-5 w-5 rounded border-slate-300 text-[#1c75bc] focus:ring-[#1c75bc]" 
    />
    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Active</span>
  </div>
</div>
</div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/masters/categories")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50">Cancel</button>
          <button type="button" disabled={submitting} onClick={handleSave} className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16629b]">
             {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Category
          </button>
        </div>
      </form>
    </div>
  );
}