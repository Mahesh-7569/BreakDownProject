import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllStations } from "../../services/subStationService";
import { addAppStationConfig } from "../../services/stationConfigService";
import { getAppConfigs } from "../../services/appconfigService";

export default function AddStationConfig() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
  appId: "",
  stationId: "",   // ✅ ADD THIS
  isActive: true,
});
const [subStations, setSubStations] = useState([]);
  // ================= LOAD APPS =================
  useEffect(() => {
    const loadApps = async () => {
      try {
        const res = await getAppConfigs();
        setApps(res || []);
      } catch (error) {
        console.error(error);
      }
    };

    loadApps();
  }, []);

  useEffect(() => {
  const loadStations = async () => {
    try {
      const res = await getAllStations();
      setSubStations(res || []);
    } catch (error) {
      console.error("Error loading stations:", error);
      setSubStations([]);
    }
  };

  loadStations();
}, []);

  // ================= HANDLE INPUT =================
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ================= SAVE =================
const handleSave = async () => {
  if (!form.appId || !form.stationId) {
    alert("Please select App and Station");
    return;
  }

  try {
    setSubmitting(true);

    const payload = {
      appId: parseInt(form.appId),
      stationId: parseInt(form.stationId),
      isActive: Boolean(form.isActive),
    };

    console.log("PAYLOAD:", payload);

    await addAppStationConfig(payload);

    alert("Saved successfully!");
    navigate("/masters/Stationlist");
  } catch (error) {
  console.error("FULL ERROR:", error);

  console.error("RESPONSE DATA:", error?.response?.data);
  console.error("STATUS:", error?.response?.status);
  console.error("HEADERS:", error?.response?.headers);

  alert(error?.response?.data?.message || "Save failed");
}
};
  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">

      {/* HEADER (same as your camera UI) */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Masters
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              Add Station Config
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/masters/Stationlist")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
          >
            Back Add Station Config
          </button>

        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Configure station and map it to application.
        </p>

      </div>

      {/* FORM (same structure as camera page) */}
      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800">

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* APP DROPDOWN */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              App*
            </label>

            <select
              name="appId"
              value={form.appId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
            >
              <option value="">Select App</option>

              {apps.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.appName}
                </option>
              ))}
            </select>
          </div>

          {/* STATION NAME */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Station Name*
            </label>

           <select
  name="stationId"
  value={form.stationId}
  onChange={handleInputChange}
  className="mt-2 w-full rounded-2xl border px-4 py-3"
>
  <option value="">Select Station</option>
  {subStations.map((s) => (
    <option key={s.id} value={s.id}>
      {s.stationName}
    </option>
  ))}
</select>
          </div>

          {/* ACTIVE CHECKBOX */}
          <div className="self-end">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 shadow-sm">

              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleInputChange}
                className="h-5 w-5"
              />

              <span className="text-sm">Active</span>

            </div>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-3">

          <button
            type="button"
            onClick={() => navigate("/masters/Stationlist")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>

        </div>

      </form>

    </div>
  );
}