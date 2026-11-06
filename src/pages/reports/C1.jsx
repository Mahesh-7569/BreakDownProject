// import { useEffect, useMemo, useState, useRef } from "react";
// import {
//   Activity,
//   CalendarDays,
//   ChevronDown,
//   TrendingUp,
//   Clock,
//   Zap,
//   ShieldCheck,
// } from "lucide-react";
// import PageHero from "../../components/PageHero";
// import { CSVLink } from "react-csv";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";

// import { getShiftMasters } from "../../services/AvailabilityService";
// import { getAllAssets } from "../../services/assetService";
// import { getOeeSummary } from "../../services/OeeReportService";

// // Utility to safely extract arrays from API responses
// const getArray = (res) => {
//   if (!res) return [];
//   if (Array.isArray(res)) return res;
//   if (Array.isArray(res.data)) return res.data;
//   if (res.content && Array.isArray(res.content)) return res.content;
//   return [];
// };

// // Utility to force YYYY-MM-DD into exact DD-MM-YYYY string
// const formatToDDMMYYYY = (dateStr) => {
//   if (!dateStr) return "";
//   const [y, m, d] = dateStr.split("-");
//   if (!y || !m || !d) return dateStr;
//   return `${d}-${m}-${y}`;
// };

// export default function OeeReport() {
//   const getLocalDate = () => {
//     const now = new Date();
//     const pad = (n) => String(n).padStart(2, "0");
//     return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`; // YYYY-MM-DD
//   };

//   const today = getLocalDate();
//   const [isMainAssetOpen, setIsMainAssetOpen] = useState(false);
//   const [isShiftOpen, setIsShiftOpen] = useState(false);
//   const [shifts, setShifts] = useState([]);
//   const [selectedShiftId, setSelectedShiftId] = useState("");

//   const [machines, setMachines] = useState([]);
//   const [selectedMachineId, setSelectedMachineId] = useState("");

//   const [fromDate, setFromDate] = useState(today);
//   const [toDate, setToDate] = useState(today);

//   // Refs to control the hidden date inputs programmatically
//   const fromDateRef = useRef(null);
//   const toDateRef = useRef(null);

//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Chart Specific Dropdown States
//   const [selectedCard1Asset, setSelectedCard1Asset] = useState("");
//   const [selectedCard2Date, setSelectedCard2Date] = useState("");

//   // Custom Dropdown UI Toggles
//   const [isAssetOpen, setIsAssetOpen] = useState(false);
//   const [isDateOpen, setIsDateOpen] = useState(false);

//   // ================= CHART FILTER STATES =================
//   const [visibleMetrics, setVisibleMetrics] = useState({
//     totalOee: true,
//     availability: true,
//     performance: true,
//     quality: true,
//   });

//   const handleMetricToggle = (metric) => {
//     setVisibleMetrics((prev) => ({ ...prev, [metric]: !prev[metric] }));
//   };

//   const [visibleBarMetrics, setVisibleBarMetrics] = useState({
//     totalOee: true,
//     availability: true,
//     performance: true,
//     quality: true,
//   });

//   const handleBarMetricToggle = (metric) => {
//     setVisibleBarMetrics((prev) => ({ ...prev, [metric]: !prev[metric] }));
//   };

//   // ================= LOAD DROPDOWNS =================
//   useEffect(() => {
//     const loadDropdownData = async () => {
//       try {
//         const res = await getShiftMasters();
//         setShifts(
//           getArray(res).map((s) => ({ id: s.id, name: s.shiftName || s.name })),
//         );
//       } catch (error) {
//         console.error("Failed to fetch shifts", error);
//         setShifts([]);
//       }

//       try {
//         const machineRes = await getAllAssets();
//         setMachines(
//           getArray(machineRes).map((m) => ({
//             id: m.assetId || m.id,
//             name: m.assetName || m.machineName || m.name,
//           })),
//         );
//       } catch (e) {
//         console.error("Failed to fetch assets", e);
//         setMachines([]);
//       }
//     };

//     loadDropdownData();
//   }, []);

//   // ================= API DATA FETCHING =================
//   const fetchReportData = async (start, end, shift, asset) => {
//     setLoading(true);
//     try {
//       const params = {
//         fromDate: start,
//         toDate: end,
//         type: shift ? "SHIFT" : "DAILY",
//       };

//       if (shift) params.shiftId = shift;
//       if (asset) params.assetId = asset;

//       const rawData = await getOeeSummary(params);
//       const dataArray = getArray(rawData);

//       // Sort chronologically BEFORE formatting the date strings
//       const sortedArray = [...dataArray].sort(
//         (a, b) => new Date(a.date) - new Date(b.date),
//       );

