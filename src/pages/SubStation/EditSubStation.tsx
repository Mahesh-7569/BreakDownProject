import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getSubStationById,
  updateStation,
  getPlcData,
} from "../../services/subStationService";

import { getLines } from "../../services/lineService";

type Line = {
  id: number;
  lineName: string;
};

type Plc = {
  id: number;
  plcName: string;
};

type SubStationForm = {
  lineId: string;
  plcId: string;
  stationName: string;
  isActive: boolean;
};

export default function EditSubStation() {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const [form, setForm] = useState<SubStationForm>({
    lineId: "",
    plcId: "",
    stationName: "",
    isActive: true,
  });

  const [submitting, setSubmitting] = useState(false);

  const [lines, setLines] = useState<Line[]>([]);
  const [plcs, setPlcs] = useState<Plc[]>([]);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        // GET LINES
        const lineData = await getLines();
        setLines(lineData);

        // GET PLCS
        const plcData = await getPlcData();
        setPlcs(plcData);

        // GET STATION BY ID
        if (!id) return;

        const station = await getSubStationById(
          Number(id)
        );

        if (station) {
          setForm({
            lineId: station.lineId?.toString() || "",
            plcId: station.plcId?.toString() || "",
            stationName: station.stationName || "",
            isActive: station.isActive ?? true,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id]);

  // HANDLE INPUT
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } =
      e.target as HTMLInputElement;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  };

  // UPDATE
  const handleSave = async () => {
    if (
      !form.lineId ||
      !form.plcId ||
      !form.stationName
    ) {
      alert("Please fill all required fields!");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        id: Number(id),
        stationName: form.stationName,
        lineId: Number(form.lineId),
        plcId: Number(form.plcId),
        isActive: form.isActive,
      };

      const res = await updateStation(
        Number(id),
        payload
      );

      if (res) {
        alert("Station updated successfully!");

        navigate("/masters/substation");
      } else {
        alert("Failed to update station");
      }
    } catch (error) {
      console.error(
        "Error updating station:",
        error
      );

      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">

      {/* HEADER */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Masters
            </p>

            <h1 className="mt-1 text-2xl font-semibold">
              Edit Station
            </h1>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/masters/substation")
            }
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            Back to Station
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Update Station configuration.
        </p>
      </div>

      {/* FORM */}
      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800">

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* LINE */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Line*
            </label>

            <select
              name="lineId"
              value={form.lineId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">
                Select Line
              </option>

              {lines.map((l) => (
                <option
                  key={l.id}
                  value={l.id}
                >
                  {l.lineName}
                </option>
              ))}
            </select>
          </div>

          {/* PLC */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              PLC*
            </label>

            <select
              name="plcId"
              value={form.plcId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">
                Select PLC
              </option>

              {plcs.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                >
                  {p.plcName}
                </option>
              ))}
            </select>
          </div>

          {/* STATION NAME */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Station Name*
            </label>

            <input
              type="text"
              name="stationName"
              value={form.stationName}
              onChange={handleInputChange}
              placeholder="Enter Station Name"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* ACTIVE */}
          <div className="self-end">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">

              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleInputChange}
                className="h-5 w-5 rounded border-slate-300 text-[#1c75bc]"
              />

              <span className="text-sm">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-3">

          <button
            type="button"
            onClick={() =>
              navigate("/masters/substation")
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16629b] disabled:opacity-60 dark:bg-amber-400 dark:text-slate-950"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}