import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/synapse_logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "#home" },
    { name: "About Us", href: "#about" },
    { name: "Programs", href: "#programs" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="w-full bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 backdrop-blur-sm shadow-lg border-b border-cyan-100 fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto h-24 flex items-center justify-between ">
        {/* Logo */}
        <a
          href="#home"
          className="flex-shrink-0 transition-transform hover:scale-105 duration-300"
        >
          <img
            src={logo}
            alt="Synapse Logo"
            className="h-28 md:h-36 w-auto object-contain drop-shadow-lg"
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 lg:space-x-12">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="relative text-slate-700 text-lg font-semibold hover:text-cyan-600 transition-all duration-300 group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 group-hover:w-full transition-all duration-300"></span>
            </a>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-md border border-cyan-100 text-slate-700 hover:text-cyan-600 hover:bg-cyan-50/80 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all duration-200"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="md:hidden bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 border-t border-cyan-100 shadow-md px-6 py-4 space-y-4">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)} // close menu on click
              className="block text-slate-700 text-lg font-semibold hover:text-cyan-600 transition-all duration-300"
            >
              {item.name}
            </a>
          ))}
        </nav>
      )}

      {/* Subtle bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent"></div>
    </header>
  );
};

export default Navbar;
