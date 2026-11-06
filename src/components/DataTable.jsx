// import React from "react";

// export default function DataTable({ columns, data, loading, maxHeight = "max-h-[500px]" }) {
//   if (loading) {
//     return (
//       <div className="flex h-64 items-center justify-center rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
//         <span className="text-sm font-semibold text-slate-500 animate-pulse">Loading data...</span>
//       </div>
//     );
//   }

//   if (!data || data.length === 0) {
//     return (
//       <div className="flex h-64 items-center justify-center rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-100">
//         <p className="text-base font-semibold text-slate-500">No records found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-[2rem] bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100/50">
//       <div className={`overflow-y-auto overflow-x-auto ${maxHeight} pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
        
//         <table className="w-full min-w-max border-separate border-spacing-y-2 border-spacing-x-0 text-left font-sans">
          
//           <thead className="sticky top-0 z-20">
//             <tr>
//               {columns.map((col, index) => (
//                 <th
//                   key={index}
//                   className="bg-[#eef4fa] px-4 py-4 text-left text-[13px] font-semibold uppercase tracking-wider text-[#1c75bc] first:rounded-l-2xl last:rounded-r-2xl whitespace-nowrap shadow-sm"
//                 >
//                   {col.header}
//                 </th>
//               ))}
//             </tr>
//           </thead>
          
//           <tbody className="relative z-0">
//             {data.map((row, rowIndex) => (
//               <tr
//                 key={rowIndex}
//                 className="group cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_15px_rgba(28,117,188,0.12)] transition-all duration-300 ease-in-out"
//               >
//                 {columns.map((col, colIndex) => (
//                   <td
//                     key={colIndex}
//                     className="bg-white group-hover:!bg-[#eef4fa] px-4 py-3.5 text-left text-sm text-slate-700 font-medium group-hover:!text-[#1c75bc] first:rounded-l-2xl last:rounded-r-2xl border-y border-slate-100 first:border-l last:border-r transition-colors duration-300 whitespace-nowrap"
//                   >
//                     <div className="flex justify-start text-left">
//                       {col.render ? col.render(row) : row[col.accessor]}
//                     </div>
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
          
//         </table>
//       </div>

//       {/* FOOTER SECTION: Now styled as an attractive badge */}
//       <div className="mt-4 flex items-center justify-end">
//         <span className="inline-flex items-center justify-center rounded-xl bg-[#eef4fa] px-4 py-2 text-[11px] font-bold tracking-widest text-[#1c75bc] uppercase shadow-sm">
//           Total {data.length} Records
//         </span>
//       </div>
      
//     </div>
//   );
// }

//design 2

// import React from "react";

// export default function DataTable({ columns, data, loading, maxHeight = "max-h-[500px]" }) {
//   if (loading) {
//     return (
//       <div className="flex h-64 items-center justify-center rounded-xl bg-white p-6 shadow-sm border border-slate-200">
//         <span className="text-sm font-medium text-slate-500 animate-pulse">Loading data...</span>
//       </div>
//     );
//   }

//   if (!data || data.length === 0) {
//     return (
//       <div className="flex h-64 items-center justify-center rounded-xl bg-white p-6 shadow-sm border border-slate-200">
//         <p className="text-base font-medium text-slate-500">No records found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
//       <div className={`overflow-y-auto overflow-x-auto ${maxHeight} [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}>
        
//         <table className="w-full min-w-max border-collapse text-left font-sans">
          
//           <thead className="sticky top-0 z-20 bg-white">
//             <tr>
//               {columns.map((col, index) => (
//                 <th
//                   key={index}
//                   className="px-4 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400 border-b-2 border-slate-100 whitespace-nowrap"
//                 >
//                   {col.header}
//                 </th>
//               ))}
//             </tr>
//           </thead>
          
