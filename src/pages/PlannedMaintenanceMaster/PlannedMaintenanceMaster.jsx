// import { useEffect, useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import PageHero from "../../components/PageHero";
// import { ClipboardList, Pencil, CircleDashed, Trash2, CalendarDays, CalendarClock } from "lucide-react";
// import { getFilteredPlannedMaintenance, deletePlannedMaintenance } from "../../services/plannedMaintenanceService";
// import { getAllAssets } from "../../services/assetService";
// import customAlert from "../../components/Alerts/customAlert";
// import customConfirm from "../../components/Alerts/customConfirm";
// import CustomDropdown from "../../components/CustomDropdown";
// import { getEnumDataByParam } from "../../services/enumDataService";
// import DataTable from "../../components/DataTable";
// // 👇 Import your ENUM_OPTIONS to dynamically find the Category ID
// import { ENUM_OPTIONS } from "../EnumData/EnumDataMaster";

// const getTodayDate = () => {
//   const d = new Date();
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, '0');
//   const day = String(d.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

// const formatDateTime = (dateString) => {
//   if (!dateString) return "-";
//   const date = new Date(dateString);
//   return date.toLocaleString('en-GB', {
//     day: '2-digit', month: '2-digit', year: 'numeric',
//     hour: '2-digit', minute: '2-digit'
//   });
// };

// export default function PlannedMaintenanceMaster() {
//   const navigate = useNavigate();
//   const [data, setData] = useState([]);
//   const [assets, setAssets] = useState([]);
//   const [statuses, setStatuses] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [selectedStatus, setSelectedStatus] = useState("");
//   const [startDate, setStartDate] = useState(getTodayDate());
//   const [endDate, setEndDate] = useState(getTodayDate());

//   // ✅ DYNAMICALLY find which srNo represents "Completed" by reading the database text
//   const completedStatusId = useMemo(() => {
//     const found = statuses.find(s => (s.description || "").toLowerCase().includes("complete"));
//     return found ? Number(found.srNo) : null;
//   }, [statuses]);

//   const isCompletedSelected = selectedStatus !== "" && Number(selectedStatus) === completedStatusId;

//   const fetchData = async () => {
//     try {
//       setLoading(true);

//       // ✅ Dynamically find the integer value (11) for the Planned Maintenance Status
//       const statusCategoryObj = ENUM_OPTIONS.find(opt => opt.label === "Planned Maintenance Status");
//       const statusCategoryId = statusCategoryObj ? statusCategoryObj.value : 11;

//       const [pmResult, assetsResult, statusResult] = await Promise.all([
//         getFilteredPlannedMaintenance(selectedStatus, startDate, endDate),
//         getAllAssets(),
//         getEnumDataByParam(statusCategoryId)
//       ]);

//       setData(pmResult || []);
//       setAssets(assetsResult || []);
//       setStatuses(statusResult || []);
//     } catch (err) {
//       console.error("Failed to fetch planned maintenance:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, [selectedStatus, startDate, endDate]);

//   const handleEdit = (row) => {
//     if (Number(row.status) === completedStatusId) {
//       customAlert("Cannot edit a Planned Maintenance that is already Completed.", "error");
//       return;
//     }
//     navigate(`/masters/plannedmaintenance/edit/${row.id}`);
//   }

//   const handleDelete = async (id, rowStatus) => {
//     if (Number(rowStatus) === completedStatusId) {
//       customAlert("Cannot delete a Planned Maintenance that is already Completed.", "error");
//       return;
//     }

//     const isConfirmed = await customConfirm("Are you sure you want to delete this Planned Maintenance record?");
//     if (!isConfirmed) return;

//     try {
//       await deletePlannedMaintenance(id);
//       customAlert("Planned Maintenance deleted successfully!", "ok");
//       fetchData();
//     } catch (err) {
//       console.error("Failed to delete planned maintenance:", err);
//       const errorMsg = err.response?.data?.message || `Failed to delete.`;
//       customAlert(errorMsg, "error");
//     }
//   };

//   const getAssetName = (assetId) => {
//     const asset = assets?.find((a) => String(a.id) === String(assetId));
//     return asset ? asset.assetName : "-";
//   };

//   const getStatusName = (statusSrNo) => {
//     const status = statuses?.find((s) => String(s.srNo) === String(statusSrNo));
//     return status ? status.description : "-";
//   };

