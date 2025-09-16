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
    <footer className="w-full bg-cyan-900 text-gray-200 py-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand / About */}
        <div>
          <img className="w-20 h-20" src={ylogo} alt="" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Synapse Edu Hub
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Empowering students with the right guidance and resources to achieve
            academic success. We believe in nurturing potential and shaping a
            brighter future.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#home" className="hover:text-white transition">
                Home
              </a>
            </li>
            <li>
              <a href="#programs" className="hover:text-white transition">
                Programs
              </a>
            </li>
            <li>
              <a href="#about" className="hover:text-white transition">
                About Us
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-white transition">
                Contact
              </a>
            </li>

            <li></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-bold text-white mb-4 ">Contact Us</h3>
          <p className="text-gray-400 text-sm">📍 Kozhikode, Kerala, India</p>
          <p className="text-gray-400 text-sm">📧 synapseeduhub@gmail.com</p>
          <p className="text-gray-400 text-sm">📞 +91 6235723263</p>
          <p className="text-gray-400 text-sm">📞 +91 8157930567</p>

          {/* Social Icons */}
          <div className="flex space-x-4 mt-4">
            <a
              href="#"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-700 hover:bg-cyan-600 transition"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/synapse_edu.hub?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-700 hover:bg-cyan-600 transition"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-700 hover:bg-cyan-600 transition"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://youtube.com/@synapseeduhub?si=8elDU9OfBgXTOAvC"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-700 hover:bg-cyan-600 transition"
            >
              <Youtube className="w-5 h-5" />
            </a>

            <a
              href="https://wa.me/81579 30567" // replace with your WhatsApp number
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center rounded-full bg-cyan-700 hover:bg-cyan-600 transition"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Synapse Edu Hub. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
