import { useEffect, useMemo, useState } from "react";
import { FileVideoCamera } from "lucide-react";
import PageHero from "../../components/PageHero";
import { CSVLink } from "react-csv";

import { getLines } from "../../services/lineService";
import { getSubStations } from "../../services/subStationService";
import { getAllCameras } from "../../services/cameraService";
import CameraImageLogService from "../../services/CameraimglogService";

const getArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

const getResultBadge = (result) => {
  if (result === 1 || result === "1" || result === "PASS") {
    return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">PASS</span>;
  }
  if (result === 0 || result === "0" || result === "FAIL") {
    return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">FAIL</span>;
  }
  return <span className="px-2 py-1 text-xs rounded bg-gray-100">{result}</span>;
};

export default function CameraImageLog() {

const getLocalDateTime = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

const now = getLocalDateTime();
  const [lines, setLines] = useState([]);
  const [stations, setStations] = useState([]);
  const [cameras, setCameras] = useState([]);

  const [selectedLineId, setSelectedLineId] = useState("");
  const [selectedStationId, setSelectedStationId] = useState("");
  const [selectedCameraId, setSelectedCameraId] = useState("");

  const [fromDateTime, setFromDateTime] = useState(now);
  const [toDateTime, setToDateTime] = useState(now);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= LINE =================
  useEffect(() => {
    const load = async () => {
      const res = await getLines();
      const list = getArray(res);

      setLines(list.map(l => ({
        id: l.id,
        name: l.lineName || l.name
      })));
    };
    load();
  }, []);

  // ================= STATION =================
  useEffect(() => {
    const load = async () => {
      setSelectedStationId("");
      setSelectedCameraId("");
      setStations([]);
      setCameras([]);

      if (!selectedLineId) return;

      const res = await getSubStations(selectedLineId);
      const list = getArray(res);

      setStations(
        list
          .filter(s => String(s.lineId) === String(selectedLineId))
          .map(s => ({
            id: s.id,
            name: s.stationName || s.name
          }))
      );
    };

    load();
  }, [selectedLineId]);

  // ================= CAMERA =================
  useEffect(() => {
    const load = async () => {
      setSelectedCameraId("");
      setCameras([]);

      if (!selectedStationId) return;

      const res = await getAllCameras(selectedStationId);
      const list = getArray(res);

      setCameras(
        list
          .filter(c => String(c.stationId) === String(selectedStationId))
          .map(c => ({
            id: c.id,
            name: c.cameraDetails || c.cameraIP
          }))
      );
    };

    load();
  }, [selectedStationId]);

  // ================= SEARCH =================
  const handleSearch = async () => {
    if (!selectedStationId || !selectedCameraId) {
      alert("Select Station + Camera");
      return;
    }

    setLoading(true);

    try {
      const res = await CameraImageLogService.getByStationCameraDates(
        selectedStationId,
        selectedCameraId,
        fromDateTime,
        toDateTime
      );

      setLogs(getArray(res));
    } catch (e) {
      console.error(e);
      setLogs([]);
    }

    setLoading(false);
  };

  const pagedLogs = useMemo(() => logs, [logs]);

  return (
    <div className="p-3 space-y-3">

      <PageHero
        eyebrow="Reports"
        title="Camera Image Logs"
        icon={FileVideoCamera}
      />


      {/* FILTER (MESBYPASS STYLE) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">

          {/* FROM */}
          <div className="md:col-span-2">
            <label className="text-sm">From Date</label>
            <input
              type="datetime-local"
              value={fromDateTime}
              onChange={(e) => setFromDateTime(e.target.value)}
              className="w-full border p-1 text-xs rounded h-8"         />
          </div>

          {/* TO */}
          <div className="md:col-span-2">
            <label className="text-sm">To Date</label>
            <input
              type="datetime-local"
              value={toDateTime}
              onChange={(e) => setToDateTime(e.target.value)}
    className="w-full border p-1 text-xs rounded h-8"
            />
          </div>

          {/* LINE */}
         <div className="md:col-span-2">
            <label className="text-sm">Line</label>
            <select
              value={selectedLineId}
              onChange={(e) => setSelectedLineId(e.target.value)}
className="w-full border p-1 text-xs rounded h-8"            >
              <option value="">Select Line</option>
              {lines.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* STATION */}
          <div className="md:col-span-2">
            <label className="text-sm">Station</label>
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="w-full border p-1 text-xs rounded h-8"
            >
              <option value="">Select Station</option>
              {stations.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
 
          {/* CAMERA + BUTTON */}
         {/* CAMERA */}
<div className="md:col-span-2">
  <label className="text-sm">Camera</label>
  <select
    value={selectedCameraId}
    onChange={(e) => setSelectedCameraId(e.target.value)}
    className="w-full border p-1 text-xs rounded h-8"
  >
    <option value="">Select Camera</option>
    {cameras.map((c) => (
      <option key={c.id} value={c.id}>
        {c.name}
      </option>
    ))}
  </select>
</div>

{/* SEARCH BUTTON */}
<div className="md:col-span-2 flex items-end">
  <button
    onClick={handleSearch}
    disabled={loading}
    className="bg-blue-600 text-white rounded h-8 px-4 text-xs w-full"
  >
    {loading ? "Loading..." : "Search"}
  </button>
</div>
        </div>
      </div>

      {/* TABLE (MESBYPASS STYLE) */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">

        <div className="flex justify-between px-4 py-3 border-b">
          <h2 className="text-sm font-semibold uppercase">Camera Logs</h2>
          <CSVLink data={pagedLogs}>
            <button className="bg-green-500 text-white px-2 py-1 rounded text-xs">
              Export CSV
            </button>
          </CSVLink>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800 uppercase text-xs">
              <tr>
                <th className="px-6 py-2 text-left">Part No</th>
                <th className="px-6 py-2 text-left">File Name</th>
                <th className="px-6 py-2 text-left">DateTime</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {pagedLogs.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-4">
                    No Data Found
                  </td>
                </tr>
              ) : (
                pagedLogs.map((log, i) => (
                  <tr key={i}>
                    <td className="px-6 py-2">{log.partNo}</td>
                    <td className="px-6 py-2">{log.fileName}</td>
<td className="px-6 py-2">
  {log.logDateTime
    ? new Date(log.logDateTime).toLocaleString()
    : "-"}
</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}