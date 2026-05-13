import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead, clearAllNotifications } from '../../api/services';
import { Bell, BookOpen, Clock, Users, ShieldAlert, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await getNotifications();
            setNotifications(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await markNotificationRead(id);
            setNotifications(prev => prev.map(n => 
                n._id === id ? { ...n, readBy: [...(n.readBy || []), user._id] } : n
            ));
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({
                ...n,
                readBy: [...(n.readBy || []), user._id]
            })));
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    const handleClearAll = async () => {
        try {
            await clearAllNotifications();
            setNotifications([]); // Clear the local list immediately
        } catch (error) {
            console.error("Failed to clear all notifications", error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.readBy?.includes(user._id)) {
            await markNotificationRead(notification._id);
            setNotifications(prev => prev.map(n => 
                n._id === notification._id ? { ...n, readBy: [...(n.readBy || []), user._id] } : n
            ));
        }

        if (notification.type === 'material') {
            navigate('/student/materials');
        } else if (notification.type === 'exam') {
            navigate('/student/exams');
        } else if (notification.type === 'classroom') {
            navigate('/student/classrooms');
        } else if (notification.link) {
            navigate(notification.link);
        }
    };

    const getIconForType = (type) => {
        switch (type) {
            case 'material': return <BookOpen className="w-5 h-5 text-indigo-500" />;
            case 'exam': return <Clock className="w-5 h-5 text-amber-500" />;
            case 'classroom': return <Users className="w-5 h-5 text-emerald-500" />;
            case 'system': return <ShieldAlert className="w-5 h-5 text-cyan-500" />;
            default: return <Bell className="w-5 h-5 text-slate-500" />;
        }
    };

    // Calculate unread count
    const unreadCount = notifications.filter(n => !(n.readBy?.includes(user?._id))).length;

    return (
        <div className="w-full bg-[#f8fafc]/80 font-['Outfit'] flex flex-col min-h-screen pt-10 pb-20 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-[500px] overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-30%] left-[-15%] w-[70%] h-[150%] rounded-full bg-cyan-400/5 blur-[120px] opacity-70"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
            </div>
            
            <main className="flex-grow px-4 md:px-6 z-10 w-full pt-4">
                <div className="max-w-3xl mx-auto">
                    
                    {/* Header: Signature Style */}
                    <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-8 gap-4">
                        <div className="space-y-0.5">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-600 mb-1 block">Timeline</span>
                            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight leading-none">
                                Notifications
                            </h1>
                            <p className="text-slate-500 text-xs md:text-sm font-medium flex items-center gap-2 pt-1">
                                {unreadCount > 0 ? (
                                    <>
                                        <span className="flex h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse ring-2 ring-cyan-500/10"></span>
                                        <span className="text-cyan-700 font-bold">{unreadCount}</span> unread alert{unreadCount > 1 ? 's' : ''}
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        System up to date
                                    </>
                                )}
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="group flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-cyan-600 hover:border-cyan-200 transition-all duration-300"
                                >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Mark Seen
                                </button>
                            )}
                            
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="group flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm"
                                >
                                    <X className="w-3.5 h-3.5 text-red-400 group-hover:text-white" />
                                    Clear All
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notification Feed */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 border-3 border-slate-50 border-t-cyan-500 rounded-full animate-spin"></div>
                            <p className="text-slate-400 mt-4 font-bold uppercase tracking-widest text-[9px]">Syncing</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-20 px-10 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-50 group">
                                <Bell className="w-8 h-8 text-slate-200 group-hover:rotate-12 transition-transform duration-500" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">Timeline Clear</h3>
                            <p className="text-slate-400 max-w-sm text-sm font-medium">
                                Everything is up to date. We'll alert you here as soon as there's news.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {notifications.map((notification, idx) => {
                                const isRead = notification.readBy?.includes(user?._id);
                                
                                return (
                                    <div 
                                        key={notification._id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`group relative overflow-hidden rounded-2xl p-4 md:p-5 cursor-pointer transition-all duration-400 ease-out transform hover:-translate-y-1 ${
                                            !isRead 
                                                ? 'bg-white shadow-[0_10px_30px_rgba(8,112,184,0.04)] border border-cyan-100/30' 
                                                : 'bg-white/60 hover:bg-white border border-transparent shadow-sm'
                                        }`}
                                        style={{ 
                                            animation: `slideUp 0.5s cubic-bezier(0.2,0.8,0.2,1) ${idx * 0.05}s both`
                                        }}
                                    >
                                        {!isRead && (
                                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-sky-500"></div>
                                        )}
                                        
                                        <div className="flex gap-4 md:gap-6 items-start relative">
                                            {/* Status Badge & Icon */}
                                            <div className="relative">
                                                <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                                    !isRead 
                                                        ? 'bg-cyan-50 border border-cyan-100' 
                                                        : 'bg-slate-50'
                                                }`}>
                                                    {React.cloneElement(getIconForType(notification.type), { className: "w-4.5 h-4.5" })}
                                                </div>
                                            </div>
                                            
                                            <div className="flex-grow">
                                                <div className="flex justify-between items-start gap-2 mb-1">
                                                    <div>
                                                      <h4 className={`text-base font-black leading-tight tracking-tight ${!isRead ? 'text-slate-900' : 'text-slate-500 group-hover:text-cyan-700 transition-colors'}`}>
                                                          {notification.title}
                                                      </h4>
                                                      <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400 flex items-center gap-1.5 pt-1">
                                                          {new Date(notification.createdAt).toLocaleDateString(undefined, {
                                                              month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                                          })}
                                                      </span>
                                                    </div>
                                                    
                                                    {!isRead && (
                                                      <button 
                                                          onClick={(e) => handleMarkAsRead(notification._id, e)}
                                                          className="text-[9px] font-black uppercase tracking-widest text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-100/50 hover:bg-cyan-100"
                                                      >
                                                          Mark Done
                                                      </button>
                                                    )}
                                                </div>
                                                
                                                <p className={`text-sm leading-relaxed font-medium ${!isRead ? 'text-slate-600' : 'text-slate-400'}`}>
                                                    {notification.message}
                                                </p>
                                            </div>
                                            
                                            {/* Desktop Navigation Link */}
                                            {(notification.type !== 'system' && notification.type !== 'general') && (
                                                <div className="hidden md:flex flex-shrink-0 items-center justify-center opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 self-center">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                        <ChevronRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </main>
            
            {/* Staggered Entrance Animations */}
            <style jsx>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default Notifications;
