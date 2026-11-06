import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import PageHero from "../../components/PageHero";
import { TrendingUp } from "lucide-react";
import { getLines } from "../../services/workplanService";
import { getParameterDataForDay } from "../../services/reportService";
import { Fonts } from "react-bootstrap-icons";

export default function LineChartPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    selectedDate,
    selectedLineId,
    selectedParameter,
     selectedStationName,
       selectedParameterName
  } = location.state || {};

  const [date, setDate] = useState(selectedDate || "");
  const [lineId, setLineId] = useState(selectedLineId || "");
  const [lines, setLines] = useState([]);
const [chartData, setChartData] = useState([]);
 

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


  useEffect(() => {
  const fetchChartData = async () => {
    if (!lineId || !selectedParameter || !date) return;

    try {
      const res = await getParameterDataForDay(lineId, selectedParameter, date);

      if (!res?.data) {
        console.error("No data returned from API");
        setChartData([]);
        return;
      }

      const apiData = res.data;

      const formattedData = apiData.xLabel.map((x, index) => ({
        x: x,
        actual: apiData.paramValues[index]?.paramValue,
        min: apiData.minValues[index],
        max: apiData.maxValues[index],
        isOk: apiData.paramValues[index]?.isOk,
      }));

      setChartData(formattedData);

    } catch (err) {
      console.error("Failed to fetch chart data", err);
      setChartData([]);
    }
  };

  fetchChartData();
}, [lineId, selectedParameter, date]);



  return (
    <div className="p-6 space-y-6">
      <div className="relative">

      {/* Page Hero */}
     <PageHero
  eyebrow="Reports"
  title={`Line Chart for ${selectedParameterName || ""}`}
  description={`${(() => {
    if (!date) return "";
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}`;
  })()} | ${
    lines.find((l) => l.id == lineId)?.description || ""
  } | ${selectedStationName || ""} | ${
    selectedParameterName || ""
  }`}
  icon={TrendingUp}
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

      {/* Line Chart Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-700 mb-4text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">
          Line Chart ({date})
        </h2>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
             <CartesianGrid vertical={false} horizontal={false} /> // completely disables grid lines
              <XAxis dataKey="x" tick={false} 
/>

              <YAxis allowDecimals={false} />
              <Tooltip />
             <Legend
  wrapperStyle={{
    fontSize: "20px",
    fontWeight: 600,
  }}
/>

              {/* Max Line */}
              <Line
                type="monotone"
                dataKey="max"
                name="Max"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false} 
              />

              {/* Min Line */}
              <Line
                type="monotone"
                dataKey="min"
                name="Min"
                stroke="#9333ea"
                strokeWidth={2}
                dot={false} 
              />

              {/* Actual Line with OK/NOK Dots */}
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual"
                stroke="none"
                activeDot={{ r: 8 }}
                strokeWidth={2}
                dot={({ payload, cx, cy }) => (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={payload.isOk ? "#16a34a" : "#dc2626"}
                  />
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
