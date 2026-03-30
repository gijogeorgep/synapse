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
    Sparkles
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ role }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const handleLogoutConfirm = () => {
        setShowLogoutModal(false);
        logout();
        navigate("/");
    };

    const links = {
        student: [
            { name: "Dashboard", icon: LayoutDashboard, path: "/student/dashboard" },
            { name: "Classroom", icon: GraduationCap, path: "/student/classrooms" },
            { name: "Exams", icon: FileText, path: "/student/exams" },
            { name: "Materials", icon: BookOpen, path: "/student/materials" },
            { name: "History", icon: History, path: "/student/history" },
            { name: "Settings", icon: Settings, path: "/student/settings" },
        ],
        teacher: [
            { name: "Dashboard", icon: LayoutDashboard, path: "/teacher/dashboard" },
            { name: "Classroom", icon: GraduationCap, path: "/teacher/classrooms" },
            { name: "Manage Exams", icon: FileText, path: "/teacher/exams" },
            { name: "Materials", icon: BookOpen, path: "/teacher/materials" },
            { name: "Analytics", icon: BarChart3, path: "/teacher/analytics" },
            { name: "Settings", icon: Settings, path: "/teacher/settings" },
        ],
        admin: [
            { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
            { name: "Users", icon: Users, path: "/admin/users" },
            { name: "Classrooms", icon: GraduationCap, path: "/admin/classrooms" },
            { name: "Announcements", icon: Megaphone, path: "/admin/announcements" },
            { name: "Exams & Results", icon: Award, path: "/admin/exams" },
            { name: "Reports", icon: BarChart3, path: "/admin/reports" },
            { name: "Bulk Promotions", icon: ArrowUpCircle, path: "/admin/promotions" },
            { name: "Resource Library", icon: BookCopy, path: "/admin/resources" },
            { name: "Programs ", icon: Sparkles, path: "/admin/programs" },
            { name: "Blogs ", icon: FileText, path: "/admin/blogs" },
            { name: "Payments", icon: CreditCard, path: "/admin/payments" },
            { name: "Settings", icon: Settings, path: "/admin/settings" },
        ],
        superadmin: [
            { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
            { name: "Users", icon: Users, path: "/admin/users" },
            { name: "Classrooms", icon: GraduationCap, path: "/admin/classrooms" },
            { name: "Announcements", icon: Megaphone, path: "/admin/announcements" },
            { name: "Exams & Results", icon: Award, path: "/admin/exams" },
            { name: "Reports", icon: BarChart3, path: "/admin/reports" },
            { name: "Bulk Promotions", icon: ArrowUpCircle, path: "/admin/promotions" },
            { name: "Resource Library", icon: BookCopy, path: "/admin/resources" },
            { name: "Programs ", icon: Sparkles, path: "/admin/programs" },
            { name: "Blogs ", icon: FileText, path: "/admin/blogs" },
            { name: "Audit Logs", icon: History, path: "/admin/audit-logs" },
            { name: "Payments", icon: CreditCard, path: "/admin/payments" },
            { name: "Settings", icon: Settings, path: "/admin/settings" },
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
            <aside className="sticky top-24 flex h-[calc(100vh-6rem)] w-64 shrink-0 flex-col overflow-y-auto border-r border-slate-200 bg-white">
                <div className="p-6">
                    <nav className="space-y-2">
                        {currentLinks.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all ${isActive
                                        ? "bg-cyan-50 text-cyan-600 shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-cyan-600"
                                    }`
                                }
                            >
                                <link.icon className="w-5 h-5" />
                                <span>{link.name}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>

                <div className="p-6 mt-auto border-t border-slate-100">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 transition-all group"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
