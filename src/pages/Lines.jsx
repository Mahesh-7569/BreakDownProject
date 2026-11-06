import { useState, useMemo,useEffect} from "react";
import StatsCard from "../components/StatsCard";
import {
  BadgeCheck  ,
  CheckCircle2,
  Folder,
  Layers,
  XCircle,
  MapPinned,
  PencilLine,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLines } from "../services/lineService";
// import { getLineSummary } from "../services/lineMappingService";
const statusTone = {
  Active: {
    bg: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    dot: "bg-emerald-500",
  },
  Inactive: {
    bg: "bg-rose-50 text-rose-700 ring-rose-100",
    dot: "bg-rose-500",
  },
};

const badge = (status) => (
  <span
    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
      statusTone[status]?.bg || "bg-slate-100 text-slate-700"
    }`}
  >
    <span
      className={`h-2 w-2 rounded-full ${
        statusTone[status]?.dot || "bg-slate-400"
      }`}
    />
    {status}
  </span>
);

export default function LinesPage() {
  const navigate = useNavigate();
  const [perPage, setPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState(null);
const [lines, setLines] = useState([]);
  const displayedLines = useMemo(() => {
    return lines.filter((line) =>
      line.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [lines, searchTerm]);

  const paginatedLines = displayedLines.slice(0, perPage);
  const lineCount = displayedLines.length;

  const activeLineCount = lines.filter((l) => l.status === "Active").length;
  const inactiveLineCount = lines.filter((l) => l.status === "Inactive").length;

  useEffect(() => {
  const fetchLines = async () => {
    const data = await getLines();

    const formatted = data.map((line) => ({
  id: line.id,
  name: line.lineName,
  status: line.isActive ? "Active" : "Inactive",
}));
    setLines(formatted);
  };

  fetchLines();
}, []);


// useEffect(() => {
//   const fetchSummary = async () => {
//     const data = await getLineSummary();
//     console.log("Line Summary:", data);
//     setSummary(data);
//   };  

//   fetchSummary();
// }, []);


  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col gap-4 rounded-3xl bg-white/80 p-6 shadow-lg ring-1 ring-slate-200">

        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Masters
            </p>
            <h1 className="text-3xl font-semibold text-slate-900">
              Line 
            </h1>
            <p className="text-sm text-slate-600">
              Manage production lines from one dashboard.
            </p>
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-sm font-semibold text-white shadow-md"  
          onClick={() => navigate("/masters/Line/add")}>
            <Plus className="h-4 w-4" />
            Add Line
          </button>
        </div>

        {/* Stats */}
       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

  {/* <StatsCard
    className="min-h-[200px]"
    title="Line FOlder Map"
    value={summary?.lineFolderMapCount || 0}
    subtitle="Lines with folder mapping"
    icon={Folder}
  />

  <StatsCard
    className="min-h-[200px]"
    title="Mapped Lines"
    value={summary?.mappedCount || 0}
    subtitle="Completed mappings"
    icon={ MapPinned}
  /> */}

  {/* <StatsCard
    className="min-h-[200px]"
    title="Unmapped Lines"
    value={summary?.unmappedCount || 0}
    subtitle="Pending mappings"
    icon={XCircle}
  /> */}

  {/* <StatsCard
    className="min-h-[200px]"
    title="Coverage"
    value={`${summary?.coverage || 0}%`} 
    subtitle="System ready"
    icon={BadgeCheck }
  /> */}

</div>

        {/* Search + Controls */}
        <div className="flex flex-col gap-3 rounded-2xl bg-white/60 p-4 ring-1 ring-slate-200 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <Layers className="h-4 w-4 text-[#1c75bc]" />
            {lineCount} Lines
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              Show
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="rounded-md border-slate-200 text-sm"
              >
                {[5, 10, 25, 50].map((count) => (
                  <option key={count}>{count}</option>
                ))}
              </select>
              Entries
            </label>

            <div className="relative w-[220px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search lines..."
                className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-3 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl bg-white/60 ring-1 ring-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Id</th>
                <th className="px-4 py-3">Line Name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedLines.map((line) => (
                <tr key={line.id}>
                  <td className="px-4 py-3 font-semibold">{line.id}</td>

                  <td className="px-4 py-3">
                    <div className="font-semibold">{line.name}</div>
                  </td>

                  <td className="px-4 py-3">{badge(line.status)}</td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-lg p-2 text-slate-500 hover:text-[#1c75bc]"
                     onClick={() => navigate(`/masters/line/edit/${line.id}`)}>
                    
                        <PencilLine className="h-4 w-4" />
                      </button>

                     
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <span>
              Showing {paginatedLines.length} of {lineCount} entries
            </span>

            <div className="inline-flex items-center gap-2">
              <button className="px-2">〈</button>
              <span className="bg-[#1c75bc] px-2 py-1 text-white">1</span>
              <button className="px-2">〉</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}