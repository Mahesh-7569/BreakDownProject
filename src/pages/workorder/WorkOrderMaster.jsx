import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import { ClipboardList, Pencil, CheckCircle2, CircleDashed, Trash2 } from "lucide-react";
import { getAllWorkOrders, deleteWorkOrder } from "../../services/workOrderService";
import { getAllAssets } from "../../services/assetService";
import { getAllWorkOrderStatuses } from "../../services/workOrderStatusService";
import { getAllItemMasters } from "../../services/itemMasterService"; // ✅ Imported Item Service
export default function WorkOrderMaster() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [assets, setAssets] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
const [items, setItems] = useState([]);
  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch work orders, assets, and statuses simultaneously
      const [woResult, assetsResult, statusResult,itemsResult] = await Promise.all([
        getAllWorkOrders(),
        getAllAssets(),
        getAllWorkOrderStatuses(),
        getAllItemMasters()
      ]);
      setData(woResult || []);
      setAssets(assetsResult || []);
      setStatuses(statusResult || []);
      setItems(itemsResult || []);
    } catch (err) {
      console.error("Failed to fetch work orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (row) => {
    navigate(`/masters/workorder/edit/${row.id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Work Order?")) {
      try {
        await deleteWorkOrder(id);
        fetchData(); 
      } catch (err) {
        console.error("Failed to delete work order:", err);
        alert(`Failed to delete. Error: ${err.response?.status || err.message}`);
      }
    }
  };

  const getAssetName = (assetId) => {
    const asset = assets?.find((a) => a.id === assetId);
    return asset ? asset.assetName : `Unknown ID (${assetId})`;
  };

  const getStatusName = (statusId) => {
    const status = statuses?.find((s) => s.id === statusId);
    return status ? status.description : `Status (${statusId})`;
  };

  const getItemName = (itemId) => {
    // Force both to strings using String() to prevent type mismatch errors (1 !== "1")
    const item = items?.find((i) => String(i.id) === String(itemId));
    return item ? item.description : `Unknown ID (${itemId})`;
  };

  function StatusBadge({ statusId }) {
    // Assuming status 1 is the generic "Active/Open" state.
    const isActive = statusId === 1; 
    const tone = isActive 
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-100 dark:ring-emerald-400/30" 
      : "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-400/15 dark:text-amber-100 dark:ring-amber-400/30";
    const Icon = isActive ? CheckCircle2 : CircleDashed;

    return (
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${tone}`}>
        <Icon className="h-4 w-4" />
        {getStatusName(statusId)}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Masters"
        title="Work Order Master"
        description="Manage and track manufacturing work orders."
        icon={ClipboardList}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Live tracking
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">Order Actions</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Create or browse work orders.</p>
        </div>

        <button
          onClick={() => navigate("/masters/workorder/add")}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
        >
          <ClipboardList className="h-4 w-4" /> Add New Work Order
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white/95 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950/70 dark:ring-slate-800/80">
        {loading ? (
          <p className="p-4 text-sm">Loading...</p>
        ) : data.length === 0 ? (
          <p className="p-4 text-sm">No work orders found.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3">WO Number</th>
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">Asset Name</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Completed Qty</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/90 dark:divide-slate-800 dark:bg-slate-900/70">
              {data.map((row) => (
                <tr key={row.id} className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/70">
                  <td className="px-4 py-3 font-semibold">{row.workOrderNumber}</td>
<td className="px-4 py-3 font-medium text-indigo-700">{getItemName(row.itemId)}</td>                  <td className="px-4 py-3 font-medium text-blue-700">{getAssetName(row.assetId)}</td>
                  <td className="px-4 py-3">{row.quantity}</td>
                  <td className="px-4 py-3">{row.completedQuantity}</td>
                  <td className="px-4 py-3">
                    <StatusBadge statusId={row.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEdit(row)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}