import { useNavigate } from 'react-router-dom';
import PageHero from '../components/PageHero';
import { BarChart2, CheckCircle2, Download, Calendar } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import React, { useState, useEffect } from 'react';
// NEW: Import WebSocket libraries
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

import { 
  getDashboardMachines, getKpiSummary, getPerformanceTrend, 
  getTopMachines, getInsights 
} from '../services/dashboardService';
import { API_BASE_URL, WS_BASE_URL } from '../config/apiConfig';



// ── HELPERS ──
const MachineIcon = () => (
  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="14" rx="2" strokeWidth="2"/>
    <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" strokeWidth="2"/>
    <line x1="12" y1="12" x2="12" y2="16" strokeWidth="2"/>
    <line x1="8" y1="14" x2="16" y2="14" strokeWidth="2"/>
  </svg>
);

const getMachineColor = (oee) => {
  if (oee >= 75) return "#22c55e"; 
  if (oee >= 60) return "#f59e0b"; 
  if (oee >= 45) return "#f97316"; 
  return "#ef4444";                
};

function DonutChart({ data, innerRadius = 52, outerRadius = 72, label, subLabel, size = 160 }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <PieChart width={size} height={size}>
        <Pie data={data} cx={size / 2} cy={size / 2} innerRadius={innerRadius} outerRadius={outerRadius}
          dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-gray-800 leading-tight">{label}</span>
        {subLabel && <span className="text-[10px] text-gray-500 text-center leading-tight mt-0.5">{subLabel}</span>}
      </div>
    </div>
  );
}

