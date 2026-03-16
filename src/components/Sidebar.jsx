import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    FileText,
    History,
    Users,
    CreditCard,
    Settings,
    PlusCircle,
    BarChart3
} from "lucide-react";

const Sidebar = ({ role }) => {
    const links = {
        student: [
            { name: "Dashboard", icon: LayoutDashboard, path: "/student/dashboard" },
            { name: "Exams", icon: FileText, path: "/student/exams" },
            { name: "Materials", icon: BookOpen, path: "/student/materials" },
            { name: "History", icon: History, path: "/student/history" },
        ],
        teacher: [
            { name: "Dashboard", icon: LayoutDashboard, path: "/teacher/dashboard" },
            { name: "Manage Exams", icon: FileText, path: "/teacher/exams" },
            { name: "Materials", icon: BookOpen, path: "/teacher/materials" },
            { name: "Analytics", icon: BarChart3, path: "/teacher/analytics" },
            { name: "Settings", icon: Settings, path: "/teacher/settings" },
        ],
        admin: [
            { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
            { name: "Users", icon: Users, path: "/admin/users" },
            { name: "Payments", icon: CreditCard, path: "/admin/payments" },
            { name: "Settings", icon: Settings, path: "/admin/settings" },
        ],
        superadmin: [
            { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
            { name: "Users", icon: Users, path: "/admin/users" },
            { name: "Audit Logs", icon: History, path: "/admin/audit-logs" },
            { name: "Payments", icon: CreditCard, path: "/admin/payments" },
            { name: "Settings", icon: Settings, path: "/admin/settings" },
        ],
    };

    const currentLinks = links[role] || [];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-6rem)] sticky top-24 overflow-y-auto">
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
        </aside>
    );
};

export default Sidebar;