//   // ✅ DYNAMICALLY assign colors based on keywords in the Enum Description
//   const getStatusColor = (description) => {
//     const desc = (description || "").toLowerCase();
//     if (desc.includes("progress")) {
//       return 'bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/30';
//     } else if (desc.includes("complete")) {
//       return 'bg-orange-50 text-orange-700 ring-orange-100 dark:bg-orange-400/15 dark:text-orange-300 dark:ring-orange-400/30';
//     } else if (desc.includes("schedule") || desc.includes("new")) {
//       return 'bg-indigo-50 text-indigo-700 ring-indigo-100 dark:bg-indigo-400/15 dark:text-indigo-300 dark:ring-indigo-400/30';
//     } else if (desc.includes("cancel")) {
//       return 'bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-400/15 dark:text-rose-300 dark:ring-rose-400/30';
//     } else {
//       // Default color for ANY new status you add in the Enum page
//       return 'bg-slate-50 text-slate-700 ring-slate-100 dark:bg-slate-400/15 dark:text-slate-100 dark:ring-slate-400/30';
//     }
//   };

//   function StatusBadge({ statusId }) {
//     const statusName = getStatusName(statusId);
//     const tone = getStatusColor(statusName);

//     return (
//       <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition ${tone}`}>
//         <CircleDashed className="h-4 w-4" />
//         {statusName}
//       </span>
//     );
//   }

//   // Add this right above the 'return' statement
//   const filteredData = useMemo(() => {
//     if (!selectedStatus) return data;
//     return data.filter(row => String(row.status) === String(selectedStatus));
//   }, [data, selectedStatus]);


//   const columns = [
//     {
//       header: "ASSET NAME",
//       render: (row) => getAssetName(row.assetId)
//     },
//     {
//       header: "DESCRIPTION",
//       render: (row) => row.description || "-"
//     },
//     {
//       header: "START TIME",
//       render: (row) => formatDateTime(row.startDateTime)
//     },
//     {
//       header: "END TIME",
//       render: (row) => formatDateTime(row.endDateTime)
//     },
//     {
//       header: "STATUS",
//       render: (row) => <StatusBadge statusId={row.status} />
//     },
//     {
//       header: "ACTIONS",
//       render: (row) => {
//         const isRowCompleted = Number(row.status) === completedStatusId;

//         return (
//           <div className="flex gap-3">
//             <button
//               onClick={() => handleEdit(row)}
//               disabled={isRowCompleted}
//               className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${isRowCompleted
//                 ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
//                 : 'bg-[#eef4fa] text-[#1c75bc] hover:bg-[#dbeafe]'
//                 }`}
//             >
//               <Pencil className="h-3.5 w-3.5" /> Edit
//             </button>

//             <button
//               onClick={() => handleDelete(row.id, row.status)}
//               disabled={isRowCompleted}
//               className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${isRowCompleted
//                 ? 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
//                 : 'bg-[#fef2f2] text-[#e11d48] hover:bg-[#fee2e2]'
//                 }`}
//             >
//               <Trash2 className="h-3.5 w-3.5" /> Delete
//             </button>
//           </div>
//         );
//       },
//     },
//   ];
//   return (
//     <div className="space-y-6 relative">
//       <PageHero
//         eyebrow="Masters"
//         title="Planned Breakdown"
//         description="Manage and track scheduled equipment maintenance."
//         icon={CalendarClock}
//         pill={<div className="flex items-center gap-2 text-sm font-semibold"></div>}
//       />

//       <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
//         <div>
//           <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">Maintenance Actions</p>
//           <p className="text-sm text-slate-600 dark:text-slate-300">Filter and browse scheduled maintenance.</p>
//         </div>

//         <div className="flex flex-wrap items-center gap-3">
//           <div className="w-40">
//             <CustomDropdown
//               size="sm"
//               placeholder="All Statuses"
//               options={[
//                 { value: "", label: "All Statuses" },
//                 ...statuses.map((s) => ({ value: s.srNo, label: s.description }))
//               ]}
//               value={selectedStatus}
//               onChange={(val) => setSelectedStatus(val)}
//             />
//           </div>

//           <div className="relative flex items-center">
//             <CalendarDays size={14} className="absolute left-3 text-indigo-600 pointer-events-none" />
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               disabled={!isCompletedSelected}
//               className={`rounded-xl border py-1.5 pl-8 pr-3 text-xs font-medium outline-none transition-colors ${!isCompletedSelected
//                 ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
//                 : 'bg-white border-slate-300 text-slate-700 cursor-pointer focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
//                 }`}
//             />
//           </div>

//           <div className="relative flex items-center">
//             <CalendarDays size={14} className="absolute left-3 text-indigo-600 pointer-events-none" />
//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               disabled={!isCompletedSelected}
//               className={`rounded-xl border py-1.5 pl-8 pr-3 text-xs font-medium outline-none transition-colors ${!isCompletedSelected
//                 ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500'
//                 : 'bg-white border-slate-300 text-slate-700 cursor-pointer focus:border-indigo-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
//                 }`}
//             />
//           </div>

