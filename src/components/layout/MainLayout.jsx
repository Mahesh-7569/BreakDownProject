import { useState } from 'react'
import { Outlet , useLocation,Navigate } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

export default function MainLayout({ onLogout, userId }) {
  const HEADER_HEIGHT = 72
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const location = useLocation() 
  
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
 // 🔴 hide header ONLY for Production Dashboard
  const hideHeader = location.pathname.includes("ProductionDashboard") 
  const [hideSidebar, setHideSidebar] = useState(false)
  




  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-slate-100">

      {/* <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} headerHeight={HEADER_HEIGHT} /> */}
      <div className={`relative z-10 transition-all duration-500 ease-out ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
       {/* ✅ Header removed ONLY on Production Dashboard */}
        {!hideHeader && (
          <Header
            onLogout={onLogout}
            userId={userId}
            headerHeight={HEADER_HEIGHT}
          />
        )}

{!hideSidebar && (
  <Sidebar
    isOpen={isSidebarOpen}
    onToggle={toggleSidebar}
    headerHeight={HEADER_HEIGHT}
  />
)}


        <main className="animate-fade-slide px-4 pb-10 pt-24 sm:px-6 lg:px-8">
          {/* <div className="mx-auto max-w-7xl"> */}
          {/* <div className="w-full"> */}
          <div className="mx-auto w-[91%]">
           <Outlet context={{ setHideSidebar }} />

          </div>
        </main>
      </div>
    </div>
  )
}
