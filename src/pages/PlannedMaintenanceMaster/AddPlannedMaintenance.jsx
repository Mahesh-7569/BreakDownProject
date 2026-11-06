// import { useState, useEffect } from "react";
// import { Save, Loader2 } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { createPlannedMaintenance } from "../../services/plannedMaintenanceService";
// import { getAllAssets } from "../../services/assetService";
// import customAlert from "../../components/Alerts/customAlert";
// import CustomDropdown from "../../components/CustomDropdown";
// import { getEnumDataByParam } from "../../services/enumDataService";
// import { ENUM_OPTIONS } from "../EnumData/EnumDataMaster";

// // Helper function to get exact local time including seconds (YYYY-MM-DDTHH:mm:ss)
// const getLocalISOTime = () => {
//   return new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
//     .toISOString()
//     .slice(0, 19); 
// };

// export default function AddPlannedMaintenance() {
//   const navigate = useNavigate();
//   const [submitting, setSubmitting] = useState(false);
//   const [assets, setAssets] = useState([]);
//   const [statuses, setStatuses] = useState([]);
//   const [initialLoadTime] = useState(getLocalISOTime());

//   const [form, setForm] = useState({
//     pmNumber: "",
//     assetId: "",
//     description: "",
//     startTime: initialLoadTime,
//     endTime: initialLoadTime,
//     status: "", 
//   });

//   useEffect(() => {
//     const fetchDropdowns = async () => {
//       try {
//         // 👇 Adjust label to match your actual Enum mapping for Planned Maintenance Status
//         const statusEnumValue = ENUM_OPTIONS.find(opt => opt.label === "Planned Maintenance Status")?.value || "PM_STATUS";

//         const [assetsData, statusesData] = await Promise.all([
//           getAllAssets(),
//           getEnumDataByParam(statusEnumValue)
//         ]);

//         setAssets(assetsData || []);
//         setStatuses(statusesData || []);

//         // 👉 Automatically select "Scheduled" or "New" status by default if it exists
//         if (statusesData && statusesData.length > 0) {
//           const defaultStatus = statusesData.find(
//             (s) => s.description.toLowerCase().trim() === "scheduled" || s.description.toLowerCase().trim() === "new"
//           );
//           if (defaultStatus) {
//             setForm((prev) => ({ ...prev, status: defaultStatus.srNo }));
//           }
//         }
//       } catch (err) {
//         console.error("Failed to load dropdown data", err);
//       }
//     };
//     fetchDropdowns();
//   }, []);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//  const handleSave = async () => {
//     const missingFields = [];
//     if (!form.assetId) missingFields.push("Asset");
//     if (!form.status) missingFields.push("Status");
//     // 👇 Added validation for description
//     if (!form.description || !form.description.trim()) missingFields.push("Description");
//     if (!form.startTime) missingFields.push("Start Time");
//     if (!form.endTime) missingFields.push("End Time");

//     if (missingFields.length > 0) {
//       customAlert(`Please fill in: ${missingFields.join(", ")}`, "error");
//       return;
//     }

//     if (new Date(form.endTime) <= new Date(form.startTime)) {
//       customAlert("End Time must be after Start Time!", "error");
//       return;
//     }

//     try {
//       setSubmitting(true);

//       await createPlannedMaintenance({
//         assetId: Number(form.assetId),
//         description: form.description.trim(),
//         status: Number(form.status),
//         startDateTime: form.startTime, 
//         endDateTime: form.endTime,
//         createdBy: 101 
//       });

//       customAlert("Planned Maintenance added successfully!", "ok");
//       navigate("/masters/plannedmaintenance");
//     } catch (error) {
//       console.error("Error adding planned maintenance:", error);
//       customAlert("Failed to add planned maintenance!", "error");
//     } finally {
//       setSubmitting(false);
//     }
//   };
//   const assetOptions = assets.map((a) => ({ value: a.id, label: a.assetName })); 
//   const statusOptions = statuses.map((s) => ({ value: String(s.srNo), label: s.description }));

