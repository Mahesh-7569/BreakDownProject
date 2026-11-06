import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { savePlcRfid } from "../../services/plcRfidService";
import { getPlcMasters } from "../../services/plcMasterService";
import { getCategories } from "../../services/subStationRfidService";
import { getDataTypes } from "../../services/subStationRfidService";

/* ===================== Interfaces ===================== */
interface PlcMaster {
  id: number;
  plcType: number;
  ipAddress: string;
  lineName?: string;
}

interface Category {
  id: number;
  name: string;
}

interface DataType {
  id: number;
  name: string;
}

/* ===================== Component ===================== */
export default function AddPlcRFIDPage() {
  const navigate = useNavigate();
const location = useLocation();
const selectedPlcId = location.state?.plcId;
  const [form, setForm] = useState({
     plcId: selectedPlcId || "",
    paramName: "",
    categoryId: "",
    categorySeq: "",
    dataTypeId: "",
    nodeId: "",
    dbNo: "",
    startByte: "",
    length: "",
    isActive: true,
  });

  const [plcList, setPlcList] = useState<PlcMaster[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [submitting, setSubmitting] = useState(false);

  /* ===================== Load Dropdown Data ===================== */
  useEffect(() => {
    getPlcMasters().then(setPlcList);
    getCategories().then(setCategories);
    getDataTypes().then(setDataTypes);
  }, []);

  /* ===================== Handlers ===================== */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* ===================== SAVE ===================== */
  const handleSave = async () => {
    if (!form.plcId || !form.paramName || !form.categoryId || !form.dataTypeId) {
      alert("Please fill required fields");
      return;
    }

    setSubmitting(true);

    const payload = {
      id: 0,
      plcId: Number(form.plcId),
      paramName: form.paramName,
      category: Number(form.categoryId),
      categorySeq: Number(form.categorySeq || 0),
      dataType: Number(form.dataTypeId),
      nodeId: form.nodeId,
      dbNo: Number(form.dbNo || 0),
      startByte: Number(form.startByte || 0),
      length: Number(form.length || 0),
      isActive: form.isActive,
    };

    const res = await savePlcRfid(payload);

    setSubmitting(false);

    if (res.success) {
      alert("Saved successfully ✅");

      navigate("/masters/plcrfid", {
        state: { refresh: true },
      });
    } else {
      alert("Failed to save ❌");
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900/85 dark:via-slate-900/80 dark:to-slate-900/75 dark:ring-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Masters
            </p>
            <h1 className="mt-1 text-2xl font-semibold">Add PLC RFID</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate("/masters/plcrfid")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            Back to PLC RFID
          </button>
        </div>
      </div>

      {/* FORM */}
      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* PLC DROPDOWN */}
          <div>
            <label className="mb-1 block text-sm font-semibold">PLC*</label>
            <select
              name="plcId"
              value={form.plcId}
              onChange={handleInputChange}
               disabled={!!selectedPlcId}   
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm
                bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
                focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">Select PLC</option>
              {plcList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.lineName || p.ipAddress}
                </option>
              ))}
            </select>
          </div>

          {/* PARAM NAME */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Parameter Name*</label>
            <input
              type="text"
              name="paramName"
              value={form.paramName}
              onChange={handleInputChange}
              placeholder="Enter parameter name"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm
                bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
                focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Category*</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm
                bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100
                focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY SEQ */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Category Seq</label>
            <input
              type="number"
              name="categorySeq"
              value={form.categorySeq}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm"
            />
          </div>

          {/* DATA TYPE */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Data Type*</label>
            <select
              name="dataTypeId"
              value={form.dataTypeId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm"
            >
              <option value="">Select Data Type</option>
              {dataTypes.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* NODE ID */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Node ID</label>
            <input
              type="text"
              name="nodeId"
              value={form.nodeId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm"
            />
          </div>

          {/* DB NO */}
          <div>
            <label className="mb-1 block text-sm font-semibold">DB No</label>
            <input
              type="number"
              name="dbNo"
              value={form.dbNo}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm"
            />
          </div>

          {/* START BYTE */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Start Byte</label>
            <input
              type="number"
              name="startByte"
              value={form.startByte}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm"
            />
          </div>

          {/* LENGTH */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Length</label>
            <input
              type="number"
              name="length"
              value={form.length}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm"
            />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/masters/plcrfid")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold shadow-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleSave}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16629b] disabled:opacity-60"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save PLC RFID
          </button>
        </div>
      </form>
    </div>
  );
}