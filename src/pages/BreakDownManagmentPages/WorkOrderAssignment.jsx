import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import DataTable from "../../components/DataTable";

import {
    ClipboardList,
    Plus,
    Search,
    Clock,
    Users,
    CheckCircle2,
} from "lucide-react";

// ==========================================
// DUMMY DATA
// ==========================================

const initialWorkOrders = [
    {
        id: 1,
        workOrderNo: "WO-00128",
        breakdownId: "BD-1001",
        assetName: "CNC Machine 01",
        description: "Replace spindle motor and inspect connections.",
        assignedTo: "Suresh Kumar",
        team: "Maintenance Team A",
        startDate: "2026-11-04T09:00",
        expectedCompletion: "2026-11-04T15:00",
        priority: "Critical",
        status: "In Progress",
    },
    {
        id: 2,
        workOrderNo: "WO-00127",
        breakdownId: "BD-1002",
        assetName: "Conveyor 02",
        description: "Adjust conveyor belt alignment.",
        assignedTo: "Ramesh Kumar",
        team: "Maintenance Team B",
        startDate: "2026-11-04T10:00",
        expectedCompletion: "2026-11-04T17:00",
        priority: "High",
        status: "Open",
    },
    {
        id: 3,
        workOrderNo: "WO-00126",
        breakdownId: "BD-1003",
        assetName: "Packaging Machine",
        description: "Inspect and replace faulty sensor.",
        assignedTo: "Rajesh Sharma",
        team: "Maintenance Team A",
        startDate: "2026-11-03T08:00",
        expectedCompletion: "2026-11-03T14:00",
        priority: "Medium",
        status: "Completed",
    },
    {
        id: 4,
        workOrderNo: "WO-00125",
        breakdownId: "BD-1004",
        assetName: "CNC Machine 03",
        description: "Check hydraulic pressure and repair leakage.",
        assignedTo: "Vijay Kumar",
        team: "Maintenance Team C",
        startDate: "2026-11-03T11:00",
        expectedCompletion: "2026-11-04T12:00",
        priority: "High",
        status: "In Progress",
    },
    {
        id: 5,
        workOrderNo: "WO-00124",
        breakdownId: "BD-1001",
        assetName: "CNC Machine 01",
        description: "Perform spindle lubrication and inspection.",
        assignedTo: "Suresh Kumar",
        team: "Maintenance Team A",
        startDate: "2026-11-02T09:00",
        expectedCompletion: "2026-11-02T13:00",
        priority: "Low",
        status: "Cancelled",
    },
];

// ==========================================
// DATE FORMAT
// ==========================================

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
        hour12: false,
    });
};

// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({ status }) {
    const styles = {
        Open: "bg-indigo-50 text-indigo-700 ring-indigo-100 dark:bg-indigo-400/15 dark:text-indigo-300 dark:ring-indigo-400/30",
        "In Progress":
            "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-400/30",
        Completed:
            "bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-400/15 dark:text-blue-300 dark:ring-blue-400/30",
        Cancelled:
            "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-400/15 dark:text-rose-300 dark:ring-rose-400/30",
    };

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[status] || "bg-slate-50 text-slate-700 ring-slate-100"
                }`}
        >
            {status}
        </span>
    );
}

// ==========================================
// KPI CARD
// ==========================================

function MetricCard({ title, value, icon: Icon, color }) {
    return (
        <div
            className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-md transition-all duration-300 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"
            style={{
                boxShadow: `0 4px 14px ${color}20`,
            }}
        >
            <div
                className="absolute left-0 top-0 h-[3px] w-full"
                style={{ backgroundColor: color }}
            />

            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1 pr-2">
                    <p
                        className="truncate text-[11px] font-bold uppercase tracking-wider"
                        style={{ color }}
                    >
                        {title}
                    </p>

                    <h2 className="mt-1.5 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                        {value}
                    </h2>
                </div>

                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
                    style={{
                        backgroundColor: `${color}10`,
                        borderColor: `${color}25`,
                    }}
                >
                    <Icon
                        className="h-5 w-5"
                        style={{ color }}
                    />
                </div>
            </div>
        </div>
    );
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function WorkOrderAssignment() {
    const navigate = useNavigate();

    const [data, setData] = useState(initialWorkOrders);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("");

    // ======================================
    // FILTER DATA
    // ======================================

    const filteredData = useMemo(() => {
        return data.filter((row) => {
            const search = searchTerm.toLowerCase();

            const matchesSearch =
                row.workOrderNo.toLowerCase().includes(search) ||
                row.assignedTo.toLowerCase().includes(search);

            const matchesStatus =
                !selectedStatus || row.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [data, searchTerm, selectedStatus]);

    // ======================================
    // KPI COUNTS
    // ======================================

    const totalOrders = data.length;

    const openOrders = data.filter(
        (item) => item.status === "Open"
    ).length;

    const inProgressOrders = data.filter(
        (item) => item.status === "In Progress"
    ).length;

    const completedOrders = data.filter(
        (item) => item.status === "Completed"
    ).length;

    // ======================================
    // TABLE COLUMNS
    // ONLY FOUR COLUMNS
    // ======================================

    const columns = [
        {
            header: "ASSIGNED TO",
            render: (row) => (
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {row.assignedTo || "-"}
                </span>
            ),
        },
        {
            header: "WORK ORDER",
            render: (row) => (
                <span className="font-semibold text-[#1c75bc]">
                    {row.workOrderNo}
                </span>
            ),
        },
        {
            header: "START DATE & TIME",
            render: (row) => formatDateTime(row.startDate),
        },
        {
            header: "EXPECTED COMPLETION",
            render: (row) => formatDateTime(row.expectedCompletion),
        },
    ];

    // ======================================
    // RENDER
    // ======================================

    return (
        <div className="relative space-y-6">

            {/* PAGE HEADER */}
            <PageHero
                eyebrow="Maintenance"
                title="Work Order Assignment"
                description="Create, assign and manage equipment maintenance work orders."
                icon={ClipboardList}
            />

            {/* KPI CARDS */}
            {/* <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    title="Total Work Orders"
                    value={totalOrders}
                    icon={ClipboardList}
                    color="#3B82F6"
                />

                <MetricCard
                    title="Open Orders"
                    value={openOrders}
                    icon={Clock}
                    color="#F59E0B"
                />

                <MetricCard
                    title="In Progress"
                    value={inProgressOrders}
                    icon={Users}
                    color="#EF4444"
                />

                <MetricCard
                    title="Completed Assignments"
                    value={completedOrders}
                    icon={CheckCircle2}
                    color="#8B5CF6"
                />
            </div> */}

            {/* FILTER AND ACTIONS */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">

                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
                        Work Order Records
                    </p>

                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Search and filter work order assignments.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">

                    {/* SEARCH */}
                    <div className="relative">
                        <Search
                            size={15}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(e.target.value)
                            }
                            placeholder="Search work orders..."
                            className="w-56 rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 outline-none transition-colors focus:border-[#1c75bc] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        />
                    </div>



                    {/* ADD BUTTON */}
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/master/workorderandassignment/add")
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#155e96]"
                    >
                        <Plus size={16} />
                        Add Work Order Assignment
                    </button>
                </div>
            </div>

            {/* DATA TABLE */}
            <div className="mt-6">
                <DataTable
                    columns={columns}
                    data={filteredData}
                    loading={false}
                />
            </div>
        </div>
    );
}