//   return (
//     <div className="container py-6 text-slate-900 dark:text-slate-100">
//       <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80">
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <div>
//             <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Masters</p>
//             <h1 className="mt-1 text-2xl font-semibold">Add Planned Maintenance</h1>
//           </div>
//           <button
//             type="button"
//             onClick={() => navigate("/masters/plannedmaintenance")}
//             className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
//           >
//             Back to Planned Maintenance
//           </button>
//         </div>
//       </div>

//       <form className="mt-6 overflow-visible rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80">
//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-start">



//           <div className="col-span-1">
//             <label className="mb-1 block text-sm font-semibold">Asset*</label>
//             <div className="mt-2">
//               <CustomDropdown
//                 placeholder="Select Asset"
//                 options={assetOptions}
//                 value={form.assetId}
//                 onChange={(val) => setForm(prev => ({ ...prev, assetId: val === "" ? "" : String(val) }))}
//               />
//             </div>
//           </div>

//           <div className="col-span-1">
//             <label className="mb-1 block text-sm font-semibold">Status*</label>
//             <div className="mt-2">
//               <CustomDropdown
//                 placeholder="Select Status"
//                 options={statusOptions}
//                 value={form.status}
//                 onChange={(val) => setForm(prev => ({ ...prev, status: val === "" ? "" : String(val) }))}
//               />
//             </div>
//           </div>

//           <div className="col-span-1 lg:col-span-3">
//             <label className="mb-1 block text-sm font-semibold">Description</label>
//             <div className="mt-2">
//               <textarea 
//                 name="description" 
//                 value={form.description} 
//                 onChange={handleInputChange} 
//                 rows="3"
//                 className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none bg-white resize-none" 
//                 placeholder="Briefly describe the planned maintenance..." 
//               />
//             </div>
//           </div>

//           <div className="col-span-1">
//             <label className="mb-1 block text-sm font-semibold">Start Time*</label>
//             <div className="mt-2">
//               <input 
//                 type="datetime-local" 
//                 step="1"
//                 name="startTime" 
//                 value={form.startTime} 
//                 onChange={handleInputChange} 
//                 className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none bg-white" 
//               />
//             </div>
//           </div>

//           <div className="col-span-1">
//             <label className="mb-1 block text-sm font-semibold">End Time*</label>
//             <div className="mt-2">
//               <input 
//                 type="datetime-local" 
//                 step="1"
//                 name="endTime" 
//                 value={form.endTime} 
//                 onChange={handleInputChange} 
//                 className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm shadow-sm outline-none bg-white" 
//               />
//             </div>
//           </div>

//         </div>

//         <div className="mt-8 flex justify-end gap-3">
//           <button 
//             type="button" 
//             onClick={() => navigate("/masters/plannedmaintenance")} 
//             className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-50"
//           >
//             Cancel
//           </button>
//           <button 
//             type="button" 
//             disabled={submitting} 
//             onClick={handleSave} 
//             className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16629b]"
//           >
//               {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Maintenance
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }



import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import customAlert from "../../components/Alerts/customAlert";
import CustomDropdown from "../../components/CustomDropdown";

const STORAGE_KEY = "mes_planned_maintenance";

const dummyAssets = [
  { value: "1", label: "CNC Machine 01" },
  { value: "2", label: "CNC Machine 02" },
  { value: "3", label: "Conveyor 01" },
  { value: "4", label: "Hydraulic Press 01" },
  { value: "5", label: "Laser Marking Machine 01" },
];

const dummyStatuses = [
  { value: "1", label: "Scheduled" },
  { value: "2", label: "In Progress" },
  { value: "3", label: "Completed" },
  { value: "4", label: "Cancelled" },
];

const getLocalISOTime = () => {
  return new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 19);
};

