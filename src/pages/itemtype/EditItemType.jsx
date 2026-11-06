import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { updateItemType, getAllItemTypes } from "../../services/itemTypeService";

export default function EditItemType() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ description: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const typesData = await getAllItemTypes();
        const itemType = typesData.find((t) => t.id === parseInt(id));
        if (itemType) {
          setForm({ description: itemType.description });
        } else {
          alert("Item type not found!");
          navigate("/masters/itemtype");
        }
      } catch (error) {
        console.error("Error fetching item type details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!form.description.trim()) {
      alert("Please fill in the description!");
      return;
    }

    try {
      setSubmitting(true);
      await updateItemType(id, { description: form.description.trim() });
      alert("Item type updated successfully!");
      navigate("/masters/itemtype");
    } catch (error) {
      console.error("Error updating item type:", error);
      alert("Failed to update item type!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-sm font-semibold text-slate-500">Loading...</div>;

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Masters</p>
            <h1 className="mt-1 text-2xl font-semibold">Edit Item Type</h1>
          </div>
          <button 
            type="button" 
            onClick={() => navigate("/masters/itemtype")} 
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Back to Item Types
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
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-[#1c75bc] focus:ring-1 focus:ring-[#1c75bc] outline-none bg-white" 
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => navigate("/masters/itemtype")} 
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button 
            type="button" 
            disabled={submitting} 
            onClick={handleUpdate} 
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16629b]"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update Item Type
          </button>
        </div>
      </form>
    </div>
  );
}