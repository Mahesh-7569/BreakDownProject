import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { updateWorkOrder, getAllWorkOrders } from "../../services/workOrderService";
import { getAllAssets } from "../../services/assetService";
import { getAllWorkOrderStatuses } from "../../services/workOrderStatusService";
import { getAllItemMasters } from "../../services/itemMasterService"; // ✅ Imported Item Service

export default function EditWorkOrder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [assets, setAssets] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [items, setItems] = useState([]); // ✅ Added state for items

  const [form, setForm] = useState({
    workOrderNumber: "",
    itemId: "",
    assetId: "",
    quantity: "",
    orderPriority: 1,
    status: "",
    completedQuantity: 0,
    logDateTime: "", 
    updateDateTime: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // ✅ Load Work Orders, Assets, Statuses, and Items in parallel
        const [woData, assetsData, statusData, itemsData] = await Promise.all([
          getAllWorkOrders(),
          getAllAssets(),
          getAllWorkOrderStatuses(),
          getAllItemMasters()
        ]);
        
        setAssets(assetsData || []);
        setStatuses(statusData || []);
        setItems(itemsData || []);

        const wo = woData?.find((a) => a.id === parseInt(id));
        if (wo) {
          setForm({
            workOrderNumber: wo.workOrderNumber,
            itemId: wo.itemId,
            assetId: wo.assetId,
            quantity: wo.quantity,
            orderPriority: wo.orderPriority,
            status: wo.status,
            completedQuantity: wo.completedQuantity,
            logDateTime: wo.logDateTime ? wo.logDateTime.slice(0, 16) : "",
            updateDateTime: wo.updateDateTime ? wo.updateDateTime.slice(0, 16) : ""
          });
        } else {
          alert("Work Order not found!");
          navigate("/masters/workorder");
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
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!form.workOrderNumber.trim() || !form.itemId || !form.assetId || !form.status) {
      alert("Please fill in WO Number, Item, Asset, and Status!");
      return;
    }

    try {
      setSubmitting(true);
      await updateWorkOrder(id, {
        workOrderNumber: form.workOrderNumber.trim(),
        itemId: Number(form.itemId),
        assetId: Number(form.assetId),
        quantity: Number(form.quantity),
        orderPriority: Number(form.orderPriority),
        status: Number(form.status),
        completedQuantity: Number(form.completedQuantity),
        logDateTime: form.logDateTime ? `${form.logDateTime}:00.000` : new Date().toISOString(), 
        updateDateTime: new Date().toISOString() 
      });

      alert("Work order updated successfully!");
      navigate("/masters/workorder");
    } catch (error) {
      console.error("Error updating work order:", error);
      alert("Failed to update work order!");
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
            <h1 className="mt-1 text-2xl font-semibold">Edit Work Order</h1>
          </div>
          <button type="button" onClick={() => navigate("/masters/workorder")} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800">
            Back to Work Orders
          </button>
        </div>
      </div>

      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">WO Number*</label>
            <input type="text" name="workOrderNumber" value={form.workOrderNumber} onChange={handleInputChange} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none bg-white" />
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
          <button type="button" disabled={submitting} onClick={handleUpdate} className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16629b]">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update Work Order
          </button>
        </div>
      </form>
    </div>
  );
}