export default function AddPlannedMaintenance() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);

  const [initialLoadTime] = useState(getLocalISOTime());

  const [form, setForm] = useState({
    assetId: "",
    description: "",
    startTime: initialLoadTime,
    endTime: initialLoadTime,
    status: "1",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    const missingFields = [];

    if (!form.assetId) missingFields.push("Asset");
    if (!form.status) missingFields.push("Status");

    if (!form.description.trim()) {
      missingFields.push("Description");
    }

    if (!form.startTime) missingFields.push("Start Time");
    if (!form.endTime) missingFields.push("End Time");

    if (missingFields.length > 0) {
      customAlert(
        `Please fill in: ${missingFields.join(", ")}`,
        "error"
      );
      return;
    }

    if (new Date(form.endTime) <= new Date(form.startTime)) {
      customAlert("End Time must be after Start Time!", "error");
      return;
    }

    try {
      setSubmitting(true);

      const selectedAsset = dummyAssets.find(
        (asset) => asset.value === form.assetId
      );

      const selectedStatus = dummyStatuses.find(
        (status) => status.value === form.status
      );

      const newRecord = {
        id: Date.now(),
        assetId: Number(form.assetId),
        assetName: selectedAsset?.label || "",
        description: form.description.trim(),
        status: Number(form.status),
        statusName: selectedStatus?.label || "",
        startDateTime: form.startTime,
        endDateTime: form.endTime,
        createdBy: 101,
        createdDate: new Date().toISOString(),
      };

      const existingRecords = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([newRecord, ...existingRecords])
      );

      customAlert(
        "Planned Maintenance added successfully!",
        "ok"
      );

      navigate("/masters/plannedmaintenance");
    } catch (error) {
      console.error("Error adding planned maintenance:", error);
      customAlert("Failed to add planned maintenance!", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-6 text-slate-900 dark:text-slate-100">

      {/* Page Header */}
      <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:ring-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Masters
            </p>

            <h1 className="mt-1 text-2xl font-semibold">
              Add Planned Maintenance
            </h1>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/masters/plannedmaintenance")
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Back to Planned Maintenance
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="mt-6 overflow-visible rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/90 dark:ring-slate-700"
      >
        <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">

          {/* Asset */}
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">
              Asset*
            </label>

            <div className="mt-2">
              <CustomDropdown
                placeholder="Select Asset"
                options={dummyAssets}
                value={form.assetId}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    assetId: val === "" ? "" : String(val),
                  }))
                }
              />
            </div>
          </div>

          {/* Status */}
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">
              Status*
            </label>

            <div className="mt-2">
              <CustomDropdown
                placeholder="Select Status"
                options={dummyStatuses}
                value={form.status}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    status: val === "" ? "" : String(val),
                  }))
                }
              />
            </div>
          </div>

          {/* Description */}
          <div className="col-span-1 lg:col-span-3">
            <label className="mb-1 block text-sm font-semibold">
              Description*
            </label>

            <div className="mt-2">
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[#1c75bc] dark:border-slate-700 dark:bg-slate-800"
                placeholder="Briefly describe the planned maintenance..."
              />
            </div>
          </div>

          {/* Start Time */}
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">
              Start Time*
            </label>

            <div className="mt-2">
              <input
                type="datetime-local"
                step="1"
                name="startTime"
                value={form.startTime}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[#1c75bc] dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>

          {/* End Time */}
          <div className="col-span-1">
            <label className="mb-1 block text-sm font-semibold">
              End Time*
            </label>

            <div className="mt-2">
              <input
                type="datetime-local"
                step="1"
                name="endTime"
                value={form.endTime}
                onChange={handleInputChange}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[#1c75bc] dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              navigate("/masters/plannedmaintenance")
            }
            disabled={submitting}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#16629b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {submitting ? "Saving..." : "Save Maintenance"}
          </button>
        </div>
      </form>
    </div>
  );
}