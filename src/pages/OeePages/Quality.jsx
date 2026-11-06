import React, { useState, useMemo, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, MoreVertical, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import PageHero from '../../components/PageHero';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, 
  LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Import your API functions
import { 
  getQualitySummary, 
  getTrendChart, 
  getDistributionChart 
} from '../../services/QualityService';
import { getDashboardMachines } from '../../services/dashboardService';

const FILTER_OPTIONS = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'Date', value: 'custom' },
];

// Helper to get local date in YYYY-MM-DD format
const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- FULLY DYNAMIC DATE HELPER (No hardcoded strings) ---
const formatISODateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Dynamically extract the exact time from the Date object
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const getDateRangeForFilter = (filter, customDateStr) => {
  // Create base dates and dynamically lock their internal clocks exactly to midnight local time
  let start = new Date();
  start.setHours(0, 0, 0, 0); 
  
  let end = new Date();
  end.setHours(0, 0, 0, 0);

  switch (filter) {
    case 'yesterday':
      start.setDate(start.getDate() - 1); 
      // end remains exactly at today's midnight
      break;
      
    case 'week':
      const dayOfWeek = start.getDay();
      const distanceToMonday = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      start.setDate(distanceToMonday);
      
      end = new Date(start);
      end.setDate(start.getDate() + 7); // Exactly 7 days later
      break;
      
    case 'month':
      // Dynamically create 1st day of month at midnight
      start = new Date(start.getFullYear(), start.getMonth(), 1, 0, 0, 0, 0);
      // Dynamically create 1st day of next month at midnight
      end = new Date(start.getFullYear(), start.getMonth() + 1, 1, 0, 0, 0, 0); 
      break;
      
    case 'custom':
      // Safely split the date so it doesn't accidentally shift timezones
      const [year, month, day] = customDateStr.split('-');
      start = new Date(year, month - 1, day, 0, 0, 0, 0);
      
      end = new Date(start);
      end.setDate(end.getDate() + 1); // Exactly 1 day later
      break;
      
    case 'today':
    default:
      // start is already today at midnight
      end.setDate(end.getDate() + 1); // Exactly tomorrow at midnight
      break;
  }

  return {
    startDateTime: formatISODateTime(start),
    endDateTime: formatISODateTime(end)
  };
};
// ------------------------------

