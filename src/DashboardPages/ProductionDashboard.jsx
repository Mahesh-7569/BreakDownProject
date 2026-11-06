import { useEffect, useState,useRef } from "react";
import { WS_BASE_URL } from "../config/apiConfig";

import { useNavigate,useOutletContext, useLocation } from "react-router-dom";
// import { getLines } from "../services/workplanService";
import { getToken } from "../services/authService";
// import { getDashboardData } from "../services/dashboardService";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Factory,
  GaugeCircle,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import PageHero from '../components/PageHero'
import StatsCard from '../components/StatsCard'


function DashboardPage({ userId }) {

 const [dashboardData, setDashboardData] = useState({
  plannedQty: 0,
  actualQty: 0,
  okQty: 0,
  nokQty: 0,
});

const donutRadius = 82;
  const donutCircumference = 2 * Math.PI * donutRadius;
const location = useLocation();
const navigate = useNavigate();
const [lines, setLines] = useState([]);
const [selectedLine, setSelectedLine] = useState("");
const socketRef = useRef(null);
// const { setHideSidebar } = useOutletContext()
const [summaryTiles, setSummaryTiles] = useState([
  { label: "Planned Quantity", value: "0", icon: ClipboardList, subtitle: "Shift target" },
  { label: "Actual Quantity", value: "0", icon: CheckCircle2, subtitle: "Confirmed output" },
  { label: "OK Quantity", value: "0", icon: ShieldCheck, subtitle: "Passed QA" },
  { label: "NOK Quantity", value: "0", icon: XCircle, subtitle: "Requires review" },
]);
const [isLive, setIsLive] = useState(false);

const [productionData, setProductionData] = useState([]);

const operatorName = userId || 'Operator'

const [isConnecting, setIsConnecting] = useState(false);



// useEffect to fetch lines:
useEffect(() => {
  if (!getToken()) {
    navigate("/login");
    return;
  }

  const fetchLines = async () => {
    const res = await getLines();
    setLines(res?.data?.data || []);
  };

  fetchLines();
}, [navigate]);

// Get ?lineId=2 from URL
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const lineIdFromUrl = params.get("lineId");

  if (lineIdFromUrl) {
    setSelectedLine(Number(lineIdFromUrl)); // convert to number if your IDs are numbers
  }
}, [location.search]);


//useEffect to fetch dashboard data for selected line

useEffect(() => {
  if (!selectedLine) return;



  const fetchDashboard = async () => {
    try {
      const response = await getDashboardData(selectedLine);
      const dashboard = response.data || {};




      // ---------------- Summary tiles ----------------
      setSummaryTiles([
        {
          label: "Planned Quantity",
          value: dashboard.plannedQty ?? 0,
          icon: ClipboardList,
          subtitle: "Shift target",
        },
        {
          label: "Actual Quantity",
          value: dashboard.actualQty ?? 0,
          icon: CheckCircle2,
          subtitle: "Confirmed output",
        },
        {
          label: "OK Quantity",
          value: dashboard.okQty ?? 0,
          icon: ShieldCheck,
          subtitle: "Passed QA",
        },
        {
          label: "NOK Quantity",
          value: dashboard.nokQty ?? 0,
          icon: XCircle,
          subtitle: "Requires review",
        },
      ]);

      // update donut state
      setDashboardData({
        plannedQty: dashboard.plannedQty ?? 0,
        actualQty: dashboard.actualQty ?? 0,
        okQty: dashboard.okQty ?? 0,
        nokQty: dashboard.nokQty ?? 0,
      });

        setProductionData(dashboard.hourWiseReportData || []);
    } catch (err) {
      console.error("Dashboard API error", err);
    }
  };

  fetchDashboard();
}, [selectedLine]);

// Auto-select first line
useEffect(() => {
  if (lines.length > 0 && !selectedLine) {
    setSelectedLine(lines[0].id); 
  }
}, [lines,selectedLine]);


//filter logic for production

const currentHour = new Date().getHours();
const filteredProductionData = productionData.map(item => {
  const hourNum = parseInt(item.interval.slice(0, 2)); // "13:00:00" -> 13
  return {
    hour: item.interval.slice(0,5), // "13:00"
    production: hourNum <= currentHour + 1 ? item.actualQuantity : null,
    target: item.planQuantity,
  };
});


// Inside your component render, just before the donut SVG
const total = dashboardData.actualQty || 0;
const okPercent = total > 0 ? Math.round((dashboardData.okQty / total) * 100) : 0;
const nokPercent = total > 0 ? 100 - okPercent : 0;
const strokeLength = (okPercent / 100) * donutCircumference;
const okDash = `${strokeLength} ${donutCircumference}`;



