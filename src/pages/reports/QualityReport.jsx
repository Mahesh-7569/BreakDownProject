import { useEffect, useMemo, useState } from "react";
import { CheckCircle } from "lucide-react";
import PageHero from "../../components/PageHero";
import { CSVLink } from "react-csv";

// Existing APIs
import { getShiftMasters } from "../../services/AvailabilityService";
import { getAllAssets } from "../../services/assetService";

// Utility to safely extract arrays from API responses
const getArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

// Mock API for Defect Reasons (Replace with your actual API import if available)
const getDefectReasons = async () => {
  return [
    { id: 1, name: "Dimensional Error" },
    { id: 2, name: "OCV/IR Fail" },
    { id: 3, name: "Welding Fault" },
    { id: 4, name: "Casing Dents" }
  ];
};

// Mock data generator for the report table
const generateMockQualityData = () => {
  return [
    {
      id: 1,
      date: "2026-07-27",
      shift: "Shift 1",
      workOrderId: "WO-2026-1045",
      machineName: "Cell Tester 1",
      totalProduced: 1000,
      nokQty: 12,
      defectCategory: "Electrical",
      defectReason: "OCV/IR Fail",
      firstPassYield: 98.8,
    },
    {
      id: 2,
      date: "2026-07-27",
      shift: "Shift 1",
      workOrderId: "WO-2026-1046",
      machineName: "Laser Welder B",
      totalProduced: 500,
      nokQty: 5,
      defectCategory: "Mechanical",
      defectReason: "Welding Fault",
      firstPassYield: 99.0,
    },
    {
      id: 3,
      date: "2026-07-26",
      shift: "Shift 2",
      workOrderId: "WO-2026-1047",
      machineName: "Module Assembly Line",
      totalProduced: 200,
      nokQty: 8,
      defectCategory: "Physical",
      defectReason: "Dimensional Error",
      firstPassYield: 96.0,
    }
  ];
};

export default function QualityReport() {
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
  
  const [defectReasons, setDefectReasons] = useState([]);
  const [selectedReasonId, setSelectedReasonId] = useState("");

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= LOAD DROPDOWNS =================
  useEffect(() => {
    const loadDropdownData = async () => {
      // Load Shifts
      try {
        const shiftRes = await getShiftMasters();
        setShifts(getArray(shiftRes).map(s => ({
          id: s.id, name: s.shiftName || s.name
        })));
      } catch (e) {
        console.error("Failed to fetch shifts", e);
        setShifts([]);
      }

      // Load Machines (Using Assets API)
      try {
        const machineRes = await getAllAssets();
        setMachines(getArray(machineRes).map(m => ({
          id: m.assetId || m.id, 
          name: m.assetName || m.machineName || m.name
        })));
      } catch (e) {
        console.error("Failed to fetch machines", e);
        setMachines([]);
      }

      // Load Defect Reasons
      try {
        const reasonRes = await getDefectReasons();
        setDefectReasons(getArray(reasonRes).map(r => ({
          id: r.id, name: r.reasonName || r.name
        })));
      } catch (e) {
        console.error("Failed to fetch defect reasons", e);
        setDefectReasons([]);
      }
    };
    
    loadDropdownData();
  }, []);

  // ================= SEARCH =================
  const handleSearch = async () => {
    setLoading(true);

    setTimeout(() => {
      try {
        const mockRes = generateMockQualityData();
        
        let filteredData = mockRes;
        if (selectedShiftId) {
          const shiftName = shifts.find(s => String(s.id) === String(selectedShiftId))?.name;
          if (shiftName) filteredData = filteredData.filter(item => item.shift === shiftName);
        }
        if (selectedMachineId) {
          const machineName = machines.find(m => String(m.id) === String(selectedMachineId))?.name;
          if (machineName) filteredData = filteredData.filter(item => item.machineName === machineName);
        }
        if (selectedReasonId) {
          const reasonName = defectReasons.find(r => String(r.id) === String(selectedReasonId))?.name;
          if (reasonName) filteredData = filteredData.filter(item => item.defectReason === reasonName);
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
  const thRightClass = "px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white text-right";

  return (
    <div className="p-4 space-y-6 bg-slate-50 min-h-screen">
      <PageHero
        eyebrow="Reports"
        title="Quality"
        icon={CheckCircle}
      />

      {/* FILTER CARD (All 6 items aligned in one row using lg:grid-cols-6) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          
          <div className="col-span-1">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-[34px]"
            />
          </div>

          <div className="col-span-1">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-[34px]"
            />
          </div>

          <div className="col-span-1">
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

          <div className="col-span-1">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Asset</label>
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-[34px]"
            >
              <option value="">All Assets</option>
              {machines.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Defect Reason</label>
            <select
              value={selectedReasonId}
              onChange={(e) => setSelectedReasonId(e.target.value)}
              className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-[34px]"
            >
              <option value="">All Reasons</option>
              {defectReasons.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#2B547E] hover:bg-[#1C3A5A] transition-colors text-white font-medium rounded-lg px-4 py-1.5 text-xs w-full disabled:opacity-70 h-[34px]"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="w-full rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        
          {/*        HEADER & CSV BUTTON TOGETHER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">           <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Defect Records</h2>
          <CSVLink data={pagedLogs} filename={`Defect_Log_${fromDate}_to_${toDate}.csv`}>
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
                 <th className={thLeftClass}>Work Order ID</th>
                <th className={thLeftClass}>Asset Name</th>
                 <th className={thCenterClass}>Total Produced</th>
                <th className={thCenterClass}>NOK (Scrap) Qty</th>    
            <th className={thRightClass}>First Pass Yield %</th>
              </tr>
            </thead>

      <tbody className="divide-y divide-slate-200">
              {pagedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    No Data Found
                  </td>
                </tr>
              ) : (
                pagedLogs.map((log, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap">{log.date}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap">{log.shift}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-blue-600 whitespace-nowrap">{log.workOrderId}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap">{log.machineName}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap text-center">{log.totalProduced}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-red-500 whitespace-nowrap text-center">{log.nokQty}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-800 whitespace-nowrap text-right">{log.firstPassYield}%</td>
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