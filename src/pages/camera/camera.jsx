import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import { Camera, CheckCircle2, CircleDashed, Pencil,Trash2 } from "lucide-react";
import {
  getAllCameras,
  deleteCamera,
} from "../../services/cameraService";
import { getAllStations } from "../../services/subStationService";
export default function CameraList() {
  const navigate = useNavigate();
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
const [stations, setStations] = useState([]);
  // REAL API
  useEffect(() => {
    fetchCameras();
    fetchStations();
  }, []);

  const fetchStations = async () => {
  try {
    const res = await getAllStations();
    setStations(res || []);
  } catch (error) {
    console.error("Error fetching stations:", error);
    setStations([]);
  }
};

const getStationName = (id) => {
  return stations.find((s) => s.id === id)?.stationName || id;
};

  const fetchCameras = async () => {
    try {
      setLoading(true);

      const data = await getAllCameras();

      setCameras(data || []);
    } catch (error) {
      console.error("Error fetching cameras:", error);
      setCameras([]);
    } finally {
      setLoading(false);
    }
  };

  // Status badge component
  function StatusBadge({ active }) {
    const tone = active
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-100 dark:ring-emerald-400/30"
      : "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-400/15 dark:text-rose-100 dark:ring-rose-400/30";

    const dot = active
      ? "bg-emerald-500 dark:bg-emerald-300"
      : "bg-rose-500 dark:bg-rose-300";

    const Icon = active ? CheckCircle2 : CircleDashed;

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${tone}`}
      >
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <Icon className="h-4 w-4" />
        {active ? "Active" : "Inactive"}
      </span>
    );
  }

  const handleEdit = (camera) => {
    navigate(`/masters/Camera/edit/${camera.id}`);
  };

  const handleDelete = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this camera?"
  );

  if (!confirmDelete) return;

  try {
    await deleteCamera(id);

    alert("Camera deleted successfully!");

    fetchCameras();
  } catch (error) {
    console.error("Error deleting camera:", error);
    alert("Failed to delete camera!");
  }
};


  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Masters"
        title="Cameras"
        description="Manage Camera configuration and monitoring endpoints."
        icon={Camera}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Live catalogue
          </div>
        }
      />

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">
            Camera Actions
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create, reload, or browse camera records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/masters/Camera/add")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
          >
            <Camera className="h-4 w-4" /> Add Camera
          </button>

          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-4 w-4" /> Auto refresh on demand
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white/95 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950/70 dark:ring-slate-800/80">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-800 dark:divide-slate-800 dark:text-slate-100">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Station Name</th>
              <th className="px-4 py-3 font-semibold">Camera IP</th>
              <th className="px-4 py-3 font-semibold">Details</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white/90 dark:divide-slate-800 dark:bg-slate-900/70">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-500 dark:text-slate-300"
                >
                  Loading Cameras...
                </td>
              </tr>
            ) : cameras.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-500 dark:text-slate-300"
                >
                  No cameras found.
                </td>
              </tr>
            ) : (
              cameras.map((camera) => (
                <tr
                  key={camera.id}
                  className="bg-white/95 transition hover:bg-slate-50/80 dark:bg-slate-900/75 dark:hover:bg-slate-800/70"
                >
                  <td className="px-4 py-3 font-semibold">{camera.id}</td>

                  <td className="px-4 py-3 font-semibold">
{getStationName(camera.stationId)}
                  </td>

                  <td className="px-4 py-3 font-mono text-sm text-slate-600 dark:text-slate-400">
                    {camera.cameraIP}
                  </td>

                  <td className="px-4 py-3">
                    {camera.cameraDetails}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge active={camera.isActive} />
                  </td>

                  <td className="px-4 py-3">
                   <div className="flex flex-wrap gap-2">
  <button
    onClick={() => handleEdit(camera)}
    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-50 dark:ring-blue-400/40 dark:hover:bg-blue-500/30"
  >
    <Pencil className="h-4 w-4" /> Edit
  </button>

  <button
    onClick={() => handleDelete(camera.id)}
    className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-100 transition hover:-translate-y-0.5 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-50 dark:ring-red-400/40 dark:hover:bg-red-500/30"
  >
    <Trash2 className="h-4 w-4" /> Delete
  </button>
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