//           <button
//             onClick={() => navigate("/masters/plannedmaintenance/add")}
//             className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
//           >
//             <ClipboardList className="h-4 w-4" /> Add New Breakdown
//           </button>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="mt-6">
//         <DataTable columns={columns} data={filteredData} loading={loading} />
//       </div>    </div>
//   );
// }



import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import {
  ClipboardList,
  Pencil,
  CircleDashed,
  Trash2,
  CalendarDays,
  CalendarClock,
} from "lucide-react";
import customAlert from "../../components/Alerts/customAlert";
import customConfirm from "../../components/Alerts/customConfirm";
import CustomDropdown from "../../components/CustomDropdown";
import DataTable from "../../components/DataTable";

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

const COMPLETED_STATUS_ID = 3;

const getTodayDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Dummy records for initial display
const getDummyRecords = () => {
  const today = getTodayDate();

  return [
    {
      id: 1001,
      assetId: 1,
      assetName: "CNC Machine 01",
      description: "Regular preventive maintenance and lubrication check.",
      status: 1,
      statusName: "Scheduled",
      startDateTime: `${today}T09:00:00`,
      endDateTime: `${today}T11:00:00`,
      createdBy: 101,
    },
    {
      id: 1002,
      assetId: 2,
      assetName: "CNC Machine 02",
      description: "Motor inspection and bearing replacement.",
      status: 2,
      statusName: "In Progress",
      startDateTime: `${today}T10:00:00`,
      endDateTime: `${today}T13:00:00`,
      createdBy: 101,
    },
    {
      id: 1003,
      assetId: 3,
      assetName: "Conveyor 01",
      description: "Conveyor belt inspection and alignment completed.",
      status: 3,
      statusName: "Completed",
      startDateTime: `${today}T08:00:00`,
      endDateTime: `${today}T09:30:00`,
      createdBy: 101,
    },
    {
      id: 1004,
      assetId: 4,
      assetName: "Hydraulic Press 01",
      description: "Hydraulic oil level and pressure inspection.",
      status: 1,
      statusName: "Scheduled",
      startDateTime: `${today}T14:00:00`,
      endDateTime: `${today}T16:00:00`,
      createdBy: 101,
    },
  ];
};

