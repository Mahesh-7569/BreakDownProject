import { useEffect, useMemo, useState } from "react";
import { ClipboardList } from "lucide-react";
import PageHero from "../../components/PageHero";
import { CSVLink } from "react-csv";
import { getDetailProductionForPart } from "../../services/ProductionforPartService";
const statusClasses = {
  None:
    "bg-gray-100 text-gray-700 ring-1 ring-gray-300/70 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-300/30",
  Healthy:
    "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300/70 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-300/30",
  Warning:
    "bg-amber-100 text-amber-700 ring-1 ring-amber-300/70 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-300/30",
  Critical:
    "bg-rose-100 text-rose-700 ring-1 ring-rose-300/70 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-300/30",
  Breakdown:
    "bg-red-100 text-red-700 ring-1 ring-red-300/70 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-300/30",
};



const formatDateTime = (value) => {
  if (!value) {
    return "NF";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "NF";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

const toLocalDateTimeParam = (value) => {
  if (!value) {
    return "";
  }

  // datetime-local usually returns YYYY-MM-DDTHH:mm, append seconds for backend LocalDateTime.
  return value.length === 16 ? `${value}:00` : value;
};

export default function ProductionForPart() {
  const now = new Date();
  const nowLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const [lines, setLines] = useState([]);

  const [partNo, setPartNo] = useState("");
const [alerts, setAlerts] = useState([]);
const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

   const totalPages = Math.max(1, Math.ceil(alerts.length / rowsPerPage));
  const pagedAlerts = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return alerts.slice(startIndex, startIndex + rowsPerPage);
  }, [alerts, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  
const handleSearch = async () => {
  if (!partNo) {
    setAlerts([]);
    return;
  }

  try {
    setLoading(true);
     const cleanPartNo = partNo.split("!").filter(Boolean).pop();

    console.log("Sending CLEAN partNo:", cleanPartNo);

    const res = await getDetailProductionForPart(partNo);
console.log("API RESPONSE 👉", res);
   if (!res || !res.success) {
  console.error("API failed:", res);
  setAlerts([]);
  return;
}

 const mapped = res.data.map((item, index) => ({
  id: index,
  srNo: item.srNo || "",
  lineName: item.lineName || "",
  partNo: item.partNo || "",
  detail: item.detail || "",
  value: item.value || "",
  status: item.status || "",
}));
    setAlerts(mapped);

  } catch (err) {
    console.error(err);
    setAlerts([]);
  } finally {
    setLoading(false);
  }
};


  

  return (
    <div className="p-3 space-y-3">
      <PageHero
        eyebrow="Reports"
        title="Production For Part"
        description="Filter and review machine alerts by date range and machine"
        icon={ClipboardList}
      />

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          

         {/* ✅ Part No Input */}
    <div>
      <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
        Part No
      </label>
      <input
        type="text"
        
        className="mt-1 w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
        value={partNo}
        onChange={(e) => setPartNo(e.target.value)}
      />
    </div>


          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition"
            >
              {loading ? "Loading..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-70">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Production for part Data
          </h2>
          <span className="text-xs text-slate-800 dark:text-slate-300">
            {alerts.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">

            {/* Export CSV Button */}
<div className="flex justify-end px-4 py-2">
  <CSVLink
    data={alerts} // all rows
    headers={[
      { label: "Sr No", key: "srNo" },
      { label: "Part No", key: "partNo" },
      { label: "Line", key: "lineName" },
      { label: "Detail", key: "detail" },
      { label: "Value", key: "value" },
      { label: "Status", key: "status" },
    ]}
  filename={`production-for-part_${alerts[0]?.partNo || "AllParts"}.csv`}  >
    <button className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition">
      Export CSV
    </button>
  </CSVLink>
</div>
          <table className="min-w-full text-sm text-slate-700 dark:text-slate-200">
            <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-sm uppercase tracking-wider text-slate-600 dark:text-slate-300 z-10">
              <tr>
                
  <th className="px-6 py-2 text-left">Sr No</th> 
   <th className="px-6 py-2 text-left">Part No</th>
  <th className="px-6 py-2 text-left">Line</th>
 
  <th className="px-6 py-2 text-left">Detail</th>
  <th className="px-6 py-2 text-left">Value</th>
  <th className="px-6 py-2 text-left">Status</th>
</tr>

              
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
  <tr>
    <td colSpan={6} className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 text-center">
      Loading data...
    </td>
  </tr>
) : pagedAlerts.length === 0 ? (
  <tr>
    <td colSpan={6} className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200 text-center">
      No Production For Part available
    </td>
  </tr>
) : (
  pagedAlerts.map((item, index) => (
    <tr key={index}>
        <>
      <td className="px-6 py-2">{item.srNo}</td>
            <td className="px-6 py-2">{item.partNo}</td>

      <td className="px-6 py-2">{item.lineName}</td>
      <td className="px-6 py-2">{item.detail}</td>
      <td className="px-6 py-2">{item.value}</td>
     <td className="px-6 py-2">
  {(item.status === "OK" || item.status === "NOK" || item.status === "NG") && (
    <span
      className={`px-2 py-1 rounded-md text-xs font-semibold ${
        statusClasses[
          item.status === "OK"
            ? "Healthy"
            : item.status === "NOK" || item.status === "NG"
            ? "Critical"
            : "None"
        ]
      }`}
    >
      {item.status}
    </span>
  )}
</td>
      </>
    </tr>
  ))
)}


            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 px-6 py-3">
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-600 dark:text-slate-300">Rows per page</label>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
