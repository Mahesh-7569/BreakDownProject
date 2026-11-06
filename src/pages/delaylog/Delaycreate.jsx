import React, { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  Cog,
  Search,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  X,
  ChevronDown,
} from "lucide-react";

import { getDashboardMachines } from "../../services/dashboardService";
import { getShiftMasters } from "../../services/AvailabilityService";
import {
  getTodaysDelaysByAssetAndStatus,
  createDelayLog,
  updateDelayLog,
  getDelayCategories,
  getActiveDelayReasons,
  getDelayStatuses,
} from "../../services/Delaylogservice";
import PageHero from "../../components/PageHero";

// NOTE: the app stores the current user's roleId in localStorage - loggedBy /
// currentLoggedBy are derived from that instead of a separate employee-id lookup.
// Confirm "roleId" is the exact key name used elsewhere in the app.
const getuserId = () => {
  const val = localStorage.getItem("userId");
  return val ? Number(val) : null;
};

const formatClock = (isoString) => {
  if (!isoString) return "--:--";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "--:--";
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
};

const formatDuration = (mins) =>
  typeof mins === "number" ? `${mins} min` : "-";

// Open shows first, then Attended, then Closed - so actionable delays always sit
// at the top of the list instead of being buried under resolved ones.
const STATUS_ORDER = { open: 0, attended: 1, closed: 2 };

