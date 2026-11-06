import { useEffect, useMemo, useState } from "react";
import { Layers } from "lucide-react";
import PageHero from "../../components/PageHero";
import { CSVLink } from "react-csv";

import { getAllAssetTypes } from "../../services/assetTypeService";

// Utility to safely extract arrays from API responses
const getArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (res.content && Array.isArray(res.content)) return res.content;
  return [];
};

// Mock data generator for the report table
const generateMockAssetComparisonData = () => {
  return [
    {
      id: 1,
      machineName: "CNC Milling A",
      assetType: "CNC Machine",
      totalPlannedTimeMins: 480,
      totalRunningTimeMins: 420,
      totalDownTimeMins: 60,
      availability: 87.5,
      performance: 92.0,
      quality: 98.5,
      totalOee: 79.3,
    },
    {
      id: 2,
      machineName: "Packaging Robot 1",
      assetType: "Assembly Robot",
      totalPlannedTimeMins: 480,
      totalRunningTimeMins: 455,
      totalDownTimeMins: 25,
      availability: 94.8,
      performance: 95.0,
      quality: 99.1,
      totalOee: 89.2,
    },
    {
      id: 3,
      machineName: "Cell Tester Station 2",
      assetType: "Cell Tester",
      totalPlannedTimeMins: 480,
      totalRunningTimeMins: 400,
      totalDownTimeMins: 80,
      availability: 83.3,
      performance: 88.5,
      quality: 97.0,
      totalOee: 71.5,
    }
  ];
};

export default function AssetComparisonReport() {
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
  const [assetTypes, setAssetTypes] = useState([]);
  const [selectedAssetTypeId, setSelectedAssetTypeId] = useState("");

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= LOAD DROPDOWNS =================
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const res = await getAllAssetTypes();
        setAssetTypes(getArray(res).map(t => ({
          id: t.id, 
          name: t.typeName || t.name || t.description || "Unnamed Type"
        })));
      } catch (e) {
        console.error("Failed to fetch asset types", e);
        setAssetTypes([]);
      }
    };
    
    loadDropdownData();
  }, []);

  // ================= SEARCH =================
  const handleSearch = async () => {
    setLoading(true);

    setTimeout(() => {
      try {
        const mockRes = generateMockAssetComparisonData();
        
        let filteredData = mockRes;
        if (selectedAssetTypeId) {
          const typeName = assetTypes.find(t => String(t.id) === String(selectedAssetTypeId))?.name;
          if (typeName) {
            filteredData = filteredData.filter(item => item.assetType.toLowerCase() === typeName.toLowerCase());
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
        title="Asset Comparison"
        icon={Layers}
      />

      {/* FILTER CARD (4-item single row layout matching other reports) */}
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
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">Asset Type</label>
            <select
              value={selectedAssetTypeId}
              onChange={(e) => setSelectedAssetTypeId(e.target.value)}
              className="w-full border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-[34px] capitalize"
            >
              <option value="">All Asset Types</option>
              {assetTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
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
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Asset Comparison Records</h2>
          <CSVLink data={pagedLogs} filename={`Asset_Comparison_${fromDate}_to_${toDate}.csv`}>
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
                <th className={thLeftClass}>Asset Name</th>
                <th className={thLeftClass}>Asset Type</th>
                <th className={thCenterClass}>Total Planned Time (Mins)</th>
                <th className={thCenterClass}>Total Running Time (Mins)</th>
                <th className={thCenterClass}>Total Down Time (Mins)</th>
                <th className={thRightClass}>Availability %</th>
                <th className={thRightClass}>Performance %</th>
                <th className={thRightClass}>Quality %</th>
                <th className={thRightClass}>Total OEE %</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {pagedLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-slate-400 text-sm">
                    No Data Found
                  </td>
                </tr>
              ) : (
                pagedLogs.map((log, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap">{log.machineName}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-blue-600 whitespace-nowrap">{log.assetType}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-slate-800 whitespace-nowrap text-center">{log.totalPlannedTimeMins}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-emerald-600 whitespace-nowrap text-center">{log.totalRunningTimeMins}</td>
                    <td className="px-6 py-5 text-sm font-semibold text-red-500 whitespace-nowrap text-center">{log.totalDownTimeMins}</td>
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