export default function QualityDashboard() {
  const [filter, setFilter] = useState('today'); 
  const [customDate, setCustomDate] = useState(getTodayDate());

  // --- API INTEGRATION STATE ---
  const [machinesList, setMachinesList] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);

  // 1. Fetch Machines on Mount
  useEffect(() => {
    const loadMachines = async () => {
      const data = await getDashboardMachines();
      setMachinesList(data || []);
      if (data && data.length > 0) {
        setSelectedMachineId(data[0].assetId);
      }
    };
    loadMachines();
  }, []);

  // 2. Fetch Dashboard Data based on filters
  useEffect(() => {
    if (!selectedMachineId) return;

    const fetchData = async () => {
      // Calculate exact DateTimes based on dropdown selection
      const { startDateTime, endDateTime } = getDateRangeForFilter(filter, customDate);

      // Determine period strings for older chart APIs if they still need them
      let chartPeriod = 'week';
      if (filter === 'month') chartPeriod = 'month';

      const [summaryRes, trendRes, distRes] = await Promise.all([
        // Pass startDateTime and endDateTime to your updated API function
        getQualitySummary(selectedMachineId, startDateTime, endDateTime),
        
        // Passing the date for your charts (adjust arguments if you update these endpoints too)
        getTrendChart(selectedMachineId, chartPeriod, customDate),
        getDistributionChart(selectedMachineId, chartPeriod, customDate)
      ]);

      if (summaryRes) setSummaryData(summaryRes);
      if (trendRes?.chartData) setTrendData(trendRes.chartData);
      if (distRes?.chartData) setDistributionData(distRes.chartData);
    };

    fetchData();
  }, [selectedMachineId, filter, customDate]);

  // --- DERIVED CALCULATIONS ---
  const stats = useMemo(() => {
    const okCount = summaryData?.productionOutput?.totalOk || 0;
    const nokCount = summaryData?.productionOutput?.totalNok || 0;
    const total = okCount + nokCount;
    
    const yieldRate = summaryData?.overallQuality?.qualityPct || 0;
    const variance = summaryData?.overallQuality?.variance || 0;
    const varianceLabel = summaryData?.overallQuality?.varianceLabel || 'VS YESTERDAY';

    const okPercent = summaryData?.productionOutput?.okPct || 0;
    const nokPercent = summaryData?.productionOutput?.nokPct || 0;

    return { total, okCount, nokCount, yieldRate, okPercent, nokPercent, variance, varianceLabel };
  }, [summaryData]);

  // --- CHART FORMATTING LOGIC ---
  const formatChartData = (data, currentFilter) => {
    if (!data || data.length === 0) return [];
    
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA - dateB;
    });

    return sortedData.map(item => {
      const dateStr = item.date;
      let axisLabel = item.dayOfWeek;
      let tooltipLabel = item.dayOfWeek;

      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); 
          const dayNameLong = d.toLocaleDateString('en-US', { weekday: 'long' }); 
          const dateNum = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); 
          const yearNum = d.getFullYear(); 
          
          axisLabel = (currentFilter === 'month' || currentFilter === 'custom') ? dateNum : dayName;          
          tooltipLabel = `${dayNameLong}, ${dateNum}, ${yearNum}`;
        }
      }
      return { ...item, axisLabel, tooltipLabel };
    });
  };

  const maxChartDays = filter === 'month' ? -15 : -7;
  const formattedTrendData = formatChartData(trendData, filter).slice(maxChartDays);
  const formattedDistributionData = formatChartData(distributionData, filter).slice(maxChartDays);
  
  return (
    <div className="space-y-6 pb-8">
      
      {/* 1. HEADER */}
      <PageHero
        eyebrow="Dashboard"
        title="Machine Quality"
        description="Monitor real-time yield rates, track OK/NOK production, and log defect reasons."
        icon={ShieldCheck}
      />

      {/* 2. ACTIONS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Quality Actions</p>
          <p className="text-sm text-slate-600">Filter quality records and defect analysis.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* DYNAMIC FILTER DROPDOWN */}
          <div className="relative">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white outline-none cursor-pointer text-slate-700 font-medium"
            >
              {FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* CONDITIONAL DATE PICKER */}
          {filter === 'custom' && (
            <input 
              type="date" 
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:border-[#1c75bc] text-slate-700"
            />
          )}

         {/* EXACT MACHINE DROPDOWN */}
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
        </div>
      </div>

      {/* 3. DASHBOARD CONTENT GRID */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* ROW 1: KPIs */}
        {/* Overall Quality */}
<div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 flex flex-col min-h-[250px]">         
 <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-700">
              OVERALL QUALITY
            </h3>
            <MoreVertical size={16} className="text-slate-400 cursor-pointer" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative mt-2">
            <div className="w-44 h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={[
                      { name: 'Yield', value: Number(stats.yieldRate) || 0 }, 
                      { name: 'Remaining', value: Math.max(0, 100 - (Number(stats.yieldRate) || 0)) }
                    ]} 
                    cx="50%" cy="50%" 
                    innerRadius={65} outerRadius={80} 
                    dataKey="value" stroke="none" cornerRadius={5}
                  >
                    <Cell fill="#1c75bc" />
                    <Cell fill="#f1f5f9" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {/* Main Yield Number */}
                <span className="text-4xl font-extrabold text-slate-800 leading-tight">
                  {stats.yieldRate}%
                </span>
                
                {/* 🔥 DYNAMIC ARROW LOGIC MATCHING IMAGE REFERENCE */}
                {(() => {
                  const varianceValue = Number(stats.variance);
                  if (varianceValue > 0) {
                    return (
                      <span className="text-sm text-emerald-500 font-semibold flex items-center mt-1">
                        <ArrowUp size={16} className="mr-0.5 stroke-[3]"/> {varianceValue}%
                      </span>
                    );
                  }
                  if (varianceValue < 0) {
                    return (
                      <span className="text-sm text-rose-500 font-semibold flex items-center mt-1">
                        <ArrowDown size={16} className="mr-0.5 stroke-[3]"/> {Math.abs(varianceValue)}%
                      </span>
                    );
                  }
                  return (
                    <span className="text-sm text-slate-400 font-semibold flex items-center mt-1">
                      <Minus size={16} className="mr-0.5 stroke-[3]"/> 0%
                    </span>
                  );
                })()}

                {/* Variance Label underneath the arrow */}
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  {stats.varianceLabel}
                </span>

              </div>
            </div>
            <div className="text-xs font-semibold text-slate-500 mt-6 uppercase tracking-wider">Current Quality %</div>
          </div>
        </div>

        {/* Production Output */}
