import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { Menu } from "lucide-react";

const SIDEBAR_COLLAPSE_KEY = "dashboard-sidebar-collapsed";

const DashboardLayout = () => {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "true";
    });
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    useEffect(() => {
        window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(collapsed));
    }, [collapsed]);

    if (!user) return null;

    return (
        <div className="flex h-[calc(100vh-5rem)] md:h-[calc(100vh-6rem)] items-start overflow-hidden bg-slate-50 relative">
            <Sidebar
                role={user.role}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed((value) => !value)}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />
            <main className="h-full flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 md:p-8">
                <div className="lg:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="font-bold text-slate-800">Dashboard Menu</h2>
                    <button
                        onClick={() => setIsMobileOpen(true)}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-cyan-600"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
