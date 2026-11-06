import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import customAlert from "../../components/Alerts/customAlert";
import CustomDropdown from "../../components/CustomDropdown";
import { getRcaRecords } from "./RcaAction";

const STORAGE_KEY = "mes_rca_records";

const rootCauses = [
    "Bearing failure",
    "Motor failure",
    "Electrical fault",
    "Lubrication failure",
    "Mechanical wear",
    "Operator error",
    "Other",
];

export default function RcaForm() {
    const navigate = useNavigate();

    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        rootCause: "",
        correctiveAction: "",
        remarks: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        const missingFields = [];

        if (!form.rootCause) {
            missingFields.push("Root Cause");
        }

        if (!form.correctiveAction.trim()) {
            missingFields.push("Corrective Action");
        }

        if (missingFields.length > 0) {
            customAlert(
                `Please fill in: ${missingFields.join(", ")}`,
                "error"
            );
            return;
        }

        try {
            setSubmitting(true);

            const newRecord = {
                id: Date.now(),
                rootCause: form.rootCause,
                correctiveAction: form.correctiveAction.trim(),
                remarks: form.remarks.trim(),
            };

            const existingRecords = getRcaRecords();

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify([newRecord, ...existingRecords])
            );

            customAlert("RCA added successfully!", "ok");

            navigate("/masters/rcaandaction");
        } catch (error) {
            console.error("Error adding RCA:", error);
            customAlert("Failed to add RCA!", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const rootCauseOptions = rootCauses.map((cause) => ({
        value: cause,
        label: cause,
    }));

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
                            Add RCA & Corrective Action
                        </h1>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/masters/rcaandaction")
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
                    >
                        Back to RCA
                    </button>
                </div>
            </div>

            {/* RCA Form */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSave();
                }}
                className="mt-6 overflow-visible rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/90 dark:ring-slate-700"
            >
                <h2 className="mb-6 text-lg font-bold text-slate-800 dark:text-white">
                    Failure Analysis
                </h2>

                <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">

                    {/* Root Cause */}
                    <div className="col-span-1 lg:col-span-3">
                        <label className="mb-1 block text-sm font-semibold">
                            Root Cause*
                        </label>

                        <div className="mt-2">
                            <CustomDropdown
                                placeholder="Select Root Cause"
                                options={rootCauseOptions}
                                value={form.rootCause}
                                onChange={(val) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        rootCause: val,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    {/* Corrective Action */}
                    <div className="col-span-1 lg:col-span-3">
                        <label className="mb-1 block text-sm font-semibold">
                            Corrective Action*
                        </label>

                        <div className="mt-2">
                            <textarea
                                name="correctiveAction"
                                value={form.correctiveAction}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[#1c75bc] focus:ring-1 focus:ring-[#1c75bc] dark:border-slate-700 dark:bg-slate-800"
                                placeholder="Enter corrective action..."
                            />
                        </div>
                    </div>

                    {/* Remark */}
                    <div className="col-span-1 lg:col-span-3">
                        <label className="mb-1 block text-sm font-semibold">
                            Remark
                        </label>

                        <div className="mt-2">
                            <textarea
                                name="remarks"
                                value={form.remarks}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-[#1c75bc] focus:ring-1 focus:ring-[#1c75bc] dark:border-slate-700 dark:bg-slate-800"
                                placeholder="Enter remark..."
                            />
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="mt-8 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/masters/rcaandaction")
                        }
                        disabled={submitting}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
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

                        {submitting ? "Saving..." : "Save RCA"}
                    </button>
                </div>
            </form>
        </div>
    );
}