export default function PlannedMaintenanceMaster() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());

  // Load records from localStorage
  const fetchData = () => {
    try {
      setLoading(true);

      let storedRecords = localStorage.getItem(STORAGE_KEY);

      if (storedRecords === null) {
        const dummyRecords = getDummyRecords();

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(dummyRecords)
        );

        setData(dummyRecords);
      } else {
        const parsedRecords = JSON.parse(storedRecords);

        setData(
          Array.isArray(parsedRecords) ? parsedRecords : []
        );
      }
    } catch (error) {
      console.error("Failed to load planned maintenance:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isCompletedSelected =
    selectedStatus !== "" &&
    Number(selectedStatus) === COMPLETED_STATUS_ID;

  // Filter records
  const filteredData = useMemo(() => {
    let filtered = [...data];

    if (selectedStatus !== "") {
      filtered = filtered.filter(
        (row) => Number(row.status) === Number(selectedStatus)
      );
    }

    // Apply date filter only for Completed status
    if (isCompletedSelected) {
      filtered = filtered.filter((row) => {
        const recordDate = row.endDateTime?.slice(0, 10);

        if (!recordDate) return false;

        return (
          recordDate >= startDate &&
          recordDate <= endDate
        );
      });
    }

    return filtered;
  }, [
    data,
    selectedStatus,
    startDate,
    endDate,
    isCompletedSelected,
  ]);

  // Edit
  const handleEdit = (row) => {
    if (Number(row.status) === COMPLETED_STATUS_ID) {
      customAlert(
        "Cannot edit a Planned Maintenance that is already Completed.",
        "error"
      );
      return;
    }

    navigate(`/masters/plannedmaintenance/edit/${row.id}`);
  };

  // Delete
  const handleDelete = async (id, rowStatus) => {
    if (Number(rowStatus) === COMPLETED_STATUS_ID) {
      customAlert(
        "Cannot delete a Planned Maintenance that is already Completed.",
        "error"
      );
      return;
    }

    const isConfirmed = await customConfirm(
      "Are you sure you want to delete this Planned Maintenance record?"
    );

    if (!isConfirmed) return;

    try {
      const existingRecords = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      );

      const updatedRecords = existingRecords.filter(
        (record) => String(record.id) !== String(id)
      );

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedRecords)
      );

      setData(updatedRecords);

      customAlert(
        "Planned Maintenance deleted successfully!",
        "ok"
      );
    } catch (error) {
      console.error("Failed to delete planned maintenance:", error);
      customAlert("Failed to delete.", "error");
    }
  };

  // Asset name
  const getAssetName = (assetId) => {
    const asset = dummyAssets.find(
      (a) => String(a.value) === String(assetId)
    );

    return asset ? asset.label : "-";
  };

  // Status name
  const getStatusName = (statusId) => {
    const status = dummyStatuses.find(
      (s) => String(s.value) === String(statusId)
    );

    return status ? status.label : "-";
  };

  // Status colors
  const getStatusColor = (description) => {
    const desc = (description || "").toLowerCase();

    if (desc.includes("progress")) {
      return "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/30";
    } else if (desc.includes("complete")) {
      return "bg-orange-50 text-orange-700 ring-orange-100 dark:bg-orange-400/15 dark:text-orange-300 dark:ring-orange-400/30";
    } else if (desc.includes("schedule") || desc.includes("new")) {
      return "bg-indigo-50 text-indigo-700 ring-indigo-100 dark:bg-indigo-400/15 dark:text-indigo-300 dark:ring-indigo-400/30";
    } else if (desc.includes("cancel")) {
      return "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-400/15 dark:text-rose-300 dark:ring-rose-400/30";
    }

    return "bg-slate-50 text-slate-700 ring-slate-100 dark:bg-slate-400/15 dark:text-slate-100 dark:ring-slate-400/30";
  };

  function StatusBadge({ statusId }) {
    const statusName = getStatusName(statusId);
    const tone = getStatusColor(statusName);

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition ${tone}`}
      >
        <CircleDashed className="h-4 w-4" />
        {statusName}
      </span>
    );
  }

  // Table columns
  const columns = [
    {
      header: "ASSET NAME",
      render: (row) => (
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {getAssetName(row.assetId)}
        </span>
      ),
    },
    {
      header: "DESCRIPTION",
      render: (row) => row.description || "-",
    },
    {
      header: "START TIME",
      render: (row) => formatDateTime(row.startDateTime),
    },
    {
      header: "END TIME",
      render: (row) => formatDateTime(row.endDateTime),
    },
    {
      header: "STATUS",
      render: (row) => <StatusBadge statusId={row.status} />,
    },
    {
      header: "ACTIONS",
      render: (row) => {
        const isRowCompleted =
          Number(row.status) === COMPLETED_STATUS_ID;

        return (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleEdit(row)}
              disabled={isRowCompleted}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${isRowCompleted
                  ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  : "bg-[#eef4fa] text-[#1c75bc] hover:bg-[#dbeafe]"
                }`}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>

            <button
              type="button"
              onClick={() =>
                handleDelete(row.id, row.status)
              }
              disabled={isRowCompleted}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold transition-colors ${isRowCompleted
                  ? "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                  : "bg-[#fef2f2] text-[#e11d48] hover:bg-[#fee2e2]"
                }`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="relative space-y-6">
      <PageHero
        eyebrow="Masters"
        title="Planned Breakdown"
        description="Manage and track scheduled equipment maintenance."
        icon={CalendarClock}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold" />
        }
      />

      {/* Filters and Add */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">
            Maintenance Actions
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Filter and browse scheduled maintenance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="w-40">
            <CustomDropdown
              size="sm"
              placeholder="All Statuses"
              options={[
                { value: "", label: "All Statuses" },
                ...dummyStatuses,
              ]}
              value={selectedStatus}
              onChange={(val) =>
                setSelectedStatus(val)
              }
            />
          </div>

          {/* Start Date */}
          <div className="relative flex items-center">
            <CalendarDays
              size={14}
              className="pointer-events-none absolute left-3 text-indigo-600"
            />

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
              }
              disabled={!isCompletedSelected}
              className={`rounded-xl border py-1.5 pl-8 pr-3 text-xs font-medium outline-none transition-colors ${!isCompletedSelected
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                  : "cursor-pointer border-slate-300 bg-white text-slate-700 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
            />
          </div>

          {/* End Date */}
          <div className="relative flex items-center">
            <CalendarDays
              size={14}
              className="pointer-events-none absolute left-3 text-indigo-600"
            />

            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) =>
                setEndDate(e.target.value)
              }
              disabled={!isCompletedSelected}
              className={`rounded-xl border py-1.5 pl-8 pr-3 text-xs font-medium outline-none transition-colors ${!isCompletedSelected
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                  : "cursor-pointer border-slate-300 bg-white text-slate-700 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                }`}
            />
          </div>

          {/* Add */}
          <button
            type="button"
            onClick={() =>
              navigate("/masters/plannedmaintenance/add")
            }
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
          >
            <ClipboardList className="h-4 w-4" />
            Add New Breakdown
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filteredData}
          loading={loading}
        />
      </div>
    </div>
  );
}