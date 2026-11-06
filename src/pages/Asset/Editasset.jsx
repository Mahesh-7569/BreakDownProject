import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { updateAsset, getAllAssets } from "../../services/assetService";
import { getAllAssetTypes } from "../../services/assetTypeService";

export default function EditAsset() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [assetTypes, setAssetTypes] = useState([]);
  const [allAssets, setAllAssets] = useState([]);
  
  const [form, setForm] = useState({
    assetName: "",
    assetType: "",
    parentId: 0,
    isActive: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [assetsData, typesData] = await Promise.all([
          getAllAssets(),
          getAllAssetTypes()
        ]);
        
        setAssetTypes(typesData);
        setAllAssets(assetsData);

        const asset = assetsData.find((a) => a.id === parseInt(id));
        if (asset) {
          setForm({
            assetName: asset.assetName,
            assetType: asset.assetType,
            parentId: asset.parentId || 0,
            isActive: asset.isActive
          });
        } else {
          alert("Asset not found!");
          navigate("/masters/asset");
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
    if (!form.assetName.trim() || !form.assetType) {
      alert("Please fill in all required fields!");
      return;
    }

    try {
      setSubmitting(true);
      await updateAsset(id, {
        assetName: form.assetName.trim(),
        assetType: Number(form.assetType),
        parentId: Number(form.parentId) || 0,
        isActive: form.isActive
      });

      alert("Asset updated successfully!");
      navigate("/masters/asset");
    } catch (error) {
      console.error("Error updating asset:", error);
      alert("Failed to update asset!");
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
            <h1 className="mt-1 text-2xl font-semibold">Edit Asset</h1>
          </div>
          <button 
            type="button" 
            onClick={() => navigate("/masters/asset")} 
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Back to Assets
          </button>
        </div>
      </div>

      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Asset Name*</label>
            <input 
              type="text" 
              name="assetName" 
              value={form.assetName} 
              onChange={handleInputChange} 
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-[#1c75bc] focus:ring-1 focus:ring-[#1c75bc] outline-none bg-white" 
            />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Asset Type*</label>
            <select
              name="assetType"
              value={form.assetType}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-[#1c75bc] focus:ring-1 focus:ring-[#1c75bc] outline-none bg-white"
            >
              <option value="">Select Asset Type</option>
              {assetTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.description}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Label changed to Parent Name, Dropdown shows assetName */}
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Parent Name</label>
            <select
              name="parentId"
              value={form.parentId}
              onChange={handleInputChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:border-[#1c75bc] focus:ring-1 focus:ring-[#1c75bc] outline-none bg-white"
            >
              <option value={0}>No Parent</option>
              {allAssets
                .filter((asset) => asset.id !== parseInt(id))
                .map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.assetName}
                  </option>
                ))}
            </select>
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
            onClick={() => navigate("/masters/asset")} 
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
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update Asset
          </button>
        </div>
      </form>
    </div>
  );
}