import { ScanLine, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import PageHero from "../../components/PageHero";

import { getSubStations } from "../../services/subStationService";

import {
  getSubstationRfids,
  deleteSubstationRfid,
  getCategories,
  getDataTypes,
} from "../../services/subStationRfidService";

type Rfid = {
  id: number;
  stationId: number;
  rfidName: string;
  dataTypeId: number;
  dataCategoryId: number;
  opcUANodeId: string;
};

type Station = {
  id: number;
  stationName: string;
};

export default function SubstationRfid() {
  const navigate = useNavigate();
  const location = useLocation();

  const [rfids, setRfids] = useState<Rfid[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<number | null>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [dataTypes, setDataTypes] = useState<any[]>([]);

  // CATEGORY MAP
  const categoryMap = Object.fromEntries(
    categories.map((c) => [Number(c.id), c.categoryName])
  );

  // DATA TYPE MAP
  const dataTypeMap = Object.fromEntries(
    dataTypes.map((d) => [Number(d.id), d.dataTypeName])
  );

  // FETCH STATIONS
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await getSubStations();

        const mappedStations = data.map((s: any) => ({
          id: s.id,
          stationName: s.stationName,
        }));

        setStations(mappedStations);

        if (mappedStations.length > 0) {
          setSelectedStation(mappedStations[0].id);
        }
      } catch (error) {
        console.error("Error fetching stations:", error);
      }
    };

    fetchStations();
  }, []);

  // FETCH MASTER DATA
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const catRes = await getCategories();
        const dtRes = await getDataTypes();

        setCategories(catRes || []);
        setDataTypes(dtRes || []);
      } catch (error) {
        console.error("Error fetching master data:", error);
      }
    };

    fetchMasters();
  }, []);

  // FETCH RFID DATA
  const fetchRfids = async () => {
    if (!selectedStation) return;

    try {
      const data = await getSubstationRfids(selectedStation);

      const mapped: Rfid[] = data.map((r: any) => ({
        id: r.id,
        stationId: r.stationId,
        rfidName: r.rfidName,
        dataTypeId: r.dataTypeId,
        dataCategoryId: r.dataCategoryId,
        opcUANodeId: r.opcUANodeId,
      }));

      setRfids(mapped);
    } catch (error) {
      console.error("Error fetching RFID data:", error);
      setRfids([]);
    }
  };

  // FETCH ON STATION CHANGE
  useEffect(() => {
    fetchRfids();
  }, [selectedStation]);

  // REFRESH AFTER SAVE
  useEffect(() => {
    if (location.state?.refresh) {
      fetchRfids();

      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // DELETE RFID
const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this record?")) {
    return;
  }

  try {
    await deleteSubstationRfid(id);

    alert("Deleted successfully!");

    // refresh table
    fetchRfids();

  } catch (err) {
    console.error("Delete error:", err);

    alert("Error deleting record");
  }
};

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHero
        eyebrow="Masters"
        title="Station RFID"
        description="Manage RFID parameters for Stations"
        icon={ScanLine}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Live Catalogue
          </div>
        }
      />

      {/* ACTION BAR */}
      <div className="dark:bg-slate-900 dark:text-slate-300 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="dark:text-slate-300 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Station RFID Actions
          </p>

          <p className="dark:text-slate-300 text-sm text-slate-600">
            Add, edit or delete RFID configuration records
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* STATION DROPDOWN */}
          <select
            value={selectedStation ?? ""}
            onChange={(e) => {
              const val = Number(e.target.value);

              if (!isNaN(val)) {
                setSelectedStation(val);
              }
            }}
            className="rounded-lg border px-3 py-2 text-sm dark:bg-slate-900 dark:border-slate-700"
          >
            <option value="">-- Select Station --</option>

            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.stationName}
              </option>
            ))}
          </select>

          {/* ADD BUTTON */}
          <button
            onClick={() => {
              const stationObj = stations.find(
                (s) => s.id === selectedStation
              );

              if (!stationObj) return;

              navigate("/masters/SubstationRfid/add", {
                state: {
                  selectedStation: stationObj,
                },
              });
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
          >
            <ScanLine className="h-4 w-4" />
            Add Station RFID
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-auto dark:bg-slate-900 dark:ring-slate-800">
        <table className="min-w-[900px] w-full divide-y divide-slate-200 text-left text-sm text-slate-800 dark:divide-slate-800 dark:text-slate-100">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
            <tr>
              <th className="px-4 py-3">ID</th>

              <th className="px-4 py-3">RFID Name</th>

              <th className="px-4 py-3">Category</th>

              <th className="px-4 py-3">Data Type</th>

              <th className="px-4 py-3">OPCUA Node ID</th>

              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white dark:bg-slate-900/70">
            {rfids.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  No records found
                </td>
              </tr>
            ) : (
              rfids.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold">
                    {r.id}
                  </td>

                  <td className="px-4 py-3">
                    {r.rfidName}
                  </td>

                  <td className="px-4 py-3">
                    {categoryMap[r.dataCategoryId] ||
                      r.dataCategoryId}
                  </td>

                  <td className="px-4 py-3">
                    {dataTypeMap[r.dataTypeId] ||
                      r.dataTypeId}
                  </td>

                  <td className="px-4 py-3 truncate max-w-[250px]">
                    {r.opcUANodeId}
                  </td>

                <td className="px-4 py-3">
  <div className="flex items-center gap-2">

    <button
      onClick={() =>
        navigate("/masters/substationrfid/edit", {
          state: {
            rfid: r,
            selectedStation: stations.find(
              (s) => s.id === selectedStation
            ),
          },
        })
      }
      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100"
    >
      <Pencil className="h-4 w-4" />
      Edit
    </button>

    <button
      type="button"
      onClick={() => handleDelete(r.id)}
      className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100"
    >
      <Trash2 className="h-4 w-4" />
      Delete
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