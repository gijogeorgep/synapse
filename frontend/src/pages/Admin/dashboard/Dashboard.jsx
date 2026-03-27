import { Users, CreditCard, ShieldCheck, Settings, Bell, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const isSuperAdmin = userInfo?.role === 'superadmin';

    const stats = [
        { name: "Total Students", value: "1,240", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Total Teachers", value: "48", icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
        ...(isSuperAdmin ? [
            { name: "Total Admins", value: "3", icon: Users, color: "text-cyan-600", bg: "bg-cyan-50" }
        ] : []),
        { name: "Revenue (MTD)", property: "₹45,200", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Admin Command Center</h1>
                    <p className="text-slate-500 mt-2">Global system overview and management.</p>
                </div>
                <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
                    <button className="px-4 py-2 text-sm font-semibold bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">7 Days</button>
                    <button className="px-4 py-2 text-sm font-semibold bg-cyan-600 text-white rounded-xl shadow-md">30 Days</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                +12%
                            </div>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-slate-500 text-sm font-medium">{stat.name}</h3>
                            <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value || stat.property}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Recent Transactions</h2>
                    <button className="text-cyan-600 text-sm font-semibold hover:underline">View All</button>
                </div>
                <div className="space-y-4">
                    <p className="text-slate-500 text-sm text-center py-8">Transaction logs are loading...</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
