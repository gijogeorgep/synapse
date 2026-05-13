import { Outlet, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";
import { Menu, Bell } from "lucide-react";

const SIDEBAR_COLLAPSE_KEY = "dashboard-sidebar-collapsed";

const DashboardLayout = () => {
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "true";
    });
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            import("../../api/services").then(({ getNotifications }) => {
                getNotifications().then(res => {
                    if (res && Array.isArray(res)) {
                        const unread = res.filter(n => !n.readBy.includes(user._id)).length;
                        setUnreadCount(unread);
                    }
                }).catch(console.error);
            });
        }
    }, [user]);

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
                        <Link 
                            to="/notifications" 
                            className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-cyan-600 group"
                        >
                            <Bell className="h-5 w-5 transition-transform group-hover:scale-110" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 flex h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 shadow-sm animate-pulse"></span>
                            )}
                        </Link>
                        <Link 
                            to={user.role === 'teacher' ? '/teacher/settings' : user.role === 'student' ? '/student/settings' : '/settings'}
                            className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] transition-all hover:bg-white/40 hover:scale-[1.02] active:scale-95 cursor-pointer group/profile"
                        >
                            <div className="flex flex-col items-end hidden sm:flex">
                                <span className="text-sm font-bold text-slate-800 leading-none group-hover/profile:text-cyan-700 transition-colors">
                                    {user.role === 'superadmin' ? 'Amith Girish' : user.name}
                                </span>
                                <span className="text-[10px] font-semibold text-cyan-600 uppercase tracking-wider mt-1">{user.role}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full border-2 border-white/50 bg-white/10 backdrop-blur-xl overflow-hidden shadow-sm flex-shrink-0 flex items-center justify-center transition-transform group-hover/profile:rotate-3">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/80 to-sky-600/80 text-white font-bold text-sm">
                                        {user.role === 'superadmin' ? 'A' : user.name?.[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </Link>
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
