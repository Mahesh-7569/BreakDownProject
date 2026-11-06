import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addCamera } from "../../services/cameraService";
import { getAllStations } from "../../services/subStationService";
export default function AddCamera() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    stationId: "",
    cameraIP: "",
    cameraDetails: "",
    isActive: true,
  });

  const [stations, setStations] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Load dropdown data )
 useEffect(() => {
  fetchStations();
}, []);

const fetchStations = async () => {
  try {
    const data = await getAllStations();

    setStations(data || []);
  } catch (error) {
    console.error("Error fetching stations:", error);
    setStations([]);
  }
};

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
[name]:
  type === "checkbox"
    ? checked
    : name === "stationId"
    ? Number(value)
    : value,    }));
  };

  // UPDATED SAVE FUNCTION
  const handleSave = async () => {
    if (!form.stationId || !form.cameraIP || !form.cameraDetails) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      setSubmitting(true);

      await addCamera({
        stationId: Number(form.stationId),
        cameraIP: form.cameraIP,
        cameraDetails: form.cameraDetails,
        isActive: form.isActive,
      });

      alert("Camera added successfully!");

      navigate("/masters/Camera");
    } catch (error) {
      console.error("Error adding camera:", error);
      alert("Failed to add camera!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Masters
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Add Camera</h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/masters/Camera")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            Back to Cameras
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Configure a new camera endpoint and link it to a station.
        </p>
      </div>

      {/* FORM */}
      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* STATION ID */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Station ID*</label>
            <select
  name="stationId"
  value={form.stationId}
  onChange={handleInputChange}
  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
>
  <option value="">Select Station</option>

  {stations.map((s) => (
    <option key={s.id} value={s.id}>
      {s.stationName}
    </option>
  ))}
</select>
          </div>

          {/* CAMERA IP */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Camera IP*
            </label>
            <input
              type="text"
              name="cameraIP"
              value={form.cameraIP}
              onChange={handleInputChange}
              placeholder="e.g., 192.168.1.100"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 font-mono"
            />
          </div>

          {/* CAMERA DETAILS */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-1 block text-sm font-semibold">
              Camera Details*
            </label>
            <input
              type="text"
              name="cameraDetails"
              value={form.cameraDetails}
              onChange={handleInputChange}
              placeholder="e.g., Main Conveyor View"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* ACTIVE */}
           <div className="self-end">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleInputChange}
                className="h-5 w-5 rounded border-slate-300 text-[#1c75bc]"
              />
              <span className="text-sm">Active</span>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/masters/Camera")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16629b] disabled:opacity-60 dark:bg-amber-400 dark:text-slate-950"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Camera
          </button>
        </div>
      </form>
    </div>
  );
}