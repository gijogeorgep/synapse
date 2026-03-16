import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Shield, User, Clock, CheckCircle2, AlertCircle, Terminal, HardDrive } from 'lucide-react';

const AdminSettings = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('audit');

    const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

    useEffect(() => {
        if (activeTab === 'audit') fetchLogs();
    }, [activeTab]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('/api/admin/audit-logs', config);
            setLogs(data);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Admin Settings</h1>
                <p className="text-slate-500 mt-2">Manage system logs and security preferences.</p>
            </div>

            <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-2xl w-fit">
                <button 
                    onClick={() => setActiveTab('general')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    General
                </button>
                <button 
                    onClick={() => setActiveTab('audit')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'audit' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Audit Logs
                </button>
                <button 
                    onClick={() => setActiveTab('security')}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Security
                </button>
            </div>

            {activeTab === 'audit' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                                <Terminal className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">System Activity</h2>
                        </div>
                        <button onClick={fetchLogs} className="text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors">Refresh Logs</button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-20">
                            <Shield className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-medium">No activity logs recorded yet.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-6 py-4">Admin</th>
                                        <th className="px-6 py-4">Action</th>
                                        <th className="px-6 py-4">Details</th>
                                        <th className="px-6 py-4 text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {logs.map((log) => (
                                        <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                                                        {log.user?.name?.charAt(0) || 'A'}
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-700">{log.user?.name || 'System'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                                                    log.action.includes('Delete') ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                                                    log.action.includes('Create') ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                                    'bg-cyan-50 text-cyan-600 border border-cyan-100'
                                                }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-500 font-medium truncate max-w-xs">{log.details}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">{new Date(log.createdAt).toLocaleDateString()}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium uppercase">{new Date(log.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'general' && (
                <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 text-center space-y-4 animate-in fade-in duration-300">
                    <Settings className="w-16 h-16 text-slate-100 mx-auto" />
                    <h3 className="text-xl font-bold text-slate-400">General Settings Coming Soon</h3>
                    <p className="text-slate-400 max-w-sm mx-auto">This section will include school details, logo customization and system preferences.</p>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="bg-white rounded-3xl p-12 shadow-sm border border-slate-100 text-center space-y-4 animate-in fade-in duration-300">
                    <Shield className="w-16 h-16 text-slate-100 mx-auto" />
                    <h3 className="text-xl font-bold text-slate-400">Security Policies Coming Soon</h3>
                    <p className="text-slate-400 max-w-sm mx-auto">Configure password policies, MFA and backup settings.</p>
                </div>
            )}
        </div>
    );
};

export default AdminSettings;
