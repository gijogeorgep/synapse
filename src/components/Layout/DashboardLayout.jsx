import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../../context/AuthContext";

const DashboardLayout = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="flex min-h-[calc(100vh-6rem)] bg-slate-50">
            <Sidebar role={user.role} />
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
