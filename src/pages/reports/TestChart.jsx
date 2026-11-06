import React, { useState, useEffect, useMemo} from "react";
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
import { getLines } from "../../services/workplanService";
import PageHero from "../../components/PageHero";
import {
  getSensorsByLineId,
  getSensorParamsById,
  getSensorReportData,
} from "../../services/TestChartService";
import { saveParamStats } from "../../services/TestChartService";
import { useNavigate } from "react-router-dom";
export default function TestChart() {
  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // ------------------------ States ------------------------
  const [lines, setLines] = useState([]);
  const [selectedLineId, setSelectedLineId] = useState("");

  const [sensors, setSensors] = useState([]);
  const [selectedSensorId, setSelectedSensorId] = useState("");

  const [parameters, setParameters] = useState([]);
  const [selectedParams, setSelectedParams] = useState([]);

  const [chartData, setChartData] = useState([]);

 const [selectedTimeRange, setSelectedTimeRange] = useState({
  startTime: null,
  endTime: null,
});
// const maxStartIndex = Math.max(chartData.length - POINTS_IN_2H, 0);
  const [startDateTime, setStartDateTime] = useState(getCurrentDateTime());
  const [endDateTime, setEndDateTime] = useState(getCurrentDateTime());
    const navigate = useNavigate();

  const BASE_COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#f472b6",
    "#f97316",
  ];

  const getStableColor = (paramName) => {
    let hash = 0;
    for (let i = 0; i < paramName.length; i++) {
      hash = paramName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return BASE_COLORS[Math.abs(hash) % BASE_COLORS.length];
  };

  const formatForBackend = (dateTime) => {
    const date = new Date(dateTime);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  // ------------------------ Fetch Lines ------------------------
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

  // ------------------------ Fetch Sensors ------------------------
  useEffect(() => {
    if (!selectedLineId) {
      setSensors([]);
      setSelectedSensorId("");
      return;
    }

    const fetchSensors = async () => {
      try {
        const res = await getSensorsByLineId(selectedLineId);
        setSensors(res?.data || []);
        setSelectedSensorId(""); // reset selected sensor when line changes
      } catch (err) {
        console.error("Failed to fetch sensors", err);
        setSensors([]);
        setSelectedSensorId("");
      }
    };
    fetchSensors();
  }, [selectedLineId]);

  // ------------------------ Fetch Parameters ------------------------
  useEffect(() => {
    if (!selectedSensorId) {
      setParameters([]);
      setSelectedParams([]);
      return;
    }

    const fetchParams = async () => {
      try {
        const res = await getSensorParamsById(selectedSensorId);
        if (res?.success) {
          setParameters(res.data || []);

          // ⚡ Only set initial selectedParams if empty
          if (res.data?.length > 0 && selectedParams.length === 0) {
            setSelectedParams([res.data[0].parameterName]);
          }
        } else {
          setParameters([]);
          setSelectedParams([]);
        }
      } catch (err) {
        console.error("Failed to fetch params", err);
        setParameters([]);
        setSelectedParams([]);
      }
    };
    fetchParams();
    // ⚠ Do NOT put selectedParams in dependency to avoid infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSensorId]);

  // ------------------------ Fetch Chart Data ------------------------
  useEffect(() => {
    if (!selectedLineId || !selectedSensorId || selectedParams.length === 0) return;

    const fetchReport = async () => {
      try {
        const res = await getSensorReportData(
          formatForBackend(startDateTime),
          formatForBackend(endDateTime),
          selectedLineId,
          selectedSensorId
        );

        if (res?.success && res.data) {
          transformChartData(res.data);
        } else {
          setChartData([]);
        }
      } catch (err) {
        console.error("Failed to fetch report", err);
        setChartData([]);
      }
    };

    fetchReport();
  }, [startDateTime, endDateTime, selectedLineId, selectedSensorId, selectedParams]);

  const transformChartData = (apiData) => {
    const { timeStamp, sensorParams } = apiData;

    const formatted = timeStamp.map((time, index) => {
      const row = { time };
      sensorParams.forEach((param) => {
        row[param.paramName] = param.paramData[index];
      });
      return row;
    });

    setChartData(formatted);
  };

  useEffect(() => {
  if (chartData.length > 0) {
    setSelectedTimeRange({
      startTime: chartData[0].time,
      endTime: chartData[chartData.length - 1].time,
    });
  }
}, [chartData]);

  // ------------------------ Ensure brushStartIndex stays in range ------------------------
// useEffect(() => {
//   if (chartData.length === 0) return;

//   const maxStartIndex = Math.max(chartData.length - POINTS_IN_2H, 0);

//   if (brushStartIndex > maxStartIndex) {
//     setBrushStartIndex(maxStartIndex);
//   } else if (brushStartIndex < 0) {
//     setBrushStartIndex(0);
//   }
// }, [chartData]);


  // ------------------------ Memoized Lines ------------------------
  const renderedLines = useMemo(
    () =>
      selectedParams.map((paramName) => (
        <Line
          key={paramName}
          type="monotone"
          dataKey={paramName}
          stroke={getStableColor(paramName)}
          dot={false}
        />
      )),
    [selectedParams]
  );

const visibleData = useMemo(() => {
  // console.log("Start time-" +selectedTimeRange.startTime)
  if (!selectedTimeRange.startTime || !selectedTimeRange.endTime)
    return [];

  return chartData.filter((item) => {
    return (
      item.time >= selectedTimeRange.startTime &&
      item.time <= selectedTimeRange.endTime
    );
  });
}, [chartData, selectedTimeRange]);


const paramStats = useMemo(() => {
  const stats = {};

  selectedParams.forEach((paramName) => {
    const values = visibleData.map((d) => d[paramName]).filter(v => v !== undefined);

    if (values.length > 0) {
      stats[paramName] = {
        min: Math.min(...values),
        max: Math.max(...values),
       
      };
    }
  });
//  console.log("Min Max Calculated:", stats);

  return stats;
}, [visibleData, selectedParams]);


const handleSave = async () => {
  
  if (!selectedSensorId) {
    alert("Select Sensor");
    return;
  }

  if (selectedParams.length === 0) {
    alert("Select at least one parameter");
    return;
  }

  const saveData = selectedParams.map((paramName) => {
    const paramObj = parameters.find(
      (p) => p.parameterName === paramName
    );

    return {
      sensorId: parseInt(selectedSensorId),
      paramId: paramObj?.id,   // 🔥 important
      min: paramStats[paramName]?.min ?? 0,
      max: paramStats[paramName]?.max ?? 0,
       

    };
  });
  console.log("Selected Params:", selectedParams);
  console.log("Param Stats:", paramStats);
   console.log("saving data :", saveData);

  try {
    const res = await saveParamStats(saveData);

    if (res?.success) {
      alert("Values Saved Successfully");
    } else {
      alert("Failed to save values: " + (res?.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Error saving values:", err);
    alert("Error saving values: " + err.message);
  }
};


  // ------------------------ JSX ------------------------
  return (
    <div className="p-6 space-y-6">
      <div className="relative">
      {/* Page Hero */}

      <PageHero eyebrow="Reports"
       title="Test Chart" 
       description="Monitor hourly production performance"
      icon={CalendarDays} />

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

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Start Date */}
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Start Date & Time</label>
            <input
              type="datetime-local"
              value={startDateTime}
              onChange={(e) => setStartDateTime(e.target.value)}
              className="mt-1 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">End Date & Time</label>
            <input
              type="datetime-local"
              value={endDateTime}
              onChange={(e) => setEndDateTime(e.target.value)}
              className="mt-1 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2"
            />
          </div>

          {/* Line Dropdown */}
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Line</label>
            <select
              value={selectedLineId}
              onChange={(e) => setSelectedLineId(e.target.value)}
              className="mt-1 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2"
            >
              <option value="">Select Line</option>
              {lines.map((line) => (
                <option key={line.id} value={line.id}>
                  {line.description}
                </option>
              ))}
            </select>
          </div>

          {/* Sensor Dropdown */}
          <div>
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Sensor</label>
            <select
              value={selectedSensorId}
              onChange={(e) => setSelectedSensorId(e.target.value)}
              className="mt-1 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 rounded-lg p-2"
            >
              <option value="">Select Sensor</option>
              {sensors.map((sensor) => (
                <option key={sensor.id} value={sensor.id}>
                  {sensor.sensorLocation}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div style={{ width: "100%", height: 400 }}>
         <ResponsiveContainer>
  <LineChart
    data={chartData} // <-- FULL DATA, not visibleData
    margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
  >
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis type="category" dataKey="time" tick={false}/>
    <YAxis />
    <Tooltip />
    {renderedLines}

    {chartData.length >0 && (
      <Brush
  dataKey="time"
  height={30}
  stroke="#8884d8"
  travellerWidth={10}
  onChange={(range) => {
    if (!range || !chartData.length) return;

    const startTime = chartData[range.startIndex]?.time;
    const endTime = chartData[range.endIndex]?.time;

    setSelectedTimeRange({ startTime, endTime });
  }}
/>
    )}
  </LineChart>
</ResponsiveContainer>
</div>
{/* Parameters with vertical Min / Max / Actual and Save button inline */}
<div className="flex flex-wrap gap-6 mt-4">
  {parameters.map((param) => {
    const stats = paramStats[param.parameterName];

    return (
      <div key={param.id} className="flex flex-col items-center border p-2 rounded-lg">
        {/* Only show stats if parameter is selected */}
        {selectedParams.includes(param.parameterName) && stats && (
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 text-center">
            <div>Min: {stats.min}</div>
            <div>Max: {stats.max}</div>
            
          </div>
        )}

        {/* Checkbox + Parameter Name + Save Button in one row */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-blue-600"
              checked={selectedParams.includes(param.parameterName)}
              onChange={() =>
                setSelectedParams((prev) =>
                  prev.includes(param.parameterName)
                    ? prev.filter((p) => p !== param.parameterName)
                    : [...prev, param.parameterName]
                )
              }
            />
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {param.parameterName}
            </span>
          </label>

        </div>
      </div>
    );
  })}

         {/* Save button next to parameter name */}
<button
  onClick={handleSave}
  className="bg-blue-600 text-white mt-1 px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex-shrink-0"
  style={{ height: '36px', minWidth: '60px' }} // fixed height and minimum width
>
  Save
</button>
  </div>
</div>

      {/* Sidebar Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Selected Values</h3>
          <span className="text-sm text-slate-500 dark:text-slate-400">{visibleData.length} Records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-left">
                <th className="py-2 px-3 text-slate-600 dark:text-slate-300">Time</th>
                {selectedParams.map((paramName) => (
                  <th key={paramName} className="py-2 px-3 font-semibold">{paramName}</th>
                ))}
              </tr>
            </thead>
            <tbody>
               {visibleData.map((d, i) => (
    <tr
      key={i}
      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
    >
      <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300">{d.time}</td>
      {selectedParams.map((paramName) => (
        <td key={paramName} className="py-2 px-3">{d[paramName]}</td>
      ))}
    </tr>
  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

  









