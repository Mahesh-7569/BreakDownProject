 
import { useState, useEffect,useMemo} from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
} from "recharts";
import { CalendarDays } from "lucide-react";
import PageHero from "../../components/PageHero";
import { getLines } from "../../services/workplanService";
import { getSensorsByLineId, getSensorParamsById } from "../../services/TestChartService";
import { getParameterChartData } from "../../services/ParaChartService";
import { useNavigate } from "react-router-dom";
export default function ParameterChart() {

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const formatDateForAPI = (date) => {
  const d = new Date(date);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

  const [lines, setLines] = useState([]);
  const [selectedLineId, setSelectedLineId] = useState("");

  const [sensors, setSensors] = useState([]);
  const [selectedSensorId, setSelectedSensorId] = useState("");

  const [parameters, setParameters] = useState([]);
const [selectedParamId, setSelectedParamId] = useState("");
  const [chartData, setChartData] = useState([]);

  const [startDateTime, setStartDateTime] = useState(getCurrentDateTime());
  const [endDateTime, setEndDateTime] = useState(getCurrentDateTime());
    const navigate = useNavigate();

  const BASE_COLORS = {
    actual: "#3b82f6",
    min: "#ef4444",
    max: "#10b981",
  };

  const getStableColor = (type) => BASE_COLORS[type] || "#888";

  // ---------------- FETCH LINES ----------------
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

  // ---------------- FETCH SENSORS ----------------
  useEffect(() => {
    if (!selectedLineId) {
      setSensors([]);
      setSelectedSensorId("");
      return;
    }

    const fetchSensors = async () => {
      try {
        const res = await getSensorsByLineId(selectedLineId);

        if (res?.success) {
          setSensors(res.data || []);
        } else {
          setSensors([]);
        }

        setSelectedSensorId("");
      } catch (err) {
        console.error("Failed to fetch sensors", err);
        setSensors([]);
      }
    };

    fetchSensors();
  }, [selectedLineId]);

  // ---------------- FETCH PARAMETERS ----------------
  useEffect(() => {
    if (!selectedSensorId) {
      setParameters([]);
      setSelectedParamId("");
      return;
    }

    const fetchParams = async () => {
      try {
        const res = await getSensorParamsById(selectedSensorId);

        if (res?.success) {
          setParameters(res.data || []);

           if (res.data?.length > 0  && !selectedParamId) {
setSelectedParamId(res.data[0].id);          
}
        } else {
          setParameters([]);
        }
      } catch (err) {
        console.error("Failed to fetch parameters", err);
        setParameters([]);
      }
    };

    fetchParams();
  }, [selectedSensorId]);

  // ----------------  CHART DATA ----------------
 useEffect(() => {

  const fetchChartData = async () => {

    if (!selectedLineId || !selectedSensorId || !selectedParamId) return;

    try {

      const res = await getParameterChartData(
        selectedLineId,
        selectedSensorId,
        selectedParamId,
        formatDateForAPI(startDateTime),
        formatDateForAPI(endDateTime)
      );

      if (!res?.success) return;

      const { timeStamp, paramData, minVal, maxVal } = res.data;

      const chart = timeStamp.map((t, index) => ({
        time: t,
        actual: paramData[index] ?? null,
        min: minVal,
        max: maxVal
      }));

      setChartData(chart);

    } catch (error) {
      console.error("Chart load error", error);
    }

  };

  fetchChartData();

}, [selectedLineId, selectedSensorId, selectedParamId, startDateTime, endDateTime]);





  return (
    <div className="p-6 space-y-6">
      <div className="relative">

      <PageHero
        eyebrow="Reports"
        title="Parameter Chart"
        description="Monitor parameter min, max, and actual trends"
        icon={CalendarDays}
      />
 {/* Back Button: Vertically center relative to Page Hero */}
  <div className="absolute top-1/2 right-6 -translate-y-1/2">
    <button
      onClick={() => navigate("/dashboard")}
      className="h-10 px-4 text-sm bg-slate-600 text-white rounded-md hover:bg-slate-700 transition"
    >
      ← Back
    </button>
    </div>


</div>
      {/* ---------------- FILTERS (ONE ROW) ---------------- */}

      <div className="bg-white dark:bg-slate-900 border rounded-xl p-6 shadow-sm">

        <div className="grid grid-cols-6 gap-4">

          <div>
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">End Date</label>
            <input
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Line</label>
            <select
              value={selectedLineId}
              onChange={(e) => setSelectedLineId(e.target.value)}
              className="w-full border rounded-lg p-2"
            >
              <option value="">Select Line</option>

              {lines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.description}
                </option>
              ))}

            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Sensor</label>
            <select
              value={selectedSensorId}
              onChange={(e) => setSelectedSensorId(e.target.value)}
              className="w-full border rounded-lg p-2"
            >

              <option value="">Select Sensor</option>

              {sensors.map((sensor) => (
                <option key={sensor.id} value={sensor.id}>
                  {sensor.sensorLocation}
                </option>
              ))}

            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Parameter</label>
           <select
  value={selectedParamId}
  onChange={(e) => setSelectedParamId(e.target.value)}
className="w-full border rounded-lg p-2"

>
  <option value="">Select Parameter</option>

  {parameters.map((param) => (
    <option key={param.id} value={param.id}>
      {param.parameterName}
    </option>
  ))}
</select>
          </div>

        </div>
      </div>

      {/* ---------------- CHART ---------------- */}

      <div className="bg-white border rounded-xl p-6 shadow-sm">

       
        <div style={{ width: "100%", height: 400 }}>

          <ResponsiveContainer>

            <LineChart
              data={chartData}
               key={chartData.length}
              margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
            >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" tick={false} 
            />
            <YAxis />
            <Tooltip />

              <Line
                type="monotone"
                dataKey="actual"
                stroke={getStableColor("actual")}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="min"
                stroke={getStableColor("min")}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              <Line
                type="monotone"
                dataKey="max"
                stroke={getStableColor("max")}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />

              {chartData.length > 0 && (
  <Brush
    dataKey="time"
    height={30}
    stroke="#6366f1"
    travellerWidth={10}
    startIndex={0}
    endIndex={chartData.length - 1}
    
  />
)}

            </LineChart>

          </ResponsiveContainer>
          </div>

        {/* -------- CUSTOM LEGEND -------- */}

        <div className="flex justify-center gap-10 mt-6 text-sm font-medium">

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: BASE_COLORS.actual }}></div>
            Actual
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: BASE_COLORS.min }}></div>
            Min
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ background: BASE_COLORS.max }}></div>
            Max
          </div>

        </div>

      </div>

    </div>
  );
}