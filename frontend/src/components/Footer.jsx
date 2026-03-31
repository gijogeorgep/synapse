
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  ArrowUp
} from "lucide-react";
import ylogo from "../assets/synapse y logo.png";
import { scrollToHomeSection } from "../utils/scrollToHomeSection";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: "Home", sectionId: "home" },
    { label: "Programs", sectionId: "programs" },
    { label: "About", sectionId: "about" },
    { label: "Contact", sectionId: "contact" },
    { label: "Blog", href: "/blogs" }
  ];

  return (
    <footer className="w-full bg-[#0f172a] text-slate-300 pt-10 pb-4 mt-8 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-6 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-1 border-b lg:border-none border-slate-800 pb-6 lg:pb-0">
            <div className="flex items-center gap-3 mb-4 group cursor-pointer" onClick={scrollToTop}>
              <div className="p-1.5 bg-slate-800 rounded-xl group-hover:bg-cyan-600/20 transition-colors border border-slate-700/50 group-hover:border-cyan-500/30">
                <img className="w-10 h-10 object-contain" src={ylogo} alt="Synapse logo" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tighter text-white font-['Outfit'] italic">
                  SYNAPSE
                </h2>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                  Edu Hub
                </p>
              </div>
            </div>
            <p className="text-slate-400 text-[13px] leading-relaxed max-w-sm mb-6 font-medium">
              Elite mentorship and personalized learning for NEET, JEE & School excellence.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {[
                { icon: Facebook, href: "https://www.facebook.com/share/1KBy2iguoK/?mibextid=wwXIfr", color: "hover:bg-blue-600" },
                { icon: Instagram, href: "https://www.instagram.com/synapse_edu.hub?igsh=ZDNlZDc0MzIxNw==", color: "hover:bg-pink-600" },
                { icon: Linkedin, href: "https://www.linkedin.com/in/synapse-edu-hub-9b788b371?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", color: "hover:bg-blue-700" },
                { icon: Youtube, href: "https://youtube.com/@synapseeduhub?si=8elDU9OfBgXTOAvC", color: "hover:bg-red-600" }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700 text-slate-400 hover:text-white transition-all duration-300 hover:-translate-y-1 ${social.color}`}
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-8">
            <h3 className="text-white font-bold text-[11px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
              Explore
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  {item.sectionId ? (
                    <a
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToHomeSection(item.sectionId, navigate, location.pathname);
                      }}
                      className="text-slate-400 hover:text-cyan-400 transition-colors text-[13px] font-semibold flex items-center gap-2 group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-500 transition-all"></span>
                      {item.label}
                    </a>
                  ) : (
                    <a
                      href={item.href}
                      className="text-slate-400 hover:text-cyan-400 transition-colors text-[13px] font-semibold flex items-center gap-2 group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-cyan-500 transition-all"></span>
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-white font-bold text-[11px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
              Get in Touch
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">


              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Email</p>
                  <p className="text-[13px] text-slate-300 font-medium break-all">synapseeduhub@gmail.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-800/50 border border-slate-700 flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Call Us</p>
                  <p className="text-[13px] text-slate-300 font-medium">+91 62357 23263</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support / WhatsApp */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-[2rem] border border-slate-700/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <MessageCircle size={80} className="rotate-12" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2 relative z-10">Academic support?</h3>
            <p className="text-slate-400 text-[13px] mb-6 relative z-10 font-medium leading-relaxed">Immediate guidance from our counselors.</p>
            <a
              href="https://wa.me/918157930567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-[#25D366] text-white text-[13px] font-black uppercase tracking-wider hover:scale-[1.02] transition-all shadow-lg shadow-green-900/10 group/wa relative z-10"
            >
              <MessageCircle size={18} />
              <span>WhatsApp Now</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest order-2 md:order-1">
            © {new Date().getFullYear()} Synapse Edu Hub. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
