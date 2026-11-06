// import { useState, useEffect } from "react";
// import { Save, Loader2 } from "lucide-react";
// import { useNavigate, useParams } from "react-router-dom";
// import { updatePlannedMaintenance, getAllPlannedMaintenance } from "../../services/plannedMaintenanceService";
// import { getAllAssets } from "../../services/assetService";
// import customAlert from "../../components/Alerts/customAlert";
// import CustomDropdown from "../../components/CustomDropdown";
// import { getEnumDataByParam } from "../../services/enumDataService";
// import { ENUM_OPTIONS } from "../EnumData/EnumDataMaster";

// export default function EditPlannedMaintenance() {
//   const navigate = useNavigate();
//   const { id } = useParams();
//   const [submitting, setSubmitting] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [assets, setAssets] = useState([]);
//   const [statuses, setStatuses] = useState([]);

//   const [form, setForm] = useState({
//     pmNumber: "",
//     assetId: "",
//     description: "",
//     status: "",
//     startTime: "", 
//     endTime: ""
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         // 👇 Adjust label to match your actual Enum mapping for Planned Maintenance Status
//         const statusEnumValue = ENUM_OPTIONS.find(opt => opt.label === "Planned Maintenance Status")?.value || "PM_STATUS";

//         // ✅ Load Planned Maintenance records, Assets, and Statuses in parallel
//         const [pmData, assetsData, statusData] = await Promise.all([
//           getAllPlannedMaintenance(),
//           getAllAssets(),
//           getEnumDataByParam(statusEnumValue)
//         ]);

//         setAssets(assetsData || []);
//         setStatuses(statusData || []);

//        const pm = pmData?.find((a) => String(a.id) === String(id));
//         if (pm) {
//           setForm({
//             pmNumber: pm.pmNumber || pm.plannedMaintenanceNumber || "",
//             assetId: pm.assetId || "",
//             description: pm.description || "",
//             status: String(pm.status || ""),

//             // 👇 Change pm.startTime to pm.startDateTime
//             startTime: pm.startDateTime ? pm.startDateTime.slice(0, 19) : "",

//             // 👇 Change pm.endTime to pm.endDateTime
//             endTime: pm.endDateTime ? pm.endDateTime.slice(0, 19) : ""
//           });
//         } else {
//           customAlert("Planned Maintenance record not found!", "error");
//           navigate("/masters/plannedmaintenance");
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         customAlert("Failed to load data.", "error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [id, navigate]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//  const handleUpdate = async () => {
//     // 👇 Removed !form.pmNumber.trim() from the validation
//     if (!form.assetId || !form.status || !form.startTime || !form.endTime) {
//       customAlert("Please fill in Asset, Status, Start Time, and End Time!", "error");
//       return;
//     }

//     // Validate that End Time is after Start Time
//     if (new Date(form.endTime) <= new Date(form.startTime)) {
//       customAlert("End Time must be after Start Time!", "error");
//       return;
//     }

//     try {
//       setSubmitting(true);

//       await updatePlannedMaintenance(id, {
//         // 👇 Removed pmNumber from the payload
//         assetId: Number(form.assetId),
//         description: form.description.trim(),
//         status: Number(form.status),
//         startDateTime: form.startTime, 
//         endDateTime: form.endTime
//       });

//       customAlert("Planned Maintenance updated successfully!", "ok");
//       navigate("/masters/plannedmaintenance"); // Make sure this route matches your app
//     } catch (error) {
//       console.error("Error updating planned maintenance:", error);
//       customAlert("Failed to update planned maintenance!", "error");
//     } finally {
//       setSubmitting(false);
//     }
//   };
//   const assetOptions = assets.map((a) => ({ value: a.id, label: a.assetName })); 
//   const statusOptions = statuses.map((s) => ({ value: String(s.srNo), label: s.description }));

//   if (loading) {
//     return (
//       <div className="container flex h-40 items-center justify-center">
//         <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
//       </div>
//     );
//   }

//   return (
//     <div className="container py-6 text-slate-900 dark:text-slate-100">
//       <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80">
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <div>
//             <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Masters</p>
//             <h1 className="mt-1 text-2xl font-semibold">Edit Planned Maintenance</h1>
//           </div>
//           <button 
//             type="button" 
//             onClick={() => navigate("/masters/plannedmaintenance")} 
//             className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
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
//             onClick={handleUpdate} 
//             className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#16629b]"
//           >
//             {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Update Maintenance
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function EditPlannedMaintenance() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    assetId: "",
    description: "",
    status: "",
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    try {
      const records = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const pm = records.find(
        (record) => String(record.id) === String(id)
      );

      if (!pm) {
        customAlert(
          "Planned Maintenance record not found!",
          "error"
        );
        navigate("/masters/plannedmaintenance");
        return;
      }

      setForm({
        assetId: String(pm.assetId || ""),
        description: pm.description || "",
        status: String(pm.status || ""),
        startTime: pm.startDateTime
          ? pm.startDateTime.slice(0, 19)
          : "",
        endTime: pm.endDateTime
          ? pm.endDateTime.slice(0, 19)
          : "",
      });
    } catch (error) {
      console.error("Error loading planned maintenance:", error);
      customAlert("Failed to load data.", "error");
      navigate("/masters/plannedmaintenance");
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = () => {
    if (
      !form.assetId ||
      !form.status ||
      !form.description.trim() ||
      !form.startTime ||
      !form.endTime
    ) {
      customAlert(
        "Please fill in Asset, Status, Description, Start Time, and End Time!",
        "error"
      );
      return;
    }

    if (new Date(form.endTime) <= new Date(form.startTime)) {
      customAlert(
        "End Time must be after Start Time!",
        "error"
      );
      return;
    }

    try {
      setSubmitting(true);

      const records = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const selectedAsset = dummyAssets.find(
        (asset) => asset.value === form.assetId
      );

      const selectedStatus = dummyStatuses.find(
        (status) => status.value === form.status
      );

      const updatedRecords = records.map((record) => {
        if (String(record.id) === String(id)) {
          return {
            ...record,
            assetId: Number(form.assetId),
            assetName: selectedAsset?.label || "",
            description: form.description.trim(),
            status: Number(form.status),
            statusName: selectedStatus?.label || "",
            startDateTime: form.startTime,
            endDateTime: form.endTime,
            updatedDate: new Date().toISOString(),
          };
        }

        return record;
      });

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedRecords)
      );

      customAlert(
        "Planned Maintenance updated successfully!",
        "ok"
      );

      navigate("/masters/plannedmaintenance");
    } catch (error) {
      console.error("Error updating planned maintenance:", error);
      customAlert(
        "Failed to update planned maintenance!",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

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
              Edit Planned Maintenance
            </h1>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/masters/plannedmaintenance")
            }
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Back to Planned Maintenance
          </button>
        </div>
      </div>

      {/* Edit Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate();
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
                    assetId:
                      val === "" ? "" : String(val),
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
                    status:
                      val === "" ? "" : String(val),
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

            {submitting
              ? "Updating..."
              : "Update Maintenance"}
          </button>
        </div>
      </form>
    </div>
  );
}