//       // Format Data for Table and Charts
//       const formattedData = sortedArray.map((item, index) => {
//         let displayDate = item.date;
//         let rawDate = "";
//         if (item.date) {
//           const datePart = item.date.split("T")[0];
//           rawDate = datePart;
//           const [yyyy, mm, dd] = datePart.split("-");
//           if (yyyy && mm && dd) {
//             displayDate = `${dd}-${mm}-${yyyy}`; // Builds exactly DD-MM-YYYY for table
//           }
//         }

//         const dateObj = new Date(item.date);
//         const shortDate = dateObj.toLocaleDateString("en-GB", {
//           day: "numeric",
//           month: "short",
//         });
//         const label =
//           `${shortDate} ${item.shift ? `- ${item.shift}` : ""}`.trim();

//         return {
//           ...item,
//           id: item.id || index,
//           date: displayDate,
//           rawDate: rawDate,
//           assetName: item.machineName || item.assetName || "Unknown Asset",
//           availability: item.availabilityPct,
//           performance: item.performancePct,
//           quality: item.qualityPct,
//           totalOee: item.totalOeePct,
//           xAxisLabel: label,
//         };
//       });

//       setLogs(formattedData);

//       // Reset nested dropdown selections on new search
//       setSelectedCard1Asset("");
//       setSelectedCard2Date("");
//     } catch (e) {
//       console.error("Failed to load OEE report data", e);
//       setLogs([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReportData(fromDate, toDate, selectedShiftId, selectedMachineId);
//     // eslint-disable-next-line
//   }, []);

//   const handleSearchClick = () => {
//     fetchReportData(fromDate, toDate, selectedShiftId, selectedMachineId);
//   };

//   const pagedLogs = useMemo(() => logs, [logs]);

//   // ================= TOP HIGHLIGHT METRICS =================
//   const topMetrics = useMemo(() => {
//     if (!pagedLogs || pagedLogs.length === 0) {
//       return {
//         oee: null,
//         availability: null,
//         performance: null,
//         quality: null,
//       };
//     }

//     const getTopRecord = (key) => {
//       return pagedLogs.reduce(
//         (max, current) => (current[key] > max[key] ? current : max),
//         pagedLogs[0],
//       );
//     };

//     return {
//       oee: getTopRecord("totalOee"),
//       availability: getTopRecord("availability"),
//       performance: getTopRecord("performance"),
//       quality: getTopRecord("quality"),
//     };
//   }, [pagedLogs]);

//   // Unique Assets from table data for Card 1 Dropdown
//   const availableAssetsForCard1 = useMemo(() => {
//     const assets = pagedLogs.map((item) => item.assetName).filter(Boolean);
//     return [...new Set(assets)];
//   }, [pagedLogs]);

//   // Unique Dates from table data for Card 2 Dropdown
//   const availableDatesForCard2 = useMemo(() => {
//     const dates = pagedLogs.map((item) => item.date).filter(Boolean);
//     return [...new Set(dates)];
//   }, [pagedLogs]);

//   // ================= CARD 1 CHART DATA =================
//   const card1ChartData = useMemo(() => {
//     if (!selectedCard1Asset) return [];
//     return pagedLogs.filter((item) => item.assetName === selectedCard1Asset);
//   }, [pagedLogs, selectedCard1Asset]);

//   const card1MinWidth = Math.max(100, card1ChartData.length * 80);

//   // ================= CARD 2 CHART DATA =================
//   const card2ChartData = useMemo(() => {
//     if (!selectedCard2Date) return [];

//     const dateLogs = pagedLogs.filter(
//       (item) => item.date === selectedCard2Date,
//     );

//     const grouped = {};
//     dateLogs.forEach((log) => {
//       const asset = log.assetName;
//       if (!grouped[asset]) {
//         grouped[asset] = {
//           assetName: asset,
//           totalOee: 0,
//           availability: 0,
//           performance: 0,
//           quality: 0,
//           count: 0,
//         };
//       }
//       grouped[asset].totalOee += log.totalOee || 0;
//       grouped[asset].availability += log.availability || 0;
//       grouped[asset].performance += log.performance || 0;
//       grouped[asset].quality += log.quality || 0;
//       grouped[asset].count += 1;
//     });

//     return Object.values(grouped).map((g) => ({
//       assetName: g.assetName,
//       totalOee: Number((g.totalOee / g.count).toFixed(1)),
//       availability: Number((g.availability / g.count).toFixed(1)),
//       performance: Number((g.performance / g.count).toFixed(1)),
//       quality: Number((g.quality / g.count).toFixed(1)),
//     }));
//   }, [pagedLogs, selectedCard2Date]);

