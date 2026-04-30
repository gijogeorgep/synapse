import React, { useState, useEffect } from 'react';
import { Settings, Shield, AlertCircle, Terminal, HardDrive } from 'lucide-react';
import { getAuditLogs, getSettings, updateSettings } from '../../../api/services';
import { toast } from 'react-hot-toast';

const AdminSettings = () => {
    const [logs, setLogs] = useState([]);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('audit');
    const [savingMaintenance, setSavingMaintenance] = useState(false);
    const [savingBanners, setSavingBanners] = useState(false);
    const [savingField, setSavingField] = useState(null);

    useEffect(() => {
        if (activeTab === 'audit') fetchLogs();
        if (activeTab === 'general') fetchSettings();
    }, [activeTab]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await getAuditLogs();
            setLogs(data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFieldBlur = async (field, value) => {
        if (!value || value === settings?.[field]) return;
        setSavingField(field);
        try {
            await updateSettings({ [field]: value });
            toast.success('Saved');
            setSettings(prev => ({ ...prev, [field]: value }));
        } catch {
            toast.error('Failed to save');
        } finally {
            setSavingField(null);
        }
    };

    const handleMaintenanceToggle = async () => {
        if (savingMaintenance) return;
        const newValue = !settings?.maintenanceMode;
        setSettings(prev => ({ ...prev, maintenanceMode: newValue }));
        setSavingMaintenance(true);
        try {
            await updateSettings({ maintenanceMode: newValue });
            toast.success(newValue ? '🔧 Maintenance mode enabled' : '✅ Site is back online');
        } catch {
            setSettings(prev => ({ ...prev, maintenanceMode: !newValue }));
            toast.error('Failed to update maintenance mode');
        } finally {
            setSavingMaintenance(false);
        }
    };

    const handleBannersToggle = async () => {
        if (savingBanners) return;
        const newValue = !settings?.showBanners;
        setSettings(prev => ({ ...prev, showBanners: newValue }));
        setSavingBanners(true);
        try {
            await updateSettings({ showBanners: newValue });
            toast.success(newValue ? 'Banners enabled' : 'Banners hidden');
        } catch {
            setSettings(prev => ({ ...prev, showBanners: !newValue }));
            toast.error('Failed to update banner setting');
        } finally {
            setSavingBanners(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">

            <div>
                <h1 className="text-3xl font-bold text-slate-800">Admin Settings</h1>
                <p className="text-slate-500 mt-2">Manage system configuration, logs, and security preferences.</p>
            </div>

            {/* Tab Bar */}
            <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-2xl w-fit">
                {['general', 'audit', 'security'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── AUDIT TAB ── */}
            {activeTab === 'audit' && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-300">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                                <Terminal className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">System Activity</h2>
                        </div>
                        <button onClick={fetchLogs} className="text-sm font-bold text-cyan-600 hover:text-cyan-700 transition-colors">
                            Refresh Logs
                        </button>
                    </div>
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
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
                                    {logs.map(log => (
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
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${log.action.includes('Delete') ? 'bg-rose-50 text-rose-600 border border-rose-100' :
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

            {/* ── GENERAL TAB ── */}
            {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">

                        {/* Card Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
                            <div className="p-2.5 bg-slate-900 text-white rounded-xl">
                                <Settings className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">General Configuration</h2>
                        </div>

                        {/* Card Body */}
                        {loading ? (
                            <div className="flex justify-center py-16">
                                <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="p-8 space-y-6">

                                {/* Text fields — auto-save on blur */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Site Name</label>
                                        <div className="relative">
                                            <input
                                                defaultValue={settings?.siteName}
                                                onBlur={e => handleFieldBlur('siteName', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium pr-10"
                                                placeholder="e.g. Synapse Edu Hub"
                                            />
                                            {savingField === 'siteName' && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Contact Email</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                defaultValue={settings?.contactEmail}
                                                onBlur={e => handleFieldBlur('contactEmail', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium pr-10"
                                                placeholder="e.g. hello@synapse.com"
                                            />
                                            {savingField === 'contactEmail' && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Contact Phone</label>
                                        <div className="relative">
                                            <input
                                                defaultValue={settings?.contactPhone}
                                                onBlur={e => handleFieldBlur('contactPhone', e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none transition-all font-medium pr-10"
                                                placeholder="e.g. +91 81579 30567"
                                            />
                                            {savingField === 'contactPhone' && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Banner Advertisements toggle */}
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center space-x-3">
                                        <HardDrive className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">Banner Advertisements</p>
                                            <p className="text-xs text-slate-500">Toggle visibility of promotional banners on the homepage</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        id="banner-toggle"
                                        onClick={handleBannersToggle}
                                        disabled={savingBanners}
                                        aria-label="Toggle banners"
                                        className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300 focus:outline-none disabled:opacity-60 ${settings?.showBanners ? 'bg-cyan-500' : 'bg-slate-200'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${settings?.showBanners ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>

                                {/* Maintenance Mode toggle */}
                                <div className={`flex items-center justify-between p-4 rounded-2xl border transition-colors duration-300 ${settings?.maintenanceMode ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex items-center space-x-3">
                                        <AlertCircle className={`w-5 h-5 flex-shrink-0 ${settings?.maintenanceMode ? 'text-amber-500' : 'text-slate-400'}`} />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-slate-800">Maintenance Mode</p>
                                                {settings?.maintenanceMode && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500 text-white">
                                                        <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500">Show maintenance page to all visitors — admins still have full access</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        id="maintenance-mode-toggle"
                                        onClick={handleMaintenanceToggle}
                                        disabled={savingMaintenance}
                                        aria-label="Toggle maintenance mode"
                                        className={`relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300 focus:outline-none disabled:opacity-60 ${settings?.maintenanceMode ? 'bg-amber-500' : 'bg-slate-200'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 flex items-center justify-center ${settings?.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}>
                                            {savingMaintenance && (
                                                <span className="w-2.5 h-2.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                                            )}
                                        </span>
                                    </button>
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── SECURITY TAB ── */}
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
