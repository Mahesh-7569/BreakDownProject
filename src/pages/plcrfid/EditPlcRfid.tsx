import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { getPlcRfidById, savePlcRfid } from "../../services/plcRfidService";
import { getPlcMasters } from "../../services/plcMasterService";
import { getCategories, getDataTypes } from "../../services/subStationRfidService";

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
export default function EditPlcRfid() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // ✅ get PLC from main page (same as ADD)
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

  /* ===================== LOAD DROPDOWNS ===================== */
  useEffect(() => {
    getPlcMasters().then(setPlcList);
    getCategories().then(setCategories);
    getDataTypes().then(setDataTypes);
  }, []);

  /* ===================== FETCH EDIT DATA ===================== */
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const res = await getPlcRfidById(Number(id));

      if (res?.data) {
        const d = res.data;

        setForm((prev) => ({
          ...prev,
          plcId: selectedPlcId || d.plcId?.toString() || "",
          paramName: d.paramName || "",
          categoryId: d.category?.toString() || "",
          categorySeq: d.categorySeq?.toString() || "",
          dataTypeId: d.dataType?.toString() || "",
          nodeId: d.nodeId || "",
          dbNo: d.dbNo?.toString() || "",
          startByte: d.startByte?.toString() || "",
          length: d.length?.toString() || "",
          isActive: d.isActive ?? true,
        }));
      }
    };

    fetchData();
  }, [id, selectedPlcId]);

  /* ===================== HANDLER ===================== */
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

  /* ===================== UPDATE ===================== */
  const handleUpdate = async () => {
    if (!form.plcId || !form.paramName || !form.categoryId || !form.dataTypeId) {
      alert("Please fill required fields");
      return;
    }

    setSubmitting(true);

    const payload = {
      id: Number(id),
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
      alert("Updated successfully ✅");
      navigate("/masters/plcrfid", { state: { refresh: true } });
    } else {
      alert("Update failed ❌");
    }
  };

  /* ===================== UI ===================== */
  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">

      {/* HEADER */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg">
        <div className="flex justify-between">
          <div>
            <p className="text-xs uppercase text-slate-500">Masters</p>
            <h1 className="text-2xl font-semibold">Edit PLC RFID</h1>
          </div>
          <button
            onClick={() => navigate("/masters/plcrfid")}
            className="bg-slate-900 text-white px-4 py-2 rounded"
          >
            Back to PLC RFID
          </button>
        </div>
      </div>

      {/* FORM */}
      <form className="bg-white p-6 rounded-3xl shadow">

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* PLC */}
          <div>
            <label className="text-sm font-semibold">PLC*</label>
            <select
              name="plcId"
              value={form.plcId}
              disabled={!!selectedPlcId} // ✅ same as add
              onChange={handleInputChange}
              className="mt-2 w-full border px-4 py-3 rounded-2xl bg-white"
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
            <label className="text-sm font-semibold">Parameter Name*</label>
            <input
              name="paramName"
              value={form.paramName}
              onChange={handleInputChange}
              className="mt-2 w-full border px-4 py-3 rounded-2xl"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="text-sm font-semibold">Category*</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleInputChange}
              className="mt-2 w-full border px-4 py-3 rounded-2xl"
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
            <label className="text-sm font-semibold">Category Seq</label>
            <input
              type="number"
              name="categorySeq"
              value={form.categorySeq}
              onChange={handleInputChange}
              className="mt-2 w-full border px-4 py-3 rounded-2xl"
            />
          </div>

          {/* DATA TYPE */}
          <div>
            <label className="text-sm font-semibold">Data Type*</label>
            <select
              name="dataTypeId"
              value={form.dataTypeId}
              onChange={handleInputChange}
              className="mt-2 w-full border px-4 py-3 rounded-2xl"
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
            <label className="text-sm font-semibold">Node ID</label>
            <input
              name="nodeId"
              value={form.nodeId}
              onChange={handleInputChange}
              className="mt-2 w-full border px-4 py-3 rounded-2xl"
            />
          </div>

          {/* DB NO */}
          <div>
            <label className="text-sm font-semibold">DB No</label>
            <input
              type="number"
              name="dbNo"
              value={form.dbNo}
              onChange={handleInputChange}
              className="mt-2 w-full border px-4 py-3 rounded-2xl"
            />
          </div>

          {/* START BYTE */}
          <div>
            <label className="text-sm font-semibold">Start Byte</label>
            <input
              type="number"
              name="startByte"
              value={form.startByte}
              onChange={handleInputChange}
              className="mt-2 w-full border px-4 py-3 rounded-2xl"
            />
          </div>

          {/* LENGTH */}
          <div>
            <label className="text-sm font-semibold">Length</label>
            <input
              type="number"
              name="length"
              value={form.length}
              onChange={handleInputChange}
              className="mt-2 w-full border px-4 py-3 rounded-2xl"
            />
          </div>

        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-3">
          <button onClick={() => navigate("/masters/plcrfid")} className="border px-4 py-2 rounded">
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUpdate}
            disabled={submitting}
            className="bg-[#1c75bc] text-white px-5 py-2.5 rounded flex gap-2 items-center"
          >
            {submitting ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />}
            Update PLC RFID
          </button>
        </div>

      </form>
    </div>
  );
}