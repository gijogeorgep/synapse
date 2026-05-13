
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  ArrowRight
} from "lucide-react";
import ylogo from "../assets/synapse_y_logo.png";
import { scrollToHomeSection } from "../utils/scrollToHomeSection";

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const quickLinks = [
    { label: "Home", sectionId: "home" },
    { label: "Programs", sectionId: "programs" },
    { label: "About", sectionId: "about" },
    { label: "Contact", sectionId: "contact" },
    { label: "Blog", href: "/blogs" }
  ];

  const socials = [
    { icon: Facebook, href: "https://www.facebook.com/share/1KBy2iguoK/?mibextid=wwXIfr" },
    { icon: Instagram, href: "https://www.instagram.com/synapse_edu.hub?igsh=ZDNlZDc0MzIxNw==" },
    { icon: Linkedin, href: "https://www.linkedin.com/in/synapse-edu-hub-9b788b371?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" },
    { icon: Youtube, href: "https://youtube.com/@synapseeduhub?si=8elDU9OfBgXTOAvC" }
  ];

  return (
    <footer className="w-full bg-[#030712] text-slate-400 py-12 mt-20 border-t border-slate-800/40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-6 pb-12">
          {/* Brand & Slogan */}
          <div className="max-w-sm">
            <div className="flex items-center gap-3 mb-6 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="p-2 bg-slate-900/50 rounded-xl border border-slate-800 group-hover:border-cyan-500/50 transition-all duration-500">
                <img className="w-8 h-8 object-contain" src={ylogo} alt="Synapse" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white font-['Outfit']">
                  Synapse <span className="text-cyan-500">Connect</span>
                </h2>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                  Focus. Learn. Excel.
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-500 font-medium">
              India's most focused learning ecosystem. We empower students with elite mentorship for NEET, JEE, and academic excellence.
            </p>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 lg:gap-24">
            <div>
              <h3 className="text-white text-[11px] font-bold uppercase tracking-[0.2em] mb-6">Platform</h3>
              <ul className="space-y-4">
                {quickLinks.map((item) => (
                  <li key={item.label}>
                    {item.sectionId ? (
                      <button
                        onClick={() => scrollToHomeSection(item.sectionId, navigate, location.pathname)}
                        className="hover:text-cyan-400 transition-colors text-[13px] font-semibold flex items-center gap-2 group"
                      >
                        {item.label}
                      </button>
                    ) : (
                      <a
                        href={item.href}
                        className="hover:text-cyan-400 transition-colors text-[13px] font-semibold flex items-center gap-2 group"
                      >
                        {item.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white text-[11px] font-bold uppercase tracking-[0.2em] mb-6">Contact</h3>
              <ul className="space-y-4">
                <li>
                  <a href="mailto:synapseeduhub@gmail.com" className="hover:text-cyan-400 transition-colors text-[13px] font-semibold flex items-center gap-3">
                    <Mail size={14} className="text-slate-600" />
                    <span>Email Us</span>
                  </a>
                </li>
                <li>
                  <a href="tel:+916235723263" className="hover:text-cyan-400 transition-colors text-[13px] font-semibold flex items-center gap-3">
                    <Phone size={14} className="text-slate-600" />
                    <span>Call Us</span>
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/918157930567" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:text-cyan-400 transition-colors text-[13px] font-bold flex items-center gap-2 group">
                    <span>WhatsApp</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="hidden sm:block">
              <h3 className="text-white text-[11px] font-bold uppercase tracking-[0.2em] mb-6">Social</h3>
              <div className="flex gap-4">
                {socials.map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-500 hover:text-white hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/40 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Synapse Connect. All rights reserved.
          </p>
          
          <div className="flex items-center gap-8">
            <a href="/terms-conditions" className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-cyan-400 transition-colors">Terms</a>
            <a href="/privacy-policy" className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-cyan-400 transition-colors">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
