import React, { useState, useEffect } from 'react';
import { BarChart2, CheckCircle2, MoreVertical, TrendingDown, ArrowUp, ChevronDown, ArrowDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PageHero from '../../components/PageHero';
import { 
  getPerformanceSummary,
  getPerformanceTrend,
  getAvailabilityVsPerformance 
} from '../../services/PerformanceService'; 
import { getDashboardMachines} from '../../services/dashboardService';

// --- NEW DATE HELPER LOGIC (Hardcoded to 00:00:00) ---
// --- FULLY DYNAMIC DATE HELPER ---
const formatISODateTime = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Dynamically extract the exact time from the Date object (No hardcoded strings)
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
      
    case 'weekly':
      const dayOfWeek = start.getDay();
      const distanceToMonday = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      start.setDate(distanceToMonday);
      
      end = new Date(start);
      end.setDate(start.getDate() + 7); // Exactly 7 days later
      break;
      
    case 'monthly':
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
export default function Performance() {
  const FILTER_OPTIONS = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'weekly' },
    { label: 'This Month', value: 'monthly' },
    { label: 'Date', value: 'custom' },
  ];

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [filter, setFilter] = useState('today'); 
  const [customDate, setCustomDate] = useState(getTodayDate());
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  
  // States for all API data
  const [summaryData, setSummaryData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);

  // Fetch Machines on Mount
  useEffect(() => {
    const fetchMachines = async () => {
      const data = await getDashboardMachines();
      setMachines(data || []);
      if (data && data.length > 0) {
        setSelectedMachine(data[0].assetId); 
      }
    };
    fetchMachines();
  }, []);

  // Fetch All Dashboard Data when machine or filters change
  useEffect(() => {
    const fetchAllData = async () => {
      if (!selectedMachine) return;
      
      setSummaryData(null);
      setTrendData([]);
      setComparisonData([]);
      
      const chartPeriod = filter === 'monthly' ? 'monthly' : 'weekly';      
      
      // Calculate exact DateTimes based on dropdown selection
      const { startDateTime, endDateTime } = getDateRangeForFilter(filter, customDate);

      const [summaryRes, trendRes, comparisonRes] = await Promise.all([
        // Pass the dynamically calculated start and end times to the summary endpoint
        getPerformanceSummary(selectedMachine, startDateTime, endDateTime),
        
        // Left these exactly as they were per your instructions
        getPerformanceTrend(selectedMachine, chartPeriod, customDate),
        getAvailabilityVsPerformance(selectedMachine, chartPeriod, customDate)
      ]);

      setSummaryData(summaryRes || null);
      setTrendData(trendRes?.chartData || []);
      setComparisonData(comparisonRes?.chartData || []);
    };
    
    fetchAllData();
  }, [selectedMachine, filter, customDate]);

  const c1 = summaryData?.card1_OverallPerformance || {};
  const c2 = summaryData?.card2_PerformanceLoss || {};
  const c3 = summaryData?.card3_ComparisonSummary || {};

  // 🔥 UPDATED HELPER: Sorts data first, and grabs the day number
  const formatChartData = (data, currentFilter) => {
    if (!data || data.length === 0) return [];
    
    // 1. Sort the data chronologically to fix the "repeating dates" issue
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.oeeDate || a.date || a.createdDate);
      const dateB = new Date(b.oeeDate || b.date || b.createdDate);
      return dateA - dateB;
    });

    return sortedData.map(item => {
      const dateStr = item.oeeDate || item.date || item.createdDate;
      
      let axisLabel = item.dayOfWeek;
      let tooltipLabel = item.dayOfWeek;

      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); 
          const dayNameLong = d.toLocaleDateString('en-US', { weekday: 'long' }); 
          const dateNum = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); 
          const yearNum = d.getFullYear(); 
          
          axisLabel = (currentFilter === 'monthly' || currentFilter === 'custom') ? dateNum : dayName;          
          tooltipLabel = `${dayNameLong}, ${dateNum}, ${yearNum}`;
        }
      }

      return { ...item, axisLabel, tooltipLabel };
    });
  };

  const formattedTrendData = formatChartData(trendData, filter).slice(-15);
  const formattedComparisonData = formatChartData(comparisonData, filter).slice(-15);

  return (
    <div className="space-y-6 pb-8">
      
      {/* 1. HEADER */}
      <PageHero
        eyebrow="Dashboard"
        title="Machine Performance"
        description="Monitor real-time overall equipment effectiveness, availability, and downtime trends."
        icon={BarChart2}
      />

      {/* 2. ACTIONS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Performance Actions
          </p>
          <p className="text-sm text-slate-600">
            Filter and browse machine performance records.
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          {filter === 'custom' && (
            <input 
              type="date" 
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white outline-none focus:border-indigo-500 text-slate-700"
            />
          )}

          <select 
            value={selectedMachine}
            onChange={(e) => setSelectedMachine(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm bg-white outline-none cursor-pointer text-slate-700 font-medium"
          >
            {machines.length === 0 ? (
              <option value="">Loading...</option>
            ) : (
              machines.map((m) => (
                <option key={m.assetId} value={m.assetId}>
                  {m.machineName}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* 3. DASHBOARD CONTENT (Top 3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
    {/* Card 1: Overall Performance */}
<div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 flex flex-col min-h-[250px]">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-sm font-bold flex items-center gap-2 text-slate-700">
      <span className="bg-[#1c75bc] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span> 
      OVERALL PERFORMANCE
    </h3>
    <MoreVertical size={16} className="text-slate-400 cursor-pointer hover:text-slate-600" />
  </div>
  

  <div className="flex-1 flex flex-col items-center justify-center relative mt-2">
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-slate-100"
          strokeWidth="3"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="text-[#1c75bc]"
          strokeWidth="3"
          strokeDasharray={`${summaryData?.card1_OverallPerformance?.overallPerformancePct || 0}, 100`}
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      
      <div className="absolute flex flex-col items-center">
        <div className="text-3xl font-bold text-slate-800 leading-tight">
          {c1.overallPerformancePct ?? 0}%
        </div>
        
        {(() => {
          const varianceValue = Number(c1.variance) || 0; 
          if (varianceValue > 0) {
            return (
              <div className="text-xs text-emerald-500 font-semibold flex items-center justify-center">
                <ArrowUp size={12} className="mr-0.5" /> {varianceValue}%
              </div>
            );
          } 
          if (varianceValue < 0) {
            return (
              <div className="text-xs text-rose-500 font-semibold flex items-center justify-center">
                <ArrowDown size={12} className="mr-0.5" /> {Math.abs(varianceValue)}%
              </div>
            );
          }
          return (
            <div className="text-xs text-slate-400 font-semibold flex items-center justify-center">
              <span className="mr-1 font-bold">-</span> 0%
            </div>
          );
        })()}

        <div className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">
          {c1.varianceLabel ?? 'N/A'}
        </div>
      </div>
    </div>
    
    <div className="text-xs font-semibold text-slate-500 mt-6 uppercase tracking-wider">Current Performance %</div>
  </div>
  
</div>
        {/* Card 2: Loss Due to Downtime */}
        <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 flex flex-col min-h-[250px]">
           <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-700">
              <span className="bg-[#1c75bc] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span> 
              LOSS DUE TO DOWNTIME
            </h3>
            <TrendingDown size={18} className="text-rose-500" />
          </div>
          <div className="mb-8 mt-2">
             <div className="flex items-center gap-3">
               <div className="text-rose-500 font-bold text-xl w-12">
                 {c2.lossPct ?? 0}%
               </div>
               <div className="flex-1 h-6 bg-slate-100 rounded-r-full overflow-hidden flex">
   <div 
      className="bg-gradient-to-r from-rose-500 via-orange-400 to-orange-300 transition-all duration-700 ease-out"
      style={{ width: `${Math.min(100, Math.max(0, c2.lossPct ?? 0))}%` }}
   ></div>
</div>
             </div>
             <div className="flex justify-end mt-2">
             </div>
          </div>
          <div className="flex justify-between items-end mt-auto border-t border-slate-100 pt-4">
             <div>
               <div className="text-xs text-slate-500 font-semibold uppercase mb-1 tracking-wider">Downtime Loss</div>
               <div className="text-xl font-bold text-rose-500">{c2.lossPct ?? 0}%</div>
             </div>
             <div className="text-right">
               <div className="text-xl font-bold text-slate-800">{c2.lostHoursPerDayAvg ?? 0}</div>
               <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">hours/day avg.</div>
             </div>
          </div>
        </div>

        {/* Card 3: Comparison Summary */}
        <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 flex flex-col min-h-[250px]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-700">
              <span className="bg-[#1c75bc] text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span> 
              COMPARISON SUMMARY
            </h3>
          </div>
          
          <div className="flex gap-4 text-[10px] uppercase tracking-wider text-slate-500 font-bold mb-4 justify-center">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-200"></span> Availability</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#1c75bc]"></span> Performance</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-400"></span> Gap</div>
          </div>

          <div className="flex-1 flex flex-col justify-end">
   <div className="flex h-24 items-end justify-center gap-10 border-b border-slate-200 pb-2 px-4">
      
      <div 
         className="w-10 bg-blue-200 rounded-t-md transition-all duration-700 ease-out"
         style={{ height: `${Math.min(100, Math.max(0, c3.availabilityPct ?? 0))}%` }}
         title={`Availability: ${c3.availabilityPct}%`}
      ></div>
      
      <div 
         className="w-10 bg-[#1c75bc] rounded-t-md transition-all duration-700 ease-out"
         style={{ height: `${Math.min(100, Math.max(0, c3.performancePct ?? 0))}%` }}
         title={`Performance: ${c3.performancePct}%`}
      ></div>
      
      <div 
         className="w-10 bg-orange-400 rounded-t-md transition-all duration-700 ease-out"
         style={{ height: `${Math.min(100, Math.abs(c3.gapPct ?? 0))}%` }}
         title={`Gap: ${c3.gapPct}%`}
      ></div>

   </div>
             <div className="flex justify-between mt-4">
                <div>
                  <div className="text-xs text-slate-500 font-bold mb-1">AVAILABILITY: <span className="text-slate-800 text-sm ml-1">{c3.availabilityPct ?? 0}%</span></div>
                  <div className="text-xs text-slate-500 font-bold">PERFORMANCE: <span className="text-slate-800 text-sm ml-1">{c3.performancePct ?? 0}%</span></div>
                </div>
                <div className="text-right flex flex-col items-end">
                   <div className="text-xs text-slate-500 font-bold mb-1">GAP:</div>
                   <div className="text-rose-500 font-bold flex items-center text-sm">
                     <TrendingDown size={14} className="mr-1"/> -{c3.gapPct ?? 0}%
                   </div>
                </div>
             </div>
          </div>
        </div>

      </div>

     {/* 4. BOTTOM ROW CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[350px]">
        
        {/* Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 flex flex-col">
           <div className="flex justify-between items-center mb-2">
             <h3 className="text-sm font-bold uppercase text-slate-700">Day-Wise Performance Trend</h3>
             <MoreVertical size={16} className="text-slate-400 cursor-pointer hover:text-slate-600" />
           </div>
           <div className="flex-1 w-full min-h-[250px]">
             {formattedTrendData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={formattedTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                   
<XAxis 
  dataKey="axisLabel" 
  axisLine={false} 
  tickLine={false} 
  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }} 
  dy={10} 
/>                   <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} />
                   
                   <Tooltip 
                     labelFormatter={(label, payload) => payload?.[0]?.payload?.tooltipLabel || label}
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                   />
                   <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}/>
                   
                   <Line type="monotone" dataKey="actualPerformancePct" stroke="#1c75bc" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} name="Actual Performance %" />
                   <Line type="step" dataKey="targetPerformancePct" stroke="#94A3B8" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Target" />
                 </LineChart>
               </ResponsiveContainer>
             ) : (
               <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">No trend data available</div>
             )}
           </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm ring-1 ring-slate-200 flex flex-col">
           <div className="flex justify-between items-center mb-2">
             <h3 className="text-sm font-bold uppercase text-slate-700">Daily Availability vs. Performance</h3>
             <MoreVertical size={16} className="text-slate-400 cursor-pointer hover:text-slate-600" />
           </div>
           <div className="flex-1 w-full min-h-[250px]">
             {formattedComparisonData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={formattedComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                   
<XAxis 
  dataKey="axisLabel" 
  axisLine={false} 
  tickLine={false} 
  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }} 
  dy={10} 
/>        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B', fontWeight: 500 }} />
                   
                   <Tooltip 
                     cursor={{ fill: '#F1F5F9' }} 
                     labelFormatter={(label, payload) => payload?.[0]?.payload?.tooltipLabel || label}
                     contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
                   />
                   <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}/>
                   
                   <Bar dataKey="availabilityPct" fill="#bae6fd" radius={[4, 4, 0, 0]} name="Availability %" maxBarSize={16} />
                   <Bar dataKey="performancePct" fill="#1c75bc" radius={[4, 4, 0, 0]} name="Performance %" maxBarSize={16} />
                 </BarChart>
               </ResponsiveContainer>
             ) : (
               <div className="flex items-center justify-center h-full text-slate-400 text-sm font-medium">No comparison data available</div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
}