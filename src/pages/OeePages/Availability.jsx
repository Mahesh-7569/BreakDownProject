import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  Activity,
  User,
  AlertTriangle,
  CalendarDays,
  Settings,
  CheckCircle2,
  FileText,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { getDashboardMachines } from "../../services/dashboardService";
import {
  getShiftMasters,
  getTimelineData,
  getCategories,
  getMachineStatuses,
  getReasonsByCategory,
  saveUpdateLog,
  getAllocationData,
  getAllReasons,
} from "../../services/AvailabilityService";
import PageHero from "../../components/PageHero";

// We removed the hardcoded colors, but we still need to know which icons to map to which status
const STATUS_ICONS = {
  auto: Activity,
  manual: User,
  error: AlertTriangle,
  breakdown: AlertTriangle,
  setup: Settings,
  logged: FileText,
  resolved: CheckCircle2,
};

const timeStringToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours - 8) * 60 + minutes;
};

// CHART COMPONENT
const RechartsStackedBarChart = ({ machineStats, colorMap }) => {
  const dynamicKeys = useMemo(() => {
    const keys = new Set();
    machineStats.forEach((m) =>
      Object.keys(m).forEach((k) => k !== "name" && keys.add(k)),
    );
    return Array.from(keys);
  }, [machineStats]);

  const activeKeysWithData = useMemo(() => {
    return dynamicKeys.filter((key) =>
      machineStats.some((machine) => machine[key] > 0),
    );
  }, [dynamicKeys, machineStats]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const validPayload = payload.filter((entry) => entry.value > 0);

      if (validPayload.length === 0) return null;

      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-xl min-w-[200px]">
          <p className="font-bold text-slate-800 text-sm mb-2 pb-2 border-b border-slate-100">
            {label}
          </p>
          <div className="flex flex-col gap-2">
            {validPayload.map((entry, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: entry.color }}
                  ></span>
                  <span className="text-slate-600 font-medium capitalize">
                    {entry.name}
                  </span>
                </div>
                <span className="text-slate-800 font-bold ml-6">
                  {entry.value} min
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!machineStats || machineStats.length === 0 || dynamicKeys.length === 0) {
    return (
      <div className="flex flex-col w-full h-full min-h-[250px] items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <Activity className="text-slate-300 mb-2" size={24} />
        <p className="text-slate-500 text-sm font-medium">
          No allocation data available.
        </p>
        <p className="text-slate-400 text-xs mt-1">
          Update machine segments to see the chart.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full" style={{ minHeight: "250px" }}>
      <h3 className="text-slate-800 font-bold text-sm mb-4 flex-shrink-0">
        Overall Time Allocation
      </h3>

      <div className="flex-1 w-full relative" style={{ minHeight: "200px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={machineStats}
            margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="name"
              fontSize={10}
              tick={{ fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              fontSize={10}
              tickFormatter={(tick) => `${tick}m`}
              tick={{ fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />

            {/* Tooltip remains active */}
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />

            {/* 🚨 THE <Legend /> COMPONENT HAS BEEN REMOVED FROM HERE 🚨 */}

            {activeKeysWithData.map((key) => {
              const backendColor = colorMap[key.toLowerCase()] || "#cbd5e1";
              return (
                <Bar
                  key={key}
                  dataKey={key}
                  name={key}
                  fill={backendColor}
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const formatTime = (minutes) => {
  const totalMins = 8 * 60 + minutes;
  const h = Math.floor(totalMins / 60);
  const m = Math.floor(totalMins % 60);
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
};

const formatDuration = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

const getTodayDate = () => {
  return new Date().toISOString().split("T")[0];
};

export default function Availability() {
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState("");
  const [machines, setMachines] = useState([]);
  const [selectedMachineIds, setSelectedMachineIds] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [allocationData, setAllocationData] = useState([]);
  const [isMachineOpen, setIsMachineOpen] = useState(false);
  const [selection, setSelection] = useState({
    machineIndex: null,
    segments: [],
  });
  const [customDate, setCustomDate] = useState(getTodayDate());
  const [categories, setCategories] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [editCategory, setEditCategory] = useState("");
  const [editStatus, setEditStatus] = useState("Error");
  const [editReason, setEditReason] = useState("");
  const [editRemark, setEditRemark] = useState("");
  const [shiftConfig, setShiftConfig] = useState({
    startMinutes: 480,
    totalMinutes: 480,
    labels: [],
  });
  const [dbStatuses, setDbStatuses] = useState([]);
  const [allReasons, setAllReasons] = useState([]);
  const updateTimelineConfig = (shift) => {
    const startMins = timeStringToMinutes(shift.startTime);
    const endMins = timeStringToMinutes(shift.endTime);
    const duration = endMins - startMins;

    const labels = [];
    const totalHours = duration / 60;
    for (let i = 0; i <= totalHours; i++) {
      const timeVal = startMins + i * 60;
      labels.push(formatTime(timeVal - 480)); // 480 = 8:00 AM
    }
    setShiftConfig({ startMinutes: startMins, totalMinutes: duration, labels });
  };

  // Initial Load
  // Availability.js
  const [machineStatuses, setMachineStatuses] = useState([]);

  useEffect(() => {
    const init = async () => {
      // Add getMachineStatuses() here
      const [shiftRes, machineRes, catRes, reasonsRes, statusRes] =
        await Promise.all([
          getShiftMasters(),
          getDashboardMachines(),
          getCategories(),
          getAllReasons(),
          getMachineStatuses(),
        ]);

      setShifts(shiftRes || []);
      setMachines(machineRes || []);
      setCategories(catRes || []);
      setAllReasons(reasonsRes || []);
      setMachineStatuses(statusRes || []); // Save statuses

      if (shiftRes?.length > 0) setSelectedShift(shiftRes[0].id);
      if (machineRes?.length > 0)
        setSelectedMachineIds(machineRes.slice(0, 3).map((m) => m.assetId));
    };
    init();
  }, []);

  const statusColorMap = useMemo(() => {
    const map = {};
    machineStatuses.forEach((s) => {
      // 🚨 FIX: Use 'description' and 'rgbColor' matching your actual API response
      if (s.description && s.rgbColor) {
        map[s.description.toLowerCase()] = s.rgbColor;
      }
    });
    return map;
  }, [machineStatuses]);

  // Filter reasons locally based on the selected editCategory
  const filteredReasons = useMemo(() => {
    if (!editCategory || !allReasons.length) return [];

    return allReasons.filter(
      (r) =>
        r.downtimeCategoryId === parseInt(editCategory) && r.isActive === true,
    );
  }, [editCategory, allReasons]);

  // Clear the selected reason when the category changes so it doesn't hold an invalid ID
  useEffect(() => {
    setEditReason("");
  }, [editCategory]);

  // Refresh Data
  const refreshData = async () => {
    if (!selectedShift || selectedMachineIds.length === 0) return;
    const ids = selectedMachineIds.join(",");

    const [timeline, allocation] = await Promise.all([
      getTimelineData(customDate, selectedShift, ids),
      getAllocationData(customDate, selectedShift, ids),
    ]);

    setTimelineData(
      (timeline || []).map((m) => ({
        ...m,
        id: m.assetId,
        name: m.machineName,
        segments: (m.segments || []).map((seg) => ({
          ...seg,
          start: timeStringToMinutes(seg.startTime),
          end: timeStringToMinutes(seg.endTime),
          originalStart: seg.startTime,
          originalEnd: seg.endTime,
          status: seg.label,
          color: seg.color, // ensures backend color is kept
        })),
      })),
    );
    setAllocationData(allocation || []);
  };

  useEffect(() => {
    refreshData();
  }, [customDate, selectedShift, selectedMachineIds]);

  const handleSaveUpdate = async () => {
    if (selection.machineIndex === null || selection.segments.length === 0)
      return;

    // 1. Identify if the selected category is "Others"
    const selectedCatObj = categories.find(
      (c) => c.id.toString() === editCategory.toString(),
    );
    const isOthersCategory =
      selectedCatObj &&
      selectedCatObj.description.toLowerCase().includes("other");

    // 2. Validation Checks
    if (!editCategory) {
      alert("Please select a Category.");
      return;
    }

    if (isOthersCategory) {
      // If 'Others', Remark is mandatory
      if (!editRemark || !editRemark.trim()) {
        alert("Please provide a Remark when selecting 'Others'.");
        return;
      }
    } else {
      // If NOT 'Others', Reason is mandatory
      if (!editReason) {
        alert("Please select a Reason.");
        return;
      }
    }

    const machine = timelineData[selection.machineIndex];

    for (const segIndex of selection.segments) {
      const seg = machine.segments[segIndex];
      const payload = {
        assetId: machine.id,
        shiftId: parseInt(selectedShift),
        machineStatusEventId: seg.eventId,
        categoryId: parseInt(editCategory),
        // 3. Fix the NaN Error: Send null if editReason is empty
        reasonId: editReason ? parseInt(editReason) : null,
        loggedBy: 99,
        startDateTime: `${customDate}T${seg.originalStart}`,
        endDateTime: `${customDate}T${seg.originalEnd}`,
        remark: editRemark,
      };
      await saveUpdateLog(payload);
    }

    await refreshData();
    setSelection({ machineIndex: null, segments: [] });
    setEditCategory("");
    setEditReason("");
    setEditRemark("");
  };
  const toggleMachine = (id) => {
    setSelectedMachineIds((prev) =>
      prev.includes(id) ? prev.filter((mId) => mId !== id) : [...prev, id],
    );
  };

  const machineStats = useMemo(() => {
    const formattedStats = allocationData.map((m) => {
      const stat = { name: m.machineName || "Unknown Machine" };
      m.allocations?.forEach((a) => {
        // Safely check if label exists before converting to lowercase
        if (a && a.label) {
          stat[a.label.toLowerCase()] = a.totalMinutes || 0;
        }
      });
      return stat;
    });

    // Check your browser console! If this prints an empty array [], the API is not returning allocation data.
    console.log("Chart Data to Render:", formattedStats);

    return formattedStats;
  }, [allocationData]);

  // SWEEPER: Extracts ALL colors from your backend APIs to use globally across the UI
  const backendColorMap = useMemo(() => {
    const map = {};

    allocationData.forEach((m) => {
      m.allocations?.forEach((a) => {
        if (a.color) map[a.label.toLowerCase()] = a.color;
      });
    });

    timelineData.forEach((m) => {
      m.segments?.forEach((seg) => {
        if (seg.color) map[seg.status.toLowerCase()] = seg.color;
      });
    });

    // Provide default fallbacks just in case the backend hasn't sent data for these yet
    // if (!map['auto']) map['auto'] = '#34d399';
    // if (!map['manual']) map['manual'] = '#fbbf24';
    // if (!map['error']) map['error'] = '#f43f5e';

    return map;
  }, [allocationData, timelineData]);

  // HELPER VARIABLES FOR THE UI
  const selectedMachine = useMemo(() => {
    if (
      selection.machineIndex !== null &&
      timelineData[selection.machineIndex]
    ) {
      return timelineData[selection.machineIndex];
    }
    return null;
  }, [selection.machineIndex, timelineData]);

  const sortedSegments = useMemo(() => {
    return [...selection.segments].sort((a, b) => a - b);
  }, [selection.segments]);

  // THE CLICK HANDLER
  const handleSegmentClick = (mIndex, sIndex, seg) => {
    if (seg.status === "Auto") return;

    setEditStatus(seg.status);

    setSelection((prev) => {
      if (prev.machineIndex !== mIndex) {
        return { machineIndex: mIndex, segments: [sIndex] };
      }
      const isSelected = prev.segments.includes(sIndex);
      const newSegments = isSelected
        ? prev.segments.filter((i) => i !== sIndex)
        : [...prev.segments, sIndex];

      return { machineIndex: mIndex, segments: newSegments };
    });
  };

  const isSelected = selection.segments.length > 0;
  const isFormDisabled = editStatus === "Auto";
  const firstSeg = selectedMachine?.segments?.[sortedSegments[0]];
  const lastSeg =
    selectedMachine?.segments?.[sortedSegments[sortedSegments.length - 1]];
  // Helper to know if "Others" is selected
  const isOthersSelected = useMemo(() => {
    const cat = categories.find(
      (c) => c.id.toString() === editCategory.toString(),
    );
    return cat ? cat.description.toLowerCase().includes("other") : false;
  }, [editCategory, categories]);

  return (
    <div className="h-screen bg-[#F8FAFC] p-3 font-sans flex flex-col gap-3 overflow-hidden">
      <div className="flex-shrink-0 -my-2">
        <PageHero
          title="Machine Availability"
          eyebrow="Timeline"
          description="Monitor machine states and quickly update irregular segments."
          icon={Activity}
        />
      </div>

      {/* FILTER SECTION */}
      <div className="flex-shrink-0 rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex items-center justify-between overflow-visible">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Machine Actions
          </p>
          <p className="text-sm text-slate-600">
            Filter and browse machine availability records.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center">
            <CalendarDays
              size={14}
              className="absolute left-3 text-indigo-600 pointer-events-none"
            />
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white text-slate-700 cursor-pointer transition-colors"
            />
          </div>

          <div className="relative">
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 py-1.5 pl-3 pr-8 text-xs font-medium bg-white cursor-pointer outline-none hover:bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shiftName || `Shift ${s.id}`}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2 top-2 text-slate-400 pointer-events-none"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsMachineOpen(!isMachineOpen)}
              className="flex items-center justify-between w-32 appearance-none rounded-lg border border-slate-200 py-1.5 pl-3 pr-2 text-xs font-medium bg-white cursor-pointer outline-none hover:bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <span className="text-slate-700 truncate">Machines</span>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${isMachineOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isMachineOpen && (
              <div className="absolute right-0 mt-1.5 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 flex flex-col gap-1 max-h-60 overflow-y-auto">
                {machines.map((m) => (
                  <label
                    key={m.assetId}
                    className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMachineIds.includes(m.assetId)}
                      onChange={() => toggleMachine(m.assetId)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-slate-700">
                      {m.machineName}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          <div className="flex-[3] rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-0">
            <div className="flex items-center border-b border-slate-100 px-4 py-2.5 text-[10px] font-bold text-slate-500 bg-slate-50/80 uppercase tracking-wider flex-shrink-0">
              <div className="w-40 flex-shrink-0">Machine Name</div>
              <div className="flex-grow relative h-3 mr-2">
                {shiftConfig.labels.map((label, i) => (
                  <div
                    key={i}
                    className="absolute top-0 transform -translate-x-1/2 text-center"
                    style={{
                      left: `${(i / (shiftConfig.totalMinutes / 60)) * 100}%`,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 p-3 overflow-y-auto">
              {timelineData.map((machine, mIndex) => (
                <div
                  key={machine.id}
                  className="relative z-10 hover:z-50 flex items-center px-2 py-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="flex w-40 flex-shrink-0 items-center space-x-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                      <Settings size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {machine.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {machine.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-grow relative h-8 bg-slate-100 rounded mr-2 ring-1 ring-slate-200">
                    {machine.segments.map((seg, sIndex) => {
                      const widthPercent =
                        ((seg.end - seg.start) / shiftConfig.totalMinutes) *
                        100;
                      const isSegSelected =
                        selection.machineIndex === mIndex &&
                        selection.segments.includes(sIndex);

                      // Inject the backend color dynamically
                      const segmentColor =
                        seg.color ||
                        backendColorMap[seg.status?.toLowerCase()] ||
                        "#cbd5e1";

                      return (
                        <div
                          key={seg.eventId || sIndex}
                          style={{
                            width: `${widthPercent}%`,
                            backgroundColor: segmentColor,
                          }}
                          className={`relative group h-full transition-all border-r border-white/20 last:border-0
                            ${seg.status === "Auto" ? "cursor-not-allowed" : "cursor-pointer hover:z-[99]"}
                            ${isSegSelected ? "ring-[2px] ring-black ring-inset brightness-110 z-10" : "hover:brightness-110 opacity-95 hover:opacity-100"}
                            ${sIndex === 0 ? "rounded-l" : ""} ${sIndex === machine.segments.length - 1 ? "rounded-r" : ""}
                          `}
                          onClick={() =>
                            handleSegmentClick(mIndex, sIndex, seg)
                          }
                        >
                          {/* Tooltip Wrapper */}
                          {/* Tooltip Wrapper */}
                          <div
                            className={`hidden group-hover:block absolute left-1/2 -translate-x-1/2 w-max z-[999] drop-shadow-xl pointer-events-none
  ${mIndex === 0 ? "top-full mt-2" : "bottom-full mb-2"}
`}
                          >
                            <div className="bg-slate-800 text-slate-100 text-xs rounded-lg shadow-xl border border-slate-700 p-2 min-w-[130px]">
                              <div className="flex items-center space-x-1 border-b border-slate-600 pb-1 mb-1">
                                <Clock size={12} className="text-slate-400" />
                                <span className="font-bold">
                                  {formatTime(seg.start)} -{" "}
                                  {formatTime(seg.end)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-slate-400">Status:</span>
                                <span
                                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
                                  style={{ backgroundColor: segmentColor }}
                                >
                                  {seg.status}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`absolute left-1/2 -translate-x-1/2 border-[5px] border-transparent 
                              ${mIndex === 0 ? "bottom-full border-b-slate-800" : "top-full border-t-slate-800"}
                            `}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-[2] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm p-4 min-h-0">
            {/* Pass the dynamic color map to the chart */}
            <RechartsStackedBarChart
              machineStats={machineStats}
              colorMap={backendColorMap}
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="w-[360px] flex flex-col gap-3 flex-shrink-0 min-h-0">
          {/* UPDATE FORM CONTAINER */}
          <div
            className={`flex-1 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 relative overflow-hidden ${!isSelected ? "opacity-60 pointer-events-none grayscale-[0.5]" : "ring-1 ring-indigo-100 shadow-md"}`}
          >
            {isSelected && (
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600 z-10"></div>
            )}

            <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                <span className="bg-white shadow-sm text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200">
                  <FileText size={16} />
                </span>
                Update Segments
              </h2>
            </div>

            <div className="p-5 flex-1 flex flex-col overflow-y-auto min-h-0">
              {isSelected && selectedMachine && sortedSegments.length > 0 ? (
                <div className="mb-4 p-3 bg-indigo-50/30 rounded-xl border border-indigo-100 flex flex-col gap-1 flex-shrink-0">
                  <p className="text-indigo-700 font-bold text-sm">
                    {selection.segments.length} Selected
                  </p>
                  <p className="text-slate-600 text-xs font-medium">
                    From{" "}
                    <b>{firstSeg ? formatTime(firstSeg.start) : "--:--"}</b>
                    to <b>{lastSeg ? formatTime(lastSeg.end) : "--:--"}</b>
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-sm text-slate-500 font-medium flex-shrink-0">
                  Click Manual or Error segments to update.
                </div>
              )}

              <div className="mb-3 flex-shrink-0">
                <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Set Status
                </label>
                <div className="flex space-x-2 flex-wrap gap-y-2">
                  {/* STRICTLY DYNAMIC: Loops exactly over what your API provides, nothing else. */}
                  {machineStatuses.map((s, index) => {
                    // We grab 'description' based on the JSON you showed me
                    const key = s.description;

                    if (!key) return null;

                    // Get color from the map we built using s.rgbColor
                    const btnColor =
                      statusColorMap[key.toLowerCase()] || "#94a3b8";
                    const isActive = editStatus === key;
                    const IconComp =
                      STATUS_ICONS[key.toLowerCase()] || Settings;

                    return (
                      <button
                        key={s.id || index}
                        onClick={() => {
                          setEditStatus(key);
                          if (key === "Auto") {
                            setEditReason("");
                            setEditRemark("");
                          }
                        }}
                        style={
                          isActive
                            ? {
                                backgroundColor: btnColor,
                                borderColor: btnColor,
                                color: "white",
                              }
                            : {}
                        }
                        className={`flex-1 min-w-[30%] py-2.5 rounded-xl text-xs font-bold border transition-all flex justify-center items-center gap-2 shadow-sm
            ${!isActive ? "bg-white text-slate-600 border-slate-200 hover:bg-slate-50" : "text-white"}
          `}
                      >
                        <IconComp size={14} />
                        <span>{key}</span>
                      </button>
                    );
                  })}

                  {/* Optional: A tiny message so you know if the API failed to send data */}
                  {machineStatuses.length === 0 && (
                    <span className="text-xs text-slate-400 italic py-2">
                      Loading statuses from API...
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-3 flex-shrink-0">
                <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Category <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={editCategory}
                    onChange={(e) => {
                      setEditCategory(e.target.value);
                      setEditReason("");
                    }}
                    disabled={isFormDisabled}
                    className="w-full appearance-none rounded-xl border py-2.5 px-3 text-sm font-medium outline-none bg-white"
                  >
                    <option value="">✅ Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3 flex-shrink-0">
                <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Reason{" "}
                  {!isOthersSelected && (
                    <span className="text-rose-500">*</span>
                  )}
                </label>
                <div className="relative">
                  <select
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    disabled={
                      isFormDisabled ||
                      !editCategory ||
                      (isOthersSelected && filteredReasons.length === 0)
                    }
                    className="w-full appearance-none rounded-xl border py-2.5 px-3 text-sm font-medium outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {isOthersSelected && filteredReasons.length === 0
                        ? "Not required for Others"
                        : "✅ Select Reason..."}
                    </option>
                    {filteredReasons.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.reasonName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-[70px] mb-4">
                <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Remark
                  {isOthersSelected ? (
                    <span className="text-rose-500 ml-1">* (Required)</span>
                  ) : (
                    <span className="text-slate-400 font-normal lowercase">
                      {" "}
                      (Optional)
                    </span>
                  )}
                </label>
                <textarea
                  value={editRemark}
                  onChange={(e) => setEditRemark(e.target.value)}
                  disabled={isFormDisabled}
                  placeholder={
                    isFormDisabled
                      ? "Not applicable for Auto status."
                      : "Type additional details here..."
                  }
                  className={`flex-1 w-full rounded-xl border py-3 px-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none transition-all ${isFormDisabled ? "bg-slate-100 text-slate-400" : "bg-white"}`}
                ></textarea>
              </div>
              <button
                onClick={handleSaveUpdate}
                className="mt-auto w-full flex-shrink-0 flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-bold text-white hover:bg-indigo-700 active:scale-[0.98] transition-transform shadow-md"
              >
                <CheckCircle2 size={18} />
                <span>Save & Update</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
