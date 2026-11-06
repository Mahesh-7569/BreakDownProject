import PageHero from "../components/PageHero";
import { GaugeCircle } from "lucide-react";
import { useState ,useEffect,useRef} from "react";
import { useNavigate } from "react-router-dom";
import { WS_BASE_URL } from "../config/apiConfig";
import {
  
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Pie,
  PieChart,

  
} from "recharts";

function OeeDashboardPage() {
  const [isLive, setIsLive] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimeout = useRef(null);



 // ===== Circle Card Data =====
const [oeeData, setOeeData] = useState([{ value: 0 }, { value: 0 }, { value: 0 }]);
const [availabilityData, setAvailabilityData] = useState([{ value: 0 }, { value: 0 }, { value: 0 }]);
const [performanceData, setPerformanceData] = useState([{ value: 0 }, { value: 0 }, { value: 0 }]);
const [qualityData, setQualityData] = useState([{ value: 0 }, { value: 0 }, { value: 0 }]);

  
  // ===== Bar Chart Data =====
const colors = ["#4db6c6" ,"#4CAF84", "#f56565" , "#5dd6c6" ];

const [availabilityBar, setAvailabilityBar] = useState([]);
const [performanceBar, setPerformanceBar]= useState([]);
const [qualityBar, setQualityBar]= useState([]);
 




 // ===== WebSocket with automatic reconnect =====
  useEffect(() => {
    const connectWebSocket = () => {
const ws = new WebSocket(WS_BASE_URL);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        setIsLive(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
              console.log("WS Message received:", message);
         

     //Oee        
    if (message.OEE) {
      setOeeData([
        { value: message.OEE.currentValue ?? 0 },
        { value: message.OEE.thisWeek ?? 0 },
        { value: message.OEE.thisMonth ?? 0 }
      ]);
    }


    //availability

    if (message.Availability) {
      setAvailabilityData([
        { value: message.Availability.currentValue ?? 0 },
        { value: message.Availability.thisWeek ?? 0 },
        { value: message.Availability.thisMonth ?? 0 }
      ]);
    }

    //performance

     if (message.Performance) {
      setPerformanceData([
        { value: message.Performance.currentValue ?? 0 },
        { value: message.Performance.thisWeek ?? 0 },
        { value: message.Performance.thisMonth ?? 0 }
      ]);
    }


    //Quality

    
     if (message.Quality) {
      setQualityData([
        { value: message.Quality.currentValue ?? 0 },
        { value: message.Quality.thisWeek ?? 0 },
        { value: message.Quality.thisMonth ?? 0 }
      ]);
    }

 //bar chart
//availability chart
if (message.AvailabilityData) {

  const barData = message.AvailabilityData;
  const avgData = [];

  for (let i = 0; i < barData.length; i++) {

    avgData.push({
      name: barData[i].paramName,
      value: Number(barData[i].paramValue),
      fill: colors[i % colors.length]   
    });

  }
setAvailabilityBar(avgData);
}


//performance chart

if (message.PerformanceData) {

  const barData = message.PerformanceData;
  const perData = [];

  for (let i = 0; i < barData.length; i++) {

    perData.push({
      name: barData[i].paramName,
      value: Number(barData[i].paramValue),
      fill: colors[i % colors.length]   
    });

  }
setPerformanceBar(perData);
}

//Qualitychart

if (message.QualityData) {

  const barData = message.QualityData;
  const quaData = [];

  for (let i = 0; i < barData.length; i++) {

    quaData.push({
      name: barData[i].paramName,
      value: Number(barData[i].paramValue),
      fill: colors[i % colors.length]  
    });

  }
setQualityBar(quaData);
}

}

catch (err) {
          console.error("Invalid WS message", err);
        }
      };

      ws.onerror = () => {
        console.log("❌ WebSocket error");
        setIsLive(false);
      };

      ws.onclose = () => {
        console.log("⚡ WebSocket closed");
        setIsLive(false);

        // Try to reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, []);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <PageHero
        title="OEE Dashboard"
        
        icon={GaugeCircle}
        
        
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span
              className={`inline-flex h-2 w-2 rounded-full ${
                isLive
                  ? "bg-emerald-300 shadow-[0_0_0_6px_rgba(16,185,129,0.35)]"
                  : "bg-red-400"
              }`}
            />
            {isLive ? "Live sync" : "Offline"}
          </div>
        }
      />

      {/* ===== Circular Cards ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <CircleCard title="OEE" data={oeeData} color="#4db6c6" />
        <CircleCard title="Availability" data={availabilityData} color="#4CAF84" />
        <CircleCard title="Performance" data={performanceData} color="#e0b04b" />
        <CircleCard title="Quality" data={qualityData} color="#f28c28" />
      </div>

      {/* ===== Bar Sections ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <BarSection title="Availability" data={availabilityBar} />
        <BarSection title="Performance" data={performanceBar} />
        <BarSection title="Quality" data={qualityBar} />
      </div>
    </div>
  );
}



export default OeeDashboardPage;



/* ================= COMPONENTS ================= */
function CircleCard({ title, data, color }) {
  const mainValue = data[0].value; // main circle value
  const weekValue = data[1]?.value ?? mainValue;  // optional "this week"
  const monthValue = data[2]?.value ?? mainValue; // optional "this month"

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
      <h3 className="text-2xl font-semibold text-gray-700 mb-4">{title}</h3>

      <div className="flex flex-col items-center">
        {/* Circle */}
        <div className="w-44 h-44 relative"> {/* bigger circle */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Background Circle */}
              <Pie
                data={[{ value: 100 }]}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                innerRadius="85%"  // same thickness
                outerRadius="95%"
                fill="#e5e7eb"
                stroke="none"
                isAnimationActive={false}
              />

              {/* Progress Circle */}
              <Pie
                data={[{ value: mainValue }]}
                dataKey="value"
                startAngle={90}
                endAngle={90 - (mainValue / 100) * 360}
                innerRadius="85%"  // same thickness
                outerRadius="95%"
                fill={color}
                stroke="none"
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Value */}
          <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-700">
            {mainValue}%
          </div>
        </div>

        {/* Values below circle */}
        <div className="mt-6 flex justify-center gap-20 text-gray-600 font-semibold"> {/* bigger gap */}
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{weekValue}%</span>
            <span className="text-gray-400 text-lg">This week</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold">{monthValue}%</span>
            <span className="text-gray-400 text-lg">This month</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarSection({ title, data }) {
  const navigate = useNavigate();

const handleBarClick = (entry) => {
  console.log("Clicked:", entry);

  if (!entry?.payload) return;

  if (entry.name.includes("Un")) {
  navigate("/DashboardPages/OeeFailureReport", { state: entry });
}

};


  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      {/* Section Title */}
      <h3 className="text-2xl font-semibold text-gray-700 mb-4">{title}</h3>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }} barCategoryGap="40%"   >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name"  interval={0} angle={-10} textAnchor="end" tick={{ fontSize: 15 }} tickMargin={10} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            {/* This Bar will use the fill colors from data */}
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              barSize={60}
              cursor="pointer"
 onClick={(entry) => handleBarClick(entry)}            />
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

