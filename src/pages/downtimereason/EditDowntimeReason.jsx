import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { updateDowntimeReason, getAllDowntimeReasons } from "../../services/downtimeReasonService";
import { getAllCategories } from "../../services/categoryService"; // Needed for dropdown

export default function EditDowntimeReason() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  const [form, setForm] = useState({
    downtimeCategoryId: "",
    reasonName: "",
    isActive: true,
  });

  // Fetch reason data and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch categories and reasons in parallel
        const [categoriesData, reasonsData] = await Promise.all([
          getAllCategories(),
          getAllDowntimeReasons()
        ]);
        
        setCategories(categoriesData);

        // Find the specific reason we are editing
        const reason = reasonsData.find((r) => r.id === parseInt(id));
        if (reason) {
          setForm({
            downtimeCategoryId: reason.downtimeCategoryId.toString(), // Select needs string value
            reasonName: reason.reasonName,
            isActive: reason.isActive,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleUpdate = async () => {
    if (!form.downtimeCategoryId || !form.reasonName) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      setSubmitting(true);
      await updateDowntimeReason(id, {
        downtimeCategoryId: parseInt(form.downtimeCategoryId),
        reasonName: form.reasonName.trim(),
        isActive: form.isActive,
      });

      alert("Downtime reason updated successfully!");
      navigate("/masters/downtimereason");
    } catch (error) {
      console.error("Error updating reason:", error);
      alert("Failed to update reason!");
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
            <h1 className="mt-1 text-2xl font-semibold">Edit Downtime Reason</h1>
          </div>
          <button type="button" onClick={() => navigate("/masters/downtimereason")} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
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
                className="h-5 w-5 rounded text-[#1c75bc]" 
              />
              <span className="text-sm font-semibold">Active</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/masters/downtime-reasons")} className="rounded-xl border px-4 py-2 text-sm font-semibold">Cancel</button>
          <button type="button" disabled={submitting} onClick={handleUpdate} className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#16629b]">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update Reason
          </button>
        </div>
      </form>
    </div>
  );
}