import { useEffect, useMemo, useState } from "react";
import { Activity } from "lucide-react";
import PageHero from "../../components/PageHero";
import { CSVLink } from "react-csv";

import { getShiftMasters } from "../../services/AvailabilityService";

// Utility to safely extract arrays from API responses
const getArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

// Mock data generator for the report table
const generateMockOeeData = () => {
  return [
    {
      id: 1,
      date: "2026-07-27",
      shift: "Shift 1",
      department: "Machining",
      plannedTargetQty: 500,
      totalProducedQty: 480,
      okUnits: 465,
      nokUnits: 15,
      plannedTimeMins: 480,
      actualOperatingTimeMins: 450,
      availability: 93.75,
      performance: 96.0,
      quality: 96.87,
      totalOee: 87.18,
    },
    {
      id: 2,
      date: "2026-07-27",
      shift: "Shift 2",
      department: "Assembly",
      plannedTargetQty: 1000,
      totalProducedQty: 950,
      okUnits: 940,
      nokUnits: 10,
      plannedTimeMins: 480,
      actualOperatingTimeMins: 460,
      availability: 95.83,
      performance: 95.0,
      quality: 98.94,
      totalOee: 90.07,
    },
    {
      id: 3,
      date: "2026-07-26",
      shift: "Shift 1",
      department: "Packaging",
      plannedTargetQty: 1200,
      totalProducedQty: 1210,
      okUnits: 1200,
      nokUnits: 10,
      plannedTimeMins: 480,
      actualOperatingTimeMins: 470,
      availability: 97.91,
      performance: 100.8,
      quality: 99.17,
      totalOee: 97.87,
    }
  ];
};

export default function OeeReport() {
  const getLocalDate = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  };

  const today = getLocalDate();
  
  const [shifts, setShifts] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= SHIFT DROPDOWN =================
  useEffect(() => {
    const loadShifts = async () => {
      try {
        const res = await getShiftMasters();
        const list = getArray(res);

        setShifts(list.map(s => ({
          id: s.id,
          name: s.shiftName || s.name
        })));
      } catch (error) {
        console.error("Failed to fetch shifts from API", error);
        setShifts([]); 
      }
    };
    loadShifts();
  }, []);

  // ================= SEARCH =================
  const handleSearch = async () => {
    setLoading(true);

    setTimeout(() => {
      try {
        const mockRes = generateMockOeeData();
        const filteredData = selectedShiftId 
          ? mockRes.filter(item => item.shift.includes(selectedShiftId))
          : mockRes;

        setLogs(filteredData);
      } catch (e) {
        console.error(e);
        setLogs([]);
      }
      setLoading(false);
    }, 600);
  };

  const pagedLogs = useMemo(() => logs, [logs]);

  // Shared classes for table headers
  const thLeftClass = "px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white text-left";
  const thCenterClass = "px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white text-center";
  const thRightClass = "px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white text-right";

  return (
    <div className="p-4 space-y-6 bg-slate-50 min-h-screen">
      <PageHero
        eyebrow="Reports"
        title="OEE"
        icon={Activity}
      />

      {/* FILTER CARD (Restored to perfectly match previous compact sizes) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 w-full">
        <div className="flex flex-wrap items-end gap-6">
          
          <div className="w-48">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-[34px]"
            />
          </div>

          <div className="w-48">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-[34px]"
            />
          </div>

          <div className="w-48">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Shift</label>
            <select
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
              className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-[34px] capitalize"
            >
              <option value="">All Shifts</option>
              {shifts.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#2B547E] hover:bg-[#1C3A5A] transition-colors text-white font-medium rounded-lg px-4 py-1.5 text-xs disabled:opacity-70 h-[34px] w-32"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="w-full rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        
        {/* HEADER & CSV BUTTON TOGETHER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">OEE Data</h2>
          
          <CSVLink data={pagedLogs} filename={`OEE_Report_${fromDate}_to_${toDate}.csv`}>
            <button className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Export CSV
            </button>
          </CSVLink>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse bg-white">
            <thead>
              <tr className="border-b border-slate-200">
                <th className={thLeftClass}>Date</th>
                <th className={thLeftClass}>Shift</th>
                <th className={thLeftClass}>Department</th>
                <th className={thCenterClass}>Planned Target Qty</th>
                <th className={thCenterClass}>Total Produced Qty</th>
                <th className={thCenterClass}>OK Units</th>
                <th className={thCenterClass}>NOK Units</th>
                <th className={thCenterClass}>Planned Time (Mins)</th>
                <th className={thCenterClass}>Actual Op Time (Mins)</th>
                <th className={thRightClass}>Availability %</th>
                <th className={thRightClass}>Performance %</th>
                <th className={thRightClass}>Quality %</th>
                <th className={thRightClass}>Total OEE %</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {pagedLogs.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-12 text-slate-400 text-sm">
                    No Data Found
                  </td>
                </tr>
              ) : (
                pagedLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-none">
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap">{log.date}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap">{log.shift}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap">{log.department}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap text-center">{log.plannedTargetQty}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap text-center">{log.totalProducedQty}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-emerald-600 whitespace-nowrap text-center">{log.okUnits}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-red-500 whitespace-nowrap text-center">{log.nokUnits}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap text-center">{log.plannedTimeMins}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap text-center">{log.actualOperatingTimeMins}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-800 whitespace-nowrap text-right">{log.availability}%</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-800 whitespace-nowrap text-right">{log.performance}%</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-800 whitespace-nowrap text-right">{log.quality}%</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-800 whitespace-nowrap text-right">{log.totalOee}%</td>
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