export default function Delaycreate() {
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState("all");
  const [selectedStatusId, setSelectedStatusId] = useState("all");
  const [shifts, setShifts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allReasons, setAllReasons] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [delays, setDelays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // ---- Create-delay panel ----
  const [showCreate, setShowCreate] = useState(false);
  const [createShiftId, setCreateShiftId] = useState("");
  const [createCategoryId, setCreateCategoryId] = useState("");
  const [createRemark, setCreateRemark] = useState("");
  const [creating, setCreating] = useState(false);

  // ---- Update panel (Attend / Close) ----
  const [selectedDelayId, setSelectedDelayId] = useState(null);
  const [editCategory, setEditCategory] = useState("");
  const [editReason, setEditReason] = useState("");
  const [editRemark, setEditRemark] = useState("");

  useEffect(() => {
    const init = async () => {
      const [assetRes, shiftRes, catRes, reasonRes, statusRes] =
        await Promise.all([
          getDashboardMachines(),
          getShiftMasters(),
          getDelayCategories(),
          getActiveDelayReasons(),
          getDelayStatuses(),
        ]);
      setAssets(assetRes || []);
      setShifts(shiftRes || []);
      setCategories(catRes || []);
      setAllReasons(reasonRes || []);
      setStatuses(statusRes || []);

      if (shiftRes?.length > 0) setCreateShiftId(shiftRes[0].id.toString());
    };
    init();
  }, []);

  const machineNameMap = useMemo(() => {
    const map = {};
    assets.forEach((a) => {
      map[a.assetId] = a.machineName;
    });
    return map;
  }, [assets]);

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

  const filteredReasons = useMemo(() => {
    if (!editCategory || !allReasons.length) return [];
    return allReasons.filter(
      (r) => r.delayCategoryId?.toString() === editCategory.toString(),
    );
  }, [editCategory, allReasons]);

  useEffect(() => {
    setEditReason("");
  }, [editCategory]);

  const attendedStatusId = useMemo(() => {
    const s = statuses.find((s) =>
      (s.description || "").toLowerCase().startsWith("attend"),
    );
    return s ? s.id : null;
  }, [statuses]);
  const closedStatusId = useMemo(() => {
    const s = statuses.find((s) =>
      (s.description || "").toLowerCase().startsWith("clos"),
    );
    return s ? s.id : null;
  }, [statuses]);

  const statusKey = (log) => (log.status || "").toLowerCase();

  const refreshDelays = async (
    assetId = selectedAssetId,
    statusId = selectedStatusId,
  ) => {
    setLoading(true);
    const assetIds = assetId && assetId !== "all" ? [assetId] : [];
    const statusIds = statusId && statusId !== "all" ? [statusId] : [];
    const rows = await getTodaysDelaysByAssetAndStatus(assetIds, statusIds);
    const sorted = (rows || []).slice().sort((a, b) => {
      const pa = STATUS_ORDER[statusKey(a)] ?? 99;
      const pb = STATUS_ORDER[statusKey(b)] ?? 99;
      if (pa !== pb) return pa - pb;
      return new Date(b.startTime) - new Date(a.startTime);
    });
    setDelays(sorted);
    setHasSearched(true);
    setLoading(false);
  };

  // Auto-refresh whenever either filter changes (also covers the initial
  // "All Assets" / "All Statuses" load on mount).
  useEffect(() => {
    refreshDelays(selectedAssetId, selectedStatusId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAssetId, selectedStatusId]);

  const handleCreateDelay = async () => {
    if (!createShiftId) {
      alert("Please select a shift.");
      return;
    }
    if (!createCategoryId) {
      alert("Please select a category.");
      return;
    }

    setCreating(true);
    await createDelayLog({
      assetId: selectedAssetId,
      shiftId: createShiftId,
      categoryId: createCategoryId,
      remark: createRemark,
      loggedBy: getuserId(),
    });
    setCreating(false);
    setShowCreate(false);
    setCreateCategoryId("");
    setCreateRemark("");
    await refreshDelays();
  };

  const selectedDelay = useMemo(
    () => delays.find((d) => d.id === selectedDelayId) || null,
    [selectedDelayId, delays],
  );

  // Open -> pick category+reason, moves to Attended.
  // Attended -> just confirm resolution, moves to Closed (category/reason already set).
  const mode = selectedDelay ? statusKey(selectedDelay) : null; // "open" | "attended"

  const handleRowClick = (delay) => {
    const key = statusKey(delay);
    if (key === "closed") return; // closed rows are locked, view-only
    setSelectedDelayId(delay.id);
    setEditCategory(delay.categoryId?.toString() || "");
    setEditReason(delay.reasonId?.toString() || "");
    setEditRemark(delay.remark || "");
  };

  const handleSaveUpdate = async () => {
    if (!selectedDelay) return;
    const isAttendStep = mode === "open";

    if (isAttendStep) {
      if (!editCategory) {
        alert("Please select a Category.");
        return;
      }
      if (!editReason) {
        alert("Please select a Reason.");
        return;
      }
      if (!attendedStatusId) {
        alert("Could not resolve the 'Attended' status id.");
        return;
      }
    } else {
      if (!closedStatusId) {
        alert("Could not resolve the 'Closed' status id.");
        return;
      }
    }

    const payload = {
      id: selectedDelay.id,
      assetId: selectedDelay.assetId,
      shiftId: selectedDelay.shiftId,
      categoryId: parseInt(
        isAttendStep ? editCategory : selectedDelay.categoryId,
        10,
      ),
      reasonId: parseInt(
        isAttendStep ? editReason : selectedDelay.reasonId,
        10,
      ),
      remark: editRemark,
      loggedBy: selectedDelay.loggedBy,
      currentLoggedBy: getuserId(),
      statusId: isAttendStep ? attendedStatusId : closedStatusId,
    };

    await updateDelayLog(payload);
    await refreshDelays();
    setSelectedDelayId(null);
    setEditCategory("");
    setEditReason("");
    setEditRemark("");
  };

  const isSelected = !!selectedDelay;

  const statusStyle = (key) => {
    if (key === "open") return "bg-amber-100 text-amber-700";
    if (key === "attended") return "bg-sky-100 text-sky-700";
    return "bg-emerald-100 text-emerald-700";
  };

  return (
    <div className="h-screen bg-[#F8FAFC] p-3 font-sans flex flex-col gap-3 overflow-hidden">
      <div className="flex-shrink-0 -my-2">
        <PageHero
          title="Today's Delay"
          eyebrow="Live Board"
          description="Track, log, and progress today's delays for a selected asset."
          icon={AlertTriangle}
        />
      </div>

      {/* FILTER BAR: search by asset + status, + log new delay */}
      <div className="flex-shrink-0 rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Delay Board for maintainence
          </p>
          <p className="text-sm text-slate-600">
            Search today's delays by asset and status.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-48 flex-shrink-0">
            <Cog
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none"
            />
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white pl-9 pr-8 py-2 text-xs font-bold text-slate-700 shadow-sm cursor-pointer outline-none hover:bg-slate-50 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Assets</option>
              {assets.map((a) => (
                <option key={a.assetId} value={a.assetId}>
                  {a.machineName}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
          <div className="relative w-40 flex-shrink-0">
            <select
              value={selectedStatusId}
              onChange={(e) => setSelectedStatusId(e.target.value)}
              className="w-full appearance-none rounded-lg border border-slate-200 bg-white pl-3 pr-8 py-2 text-xs font-bold text-slate-700 shadow-sm cursor-pointer outline-none hover:bg-slate-50 hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.description}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
          <button
            onClick={() => refreshDelays()}
            disabled={loading}
            className="flex-shrink-0 w-28 flex items-center justify-center gap-2 bg-[#2B547E] hover:bg-[#1C3A5A] transition-colors text-white font-semibold rounded-lg px-4 py-2 text-xs disabled:opacity-70"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin flex-shrink-0" />
            ) : (
              <Search size={14} className="flex-shrink-0" />
            )}
            <span>{loading ? "Searching" : "Search"}</span>
          </button>
        </div>
      </div>

      {/* Today's delays list - now full width since Update opens as a popup instead of a side panel */}
      <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_80px_90px_100px_90px] items-center border-b border-slate-100 px-4 py-2.5 text-[10px] font-bold text-slate-500 bg-slate-50/80 uppercase tracking-wider flex-shrink-0">
          <span>Category</span>
          <span>Reason</span>
          <span>Remark</span>
          <span>Duration</span>
          <span>Started</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 divide-y divide-slate-100">
          {delays.map((d) => {
            const key = statusKey(d);
            const actionable = key !== "closed";
            const isActive = selectedDelayId === d.id;
            return (
              <div
                key={d.id}
                className={`grid grid-cols-[1fr_1fr_1fr_80px_90px_100px_90px] items-center px-4 py-3 text-xs
                  ${actionable ? "hover:bg-slate-50" : "opacity-60"}
                  ${isActive ? "bg-indigo-50/60" : ""}`}
              >
                <span className="font-semibold text-slate-800">
                  {categoryNameMap[d.categoryId] || "-"}
                </span>
                <span className="text-slate-600">
                  {reasonNameMap[d.reasonId] || "-"}
                </span>
                <span className="text-slate-500 truncate">
                  {d.remark || "-"}
                </span>
                <span className="text-slate-500">
                  {formatDuration(d.durationInMinutes)}
                </span>
                <span className="text-slate-500">
                  {formatClock(d.startTime)}
                </span>
                <span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${statusStyle(key)}`}
                  >
                    {d.status}
                  </span>
                </span>
                <span className="text-right">
                  {actionable ? (
                    <button
                      onClick={() => handleRowClick(d)}
                      className="text-[11px] font-bold text-white bg-[#2B547E] hover:bg-[#1C3A5A] px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      Update
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-300">-</span>
                  )}
                </span>
              </div>
            );
          })}
          {delays.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400">
              {hasSearched
                ? "No delays logged today for this filter."
                : "Select an asset and status to see today's delays."}
            </div>
          )}
        </div>
      </div>

      {/* UPDATE POPUP - Attend (Open) or Close (Attended), shown as a modal instead of a side panel */}
      {isSelected && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 px-4"
          onClick={() => setSelectedDelayId(null)}
        >
          <div
            className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl relative overflow-hidden ring-1 ring-indigo-100 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600 z-10"></div>

            <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                <span className="bg-white shadow-sm text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200">
                  <FileText size={16} />
                </span>
                {mode === "open" ? "Attend Delay" : "Resolve Delay"}
              </h2>
              <button
                onClick={() => setSelectedDelayId(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col overflow-y-auto min-h-0">
              <div className="mb-4 p-3 bg-indigo-50/30 rounded-xl border border-indigo-100 flex flex-col gap-1 flex-shrink-0">
                <p className="text-indigo-700 font-bold text-sm flex items-center gap-1.5">
                  <Clock size={13} /> Started at{" "}
                  {formatClock(selectedDelay.startTime)}
                </p>
              </div>

              {mode === "open" ? (
                <>
                  <div className="mb-3 flex-shrink-0">
                    <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wide">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full appearance-none rounded-xl border py-2.5 px-3 text-sm font-medium outline-none bg-white"
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
                      disabled={!editCategory}
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
                </>
              ) : (
                <div className="mb-3 flex-shrink-0 flex flex-col gap-2">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Category
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {categoryNameMap[selectedDelay.categoryId] || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Reason
                    </p>
                    <p className="text-sm font-semibold text-slate-800">
                      {reasonNameMap[selectedDelay.reasonId] || "-"}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col min-h-[90px] mb-4">
                <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Remark{" "}
                  <span className="text-slate-400 font-normal lowercase">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={editRemark}
                  onChange={(e) => setEditRemark(e.target.value)}
                  placeholder="Type additional details here..."
                  className="w-full rounded-xl border py-3 px-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none bg-white min-h-[90px]"
                ></textarea>
              </div>

              <button
                onClick={handleSaveUpdate}
                className="w-full flex-shrink-0 flex items-center justify-center space-x-2 rounded-xl bg-indigo-600 py-3 px-4 text-sm font-bold text-white hover:bg-indigo-700 active:scale-[0.98] transition-transform shadow-md"
              >
                <CheckCircle2 size={18} />
                <span>{mode === "open" ? "Mark Attended" : "Mark Closed"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