export default function PerformanceDashboard() {
  const navigate = useNavigate();
  
  // ── STATES ──
  const [machinesList, setMachinesList] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState("");
  const [kpiData, setKpiData] = useState(null);
  const [period, setPeriod] = useState("weekly");
  const [trendData, setTrendData] = useState([]);
  const [topMachinesData, setTopMachinesData] = useState([]); 
  const [insightsData, setInsightsData] = useState(null); 
  
  // NEW: A trigger state to force API refetches when WS messages arrive
  const [lastUpdate, setLastUpdate] = useState(Date.now());

 const getTodayDate = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Only store the value, no need for a 'set' function since it can't change
  const [selectedDate] = useState(getTodayDate());

  // 🔥 NEW LOGIC: Only send the date to the API if it's a PAST date
  const isHistorical = selectedDate !== getTodayDate();
  const apiDateParam = isHistorical ? selectedDate : null;

  

  // ── WEBSOCKET CONNECTION ──
 // ── WEBSOCKET CONNECTION ──
  useEffect(() => {
    if (!selectedMachineId) return;

    // Correctly initialize the socket
    const socket = new SockJS(`${WS_BASE_URL}/ws/dashboard`);

    // Pass the socket object here
    const stompClient = new Client({
      webSocketFactory: () => socket, 
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log("Connected to Live Dashboard WebSocket");
        stompClient.subscribe('/topic/oee-updates', (message) => {
          if (message.body) {
            const liveData = JSON.parse(message.body);
            if (String(liveData.assetId) === String(selectedMachineId)) {

             if (!isHistorical) {
                console.log("Live update received. Refreshing...");
                setLastUpdate(Date.now()); 
              }
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker error: ' + frame.headers['message']);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [selectedMachineId,isHistorical]); // Correctly re-subscribes if machine changes
  // Machine Dropdown Loads
  useEffect(() => {
    const loadMachines = async () => {
      const data = await getDashboardMachines();
      setMachinesList(data);
      if (data && data.length > 0) {
        setSelectedMachineId(data[0].assetId);
      }
    };
    loadMachines();
  }, []);

  // Top Machines Load
 // Top Machines Load
  useEffect(() => {
    const fetchTopMachines = async () => {
      const data = await getTopMachines(apiDateParam); 
      
      console.log("Top Machines from Backend:", data); // Check your console!

      // Safety check: Ensure it's an array. If the backend wraps it in an object (e.g. data.content or data.data), extract it.
      if (Array.isArray(data)) {
        setTopMachinesData(data);
      } else if (data && data.data && Array.isArray(data.data)) {
        setTopMachinesData(data.data);
      } else {
        setTopMachinesData([]); 
      }
    };
    fetchTopMachines();
  }, [lastUpdate, apiDateParam]); // 🚨 ADDED apiDateParam HERE

  // Cards Load
  // Cards Load
  useEffect(() => {
    const fetchKpis = async () => {
      if (selectedMachineId) {
        // ✅ CORRECT: Only pass assetId and apiDateParam
        const data = await getKpiSummary(selectedMachineId, apiDateParam);
        setKpiData(data);
      }
    };
    fetchKpis();
  }, [selectedMachineId, apiDateParam, lastUpdate]); // Update dependencies


  // Trend Data Fetch
 // Trend Data Fetch
  useEffect(() => {
    const fetchTrend = async () => {
      if (selectedMachineId) {
        // ✅ CORRECT: Removed the extra argument
        const data = await getPerformanceTrend(selectedMachineId, period, apiDateParam);
        const formattedData = data.map(item => ({ date: item.date, val: item.oee }));
        setTrendData(formattedData);
      }
    };
    fetchTrend();
  }, [selectedMachineId, period, apiDateParam, lastUpdate]);
  // Insights Load
  useEffect(() => {
    const fetchInsights = async () => {
      if (selectedMachineId) {
        const data = await getInsights(selectedMachineId,apiDateParam);
        setInsightsData(data);
      }
    };
    fetchInsights();
  }, [selectedMachineId, lastUpdate,apiDateParam]); // Added lastUpdate


  // --- CALCULATE SUMMARY METRICS DYNAMICALLY ---
  const trendMetrics = {
    best: trendData.length > 0 ? Math.max(...trendData.map(d => d.val)).toFixed(1) : "0",
    average: trendData.length > 0 
      ? (trendData.reduce((acc, curr) => acc + curr.val, 0) / trendData.length).toFixed(1) 
      : "0",
    lowest: trendData.length > 0 ? Math.min(...trendData.map(d => d.val)).toFixed(1) : "0"
  };

  // ── DYNAMIC DOWNTIME MAPPING ──
  // const getDowntimeConfig = (key) => {
  //   const configs = {
  //     breakdownPct: { label: "Breakdown", color: "#DC2626", bg: "bg-red-100" },
  //     setupPct: { label: "Setup", color: "#F59E0B", bg: "bg-amber-100" },
  //     waitingPct: { label: "Waiting", color: "#F97316", bg: "bg-orange-100" },
  //     materialPct: { label: "Material", color: "#10B981", bg: "bg-emerald-100" },
  //     othersPct: { label: "Others", color: "#64748B", bg: "bg-slate-100" }
  //   };
  //   return configs[key] || { 
  //     label: key.replace('Pct', '').charAt(0).toUpperCase() + key.replace('Pct', '').slice(1), 
  //     color: "#94a3b8", 
  //     bg: "bg-slate-100" 
  //   };
  // };

  console.log("Backend Categories Data:", kpiData?.downtimeAnalysis?.topCategories);
 const dynamicDowntimeData = kpiData?.downtimeAnalysis?.topCategories?.length > 0
    ? kpiData.downtimeAnalysis.topCategories.map(cat => ({
        label: cat.categoryName,
        value: cat.percentage || 0,
        color: cat.color || "#cbd5e1",
      }))
    : [{ label: "No Data", value: 100, color: "#f1f5f9" }]; // Draws a light gray circle when empty

 const oeeMetrics = [
    { label: "Availability", value: kpiData?.oeeOverview?.availability || 0, color: "#3B82F6" },
    { label: "Performance", value: kpiData?.oeeOverview?.performance || 0, color: "#10B981" },
    { label: "Quality", value: kpiData?.oeeOverview?.quality || 0, color: "#F59E0B" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      <div className="p-4 space-y-4">

        {/* ── HEADER ── */}
        <PageHero
          title="Dashboard"
          description="Monitor real-time overall equipment effectiveness, availability, and downtime trends."
          icon={BarChart2}
        />
  
       {/* ── ACTIONS BAR ── */}
       {/* ── ACTIONS BAR ── */}
<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
  <div>
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Performance Actions</p>
    <p className="text-xs text-gray-500">Filter and export performance data.</p>
  </div>
  <div className="flex items-center gap-2">
    
    {/* ADDED THIS BACK: Locked Date Box */}
    <input 
      type="date"
      value={selectedDate}
      readOnly
      disabled
      className="border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 text-xs font-medium text-gray-500 cursor-not-allowed outline-none"
    />
    
   <select 
      value={selectedMachineId}
      onChange={(e) => setSelectedMachineId(e.target.value)}
      className="border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 outline-none cursor-pointer"
    >
      {machinesList.length === 0 ? (
        <option value="" disabled>Loading...</option>
      ) : (
        machinesList.map((machine) => (
          <option key={machine.assetId} value={machine.assetId}>
            {machine.machineName}
          </option>
        ))
      )}
    </select>
    <button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-1.5 text-xs font-semibold transition">
      <Download size={14} /> Export
    </button>
  </div>
</div>

       {/* ── PREMIUM KPI CARDS ── */}
        <div className="grid grid-cols-5 gap-5">
          {/* Overall Performance */}
          {/* Overall Performance */}
<div className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
  <div className="absolute top-0 left-0 h-1 w-full bg-blue-500" />
  <div className="flex justify-between items-start">
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
        Overall Performance
      </p>
      {/* Added || 0 to fix the missing number */}
      <h2 className="text-5xl font-extrabold text-slate-900 mt-2">
        {kpiData?.overallPerformance?.currentOeePct || 0}%
      </h2>
      {(() => {
        const varianceValue = Number(kpiData?.overallPerformance?.varianceVsYesterday) || 0;
        
        if (varianceValue > 0) {
          return (
            <p className="text-xs font-medium mt-1 text-emerald-500">
              ▲ {varianceValue}% vs yesterday
            </p>
          );
        } 
        
        if (varianceValue < 0) {
          return (
            <p className="text-xs font-medium mt-1 text-red-500">
              ▼ {Math.abs(varianceValue)}% vs yesterday
            </p>
          );
        }

        return (
          <p className="text-xs font-medium mt-1 text-slate-400">
            - 0% vs yesterday
          </p>
        );
      })()}
    </div>
    <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeWidth="2"/>
        <polyline points="17 6 23 6 23 12" strokeWidth="2"/>
      </svg>
    </div>
  </div>
  <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
    <div 
      className="h-full rounded-full transition-all duration-1000" 
      style={{ 
        // Added || 0 to prevent the CSS width from breaking
        width: `${kpiData?.overallPerformance?.currentOeePct || 0}%`,
        backgroundColor: getMachineColor(kpiData?.overallPerformance?.currentOeePct || 0)
      }}
    />
  </div>
</div>
          
          {/* Planned Production */}
          <div className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                  Planned Production
                </p>
                <h2 className="text-5xl font-extrabold text-slate-900 mt-2">
                  {kpiData ? kpiData.plannedProduction.plannedPct : 0}%
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Active Production Assets
                </p>
                <p className="text-xs text-slate-400 mt-1 font-semibold text-slate-600">
                  {kpiData ? kpiData.plannedProduction.plannedMinutes : '...'} mins
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <MachineIcon />
              </div>
            </div>
          </div>

          {/* Productive Time */}
          <div className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-emerald-600">
                  Productive Time
                </p>
                <h2 className="text-5xl font-extrabold text-slate-900 mt-2">
                  {kpiData ? kpiData.productiveTime.productivePct : 0}%
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Machine Running Time
                </p>
                <p className="text-xs text-slate-400 mt-1 font-semibold text-slate-600">
                  {kpiData ? kpiData.productiveTime.productiveMinutes : '...'} mins
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <polyline points="12 6 12 12 16 14" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Downtime */}
          <div className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 left-0 h-1 w-full bg-amber-500" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-amber-600">
                  Downtime
                </p>
                <h2 className="text-5xl font-extrabold text-slate-900 mt-2">
                  {kpiData ? kpiData.downtime.downtimePct : 0}%
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Equipment Idle Time
                </p>
                <p className="text-xs text-slate-400 mt-1 font-semibold text-slate-600">
                  {kpiData ? kpiData.downtime.downtimeMinutes : '...'} mins
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <polyline points="12 6 12 12 16 14" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Loss */}
          <div className="relative overflow-hidden bg-white rounded-3xl p-5 border border-slate-200 shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 left-0 h-1 w-full bg-red-500" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-red-600">
                  Production Loss
                </p>
                <h2 className="text-5xl font-extrabold text-slate-900 mt-2">
                  {kpiData ? kpiData.productionLoss.lossPct : 0}%
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Performance Loss
                </p>
                {/* <p className="text-xs text-slate-400 mt-1 font-semibold text-slate-600">
                  {kpiData ? kpiData.productionLoss.lossMinutes : '...'} mins
                </p> */}
              </div>
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="18" y1="20" x2="18" y2="10" strokeWidth="2"/>
                  <line x1="12" y1="20" x2="12" y2="4" strokeWidth="2"/>
                  <line x1="6" y1="20" x2="6" y2="14" strokeWidth="2"/>
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* ── ROW 2: OEE Overview + Downtime Analysis ── */}
        <div className="grid grid-cols-2 gap-5 mb-5">
          
          {/* OEE Overview */}
          <div className="
            bg-gradient-to-br
            from-emerald-50
            via-white
            to-white
            rounded-3xl
            p-6
            border-t-4
            border-emerald-500
            border
            border-emerald-100
            shadow-[0_10px_30px_rgba(16,185,129,0.08)]
          ">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">
                  OEE Overview
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Availability × Performance × Quality
                </p>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                Production Healthy
              </div>
            </div>

           <div className="grid grid-cols-[220px_1fr] gap-8 items-center">
  {/* OEE Circle - Upgraded to SVG */}
  <div className="flex justify-center">
    <div className="relative w-56 h-56 flex items-center justify-center mx-auto shadow-[0_25px_60px_rgba(16,185,129,0.15)] rounded-full">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        {/* Background Track */}
        <path
          className="text-emerald-50"
          strokeWidth="3.5"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        {/* Dynamic Filled Bar */}
        <path
          className="text-emerald-500"
          strokeWidth="3.5"
          strokeDasharray={`${kpiData?.oeeOverview?.overallOee || 0}, 100`}
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col justify-center items-center">
        <span className="text-5xl font-black text-slate-900">
          {kpiData?.oeeOverview?.overallOee || 0}%
        </span>
        <span className="text-sm font-medium text-slate-500 mt-1">
          Overall OEE
        </span>
      </div>
    </div>
  </div>

  {/* Metrics (Availability, Performance, Quality) */}
  <div>
    <div className="space-y-5">
      {oeeMetrics.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between mb-2">
            <span className="font-medium text-slate-700">
              {item.label}
            </span>
            <span className="font-bold" style={{ color: item.color }}>
              {item.value || 0}%
            </span>
          </div>
          <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner border border-slate-100">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${item.value || 0}%`, // Added || 0 to prevent CSS breaking
                background: item.color
              }}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
          </div>

          {/* DOWNTIME ANALYSIS */}
         {/* DOWNTIME ANALYSIS */}
<div className="bg-gradient-to-br from-red-50 via-white to-white rounded-3xl p-6 border-t-4 border-red-500 border border-red-100 shadow-[0_10px_30px_rgba(220,38,38,0.08)]">
  <div className="flex justify-between items-center mb-6">
    <div>
      <h2 className="font-bold text-slate-800 text-lg">Downtime Analysis</h2>
      <p className="text-xs text-slate-500">Top 5 breakdown categories</p>
    </div>
    <div className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold">
      {kpiData?.downtimeAnalysis?.totalDowntimeMinutes || 0} mins
    </div>
  </div>

  <div className="grid grid-cols-[190px_1fr] gap-4 items-center">
    <div className="flex justify-center items-center">
      <DonutChart
        data={dynamicDowntimeData}
        label={`${kpiData?.downtime?.downtimePct || 0}%`}
        subLabel="Downtime"
        size={190}
        innerRadius={55}
        outerRadius={80}
      />
    </div>
    
    <div className="flex-1 space-y-2">
      {dynamicDowntimeData.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl px-3 py-1.5 border border-slate-100 flex items-center justify-between shadow-sm"    
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: item.color }} // Uses the color from the API
            />
            <span className="font-medium text-slate-700 text-sm">
              {item.label}
            </span>
          </div>
          <div
            className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100"
            style={{ color: item.color }}
          >
            {item.value}%
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
</div>

        {/* ── ROW 3: Performance Trend + Top Machines ── */}
        <div className="grid grid-cols-12 gap-5 mb-5">

          {/* PERFORMANCE TREND */}
          <div className="col-span-8 bg-gradient-to-br from-indigo-50 via-white to-white rounded-3xl p-5 border border-indigo-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">Performance Trend</h2>
                <p className="text-xs text-slate-500">Production efficiency trend</p>
              </div>

              <select 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                className="text-xs border rounded-xl px-3 py-2 outline-none cursor-pointer"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="val"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Best</p>
                <h3 className="text-xl font-bold text-emerald-600">
                  {trendMetrics.best}%
                </h3>
              </div>
              <div className="bg-indigo-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Average</p>
                <h3 className="text-xl font-bold text-indigo-600">
                  {trendMetrics.average}%
                </h3>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500">Lowest</p>
                <h3 className="text-xl font-bold text-red-600">
                  {trendMetrics.lowest}%
                </h3>
              </div>
            </div>
          </div>

          {/* TOP MACHINES */}
          <div className="col-span-4 bg-gradient-to-br from-emerald-50 via-white to-white rounded-3xl p-5 border border-emerald-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="font-bold text-slate-800 text-lg">
                  Top Machines
                </h2>
                <p className="text-xs text-slate-500">
                  Ranked by productivity
                </p>
              </div>
            </div>

            {topMachinesData.length > 0 && (
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl p-4 text-white mb-4">
                <p className="text-xs opacity-80">
                  Best Machine
                </p>
                <div className="flex justify-between mt-2">
                  <div>
                    <h3 className="font-bold text-lg">
                      {topMachinesData[0].machineName}
                    </h3>
                    <p className="text-xs opacity-80">
                      Highest productivity
                    </p>
                  </div>
                  <span className="text-4xl font-black">
                    {topMachinesData[0].currentOee}%
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {topMachinesData.map((m) => {
                const machineColor = getMachineColor(m.currentOee);
                return (
                  <div key={m.assetId}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-sm">
                        #{m.rank} {m.machineName}
                      </span>
                      <span className="font-bold text-sm">
                        {m.currentOee}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${m.currentOee}%`,
                          background: machineColor
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* ── ROW 4: Insights & Recommendations ── */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-800 text-lg mb-5">
            Insights & Recommendations
          </h2>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-red-50 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-2">🕐</div>
                <h3 className="font-semibold mb-1">{insightsData?.reduceDowntime?.title || "Reduce Downtime"}</h3>
                <p className="text-xs text-gray-600 mb-3">
                  {insightsData?.reduceDowntime?.message || "Loading recommendations..."}
                </p>
              </div>
              <button
                onClick={() => navigate("/masters/Availability")}
                className="text-xs bg-red-500 text-white px-3 py-2 rounded-lg w-fit"
              >
                View Report
              </button>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-2">📈</div>
                <h3 className="font-semibold mb-1">{insightsData?.improvePerformance?.title || "Improve Performance"}</h3>
                <p className="text-xs text-gray-600 mb-3">
                  {insightsData?.improvePerformance?.message || "Loading recommendations..."}
                </p>
              </div>
              <button
                onClick={() => navigate("/masters/Performance")}
                className="text-xs bg-emerald-500 text-white px-3 py-2 rounded-lg w-fit"
              >
                View Analysis
              </button>
            </div>

            <div className="bg-amber-50 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-2">⭐</div>
                <h3 className="font-semibold mb-1">{insightsData?.improveQuality?.title || "Improve Quality"}</h3>
                <p className="text-xs text-gray-600 mb-3">
                  {insightsData?.improveQuality?.message || "Loading recommendations..."}
                </p>
              </div>
              <button
                onClick={() => navigate("/masters/Quality")}
                className="text-xs bg-amber-500 text-white px-3 py-2 rounded-lg w-fit"
              >
                Quality Report
              </button>
            </div>

            <div className="bg-blue-50 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold mb-1">{insightsData?.dailyTarget?.title || "Daily Target"}</h3>
                <p className="text-xs text-gray-600 mb-3">
                  {insightsData?.dailyTarget?.message || "Loading recommendations..."}
                </p>
              </div>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden w-full">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                  style={{width: `${insightsData?.dailyTarget?.currentVal || 0}%`}}
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}