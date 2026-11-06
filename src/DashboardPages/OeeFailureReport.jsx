import { useLocation,useNavigate} from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { FileDown, List } from "lucide-react";
import { useState, useEffect } from "react";

export default function OeeFailureReport() {
  const location = useLocation();
  const selectedData = location.state;
    const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const reportData = [
    { processName: "PROCESS 1", processId: "OP100", failCount: 15 },
    { processName: "PROCESS 2", processId: "OP200", failCount: 12 },
    { processName: "PROCESS 3", processId: "OP300", failCount: 10 },
    { processName: "PROCESS 4", processId: "OP400", failCount: 12 },
    { processName: "PROCESS 5", processId: "OP500", failCount: 9 },
    { processName: "PROCESS 6", processId: "OP600", failCount: 11 },
  ];

  
//  const [reportData, setReportData] = useState([]);

// useEffect(() => {
//   fetch("https://api-url.com/api/failure-report")
//     .then((res) => res.json())
//     .then((data) => {
//       setReportData(data);
//     })
//     .catch((err) => {
//       console.error("API Error:", err);
//     });
// }, []);


  const filteredData = reportData.filter((item) =>
    item.processName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-100 min-h-screen space-y-8">

      {/* ================= HEADER ================= */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
  <div className="flex justify-between items-center">

    {/* Left section: Title and subtitle */}
    <div>
      <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
        Process-wise Failure Report
      </h1>
      <p className="text-md text-gray-500 mt-2">
        Detailed analysis of process-wise failed count
      </p>
    </div>

    {/* Right section: Back button and Date in one flex container */}
    <div className="flex items-center gap-3 ml-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="bg-gray-700 text-white px-4 py-2 rounded-md text-lg font-medium"
      >
        ← Back
      </button>

      {/* Date */}
      <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-lg font-medium">
        Date: 02-01-2024
      </div>
    </div>

  </div>
</div>

      {/* ================= GRAPH SECTION ================= */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mb-6">
<div className="w-4 h-4 bg-[#d97b63] rounded-sm"></div>
          <p className="text-gray-700 font-semibold text-xl">
            Process-wise Fail Count
          </p>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="processId" fontSize={17}  />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="failCount"
                fill="#d97b63"
                radius={[6, 6, 0, 0]}
                barSize={70}
              /> 
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= TABLE SECTION ================= */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">

        {/* Top Controls */}
        <div className="flex justify-between items-center mb-6">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition">
            <FileDown size={16} />
             CSV
          </button>

          <div className="flex items-center gap-3">
            <label className="text-md text-gray-600">Search</label>
            <input
              type="text"
              className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">

            <thead className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left text-bold text-lg font-medium  px-4 py-3 ">Process Name</th>
                <th className="text-left text-bold text-lg font-medium px-4 py-3">Process ID</th>
                <th className="text-left  text-bold text-lg font-medium px-4 py-3">Total Fail</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-4 font-semibold text-gray-800">
                    {item.processName}
                  </td>
                  <td className="px-4 py-4 text-lg  text-gray-600">
                    {item.processId}
                  </td>
                  <td className="px-4 py-4  text-lg font-medium text-red-600">
                    {item.failCount}
                  </td>

                  <td className="px-4 py-4 text-right">
                    <button className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md transition">
                      <List size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}
