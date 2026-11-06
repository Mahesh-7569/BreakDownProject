import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import DashboardPage from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import LinesPage from "./pages/Lines";
import CustomersPage from "./pages/Customers";
import VariantsPage from "./pages/Variants";
import EditVariantPage from "./pages/variants/EditVariant";
import PlantsPage from "./pages/Plants";
import UserList from "./pages/users/UserList";
import CreateUser from "./pages/users/CreateUser";
import EditUser from "./pages/users/EditUser";
import AddCustomerPage from "./pages/AddCustomer";
import EditCustomerPage from "./pages/EditCustomer";
import AddVariantPage from "./pages/AddVariant";
import ShiftList from "./pages/shifts/ShiftList";
import CreateShift from "./pages/shifts/CreateShift";
import EditShift from "./pages/shifts/EditShift";
import MainLayout from "./components/layout/MainLayout";
import PrivateRoute from "./components/auth/PrivateRoute";
import AddEolparam from "./pages/eolparam/AddEolparam";
import EditEolparam from "./pages/eolparam/EditEolparam";
import EolparamsPage from "./pages/eolparam/EolparamsPage";
import Workplan from "./pages/management/workplan";
import AddWorkplan from "./pages/management/AddWorkplan";
import EditWorkplan from "./pages/management/EditWorkplan";
import LineFolderMap from "./pages/linefoldermap/LineFolderMap";
import AddLineFolderMap from "./pages/linefoldermap/AddLineFolderMap";
import EditLineFolderMap from "./pages/linefoldermap/EditLineFolderMap";
import LineMapping from "./pages/linemapping/LineMapping";
import AddLineMapping from "./pages/linemapping/AddLineMapping";
import EditLineMapping from "./pages/linemapping/EditLineMapping";
import PlcMaster from "./pages/plcmaster/PlcMaster";
import AddPlcMaster from "./pages/plcmaster/AddPlcMaster";
import EditPlcMaster from "./pages/plcmaster/EditPlcMaster";
import PlcRfid from "./pages/plcrfid/PlcRfid";
import AddPlcRfid from "./pages/plcrfid/AddPlcRfid";
import EditPlcRfid from "./pages/plcrfid/EditPlcRfid";
import TestChart from "./pages/reports/TestChart";
import ProductionDashboard from "./DashboardPages/ProductionDashboard";
import Newlayout from "./components/layout/Newlayout";
import OeeDashboard from "./DashboardPages/OeeDashboard";
import OeeFailureReport from "./DashboardPages/OeeFailureReport";
import DaywiseReport from "./pages/reports/DaywiseReport";
import StationwiseReport from "./pages/reports/StationwiseReport";
import ParameterPage from "./pages/reports/ParameterPage.jsx";
import LineChart from "./pages/reports/LineChart";
import ParameterChart from "./pages/reports/ParameterChart";
import SubStationMap from "./pages/SubStation/SubStation";
import AddSubStation from "./pages/SubStation/AddSubStation";
import EditSubStation from "./pages/SubStation/EditSubStation";
import SubstationRfid from "./pages/SubstationRfid/SubstationRfid";
import AddSubstationRfid from "./pages/SubstationRfid/AddSubstationRfid";
import EditSubstationRfid from "./pages/SubstationRfid/EditSubstationRfid";
import Mesbypass from "./pages/reports/Mesbypass";
import Production from "./pages/reports/ProductionReport";
import ProductionforPart from "./pages/reports/ProductionforPart";
import AddLine from "./pages/Line/AddLine";
import EditLine from "./pages/Line/EditLine";
import PartScanReport from "./pages/reports/PartScanReport";
import Livedata from "./pages/Livedata";
import RoleMaster from "./pages/rolemaster/rolemaster";
import AddRoleMaster from "./pages/rolemaster/AddRoleMaster";
import MenuMaster from "./pages/menumaster/MenuMaster";
import AddMenuMaster from "./pages/menumaster/AddMenuMaster";
import RoleMenuMapping from "./pages/rolemenumapping/RoleMenuMapping";
import Unauthorized from "./pages/Unauthorized";
import CameraList from "./pages/camera/camera";
import AddCamera from "./pages/camera/AddCamera";
import EditCamera from "./pages/camera/EditCamera";
import CameraImageLog from "./pages/reports/CameraImageLog";
import AppConfigList from "./pages/appconfig/appconfig";
import AddAppConfig from "./pages/appconfig/AddAppconfig";
import EditAppConfig from "./pages/appconfig/EditAppconfig";
import StationList from "./pages/addstationconfig/AddStationConfig";
import CreateStationConfig from "./pages/addstationconfig/CreateStationConfig";
import EditStationConfig from "./pages/addstationconfig/EditStationConfig";
import Availability from "./pages/OeePages/Availability";
import Quality from "./pages/OeePages/Quality";
import Performance from "./pages/OeePages/Performance";
import CategoryMaster from "./pages/category/category";
import AddCategory from "./pages/category/Addcategory";
import EditCategory from "./pages/category/Editcategory";
import DowntimeReasonMaster from "./pages/downtimereason/DowntimeReason";
import AddDowntimeReason from "./pages/downtimereason/AddDowntimeReason";
import EditDowntimeReason from "./pages/downtimereason/EditDowntimeReason";
import WorkOrderStatusMaster from "./pages/workorderstatus/WorkOrderStatus";
import AddWorkOrderStatus from "./pages/workorderstatus/AddWorkOrderStatus";
import EditWorkOrderStatus from "./pages/workorderstatus/EditWorkOrderStatus";
import AssetTypeMaster from "./pages/assettype/Assettype";
import AddAssetType from "./pages/assettype/AddAssetType";
import EditAssetType from "./pages/assettype/EditAssetType";
import AssetMaster from "./pages/Asset/Asset";
import AddAsset from "./pages/Asset/Addasset";
import EditAsset from "./pages/Asset/Editasset";
import WorkOrderMaster from "./pages/workorder/WorkOrderMaster";
import AddWorkOrder from "./pages/workorder/AddWorkOrder";
import EditWorkOrder from "./pages/workorder/EditWorkOrder";
import ItemTypeMaster from "./pages/itemtype/ItemTypeMaster";
import AddItemType from "./pages/itemtype/AddItemType";
import EditItemType from "./pages/itemtype/EditItemType";
import ItemMaster from "./pages/item/ItemMaster";
import AddItemMaster from "./pages/item/AddItemMaster";
import EditItemMaster from "./pages/item/EditItemMaster";
import DelayLog from "./pages/delaylog/DelayLog";
import OeeReport from "./pages/reports/OeeSummaryReport";
import DefectLogReport from "./pages/reports/DefectlogReport";
import Delaycreate from "./pages/delaylog/Delaycreate";
import OnlyHeaderLayout from "./components/layout/OnlyHeaderLayout";
import Categoryreport from "./pages/reports/Categoryreport";
import PlannedMaintenanceMaster from "./pages/PlannedMaintenanceMaster/PlannedMaintenanceMaster";
import AddPlannedMaintenance from "./pages/PlannedMaintenanceMaster/AddPlannedMaintenance";
import EditPlannedMaintenance from "./pages/PlannedMaintenanceMaster/EditPlannedMaintenance";
import BreakdownManagement from './pages/BreakDownManagmentPages/BreakdownManagement';
import WorkOrderAssignment from './pages/BreakDownManagmentPages/WorkOrderAssignment';
import WorkOrderForm from './pages/BreakDownManagmentPages/WorkOrderForm';
import RcaAction from './pages/BreakDownManagmentPages/RcaAction'
import RcaForm from './pages/BreakDownManagmentPages/RcaForm'