// ---------------- WebSocket ----------------
useEffect(() => {
  if (!selectedLine) return;

const ws = new WebSocket(WS_BASE_URL);
  socketRef.current = ws;

  setIsConnecting(true);

  ws.onopen = () => {
    console.log("✅ WebSocket connected");
    setIsLive(true);
    setIsConnecting(false);
  };

  ws.onmessage = (event) => {
    let message;
    console.log("data received")
    try {
      message = JSON.parse(event.data);
    } catch {
      console.log("data error")
      return;
    }
    console.log(message.topic)
    console.log(message.lineId)

    if (message.topic !== "dashboard") return;
    if(message.lineId.toString() !== selectedLine.toString()) return;
    console.log("data ok")

    const dashboard = message;

    setSummaryTiles([
      { label: "Planned Quantity", value: dashboard.plannedQty ?? 0, icon: ClipboardList, subtitle: "Shift target" },
      { label: "Actual Quantity", value: dashboard.actualQty ?? 0, icon: CheckCircle2, subtitle: "Confirmed output" },
      { label: "OK Quantity", value: dashboard.okQty ?? 0, icon: ShieldCheck, subtitle: "Passed QA" },
      { label: "NOK Quantity", value: dashboard.nokQty ?? 0, icon: XCircle, subtitle: "Requires review" },
    ]);

    setDashboardData({
      plannedQty: dashboard.plannedQty ?? 0,
      actualQty: dashboard.actualQty ?? 0,
      okQty: dashboard.okQty ?? 0,
      nokQty: dashboard.nokQty ?? 0,
    });

    setProductionData(dashboard.hourWiseReportData ?? []);
  };

  ws.onerror = () => {
    console.log("❌ WebSocket error");
    setIsConnecting(false);
    setIsLive(false);
  };

  ws.onclose = () => {
    console.log("⚡ WebSocket closed");
    setIsLive(false);
    setIsConnecting(false);
  };

  // Cleanup on unmount
  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
    socketRef.current = null;
    setIsLive(false);
  };
}, [selectedLine]);


  return (
    <div className="dashboard-page space-y-6  h-screen w-full  mx-0 px-0">

      <PageHero
        title="Production Dashboard"
        // eyebrow="Operations"
        // description="Monitor shift performance, quality mix, and key production indicators in a refreshed, plant-inspired layout."
        icon={Factory}
        pill={
  <div
// onClick={() => {
//   if (isLive) {
//     disconnectWebSocket(); // go offline
//   } else {
//     connectWebSocket(); // try to go live
//   }
// }}
    className="flex items-center gap-2 text-sm font-semibold cursor-pointer"
  >
    <span
      className={`inline-flex h-2 w-2 rounded-full ${
        isLive ? "bg-emerald-300 shadow-[0_0_0_6px_rgba(16,185,129,0.35)]" : "bg-red-400"
      }`}
    />
    {isLive ? `Live sync ` : "Offline"}
  </div>
}
/>
      
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 w-full">
  {summaryTiles.map((tile, index) => (
  <StatsCard
    key={`${tile.label}-${index}`}   // ✅ FIX
    title={tile.label}
    value={tile.value}
    icon={tile.icon}
    subtitle={tile.subtitle}
      isDashboard={true}
   
  />
))}

</div>

      <div className="grid gap-4 lg:grid-cols-3  w-full flex-1">
        <div className="rounded-2xl bg-white/85 p-2 shadow-sm ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-800 lg:col-span-2 h-full">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1c75bc]/10 text-[#1c75bc] ring-1 ring-[#1c75bc]/20 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-200/35">
                <BarChart3 className="h-5 w-5" />
              </span>
              <div>
                {/* <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Production overview</p> */}
                <h3 className="text-3xl font-semibold text-slate-900 dark:text-white">Shift performance</h3>
              </div>
            </div>
            {/* <div className="flex items-center gap-2 rounded-full bg-[#1c75bc]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1c75bc] ring-1 ring-[#1c75bc]/20 dark:bg-amber-400/15 dark:text-amber-100 dark:ring-amber-200/35">
              <ArrowRight className="h-4 w-4" />
              Trendline
            </div> */}
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-lg font-semibold text-slate-800 ring-1 ring-slate-200 backdrop-blur dark:bg-slate-800/70 dark:text-slate-100 dark:ring-slate-700">
              <span className="h-2 w-2 rounded-full bg-[#1c75bc]" />
              Production
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-lg font-semibold text-slate-800 ring-1 ring-slate-200 backdrop-blur dark:bg-slate-800/70 dark:text-slate-100 dark:ring-slate-700">
              <span className="h-2 w-2 rounded-full bg-[#f97316]" />
              Target
            </div>
          </div>

<div className="mt-5 rounded-2xl bg-white/70 px-1 py-2 ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
                  
                  
  <div className="w-full h-96" >
    <ResponsiveContainer width="100%" height="100%" >
      <LineChart data={filteredProductionData} margin={{ top: 0, right: 70, left: 70, bottom: 0 }}>
        {/* <CartesianGrid stroke="#f0f0f0" /> */}
        <XAxis dataKey="hour" tickMargin={6}
    tick={{ fill: "#6b7280", fontSize: 12 }} />
    
        <YAxis width={30}
    tick={{ fill: "#6b7280", fontSize: 12 }}/>
        <Tooltip
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
          labelStyle={{
    color: document.documentElement.classList.contains("dark") ? "#34383d" : "#7b8694",
    fontWeight: "600",
    fontSize: 12,
  }}
/>
        {/* Production Line */}
        <Line
          type="monotone"
          dataKey="production"
          name="Production"
          stroke="#1c75bc"
          strokeWidth={4}
           dot={{ r: 4, fill: "#1c75bc", stroke: "none" }}
    activeDot={{ r: 7, fill: "#1c75bc", stroke: "none" }}
          connectNulls
        />

        {/* Target Line */}
        <Line
          type="monotone"
          dataKey="target"
          name="Target"
          stroke="#f97316"
          strokeWidth={3}
          dot={{ r: 4, fill: "#f97316", stroke: "none" }}
    activeDot={{ r: 6, fill: "#f97316", stroke: "none" }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>

        </div>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl bg-white/85 p-5 shadow-sm ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/70 dark:ring-slate-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1c75bc]/10 text-[#1c75bc] ring-1 ring-[#1c75bc]/20 dark:bg-amber-400/15 dark:text-amber-200 dark:ring-amber-200/35">
                <GaugeCircle className="h-5 w-5" />
              </span>
              <div>
                {/* <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Component status</p> */}
                <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">Quality Status</h2>
              </div>
            </div>
            {/* <div className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800/60 dark:text-slate-200 dark:ring-slate-700">
              Auto refresh
            </div> */}
          </div>

          <div className="flex flex-wrap items-center gap-4">
             <div className="donut-wrapper w-full flex justify-center">
              <div className="donut-surface">
                <div className="donut-ambient" />
                <svg className="donut" viewBox="0 0 220 220" role="img" aria-label="Quality mix chart">
                  <defs>
                    <linearGradient id="okGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--brand-amber-300)" />
                      <stop offset="55%" stopColor="var(--brand-orange-400)" />
                      <stop offset="100%" stopColor="var(--brand-orange-600)" />
                    </linearGradient>
                    <linearGradient id="trackGradient" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.9)" />
                      <stop offset="100%" stopColor="rgba(243, 111, 33, 0.18)" />
                    </linearGradient>
                    <radialGradient id="haloGradient" cx="50%" cy="50%" r="60%">
                      <stop offset="0%" stopColor="rgba(255, 183, 94, 0.3)" />
                      <stop offset="100%" stopColor="rgba(243, 111, 33, 0)" />
                    </radialGradient>
                  </defs>

                  <circle className="donut-track" cx="110" cy="110" r={donutRadius}  />
                  <circle className="donut-halo" cx="110" cy="110"  r={donutRadius + 9} />
                  <circle
                    className="donut-arc"
                    cx="110"
                    cy="110"
                    r={donutRadius}
                    strokeDasharray={okDash}
                    strokeLinecap="butt"
                    style={{ strokeLinecap: "butt" }}
                  />
                  <circle className="donut-ring" cx="110" cy="110" r={donutRadius}  />
                </svg>
                <div className="donut-center">
                  <span className="pill">Quality</span>
                  <strong>{okPercent}%</strong>
                  <span>OK rate</span>
                  <p className="donut-subtext">NOK {nokPercent}%</p>
                </div>
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-2xl font-semibold text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:text-slate-100 dark:ring-slate-700">
                <span className="legend-dot legend-ok" />
                OK · <span className="text-2xl">{okPercent}%</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-2xl font-semibold text-slate-900 ring-1 ring-slate-200 dark:bg-slate-800/70 dark:text-slate-100 dark:ring-slate-700">
                <span className="legend-dot legend-nok" />
                NOK ·<span className="text-2xl"> {nokPercent}%</span>
              </div>
              {/* <div className="flex items-center gap-2 rounded-xl bg-[#1c75bc]/10 px-3 py-2 text-sm font-semibold text-[#1c75bc] ring-1 ring-[#1c75bc]/20 dark:bg-amber-400/15 dark:text-amber-100 dark:ring-amber-200/35">
                <Activity className="h-4 w-4" />
                Real-time inspection feed
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
