import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import {
  GitBranch,
  CheckCircle2,
  CircleDashed,
  Pencil,
} from "lucide-react";

import { getSubStations } from "../../services/subStationService";
import { getLines } from "../../services/lineService";
import { getPlcMasters } from "../../services/plcMasterService";

interface SubStation {
  id: number;
  stationName: string;
  lineId: number;
  plcId: number;
  isActive: boolean;
}

interface Line {
  id: number;
  lineName: string;
}

interface Plc {
  id: number;
  plcName: string;
}

export default function SubStationMap() {
  const navigate = useNavigate();

  const [subStations, setSubStations] = useState<SubStation[]>([]);
  const [lines, setLines] = useState<Line[]>([]);
  const [plcs, setPlcs] = useState<Plc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const [stationData, lineData, plcData] = await Promise.all([
          getSubStations(),
          getLines(),
          getPlcMasters(),
        ]);

        setSubStations(stationData || []);
        setLines(lineData || []);
        setPlcs(plcData || []);
      } catch (error) {
        console.error("Error loading data:", error);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // STATUS BADGE
  function StatusBadge({ active }: { active: boolean }) {
    const tone = active
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-100 dark:ring-emerald-400/30"
      : "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-400/15 dark:text-rose-100 dark:ring-rose-400/30";

    const dot = active
      ? "bg-emerald-500 dark:bg-emerald-300"
      : "bg-rose-500 dark:bg-rose-300";

    const Icon = active ? CheckCircle2 : CircleDashed;

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${tone}`}
      >
        <span className={`h-2 w-2 rounded-full ${dot}`} />

        <Icon className="h-4 w-4" />

        {active ? "Active" : "Inactive"}
      </span>
    );
  }

  // GET LINE NAME
  const getLineName = (lineId: number) => {
    const line = lines.find((l) => l.id === lineId);
    return line ? line.lineName : "-";
  };

  // GET PLC NAME
  const getPlcName = (plcId: number) => {
    const plc = plcs.find((p) => p.id === plcId);
    return plc ? plc.plcName : "-";
  };

  // EDIT
  const handleEdit = (station: SubStation) => {
    navigate(`/masters/SubStation/edit/${station.id}`);
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Masters"
        title="Stations"
        description="Manage Station configuration."
        icon={GitBranch}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Live catalogue
          </div>
        }
      />

      {/* ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">
            Station Actions
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create, reload, or browse station records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/masters/SubStation/add")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
          >
            <GitBranch className="h-4 w-4" />
            Add Station
          </button>

          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
            Auto refresh on demand
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white/95 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950/70 dark:ring-slate-800/80">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-800 dark:divide-slate-800 dark:text-slate-100">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>

              <th className="px-4 py-3 font-semibold">
                Station Name
              </th>

              <th className="px-4 py-3 font-semibold">
                Line Name
              </th>

              <th className="px-4 py-3 font-semibold">
                PLC Name
              </th>

              <th className="px-4 py-3 font-semibold">
                Status
              </th>

              <th className="px-4 py-3 font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white/90 dark:divide-slate-800 dark:bg-slate-900/70">
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-500 dark:text-slate-300"
                >
                  Loading Stations...
                </td>
              </tr>
            ) : subStations.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-500 dark:text-slate-300"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              subStations.map((station) => (
                <tr
                  key={station.id}
                  className="bg-white/95 transition hover:bg-slate-50/80 dark:bg-slate-900/75 dark:hover:bg-slate-800/70"
                >
                  <td className="px-4 py-3 font-semibold">
                    {station.id}
                  </td>

                  <td className="px-4 py-3 font-semibold">
                    {station.stationName}
                  </td>

                  <td className="px-4 py-3">
                    {getLineName(station.lineId)}
                  </td>

                  <td className="px-4 py-3">
                    {getPlcName(station.plcId)}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge active={station.isActive} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEdit(station)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-100 dark:bg-blue-500/20 dark:text-blue-50 dark:ring-blue-400/40 dark:hover:bg-blue-500/30"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}