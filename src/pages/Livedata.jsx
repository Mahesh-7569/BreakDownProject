import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../components/PageHero";
import { Activity, ArrowLeft } from "lucide-react";
import * as signalR from "@microsoft/signalr";
import { getLinesForLiveData } from "../services/lineService";

function LedIndicator({ active }) {
    return (
        <span
            className={`inline-block w-3 h-3 rounded-full ${
                active ? "bg-green-500 shadow-[0_0_6px_2px_rgba(34,197,94,0.7)]" : "bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.7)]"
            }`}
        />
    );
}

function LineWidget({ line }) {
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md p-5 flex flex-col gap-4 w-[410px]">
            {/* Line Name */}
            <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
                <span className="text-base font-bold text-slate-800 dark:text-slate-100">{line.lineName}</span>
            </div>

            {/* 2-column grid for fields */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 items-center">
                {/* PLC Connection */}
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">PLC Connection</span>
                <div className="flex items-center gap-2">
                    <LedIndicator active={!!line.plcStatus} />
                    <span className={`text-xs font-semibold ${line.plcStatus ? "text-green-500" : "text-red-500"}`}>
                        {line.plcStatus ? "Connected" : "Disconnected"}
                    </span>
                </div>

                {/* PLC-MES Bypass */}
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">PLC-MES Bypass</span>
                <div className="flex items-center gap-2">
                    <LedIndicator active={!!line.isBypass} />
                    <span className={`text-xs font-semibold ${line.isBypass ? "text-green-500" : "text-red-500"}`}>
                        {line.isBypass ? "Bypass Off" : "Bypass On"}
                    </span>
                </div>

                {/* Report Folder */}
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Report Folder</span>
                <div className="flex items-center gap-2">
                    <LedIndicator active={!!line.folderStatus} />
                    <span className={`text-xs font-semibold ${line.folderStatus ? "text-green-500" : "text-red-500"}`}>
                        {line.folderStatus ? "Ready" : "Disconnected"}
                    </span>
                </div>

                {/* Validate Part No */}
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Validate Part No</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono tracking-wide truncate">{line.validatePartNo || "-"}</span>
           
                {/* Validation status */}
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Validation Status</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono tracking-wide truncate">{line.validationStatus || "-"}</span>

                {/* Request Time */}
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Request Time</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono tracking-wide whitespace-nowrap">{line.requestTime || "-"}</span>

                {/* Produced Part No */}
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Produced Part No</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono tracking-wide truncate">{line.producedPartNo || "-"}</span>

                {/* Part Status */}
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Part Status</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono tracking-wide truncate">{line.partStatus || "-"}</span>

                {/* Process Time */}
                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Process Time</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 font-mono tracking-wide whitespace-nowrap">{line.processTime || "-"}</span>
            </div>
        </div>
    );
}
  
export default function Livedata() {
    const navigate = useNavigate();
    const [lines, setLines] = useState([]);
    const [loading, setLoading] = useState(true);

    const normalizeIncomingItems = (message) => {
        console.log("Received SignalR message:", message);
        const parsedMessage = typeof message === "string" ? JSON.parse(message) : message;
        if (Array.isArray(parsedMessage)) return parsedMessage;
        if (Array.isArray(parsedMessage?.data)) return parsedMessage.data;
        return parsedMessage ? [parsedMessage] : [];
    };

    const updateLinesFromItems = (incomingItems, mapUpdates) => {
        if (!Array.isArray(incomingItems) || incomingItems.length === 0) return;

        setLines((prevLines) => {
            let hasMatch = false;

            const nextLines = prevLines.map((lineItem) => {
                const match = incomingItems.find((item) => {
                    const isLineMatch = Number(item?.lineId) === Number(lineItem.id);
                    const hasStationInPayload = item?.stationId !== undefined && item?.stationId !== null;
                    const isStationMatch = Number(item?.stationId) === Number(lineItem.stationId ?? 0);
                    return isLineMatch && (!hasStationInPayload || isStationMatch);
                });

                if (!match) return lineItem;

                hasMatch = true;
                const updates = mapUpdates(match);
                return { ...lineItem, ...updates };
            });

            return hasMatch ? nextLines : prevLines;
        });
    };

    // Fetch lines on startup
    useEffect(() => {
        getLinesForLiveData()
            .then((data) => {
                const safeData = Array.isArray(data) ? data : [];
                setLines(safeData);
            })
            .finally(() => setLoading(false));
    }, []);

    // SignalR connection
    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7264/messagehub", {
                transport: signalR.HttpTransportType.WebSockets,
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build();

        connection
            .start()
            .then(() => console.log("SignalR connected"))
            .catch((err) => console.error("SignalR connection error: ", err));

        connection.on("requestUpdateToAll", (message) => {
            try {
                const incomingItems = normalizeIncomingItems(message);
                updateLinesFromItems(incomingItems, (item) => ({
                    validatePartNo: item?.partId,
                    validationStatus: item?.partStatus,
                    requestTime: item?.requestTime,
                }));
            } catch (err) {
                console.error("Error handling SignalR message:", err);
            }
        });

        connection.on("folderUpdateToAll", (message) => {
            try {
                const incomingItems = normalizeIncomingItems(message);
                updateLinesFromItems(incomingItems, (item) => ({
                    producedPartNo: item?.partId,
                    partStatus: item?.partStatus,
                    processTime: item?.requestTime,
                }));
            } catch (err) {
                console.error("Error handling SignalR message:", err);
            }
        });

        connection.on("plcUpdateToAll", (message) => {
            try {
                const incomingItems = normalizeIncomingItems(message);
                updateLinesFromItems(incomingItems, (item) => ({
                    plcStatus: item?.plcStatus == 1 ? true : item?.plcStatus == 0 ? false : undefined ,
                }));
            } catch (err) {
                console.error("Error handling SignalR message:", err);
            }
        });

        connection.on("bypassUpdateToAll", (message) => {
            try {
                const incomingItems = normalizeIncomingItems(message);
                updateLinesFromItems(incomingItems, (item) => ({
                    isBypass: item?.isBypass == 1 ? true : item?.isBypass == 0 ? false : undefined,
                }));
            } catch (err) {
                console.error("Error handling SignalR message:", err);
            }
        });

        connection.on("folderStatusUpdateToAll", (message) => {
            try {
                const incomingItems = normalizeIncomingItems(message);
                updateLinesFromItems(incomingItems, (item) => ({
                    folderStatus: item?.folderStatus == 1 ? true : item?.folderStatus == 0 ? false : undefined,
                }));
            } catch (err) {
                console.error("Error handling SignalR message:", err);
            }
        });

        return () => {
            connection.stop();
        };
    }, []);

    return (
        <div>
            <PageHero
                title="Live Data"
                description="Monitor real-time production data for your selected line"
                icon={Activity}
                pill={
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-md bg-slate-900 hover:bg-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </button>
                }
            />

            <div className="p-6">
                {loading ? (
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Loading lines...</p>
                ) : lines.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 text-sm">No lines available.</p>
                ) : (
                    <div className="flex flex-wrap gap-5">
                        {lines.map((line) => (
                            // <LineWidget key={line.id} line={line} />

                             <LineWidget key={`${line.id}-${line.stationId ?? 0}`} line={line} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
