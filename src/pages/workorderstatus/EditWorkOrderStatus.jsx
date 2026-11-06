import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { updateWorkOrderStatus, getAllWorkOrderStatuses } from "../../services/workOrderStatusService";

export default function EditWorkOrderStatus() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState({
    description: "",
  });

  // Fetch the specific status data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all statuses
        const statusesData = await getAllWorkOrderStatuses();
        
        // Find the specific status we are editing
        const status = statusesData.find((s) => s.id === parseInt(id));
        if (status) {
          setForm({
            description: status.description,
          });
        } else {
          alert("Work order status not found!");
          // FIX 1: Removed hyphens to match App.jsx
          navigate("/masters/workorderstatus");
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
    if (!form.description.trim()) {
      alert("Please fill in the description!");
      return;
    }

    try {
      setSubmitting(true);
      await updateWorkOrderStatus(id, {
        description: form.description.trim(),
      });

      alert("Work order status updated successfully!");
      // FIX 2: Navigate back to the master list table, not the edit page!
      navigate("/masters/workorderstatus");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status!");
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
            <h1 className="mt-1 text-2xl font-semibold">Edit Work Order Status</h1>
          </div>
          <button 
            type="button" 
            onClick={() => navigate("/masters/workorderstatus")} 
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
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
            // FIX 3: Removed hyphens for the Cancel button routing
            onClick={() => navigate("/masters/workorderstatus")} 
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
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update Status
          </button>
        </div>
      </form>
    </div>
  );
}