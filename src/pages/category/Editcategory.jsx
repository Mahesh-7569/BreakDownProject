import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { updateCategory, getAllCategories } from "../../services/categoryService";

export default function EditCategory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: "",
    description: "",
    color: "#1c75bc",
    isActive: true,
  });

  // Fetch current data to pre-fill the form
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const data = await getAllCategories();
        const category = data.find((c) => c.id === parseInt(id));
        if (category) {
          setForm({
            code: category.code,
            description: category.description,
            color: category.color,
            isActive: category.isActive,
          });
        }
      } catch (error) {
        console.error("Error fetching category:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async () => {
    if (!form.code || !form.description) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      setSubmitting(true);
      await updateCategory(id, {
        code: form.code.trim(),
        description: form.description.trim(),
        color: form.color,
        isActive: form.isActive,
      });

      alert("Category updated successfully!");
      navigate("/masters/categories");
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Failed to update category!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Masters</p>
            <h1 className="mt-1 text-2xl font-semibold">Edit Category</h1>
          </div>
          <button type="button" onClick={() => navigate("/masters/categories")} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Back to Categories
          </button>
        </div>
      </div>

      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Code*</label>
            <input type="text" name="code" value={form.code} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm" />
          </div>
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Description*</label>
            <input type="text" name="description" value={form.description} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm" />
          </div>
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Color</label>
            <div className="flex h-[48px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm">
              <div className="h-8 w-8 rounded-xl border cursor-pointer relative overflow-hidden" style={{ backgroundColor: form.color }} onClick={() => document.getElementById('colorInput').click()}>
                <input id="colorInput" type="color" name="color" value={form.color} onChange={handleInputChange} className="absolute inset-0 opacity-0 w-full h-full" />
              </div>
              <span className="text-sm font-mono text-slate-500">{form.color}</span>
            </div>
          </div>
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Status</label>
            <div className="flex h-[48px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
              <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleInputChange} className="h-5 w-5 rounded text-[#1c75bc]" />
              <span className="text-sm font-semibold">Active</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/masters/categories")} className="rounded-xl border px-4 py-2 text-sm font-semibold">Cancel</button>
          <button type="button" disabled={submitting} onClick={handleUpdate} className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update Category
          </button>
        </div>
      </form>
    </div>
  );
}