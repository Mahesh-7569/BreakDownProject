import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import { GitBranch , CheckCircle2, CircleDashed, Pencil } from "lucide-react";

import { getLines } from "../../services/lineService";
import { getVariants } from "../../services/variantService";
import { getLineMappings } from "../../services/lineMappingService";

export default function LineMapping() {

  const navigate = useNavigate();

  const [lineMappings, setLineMappings] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
const [allMappings, setAllMappings] = useState<any[]>([]); // keep all mappings
  const [selectedLine, setSelectedLine] = useState("");

  useEffect(() => {
  fetchInitialData();
}, []);

const fetchInitialData = async () => {
  try {

    setLoading(true);

    const [lineData, variantData, mappingData] = await Promise.all([
      getLines(),
      getVariants(),
      getLineMappings()
    ]);

    // services already return arrays
    setLines(lineData);
    setVariants(variantData);
    setLineMappings(mappingData);

   
  } catch (err) {
    console.error("Failed to fetch data", err);
  }

  setLoading(false);
};

 const handleLineChange = async (e: any) => {

  const lineId = e.target.value;

  setLoading(true);

  try {

    const data = await getLineMappings(lineId || undefined);

    setLineMappings(data);

  } catch (error) {
    console.error("Error filtering line mappings:", error);
  }

  setLoading(false);
};


  const getLineName = (id:number) =>
    lines.find((l) => l.id === id)?.lineName || "-";

  const getVariantName = (id:number) =>
  variants.find((v) => v.id === id)?.description || "-";

  function StatusBadge({ active }: { active: boolean }) {

    const tone = active
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : "bg-rose-50 text-rose-700 ring-rose-100";

    const dot = active ? "bg-emerald-500" : "bg-rose-500";

    const Icon = active ? CheckCircle2 : CircleDashed;

    return (
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone}`}>
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <Icon className="h-4 w-4" />
        {active ? "Active" : "Inactive"}
      </span>
    );
  }

  const handleEdit = (row:any) => {
    navigate(`/masters/linemapping/edit/${row.id}`);
  };

  return (

    <div className="space-y-6">

      <PageHero
        eyebrow="Masters"
        title="Line Mapping"
        description="Manage line to previous line and variant mapping configuration."
        icon={GitBranch}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Live catalogue
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200">

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            Line Mapping Actions
          </p>

          <p className="text-sm text-slate-600">
            Create, reload, or browse line mapping records.
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* LINE DROPDOWN */}

        <select
  className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
  value={selectedLine}
  onChange={(e) => {
    setSelectedLine(e.target.value);   // 👈 store selected line
    handleLineChange(e);               // 👈 keep your filter logic
  }}
>
  <option value="">All Lines</option>

  {lines.map((line) => (
    <option key={line.id} value={line.id}>
      {line.lineName}
    </option>
  ))}
</select>

          <button
 onClick={() =>
 {
  console.log("Selected line:", selectedLine);
    const selectedMapping = lineMappings.find(
  (m) => m.lineId === Number(selectedLine)
);

navigate("/masters/linemapping/add", {
  state: selectedMapping
});
  }  }       
      className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
   >
            <GitBranch className="h-4 w-4" /> Add Line Mapping
          </button>

          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-4 w-4" /> Auto refresh on demand
          </div>

        </div>

      </div>


      {/* TABLE */}

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

        {loading ? (
          <p className="text-sm text-slate-600 p-4">Loading...</p>
        ) : lineMappings.length === 0 ? (
          <p className="text-sm text-slate-600 p-4">No line mappings found.</p>
        ) : (

          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase text-slate-600">

              <tr>
                <th className="px-4 py-3 font-semibold">Id</th>
                <th className="px-4 py-3 font-semibold">Line</th>
                <th className="px-4 py-3 font-semibold">Previous Line</th>
                <th className="px-4 py-3 font-semibold">Variant</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {lineMappings.map((lm) => (

                <tr key={lm.id} className="hover:bg-slate-50">

                  <td className="px-4 py-3 font-semibold">{lm.id}</td>

                  <td className="px-4 py-3">
                    {getLineName(lm.lineId)}
                  </td>

                  <td className="px-4 py-3">
                    {getLineName(lm.previousLineId)}
                  </td>

                  <td className="px-4 py-3">
                    {getVariantName(lm.variantId)}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge active={lm.isActive} />
                  </td>

                  <td className="px-4 py-3">

                    <button
                      onClick={() => handleEdit(lm)}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}