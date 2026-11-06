import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ChevronDown,
  Clock,
  CalendarDays,
  Settings,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from "lucide-react";

import { getDashboardMachines } from "../../services/dashboardService";
import { getShiftMasters } from "../../services/AvailabilityService";
import {
  getFilteredDelayLogs,
  getDelayCategories,
  getDelayReasonsByCategory,
  getActiveDelayReasons,
  getDelayStatuses,
  updateDelayLog,
} from "../../services/Delaylogservice";
import PageHero from "../../components/PageHero";

const getTodayDate = () => new Date().toISOString().split("T")[0];

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
};

const formatClock = (date) => {
  if (!date) return "--:--";
  const h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
};

const MINUTES_PER_DAY = 1440;

const timeStringToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

export default function DelayLog() {
  const [shifts, setShifts] = useState([]);
  // Guards against stale responses: if filters change quickly, an older/slower
  // request finishing after a newer one must not overwrite the newer result.
  const delayRequestId = useRef(0);
  const timelineRequestId = useRef(0);
  const [selectedShift, setSelectedShift] = useState("");
  const [machines, setMachines] = useState([]);
  const [selectedMachineIds, setSelectedMachineIds] = useState([]);
  const [isMachineOpen, setIsMachineOpen] = useState(false);

  const [fromDate, setFromDate] = useState(getTodayDate());
  const [toDate, setToDate] = useState(getTodayDate());

  const [delayLogs, setDelayLogs] = useState([]);
  // Logs merged across every shift (not just the selected one) - used only for the
  // timeline. A delay that starts in Shift 1 and ends in Shift 2 is stored with a
  // single shiftId, so filtering by the selected shift alone would hide the portion
  // that falls in the other shift. Fetching all shifts and clipping to whichever
  // shift window is selected lets each shift correctly show just its own slice.
  const [timelineLogs, setTimelineLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allReasons, setAllReasons] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [selectedLogId, setSelectedLogId] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [editReason, setEditReason] = useState("");
  const [editRemark, setEditRemark] = useState("");

  // ---- Initial load ----
  useEffect(() => {
    const init = async () => {
      const [shiftRes, machineRes, catRes, reasonsRes, statusRes] =
        await Promise.all([
          getShiftMasters(),
          getDashboardMachines(),
          getDelayCategories(),
          getActiveDelayReasons(),
          getDelayStatuses(),
        ]);
      setShifts(shiftRes || []);
      setMachines(machineRes || []);
      setCategories(catRes || []);
      setAllReasons(reasonsRes || []);
      setStatuses(statusRes || []);

      if (shiftRes?.length > 0) setSelectedShift(shiftRes[0].id);
      if (machineRes?.length > 0)
        setSelectedMachineIds(machineRes.slice(0, 3).map((m) => m.assetId));
    };
    init();
  }, []);

  // status comes back as a plain string, e.g. "Open" or "Closed" - no id lookup needed.
  const isRowOpen = (log) => (log.status || "").toLowerCase() === "open";

  const filteredReasons = useMemo(() => {
    if (!editCategory || !allReasons.length) return [];
    return allReasons.filter(
      (r) => r.delayCategoryId?.toString() === editCategory.toString(),
    );
  }, [editCategory, allReasons]);

  useEffect(() => {
    setEditReason("");
  }, [editCategory]);

  // ---- Data refresh, matches GET /api/delay/filter ----
  const refreshData = async () => {
    if (!selectedShift || selectedMachineIds.length === 0) return;
    const requestId = ++delayRequestId.current;
    const logs = await getFilteredDelayLogs(
      selectedMachineIds,
      selectedShift,
      fromDate,
      toDate,
    );
    if (requestId !== delayRequestId.current) return; // a newer request has since started
    setDelayLogs(logs || []);
  };

  // Fetches the same date/asset range once per shift and merges the results (deduped
  // by log id), so the timeline always has each log's true startTime/endTime available
  // no matter which shift it was originally logged under.
  const refreshTimelineLogs = async () => {
    if (shifts.length === 0 || selectedMachineIds.length === 0) return;
    const requestId = ++timelineRequestId.current;
    const results = await Promise.all(
      shifts.map((s) =>
        getFilteredDelayLogs(selectedMachineIds, s.id, fromDate, toDate),
      ),
    );
    if (requestId !== timelineRequestId.current) return; // a newer request has since started
    const merged = new Map();
    results.flat().forEach((log) => {
      if (log && log.id != null) merged.set(log.id, log);
    });
    setTimelineLogs(Array.from(merged.values()));
  };

  useEffect(() => {
    refreshData();
    refreshTimelineLogs();
  }, [fromDate, toDate, selectedShift, selectedMachineIds, shifts]);

  const toggleMachine = (id) => {
    setSelectedMachineIds((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  // Reason color map, since delayReason (not delayCategory) carries rgbColor in your schema.
  const reasonColorMap = useMemo(() => {
    const map = {};
    allReasons.forEach((r) => {
      if (r.rgbColor) map[r.id] = r.rgbColor;
    });
    return map;
  }, [allReasons]);

  // The API only returns ids (assetId/categoryId/reasonId) - resolve display names locally.
  const machineNameMap = useMemo(() => {
    const map = {};
    machines.forEach((m) => {
      map[m.assetId] = m.machineName;
    });
    return map;
  }, [machines]);

  const categoryNameMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.description;
    });
    return map;
  }, [categories]);

  const reasonNameMap = useMemo(() => {
    const map = {};
    allReasons.forEach((r) => {
      map[r.id] = r.reasonName;
    });
    return map;
  }, [allReasons]);

  const selectedMachinesList = useMemo(
    () => machines.filter((m) => selectedMachineIds.includes(m.assetId)),
    [machines, selectedMachineIds],
  );

  // The selected shift's own start/duration - kept only for the label shown next to
  // each day heading. Segments themselves are not clipped to this window, so a delay
  // outside shift hours still shows on the timeline.
  const shiftWindow = useMemo(() => {
    const shift = shifts.find(
      (s) => s.id?.toString() === selectedShift?.toString(),
    );
    if (!shift || !shift.startTime || !shift.endTime) {
      return { startMinutes: 0, durationMinutes: MINUTES_PER_DAY, label: "" };
    }

    const startMinutes = timeStringToMinutes(shift.startTime);
    let endMinutes = timeStringToMinutes(shift.endTime);
    if (endMinutes <= startMinutes) endMinutes += MINUTES_PER_DAY; // overnight shift

    const durationMinutes = endMinutes - startMinutes;
    if (!durationMinutes || durationMinutes <= 0) {
      return { startMinutes: 0, durationMinutes: MINUTES_PER_DAY, label: "" };
    }

    return {
      startMinutes,
      durationMinutes,
      label: `${shift.startTime.slice(0, 5)} - ${shift.endTime.slice(0, 5)}`,
    };
  }, [shifts, selectedShift]);

  // One block per calendar day (stacked vertically), each spanning a fixed 24h window.
  const timelineDays = useMemo(() => {
    const days = [];
    let current = new Date(fromDate + "T00:00:00");
    const end = new Date(toDate + "T00:00:00");
    while (current <= end) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [fromDate, toDate]);

  // For each day/asset, build a flat left-to-right sequence of "pieces" - alternating
  // transparent gaps and colored delay segments - across exactly the selected shift's
  // window (not the full day), matching Availability's shiftConfig.totalMinutes model.
  // A delay that starts before the shift or ends after it is automatically clipped to
  // the visible shift boundary rather than being hidden or overflowing the row.
  const timelineByDay = useMemo(() => {
    return timelineDays.map((dayStart) => {
      const shiftStart = new Date(
        dayStart.getTime() + shiftWindow.startMinutes * 60000,
      );
      const shiftEnd = new Date(
        shiftStart.getTime() + shiftWindow.durationMinutes * 60000,
      );

      const assetsRows = selectedMachinesList.map((m) => {
        const daySegments = [];

        timelineLogs.forEach((log) => {
          if (log.assetId !== m.assetId) return;

          const logStart = new Date(log.startTime);
          // Only "Closed" is truly finished - Open and Attended are both still
          // active, so they keep extending to "now" on the timeline. Prefer the
          // real endTime when the backend sends it, falling back to
          // lastUpdatedTime for any response that only has that field.
          const isFinished = (log.status || "").toLowerCase() === "closed";
          const finishTimeStr = log.endTime || log.lastUpdatedTime;
          const logEnd =
            isFinished && finishTimeStr ? new Date(finishTimeStr) : new Date();

          // Clip to the shift window - if the delay started earlier or is still open
          // past shift end, only the portion inside this shift's hours is shown here.
          const visibleStart = logStart > shiftStart ? logStart : shiftStart;
          const visibleEnd = logEnd < shiftEnd ? logEnd : shiftEnd;
          if (visibleEnd <= visibleStart) return;

          daySegments.push({
            log,
            start: (visibleStart.getTime() - shiftStart.getTime()) / 60000,
            end: (visibleEnd.getTime() - shiftStart.getTime()) / 60000,
            color: reasonColorMap[log.reasonId] || "#94a3b8",
            open: isRowOpen(log),
            startLabel: formatClock(visibleStart),
            endLabel:
              isFinished && finishTimeStr ? formatClock(visibleEnd) : "ongoing",
          });
        });

        daySegments.sort((a, b) => a.start - b.start);

        // Build the gap-filled piece sequence across the shift's duration. If two
        // delays for the same asset genuinely overlap (bad/rare data), the later one
        // is clipped to start where the previous one ends so the row never overflows.
        const pieces = [];
        let cursor = 0;
        daySegments.forEach((seg) => {
          const segStart = Math.max(seg.start, cursor);
          if (segStart >= seg.end) return; // fully swallowed by previous segment
          if (segStart > cursor) {
            pieces.push({ isGap: true, width: segStart - cursor });
          }
          pieces.push({ isGap: false, seg, width: seg.end - segStart });
          cursor = seg.end;
        });
        if (cursor < shiftWindow.durationMinutes) {
          pieces.push({
            isGap: true,
            width: shiftWindow.durationMinutes - cursor,
          });
        }

        return { assetId: m.assetId, name: m.machineName, pieces };
      });

      return { date: dayStart, assets: assetsRows };
    });
  }, [
    timelineDays,
    selectedMachinesList,
    timelineLogs,
    reasonColorMap,
    shiftWindow,
  ]);

  // Look up in timelineLogs (all shifts), not delayLogs (single-shift-filtered) -
  // a clicked timeline segment can belong to a shift other than the one currently
  // selected, and the update panel still needs to find its details.
  const selectedLog = useMemo(
    () => timelineLogs.find((l) => l.id === selectedLogId) || null,
    [selectedLogId, timelineLogs],
  );

  const handleRowClick = (log) => {
    if (!isRowOpen(log)) return; // Close logs are locked
    setSelectedLogId(log.id);
    setEditCategory(log.categoryId?.toString() || "");
    setEditReason(log.reasonId?.toString() || "");
    setEditRemark(log.remark || "");
  };

  // Resolve "Open" (not "Closed") - saving should only update category/reason/remark
  // and leave the log's status exactly as it was, not force-close it.
  const openStatusId = useMemo(() => {
    const open = statuses.find((s) =>
      (s.description || "").toLowerCase().startsWith("open"),
    );
    return open ? open.id : null;
  }, [statuses]);

  const handleSaveUpdate = async () => {
    if (!selectedLog) return;
    if (!editCategory) {
      alert("Please select a Category.");
      return;
    }
    if (!editReason) {
      alert("Please select a Reason.");
      return;
    }
    if (!openStatusId) {
      alert(
        "Could not resolve the 'Open' status id - check the /delay-status endpoint.",
      );
      return;
    }
    const getuserId = () => {
      const val = localStorage.getItem("userId");
      return val ? Number(val) : null;
    };

    // Matches DelayLogRequestDTO exactly: { id, assetId, shiftId, categoryId, reasonId, remark, loggedBy, currentLoggedBy, statusId }
    // statusId stays Open - this save only categorizes the delay, it doesn't close it.
    const payload = {
      id: selectedLog.id,
      assetId: selectedLog.assetId,
      shiftId: selectedLog.shiftId,
      categoryId: parseInt(editCategory),
      reasonId: parseInt(editReason),
      remark: editRemark,
      loggedBy: selectedLog.loggedBy,
      currentLoggedBy: getuserId(),
      statusId: openStatusId,
    };

    await updateDelayLog(payload);
    await refreshData();
    await refreshTimelineLogs();
    setSelectedLogId(null);
    setEditCategory("");
    setEditReason("");
    setEditRemark("");
  };

  const isSelected = !!selectedLog;

  return (
    <div className="h-screen bg-[#F8FAFC] p-3 font-sans flex flex-col gap-3 overflow-hidden">
      <div className="flex-shrink-0 -my-2">
        <PageHero
          title="Delay Log"
          eyebrow="Timeline"
          description="Review logged delays and categorize any that are still open."
          icon={AlertTriangle}
        />
      </div>

      {/* FILTER BAR: from date, to date, shift, assets */}
      <div className="flex-shrink-0 rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex items-center justify-between overflow-visible">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Delay Actions
          </p>
          <p className="text-sm text-slate-600">
            Filter and browse delay log records.
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
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white text-slate-700"
            />
          </div>
          <span className="text-xs text-slate-400 font-medium">to</span>
          <div className="relative flex items-center">
            <CalendarDays
              size={14}
              className="absolute left-3 text-indigo-600 pointer-events-none"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 py-1.5 pl-8 pr-3 text-xs font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white text-slate-700"
            />
          </div>

          <div className="relative">
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="appearance-none rounded-lg border border-slate-200 py-1.5 pl-3 pr-8 text-xs font-medium bg-white cursor-pointer outline-none hover:bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
              className="flex items-center justify-between w-32 appearance-none rounded-lg border border-slate-200 py-1.5 pl-3 pr-2 text-xs font-medium bg-white cursor-pointer outline-none hover:bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <span className="text-slate-700 truncate">Assets</span>
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
                    className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer"
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
        {/* LEFT: table + timeline */}
        <div className="flex-1 flex flex-col gap-3 min-w-0 min-h-0">
          {/* Table keeps a stable share of height regardless of how tall the timeline gets below. */}
          <div className="flex-1 min-h-[180px] max-h-[240px] rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_90px] items-center border-b border-slate-100 px-4 py-2.5 text-[10px] font-bold text-slate-500 bg-slate-50/80 uppercase tracking-wider flex-shrink-0">
              <span>Asset</span>
              <span>Category</span>
              <span>Reason</span>
              <span>Logged</span>
              <span>Status</span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {delayLogs.map((log) => {
                const open = isRowOpen(log);
                const isActive = selectedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    onClick={() => handleRowClick(log)}
                    className={`grid grid-cols-[1fr_1fr_1fr_1fr_90px] items-center px-4 py-2.5 text-xs transition-colors
                      ${open ? "cursor-pointer hover:bg-slate-50" : "cursor-default opacity-50"}
                      ${isActive ? "bg-indigo-50/60" : ""}`}
                  >
                    <span className="font-semibold text-slate-800">
                      {machineNameMap[log.assetId] || log.assetId}
                    </span>
                    <span className="text-slate-600">
                      {categoryNameMap[log.categoryId] || "-"}
                    </span>
                    <span className="text-slate-600">
                      {reasonNameMap[log.reasonId] || "-"}
                    </span>
                    <span className="text-slate-500">
                      {formatClock(new Date(log.startTime))}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit
                      ${open ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
                    >
                      {log.status}
                    </span>
                  </div>
                );
              })}
              {delayLogs.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-400">
                  No delay logs for this filter.
                </div>
              )}
            </div>
          </div>

          {/* TIMELINE - same continuous-bar + tooltip pattern as the Availability page:
              one flexed row per asset filled with gap/segment pieces, and a tooltip that
              flips above/below depending on the row's position so it never gets clipped. */}
          <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col min-h-0">
            <h3 className="text-slate-800 font-bold text-sm mb-3 flex-shrink-0">
              Delay Timeline
            </h3>
            <div className="overflow-y-auto flex-1 pr-1">
              {timelineByDay.map((day) => (
                <div key={day.date.toISOString()} className="mb-4">
                  <p className="text-xs font-bold text-slate-500 mb-2 py-1">
                    {day.date.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                    })}
                    {shiftWindow.label && (
                      <span className="text-slate-400 font-normal ml-2">
                        ({shiftWindow.label})
                      </span>
                    )}
                  </p>
                  <div className="flex flex-col gap-3">
                    {day.assets.map((asset, aIndex) => (
                      <div
                        key={asset.assetId}
                        className="relative z-10 hover:z-50 flex items-center px-1"
                      >
                        <div className="flex w-32 flex-shrink-0 items-center space-x-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                            <Settings size={12} />
                          </div>
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {asset.name}
                          </p>
                        </div>

                        <div className="flex flex-grow relative h-7 bg-slate-100 rounded ring-1 ring-slate-200">
                          {asset.pieces.map((piece, pIndex) => {
                            if (piece.isGap) {
                              return (
                                <div
                                  key={pIndex}
                                  style={{
                                    width: `${(piece.width / shiftWindow.durationMinutes) * 100}%`,
                                  }}
                                  className="h-full flex-shrink-0"
                                />
                              );
                            }
                            const seg = piece.seg;
                            return (
                              <div
                                key={pIndex}
                                style={{
                                  width: `${(piece.width / shiftWindow.durationMinutes) * 100}%`,
                                  backgroundColor: seg.color,
                                }}
                                onClick={() => handleRowClick(seg.log)}
                                className={`relative group h-full flex-shrink-0 transition-all border-r border-white/20 last:border-0
                                  ${seg.open ? "cursor-pointer hover:z-[99]" : "cursor-not-allowed"}
                                  ${selectedLogId === seg.log.id ? "ring-[2px] ring-black ring-inset brightness-110 z-10" : "hover:brightness-110 opacity-95 hover:opacity-100"}`}
                              >
                                {/* Tooltip - flips below for the first row, above for the rest, same as Availability */}
                                <div
                                  className={`hidden group-hover:block absolute left-1/2 -translate-x-1/2 w-max z-[999] drop-shadow-xl pointer-events-none
                                    ${aIndex === 0 ? "top-full mt-2" : "bottom-full mb-2"}`}
                                >
                                  <div className="bg-slate-800 text-slate-100 text-xs rounded-lg shadow-xl border border-slate-700 p-2 min-w-[150px]">
                                    <div className="flex items-center space-x-1 border-b border-slate-600 pb-1 mb-1">
                                      <Clock
                                        size={12}
                                        className="text-slate-400"
                                      />
                                      <span className="font-bold">
                                        {seg.startLabel} - {seg.endLabel}
                                      </span>
                                    </div>
                                    <div className="text-slate-200 truncate">
                                      {reasonNameMap[seg.log.reasonId] ||
                                        "Uncategorized"}
                                    </div>
                                  </div>
                                  <div
                                    className={`absolute left-1/2 -translate-x-1/2 border-[5px] border-transparent
                                      ${aIndex === 0 ? "bottom-full border-b-slate-800" : "top-full border-t-slate-800"}`}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {day.assets.length === 0 && (
                      <p className="text-xs text-slate-400">
                        Select assets to see their delay timeline.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: update panel, only enabled for Open rows */}
        <div className="w-[360px] flex-shrink-0">
          <div
            className={`h-full flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden transition-all duration-300
            ${!isSelected ? "opacity-60 pointer-events-none grayscale-[0.5]" : "ring-1 ring-indigo-100 shadow-md"}`}
          >
            {isSelected && (
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600 z-10"></div>
            )}

            <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                <span className="bg-white shadow-sm text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200">
                  <FileText size={16} />
                </span>
                Update Delay Log
              </h2>
            </div>

            <div className="p-5 flex-1 flex flex-col overflow-y-auto min-h-0">
              {isSelected ? (
                <div className="mb-4 p-3 bg-indigo-50/30 rounded-xl border border-indigo-100 flex flex-col gap-1 flex-shrink-0">
                  <p className="text-indigo-700 font-bold text-sm">
                    {machineNameMap[selectedLog.assetId] || selectedLog.assetId}
                  </p>
                  <p className="text-slate-600 text-xs font-medium">
                    Logged at{" "}
                    <b>{formatClock(new Date(selectedLog.startTime))}</b>
                  </p>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center text-sm text-slate-500 font-medium flex-shrink-0">
                  Select an open delay log to categorize.
                </div>
              )}

              <div className="mb-3 flex-shrink-0">
                <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  disabled={!isSelected}
                  className="w-full appearance-none rounded-xl border py-2.5 px-3 text-sm font-medium outline-none bg-white disabled:bg-slate-50"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3 flex-shrink-0">
                <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Reason <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  disabled={!isSelected || !editCategory}
                  className="w-full appearance-none rounded-xl border py-2.5 px-3 text-sm font-medium outline-none bg-white disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">Select Reason...</option>
                  {filteredReasons.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.reasonName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 flex flex-col min-h-[70px] mb-4">
                <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Remark{" "}
                  <span className="text-slate-400 font-normal lowercase">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={editRemark}
                  onChange={(e) => setEditRemark(e.target.value)}
                  disabled={!isSelected}
                  placeholder="Type additional details here..."
                  className="flex-1 w-full rounded-xl border py-3 px-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none bg-white disabled:bg-slate-50"
                ></textarea>
              </div>

              <button
                onClick={handleSaveUpdate}
                disabled={!isSelected}
                className="mt-auto w-full flex-shrink-0 flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-bold text-white hover:bg-indigo-700 active:scale-[0.98] transition-transform shadow-md disabled:opacity-50"
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
