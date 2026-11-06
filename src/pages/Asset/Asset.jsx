import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHero from "../../components/PageHero";
import { 
  ClipboardList, 
  Pencil, 
  CheckCircle2, 
  CircleDashed, 
  Trash2,
  CornerDownRight // ✅ Added for visual hierarchy connecting lines
} from "lucide-react"; 
import { getAllAssets, deleteAsset } from "../../services/assetService";
import { getAllAssetTypes } from "../../services/assetTypeService";

// --- Helper Functions for Hierarchy ---

// 1. Converts flat data into a nested tree
const buildAssetTree = (assets, parentId = 0) => {
  return assets
    .filter((asset) => (asset.parentId || 0) === parentId)
    .map((asset) => ({
      ...asset,
      children: buildAssetTree(assets, asset.id),
    }));
};

// 2. Flattens tree for the table, injecting a 'depth' property
const flattenTreeForTable = (tree, depth = 0) => {
  return tree.reduce((acc, node) => {
    acc.push({ ...node, depth });
    if (node.children && node.children.length > 0) {
      acc.push(...flattenTreeForTable(node.children, depth + 1));
    }
    return acc;
  }, []);
};

export default function AssetMaster() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [rawAssets, setRawAssets] = useState([]); // Keeps original flat data for parent name lookup
  const [assetTypes, setAssetTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetsResult, assetTypesResult] = await Promise.all([
        getAllAssets(),
        getAllAssetTypes()
      ]);
      
      setRawAssets(assetsResult);
      setAssetTypes(assetTypesResult);

      // ✅ Transform raw data into structured hierarchical data
      const tree = buildAssetTree(assetsResult, 0); // Assuming 0 is the root parentId
      const hierarchicalData = flattenTreeForTable(tree);
      setData(hierarchicalData);

    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (row) => {
    navigate(`/masters/asset/edit/${row.id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this Asset?")) {
      try {
        await deleteAsset(id);
        fetchData(); 
      } catch (err) {
        console.error("Failed to delete asset:", err);
        alert(`Failed to delete. Error: ${err.response?.status || err.message}`);
      }
    }
  };

  const getAssetTypeName = (typeId) => {
    const foundType = assetTypes.find((type) => type.id === typeId);
    return foundType ? foundType.description : `Unknown`;
  };

  const getParentName = (parentId) => {
    if (!parentId || parentId === 0) return <span className="text-slate-400 font-medium">-</span>;
    const parent = rawAssets.find((a) => a.id === parentId);
    return parent ? parent.assetName : `ID: ${parentId}`;
  };

  function StatusBadge({ active }) {
    const tone = active 
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-400/15 dark:text-emerald-400 dark:ring-emerald-400/30" 
      : "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-400/15 dark:text-rose-400 dark:ring-rose-400/30";
    const Icon = active ? CheckCircle2 : CircleDashed;

    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
        {active ? "Active" : "Inactive"}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Masters"
        title="Asset Master"
        description="Manage machines, vehicles, and other assets in a structured hierarchy."
        icon={ClipboardList}
        pill={
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-4 w-4" /> Live tracking
          </div>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900/70 dark:ring-slate-800">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Asset Actions</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Create or browse assets hierarchically.</p>
        </div>

        <button
          onClick={() => navigate("/masters/asset/add")}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1c75bc] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#155e96] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#1c75bc] focus:ring-offset-2"
        >
          <ClipboardList className="h-4 w-4" /> Add New Asset
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:ring-slate-800">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <CircleDashed className="h-5 w-5 animate-spin" /> Loading hierarchy...
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-slate-500">
            No assets found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">ID</th>
                  <th className="px-6 py-4 font-semibold">Asset Structure</th>
                  <th className="px-6 py-4 font-semibold">Asset Type</th>
                  <th className="px-6 py-4 font-semibold">Parent Name</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800/60 dark:bg-slate-900/40">
                {data.map((row) => (
                  <tr 
                    key={row.id} 
                    className="group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="whitespace-nowrap px-6 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {row.id}
                    </td>
                    
                    {/* ✅ Structured Hierarchical Display */}
                    <td className="whitespace-nowrap px-6 py-3">
                      <div 
                        className="flex items-center gap-2"
                        style={{ paddingLeft: `${row.depth * 2}rem` }} // Dynamic indent
                      >
                        {row.depth > 0 && (
                          <CornerDownRight className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <span className={`
                          ${row.depth === 0 ? 'font-bold text-slate-800 dark:text-slate-200' : ''}
                          ${row.depth === 1 ? 'font-semibold text-slate-700 dark:text-slate-300' : ''}
                          ${row.depth >= 2 ? 'font-medium text-slate-600 dark:text-slate-400' : ''}
                        `}>
                          {row.assetName}
                        </span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-3 text-slate-600 dark:text-slate-300">
                      {getAssetTypeName(row.assetType)}
                    </td>
                    
                    {/* ✅ Uses Parent Name instead of raw ID */}
                    <td className="whitespace-nowrap px-6 py-3 text-slate-600 dark:text-slate-300">
                      {getParentName(row.parentId)}
                    </td>
                    
                    <td className="whitespace-nowrap px-6 py-3">
                      <StatusBadge active={row.isActive} />
                    </td>
                    
                    <td className="whitespace-nowrap px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                        <button
                          onClick={() => handleEdit(row)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:bg-blue-400/10 dark:text-blue-400 dark:hover:bg-blue-400/20"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 dark:bg-rose-400/10 dark:text-rose-400 dark:hover:bg-rose-400/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}