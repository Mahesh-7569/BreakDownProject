// pages/SubstationRfid/EditSubstationRfid.tsx

import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  getDataTypes,
  getCategories,
  updateSubstationRfid,
  getSubstationRfidById,
} from "../../services/subStationRfidService";

type DropdownItem = {
  id: number;
  name: string;
};

export default function EditSubstationRfid() {
  const navigate = useNavigate();
  const location = useLocation() as any;

  const rfidId = location.state?.rfid?.id;

  // Selected station
 const selectedStation = location.state?.selectedStation;

const preSelectedStation =
  selectedStation?.stationName ||
  selectedStation?.name ||
  "";

const preSelectedStationId =
  selectedStation?.id || 0;
  
  const [form, setForm] = useState({
    stationId: preSelectedStationId,
    stationName: preSelectedStation,

    rfidName: "",
    dataTypeId: "",
    dataCategoryId: "",
    opcUANodeId: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [dataTypes, setDataTypes] = useState<DropdownItem[]>([]);
  const [categories, setCategories] = useState<DropdownItem[]>([]);

  // ===============================
  // FETCH DROPDOWNS
  // ===============================
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const dt = await getDataTypes();
        const cat = await getCategories();

        const mappedDataTypes = dt.map((d: any) => ({
          id: d.id,
          name: d.dataTypeName,
        }));

        const mappedCategories = cat.map((c: any) => ({
          id: c.id,
          name: c.categoryName,
        }));

        setDataTypes(mappedDataTypes);
        setCategories(mappedCategories);
      } catch (err) {
        console.error("Dropdown fetch error:", err);
      }
    };

    fetchDropdowns();
  }, []);

  // ===============================
  // FETCH RFID BY ID
  // ===============================
  useEffect(() => {
    const fetchData = async () => {
      if (!rfidId) return;

      try {
        const data = await getSubstationRfidById(rfidId);

        if (data) {
          setForm((prev) => ({
            ...prev,

            rfidName: data.rfidName || "",
            dataTypeId: data.dataTypeId?.toString() || "",
            dataCategoryId:
              data.dataCategoryId?.toString() || "",
            opcUANodeId: data.opcUANodeId || "",
          }));
        }
      } catch (err) {
        console.error("Fetch RFID error:", err);
      }
    };

    fetchData();
  }, [rfidId]);

  // ===============================
  // HANDLE INPUT
  // ===============================
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ===============================
  // UPDATE
  // ===============================
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
        id: rfidId,
        stationId: Number(form.stationId),

        rfidName: form.rfidName,

        dataTypeId: Number(form.dataTypeId),

        dataCategoryId: Number(
          form.dataCategoryId
        ),

        opcUANodeId: form.opcUANodeId,
      };

      console.log("UPDATE PAYLOAD:", payload);

      const res = await updateSubstationRfid(
        rfidId,
        payload
      );

      if (res) {
        alert("Station RFID updated successfully!");

        navigate("/masters/substationrfid", {
          state: { refresh: true },
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Error updating Station RFID");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">

      {/* HEADER */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Masters
            </p>

            <h1 className="mt-1 text-2xl font-semibold">
              Edit Station RFID
            </h1>
          </div>

          <button
            onClick={() =>
              navigate("/masters/substationrfid")
            }
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Station RFID
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-600">
          Update Station RFID parameters.
        </p>
      </div>

      {/* FORM */}
      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80">

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* Station */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Station*
            </label>

            <input
              type="text"
              value={form.stationName}
              readOnly
              className="mt-2 w-full rounded-2xl border bg-gray-100 px-4 py-3 text-sm"
            />
          </div>

          {/* RFID Name */}
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
              className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
            />
          </div>

          {/* Data Type */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Data Type*
            </label>

            <select
              name="dataTypeId"
              value={form.dataTypeId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
            >
              <option value="">
                Select Data Type
              </option>

              {dataTypes.map((d) => (
                <option
                  key={d.id}
                  value={d.id}
                >
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Category*
            </label>

            <select
              name="dataCategoryId"
              value={form.dataCategoryId}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
            >
              <option value="">
                Select Category
              </option>

              {categories.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                >
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* OPC UA NODE */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              opcUA Node ID
            </label>

            <input
              type="text"
              name="opcUANodeId"
              value={form.opcUANodeId}
              onChange={handleInputChange}
              placeholder="ns=2;s=RFID001"
              className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
            />
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-3">

          <button
            type="button"
            onClick={() =>
              navigate("/masters/substationrfid")
            }
            className="rounded-xl border px-4 py-2 text-sm"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            Update Station RFID
          </button>
        </div>
      </form>
    </div>
  );
}