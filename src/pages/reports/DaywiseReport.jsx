import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { getLines } from "../../services/workplanService";
import { useEffect} from "react";
import PageHero from "../../components/PageHero";
import { CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDaywiseReport } from "../../services/reportService";


export default function DaywiseReport() {

// Get today's date in yyyy-MM-dd format
const today = new Date().toISOString().split("T")[0];

const [fromDate, setFromDate] = useState(today);
const [toDate, setToDate] = useState(today);

const [lines, setLines] = useState([]);
const [selectedLineId, setSelectedLineId] = useState("");
const [reportData, setReportData] = useState([]);
const navigate = useNavigate();

  const formatDate = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

const handleSearch = async () => {
  try {
    const formattedFromDate = formatDate(fromDate);
    const formattedToDate = formatDate(toDate);

    const res = await getDaywiseReport(
      selectedLineId,
      formattedFromDate,
      formattedToDate
    );

    if (res.success) {
      const formattedData = res.data.map((item) => ({
        date: item.forDate,
        ok: item.okCount,
        nok: item.nokCount,
      }));

      setReportData(formattedData);
    } else {
      setReportData([]);
    }
  } catch (error) {
    console.error("Error fetching report:", error);
    setReportData([]);
  }
};


//for line  
  useEffect(() => {
  const fetchLines = async () => {
    try {
      const res = await getLines();
      setLines(res?.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch lines", err);
    }
  };

  fetchLines();
}, []);


  return (
    <div className="p-6 space-y-6">
<PageHero
  eyebrow="Reports"
  title="Daywise Report"
  description="Monitor daily OK and NOK production performance by line"
  icon={CalendarDays}
  
/>


      {/*  FILTER SECTION */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
              From Date
            </label>
            <input
              type="date"
              className="mt-1 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
              To Date
            </label>
            <input
              type="date"
              className="mt-1 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600text-sm font-medium text-slate-600 dark:text-slate-300">
              Line
            </label>
            <select
  value={selectedLineId}
  onChange={(e) => setSelectedLineId(e.target.value)}
  className="mt-1 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors">
  <option value="">Select Line</option>
  {lines.map((line) => (
    <option key={line.id} value={line.id}>
      {line.description}
    </option>
  ))}
</select>

          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition"
            >
              Search
            </button>
          </div>

        </div>
      </div>

      {/* 🔷 CHART */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
          OK vs NOK Trend 
        </h2>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData}>
             <CartesianGrid vertical={false} horizontal={false} /> 
              <XAxis dataKey="date" />
             <YAxis allowDecimals={false} />

              <Tooltip />
              <Legend />
              <Bar dataKey="ok" fill="#16a34a" radius={[6, 6, 0, 0]} barSize={90}/>
              <Bar
  dataKey="nok"
  fill="#dc2626"
  barSize={90}
  onClick={(data) => {
    const clickedDate = data?.payload?.date; // "17-02-2026"

    // 🔥 Convert dd-MM-yyyy → yyyy-MM-dd
    const [day, month, year] = clickedDate.split("-");
    const formattedDate = `${year}-${month}-${day}`;

    navigate("/reports/stationwise", {
      state: {
        selectedDate: formattedDate,
        selectedLineId: selectedLineId,
      },
    });
  }} 
/>

            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      
     {/* 🔷 TABLE */}
<div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
  
  {/* Table Header Section */}
  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-70">
    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
  Detailed Production Data
</h2>
<span className="text-xs text-slate-800 dark:text-slate-300">
      {reportData.length} Records
    </span>
  </div>

  <div className="overflow-x-auto max-h-[400px]">
    <table className="min-w-full text-sm text-slate-700">
      
<thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-sm uppercase tracking-wider text-slate-600 dark:text-slate-300 z-10">    
      <tr>
          <th className="px-6 py-3 text-left font-semibold">Date</th>
          <th className="px-6 py-3 text-center font-semibold">OK Count</th>
          <th className="px-6 py-3 text-center font-semibold">NOK Count</th>
        </tr>
      </thead>

    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
        {reportData.length === 0 ? (
          <tr>
            <td
              colSpan={3}
              className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 text-center"
            >
              No production data available
            </td>
          </tr>
        ) : (
          reportData.map((item, index) => (
            <tr
              key={index}
              className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                {item.date}
              </td>

              <td className="px-6 py-4 text-center font-semibold text-emerald-600">
                {item.ok}
              </td>

              <td className="px-6 py-4 text-center font-semibold text-rose-600">
                {item.nok}
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