//           <tbody className="bg-white">
//             {data.map((row, rowIndex) => (
//               <tr
//                 key={rowIndex}
//                 className="group border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
//               >
//                 {columns.map((col, colIndex) => (
//                   <td
//                     key={colIndex}
//                     className="px-4 py-4 text-sm text-slate-700 font-medium relative whitespace-nowrap"
//                   >
//                     {/* Far-left blue accent bar that scales up on hover */}
//                     {colIndex === 0 && (
//                       <div className="absolute inset-y-0 left-0 w-[3px] bg-[#1c75bc] scale-y-0 group-hover:scale-y-100 transition-transform duration-200 ease-out origin-center" />
//                     )}
                    
//                     <div className="flex justify-start text-left group-hover:text-[#1c75bc] transition-colors duration-200">
//                       {col.render ? col.render(row) : row[col.accessor]}
//                     </div>
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
          
//         </table>
//       </div>

//       <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
//         <div className="text-sm text-slate-500">
//           Showing <span className="font-semibold text-slate-800">{data.length}</span> results
//         </div>
//         <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
//           Total {data.length} Records
//         </span>
//       </div>
      
//     </div>
//   );
// }


//design 3




import React, { useEffect, useMemo, useState } from "react";



const ALIGN = {
  left: "text-left justify-start",
  center: "text-center justify-center",
  right: "text-right justify-end",
};

const CARD =
  "rounded-[2rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100/60";

/* Builds [1, "...", 4, 5, 6, "...", 12] style page list */
function getPageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("start-ellipsis");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push("end-ellipsis");

  items.push(total);
  return items;
}

