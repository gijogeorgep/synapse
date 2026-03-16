import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { History, Search, Filter, Calendar, Terminal } from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await axios.get('/api/admin/audit-logs', config);
            setLogs(data);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => 
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.user && log.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">System Audit Logs</h1>
                    <p className="text-slate-500 mt-2">Oversee all administrative actions performed on the platform.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search by user, action or details..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                        <Terminal className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-slate-500 font-medium">No audit logs found</h3>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                    <th className="py-4 px-6 text-sm font-semibold text-slate-600">Admin User</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-slate-600">Action</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-slate-600">Details</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-slate-600">IP Address</th>
                                    <th className="py-4 px-6 text-sm font-semibold text-slate-600">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs uppercase">
                                                    {log.user?.name?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-800 text-sm whitespace-nowrap">{log.user?.name || 'Unknown'}</span>
                                                    <span className="text-[10px] text-slate-400">{log.user?.role || 'Deleted User'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md border ${
                                                log.action.includes('Delete') ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                                log.action.includes('Update') ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                log.action.includes('Create') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                'bg-slate-50 text-slate-700 border-slate-100'
                                            }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-slate-600 max-w-xs truncate" title={log.details}>
                                                {log.details}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-xs font-mono text-slate-400">{log.ipAddress || 'Internal'}</span>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditLogs;
