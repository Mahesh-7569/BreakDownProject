import { useState, useEffect } from "react";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAppConfigById,
  updateAppConfig,
} from "../../services/appconfigService";

export default function EditAppConfig() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    appName: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // =========================
  // FETCH CONFIG BY ID
  // =========================
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);

        const data = await getAppConfigById(id);

        if (data) {
          setForm({
            appName: data.appName || "",
            isActive: data.isActive ?? true,
          });
        }
      } catch (error) {
        console.error("Error fetching config:", error);
        alert("Failed to load config");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchConfig();
    }
  }, [id]);

  // =========================
  // HANDLE INPUT
  // =========================
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

  // =========================
  // UPDATE CONFIG
  // =========================
  const handleUpdate = async () => {
    if (!form.appName) {
      alert("App Name is required!");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        id: Number(id),
        appName: form.appName,
        isActive: form.isActive,
      };

      console.log("UPDATE PAYLOAD:", payload);

      await updateAppConfig(id, payload);

      alert("App Config updated successfully!");

      navigate("/masters/AppConfig");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update App Config");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <span className="ml-3 text-slate-500">
          Loading configuration...
        </span>
      </div>
    );
  }

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">

      {/* HEADER */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Masters
            </p>

            <h1 className="mt-1 text-2xl font-semibold">
              Edit App Config
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/masters/AppConfig")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App Config
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Update application configuration details.
        </p>
      </div>

      {/* FORM */}
      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800">

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* APP NAME */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="mb-1 block text-sm font-semibold">
              App Name*
            </label>

            <input
              type="text"
              name="appName"
              value={form.appName}
              onChange={handleInputChange}
              placeholder="Enter App Name"
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

              <span className="text-sm">
                Active
              </span>
            </div>
          </div>

        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-3">

          <button
            type="button"
            onClick={() => navigate("/masters/AppConfig")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleUpdate}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16629b] disabled:opacity-60 dark:bg-amber-400 dark:text-slate-950"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            Update Config
          </button>

        </div>
      </form>
    </div>
  );
}