export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  maxHeight = "max-h-[500px]",
  rowKey = "id",
  onRowClick,
  emptyMessage = "No records found.",
  showFooter = true,
  footerLabel = "Total",
  pagination = true,
  pageSize: initialPageSize = 5,
  pageSizeOptions = [5, 10, 20, 50],
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = data?.length || 0;
  const totalPages = pagination ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  // Keep current page valid when data shrinks / grows or page size changes
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const startIndex = pagination ? (page - 1) * pageSize : 0;
  const endIndex = pagination ? Math.min(startIndex + pageSize, total) : total;

  const visibleRows = useMemo(
    () => (pagination ? (data || []).slice(startIndex, endIndex) : data || []),
    [data, pagination, startIndex, endIndex]
  );

  const pageItems = useMemo(() => getPageItems(page, totalPages), [page, totalPages]);

  const getKey = (row, index) => {
    if (typeof rowKey === "function") return rowKey(row, index);
    return row?.[rowKey] ?? index;
  };

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  /* ---------- Loading (skeleton) ---------- */
  if (loading) {
    return (
      <div className={`${CARD} p-4 sm:p-6`}>
        <div className="mb-3 h-12 animate-pulse rounded-2xl bg-[#eef4fa]" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-6 rounded-2xl border border-slate-100 bg-white px-5 py-4"
            >
              {(columns.length ? columns : Array.from({ length: 4 })).map((_, c) => (
                <div key={c} className="h-4 flex-1 animate-pulse rounded-full bg-slate-100" />
              ))}
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs font-semibold tracking-widest text-slate-400 uppercase">
          Loading data...
        </p>
      </div>
    );
  }

  /* ---------- Empty ---------- */
  if (total === 0) {
    return (
      <div className={`${CARD} flex h-64 flex-col items-center justify-center gap-2 p-6`}>
        <div className="h-1.5 w-12 rounded-full bg-[#1c75bc]/20" />
        <p className="text-base font-semibold text-slate-600">{emptyMessage}</p>
        <p className="text-xs text-slate-400">Nothing to show here yet.</p>
      </div>
    );
  }

  /* ---------- Table ---------- */
  return (
    <div className={`${CARD} p-4 sm:p-6`}>
      <div
        className={`overflow-auto ${maxHeight} -mx-1 px-1 pb-1
          [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar]:w-[4px]
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300
          [&::-webkit-scrollbar-thumb:hover]:bg-slate-300
          [&::-webkit-scrollbar-thumb:active]:bg-slate-300
          [&::-webkit-scrollbar-corner]:bg-transparent
          [@supports(-moz-appearance:none)]:[scrollbar-width:thin]
          [@supports(-moz-appearance:none)]:[scrollbar-color:#cbd5e1_transparent]`}
      >
        <table className="w-full min-w-max border-separate border-spacing-x-0 border-spacing-y-2 text-left font-sans">
          {/* ---------- Head ---------- */}
          <thead className="sticky top-0 z-20">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`whitespace-nowrap bg-gradient-to-b from-[#f3f8fd] to-[#e6effa]
                    px-5 py-4 text-[12px] font-bold uppercase tracking-[0.12em] text-[#1c75bc]
                    border-y border-[#d9e6f5]
                    first:rounded-l-2xl first:border-l last:rounded-r-2xl last:border-r
                    ${ALIGN[col.align || "left"].split(" ")[0]}
                    ${col.width || ""} ${col.headerClassName || ""}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* ---------- Body ---------- */}
          <tbody className="relative z-0">
            {visibleRows.map((row, i) => {
              const globalIndex = startIndex + i;
              return (
                <tr
                  key={getKey(row, globalIndex)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`group transition-all duration-200 ease-out
                    shadow-[0_1px_2px_rgba(15,23,42,0.05)]
                    hover:shadow-[0_8px_24px_rgba(28,117,188,0.14)]
                    ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((col, colIndex) => {
                    const isFirst = colIndex === 0;
                    const isLast = colIndex === columns.length - 1;
                    const align = ALIGN[col.align || "left"];

                    return (
                      <td
                        key={colIndex}
                        className={`whitespace-nowrap bg-white px-5 py-3.5 text-sm font-medium text-slate-700
                          border-y border-slate-100 transition-colors duration-200
                          group-hover:border-[#cfe0f3] group-hover:bg-[#f5f9fe]
                          ${isFirst
                            ? "rounded-l-2xl border-l border-l-slate-100 border-l-[3px] group-hover:border-l-[#1c75bc]"
                            : ""}
                          ${isLast ? "rounded-r-2xl border-r" : ""}
                          ${align.split(" ")[0]}
                          ${col.cellClassName || ""}`}
                      >
                        <div className={`flex items-center ${align.split(" ")[1]}`}>
                          {col.render ? col.render(row, globalIndex) : row[col.accessor]}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---------- Footer ---------- */}
      {showFooter && (
        <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: info + rows per page */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="inline-flex items-center rounded-xl bg-[#eef4fa] px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-[#1c75bc] shadow-sm ring-1 ring-[#d9e6f5]">
              {footerLabel} {total} {total === 1 ? "Record" : "Records"}
            </span>

            {pagination && (
              <>
                <label className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  Rows per page
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-[#1c75bc] outline-none transition focus:border-[#1c75bc] focus:ring-2 focus:ring-[#1c75bc]/20"
                  >
                    {pageSizeOptions.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            )}
          </div>

          {/* Right: page buttons */}
          {pagination && totalPages > 1 && (
            <nav aria-label="Pagination" className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
                className="rounded-lg px-3 py-2 text-xs font-bold text-[#1c75bc] transition hover:bg-[#eef4fa] disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
              >
                Prev
              </button>

              {pageItems.map((item) =>
                typeof item === "string" ? (
                  <span key={item} className="px-1 text-xs font-bold text-slate-400 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => goTo(item)}
                    aria-current={item === page ? "page" : undefined}
                    className={`h-9 min-w-[2.25rem] rounded-lg px-3 text-xs font-bold transition-all duration-200 ${
                      item === page
                        ? "bg-[#1c75bc] text-white shadow-[0_4px_12px_rgba(28,117,188,0.35)]"
                        : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-[#eef4fa] hover:text-[#1c75bc] hover:ring-[#cfe0f3]"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

              <button
                type="button"
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages}
                className="rounded-lg px-3 py-2 text-xs font-bold text-[#1c75bc] transition hover:bg-[#eef4fa] disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}