import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../../services/authService";
import {
  getPlcTypes,
  addPlc,
} from "../../services/plcMasterService";

interface PlcType {
  id: number;
  plcTypeName: string;
}

interface Props {
  addCallback?: (newRecord: any) => void;
}

export default function AddPlcMaster({ addCallback }: Props) {
  const navigate = useNavigate();

  // 1. ADDED: username and password to initial state
  const [form, setForm] = useState({
    plcName: "",
    plcType: "",
    ipAddress: "",
    connectionString: "",
    heartBeatNode: "",
    username: "",
    password: "",
    isActive: true,
  });

  const [plcTypes, setPlcTypes] = useState<PlcType[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
      return;
    }

    const loadDropdowns = async () => {
      try {
        const plcTypeData = await getPlcTypes();
        setPlcTypes(plcTypeData);
      } catch (err) {
        console.error("Dropdown load error:", err);
      }
    };

    loadDropdowns();
  }, [navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!form.plcName || !form.ipAddress || !form.plcType) {
      alert("Please fill all required fields!");
      return;
    }

    setSubmitting(true);

    try {
      // 2. ADDED: username and password to the API payload
      const payload = {
        plcName: form.plcName,
        plcType: Number(form.plcType),
        ipAddress: form.ipAddress,
        connectionString: form.connectionString,
        heartBeatNode: form.heartBeatNode,
        username: form.username,
        password: form.password,
        isActive: form.isActive,
      };

      const res = await addPlc(payload);

      if (res) {
        alert("PLC Saved Successfully");

        if (addCallback) {
          addCallback(res);
        }

        navigate("/masters/plcmaster");
      } else {
        alert("Save failed");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving PLC");
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
              Add PLC Master
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/masters/plcmaster")}
            className="mt-1 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300"
          >
            Back to PLC Master
          </button>
        </div>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Configure PLC connection details.
        </p>
      </div>

      {/* FORM */}
      <form className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/85 dark:ring-slate-800">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* PLC NAME */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              PLC Name *
            </label>

            <input
              type="text"
              name="plcName"
              value={form.plcName}
              onChange={handleInputChange}
              placeholder="Enter PLC Name"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* PLC TYPE */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              PLC Type *
            </label>

            <select
              name="plcType"
              value={form.plcType}
              onChange={handleInputChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Select PLC Type</option>

              {plcTypes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plcTypeName}
                </option>
              ))}
            </select>
          </div>

          {/* IP ADDRESS */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              IP Address *
            </label>

            <input
              type="text"
              name="ipAddress"
              value={form.ipAddress}
              onChange={handleInputChange}
              placeholder="192.168.1.20"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* CONNECTION STRING */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Connection String
            </label>

            <input
              type="text"
              name="connectionString"
              value={form.connectionString}
              onChange={handleInputChange}
              placeholder="Server=192.168.1.20;Port=102;"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* HEART BEAT NODE */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Heart Beat Node
            </label>

            <input
              type="text"
              name="heartBeatNode"
              value={form.heartBeatNode}
              onChange={handleInputChange}
              placeholder="HB001"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* 3. ADDED: USERNAME */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Username
            </label>

            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleInputChange}
              placeholder="Enter Username"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>

          {/* 4. ADDED: PASSWORD */}
          <div>
            <label className="mb-1 block text-sm font-semibold">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleInputChange}
              placeholder="Enter Password"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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

              <span className="text-sm">Active</span>
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/masters/plcmaster")}
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

            Save PLC
          </button>
        </div>
      </form>
    </div>
  );
}