<div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 flex flex-col min-h-[250px]">          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-700">
              PRODUCTION OUTPUT (OK / NOK)
            </h3>
          </div>
          <div className="flex-1 flex flex-col justify-between mt-2 px-1">
            
            <div className="flex justify-between items-center gap-4 mb-6 mt-2">
              <div className="flex-1 flex flex-col items-center justify-center bg-emerald-50/80 border border-emerald-100 rounded-xl py-4 shadow-sm">
                <span className="text-4xl font-black text-emerald-600 tracking-tight">{stats.okCount}</span>
                <span className="text-[10px] font-bold text-emerald-700/80 uppercase mt-1 tracking-wider">Total OK</span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center bg-rose-50/80 border border-rose-100 rounded-xl py-4 shadow-sm">
                <span className="text-4xl font-black text-rose-600 tracking-tight">{stats.nokCount}</span>
                <span className="text-[10px] font-bold text-rose-700/80 uppercase mt-1 tracking-wider">Total NOK</span>
              </div>
            </div>

            <div className="w-full mt-auto">
              <div className="flex justify-between items-end mb-3">
                <span className="text-xs font-bold text-white bg-emerald-500 shadow-sm shadow-emerald-200 px-2.5 py-1 rounded-md">{stats.okPercent}% OK</span>
                <span className="text-xs font-bold text-white bg-rose-500 shadow-sm shadow-rose-200 px-2.5 py-1 rounded-md">{stats.nokPercent}% NOK</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
                <div style={{ width: `${stats.okPercent}%` }} className="bg-emerald-500 h-full transition-all duration-500"></div>
                <div style={{ width: `${stats.nokPercent}%` }} className="bg-rose-500 h-full transition-all duration-500"></div>
              </div>
            </div>

          </div>
        </div>

        {/* ROW 3 - CHARTS CONNECTED TO API (Using Formatted Data) */}
        
        {/* Trend Chart */}
        <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 flex flex-col min-h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase text-slate-700">Performance vs. Quality Trend</h3>
            <MoreVertical size={16} className="text-slate-400 cursor-pointer" />
          </div>
          <div className="flex-1 w-full min-h-[250px]">
            {formattedTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="axisLabel" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748B', fontWeight: 500}} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B', fontWeight: 500}} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B', fontWeight: 500}} />
                  <Tooltip 
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.tooltipLabel || label}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}/>
                  <Line yAxisId="left" type="monotone" dataKey="performancePct" stroke="#1c75bc" strokeWidth={3} dot={{r:4, strokeWidth: 2, fill: '#fff'}} name="Performance %" />
                  <Line yAxisId="right" type="monotone" dataKey="qualityPct" stroke="#10b981" strokeWidth={3} dot={{r:4, strokeWidth: 2, fill: '#fff'}} name="Quality %" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">No trend data available</div>
            )}
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 flex flex-col min-h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase text-slate-700">Day-wise OK/NOK Distribution</h3>
            <MoreVertical size={16} className="text-slate-400 cursor-pointer" />
          </div>
          <div className="flex-1 w-full min-h-[250px]">
            {formattedDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="axisLabel" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748B', fontWeight: 500}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B', fontWeight: 500}} />
                  <Tooltip 
                    cursor={{ fill: '#F1F5F9' }} 
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.tooltipLabel || label}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}/>
                  <Bar dataKey="okParts" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} name="OK Parts" />
                  <Bar dataKey="nokParts" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={30} name="NOK Parts" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">No distribution data available</div>
            )}
          </div>
        </div>

      </div>
    </div>                
  );
}