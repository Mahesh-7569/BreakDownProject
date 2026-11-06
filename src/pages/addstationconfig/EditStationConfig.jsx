import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAppStationConfigById,
  updateAppStationConfig,
} from "../../services/stationConfigService";

import { getAppConfigs } from "../../services/appconfigService";
import { getAllStations } from "../../services/subStationService";
export default function EditStation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
  appId: "",
  stationId: "",   // ✅ replace stationName
  isActive: true,
});

  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
 const [subStations, setSubStations] = useState([]); // MUST exist here

  // LOAD DATA
  useEffect(() => {
  const load = async () => {
    try {
      setLoading(true);

      const appsRes = await getAppConfigs();
      setApps(appsRes || []);

      const stationRes = await getAllStations();
      setSubStations(stationRes || []);

      const res = await getAppStationConfigById(id);

     setForm({
  appId: res?.appId || "",
  stationId: res?.stationId || "",
  isActive: res?.isActive ?? true,
});

    } catch (error) {
      console.error("LOAD ERROR:", error);
      alert("Failed to load data");
    } finally {
      setLoading(false);   // 🔥 IMPORTANT FIX
    }
  };

  load();
}, [id]);
  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // UPDATE
  const handleUpdate = async () => {
    try {
      setSubmitting(true);

    await updateAppStationConfig(id, {
  appId: Number(form.appId),
  stationId: Number(form.stationId),  // ✅ FIX
  isActive: form.isActive,
});

      alert("Updated successfully!");
      navigate("/masters/Stationlist");
    } catch (error) {
      console.error(error);
      alert("Update failed!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-3">Loading station config...</span>
      </div>
    );
  }

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">

      {/* HEADER */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Masters
            </p>
            <h1 className="mt-1 text-2xl font-semibold">
              Edit Station Config
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/masters/Stationlist")}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
                        Back Add Station Config

          </button>

        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Modify station configuration details.
        </p>

      </div>

      {/* FORM */}
      <form className="overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800">

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* APP */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              App*
            </label>

            <select
              name="appId"
              value={form.appId}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border px-4 py-3"
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
  onChange={handleChange}
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

          {/* ACTIVE */}
          <div className="self-end">
            <div className="flex items-center gap-3 rounded-2xl border px-4 py-3">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
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
            className="rounded-xl border px-4 py-2 text-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleUpdate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Update
          </button>

        </div>

      </form>

    </div>
  );
}