//   const card2MinWidth = Math.max(100, card2ChartData.length * 100);

//   // Shared classes for table headers
//   const thLeftClass =
//     "px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white text-left";
//   const thCenterClass =
//     "px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white text-center";
//   const thRightClass =
//     "px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-white text-right";

//   return (
//     <div className="p-4 space-y-6 bg-slate-50 min-h-screen">
//       <PageHero eyebrow="Reports" title="OEE Summary" icon={Activity} />

//       {/* FILTER CARD */}
//       <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 w-full">
//         <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end relative">
//           <div className="col-span-1 relative">
//             <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
//               From Date
//             </label>
//             <div
//               onClick={() =>
//                 fromDateRef.current && fromDateRef.current.showPicker()
//               }
//               className="flex items-center justify-between border border-slate-200 px-3 py-1.5 text-xs rounded-lg bg-white cursor-pointer hover:border-blue-500/50 transition-all h-[34px]"
//             >
//               <span className="text-slate-800">
//                 {formatToDDMMYYYY(fromDate)}
//               </span>
//               <CalendarDays className="w-4 h-4 text-slate-500" />
//             </div>
//             <input
//               type="date"
//               ref={fromDateRef}
//               value={fromDate}
//               onChange={(e) => setFromDate(e.target.value)}
//               className="absolute w-0 h-0 opacity-0 pointer-events-none"
//             />
//           </div>

//           <div className="col-span-1 relative">
//             <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
//               To Date
//             </label>
//             <div
//               onClick={() =>
//                 toDateRef.current && toDateRef.current.showPicker()
//               }
//               className="flex items-center justify-between border border-slate-200 px-3 py-1.5 text-xs rounded-lg bg-white cursor-pointer hover:border-blue-500/50 transition-all h-[34px]"
//             >
//               <span className="text-slate-800">{formatToDDMMYYYY(toDate)}</span>
//               <CalendarDays className="w-4 h-4 text-slate-500" />
//             </div>
//             <input
//               type="date"
//               ref={toDateRef}
//               value={toDate}
//               onChange={(e) => setToDate(e.target.value)}
//               className="absolute w-0 h-0 opacity-0 pointer-events-none"
//             />
//           </div>

//           <div className="col-span-1 relative">
//             <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
//               Shift
//             </label>
//             <button
//               type="button"
//               onBlur={() => setIsShiftOpen(false)}
//               onClick={() => setIsShiftOpen(!isShiftOpen)}
//               className="flex w-full items-center justify-between border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-[34px] bg-white text-slate-700 transition-colors text-left capitalize"
//             >
//               <span className="truncate">
//                 {selectedShiftId
//                   ? shifts.find((s) => String(s.id) === String(selectedShiftId))
//                       ?.name || "All Shifts"
//                   : "All Shifts"}
//               </span>
//               <ChevronDown
//                 className={`w-3 h-3 text-slate-400 transition-transform ${isShiftOpen ? "rotate-180" : ""}`}
//               />
//             </button>

//             {isShiftOpen && (
//               <ul className="absolute z-[60] mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//                 <li
//                   onMouseDown={() => {
//                     setSelectedShiftId("");
//                     setIsShiftOpen(false);
//                   }}
//                   className="px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
//                 >
//                   All Shifts
//                 </li>
//                 {shifts.map((s) => (
//                   <li
//                     key={s.id}
//                     onMouseDown={() => {
//                       setSelectedShiftId(s.id);
//                       setIsShiftOpen(false);
//                     }}
//                     className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 capitalize ${String(selectedShiftId) === String(s.id) ? "bg-blue-50/50 font-bold text-blue-600" : "text-slate-700 font-medium"}`}
//                   >
//                     {s.name}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           <div className="col-span-1 relative">
//             <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
//               Asset
//             </label>
//             <button
//               type="button"
//               onBlur={() => setIsMainAssetOpen(false)}
//               onClick={() => setIsMainAssetOpen(!isMainAssetOpen)}
//               className="flex w-full items-center justify-between border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-[34px] bg-white text-slate-700 transition-colors text-left"
//             >
//               <span className="truncate">
//                 {selectedMachineId
//                   ? machines.find(
//                       (m) => String(m.id) === String(selectedMachineId),
//                     )?.name || "All Assets"
//                   : "All Assets"}
//               </span>
//               <ChevronDown
//                 className={`w-3 h-3 text-slate-400 transition-transform ${isMainAssetOpen ? "rotate-180" : ""}`}
//               />
//             </button>

