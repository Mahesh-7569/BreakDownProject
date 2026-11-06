import { ScanLine, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PageHero from "../../components/PageHero";
import { getCategories, getDataTypes } from "../../services/subStationRfidService";
import { getPlcMasters } from "../../services/plcMasterService";
import { getPlcRfids } from "../../services/plcRfidService";
import { getPlcTypes } from "../../services/plcMasterService";
import { deletePlcRfid } from "../../services/plcRfidService";

interface Category {
  id: number;
  name: string;
}

interface DataType {
  id: number;
  name: string;
}


export default function PlcRfid() {
  const navigate = useNavigate();

  // ✅ STATES
  const [plcMasters, setPlcMasters] = useState<any[]>([]);
  const [plcTypes, setPlcTypes] = useState<any[]>([]);
  const [plcRfids, setPlcRfids] = useState<any[]>([]);
  const [selectedPlcId, setSelectedPlcId] = useState<number | "">("");
const [categories, setCategories] = useState<Category[]>([]);
const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  // ✅ FETCH PLC Masters & Types on mount
  useEffect(() => {
  const loadInitialData = async () => {
    const plcData = await getPlcMasters();
    setPlcMasters(plcData);

    // ✅ SET FIRST PLC AS DEFAULT
    if (plcData.length > 0) {
      setSelectedPlcId(plcData[0].id);
    }

    const types = await getPlcTypes();
    setPlcTypes(types);

    const cat = await getCategories();
    setCategories(cat);

    const dt = await getDataTypes();
    setDataTypes(dt);
  };

  loadInitialData();
}, []);

  // ✅ FETCH PLC RFIDs when PLC changes
  useEffect(() => {
    if (!selectedPlcId) {
      setPlcRfids([]);
      return;
    }
    getPlcRfids(selectedPlcId).then(setPlcRfids);
  }, [selectedPlcId]);

  // ✅ MAPS for quick lookup
  const plcTypeMap = Object.fromEntries(plcTypes.map((p) => [p.id, p.plcName]));

  const getPlcName = (plcId: number) => {
    return plcTypeMap[plcId] || "-";
  };

  function StatusBadge({ active }: { active: boolean }) {
    const tone = active
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : "bg-rose-50 text-rose-700 ring-rose-100";
    const dot = active ? "bg-emerald-500" : "bg-rose-500";
    const Icon = active ? CheckCircle2 : Trash2;

    return (
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone}`}>
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <Icon className="h-4 w-4" />
        {active ? "Active" : "Inactive"}
      </span>
    );
  }


  const categoryMap = Object.fromEntries(
  categories.map((c) => [c.id, c.name])
);

const dataTypeMap = Object.fromEntries(
  dataTypes.map((d) => [d.id, d.name])
);



const handleDelete = async (id: number) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this record?");
  if (!confirmDelete) return;

  const res = await deletePlcRfid(id);
  if (res.success) {
    alert("Deleted successfully ✅");
    // refresh the table
    if (selectedPlcId) {
      const updated = await getPlcRfids(selectedPlcId);
      setPlcRfids(updated);
    }
  } else {
    alert("Failed to delete ❌");
  }
};


  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <PageHero
        eyebrow="Masters"
        title="PLC RFID"
        description="Manage RFID parameters mapped to PLCs"
        icon={ScanLine}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Live Catalogue
          </div>
        }
      />

      {/* PLC FILTER */}
      <div className="dark:bg-slate-900 flex items-center gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="dark:text-slate-300 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Filter
          </p>
          <p className="dark:text-slate-300 text-sm text-slate-600">Select PLC to view RFID records</p>
        </div>

        <select
          value={selectedPlcId}
          onChange={(e) => setSelectedPlcId(Number(e.target.value))}
          className="w-40 mt-1 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
        >
          <option value="">Select PLC</option>
          {plcMasters.map((plc) => (
            <option key={plc.id} value={plc.id}>
              {plc.lineName || `PLC ${plc.id}`}
            </option>
          ))}
        </select>
 <button
    onClick={() =>
      navigate("/masters/plcrfid/add", {
        state: { plcId: selectedPlcId },
      })
    }
    className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
  >
    <ScanLine className="h-4 w-4" />
    Add RFID
  </button>
        
      </div>


      

      {/* TABLE */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-800 dark:divide-slate-800 dark:text-slate-100">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold">ID</th>
              <th className="px-4 py-3 font-semibold">Param Name</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Category Seq</th>
              <th className="px-4 py-3 font-semibold">Data Type</th>
              <th className="px-4 py-3 font-semibold">Node ID</th>
              <th className="px-4 py-3 font-semibold">DB No</th>
              <th className="px-4 py-3 font-semibold">Start Byte</th>
              <th className="px-4 py-3 font-semibold">Length</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {plcRfids.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-6 text-center text-slate-500">
                  No records found
                </td>
              </tr>
            ) : (
              plcRfids.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-4 py-3 font-semibold">{r.id}</td>
                  <td className="px-4 py-3">{r.paramName}</td>
                  <td className="px-4 py-3">{categoryMap[r.category] || r.category}</td>
                  <td className="px-4 py-3">{r.categorySeq}</td>
                  <td className="px-4 py-3"> {dataTypeMap[r.dataType] || r.dataType}</td>
                  <td className="px-4 py-3">{r.nodeId}</td>
                  <td className="px-4 py-3">{r.dbNo}</td>
                  <td className="px-4 py-3">{r.startByte}</td>
                  <td className="px-4 py-3">{r.length}</td>
                  <td className="px-4 py-3 flex justify-center gap-2">
                    <button
                      onClick={() => navigate(`/masters/plcrfid/edit/${r.id}`, { state: { plcId: selectedPlcId } })}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button 
                    onClick={() => handleDelete(r.id)}
                    className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-100 hover:bg-rose-100">
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
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