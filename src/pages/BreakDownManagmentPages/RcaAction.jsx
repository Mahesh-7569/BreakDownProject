import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import DataTable from "../../components/DataTable";
import { ClipboardList, Plus, Search } from "lucide-react";

const STORAGE_KEY = "mes_rca_records";

const initialRcaData = [
    {
        id: 1,
        rootCause: "Bearing failure",
        correctiveAction: "Replace bearing and check lubrication system.",
        remarks: "Follow PM schedule and check lubrication level regularly.",
    },
    {
        id: 2,
        rootCause: "Motor failure",
        correctiveAction: "Replace damaged motor and verify connections.",
        remarks: "Monitor motor temperature regularly.",
    },
    {
        id: 3,
        rootCause: "Electrical fault",
        correctiveAction: "Replace damaged wiring and inspect control panel.",
        remarks: "Perform periodic electrical inspections.",
    },
];

export const getRcaRecords = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored !== null) {
            const parsed = JSON.parse(stored);

            return Array.isArray(parsed)
                ? parsed.map((row) => ({
                    id: row.id,
                    rootCause: row.rootCause || "",
                    correctiveAction: row.correctiveAction || "",
                    remarks: row.remarks || "",
                }))
                : initialRcaData;
        }

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(initialRcaData)
        );
    } catch (error) {
        console.error("Error loading RCA records:", error);
    }

    return initialRcaData;
};

export default function RcaAction() {
    const navigate = useNavigate();

    const [data] = useState(getRcaRecords);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = useMemo(() => {
        const search = searchTerm.toLowerCase().trim();

        if (!search) return data;

        return data.filter((row) =>
            [
                row.rootCause,
                row.correctiveAction,
                row.remarks,
            ]
                .join(" ")
                .toLowerCase()
                .includes(search)
        );
    }, [data, searchTerm]);

    const columns = [
        {
            header: "ROOT CAUSE",
            render: (row) => (
                <span className="font-medium text-slate-700 dark:text-slate-200">
                    {row.rootCause || "-"}
                </span>
            ),
        },
        {
            header: "CORRECTIVE ACTION",
            render: (row) => (
                <span className="text-slate-600 dark:text-slate-300">
                    {row.correctiveAction || "-"}
                </span>
            ),
        },
        {
            header: "REMARK",
            render: (row) => (
                <span className="text-slate-500 dark:text-slate-400">
                    {row.remarks || "-"}
                </span>
            ),
        },
    ];

    return (
        <div className="relative space-y-6">
            <PageHero
                eyebrow="Maintenance"
                title="RCA & Corrective Action"
                description="View and manage root cause analysis and corrective action records."
                icon={ClipboardList}
            />

            {/* Search and Add */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                        RCA Records
                    </p>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Search and manage RCA records.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search
                            size={15}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search RCA records..."
                            className="w-56 rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition-colors focus:border-[#1c75bc] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                    </div>

                    {/* Add RCA */}
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/masters/rcaandaction/add")
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#155e96]"
                    >
                        <Plus size={16} />
                        Add RCA
                    </button>
                </div>
            </div>

            {/* RCA Table */}
            <DataTable
                columns={columns}
                data={filteredData}
                loading={false}
            />
        </div>
    );
}