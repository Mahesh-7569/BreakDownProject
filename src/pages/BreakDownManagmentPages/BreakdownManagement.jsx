import { useMemo, useState } from "react";
import PageHero from "../../components/PageHero";

import {
    AlertCircle,
    Clock,
    CheckCircle2,
    ChartColumnIncreasing,
    Wrench,
    CalendarDays,
    TrendingUp,
} from "lucide-react";

// ==========================================
// DUMMY DATA
// ==========================================

const breakdownData = [
    { day: "21 Oct", count: 7 },
    { day: "22 Oct", count: 12 },
    { day: "23 Oct", count: 7 },
    { day: "24 Oct", count: 9 },
    { day: "25 Oct", count: 14 },
    { day: "26 Oct", count: 9 },
    { day: "27 Oct", count: 14 },
];

const equipmentData = [
    { name: "CNC Machine", percentage: 35, color: "#1c75bc" },
    { name: "Conveyor", percentage: 20, color: "#60a5fa" },
    { name: "Packaging", percentage: 15, color: "#f59e0b" },
    { name: "HVAC", percentage: 10, color: "#ef4444" },
    { name: "Others", percentage: 20, color: "#8b5cf6" },
];

// ==========================================
// KPI CARD COMPONENT
// ==========================================

function MetricCard({
    title,
    value,
    icon: Icon,
    color,
    description,
}) {
    return (
        <div
            className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-md transition-all duration-300 hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900"
            style={{
                boxShadow: `0 4px 14px ${color}20`,
            }}
        >
            {/* Colored Top Border */}
            <div
                className="absolute left-0 top-0 h-[3px] w-full"
                style={{ backgroundColor: color }}
            />

            <div className="flex items-start justify-between gap-3">
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

                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        {description}
                    </p>
                </div>

                {/* Icon */}
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
// BREAKDOWN TREND CHART
// ==========================================

function BreakdownTrendChart() {
    const maxValue = 20;

    return (
        <div className="mt-6">
            <div className="relative flex h-[250px]">

                {/* Y AXIS */}
                <div
                    className="flex flex-col justify-between
            pb-7 pr-3 text-xs text-slate-500
            dark:text-slate-400"
                >
                    {[20, 15, 10, 5, 0].map((value) => (
                        <span key={value}>{value}</span>
                    ))}
                </div>

                {/* CHART AREA */}
                <div
                    className="relative flex flex-1 items-end
            justify-around border-b border-l
            border-slate-200 pb-0
            dark:border-slate-700"
                >

                    {/* GRID LINES */}
                    {[0, 5, 10, 15, 20].map((value) => (
                        <div
                            key={value}
                            className="absolute left-0 right-0
                border-t border-dashed
                border-slate-200 dark:border-slate-700"
                            style={{
                                bottom: `${(value / maxValue) * 100}%`,
                            }}
                        />
                    ))}

                    {/* BARS */}
                    {breakdownData.map((item) => (
                        <div
                            key={item.day}
                            className="relative z-10 flex h-full
                flex-1 flex-col items-center
                justify-end px-1"
                        >
                            <span
                                className="mb-2 text-xs font-semibold
                  text-slate-600 dark:text-slate-300"
                            >
                                {item.count}
                            </span>

                            <div
                                className="w-7 max-w-full rounded-t-md
                  bg-[#1c75bc] transition-all
                  duration-300 hover:bg-[#155e96]"
                                style={{
                                    height: `${(item.count / maxValue) * 100}%`,
                                    minHeight: "3px",
                                }}
                            />

                            <span
                                className="absolute -bottom-7
                  whitespace-nowrap text-[11px]
                  font-medium text-slate-500
                  dark:text-slate-400"
                            >
                                {item.day}
                            </span>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}

// ==========================================
// EQUIPMENT DONUT CHART
// ==========================================

function EquipmentDonutChart() {
    const gradient = useMemo(() => {
        let current = 0;

        return equipmentData
            .map((item) => {
                const start = current;
                current += item.percentage;

                return `${item.color} ${start}% ${current}%`;
            })
            .join(", ");
    }, []);

    return (
        <div
            className="mt-6 flex flex-col items-center
        gap-7 md:flex-row md:justify-around"
        >

            {/* DONUT CHART */}
            <div
                className="relative flex h-56 w-56 shrink-0
          items-center justify-center rounded-full"
                style={{
                    background: `conic-gradient(${gradient})`,
                }}
            >

                {/* INNER CIRCLE */}
                <div
                    className="flex h-32 w-32 flex-col
            items-center justify-center rounded-full
            bg-white dark:bg-slate-900"
                >
                    <span
                        className="text-3xl font-bold
              text-slate-800 dark:text-white"
                    >
                        45
                    </span>

                    <span
                        className="mt-1 text-xs text-slate-500
              dark:text-slate-400"
                    >
                        Total
                    </span>
                </div>
            </div>

            {/* LEGEND */}
            <div className="w-full space-y-4">

                {equipmentData.map((item) => (
                    <div
                        key={item.name}
                        className="flex items-center
              justify-between gap-3"
                    >
                        <div className="flex items-center gap-3">

                            <span
                                className="h-3.5 w-3.5 rounded-full"
                                style={{
                                    backgroundColor: item.color,
                                }}
                            />

                            <span
                                className="text-sm font-medium
                  text-slate-600 dark:text-slate-300"
                            >
                                {item.name}
                            </span>

                        </div>

                        <span
                            className="text-sm font-bold
                text-slate-700 dark:text-white"
                        >
                            {item.percentage}%
                        </span>

                    </div>
                ))}

            </div>
        </div>
    );
}

// ==========================================
// MAIN BREAKDOWN MANAGEMENT PAGE
// ==========================================

export default function BreakdownManagement() {

    const [selectedDate, setSelectedDate] =
        useState("2026-10-27");

    return (
        <div className="relative space-y-6">

            {/* PAGE HEADER */}
            <PageHero
                eyebrow="Maintenance"
                title="Breakdown Management Dashboard"
                description="Monitor equipment breakdowns and track maintenance performance."
                icon={Wrench}
            />

            {/* DATE FILTER */}
            <div
                className="flex flex-wrap items-center
          justify-between gap-4 rounded-2xl
          border border-slate-200 bg-white p-4
          shadow-sm dark:border-slate-800
          dark:bg-slate-900"
            >

                <div>
                    <p
                        className="text-sm font-semibold
              text-slate-800 dark:text-white"
                    >
                        Breakdown Overview
                    </p>

                    <p
                        className="mt-1 text-xs text-slate-500
              dark:text-slate-400"
                    >
                        Summary of equipment breakdown activities.
                    </p>
                </div>

                <div className="flex items-center gap-2">

                    <CalendarDays
                        size={16}
                        className="text-[#1c75bc]"
                    />

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) =>
                            setSelectedDate(e.target.value)
                        }
                        className="rounded-xl border
              border-slate-300 bg-white
              px-3 py-2 text-xs font-medium
              text-slate-700 outline-none
              transition-colors
              focus:border-[#1c75bc]
              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-200"
                    />

                </div>
            </div>

            {/* KPI CARDS */}

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <MetricCard
                    title="Open Breakdowns"
                    value="12"
                    icon={AlertCircle}
                    color="#EF4444"
                    description="Currently awaiting action"
                />

                <MetricCard
                    title="In Progress"
                    value="8"
                    icon={Clock}
                    color="#F59E0B"
                    description="Under maintenance"
                />

                <MetricCard
                    title="Resolved Today"
                    value="25"
                    icon={CheckCircle2}
                    color="#10B981"
                    description="Successfully resolved"
                />

                <MetricCard
                    title="Total This Month"
                    value="45"
                    icon={ChartColumnIncreasing}
                    color="#8B5CF6"
                    description="Monthly breakdown count"
                />

            </div>


            {/* CHARTS SECTION */}
            <div
                className="grid grid-cols-1 gap-5
          xl:grid-cols-2"
            >

                {/* BREAKDOWN TREND */}
                <div
                    className="rounded-2xl border border-slate-200
            bg-white p-5 shadow-sm
            dark:border-slate-800 dark:bg-slate-900"
                >

                    <div className="flex items-center justify-between">

                        <div>
                            <h3
                                className="text-base font-bold
                  text-slate-800 dark:text-white"
                            >
                                Breakdown Trend (Last 7 Days)
                            </h3>

                            <p
                                className="mt-1 text-xs text-slate-500
                  dark:text-slate-400"
                            >
                                Daily equipment breakdown count
                            </p>
                        </div>

                        <TrendingUp
                            size={20}
                            className="text-[#1c75bc]"
                        />

                    </div>

                    <BreakdownTrendChart />

                </div>

                {/* EQUIPMENT TYPE DISTRIBUTION */}
                <div
                    className="rounded-2xl border border-slate-200
            bg-white p-5 shadow-sm
            dark:border-slate-800 dark:bg-slate-900"
                >

                    <div>
                        <h3
                            className="text-base font-bold
                text-slate-800 dark:text-white"
                        >
                            Breakdown by Equipment Type
                        </h3>

                        <p
                            className="mt-1 text-xs text-slate-500
                dark:text-slate-400"
                        >
                            Equipment-wise breakdown distribution
                        </p>
                    </div>

                    <EquipmentDonutChart />

                </div>

            </div>

        </div>
    );
}