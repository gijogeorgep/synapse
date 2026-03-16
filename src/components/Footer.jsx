import React from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle,
} from "lucide-react";
import ylogo from "../assets/synapse y logo.png";
const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-200 pt-10 pb-6 mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand / About */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img className="w-16 h-16 object-contain drop-shadow-sm" src={ylogo} alt="Synapse logo" />
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-white">
                SYNAPSE
              </h2>
              <p className="text-[11px] uppercase tracking-[0.18em] text-cyan-200/80">
                Learning & Tuition Centre
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Academic coaching for school students with personalised attention, structured programs,
            and consistent mentoring to build strong foundations and exam confidence.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-white tracking-[0.16em] uppercase mb-4">
            Quick links
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#home" className="hover:text-cyan-300 transition-colors">
                Home
              </a>
            </li>
            <li>
              <a href="#programs" className="hover:text-cyan-300 transition-colors">
                Programs
              </a>
            </li>
            <li>
              <a href="#about" className="hover:text-cyan-300 transition-colors">
                About us
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-cyan-300 transition-colors">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-sm font-semibold text-white tracking-[0.16em] uppercase mb-4">
            Contact
          </h3>
          <p className="text-slate-400 text-sm">Kozhikode, Kerala, India</p>
          <p className="text-slate-400 text-sm mt-1">synapseeduhub@gmail.com</p>
          <p className="text-slate-400 text-sm mt-1">+91 62357 23263</p>
          <p className="text-slate-400 text-sm">+91 81579 30567</p>

          {/* Social Icons */}
          <div className="flex space-x-3 mt-4">
            <a
              href="https://www.facebook.com/share/1KBy2iguoK/?mibextid=wwXIfr"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-cyan-600 transition"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/synapse_edu.hub?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-cyan-600 transition"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/synapse-edu-hub-9b788b371?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-cyan-600 transition"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://youtube.com/@synapseeduhub?si=8elDU9OfBgXTOAvC"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-800 hover:bg-cyan-600 transition"
            >
              <Youtube className="w-5 h-5" />
            </a>
            <a
              href="https://wa.me/918157930567"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 transition"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-slate-800 mt-10 pt-4 text-center text-slate-500 text-xs flex flex-col md:flex-row justify-center items-center gap-2">
        <span>© {new Date().getFullYear()} Synapse Edu Hub. All rights reserved.</span>
        <span className="hidden md:inline">•</span>
        <a href="/admin-portal-auth" className="hover:text-cyan-400 transition-colors">Admin Portal</a>
      </div>
    </footer>
  );
};

export default Footer;
