import { useEffect, useMemo, useState, useRef } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  Download,
  Inbox,
  Sun,
  Tag,
  CheckCircle2,
  Clock,
  TrendingUp,
  Timer,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import PageHero from "../../components/PageHero";
import { CSVLink } from "react-csv";

import { getShiftMasters } from "../../services/AvailabilityService";
import {
  getDelayLogReportByCategory,
  getDelayStatuses,
  getDelayCategories,
} from "../../services/Delaylogservice";

// Utility to safely extract arrays from API responses
const getArray = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

// Natural sort so e.g. "Category 2" comes before "Category 10" - plain string sort
// would put "Category 10" right after "Category 1" since it compares character by
// character.
const naturalCompare = (a, b) =>
  (a || "").localeCompare(b || "", undefined, {
    numeric: true,
    sensitivity: "base",
  });

// Format a duration (in minutes, possibly a decimal from the backend) for display.
// Format a duration (minutes, possibly a decimal from the backend) as HH:MM:SS.
const formatDuration = (mins) => {
  const totalSeconds = Math.round(Number(mins || 0) * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

// Force YYYY-MM-DD into DD-MM-YYYY for display on the click-to-open date fields.
const formatToDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}-${m}-${y}`;
};

const formatClock = (isoString) => {
  if (!isoString) return "-";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "-";
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
};

const mapReportRow = (row, i) => {
  // Three statuses now: Open -> Attended -> Closed. Only "Closed" means the delay
  // has actually finished - Open and Attended are both still live, so neither has
  // a real resumeTime/duration to trust from the backend yet. Keep counting elapsed
  // time from stopTime up to right now for both instead.
  const isFinished = (row.status || "").toLowerCase() === "closed";

  let durationMins;
  if (!isFinished) {
    const stop = new Date(row.stopTime);
    durationMins = Number.isNaN(stop.getTime())
      ? 0
      : Math.max(0, Math.round((Date.now() - stop.getTime()) / 60000));
  } else {
    // Backend can send duration as a double (e.g. 42.7 mins) - use parseFloat so
    // the fractional part isn't truncated the way parseInt would truncate it.
    durationMins = row.duration ? parseFloat(row.duration) || 0 : 0;
  }

  return {
    id: i,
    date: row.date,
    shift: row.shift,
    asset: row.asset,
    category: row.category,
    reason: row.reason || "-",
    stopTime: formatClock(row.stopTime),
    resumeTime: isFinished
      ? row.resumeTime
        ? formatClock(row.resumeTime)
        : "-"
      : "Ongoing",
    durationMins,
    status: row.status,
    operatorRemarks: row.operatorRemarks,
  };
};

const getLocalDate = (offsetDays = 0) => {
  const now = new Date();
  now.setDate(now.getDate() + offsetDays);
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export default function DelayCategoryReport() {
  const today = getLocalDate();
  const previousDay = getLocalDate(-1);

  const [shifts, setShifts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [selectedShiftId, setSelectedShiftId] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  // Main filter defaults: From Date starts on the previous day, To Date on today.
  const [fromDate, setFromDate] = useState(previousDay);
  const [toDate, setToDate] = useState(today);

  // Refs so the visible click-to-open date fields can trigger the hidden native
  // date inputs' picker, same pattern as the OEE report page.
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);

  // Custom dropdown open/closed toggles for Shift / Category / Status.
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Date picked in the "Downtime by Category" chart's own dropdown - independent of
  // the main filter's fromDate/toDate range, but constrained to dates within it.
  const [selectedChartDate, setSelectedChartDate] = useState("");

  // Category picked in the "Downtime Trend" chart's own dropdown - "" means All
  // Categories (single aggregate line), otherwise just that category's trend line.
  const [selectedTrendCategory, setSelectedTrendCategory] = useState("");
  // Asset picked in the same chart's second dropdown - independent of the category
  // pick, so you can slice the trend by category, asset, or both together.
  // const [selectedTrendAsset, setSelectedTrendAsset] = useState("");

  // ================= SHIFT + CATEGORY + STATUS DROPDOWNS =================
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [shiftRes, categoryRes, statusRes] = await Promise.all([
          getShiftMasters(),
          getDelayCategories(),
          getDelayStatuses(),
        ]);

        setShifts(
          getArray(shiftRes).map((s) => ({
            id: s.id,
            name: s.shiftName || s.name,
          })),
        );
        // Your DelayCategoryDTO exposes the display name as "description" (same
        // field used everywhere else in the app for this DTO).
        setCategories(
          getArray(categoryRes)
            .map((c) => ({
              id: c.id,
              name: c.description || c.categoryName || c.name || c.title,
              rgbColor: c.rgbColor,
            }))
            .sort((x, y) => naturalCompare(x.name, y.name)),
        );
        setStatuses(getArray(statusRes));
      } catch (error) {
        console.error("Failed to fetch filter options", error);
        setShifts([]);
        setCategories([]);
        setStatuses([]);
      }
    };
    loadFilters();
  }, []);

  // Load the report once automatically on first page load (with default filters:
  // previous day through today, all shifts/categories/status), instead of
  // requiring a manual Search click.
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ================= SEARCH =================
  const handleSearch = async () => {
    setLoading(true);
    try {
      // Backend's statusIds param expects an id, but our dropdown value is the
      // status description string - resolve the matching id here before calling.
      const statusObj = statuses.find((s) => s.description === selectedStatus);

      const rows = await getDelayLogReportByCategory({
        fromDate,
        toDate,
        shiftId: selectedShiftId || null,
        categoryId: selectedCategoryId || null,
        statusId: statusObj ? statusObj.id : null,
      });

      setLogs((rows || []).map(mapReportRow));
      setHasSearched(true);
    } catch (e) {
      console.error(e);
      setLogs([]);
    }
    setLoading(false);
  };

  const pagedLogs = useMemo(() => logs, [logs]);

  const totalDurationMins = useMemo(
    () => pagedLogs.reduce((sum, l) => sum + (l.durationMins || 0), 0),
    [pagedLogs],
  );
  // "Active Now" covers both Open and Attended - anything not yet Closed is still active.
  const openCount = useMemo(
    () => pagedLogs.filter((l) => l.status !== "Closed").length,
    [pagedLogs],
  );
  // Average/longest-delay stats only make sense against delays that have actually
  // finished - an Open or Attended delay's duration is still climbing live and
  // would skew these numbers if included.
  const closedLogs = useMemo(
    () => pagedLogs.filter((l) => l.status === "Closed"),
    [pagedLogs],
  );
  const avgDurationMins = useMemo(
    () =>
      closedLogs.length
        ? closedLogs.reduce((sum, l) => sum + (l.durationMins || 0), 0) /
          closedLogs.length
        : 0,
    [closedLogs],
  );
  // const longestDelay = useMemo(() => {
  //   if (!closedLogs.length) return null;
  //   return closedLogs.reduce((max, l) =>
  //     (l.durationMins || 0) > (max.durationMins || 0) ? l : max,
  //   );
  // }, [closedLogs]);

  // Reasons ranked by total minutes lost, not just how often they occur - a rare
  // but long reason often matters more for root-cause focus than a frequent blip.
  const topReasons = useMemo(() => {
    const map = new Map();
    pagedLogs.forEach((l) => {
      // mapReportRow falls back missing reasons to the literal string "-" -
      // treat that the same as "Uncategorized" here instead of showing "-" as
      // if it were a real reason name.
      const key = !l.reason || l.reason === "-" ? "Uncategorized" : l.reason;
      const prev = map.get(key) || { reason: key, count: 0, minutes: 0 };
      prev.count += 1;
      prev.minutes += l.durationMins || 0;
      map.set(key, prev);
    });
    return (
      Array.from(map.values())
        // A 0.0 mins entry (e.g. a delay that just started and hasn't accrued any
        // time yet) adds nothing to a "top reasons by downtime" ranking and can
        // crowd out an actual contributing reason from the top-5 slice.
        .filter((r) => r.minutes > 0)
        .sort((a, b) => b.minutes - a.minutes)
        .slice(0, 5)
    );
  }, [pagedLogs]);
  const maxReasonMinutes = topReasons[0]?.minutes || 1;

  // Downtime per calendar day, sorted chronologically - for the trend chart.
  const downtimeByDate = useMemo(() => {
    const map = new Map();
    pagedLogs.forEach((l) => {
      const key = l.date || "Unknown";
      map.set(key, (map.get(key) || 0) + (l.durationMins || 0));
    });
    return Array.from(map.entries())
      .map(([date, minutes]) => ({ date, minutes }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [pagedLogs]);

  // Keep the "Downtime by Category" date dropdown valid whenever the main filter's
  // results change. "" means "All Dates" - only reset to that if the previously
  // picked specific date falls out of range.
  useEffect(() => {
    const dates = downtimeByDate.map((d) => d.date);
    if (selectedChartDate && !dates.includes(selectedChartDate)) {
      setSelectedChartDate("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downtimeByDate]);

  // Per-category downtime for whichever date is picked in that dropdown - respects
  // whatever category is already narrowed down by the main filter above.
  const categoryBreakdownForSelectedDate = useMemo(() => {
    if (!selectedChartDate) return [];
    const map = new Map();
    pagedLogs
      .filter((l) => l.date === selectedChartDate)
      .forEach((l) => {
        const key = l.category || "Unknown";
        map.set(key, (map.get(key) || 0) + (l.durationMins || 0));
      });
    return Array.from(map.entries())
      .map(([category, minutes]) => ({ category, minutes }))
      .sort((a, b) => naturalCompare(a.category, b.category));
  }, [pagedLogs, selectedChartDate]);

  const categoryNames = useMemo(() => {
    const names = new Set();
    pagedLogs.forEach((l) => names.add(l.category || "Unknown"));
    return Array.from(names).sort(naturalCompare);
  }, [pagedLogs]);

  // Light pastel color per category, spread around the color wheel using the
  // golden angle so colors stay well-separated no matter how many categories
  // there are - unlike a fixed palette array, this never runs out or has to
  // repeat.
const categoryColorMap = useMemo(() => {
  const map = {};

  categories.forEach((category) => {
    map[category.name] = category.rgbColor || "#a5b4fc";
  });

  return map;
}, [categories]);

  // One row per date, with each category's downtime minutes as its own column -
  // feeds the grouped bar chart showing per-day totals broken down by category.
  const downtimeByDateAndCategory = useMemo(() => {
    const map = new Map();
    pagedLogs.forEach((l) => {
      const date = l.date || "Unknown";
      const category = l.category || "Unknown";
      if (!map.has(date)) map.set(date, { date });
      const row = map.get(date);
      row[category] = (row[category] || 0) + (l.durationMins || 0);
    });
    return Array.from(map.values()).sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [pagedLogs]);

  // Keep the "Downtime Trend" category dropdown valid whenever the main filter's
  // results change. If only one category is present (the main filter's own
  // Category dropdown already narrowed it down), auto-select it - there's no "All
  // Categories" option shown in that case since it would be redundant. Otherwise
  // fall back to "All Categories" if the picked category is no longer present.
  useEffect(() => {
    if (categoryNames.length === 1) {
      if (selectedTrendCategory !== categoryNames[0]) {
        setSelectedTrendCategory(categoryNames[0]);
      }
    } else if (
      selectedTrendCategory &&
      !categoryNames.includes(selectedTrendCategory)
    ) {
      setSelectedTrendCategory("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryNames]);

  // Downtime trend for just the category picked in that dropdown - same shape as
  // downtimeByDate but scoped to one category.
  const downtimeTrendForSelectedCategory = useMemo(() => {
    if (!selectedTrendCategory) return [];
    const map = new Map();
    pagedLogs
      .filter((l) => (l.category || "Unknown") === selectedTrendCategory)
      .forEach((l) => {
        const key = l.date || "Unknown";
        map.set(key, (map.get(key) || 0) + (l.durationMins || 0));
      });
    return Array.from(map.entries())
      .map(([date, minutes]) => ({ date, minutes }))
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [pagedLogs, selectedTrendCategory]);

  const csvData = useMemo(
    () =>
      pagedLogs.map((log) => ({
        Date: log.date,
        Shift: log.shift,
        Asset: log.asset,
        Category: log.category,
        Reason: log.reason,
        "Stop Time": log.stopTime,
        "Resume Time": log.resumeTime,
        "Duration (HH:MM:SS)": formatDuration(log.durationMins),
        Status: log.status,
        "Operator Remarks": log.operatorRemarks,
      })),
    [pagedLogs],
  );

  const thClass =
    "px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 text-left whitespace-nowrap sticky top-0 z-10 border-b border-slate-200";

  const dropdownListClass =
    "absolute z-[60] mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-[200px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";
  const dropdownItemClass = (active) =>
    `px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 capitalize ${
      active
        ? "bg-blue-50/50 font-bold text-blue-600"
        : "text-slate-700 font-medium"
    }`;

  return (
    <div className="p-4 space-y-4 bg-slate-50 min-h-screen">
      <PageHero
        eyebrow="Reports"
        title="Delay Category Report"
        icon={AlertTriangle}
      />

      {/* FILTER CARD - click-to-open dates + custom dropdown buttons, matching the OEE report page */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 w-full">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 items-end relative">
          {/* From Date */}
          <div className="col-span-1 relative">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
              From Date
            </label>
            <div
              onClick={() =>
                fromDateRef.current && fromDateRef.current.showPicker()
              }
              className="flex items-center justify-between border border-slate-200 px-3 py-1.5 text-xs rounded-lg bg-white cursor-pointer hover:border-blue-500/50 transition-all h-[34px]"
            >
              <span className="text-slate-800">
                {formatToDDMMYYYY(fromDate)}
              </span>
              <CalendarDays className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="date"
              ref={fromDateRef}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="absolute w-0 h-0 opacity-0 pointer-events-none"
            />
          </div>

          {/* To Date */}
          <div className="col-span-1 relative">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
              To Date
            </label>
            <div
              onClick={() =>
                toDateRef.current && toDateRef.current.showPicker()
              }
              className="flex items-center justify-between border border-slate-200 px-3 py-1.5 text-xs rounded-lg bg-white cursor-pointer hover:border-blue-500/50 transition-all h-[34px]"
            >
              <span className="text-slate-800">{formatToDDMMYYYY(toDate)}</span>
              <CalendarDays className="w-4 h-4 text-slate-500" />
            </div>
            <input
              type="date"
              ref={toDateRef}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="absolute w-0 h-0 opacity-0 pointer-events-none"
            />
          </div>

          {/* Shift */}
          <div className="col-span-1 relative">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
              Shift
            </label>
            <button
              type="button"
              onBlur={() => setIsShiftOpen(false)}
              onClick={() => setIsShiftOpen(!isShiftOpen)}
              className="flex w-full items-center justify-between border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-[34px] bg-white text-slate-700 transition-colors text-left capitalize"
            >
              <span className="truncate">
                {selectedShiftId
                  ? shifts.find((s) => String(s.id) === String(selectedShiftId))
                      ?.name || "All Shifts"
                  : "All Shifts"}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${isShiftOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isShiftOpen && (
              <ul className={dropdownListClass}>
                <li
                  onMouseDown={() => {
                    setSelectedShiftId("");
                    setIsShiftOpen(false);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                >
                  All Shifts
                </li>
                {shifts.map((s) => (
                  <li
                    key={s.id}
                    onMouseDown={() => {
                      setSelectedShiftId(s.id);
                      setIsShiftOpen(false);
                    }}
                    className={dropdownItemClass(
                      String(selectedShiftId) === String(s.id),
                    )}
                  >
                    {s.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Delay Category */}
          <div className="col-span-1 relative">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
              Delay Category
            </label>
            <button
              type="button"
              onBlur={() => setIsCategoryOpen(false)}
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex w-full items-center justify-between border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-[34px] bg-white text-slate-700 transition-colors text-left"
            >
              <span className="truncate">
                {selectedCategoryId
                  ? categories.find(
                      (c) => String(c.id) === String(selectedCategoryId),
                    )?.name || "All Categories"
                  : "All Categories"}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${isCategoryOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isCategoryOpen && (
              <ul className={dropdownListClass}>
                <li
                  onMouseDown={() => {
                    setSelectedCategoryId("");
                    setIsCategoryOpen(false);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                >
                  All Categories
                </li>
                {categories.map((c) => (
                  <li
                    key={c.id}
                    onMouseDown={() => {
                      setSelectedCategoryId(c.id);
                      setIsCategoryOpen(false);
                    }}
                    className={dropdownItemClass(
                      String(selectedCategoryId) === String(c.id),
                    )}
                  >
                    {c.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Status */}
          <div className="col-span-1 relative">
            <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
              Status
            </label>
            <button
              type="button"
              onBlur={() => setIsStatusOpen(false)}
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex w-full items-center justify-between border border-slate-200 px-3 py-1.5 text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-[34px] bg-white text-slate-700 transition-colors text-left"
            >
              <span className="truncate">{selectedStatus || "All Status"}</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${isStatusOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isStatusOpen && (
              <ul className={dropdownListClass}>
                <li
                  onMouseDown={() => {
                    setSelectedStatus("");
                    setIsStatusOpen(false);
                  }}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                >
                  All Status
                </li>
                {statuses.map((s) => (
                  <li
                    key={s.id}
                    onMouseDown={() => {
                      setSelectedStatus(s.description);
                      setIsStatusOpen(false);
                    }}
                    className={dropdownItemClass(
                      selectedStatus === s.description,
                    )}
                  >
                    {s.description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Search */}
          <div className="col-span-1">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-[#2B547E] hover:bg-[#1C3A5A] transition-colors text-white font-medium rounded-lg px-4 py-1.5 text-xs w-full disabled:opacity-70 h-[34px]"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* INSIGHTS: colorful bordered KPI cards + top reasons/charts, shown once a search has run */}
      {hasSearched && pagedLogs.length > 0 && (
        <>
          <div className="w-full flex flex-col gap-3 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Total Delays */}
              <div className="relative overflow-hidden bg-white rounded-2xl p-4 border border-slate-100 shadow-md shadow-[#45C4B0]/15 hover:shadow-lg hover:shadow-[#45C4B0]/30 hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-0 left-0 h-[3px] w-full bg-[#45C4B0]" />
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#45C4B0] truncate">
                      Total Delays
                    </p>
                    <h2 className="text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
                      {pagedLogs.length}
                    </h2>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#45C4B0]/10 border border-[#45C4B0]/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#45C4B0]" />
                  </div>
                </div>
              </div>

              {/* Active Now */}
              <div className="relative overflow-hidden bg-white rounded-2xl p-4 border border-slate-100 shadow-md shadow-[#D162C4]/15 hover:shadow-lg hover:shadow-[#D162C4]/30 hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-0 left-0 h-[3px] w-full bg-[#D162C4]" />
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#D162C4] truncate">
                      Active Now
                    </p>
                    <h2 className="text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
                      {openCount}
                    </h2>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#D162C4]/10 border border-[#D162C4]/20 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[#D162C4]" />
                  </div>
                </div>
              </div>

              {/* Total Downtime */}
              <div className="relative overflow-hidden bg-white rounded-2xl p-4 border border-slate-100 shadow-md shadow-[#45C4B0]/15 hover:shadow-lg hover:shadow-[#45C4B0]/30 hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-0 left-0 h-[3px] w-full bg-[#45C4B0]" />
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#45C4B0] truncate">
                      Total Delay Time
                    </p>
                    <h2 className="text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
                      {formatDuration(totalDurationMins)}
                    </h2>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#45C4B0]/10 border border-[#45C4B0]/20 flex items-center justify-center shrink-0">
                    <Timer className="w-5 h-5 text-[#45C4B0]" />
                  </div>
                </div>
              </div>

              {/* Avg Duration */}
              <div className="relative overflow-hidden bg-white rounded-2xl p-4 border border-slate-100 shadow-md shadow-[#D162C4]/15 hover:shadow-lg hover:shadow-[#D162C4]/30 hover:-translate-y-1 transition-all duration-300">
                <div className="absolute top-0 left-0 h-[3px] w-full bg-[#D162C4]" />
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#D162C4] truncate">
                      Avg Duration
                    </p>
                    <h2 className="text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
                      {formatDuration(avgDurationMins)}
                    </h2>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#D162C4]/10 border border-[#D162C4]/20 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#D162C4]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {topReasons.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Top Reasons by Delay Time
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {topReasons.map((r) => (
                  <div key={r.reason} className="flex items-center gap-3">
                    <span className="w-40 flex-shrink-0 text-xs font-medium text-slate-700 truncate">
                      {r.reason}
                    </span>
                    <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all"
                        style={{
                          width: `${(r.minutes / maxReasonMinutes) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-28 flex-shrink-0 text-xs text-slate-500 text-right">
                      {formatDuration(r.minutes)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Downtime trend across the selected date range - defaults to all
              categories (single aggregate line); pick a specific category on the
              right to narrow down to just that category's trend. */}
          {downtimeByDate.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Delay Time Trend
                </p>
                <div className="relative">
                  <Tag
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none"
                  />
                  <select
                    value={selectedTrendCategory}
                    onChange={(e) => setSelectedTrendCategory(e.target.value)}
                    className="appearance-none border border-slate-200 pl-8 pr-7 py-1.5 text-xs rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-700 cursor-pointer h-8"
                  >
                    {categoryNames.length > 1 && (
                      <option value="">All Categories</option>
                    )}
                    {categoryNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {selectedTrendCategory === "" ? (
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={downtimeByDate}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="date"
                        fontSize={10}
                        tick={{ fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        fontSize={10}
                        tickFormatter={(v) => `${v}m`}
                        tick={{ fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        cursor={{ stroke: "#c7d2fe", strokeWidth: 1 }}
                        formatter={(value) => [
                          `${formatDuration(value)}`,
                          "Downtime",
                        ]}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="minutes"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer>
                    <LineChart
                      data={downtimeTrendForSelectedCategory}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="date"
                        fontSize={10}
                        tick={{ fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        fontSize={10}
                        tickFormatter={(v) => `${v}m`}
                        tick={{ fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        cursor={{ stroke: "#c7d2fe", strokeWidth: 1 }}
                        formatter={(value) => [
                          `${formatDuration(value)}`,
                          selectedTrendCategory,
                        ]}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="minutes"
                        name={selectedTrendCategory}
                        stroke={
                          categoryColorMap[selectedTrendCategory] || "#6366f1"
                        }
                        strokeWidth={2.5}
                        dot={{
                          r: 4,
                          fill:
                            categoryColorMap[selectedTrendCategory] ||
                            "#6366f1",
                          strokeWidth: 0,
                        }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Category downtime bar chart - defaults to all dates (grouped bars per
              category, light well-separated colors); pick a specific date on the
              right to narrow down to just that day. */}
          {downtimeByDate.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Delay Time by Category
                </p>
                <div className="relative">
                  <CalendarDays
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none"
                  />
                  <select
                    value={selectedChartDate}
                    onChange={(e) => setSelectedChartDate(e.target.value)}
                    className="appearance-none border border-slate-200 pl-8 pr-7 py-1.5 text-xs rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white text-slate-700 cursor-pointer h-8"
                  >
                    <option value="">All Dates</option>
                    {downtimeByDate.map((d) => (
                      <option key={d.date} value={d.date}>
                        {d.date}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                </div>
              </div>

              {selectedChartDate === "" ? (
                <div style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={downtimeByDateAndCategory}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                      barCategoryGap="35%"
                      barGap={4}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="date"
                        fontSize={10}
                        tick={{ fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        fontSize={10}
                        tickFormatter={(v) => `${v}m`}
                        tick={{ fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        cursor={{ fill: "#f1f5f9" }}
                        formatter={(value, name) => [
                          `${formatDuration(value)}`,
                          name,
                        ]}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          fontSize: 12,
                        }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 11 }}
                        iconType="circle"
                        iconSize={8}
                      />
                      {categoryNames.map((name) => (
                        <Bar
                          key={name}
                          dataKey={name}
                          name={name}
                          fill={categoryColorMap[name]}
                          radius={[4, 4, 0, 0]}
                          maxBarSize={28}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : categoryBreakdownForSelectedDate.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-14">
                  No delays for this date.
                </p>
              ) : (
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={categoryBreakdownForSelectedDate}
                      margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#e2e8f0"
                      />
                      <XAxis
                        dataKey="category"
                        fontSize={10}
                        tick={{ fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        fontSize={10}
                        tickFormatter={(v) => `${v}m`}
                        tick={{ fill: "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        cursor={{ fill: "#f1f5f9" }}
                        formatter={(value) => [
                          `${formatDuration(value)}`,
                          "Downtime",
                        ]}
                        contentStyle={{
                          borderRadius: 8,
                          border: "1px solid #e2e8f0",
                          fontSize: 12,
                        }}
                      />
                      <Bar
                        dataKey="minutes"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={48}
                      >
                        {categoryBreakdownForSelectedDate.map((entry) => (
                          <Cell
                            key={entry.category}
                            fill={categoryColorMap[entry.category] || "#a5b4fc"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TABLE CARD */}
      <div className="w-full rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white flex flex-col">
        <div className="flex flex-wrap justify-between items-center gap-3 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Delay Log Data
            </h2>
            {hasSearched && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {pagedLogs.length} records
                </span>
                {openCount > 0 && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                    {openCount} active
                  </span>
                )}
                {pagedLogs.length > 0 && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                    {formatDuration(totalDurationMins)} total
                  </span>
                )}
              </div>
            )}
          </div>

          <CSVLink
            data={csvData}
            filename={`Delay_Category_Report_${fromDate}_to_${toDate}.csv`}
          >
            <button
              disabled={pagedLogs.length === 0}
              className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border border-emerald-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={13} />
              Export CSV
            </button>
          </CSVLink>
        </div>

        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-320px)]">
          <table className="min-w-full text-left border-collapse bg-white">
            <thead>
              <tr>
                <th className={thClass}>Date</th>
                <th className={thClass}>Shift</th>
                <th className={thClass}>Asset</th>
                <th className={thClass}>Category</th>
                <th className={thClass}>Reason</th>
                <th className={`${thClass} text-center`}>Stop Time</th>
                <th className={`${thClass} text-center`}>Resume Time</th>
                <th className={`${thClass} text-center`}>Duration (H:M:S)</th>
                <th className={`${thClass} text-center`}>Status</th>
                <th className={thClass}>Operator Remarks</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {pagedLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center">
                        <Inbox size={20} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-500">
                        {hasSearched ? "No delays found" : "No data yet"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {hasSearched
                          ? "Try widening the date range or clearing a filter."
                          : "Set your filters and click Search to load results."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                pagedLogs.map((log, i) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-indigo-50/40 transition-colors ${
                      i % 2 === 1 ? "bg-slate-50/50" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-800 whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-600 whitespace-nowrap">
                      {log.shift}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-slate-800 whitespace-nowrap">
                      {log.asset}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                      {log.category}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 whitespace-nowrap">
                      {log.reason}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-700 whitespace-nowrap text-center">
                      {log.stopTime}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-medium text-slate-700 whitespace-nowrap text-center">
                      {log.resumeTime}
                    </td>
                    <td className="px-4 py-3.5 text-xs font-bold  text-slate-800 whitespace-nowrap text-center">
                      {formatDuration(log.durationMins)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold
                        ${
                          log.status === "Open"
                            ? "bg-amber-100 text-amber-700"
                            : log.status === "Attended"
                              ? "bg-sky-100 text-sky-700"
                              : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            log.status === "Open"
                              ? "bg-amber-500"
                              : log.status === "Attended"
                                ? "bg-sky-500"
                                : "bg-emerald-500"
                          }`}
                        />
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 max-w-[220px] truncate">
                      {log.operatorRemarks || (
                        <span className="text-slate-300">-</span>
                      )}
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
