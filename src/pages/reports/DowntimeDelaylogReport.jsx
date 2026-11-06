import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import PageHero from "../../components/PageHero";
import { CSVLink } from "react-csv";

import { getShiftMasters, getCategories } from "../../services/AvailabilityService";
import { getAllAssets } from "../../services/assetService";

// Utility to safely extract arrays from various API response formats
const getArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.data && Array.isArray(res.data)) return res.data;
  if (res.content && Array.isArray(res.content)) return res.content;
  if (res.result && Array.isArray(res.result)) return res.result;
  return [];
};

// Mock data generator for the report table
const generateMockDowntimeData = () => {
  return [
    {
      id: 1,
      date: "2026-07-27",
      shift: "Shift 1",
      assetName: "CNC Milling A",
      stopTime: "2026-07-27 09:15:00",
      resumeTime: "2026-07-27 09:45:00",
      durationMins: 30,
      category: "Mechanical Breakdown",
      reasons: "Spindle Jam",
      operatorRemarks: "Cleaned and lubricated spindle",
    },
    {
      id: 2,
      date: "2026-07-27",
      shift: "Shift 1",
      assetName: "Assembly Line 2",
      stopTime: "2026-07-27 11:00:00",
      resumeTime: "2026-07-27 11:15:00",
      durationMins: 15,
      category: "Material Shortage",
      reasons: "Awaiting Fasteners",
      operatorRemarks: "Called warehouse, restocked at 11:10",
    },
    {
      id: 3,
      date: "2026-07-26",
      shift: "Shift 2",
      assetName: "Packaging Robot",
      stopTime: "2026-07-26 15:30:00",
      resumeTime: "2026-07-26 16:30:00",
      durationMins: 60,
      category: "Waiting", // Updated mock data to match your API
      reasons: "Sensor Failure",
      operatorRemarks: "Replaced proximity sensor on conveyor",
    }
  ];
};

export default function DowntimeReport() {
  const getLocalDate = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  };

  const today = getLocalDate();
  
  // Filter States
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  
  // Dropdown States
  const [shifts, setShifts] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState("");
  
  const [machines, setMachines] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState("");
  
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= LOAD DROPDOWNS =================
  useEffect(() => {
    const loadDropdownData = async () => {
      // Load Shifts
      try {
        const shiftRes = await getShiftMasters();
        setShifts(getArray(shiftRes).map(s => ({
          id: s.id, 
          name: s.shiftName || s.name
        })));
      } catch (e) {
        console.error("Failed to fetch shifts from API", e);
        setShifts([]); 
      }

      // Load Machines (Using Assets API)
      try {
        const machineRes = await getAllAssets();
        setMachines(getArray(machineRes).map(m => ({
          id: m.assetId || m.id, 
          name: m.assetName || m.assetName || m.name
        })));
      } catch (e) {
        console.error("Failed to fetch assets from API", e);
        setMachines([]);
      }

      // Load Categories
      try {
        const catRes = await getCategories();
        const extractedCats = getArray(catRes);
        
        setCategories(extractedCats.map(c => ({
          id: c.id, 
          name: c.description || c.categoryName || c.name || "Unnamed Category"
        })));
      } catch (e) {
        console.error("Failed to fetch categories from API", e);
        setCategories([]);
      }
    };
    
    loadDropdownData();
  }, []);

  // ================= SEARCH =================
  const handleSearch = async () => {
    setLoading(true);

    setTimeout(() => {
      try {
        const mockRes = generateMockDowntimeData();
        
        let filteredData = mockRes;
        if (selectedShiftId) {
          const shiftName = shifts.find(s => String(s.id) === String(selectedShiftId))?.name;
          if (shiftName) filteredData = filteredData.filter(item => item.shift === shiftName);
        }
        if (selectedMachineId) {
          const assetName = machines.find(m => String(m.id) === String(selectedMachineId))?.name;
          if (assetName) filteredData = filteredData.filter(item => item.assetName === assetName);
        }
        if (selectedCategoryId) {
           const catName = categories.find(c => String(c.id) === String(selectedCategoryId))?.name;
           if (catName) filteredData = filteredData.filter(item => item.category === catName);
        }

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

  return (
    <div className="p-4 space-y-6 bg-slate-50 min-h-screen">
      <PageHero
        eyebrow="Reports"
        title="Downtime And DelayLog"
        icon={AlertCircle}
      />

      {/* FILTER CARD (Action bar left unchanged as requested) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          
          <div className="col-span-1">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="col-span-1">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="col-span-1">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Shift</label>
            <select
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
              className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">All Shifts</option>
              {shifts.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Assets</label>
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">All Assets</option>
              {machines.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Category</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#2B547E] hover:bg-[#1C3A5A] transition-colors text-white font-medium rounded-lg px-4 py-1.5 text-xs w-full disabled:opacity-70 h-[30px]"
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
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Downtime Records</h2>
          <CSVLink data={pagedLogs} filename={`Downtime_Report_${fromDate}_to_${toDate}.csv`}>
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
                <th className={thLeftClass}>Asset Name</th>
                <th className={thLeftClass}>Stop Time</th>
                <th className={thLeftClass}>Resume Time</th>
                <th className={thCenterClass}>Duration (Mins)</th>
                <th className={thLeftClass}>Category</th>
                <th className={thLeftClass}>Reasons</th>
                <th className={thLeftClass}>Operator Remarks</th>
              </tr>
            </thead>

            <tbody>
              {pagedLogs.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={9} className="text-center py-12 text-slate-400 text-sm">
                    No Data Found
                  </td>
                </tr>
              ) : (
                pagedLogs.map((log, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap">{log.date}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap">{log.shift}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap">{log.assetName}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-rose-500 whitespace-nowrap">{log.stopTime}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-emerald-600 whitespace-nowrap">{log.resumeTime}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap text-center">{log.durationMins}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap">{log.category}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap">{log.reasons}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 truncate max-w-[200px]" title={log.operatorRemarks}>
                      {log.operatorRemarks}
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