//             {isMainAssetOpen && (
//               <ul className="absolute z-[60] mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//                 <li
//                   onMouseDown={() => {
//                     setSelectedMachineId("");
//                     setIsMainAssetOpen(false);
//                   }}
//                   className="px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
//                 >
//                   All Assets
//                 </li>
//                 {machines.map((m) => (
//                   <li
//                     key={m.id}
//                     onMouseDown={() => {
//                       setSelectedMachineId(m.id);
//                       setIsMainAssetOpen(false);
//                     }}
//                     className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${String(selectedMachineId) === String(m.id) ? "bg-blue-50/50 font-bold text-blue-600" : "text-slate-700 font-medium"}`}
//                   >
//                     {m.name}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           <div className="col-span-1">
//             <button
//               onClick={handleSearchClick}
//               disabled={loading}
//               className="bg-[#2B547E] hover:bg-[#1C3A5A] transition-colors text-white font-medium rounded-lg px-4 py-1.5 text-xs w-full disabled:opacity-70 h-[34px]"
//             >
//               {loading ? "Searching..." : "Search"}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* TOP SUMMARY HEADER & CARDS */}
//       <div className="w-full flex flex-col gap-3 mt-4">
//         <div className="flex items-center gap-3 mb-1">
//           <div className="h-5 w-1 bg-[#2B547E] rounded-full"></div>
//           <h2 className="text-[15px] font-bold text-slate-800 tracking-tight">
//             Top Performance Summary
//           </h2>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
//           {/* Highest OEE */}
//           <div className="relative overflow-hidden bg-white rounded-2xl p-4 border border-slate-100 shadow-md shadow-[#45C4B0]/15 hover:shadow-lg hover:shadow-[#45C4B0]/30 hover:-translate-y-1 transition-all duration-300">
//             <div className="absolute top-0 left-0 h-[3px] w-full bg-[#45C4B0]" />
//             <div className="flex justify-between items-start">
//               <div className="flex-1 min-w-0 pr-2">
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-[#45C4B0] truncate">
//                   OEE
//                 </p>
//                 <h2 className="text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
//                   {topMetrics.oee ? topMetrics.oee.totalOee : "0"}%
//                 </h2>
//                 <p className="text-[13px] font-semibold mt-1.5 text-slate-700 truncate">
//                   {topMetrics.oee
//                     ? topMetrics.oee.assetName
//                     : "No Data Available"}
//                 </p>
//                 <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
//                   {topMetrics.oee ? topMetrics.oee.date : "-"}
//                 </p>
//               </div>
//               <div className="w-10 h-10 rounded-xl bg-[#45C4B0]/10 border border-[#45C4B0]/20 flex items-center justify-center shrink-0">
//                 <TrendingUp className="w-5 h-5 text-[#45C4B0]" />
//               </div>
//             </div>
//           </div>

//           {/* Highest Availability */}
//           <div className="relative overflow-hidden bg-white rounded-2xl p-4 border border-slate-100 shadow-md shadow-[#D162C4]/15 hover:shadow-lg hover:shadow-[#D162C4]/30 hover:-translate-y-1 transition-all duration-300">
//             <div className="absolute top-0 left-0 h-[3px] w-full bg-[#D162C4]" />
//             <div className="flex justify-between items-start">
//               <div className="flex-1 min-w-0 pr-2">
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-[#D162C4] truncate">
//                   Availability
//                 </p>
//                 <h2 className="text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
//                   {topMetrics.availability
//                     ? topMetrics.availability.availability
//                     : "0"}
//                   %
//                 </h2>
//                 <p className="text-[13px] font-semibold mt-1.5 text-slate-700 truncate">
//                   {topMetrics.availability
//                     ? topMetrics.availability.assetName
//                     : "No Data Available"}
//                 </p>
//                 <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
//                   {topMetrics.availability ? topMetrics.availability.date : "-"}
//                 </p>
//               </div>
//               <div className="w-10 h-10 rounded-xl bg-[#D162C4]/10 border border-[#D162C4]/20 flex items-center justify-center shrink-0">
//                 <Clock className="w-5 h-5 text-[#D162C4]" />
//               </div>
//             </div>
//           </div>

//           {/* Highest Performance */}
//           <div className="relative overflow-hidden bg-white rounded-2xl p-4 border border-slate-100 shadow-md shadow-[#FF5E7E]/15 hover:shadow-lg hover:shadow-[#FF5E7E]/30 hover:-translate-y-1 transition-all duration-300">
//             <div className="absolute top-0 left-0 h-[3px] w-full bg-[#FF5E7E]" />
//             <div className="flex justify-between items-start">
//               <div className="flex-1 min-w-0 pr-2">
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-[#FF5E7E] truncate">
//                   Performance
//                 </p>
//                 <h2 className="text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
//                   {topMetrics.performance
//                     ? topMetrics.performance.performance
//                     : "0"}
//                   %
//                 </h2>
//                 <p className="text-[13px] font-semibold mt-1.5 text-slate-700 truncate">
//                   {topMetrics.performance
//                     ? topMetrics.performance.assetName
//                     : "No Data Available"}
//                 </p>
//                 <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
//                   {topMetrics.performance ? topMetrics.performance.date : "-"}
//                 </p>
//               </div>
//               <div className="w-10 h-10 rounded-xl bg-[#FF5E7E]/10 border border-[#FF5E7E]/20 flex items-center justify-center shrink-0">
//                 <Zap className="w-5 h-5 text-[#FF5E7E]" />
//               </div>
//             </div>
//           </div>

//           {/* Highest Quality */}
//           <div className="relative overflow-hidden bg-white rounded-2xl p-4 border border-slate-100 shadow-md shadow-[#5C9CE6]/15 hover:shadow-lg hover:shadow-[#5C9CE6]/30 hover:-translate-y-1 transition-all duration-300">
//             <div className="absolute top-0 left-0 h-[3px] w-full bg-[#5C9CE6]" />
//             <div className="flex justify-between items-start">
//               <div className="flex-1 min-w-0 pr-2">
//                 <p className="text-[11px] font-bold uppercase tracking-wider text-[#5C9CE6] truncate">
//                   Quality
//                 </p>
//                 <h2 className="text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
//                   {topMetrics.quality ? topMetrics.quality.quality : "0"}%
//                 </h2>
//                 <p className="text-[13px] font-semibold mt-1.5 text-slate-700 truncate">
//                   {topMetrics.quality
//                     ? topMetrics.quality.assetName
//                     : "No Data Available"}
//                 </p>
//                 <p className="text-[11px] font-medium text-slate-500 mt-0.5 truncate">
//                   {topMetrics.quality ? topMetrics.quality.date : "-"}
//                 </p>
//               </div>
//               <div className="w-10 h-10 rounded-xl bg-[#5C9CE6]/10 border border-[#5C9CE6]/20 flex items-center justify-center shrink-0">
//                 <ShieldCheck className="w-5 h-5 text-[#5C9CE6]" />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* CHARTS CONTAINER */}
//       <div className="grid grid-cols-1 gap-6 mt-4">
//         {/* LINE CHART CARD: OEE Trend */}
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 w-full flex flex-col">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
//               OEE Trend Analysis (%)
//             </h2>

//             <div className="relative w-48">
//               <button
//                 type="button"
//                 onBlur={() => setIsAssetOpen(false)}
//                 onClick={() => setIsAssetOpen(!isAssetOpen)}
//                 className="flex w-full items-center justify-between border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-[34px] bg-white text-slate-700 shadow-sm hover:border-slate-300 transition-colors"
//               >
//                 <span className="truncate font-semibold">
//                   {selectedCard1Asset || "Select Asset..."}
//                 </span>
//                 <ChevronDown
//                   className={`w-3 h-3 text-slate-400 transition-transform ${isAssetOpen ? "rotate-180" : ""}`}
//                 />
//               </button>

//               {isAssetOpen && (
//                 <ul className="absolute right-0 z-[60] mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//                   <li
//                     onMouseDown={() => {
//                       setSelectedCard1Asset("");
//                       setIsAssetOpen(false);
//                     }}
//                     className="px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
//                   >
//                     Select Asset...
//                   </li>
//                   {availableAssetsForCard1.map((assetName, idx) => (
//                     <li
//                       key={idx}
//                       onMouseDown={() => {
//                         setSelectedCard1Asset(assetName);
//                         setIsAssetOpen(false);
//                       }}
//                       className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${selectedCard1Asset === assetName ? "bg-blue-50/50 font-bold text-blue-600" : "text-slate-700 font-medium"}`}
//                     >
//                       {assetName}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </div>

//           <div className="h-[300px] w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//             {!selectedCard1Asset ? (
//               <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
//                 <span className="text-slate-400 text-sm font-medium">
//                   Please select an asset above to view trends
//                 </span>
//               </div>
//             ) : card1ChartData.length === 0 ? (
//               <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
//                 <span className="text-slate-400 text-sm font-medium">
//                   No Data Available for Selected Asset
//                 </span>
//               </div>
//             ) : (
//               <div
//                 style={{
//                   width: "100%",
//                   minWidth: `${card1MinWidth}px`,
//                   height: "100%",
//                 }}
//               >
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart
//                     data={card1ChartData}
//                     margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//                   >
//                     <CartesianGrid
//                       strokeDasharray="3 3"
//                       vertical={false}
//                       stroke="#E2E8F0"
//                     />
//                     <XAxis
//                       dataKey="xAxisLabel"
//                       tick={{ fontSize: 12, fill: "#64748B" }}
//                       axisLine={{ stroke: "#CBD5E1" }}
//                       tickLine={false}
//                     />
//                     <YAxis
//                       domain={[0, 100]}
//                       tick={{ fontSize: 12, fill: "#64748B" }}
//                       axisLine={false}
//                       tickLine={false}
//                     />
//                     <Tooltip
//                       contentStyle={{
//                         borderRadius: "8px",
//                         border: "none",
//                         boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
//                       }}
//                     />

//                     <Line
//                       hide={!visibleMetrics.totalOee}
//                       type="monotone"
//                       dataKey="totalOee"
//                       stroke="#45C4B0"
//                       strokeWidth={3}
//                       dot={{ r: 4 }}
//                       activeDot={{ r: 6 }}
//                     />
//                     <Line
//                       hide={!visibleMetrics.availability}
//                       type="monotone"
//                       dataKey="availability"
//                       stroke="#D162C4"
//                       strokeWidth={2}
//                     />
//                     <Line
//                       hide={!visibleMetrics.performance}
//                       type="monotone"
//                       dataKey="performance"
//                       stroke="#FF5E7E"
//                       strokeWidth={2}
//                     />
//                     <Line
//                       hide={!visibleMetrics.quality}
//                       type="monotone"
//                       dataKey="quality"
//                       stroke="#5C9CE6"
//                       strokeWidth={2}
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//           </div>

//           <div className="flex flex-wrap items-center justify-center gap-3 mt-6 border-t border-slate-100 pt-6">
//             <label
//               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer border transition-all shadow-sm ${visibleMetrics.totalOee ? "bg-[#45C4B0]/10 text-[#45C4B0] border-[#45C4B0]/30" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
//             >
//               <input
//                 type="checkbox"
//                 checked={visibleMetrics.totalOee}
//                 onChange={() => handleMetricToggle("totalOee")}
//                 className="rounded border-slate-300 text-[#45C4B0] focus:ring-[#45C4B0] h-3.5 w-3.5"
//               />
//               Total OEE
//             </label>
//             <label
//               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer border transition-all shadow-sm ${visibleMetrics.availability ? "bg-[#D162C4]/10 text-[#D162C4] border-[#D162C4]/30" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
//             >
//               <input
//                 type="checkbox"
//                 checked={visibleMetrics.availability}
//                 onChange={() => handleMetricToggle("availability")}
//                 className="rounded border-slate-300 text-[#D162C4] focus:ring-[#D162C4] h-3.5 w-3.5"
//               />
//               Availability
//             </label>
//             <label
//               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer border transition-all shadow-sm ${visibleMetrics.performance ? "bg-[#FF5E7E]/10 text-[#FF5E7E] border-[#FF5E7E]/30" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
//             >
//               <input
//                 type="checkbox"
//                 checked={visibleMetrics.performance}
//                 onChange={() => handleMetricToggle("performance")}
//                 className="rounded border-slate-300 text-[#FF5E7E] focus:ring-[#FF5E7E] h-3.5 w-3.5"
//               />
//               Performance
//             </label>
//             <label
//               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer border transition-all shadow-sm ${visibleMetrics.quality ? "bg-[#5C9CE6]/10 text-[#5C9CE6] border-[#5C9CE6]/30" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
//             >
//               <input
//                 type="checkbox"
//                 checked={visibleMetrics.quality}
//                 onChange={() => handleMetricToggle("quality")}
//                 className="rounded border-slate-300 text-[#5C9CE6] focus:ring-[#5C9CE6] h-3.5 w-3.5"
//               />
//               Quality
//             </label>
//           </div>
//         </div>

//         {/* BAR CHART CARD: Date-Wise Asset OEE Breakdown */}
//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 w-full flex flex-col">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
//               Date-Wise Asset OEE Breakdown
//             </h2>

//             <div className="relative w-48">
//               <button
//                 type="button"
//                 onBlur={() => setIsDateOpen(false)}
//                 onClick={() => setIsDateOpen(!isDateOpen)}
//                 className="flex w-full items-center justify-between border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-[34px] bg-white text-slate-700 shadow-sm hover:border-slate-300 transition-colors"
//               >
//                 <span className="truncate font-semibold">
//                   {selectedCard2Date || "Select Date..."}
//                 </span>
//                 <ChevronDown
//                   className={`w-3 h-3 text-slate-400 transition-transform ${isDateOpen ? "rotate-180" : ""}`}
//                 />
//               </button>

//               {isDateOpen && (
//                 <ul className="absolute right-0 z-[60] mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-xl max-h-40 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//                   <li
//                     onMouseDown={() => {
//                       setSelectedCard2Date("");
//                       setIsDateOpen(false);
//                     }}
//                     className="px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
//                   >
//                     Select Date...
//                   </li>
//                   {availableDatesForCard2.map((dateStr, idx) => (
//                     <li
//                       key={idx}
//                       onMouseDown={() => {
//                         setSelectedCard2Date(dateStr);
//                         setIsDateOpen(false);
//                       }}
//                       className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 ${selectedCard2Date === dateStr ? "bg-blue-50/50 font-bold text-blue-600" : "text-slate-700 font-medium"}`}
//                     >
//                       {dateStr}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </div>
//           </div>

//           <div className="h-[300px] w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//             {!selectedCard2Date ? (
//               <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
//                 <span className="text-slate-400 text-sm font-medium">
//                   Please select a date above to view breakdown
//                 </span>
//               </div>
//             ) : card2ChartData.length === 0 ? (
//               <div className="w-full h-full flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
//                 <span className="text-slate-400 text-sm font-medium">
//                   No Data Available for Selected Date
//                 </span>
//               </div>
//             ) : (
//               <div
//                 style={{
//                   width: "100%",
//                   minWidth: `${card2MinWidth}px`,
//                   height: "100%",
//                 }}
//               >
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={card2ChartData}
//                     margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
//                   >
//                     <CartesianGrid
//                       strokeDasharray="3 3"
//                       vertical={false}
//                       stroke="#E2E8F0"
//                     />
//                     <XAxis
//                       dataKey="assetName"
//                       tick={{ fontSize: 12, fill: "#64748B" }}
//                       axisLine={{ stroke: "#CBD5E1" }}
//                       tickLine={false}
//                       interval={0}
//                     />
//                     <YAxis
//                       domain={[0, 100]}
//                       tick={{ fontSize: 12, fill: "#64748B" }}
//                       axisLine={false}
//                       tickLine={false}
//                     />
//                     <Tooltip
//                       contentStyle={{
//                         borderRadius: "8px",
//                         border: "none",
//                         boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
//                       }}
//                       cursor={{ fill: "#f1f5f9" }}
//                     />

//                     <Bar
//                       hide={!visibleBarMetrics.totalOee}
//                       dataKey="totalOee"
//                       fill="#45C4B0"
//                       radius={[4, 4, 0, 0]}
//                       maxBarSize={40}
//                     />
//                     <Bar
//                       hide={!visibleBarMetrics.availability}
//                       dataKey="availability"
//                       fill="#D162C4"
//                       radius={[4, 4, 0, 0]}
//                       maxBarSize={40}
//                     />
//                     <Bar
//                       hide={!visibleBarMetrics.performance}
//                       dataKey="performance"
//                       fill="#FF5E7E"
//                       radius={[4, 4, 0, 0]}
//                       maxBarSize={40}
//                     />
//                     <Bar
//                       hide={!visibleBarMetrics.quality}
//                       dataKey="quality"
//                       fill="#5C9CE6"
//                       radius={[4, 4, 0, 0]}
//                       maxBarSize={40}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//           </div>

//           <div className="flex flex-wrap items-center justify-center gap-3 mt-6 border-t border-slate-100 pt-6">
//             <label
//               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer border transition-all shadow-sm ${visibleBarMetrics.totalOee ? "bg-[#45C4B0]/10 text-[#45C4B0] border-[#45C4B0]/30" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
//             >
//               <input
//                 type="checkbox"
//                 checked={visibleBarMetrics.totalOee}
//                 onChange={() => handleBarMetricToggle("totalOee")}
//                 className="rounded border-slate-300 text-[#45C4B0] focus:ring-[#45C4B0] h-3.5 w-3.5"
//               />
//               Total OEE
//             </label>
//             <label
//               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer border transition-all shadow-sm ${visibleBarMetrics.availability ? "bg-[#D162C4]/10 text-[#D162C4] border-[#D162C4]/30" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
//             >
//               <input
//                 type="checkbox"
//                 checked={visibleBarMetrics.availability}
//                 onChange={() => handleBarMetricToggle("availability")}
//                 className="rounded border-slate-300 text-[#D162C4] focus:ring-[#D162C4] h-3.5 w-3.5"
//               />
//               Availability
//             </label>
//             <label
//               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer border transition-all shadow-sm ${visibleBarMetrics.performance ? "bg-[#FF5E7E]/10 text-[#FF5E7E] border-[#FF5E7E]/30" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
//             >
//               <input
//                 type="checkbox"
//                 checked={visibleBarMetrics.performance}
//                 onChange={() => handleBarMetricToggle("performance")}
//                 className="rounded border-slate-300 text-[#FF5E7E] focus:ring-[#FF5E7E] h-3.5 w-3.5"
//               />
//               Performance
//             </label>
//             <label
//               className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer border transition-all shadow-sm ${visibleBarMetrics.quality ? "bg-[#5C9CE6]/10 text-[#5C9CE6] border-[#5C9CE6]/30" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
//             >
//               <input
//                 type="checkbox"
//                 checked={visibleBarMetrics.quality}
//                 onChange={() => handleBarMetricToggle("quality")}
//                 className="rounded border-slate-300 text-[#5C9CE6] focus:ring-[#5C9CE6] h-3.5 w-3.5"
//               />
//               Quality
//             </label>
//           </div>
//         </div>
//       </div>
//       {/* TABLE CARD */}
//       <div className="w-full rounded-xl shadow-sm border border-slate-200 overflow-hidden bg-white flex flex-col mt-2">
//         <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-white">
//           <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
//             OEE Data Records
//           </h2>
//           <CSVLink
//             data={pagedLogs}
//             filename={`OEE_Report_${fromDate}_to_${toDate}.csv`}
//           >
//             <button className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-emerald-200 shadow-sm">
//               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
//               Export CSV
//             </button>
//           </CSVLink>
//         </div>

//         {/* SCROLLABLE TABLE CONTAINER */}
//         <div className="overflow-auto max-h-[400px] relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//           <table className="min-w-full text-left border-collapse bg-white">
//             <thead className="sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
//               <tr>
//                 <th className={thLeftClass}>Date</th>
//                 <th className={thLeftClass}>Shift</th>
//                 <th className={thLeftClass}>Asset Name</th>
//                 <th className={thCenterClass}>Planned Target Qty</th>
//                 <th className={thCenterClass}>Total Produced Qty</th>
//                 <th className={thCenterClass}>OK Units</th>
//                 <th className={thCenterClass}>NOK Units</th>
//                 <th className={thCenterClass}>Planned Time (Mins)</th>
//                 <th className={thCenterClass}>Actual Op Time (Mins)</th>
//                 <th className={thRightClass}>Availability %</th>
//                 <th className={thRightClass}>Performance %</th>
//                 <th className={thRightClass}>Quality %</th>
//                 <th className={thRightClass}>Total OEE %</th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-slate-200">
//               {pagedLogs.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={13}
//                     className="text-center py-12 text-slate-400 text-sm font-medium"
//                   >
//                     No Data Found
//                   </td>
//                 </tr>
//               ) : (
//                 pagedLogs.map((log, i) => (
//                   <tr
//                     key={i}
//                     className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-none"
//                   >
//                     <td className="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
//                       {log.date}
//                     </td>
//                     <td className="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
//                       {log.shift}
//                     </td>
//                     <td className="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap">
//                       {log.assetName}
//                     </td>
//                     <td className="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap text-center">
//                       {log.plannedTargetQty}
//                     </td>
//                     <td className="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap text-center">
//                       {log.totalProducedQty}
//                     </td>
//                     <td className="px-6 py-4 text-sm font-semibold text-emerald-600 whitespace-nowrap text-center">
//                       {log.okUnits}
//                     </td>
//                     <td className="px-6 py-4 text-sm font-semibold text-red-500 whitespace-nowrap text-center">
//                       {log.nokUnits}
//                     </td>
//                     <td className="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap text-center">
//                       {log.plannedTimeMins}
//                     </td>
//                     <td className="px-6 py-4 text-sm font-semibold text-slate-800 whitespace-nowrap text-center">
//                       {log.actualOperatingTimeMins}
//                     </td>
//                     <td className="px-6 py-4 text-sm font-bold text-slate-800 whitespace-nowrap text-right">
//                       {log.availability}%
//                     </td>
//                     <td className="px-6 py-4 text-sm font-bold text-slate-800 whitespace-nowrap text-right">
//                       {log.performance}%
//                     </td>
//                     <td className="px-6 py-4 text-sm font-bold text-slate-800 whitespace-nowrap text-right">
//                       {log.quality}%
//                     </td>
//                     <td className="px-6 py-4 text-sm font-black text-blue-600 whitespace-nowrap text-right">
//                       {log.totalOee}%
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
