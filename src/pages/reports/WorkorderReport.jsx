import { useEffect, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import PageHero from "../../components/PageHero";
import { CSVLink } from "react-csv";

import { getAllWorkOrderStatuses } from "../../services/workOrderStatusService";

// Utility to safely extract arrays from API responses
const getArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

// Mock data generator for the report table
const generateMockWorkOrderData = () => {
  return [
    {
      id: 1,
      workOrderId: "WO-2026-1045",
      itemName: "Battery Cell Type A",
      targetQty: 1000,
      actualStartTime: "2026-07-27 08:00:00",
      actualEndTime: "2026-07-27 12:30:00",
      totalProduced: 990,
      goodQty: 982,
      scrapQty: 8,
      avgCycleTimeSecs: 15.4,
      jobOee: 94.2,
      status: "completed",
    },
    {
      id: 2,
      workOrderId: "WO-2026-1046",
      itemName: "Battery Module B",
      targetQty: 500,
      actualStartTime: "2026-07-27 13:00:00",
      actualEndTime: "-",
      totalProduced: 250,
      goodQty: 245,
      scrapQty: 5,
      avgCycleTimeSecs: 42.1,
      jobOee: 89.5,
      status: "in progress",
    },
    {
      id: 3,
      workOrderId: "WO-2026-1047",
      itemName: "Battery Pack Shell",
      targetQty: 200,
      actualStartTime: "2026-07-26 09:00:00",
      actualEndTime: "2026-07-26 15:45:00",
      totalProduced: 200,
      goodQty: 198,
      scrapQty: 2,
      avgCycleTimeSecs: 110.5,
      jobOee: 98.1,
      status: "completed",
    }
  ];
};

export default function WorkOrderExecutionReport() {
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
  const [statuses, setStatuses] = useState([]);
  const [selectedStatusId, setSelectedStatusId] = useState("");

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= LOAD DROPDOWNS =================
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const res = await getAllWorkOrderStatuses();
        
        setStatuses(getArray(res).map(s => ({
          id: s.id, 
          name: s.description || s.statusName || s.name || "Unknown Status"
        })));
      } catch (e) {
        console.error("Failed to fetch statuses from API", e);
        setStatuses([]);
      }
    };
    
    loadDropdownData();
  }, []);

  // ================= SEARCH =================
  const handleSearch = async () => {
    setLoading(true);

    setTimeout(() => {
      try {
        const mockRes = generateMockWorkOrderData();
        
        // Mock filtering logic based on selected status
        let filteredData = mockRes;
        if (selectedStatusId) {
          const statusName = statuses.find(s => String(s.id) === String(selectedStatusId))?.name;
          if (statusName) {
             filteredData = filteredData.filter(item => 
               item.status.toLowerCase() === statusName.toLowerCase()
             );
          }
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
        title="Work Order Execution"
        icon={ClipboardList}
      />

      {/* FILTER CARD (Full Width Card, Fixed Width Inputs) */}
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
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Status</label>
            <select
              value={selectedStatusId}
              onChange={(e) => setSelectedStatusId(e.target.value)}
              className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-[34px] capitalize"
            >
              <option value="">All Statuses</option>
              {statuses.map(s => (
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
        
        {/* HEADER RESTORED */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Execution Records</h2>
          <CSVLink data={pagedLogs} filename={`WorkOrder_Execution_${fromDate}_to_${toDate}.csv`}>
            <button className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 border border-emerald-200/50">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Export CSV
            </button>
          </CSVLink>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className={thLeftClass}>Work Order ID</th>
                <th className={thLeftClass}>Item Name</th>
                <th className={thCenterClass}>Target Qty</th>
                <th className={thLeftClass}>Actual Start Time</th>
                <th className={thLeftClass}>Actual End Time</th>
                <th className={thCenterClass}>Total Produced</th>
                <th className={thCenterClass}>Good Qty</th>
                <th className={thCenterClass}>Scrap Qty</th>
                <th className={thCenterClass}>Avg Cycle Time (s)</th>
                <th className={thRightClass}>Job OEE %</th>
              </tr>
            </thead>

            <tbody>
              {pagedLogs.length === 0 ? (
                <tr className="bg-white">
                  <td colSpan={10} className="text-center py-12 text-slate-400 text-sm">
                    No Data Found
                  </td>
                </tr>
              ) : (
                pagedLogs.map((log, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 text-sm font-semibold text-blue-600 whitespace-nowrap">{log.workOrderId}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap">{log.itemName}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap text-center">{log.targetQty}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-500 whitespace-nowrap">{log.actualStartTime}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-500 whitespace-nowrap">{log.actualEndTime}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap text-center">{log.totalProduced}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-emerald-600 whitespace-nowrap text-center">{log.goodQty}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-red-500 whitespace-nowrap text-center">{log.scrapQty}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap text-center">{log.avgCycleTimeSecs}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-800 whitespace-nowrap text-right">{log.jobOee}%</td>
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