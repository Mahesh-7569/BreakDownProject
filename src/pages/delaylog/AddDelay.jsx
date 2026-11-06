import React, { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Cog, Clock, RefreshCcw } from "lucide-react";

import {
  getDelayCategories,
  getAssets,
  getShiftMasters,
  getTodaysDelaysByAsset,
  createDelay,
} from "../../services/Createdelayservice";
import PageHero from "../../components/PageHero";

// App stores the current user's roleId in localStorage - used as loggedBy.
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

const timeStringToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

// Given the shift masters and the current clock time, find whichever shift's
// startTime-endTime window covers right now (handles shifts that cross midnight).
const findCurrentShiftId = (shifts) => {
  if (!shifts || shifts.length === 0) return null;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const shift of shifts) {
    const start = timeStringToMinutes(shift.startTime);
    let end = timeStringToMinutes(shift.endTime);
    if (end <= start) {
      // overnight shift - covers [start, 1440) and [0, end)
      if (nowMinutes >= start || nowMinutes < end) return shift.id;
    } else if (nowMinutes >= start && nowMinutes < end) {
      return shift.id;
    }
  }
  // Fallback: no exact match found (gap in shift coverage) - use the first shift
  // rather than blocking delay creation entirely.
  return shifts[0].id;
};

const STATUS_ORDER = { open: 0, attended: 1, closed: 2 };
const statusKey = (log) => (log.status || "").toLowerCase();

const statusStyle = (key) => {
  if (key === "open") return "bg-amber-100 text-amber-700";
  if (key === "attended") return "bg-sky-100 text-sky-700";
  return "bg-emerald-100 text-emerald-700";
};

export default function AddDelay() {
  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [shifts, setShifts] = useState([]);

  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [showAssetPopup, setShowAssetPopup] = useState(true);
  const [popupAssetChoice, setPopupAssetChoice] = useState("");

  const [delays, setDelays] = useState([]);
  const [loadingDelays, setLoadingDelays] = useState(false);
  const [creatingCategoryId, setCreatingCategoryId] = useState(null);

  useEffect(() => {
    const init = async () => {
      const [catRes, assetRes, shiftRes] = await Promise.all([
        getDelayCategories(),
        getAssets(),
        getShiftMasters(),
      ]);
      setCategories(catRes || []);
      setAssets(assetRes || []);
      setShifts(shiftRes || []);
    };
    init();
  }, []);

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === selectedAssetId) || null,
    [assets, selectedAssetId],
  );

  const refreshDelays = async (assetId = selectedAssetId) => {
    if (!assetId) return;
    setLoadingDelays(true);
    const rows = await getTodaysDelaysByAsset(assetId);
    const sorted = (rows || []).slice().sort((a, b) => {
      const pa = STATUS_ORDER[statusKey(a)] ?? 99;
      const pb = STATUS_ORDER[statusKey(b)] ?? 99;
      if (pa !== pb) return pa - pb;
      return new Date(b.startTime) - new Date(a.startTime);
    });
    setDelays(sorted);
    setLoadingDelays(false);
  };

  // Selecting an asset in the popup immediately confirms it - no Continue button needed.
  const handleAssetChoice = (e) => {
    const raw = e.target.value;
    setPopupAssetChoice(raw);
    if (!raw) return;
    const id = Number(raw);
    setSelectedAssetId(id);
    setShowAssetPopup(false);
    refreshDelays(id);
  };

  const handleChangeAsset = () => {
    setPopupAssetChoice(selectedAssetId ? selectedAssetId.toString() : "");
    setShowAssetPopup(true);
  };

  // Clicking a category button auto-creates a delay for the selected asset, with
  // the shift figured out automatically from the current clock time.
  const handleCategoryClick = async (category) => {
    if (!selectedAssetId) {
      setShowAssetPopup(true);
      return;
    }
    const shiftId = findCurrentShiftId(shifts);
    if (!shiftId) {
      alert("Could not determine the current shift - check shift master data.");
      return;
    }

    setCreatingCategoryId(category.id);
    await createDelay({
      assetId: selectedAssetId,
      shiftId,
      categoryId: category.id,
      remark: "",
      loggedBy: getuserId(),
    });
    setCreatingCategoryId(null);
    await refreshDelays();
  };

  return (
    <div className="h-screen bg-[#F8FAFC] p-3 font-sans flex flex-col gap-3 overflow-hidden">
      <div className="flex-shrink-0 -my-2">
        <PageHero
          title="Create Delay"
          eyebrow="Live Board"
          description="Tap a category to instantly log a delay for the selected asset."
          icon={AlertTriangle}
        />
      </div>

      <div className="flex flex-1 gap-4 min-h-0">
        {/* LEFT: category buttons, two per row */}
        <div className="w-[430px] flex-shrink-0 rounded-2xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col min-h-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3 flex-shrink-0">
            Delay Categories
          </p>
          <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 gap-3 content-start">
            {categories.map((cat) => {
              const isCreating = creatingCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  disabled={isCreating}
                  className="aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 transition-colors p-3 text-center disabled:opacity-60"
                >
                  {isCreating ? (
                    <span className="w-5 h-5 rounded-full border-2 border-indigo-300 border-t-indigo-600 animate-spin" />
                  ) : (
                    <AlertTriangle size={20} className="text-indigo-500" />
                  )}
                  <span className="text-xs font-bold text-slate-700 leading-tight">
                    {cat.description}
                  </span>
                </button>
              );
            })}
            {categories.length === 0 && (
              <p className="col-span-2 text-xs text-slate-400 text-center py-8">
                Loading categories...
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: selected asset + today's delays */}
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
                <Cog size={16} />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Selected Asset
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {selectedAsset ? selectedAsset.assetName : "None selected"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleChangeAsset}
                className="text-xs font-semibold text-white bg-[#2B547E] hover:bg-[#1C3A5A] px-3 py-1.5 rounded-lg transition-colors"
              >
                Change Asset
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 divide-y divide-slate-100">
            {loadingDelays && (
              <div className="p-8 text-center text-sm text-slate-400">
                Loading...
              </div>
            )}
            {!loadingDelays && delays.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                {selectedAssetId
                  ? "No delays logged today for this asset."
                  : "Select an asset to see today's delays."}
              </div>
            )}
            {!loadingDelays &&
              delays.map((d) => {
                const key = statusKey(d);
                const category = categories.find((c) => c.id === d.categoryId);
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between px-5 py-3.5"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        {category ? category.description : "Uncategorized"}
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
                          <Clock size={12} />
                          {formatClock(d.startTime)}
                        </span>
                      </span>
                      {d.remark && (
                        <span className="text-xs text-slate-400 truncate max-w-xs">
                          {d.remark}
                        </span>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${statusStyle(key)}`}
                    >
                      {d.status}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* ASSET SELECTION POPUP */}
      {showAssetPopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-[380px] bg-white rounded-2xl shadow-2xl relative overflow-hidden ring-1 ring-indigo-100">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600 z-10"></div>
            <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                <span className="bg-white shadow-sm text-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200">
                  <Cog size={16} />
                </span>
                Select Asset
              </h2>
            </div>
            <div className="p-5">
              <label className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wide">
                Asset
              </label>
              <select
                value={popupAssetChoice}
                onChange={handleAssetChoice}
                autoFocus
                className="w-full appearance-none rounded-xl border py-2.5 px-3 text-sm font-medium outline-none bg-white"
              >
                <option value="">Select an asset...</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.assetName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
