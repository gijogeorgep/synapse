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
        <div className="flex h-screen items-start overflow-hidden bg-slate-50 relative">
            <Sidebar
                role={user.role}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed((value) => !value)}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />
            <main className="h-full flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 md:p-8">
                {/* Dashboard Header with Profile */}
                <div className="flex items-center justify-between mb-8">
                    <div className="lg:hidden flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-100 flex-1 mr-4">
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 hover:text-cyan-600"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h2 className="font-bold text-slate-800 text-sm">Menu</h2>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all hover:bg-white/30 cursor-pointer">
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-sm font-bold text-slate-800 leading-none">{user.name}</span>
                                <span className="text-[10px] font-semibold text-cyan-600 uppercase tracking-wider mt-1">{user.role}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-white/50 bg-white/10 backdrop-blur-xl overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/80 to-sky-600/80 text-white font-bold text-sm">
                                        {user.name?.[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
