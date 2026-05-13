import { useState, useEffect } from "react";
import { Menu, X, LogIn, LogOut, Layout, ChevronDown, Bell, Download } from "lucide-react";

import logo from "../../assets/synapse_logo.png";
import AuthModal from "../Shared/AuthModal";
import LogoutConfirmModal from "../Shared/LogoutConfirmModal";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { scrollToHomeSection } from "../../utils/scrollToHomeSection";

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState("login");
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [installPrompt, setInstallPrompt] = useState(null);

    const isAdminUser = ["admin", "superadmin"].includes(user?.role);
    const isAdminRoute = location.pathname.startsWith("/admin");
    const logoTarget = isAdminUser && isAdminRoute ? "/admin/dashboard" : "/";

    useEffect(() => {
        if (user) {
            import("../../api/services").then(({ getNotifications }) => {
                getNotifications().then(res => {
                    if(res && Array.isArray(res)){
                        const unread = res.filter(n => !n.readBy.includes(user._id)).length;
                        setUnreadCount(unread);
                    }
                }).catch(console.error);
            });
        }
    }, [user]);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstallClick = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstallPrompt(null);
        }
    };


    const handleLogoutConfirm = () => {
        setShowLogoutModal(false);
        setIsOpen(false);
        logout();
    };

    const openAuthModal = (mode) => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
        setIsOpen(false);
    };

    const navItems = [
        { name: "Home", sectionId: "home" },
        { name: "About Us", sectionId: "about" },
        { name: "Programs", sectionId: "programs" },

        { name: "Contact", sectionId: "contact" },
        { name: "Blog", href: "/blogs" }
    ];

    const isDashboard = location.pathname.includes("/dashboard") ||
        location.pathname.includes("/student") ||
        location.pathname.includes("/teacher") ||
        location.pathname.includes("/admin");

    return (
        <>
            <header className="fixed top-0 left-0 z-50 w-full">
                <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-cyan-100/35 via-white/10 to-transparent blur-2xl" />
                <div className="relative h-20 w-full border-b border-white/35 bg-white/14 px-4 shadow-[0_18px_60px_rgba(14,116,144,0.16)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/12 md:h-24 md:px-8">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,255,255,0.14)_42%,rgba(14,165,233,0.08)_100%)]" />
                    <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-white/70" />
                    <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 overflow-visible">
                    {/* Logo + Brand */}
                    <Link
                        to={logoTarget}
                        onClick={() => setIsOpen(false)}
                        className="relative z-10 flex flex-shrink-0 items-center gap-3"
                    >
                        <img
                            src={logo}
                            alt="Synapse Logo"
                            className="h-32 md:h-40 w-auto object-contain"
                        />

                    </Link>

                    {/* Desktop Navigation – only on public/landing pages */}
                    {!isDashboard && (
                        <nav className="relative z-10 hidden items-center gap-2 rounded-full border border-white/35 bg-white/12 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.38)] backdrop-blur-xl md:flex lg:gap-4">
                            {navItems.map((item) => (
                                item.isDropdown ? (
                                    <div key={item.name} className="relative group flex items-center px-2 py-1.5">
                                        <button className="flex items-center gap-1 rounded-full border border-transparent px-3 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-white/45 hover:bg-white/22 hover:text-cyan-800">
                                            {item.name}
                                            <ChevronDown className="h-4 w-4" />
                                        </button>
                                        <div className="absolute left-1/2 top-full z-50 mt-3 w-52 -translate-x-1/2 rounded-2xl border border-white/45 bg-white/48 py-2 shadow-[0_20px_55px_rgba(15,23,42,0.16)] opacity-0 invisible backdrop-blur-2xl transition-all duration-300 translate-y-2 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                                            {item.children.map((child) => (
                                                <a
                                                    key={child.name}
                                                    href="/"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        scrollToHomeSection(child.sectionId, navigate, location.pathname);
                                                    }}
                                                    className="mx-2 block rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-white/50 hover:text-cyan-800"
                                                >
                                                    {child.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    item.sectionId ? (
                                        <a
                                            key={item.name}
                                            href="/"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                scrollToHomeSection(item.sectionId, navigate, location.pathname);
                                            }}
                                            className="group relative rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-white/45 hover:bg-white/18 hover:text-cyan-800"
                                        >
                                            {item.name}
                                            <span className="pointer-events-none absolute inset-x-4 bottom-1 h-px rounded-full bg-gradient-to-r from-cyan-400/0 via-cyan-500 to-sky-400/0 scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100" />
                                        </a>
                                    ) : (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className="group relative rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-white/45 hover:bg-white/18 hover:text-cyan-800"
                                        >
                                            {item.name}
                                            <span className="pointer-events-none absolute inset-x-4 bottom-1 h-px rounded-full bg-gradient-to-r from-cyan-400/0 via-cyan-500 to-sky-400/0 scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100" />
                                        </Link>
                                    )
                                )
                            ))}
                        </nav>
                    )}

                    {/* Dashboard indicator - Hide for Admins/Superadmins in portal */}
                    {user && isDashboard && !isAdminUser && (
                        <div className="relative z-10 hidden items-center gap-2 rounded-full border border-white/40 bg-white/16 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl md:flex">
                            <Layout className="w-4 h-4 text-cyan-600" />
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                {user?.role} Portal
                            </span>
                        </div>
                    )}

                    {/* Desktop Auth Area */}
                    <div className="relative z-10 hidden items-center gap-4 md:flex">
                        {installPrompt && (
                            <button
                                onClick={handleInstallClick}
                                className="flex items-center gap-2 rounded-full border border-cyan-200/60 bg-cyan-50/50 px-4 py-2 text-sm font-semibold text-cyan-700 shadow-sm transition-all duration-300 hover:bg-cyan-100/60"
                            >
                                <Download className="w-4 h-4" />
                                <span>Install App</span>
                            </button>
                        )}

                        {/* Admin Minimal Portal View */}
                        {user && isAdminUser && isDashboard ? (
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-black text-slate-800 tracking-tight leading-none uppercase">
                                        {user.role === 'superadmin' ? 'Amith Girish' : user.name}
                                    </span>
                                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mt-1">
                                        {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowLogoutModal(true)}
                                    className="flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-red-200/70 hover:bg-red-50/60 hover:text-red-600"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                                <Link to="/notifications" className="relative rounded-full border border-white/35 bg-white/16 p-2.5 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-200/70 hover:bg-cyan-50/60 hover:text-cyan-700">
                                    <Bell className="w-5 h-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 flex items-center justify-center text-[8px] font-bold text-white"></span>
                                    )}
                                </Link>
                            </div>
                        ) : (
                            <>
                                {user && (
                                    <Link to="/notifications" className="relative rounded-full border border-white/35 bg-white/16 p-2.5 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-200/70 hover:bg-cyan-50/60 hover:text-cyan-700">
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 flex items-center justify-center text-[8px] font-bold text-white"></span>
                                        )}
                                    </Link>
                                )}
                                {user ? (
                                    <div className="flex items-center gap-3">
                                        {isAdminUser ? (
                                            <Link
                                                to="/admin/dashboard"
                                                className="rounded-full border border-cyan-200/60 bg-white/20 px-4 py-2 text-sm font-semibold text-cyan-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-300 hover:bg-white/30"
                                            >
                                                Admin Portal
                                            </Link>
                                        ) : (
                                            <Link
                                                to={!user?.role ? "/" : `/${user.role}/dashboard`}
                                                className="flex items-center gap-2 rounded-full border border-white/40 bg-white/18 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-200/70 hover:bg-white/28"
                                            >
                                                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-white/80 bg-gradient-to-br from-cyan-500 to-sky-600 text-[10px] font-bold text-white shadow-lg shadow-cyan-500/20">
                                                    {user?.avatarUrl ? (
                                                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.role === 'superadmin' ? 'A' : (user?.name || "U")[0].toUpperCase()
                                                    )}
                                                </div>
                                                <span>{user.role === 'superadmin' ? 'Amith Girish' : user.name}</span>
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => setShowLogoutModal(true)}
                                            className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold text-slate-600 transition-all duration-300 hover:border-red-200/70 hover:bg-red-50/60 hover:text-red-600"
                                            title="Logout"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => openAuthModal("login")}
                                            className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-300 hover:border-cyan-200/70 hover:bg-white/22 hover:text-cyan-800"
                                        >
                                            Login
                                        </button>
                                        <button
                                            onClick={() => openAuthModal("register")}
                                            className="rounded-full border border-cyan-200/60 bg-gradient-to-r from-cyan-500/95 to-sky-500/95 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(14,165,233,0.28)] transition-all duration-300 hover:from-cyan-600 hover:to-sky-600 hover:shadow-[0_18px_34px_rgba(14,165,233,0.34)]"
                                        >
                                            Enrol now
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button + Install Icon */}
                    <div className="flex items-center gap-2 md:hidden">
                        {installPrompt && (
                            <button
                                onClick={handleInstallClick}
                                className="relative z-10 rounded-full border border-cyan-200/40 bg-cyan-50/50 p-2.5 text-cyan-700 shadow-sm transition-all duration-300"
                                title="Install App"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            className="relative z-10 rounded-full border border-white/35 bg-white/18 p-2.5 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl transition-all duration-300 hover:bg-white/28 hover:text-cyan-800"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={`fixed inset-0 z-40 md:hidden ${isOpen ? "" : "pointer-events-none"}`}>
                    <button
                        aria-label="Close mobile menu"
                        className={`absolute inset-0 bg-slate-950/30 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
                        onClick={() => setIsOpen(false)}
                    />
                    <nav
                        className={`absolute left-0 top-0 flex h-screen w-[86vw] max-w-sm flex-col overflow-y-auto border-r border-white/35 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.28))] px-5 pb-8 pt-6 shadow-[18px_0_60px_rgba(15,23,42,0.22)] backdrop-blur-2xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <div className="rounded-full border border-white/40 bg-white/18 px-4 py-2 text-xs font-bold uppercase tracking-[0.32em] text-cyan-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                                Menu
                            </div>
                            <button
                                className="rounded-full border border-white/35 bg-white/18 p-2.5 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-300 hover:bg-white/28 hover:text-cyan-800"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>




                        {!isDashboard && navItems.map((item) => (
                            item.isDropdown ? (
                                <div key={item.name} className="mb-3 space-y-2">
                                    <span className="block rounded-2xl border border-white/25 bg-white/14 px-3 py-2.5 text-sm font-semibold text-slate-700">
                                        {item.name}
                                    </span>
                                    <div className="ml-3 space-y-2 border-l-2 border-cyan-200/40 pl-4">
                                        {item.children.map((child) => (
                                            <a
                                                key={child.name}
                                                href="/"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setIsOpen(false);
                                                    scrollToHomeSection(child.sectionId, navigate, location.pathname);
                                                }}
                                                className="block rounded-2xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-white/34 hover:text-cyan-800"
                                            >
                                                {child.name}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                item.sectionId ? (
                                    <a
                                        key={item.name}
                                        href="/"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsOpen(false);
                                            scrollToHomeSection(item.sectionId, navigate, location.pathname);
                                        }}
                                        className="mb-3 block rounded-2xl border border-transparent px-3 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-white/30 hover:bg-white/26 hover:text-cyan-800"
                                    >
                                        {item.name}
                                    </a>
                                ) : (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="mb-3 block rounded-2xl border border-transparent px-3 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-white/30 hover:bg-white/26 hover:text-cyan-800"
                                    >
                                        {item.name}
                                    </Link>
                                )
                            )
                        ))}

                        <div className="mt-auto space-y-3 border-t border-white/35 pt-5">
                            {user && isAdminUser && isDashboard ? (
                                <>
                                    <div className="rounded-2xl border border-white/30 bg-white/16 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                                        <div className="text-xs font-black uppercase tracking-widest text-slate-800">
                                            {user.role === "superadmin" ? "Amith Girish" : user.name}
                                        </div>
                                        <div className="mt-0.5 text-[9px] font-black uppercase tracking-widest text-cyan-600">
                                            {user.role === "superadmin" ? "Super Admin" : "Admin"}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowLogoutModal(true)}
                                        className="flex w-full items-center gap-3 rounded-2xl border border-red-200/50 bg-red-50/45 px-3 py-2.5 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-50/70"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span>Logout</span>
                                    </button>
                                    <Link
                                        to="/notifications"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 rounded-2xl border border-white/30 bg-white/16 px-3 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-white/26"
                                    >
                                        <div className="relative">
                                            <Bell className="h-5 w-5 text-slate-500" />
                                            {unreadCount > 0 && (
                                                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500"></span>
                                            )}
                                        </div>
                                        <span>Notifications</span>
                                        {unreadCount > 0 && (
                                            <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                </>
                            ) : (
                                <>
                                    {user && (
                                        <Link
                                            to="/notifications"
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center gap-3 rounded-2xl border border-white/30 bg-white/16 px-3 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:bg-white/26"
                                        >
                                            <div className="relative">
                                                <Bell className="h-5 w-5 text-slate-500" />
                                                {unreadCount > 0 && (
                                                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500"></span>
                                                )}
                                            </div>
                                            <span>Notifications</span>
                                            {unreadCount > 0 && (
                                                <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                                                    {unreadCount} new
                                                </span>
                                            )}
                                        </Link>
                                    )}
                                    {user ? (
                                        <>
                                            {isAdminUser ? (
                                                <Link
                                                    to="/admin/dashboard"
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center justify-center rounded-2xl border border-cyan-200/60 bg-white/18 px-3 py-3 text-sm font-semibold text-cyan-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                                                >
                                                    Admin Portal
                                                </Link>
                                            ) : (
                                                <Link
                                                    to={!user?.role ? "/" : `/${user.role}/dashboard`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-3 rounded-2xl border border-white/35 bg-white/18 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                                                >
                                                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border-2 border-white/80 bg-gradient-to-br from-cyan-500 to-sky-600 text-xs font-bold text-white shadow-lg shadow-cyan-500/20">
                                                        {user?.avatarUrl ? (
                                                            <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            (user?.name || "U")[0].toUpperCase()
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-800">
                                                        {user.name}
                                                    </span>
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => setShowLogoutModal(true)}
                                                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200/50 bg-red-50/45 py-3 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-50/70"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Logout</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => openAuthModal("login")}
                                                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/35 bg-white/18 py-3 text-sm font-semibold text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-all duration-200 hover:bg-white/26"
                                            >
                                                <LogIn className="h-4 w-4" />
                                                <span>Login</span>
                                            </button>
                                            <button
                                                onClick={() => openAuthModal("register")}
                                                className="w-full rounded-2xl border border-cyan-200/60 bg-gradient-to-r from-cyan-500/95 to-sky-500/95 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(14,165,233,0.28)] transition-all duration-300 hover:from-cyan-600 hover:to-sky-600"
                                            >
                                                Enrol now
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </nav>
                </div>

            </header>

            {/* Auth Modal moved outside header to fix stacking context/blur issues */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />
            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onConfirm={handleLogoutConfirm}
                onCancel={() => setShowLogoutModal(false)}
            />
        </>
    );
};

export default Navbar;
