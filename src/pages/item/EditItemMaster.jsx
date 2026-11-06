import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { updateItemMaster, getAllItemMasters } from "../../services/itemMasterService";
import { getAllItemTypes } from "../../services/itemTypeService";

export default function EditItemMaster() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [itemTypes, setItemTypes] = useState([]);
  
  const [form, setForm] = useState({
    description: "",
    partCode: "",
    itemType: "",
    measuringUnit: 0,
    isActive: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [itemsData, typesData] = await Promise.all([
          getAllItemMasters(),
          getAllItemTypes()
        ]);
        
        setItemTypes(typesData);

        const item = itemsData.find((i) => i.id === parseInt(id));
        if (item) {
          setForm({
            description: item.description,
            partCode: item.partCode,
            itemType: item.itemType,
            measuringUnit: item.measuringUnit,
            isActive: item.isActive
          });
        } else {
          alert("Item not found!");
          navigate("/masters/item");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleUpdate = async () => {
    if (!form.description.trim() || !form.partCode.trim() || !form.itemType) {
      alert("Please fill in Description, Part Code, and Item Type!");
      return;
    }

    try {
      setSubmitting(true);
      await updateItemMaster(id, {
        description: form.description.trim(),
        partCode: form.partCode.trim(),
        itemType: Number(form.itemType),
        measuringUnit: Number(form.measuringUnit) || 0,
        isActive: form.isActive
      });

      alert("Item updated successfully!");
      navigate("/masters/item");
    } catch (error) {
      console.error("Error updating item:", error);
      alert("Failed to update item!");
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
            <h1 className="mt-1 text-2xl font-semibold">Edit Item</h1>
          </div>
          <button 
            type="button" 
            onClick={() => navigate("/masters/item")} 
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Back to Items
          </button>
        </div>
      </div>

      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Description*</label>
            <input 
              type="text" 
              name="description" 
              value={form.description} 
              onChange={handleInputChange} 
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-[#1c75bc] focus:ring-1 focus:ring-[#1c75bc] outline-none bg-white" 
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Part Code*</label>
            <input 
              type="text" 
              name="partCode" 
              value={form.partCode} 
              onChange={handleInputChange} 
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-[#1c75bc] focus:ring-1 focus:ring-[#1c75bc] outline-none bg-white" 
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Item Type*</label>
            <select
              name="itemType"
              value={form.itemType}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-[#1c75bc] focus:ring-1 focus:ring-[#1c75bc] outline-none bg-white"
            >
              <option value="">Select Item Type</option>
              {itemTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.description}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Measuring Unit</label>
            <input 
              type="number" 
              name="measuringUnit" 
              value={form.measuringUnit} 
              onChange={handleInputChange} 
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-[#1c75bc] focus:ring-1 focus:ring-[#1c75bc] outline-none bg-white" 
            />
          </div>

          <div className="col-span-1 flex flex-col justify-end">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900 transition hover:bg-slate-100 dark:hover:bg-slate-800">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleInputChange}
                className="h-5 w-5 cursor-pointer accent-[#1c75bc]"
              />
              <span className="text-sm font-semibold">Active</span>
            </label>
          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => navigate("/masters/item")} 
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
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update Item
          </button>
        </div>
      </form>
    </div>
  );
}