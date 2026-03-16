import { useState, useEffect } from "react";
import { Menu, X, LogIn, User as UserIcon, LogOut, ChevronDown, BookOpen, GraduationCap, Phone, Home } from "lucide-react";
import logo from "../assets/synapse_logo.png";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect and body scroll lock
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
    setIsOpen(false);
  };

  const navItems = [
    { name: "Home", href: "#home", icon: <Home className="w-4 h-4 mr-2" /> },
    { name: "About Us", href: "#about", icon: <BookOpen className="w-4 h-4 mr-2" /> },
    { name: "Programs", href: "#programs", icon: <GraduationCap className="w-4 h-4 mr-2" /> },
    { name: "Contact", href: "#contact", icon: <Phone className="w-4 h-4 mr-2" /> },
  ];

  return (
    <>
      <header
        className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-cyan-100/50 py-2"
          : "bg-transparent py-4"
          }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            className="flex-shrink-0 transition-transform hover:scale-105 duration-300 flex items-center gap-2"
          >
            <img
              src={logo}
              alt="Synapse Logo"
              className={`w-auto object-contain drop-shadow-sm transition-all duration-300 ${scrolled ? 'h-16 md:h-20' : 'h-20 md:h-24'}`}
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/50 shadow-sm">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="relative flex items-center px-4 py-2 text-slate-600 font-medium hover:text-cyan-700 hover:bg-cyan-50/80 rounded-full transition-all duration-300 group"
              >
                <span className="text-cyan-600/70 group-hover:text-cyan-600 transition-colors hidden lg:block">
                  {item.icon}
                </span>
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4 bg-white/60 backdrop-blur-sm px-2 py-1.5 rounded-full border border-slate-200/60 shadow-sm">
                <span className="flex items-center space-x-2 text-slate-700 font-medium px-4 py-1.5 bg-cyan-50 rounded-full border border-cyan-100">
                  <UserIcon className="w-4 h-4 text-cyan-600" />
                  <span>{user.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => openAuthModal("login")}
                  className="px-5 py-2.5 text-slate-700 font-semibold hover:text-cyan-700 transition-colors hover:bg-cyan-50 rounded-full"
                >
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Log in
                  </span>
                </button>
                <button
                  onClick={() => openAuthModal("register")}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-full shadow-lg shadow-cyan-600/20 hover:shadow-cyan-600/40 hover:-translate-y-0.5 transition-all duration-300"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-slate-200 text-slate-700 hover:text-cyan-600 hover:bg-cyan-50 transition-all duration-200"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </header>

      {/* Mobile Navigation Panel - Side Slide */}
      <div
        className={`md:hidden fixed inset-0 z-[100] transition-all duration-300 ${isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"}`}
      >
        {/* Backdrop Overlay */}
        <div
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-[6px] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setIsOpen(false)}
        />

        {/* Sidebar Content */}
        <div
          className={`absolute top-0 right-0 w-full max-w-[320px] h-screen bg-white shadow-2xl transition-transform duration-300 ease-in-out transform ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          <div className="flex flex-col h-full bg-gradient-to-b from-white to-cyan-50/30">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <img src={logo} alt="Logo" className="h-14 w-auto object-contain" />
              <button
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-full text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Sidebar Links */}
            <div className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center w-full px-4 py-3.5 text-slate-600 font-semibold hover:text-cyan-700 hover:bg-cyan-100/50 rounded-xl transition-all duration-200 group"
                >
                  <span className="mr-3 text-cyan-600/70 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  {item.name}
                </a>
              ))}

              <div className="pt-6 mt-6 space-y-4 border-t border-slate-100">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 px-4 py-4 bg-cyan-50/80 rounded-2xl border border-cyan-100/50">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-cyan-600">
                        <UserIcon className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium">Logged in as</span>
                        <span className="font-bold text-slate-800 truncate max-w-[150px]">{user.name}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-4 text-red-600 font-bold border border-red-100 rounded-2xl hover:bg-red-50 transition-all shadow-sm"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Log out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 pt-2">
                    <button
                      onClick={() => openAuthModal("login")}
                      className="w-full flex items-center justify-center space-x-2 py-4 text-slate-700 font-bold border-2 border-slate-100 rounded-2xl hover:bg-slate-50 hover:border-cyan-100 transition-all shadow-sm"
                    >
                      <LogIn className="w-5 h-5 flex-shrink-0" />
                      <span>Log in</span>
                    </button>
                    <button
                      onClick={() => openAuthModal("register")}
                      className="w-full py-4 bg-cyan-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transform hover:-translate-y-0.5 transition-all"
                    >
                      Create Account
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="px-6 py-6 bg-slate-50/50 border-t border-slate-100">
              <p className="text-center text-xs text-slate-400 font-medium italic">
                Advanced Learning Management System
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Navbar;