import {
  getExpiration,
  getUserName,
  isAuthenticated,
  isTokenExpired,
  logout,
  initAuthOnLoad,
} from "./services/authService";
import "./App.css";
import DelayLogReport from "./pages/reports/Delaylogreport";
import AddDelay from "./pages/delaylog/AddDelay";

const PlaceholderPage = ({ title, description }) => (
  <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 text-slate-900 shadow-lg backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100">
    <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
      Navigation
    </p>
    <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
    <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
      {description}
    </p>
  </div>
);

function App() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState(() => ({
    isAuthenticated: isAuthenticated(),
    userName: getUserName(),
    expiration: getExpiration(),
  }));

  const refreshAuthState = useCallback(() => {
    setAuthState({
      isAuthenticated: isAuthenticated(),
      userName: getUserName(),
      expiration: getExpiration(),
    });
  }, []);

  useEffect(() => {
    initAuthOnLoad();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isTokenExpired() && authState.isAuthenticated) {
        logout();
        refreshAuthState();
        navigate("/login", { replace: true });
      }
    }, 30_000);

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, navigate, refreshAuthState]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "mes-auth-session") {
        refreshAuthState();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshAuthState]);

  const onLoginSuccess = useCallback(
    (userName, redirectPath = "/dashboard") => {
      refreshAuthState();
      if (userName) {
        setAuthState((prev) => ({ ...prev, userName }));
      }
      navigate(redirectPath, { replace: true });
    },
    [navigate, refreshAuthState],
  );

  const handleLogout = useCallback(() => {
    logout();
    refreshAuthState();
    navigate("/login", { replace: true });
  }, [navigate, refreshAuthState]);

  const placeholderProps = useMemo(
    () => [
      {
        path: "/production",
        title: "Production",
        description:
          "Monitor takt time, throughput, and machine utilization from this workspace.",
      },
      {
        path: "/masters",
        title: "Masters",
        description:
          "Manage master data like work centers, BOMs, and routing definitions.",
      },
      {
        path: "/reports",
        title: "Reports",
        description:
          "Generate daily production summaries and audit-ready compliance reports.",
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">
      <Routes>
        <Route
          path="/"
          element={
            <LoginPage
              isAuthenticated={authState.isAuthenticated}
              redirectPath="/dashboard"
              onLoginSuccess={onLoginSuccess}
            />
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage
              isAuthenticated={authState.isAuthenticated}
              redirectPath="/dashboard"
              onLoginSuccess={onLoginSuccess}
            />
          }
        />

        <Route
          path="/DashboardPages/ProductionDashboard"
          element={
            <Newlayout>
              <ProductionDashboard />
            </Newlayout>
          }
        />

        <Route
          path="/DashboardPages/OeeDashboard"
          element={
            <Newlayout>
              <OeeDashboard />
            </Newlayout>
          }
        />

        <Route
          path="/DashboardPages/OeeFailureReport"
          element={
            <Newlayout>
              <OeeFailureReport />
            </Newlayout>
          }
        />

        <Route
          path="/reports/testchart"
          element={
            <Newlayout>
              <TestChart />
            </Newlayout>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Newlayout>
                <DashboardPage userId={authState.userName} />
              </Newlayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/reports/parameterchart"
          element={
            <Newlayout>
              <ParameterChart />
            </Newlayout>
          }
        />

        <Route
          path="/Pages/Livedata"
          element={
            <PrivateRoute>
              <Newlayout>
                <Livedata />
              </Newlayout>
            </PrivateRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<PrivateRoute />}>
          <Route
            element={
              <MainLayout onLogout={handleLogout} userId={authState.userName} />
            }
          >
            {/* <Route path="/dashboard" element={<DashboardPage userId={authState.userName} />} /> */}

            {placeholderProps.map((item) => (
              <Route
                key={item.path}
                path={item.path}
                element={
                  <PlaceholderPage
                    title={item.title}
                    description={item.description}
                  />
                }
              />
            ))}
            <Route path="/masters/lines" element={<LinesPage />} />
            <Route path="/masters/plants" element={<PlantsPage />} />
            <Route
              path="/masters/customers/add"
              element={<AddCustomerPage />}
            />
            <Route
              path="/masters/customers/:id/edit"
              element={<EditCustomerPage />}
            />
            <Route path="/masters/customers" element={<CustomersPage />} />
            <Route path="/masters/variants/add" element={<AddVariantPage />} />
            <Route
              path="/masters/variants/:id/edit"
              element={<EditVariantPage />}
            />
            <Route path="/masters/variants" element={<VariantsPage />} />
            <Route path="/masters/shifts/create" element={<CreateShift />} />
            <Route path="/masters/shifts" element={<ShiftList />} />
            <Route path="/masters/shifts/edit/:id" element={<EditShift />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/users/create" element={<CreateUser />} />
            <Route path="/users/edit/:id" element={<EditUser />} />
            <Route path="/masters/eolparam" element={<EolparamsPage />} />
            <Route path="/masters/eolparam/add" element={<AddEolparam />} />
            <Route
              path="/masters/eolparam/:id/edit"
              element={<EditEolparam />}
            />
            <Route path="/management/workplan" element={<Workplan />} />
            <Route path="/management/workplan/add" element={<AddWorkplan />} />
            <Route
              path="/management/workplan/edit/:id"
              element={<EditWorkplan />}
            />
            <Route path="/masters/linefoldermap" element={<LineFolderMap />} />
            <Route
              path="/masters/linefoldermap/add"
              element={<AddLineFolderMap />}
            />
            <Route
              path="/masters/linefoldermap/edit/:id"
              element={<EditLineFolderMap />}
            />

            <Route path="/masters/linemapping" element={<LineMapping />} />
            <Route
              path="/masters/linemapping/add"
              element={<AddLineMapping />}
            />
            <Route
              path="/masters/linemapping/edit/:id"
              element={<EditLineMapping />}
            />
            <Route path="/masters/plcmaster" element={<PlcMaster />} />
            <Route path="/masters/plcmaster/add" element={<AddPlcMaster />} />
            <Route
              path="/masters/plcmaster/edit/:id"
              element={<EditPlcMaster />}
            />
            <Route path="/masters/plcrfid" element={<PlcRfid />} />
            <Route path="/masters/plcrfid/add" element={<AddPlcRfid />} />
            <Route path="/masters/plcrfid/edit/:id" element={<EditPlcRfid />} />
            {/* <Route path="/reports/testchart" element={<TestChart />} /> */}
            <Route path="/reports/daywise-report" element={<DaywiseReport />} />
            <Route
              path="/reports/stationwise"
              element={<StationwiseReport />}
            />
            <Route path="/reports/parameter" element={<ParameterPage />} />
            <Route path="reports/linechart" element={<LineChart />} />
            <Route path="/reports/Mesbypass" element={<Mesbypass />} />
            <Route path="/reports/Production" element={<Production />} />
            <Route path="/reports/oeereport" element={<OeeReport />} />

            <Route
              path="/reports/ProductionforPart"
              element={<ProductionforPart />}
            />
            <Route
              path="/reports/PartScanReport"
              element={<PartScanReport />}
            />
            <Route
              path="/reports/CameraImageLog"
              element={<CameraImageLog />}
            />

            {/* <Route path="/reports/parameterchart" element={<ParameterChart />} /> */}
            <Route path="/masters/substation" element={<SubStationMap />} />
            <Route path="/masters/SubStation/add" element={<AddSubStation />} />
            <Route
              path="/masters/SubStation/edit/:id"
              element={<EditSubStation />}
            />
            <Route
              path="/masters/SubstationRfid"
              element={<SubstationRfid />}
            />
            <Route
              path="/masters/SubstationRfid/add"
              element={<AddSubstationRfid />}
            />
            <Route
              path="/masters/substationrfid/edit"
              element={<EditSubstationRfid />}
            />
            <Route path="/masters/Line/add" element={<AddLine />} />
            <Route path="/masters/line/edit/:id" element={<EditLine />} />
            <Route path="/masters/rolemaster" element={<RoleMaster />} />
            <Route path="/masters/rolemaster/add" element={<AddRoleMaster />} />
            <Route
              path="/masters/rolemaster/edit/:id"
              element={<AddRoleMaster />}
            />
            <Route path="/masters/menumaster" element={<MenuMaster />} />
            <Route path="/masters/menumaster/add" element={<AddMenuMaster />} />
            <Route
              path="/masters/menumaster/edit/:id"
              element={<AddMenuMaster />}
            />
            <Route
              path="/masters/rolemenumapping"
              element={<RoleMenuMapping />}
            />
            <Route path="/masters/Camera" element={<CameraList />} />
            <Route path="/masters/Camera/add" element={<AddCamera />} />
            <Route path="/masters/Camera/edit/:id" element={<EditCamera />} />
            <Route path="/masters/AppConfig" element={<AppConfigList />} />
            <Route path="/masters/AppConfig/add" element={<AddAppConfig />} />
            <Route
              path="/masters/AppConfig/edit/:id"
              element={<EditAppConfig />}
            />
            <Route path="/masters/Stationlist" element={<StationList />} />
            <Route
              path="/masters/Stationlist/add"
              element={<CreateStationConfig />}
            />
            <Route
              path="/masters/Station/edit/:id"
              element={<EditStationConfig />}
            />
            <Route path="/masters/Performance" element={<Performance />} />
            <Route path="/masters/Quality" element={<Quality />} />
            <Route path="/masters/Availability" element={<Availability />} />
            <Route path="/masters/categories" element={<CategoryMaster />} />
            <Route path="/masters/categories/add" element={<AddCategory />} />
            <Route
              path="/masters/categories/edit/:id"
              element={<EditCategory />}
            />
            <Route
              path="/masters/downtimereason"
              element={<DowntimeReasonMaster />}
            />
            <Route
              path="/masters/downtime-reasons/add"
              element={<AddDowntimeReason />}
            />
            <Route
              path="/masters/downtime-reasons/edit/:id"
              element={<EditDowntimeReason />}
            />
            <Route
              path="/masters/workorderstatus"
              element={<WorkOrderStatusMaster />}
            />
            <Route
              path="/masters/workorderstatus/add"
              element={<AddWorkOrderStatus />}
            />
            <Route
              path="/masters/workorderstatus/edit/:id"
              element={<EditWorkOrderStatus />}
            />
            <Route path="/masters/assettype" element={<AssetTypeMaster />} />
            <Route path="/masters/assettype/add" element={<AddAssetType />} />
            <Route
              path="/masters/assettype/edit/:id"
              element={<EditAssetType />}
            />
            <Route path="/masters/asset" element={<AssetMaster />} />
            <Route path="/masters/asset/add" element={<AddAsset />} />
            <Route path="/masters/asset/edit/:id" element={<EditAsset />} />
            <Route path="/masters/workorder" element={<WorkOrderMaster />} />
            <Route path="/masters/workorder/add" element={<AddWorkOrder />} />
            <Route
              path="/masters/workorder/edit/:id"
              element={<EditWorkOrder />}
            />
            <Route path="/masters/itemtype" element={<ItemTypeMaster />} />
            <Route path="/masters/itemtype/add" element={<AddItemType />} />
            <Route
              path="/masters/itemtype/edit/:id"
              element={<EditItemType />}
            />
            <Route path="/masters/delaylog" element={<DelayLog />} />

            <Route path="/masters/item" element={<ItemMaster />} />
            <Route path="/masters/item/add" element={<AddItemMaster />} />
            <Route path="/masters/item/edit/:id" element={<EditItemMaster />} />

            <Route path="/masters/updatedelay" element={<Delaycreate />} />
            {/* <Route path="/masters/adddelay" element={<AddDelay />} /> */}
            <Route
              path="/reports/delaylogreport"
              element={<DelayLogReport />}
            />

            <Route path="/masters/plannedmaintenance" element={<PlannedMaintenanceMaster />} />
            <Route path="/masters/plannedmaintenance/add" element={<AddPlannedMaintenance />} />
            <Route path="/masters/plannedmaintenance/edit/:id" element={<EditPlannedMaintenance />} />
            <Route
              path="/reports/categoryreport"
              element={<Categoryreport />}
            />
            <Route
              path="/masters/breakdowndashboard"
              element={<BreakdownManagement />}
            />

            <Route
              path="/master/workorderandassignment"
              element={<WorkOrderAssignment />}
            />

            <Route
              path="/master/workorderandassignment/add"
              element={<WorkOrderForm />}
            />

            <Route
              path="/master/workorderandassignment/edit/:id"
              element={<WorkOrderForm />}
            />

            <Route
              path="/masters/rcaandaction"
              element={<RcaAction />}
            />

            <Route
              path="/masters/rcaandaction/add"
              element={<RcaForm />}
            />
          </Route>
        </Route>

        <Route
          element={
            <PrivateRoute>
              <OnlyHeaderLayout
                onLogout={handleLogout}
                userId={authState.userName}
              />
            </PrivateRoute>
          }
        >
          <Route path="/masters/adddelay" element={<AddDelay />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
