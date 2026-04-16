import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

const SIDEBAR_COLLAPSE_KEY = "dashboard-sidebar-collapsed";

const DashboardLayout = () => {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "true";
    });

    useEffect(() => {
        window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(collapsed));
    }, [collapsed]);

    if (!user) return null;

    return (
        <div className="flex h-[calc(100vh-6rem)] items-start overflow-hidden bg-slate-50">
            <Sidebar
                role={user.role}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed((value) => !value)}
            />
            <main className="h-full flex-1 overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
