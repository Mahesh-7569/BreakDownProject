import { useLocation,useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
import PageHero from "../../components/PageHero";
import { Factory } from "lucide-react";
import { getLines } from "../../services/workplanService";
import { getStationwiseReport } from "../../services/reportService";

export default function StationwiseReport() {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedDate, selectedLineId } = location.state || {};

  const [date, setDate] = useState("");
  const [lines, setLines] = useState([]);
  const [lineId, setLineId] = useState("");
  const [stationData, setStationData] = useState([]);



  // 🔹 Load Lines
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

  
  // 🔹 Auto Select Date + Line
  useEffect(() => {
    if (selectedDate) setDate(selectedDate);
    if (selectedLineId) setLineId(selectedLineId);
  }, [selectedDate, selectedLineId]);

  // 🔹 Fetch Stationwise Data
 useEffect(() => {
  const fetchStationData = async () => {
    try {
      if (!date || !lineId) return;

      // ✅ Convert yyyy-MM-dd → dd-MM-yyyy
      const [year, month, day] = date.split("-");
      const formattedDate = `${day}-${month}-${year}`;

      const res = await getStationwiseReport(lineId, formattedDate);

      if (res.success) {
        const formattedData = res.data.map((item) => ({
  station: item.stationName,
  stationId: item.stationId, 
  ok: item.okCount,
  nok: item.nokCount,
}));


        setStationData(formattedData);
      } else {
        setStationData([]);
      }
    } catch (error) {
      console.error("Error fetching station report:", error);
      setStationData([]);
    }
  };

  fetchStationData();
}, [date, lineId]);


  return (
    <div className="p-6 space-y-6">
<div className="relative">
  {/* Page Hero */}
  <PageHero
    eyebrow="Reports"
    title="Stationwise Report"
    description={` ${(() => {
      if (!date) return "";
      const [year, month, day] = date.split("-");
      return `${day}-${month}-${year}`;
    })()} | ${lines.find((l) => l.id == lineId)?.description || ""}`} // ✅ only show date in dd-mm-yyyy
    icon={Factory}
  />

  {/* Back Button: Vertically center relative to Page Hero */}
  <div className="absolute top-1/2 right-6 -translate-y-1/2">
    <button
      onClick={() => navigate(-1)}
      className="h-10 px-4 text-sm bg-slate-600 text-white rounded-md hover:bg-slate-700 transition"
    >
      ← Back
    </button>
  </div>
</div>



      {/* 🔷 CHART */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-stext-lg font-semibold text-slate-700 dark:text-slate-200 mb-4emibold text-slate-700 mb-4">
          Stationwise OK vs NOK ({date})
        </h2>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stationData}>
             <CartesianGrid vertical={false} horizontal={false} />               <XAxis dataKey="station" />
             <YAxis allowDecimals={false} />

              <Tooltip />
              <Legend />
              <Bar dataKey="ok" fill="#16a34a" barSize={90}/>
             <Bar
  dataKey="nok"
  fill="#dc2626"
  barSize={90}
  
 onClick={(data) => {
    const { stationId, stationName } = data.payload; // ✅ get stationId
    navigate("/reports/parameter", {
      state: {
        selectedDate: date,
        selectedLineId: lineId,
        selectedStationId: stationId,   // pass ID
        selectedStationName: stationName,   // pass Name
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
  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-70">
    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
      Stationwise Production Data
    </h2>
    <span className="text-xs text-slate-800 dark:text-slate-300">
      {stationData.length} Stations
    </span>
  </div>

  <div className="overflow-x-auto max-h-[400px]">
    <table className="min-w-full text-sm text-slate-700 dark:text-slate-200">
      <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-sm uppercase tracking-wider text-slate-600 dark:text-slate-300 z-10">
        <tr>
          <th className="px-6 py-3 text-left font-semibold">Station</th>
          <th className="px-6 py-3 text-center font-semibold">OK</th>
          <th className="px-6 py-3 text-center font-semibold">NOK</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
        {stationData.length === 0 ? (
          <tr>
            <td colSpan={3} className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 text-center">
              No data available
            </td>
          </tr>
        ) : (
          stationData.map((item, index) => (
            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">{item.station}</td>
              <td className="px-6 py-4 text-center font-semibold text-emerald-600 dark:text-emerald-400">{item.ok}</td>
              <td className="px-6 py-4 text-center font-semibold text-rose-600 dark:text-rose-400">{item.nok}</td>
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
