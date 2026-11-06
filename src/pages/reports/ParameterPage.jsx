import { useLocation, useNavigate } from "react-router-dom";
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
import { SlidersHorizontal } from "lucide-react";
import { getParameterWiseNGCount, getStationsByLine } from "../../services/reportService";
import { getLines } from "../../services/workplanService";

export default function ParameterPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedDate, selectedLineId, selectedStationId, selectedStationName} = location.state || {};

  const [date, setDate] = useState(selectedDate || "");
  const [lineId, setLineId] = useState(selectedLineId || "");
  const [stationId, setStationId] = useState(selectedStationId || "");
  const [lines, setLines] = useState([]);
  const [stations, setStations] = useState([]);
  const [paramData, setParamData] = useState([]);

  // Load Lines
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

   // Load stations whenever line changes
useEffect(() => {
  const fetchStations = async () => {
    if (!lineId) return;

    try {
      const res = await getStationsByLine(lineId);
      if (res.success) {
        setStations(res.data || []);

        
      } else {
        setStations([]);
      }
    } catch (err) {
      console.error("Failed to fetch stations", err);
      setStations([]);
    }
  };

  fetchStations();
}, [lineId, selectedStationId]); // <- watch selectedStationId too

 
//  auto select station
useEffect(() => {
  if (stations.length > 0 && selectedStationId) {
    const exists = stations.find((s) => s.id === selectedStationId);
    if (exists) setStationId(selectedStationId);
  }
}, [stations, selectedStationId]);


  // Fetch Parameter Data whenever date, line, or station changes
  useEffect(() => {
    const fetchParamData = async () => {
      if (!date || !lineId || !stationId) return;
      try {
        const [year, month, day] = date.split("-");
        const formattedDate = `${day}-${month}-${year}`;

        const res = await getParameterWiseNGCount(lineId, stationId, formattedDate);
        if (res.success) {
          const formattedData = res.data.map((item) => ({
  paramId: item.paramId,   // 🔥 ADD THIS
  parameter: item.paramName || `Param ${item.paramId}`,
  ok: item.okCount,
  nok: item.nokCount,
}));

          setParamData(formattedData);
        } else {
          setParamData([]);
        }
      } catch (err) {
        console.error("Failed to fetch parameter data:", err);
        setParamData([]);
      }
    };
    fetchParamData();
  }, [date, lineId, stationId]);

  return (
    <div className="p-6 space-y-6">
      <div className="relative">
      {/* Page Hero */}
     <PageHero
  eyebrow="Reports"
  title={`Parameters for ${
    stations.find(s => s.id === stationId)?.description ||
    selectedStationName ||
    ""
  }`}
  description={`${(() => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  })()} | ${lines.find((l) => l.id == lineId)?.description || ""} | ${
    stations.find((s) => s.id === stationId)?.description || selectedStationName || ""
  }`}
  icon={SlidersHorizontal}
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

      
      {/* Parameter Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
          Parameter Chart ({date})
        </h2>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paramData}>
              <CartesianGrid vertical={false} horizontal={false} /> // completely disables grid lines

              <XAxis dataKey="parameter" />
               <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="ok" fill="#16a34a" barSize={80} />
              <Bar
  dataKey="nok"
  fill="#dc2626"
  barSize={80}
    onClick={(data, index) => {
    // data is the chart object for this bar
    if (!data) return;

    // 'paramId' must exist in your paramData mapping
    navigate("/reports/linechart", {
      state: {
        selectedDate: date,
        selectedLineId: lineId,
        selectedStationId: stationId,
             selectedStationName: stations.find((s) => s.id === stationId)?.description || "", nName: selectedStationName, 
        selectedParameterName: data.parameter, 
        selectedParameter: data.paramId, 
        selectedType: "nok",
      },
    });
  }}
/>
      </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Parameter Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-70">
         <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
  Parameter Details
</h2>
          <span className="text-xs text-slate-500 dark:text-slate-300">{paramData.length} Parameters</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-700 dark:text-slate-200">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-sm uppercase tracking-wider text-slate-600 dark:text-slate-300 z-10">
  <tr>
    <th className="px-6 py-3 text-left font-semibold">Parameter</th>
    <th className="px-6 py-3 text-center font-semibold">OK Count</th>
    <th className="px-6 py-3 text-center font-semibold">NOK Count</th>
  </tr>
</thead>
            <tbody className="divide-y divide-slate-100">
              {paramData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                    No data available
                  </td>
                </tr>
              ) : (
                paramData.map((item, index) => (
                  <tr key={item.parameter + index} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 text-slate-800 dark:text-slate-200">{item.parameter}</td>
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
