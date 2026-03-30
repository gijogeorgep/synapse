import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

const DashboardLayout = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="flex h-[calc(100vh-6rem)] items-start overflow-hidden bg-slate-50">
            <Sidebar role={user.role} />
            <main className="h-full flex-1 overflow-y-auto p-8">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
