import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import {
  Monitor,
  CheckCircle2,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  getAppConfigs,
  deleteAppConfig,
} from "../../services/appconfigService";

export default function AppConfigList() {
  const navigate = useNavigate();

  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH CONFIGS
  // =========================
  const fetchConfigs = async () => {
    try {
      setLoading(true);

      const res = await getAppConfigs();

      setConfigs(res || []);
    } catch (error) {
      console.error("Error fetching app configs:", error);
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // =========================
  // EDIT
  // =========================
  const handleEdit = (config) => {
    navigate(`/masters/AppConfig/edit/${config.id}`, {
      state: {
        config,
      },
    });
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this config?"
    );

    if (!confirmDelete) return;

    try {
      await deleteAppConfig(id);

      alert("Config deleted successfully!");

      fetchConfigs();
    } catch (error) {
      console.error("Delete error:", error);

      alert("Error deleting config");
    }
  };

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <PageHero
        eyebrow="Masters"
        title="App Config"
        description="Manage application configurations and PC endpoints."
        icon={Monitor}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Live catalogue
          </div>
        }
      />

      {/* ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">
            Config Actions
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create, update or delete application configurations.
          </p>
        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={() =>
              navigate("/masters/AppConfig/add")
            }
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
          >
            <Monitor className="h-4 w-4" />
            Add Config
          </button>

          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
            API Connected
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white/95 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950/70 dark:ring-slate-800/80">

<table className="w-full table-auto divide-y divide-slate-200 text-left text-sm text-slate-800 dark:divide-slate-800 dark:text-slate-100">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
            <tr>
<th className="px-4 py-3 font-semibold">
                  ID
              </th>

              <th className="px-4 py-3 font-semibold">
                App Name
              </th>

<th className="px-4 py-3 font-semibold text-center min-w-[120px]">
  Status
</th>

<th className="px-4 py-3 font-semibold text-center">
                  Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white/90 dark:divide-slate-800 dark:bg-slate-900/70">

            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-slate-500 dark:text-slate-300"
                >
                  Loading Configurations...
                </td>
              </tr>
            ) : configs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-slate-500 dark:text-slate-300"
                >
                  No configurations found.
                </td>
              </tr>
            ) : (
              configs.map((config) => (
                <tr
                  key={config.id}
                  className="bg-white/95 transition hover:bg-slate-50/80 dark:bg-slate-900/75 dark:hover:bg-slate-800/70"
                >

                  <td className="px-4 py-3 font-semibold">
                    {config.id}
                  </td>

                  <td className="px-4 py-3 font-medium">
                    {config.appName}
                  </td>

<td className="px-4 py-3 text-center">
                     <span
  className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
    config.isActive
      ? "bg-emerald-100 text-emerald-700"
      : "bg-rose-100 text-rose-700"
  }`}
>
                      {config.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
<div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          handleEdit(config)
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-100"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      {/* <button
                        onClick={() =>
                          handleDelete(config.id)
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button> */}

                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}