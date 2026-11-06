import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import {
  Cpu,
  CheckCircle2,
  CircleDashed,
  Pencil,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getPlcMasters } from "../../services/plcMasterService";

interface PlcMaster {
  id: number;
  plcName: string;
  plcType: number;
  ipAddress: string;
  connectionString: string;
  heartBeatNode: string;
  isActive: boolean;
}

export default function PlcMaster() {
  const [plcMasters, setPlcMasters] = useState<PlcMaster[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const data = await getPlcMasters();
      setPlcMasters(data);

      setLoading(false);
    };

    fetchData();
  }, []);

  function StatusBadge({ active }: { active: boolean }) {
    const tone = active
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : "bg-rose-50 text-rose-700 ring-rose-100";

    const dot = active ? "bg-emerald-500" : "bg-rose-500";

    const Icon = active ? CheckCircle2 : CircleDashed;

    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${tone}`}
      >
        <span className={`h-2 w-2 rounded-full ${dot}`} />

        <Icon className="h-4 w-4" />

        {active ? "Active" : "Inactive"}
      </span>
    );
  }

  const getPlcTypeName = (type: number) => {
    switch (type) {
      case 1:
        return "OPCUA";

      case 2:
        return "S7LIB";

      default:
        return "-";
    }
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Masters"
        title="PLC"
        description="Manage PLC configuration and connectivity details."
        icon={Cpu}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            Live catalogue
          </div>
        }
      />

      {/* ACTION BAR */}
      <div className="dark:bg-slate-900 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200">
        <div>
          <p className="dark:text-slate-300 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
            PLC Master Actions
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create, reload, or browse PLC records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/masters/plcmaster/add")}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#155e96]"
          >
            <Cpu className="h-4 w-4" />
            Add PLC
          </button>

          <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            <CheckCircle2 className="h-4 w-4" />
            Auto refresh on demand
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white/95 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950/70 dark:ring-slate-800/80">
        {loading ? (
          <p className="p-4 text-sm">Loading PLC data...</p>
        ) : plcMasters.length === 0 ? (
          <p className="p-4 text-sm">No records found.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-900/80 dark:text-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold">ID</th>

                <th className="px-4 py-3 font-semibold">
                  PLC Name
                </th>

                <th className="px-4 py-3 font-semibold">
                  PLC Type
                </th>

                <th className="px-4 py-3 font-semibold">
                  IP Address
                </th>

                <th className="px-4 py-3 font-semibold">
                  Connection String
                </th>

                <th className="px-4 py-3 font-semibold">
                  Heart Beat Node
                </th>

                <th className="px-4 py-3 font-semibold">
                  Status
                </th>

                <th className="px-4 py-3 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white/90 dark:divide-slate-800 dark:bg-slate-900/70">
              {plcMasters.map((row) => (
                <tr
                  key={row.id}
                  className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/70"
                >
                  <td className="px-4 py-3 font-semibold">
                    {row.id}
                  </td>

                  <td className="px-4 py-3">
                    {row.plcName}
                  </td>

                  <td className="px-4 py-3">
                    {getPlcTypeName(row.plcType)}
                  </td>

                  <td className="px-4 py-3">
                    {row.ipAddress}
                  </td>

                  <td className="max-w-[220px] truncate px-4 py-3">
                    {row.connectionString}
                  </td>

                  <td className="px-4 py-3">
                    {row.heartBeatNode}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge active={row.isActive} />
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        navigate(
                          `/masters/plcmaster/edit/${row.id}`
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 hover:bg-blue-100"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
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