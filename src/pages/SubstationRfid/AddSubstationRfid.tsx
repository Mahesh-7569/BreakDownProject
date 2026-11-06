// pages/SubstationRfid/AddSubstationRfid.tsx

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  getDataTypes,
  getCategories,
  addOrEditSubstationRfid,
} from "../../services/subStationRfidService";

type DataType = {
  id: number;
  dataTypeName: string;
};

type Category = {
  id: number;
  categoryName: string;
};

export default function AddSubstationRfid() {
  const navigate = useNavigate();
  const location = useLocation();

  console.log("LOCATION STATE:", location.state);

  // ✅ GET STATION FROM PREVIOUS PAGE
  const selectedStation = (location.state as any)?.selectedStation;

  const [form, setForm] = useState({
    stationId: selectedStation?.id || 0,
    stationName:
      selectedStation?.stationName ||
      selectedStation?.name ||
      "",

    rfidName: "",
    dataTypeId: "",
    dataCategoryId: "",
    opcUANodeId: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // ✅ FETCH DROPDOWNS
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const dtRes = await getDataTypes();
        const catRes = await getCategories();

        setDataTypes(dtRes || []);
        setCategories(catRes || []);
      } catch (error) {
        console.error("Error fetching dropdowns:", error);
      }
    };

    fetchDropdowns();
  }, []);

  // ✅ HANDLE INPUT
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name === "dataTypeId" || name === "dataCategoryId"
          ? Number(value)
          : value,
    }));
  };

  // ✅ SAVE RFID
  const handleSave = async () => {
    if (
      !form.stationId ||
      !form.rfidName ||
      !form.dataTypeId ||
      !form.dataCategoryId
    ) {
      alert("Please fill all required fields!");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        stationId: form.stationId,
        rfidName: form.rfidName,
        dataTypeId: Number(form.dataTypeId),
        dataCategoryId: Number(form.dataCategoryId),
        opcUANodeId: form.opcUANodeId,
      };

      console.log("Saving RFID:", payload);

      const res = await addOrEditSubstationRfid(payload);

      if (res) {
        alert("Station RFID added successfully!");

        navigate("/masters/substationrfid", {
          state: { refresh: true },
        });
      } else {
        alert("Failed to save RFID");
      }
    } catch (error) {
      console.error("Save Error:", error);
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
              Add Station RFID
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/masters/substationrfid")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            Back to Station RFID
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Configure Station RFID details.
        </p>
      </div>

      {/* FORM */}
      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800">

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* ✅ STATION NAME */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Station
            </label>

            <input
              type="text"
              value={form.stationName}
              disabled
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm bg-slate-100 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* RFID NAME */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              RFID Name*
            </label>

            <input
              type="text"
              name="rfidName"
              value={form.rfidName}
              onChange={handleInputChange}
              placeholder="Enter RFID Name"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* DATA TYPE */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Data Type*
            </label>

            <select
              name="dataTypeId"
              value={form.dataTypeId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Select Data Type</option>

              {dataTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  {dt.dataTypeName}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Category*
            </label>

            <select
              name="dataCategoryId"
              value={form.dataCategoryId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Select Category</option>

              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          {/* OPC UA NODE ID */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              OPC UA Node ID
            </label>

            <input
              type="text"
              name="opcUANodeId"
              value={form.opcUANodeId}
              onChange={handleInputChange}
              placeholder="ns=2;s=RFID001"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-3">

          <button
            type="button"
            onClick={() => navigate("/masters/substationrfid")}
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

            Save Station RFID
          </button>

        </div>
      </form>
    </div>
  );
}