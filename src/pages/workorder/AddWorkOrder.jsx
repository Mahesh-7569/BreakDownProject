import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createWorkOrder } from "../../services/workOrderService";
import { getAllAssets } from "../../services/assetService";
import { getAllWorkOrderStatuses } from "../../services/workOrderStatusService";
import { getAllItemMasters } from "../../services/itemMasterService"; // ✅ Imported Item Service

export default function AddWorkOrder() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [assets, setAssets] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [items, setItems] = useState([]); // ✅ Added state for items
  
  const [form, setForm] = useState({
    workOrderNumber: "",
    itemId: "", // Set as empty initially to force selection
    assetId: "",
    quantity: "",
    orderPriority: 1,
    status: "", 
    completedQuantity: 0,
    logDateTime: new Date().toISOString().slice(0, 16),
    updateDateTime: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        // ✅ Added getAllItemMasters() to the Promise.all array
        const [assetsData, statusesData, itemsData] = await Promise.all([
          getAllAssets(),
          getAllWorkOrderStatuses(),
          getAllItemMasters()
        ]);
        setAssets(assetsData || []);
        setStatuses(statusesData || []);
        setItems(itemsData || []);
      } catch (err) {
        console.error("Failed to load dropdown data", err);
      }
    };
    fetchDropdowns();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!form.workOrderNumber.trim() || !form.itemId || !form.assetId || !form.status) {
      alert("Please fill in WO Number, Item, Asset, and Status!");
      return;
    }

    try {
      setSubmitting(true);
      await createWorkOrder({
        workOrderNumber: form.workOrderNumber.trim(),
        itemId: Number(form.itemId),
        assetId: Number(form.assetId),
        quantity: Number(form.quantity),
        orderPriority: Number(form.orderPriority),
        status: Number(form.status),
        completedQuantity: Number(form.completedQuantity),
        logDateTime: `${form.logDateTime}:00.000`, 
        updateDateTime: `${form.updateDateTime}:00.000`
      });

      alert("Work Order added successfully!");
      navigate("/masters/workorder");
    } catch (error) {
      console.error("Error adding work order:", error);
      alert("Failed to add work order!");
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
            <h1 className="mt-1 text-2xl font-semibold">Add Work Order</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/masters/workorder")}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Back to Work Orders
          </button>
        </div>
      </div>

      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">WO Number*</label>
            <input type="text" name="workOrderNumber" value={form.workOrderNumber} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none bg-white" placeholder="e.g., WO-1001" />
          </div>

          {/* ✅ Replaced Input with Select for Item ID */}
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Item*</label>
            <select name="itemId" value={form.itemId} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none bg-white">
              <option value="">Select Item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.description}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Asset*</label>
            <select name="assetId" value={form.assetId} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none bg-white">
              <option value="">Select Asset</option>
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.assetName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Quantity</label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none bg-white" />
          </div>
          
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Completed Quantity</label>
            <input type="number" name="completedQuantity" value={form.completedQuantity} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none bg-white" />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Status*</label>
            <select name="status" value={form.status} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none bg-white">
              <option value="">Select Status</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.description}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Order Priority</label>
            <input type="number" name="orderPriority" value={form.orderPriority} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none bg-white" />
          </div>

          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">Log Date Time</label>
            <input type="datetime-local" name="logDateTime" value={form.logDateTime} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none bg-white" />
          </div>

        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button type="button" onClick={() => navigate("/masters/workorder")} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50">Cancel</button>
          <button type="button" disabled={submitting} onClick={handleSave} className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16629b]">
             {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Work Order
          </button>
        </div>
      </form>
    </div>
  );
}