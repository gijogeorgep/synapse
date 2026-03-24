import { useState } from "react";
import { Menu, X, LogIn, User as UserIcon, LogOut, Layout, ChevronDown } from "lucide-react";
import logo from "../../assets/synapse_logo.png";
import AuthModal from "../Shared/AuthModal";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState("login");

    const openAuthModal = (mode) => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
        setIsOpen(false);
    };

    const navItems = [
        { name: "Home", href: "/#home" },
        { name: "About Us", href: "/#about" },
        { name: "Programs", href: "/#programs" },
        {
            name: "Resources",
            isDropdown: true,
            children: [
                { name: "Study material", href: "/#materials" },
                { name: "Online test", href: "/#tests" }
            ]
        },
        { name: "Contact", href: "/#contact" },
        { name: "Blog", href: "/#blog" }
    ];

    const isDashboard = location.pathname.includes("/dashboard") ||
        location.pathname.includes("/student") ||
        location.pathname.includes("/teacher") ||
        location.pathname.includes("/admin");

    return (
        <>
            <header className="w-full fixed top-0 left-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/70 shadow-sm">
                <div className="max-w-7xl mx-auto h-20 md:h-22 flex items-center justify-between px-4 md:px-8 gap-4">
                    {/* Logo + Brand */}
                    <Link
                        to="/"
                        className="flex items-center gap-3 flex-shrink-0"
                    >
                        <img
                            src={logo}
                            alt="Synapse Logo"
                            className="h-14 md:h-16 w-auto object-contain"
                        />

                    </Link>

                    {/* Desktop Navigation – only on public/landing pages */}
                    {!isDashboard && (
                        <nav className="hidden md:flex items-center gap-2 lg:gap-4 bg-slate-50/80 px-3 py-1.5 rounded-full border border-slate-200/70">
                            {navItems.map((item) => (
                                item.isDropdown ? (
                                    <div key={item.name} className="relative group px-4 py-1.5 flex items-center">
                                        <button className="flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-cyan-700 transition-colors duration-200">
                                            {item.name}
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 py-2">
                                            {item.children.map((child) => (
                                                <a
                                                    key={child.name}
                                                    href={child.href}
                                                    className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
                                                >
                                                    {child.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className="relative px-4 py-1.5 text-sm font-semibold text-slate-700 hover:text-cyan-700 transition-colors duration-200 rounded-full group"
                                    >
                                        {item.name}
                                        <span className="pointer-events-none absolute left-4 right-4 -bottom-1 h-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-200" />
                                    </a>
                                )
                            ))}
                        </nav>
                    )}

                    {/* Dashboard indicator */}
                    {user && isDashboard && (
                        <div className="hidden md:flex items-center gap-2 bg-slate-50/90 px-3 py-1.5 rounded-full border border-slate-200">
                            <Layout className="w-4 h-4 text-cyan-600" />
                            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                {user?.role} Portal
                            </span>
                        </div>
                    )}

                    {/* Desktop Auth Area */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    to={!user?.role ? "/" : (user.role === "admin" || user.role === "superadmin" ? "/admin/dashboard" : `/${user.role}/dashboard`)}
                                    className="flex items-center gap-2 pr-4 pl-1.5 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-slate-800 font-semibold text-sm hover:bg-cyan-100 hover:border-cyan-200 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full overflow-hidden bg-cyan-600 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white">
                                        {user?.avatarUrl ? (
                                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            (user?.name || "U")[0].toUpperCase()
                                        )}
                                    </div>
                                    <span>{user.name}</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
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
                                    className="text-sm font-semibold text-slate-700 hover:text-cyan-700 transition-colors"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => openAuthModal("register")}
                                    className="px-5 py-2.5 rounded-full bg-cyan-600 text-white text-sm font-semibold shadow-md shadow-cyan-600/25 hover:bg-cyan-700 hover:shadow-cyan-600/40 transition-all"
                                >
                                    Enrol now
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-full bg-white shadow-sm border border-slate-200 text-slate-700 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                <nav
                    className={`md:hidden absolute top-full left-0 w-full bg-white/98 border-t border-slate-200 shadow-md px-5 pt-3 pb-6 space-y-3 transition-all duration-200 origin-top ${isOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"
                        }`}
                >
                    {!isDashboard && navItems.map((item) => (
                        item.isDropdown ? (
                            <div key={item.name} className="space-y-1">
                                <span className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700">
                                    {item.name}
                                </span>
                                <div className="pl-4 space-y-1 border-l-2 border-slate-100 ml-3 mt-1">
                                    {item.children.map((child) => (
                                        <a
                                            key={child.name}
                                            href={child.href}
                                            onClick={() => setIsOpen(false)}
                                            className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-colors"
                                        >
                                            {child.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <a
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
                            >
                                {item.name}
                            </a>
                        )
                    ))}

                    <div className="pt-3 mt-2 border-t border-slate-200 space-y-3">
                        {user ? (
                            <>
                                <Link
                                    to={!user?.role ? "/" : (user.role === "admin" || user.role === "superadmin" ? "/admin/dashboard" : `/${user.role}/dashboard`)}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-cyan-50 border border-cyan-100"
                                >
                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-cyan-600 flex items-center justify-center text-white text-xs font-bold border-2 border-white shadow-sm">
                                        {user?.avatarUrl ? (
                                            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                                        ) : (
                                            (user?.name || "U")[0].toUpperCase()
                                        )}
                                    </div>
                                    <span className="font-semibold text-slate-800 text-sm">
                                        {user.name}
                                    </span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-red-600 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => openAuthModal("login")}
                                    className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                    <LogIn className="w-4 h-4" />
                                    <span>Login</span>
                                </button>
                                <button
                                    onClick={() => openAuthModal("register")}
                                    className="w-full py-3 rounded-lg bg-cyan-600 text-white text-sm font-semibold shadow-md shadow-cyan-600/25 hover:bg-cyan-700 transition-colors"
                                >
                                    Enrol now
                                </button>
                            </>
                        )}
                    </div>
                </nav>

            </header>

            {/* Auth Modal moved outside header to fix stacking context/blur issues */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authMode}
            />
        </>
    );
};

export default Navbar;
