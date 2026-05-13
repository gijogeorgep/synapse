import { useState } from "react";
import { NavLink } from "react-router-dom";
import LogoutConfirmModal from "../Shared/LogoutConfirmModal";
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    History,
    Users,
    CreditCard,
    Settings,
    PlusCircle,
    BarChart3,
    GraduationCap,
    Megaphone,
    Award,
    ArrowUpCircle,
    BookCopy,
    LogOut,
    Sparkles,
    ChevronLeft,
    ChevronRight,
    X,
    Image as ImageIcon,
    FileSpreadsheet,
    Calendar,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/synapse_logo.png";
import logoIcon from "../../assets/synapse_y_logo.png";

const Sidebar = ({ role, collapsed = false, onToggleCollapse, isMobileOpen, setIsMobileOpen }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutConfirm = () => {
        setShowLogoutModal(false);
        logout();
        navigate("/");
    };

    const links = {
        admin: [
            { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
            { name: "Users", icon: Users, path: "/admin/users" },
            { name: "Classrooms", icon: GraduationCap, path: "/admin/classrooms" },
            { name: "Announcements", icon: Megaphone, path: "/admin/announcements" },
            { name: "Calendar Events", icon: Calendar, path: "/admin/events" },
            { name: "Exams & Results", icon: Award, path: "/admin/exams" },
            { name: "Reports", icon: BarChart3, path: "/admin/reports" },
            { name: "Bulk Promotions", icon: ArrowUpCircle, path: "/admin/promotions" },
            { name: "Resource Library", icon: BookCopy, path: "/admin/resources" },
            {name: "Programs ", icon: Sparkles, path: "/admin/programs" },
            {name: "Blogs ", icon: FileText, path: "/admin/blogs" },
            {name: "Banner Ads", icon: ImageIcon, path: "/admin/banners" },
            {name: "Payments", icon: CreditCard, path: "/admin/payments" },
            { name: "Settings", icon: Settings, path: "/admin/settings" },
            { name: "Enquiry Forms", icon: FileText, path: "/admin/enquiry" },
            { name: "Lesson Tracker", icon: FileSpreadsheet, path: "/admin/lesson-tracker" },
        ],
        superadmin: [
            { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
            { name: "Users", icon: Users, path: "/admin/users" },
            { name: "Classrooms", icon: GraduationCap, path: "/admin/classrooms" },
            { name: "Announcements", icon: Megaphone, path: "/admin/announcements" },
            { name: "Calendar Events", icon: Calendar, path: "/admin/events" },
            { name: "Exams & Results", icon: Award, path: "/admin/exams" },
            { name: "Reports", icon: BarChart3, path: "/admin/reports" },
            { name: "Bulk Promotions", icon: ArrowUpCircle, path: "/admin/promotions" },
            { name: "Resource Library", icon: BookCopy, path: "/admin/resources" },
            {name: "Programs ", icon: Sparkles, path: "/admin/programs" },
            {name: "Blogs ", icon: FileText, path: "/admin/blogs" },
            {name: "Banner Ads", icon: ImageIcon, path: "/admin/banners" },
            {name: "Audit Logs", icon: History, path: "/admin/audit-logs" },
            { name: "Payments", icon: CreditCard, path: "/admin/payments" },
            { name: "Settings", icon: Settings, path: "/admin/settings" },
            { name: "Enquiry Forms", icon: FileText, path: "/admin/enquiry" },
            { name: "Lesson Tracker", icon: FileSpreadsheet, path: "/admin/lesson-tracker" },
        ],
    };

    const currentLinks = links[role] || [];

    return (
        <>
            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onConfirm={handleLogoutConfirm}
                onCancel={() => setShowLogoutModal(false)}
            />
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}
            <aside
                className={`fixed lg:sticky top-0 z-50 flex h-screen shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white transition-all duration-300 ${
                    isMobileOpen ? "translate-x-0 w-56 left-0 shadow-2xl" : "-translate-x-full lg:translate-x-0 left-0 lg:left-auto"
                } ${collapsed ? "lg:w-20 w-0" : "lg:w-60 w-0"}`}
            >
                <div className={`flex items-center gap-3 ${collapsed ? "lg:justify-center px-3 py-5" : "justify-between px-6 py-5"} ${isMobileOpen ? 'justify-between' : ''}`}>
                    {!collapsed && (
                        <NavLink to="/" className="flex items-center">
                            <img src={logo} alt="Synapse" className="h-28 w-auto object-contain" />
                        </NavLink>
                    )}
                    {collapsed && (
                        <NavLink to="/" className="flex items-center">
                            <img src={logoIcon} alt="Synapse" className="h-16 w-auto object-contain" />
                        </NavLink>
                    )}
                    
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onToggleCollapse}
                            className="hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-cyan-600"
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsMobileOpen(false)}
                            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-cyan-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className={collapsed ? "lg:px-3 pb-6 px-6" : "px-6 pb-6"}>
                    <nav className="space-y-2">
                        {currentLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsMobileOpen?.(false)}
                                className={({ isActive }) =>
                                    `group flex items-center rounded-xl font-semibold transition-all ${
                                        collapsed ? "lg:justify-center lg:px-3 lg:py-3 space-x-3 px-4 py-3" : "space-x-3 px-4 py-3"
                                    } ${isActive
                                        ? "bg-cyan-50 text-cyan-600 shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-cyan-600"
                                    }`
                                }
                                title={collapsed ? link.name : undefined}
                            >
                                <link.icon className="w-5 h-5" />
                                <span className={collapsed ? "lg:hidden" : ""}>{link.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className={`mt-auto border-t border-slate-100 ${collapsed ? "lg:p-3 p-6" : "p-6"}`}>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className={`w-full flex items-center rounded-xl font-semibold text-red-600 transition-all group hover:bg-red-50 ${
                            collapsed ? "lg:justify-center lg:px-3 lg:py-3 space-x-3 px-4 py-3" : "space-x-3 px-4 py-3"
                        }`}
                        title={collapsed ? "Logout" : undefined}
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className={collapsed ? "lg:hidden" : ""}>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
