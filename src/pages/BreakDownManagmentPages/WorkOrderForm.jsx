import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import customAlert from "../../components/Alerts/customAlert";

const technicians = [
    "Suresh Kumar",
    "Ramesh Kumar",
    "Rajesh Sharma",
    "Vijay Kumar",
];

const workOrders = [
    "WO-00128",
    "WO-00127",
    "WO-00126",
    "WO-00125",
    "WO-00124",
];

export default function WorkOrderForm() {
    const navigate = useNavigate();

    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        assignedTo: "",
        workOrder: "",
        startDateTime: "",
        expectedCompletion: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (
            !form.assignedTo ||
            !form.workOrder ||
            !form.startDateTime ||
            !form.expectedCompletion
        ) {
            customAlert("Please fill in all required fields!", "error");
            return;
        }

        if (
            new Date(form.expectedCompletion) <=
            new Date(form.startDateTime)
        ) {
            customAlert(
                "Expected completion must be after the start date!",
                "error"
            );
            return;
        }

        try {
            setSubmitting(true);

            // Dummy submission. Connect your API here.
            console.log("Work Order Assignment:", form);

            customAlert(
                "Work order assignment saved successfully!",
                "ok"
            );

            navigate("/master/workorderandassignment");
        } catch (error) {
            console.error("Error creating work order:", error);

            customAlert(
                "Failed to create work order assignment!",
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#1c75bc] focus:ring-1 focus:ring-[#1c75bc] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

    const labelClass =
        "mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300";

    return (
        <div className="container py-6 text-slate-900 dark:text-slate-100">

            {/* Header */}
            <div className="mb-6 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-slate-50/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 dark:ring-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            Work Orders
                        </p>

                        <h1 className="mt-1 text-2xl font-semibold">
                            Add Work Order Assignment
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Assign a work order to a technician and schedule
                            the maintenance work.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/master/workorderandassignment")
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
                    >
                        Back to Work Orders
                    </button>
                </div>
            </div>

            {/* Form */}
            <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-6 overflow-hidden rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-200/80 dark:bg-slate-900/90 dark:ring-slate-700"
            >
                <div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-700">
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">
                        Work Order Assignment Details
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        Fields marked with * are mandatory.
                    </p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">

                    {/* Assigned To */}
                    <div>
                        <label className={labelClass}>
                            Assigned To
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <select
                            name="assignedTo"
                            value={form.assignedTo}
                            onChange={handleInputChange}
                            className={inputClass}
                        >
                            <option value="">Select Technician</option>

                            {technicians.map((technician) => (
                                <option
                                    key={technician}
                                    value={technician}
                                >
                                    {technician}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Work Order */}
                    <div>
                        <label className={labelClass}>
                            Work Order
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <select
                            name="workOrder"
                            value={form.workOrder}
                            onChange={handleInputChange}
                            className={inputClass}
                        >
                            <option value="">Select Work Order</option>

                            {workOrders.map((order) => (
                                <option key={order} value={order}>
                                    {order}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Start Date & Time */}
                    <div>
                        <label className={labelClass}>
                            Start Date & Time
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                            type="datetime-local"
                            name="startDateTime"
                            value={form.startDateTime}
                            onChange={handleInputChange}
                            className={inputClass}
                        />
                    </div>

                    {/* Expected Completion */}
                    <div>
                        <label className={labelClass}>
                            Expected Completion
                            <span className="ml-1 text-red-500">*</span>
                        </label>

                        <input
                            type="datetime-local"
                            name="expectedCompletion"
                            value={form.expectedCompletion}
                            onChange={handleInputChange}
                            min={form.startDateTime || undefined}
                            className={inputClass}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={() =>
                            navigate("/master/workorderandassignment")
                        }
                        disabled={submitting}
                        className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={submitting}
                        onClick={handleSave}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#16629b] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="h-4 w-4" />
                        )}

                        {submitting ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
}