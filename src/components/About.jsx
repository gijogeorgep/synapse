import React from "react";
import synapse_y_logo from "../assets/synapse y logo.png"; // background logo
import amith from "../assets/amith.jpg"; // founder photo
import { Facebook, Phone, Instagram } from "lucide-react";

const About = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6 py-20 bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Background Logo */}
        <img
          src={synapse_y_logo}
          alt="Background Logo"
          className="absolute inset-0 m-auto w-full h-full max-w-none max-h-none opacity-5 object-contain select-none pointer-events-none"
        />

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-lg animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center gap-16 relative z-10">
        {/* Enhanced Founder Card */}
        <div className="flex-1 flex justify-center">
          <div className="group relative bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl hover:shadow-3xl w-full max-w-md overflow-hidden transition-all duration-500 hover:scale-[1.02] border border-white/50">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/60 via-transparent to-blue-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Image Section */}
            <div className="relative h-80 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10"></div>
              <img
                src={amith}
                alt="Amith Girish - Founder & CEO"
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
              />
            </div>

            {/* Enhanced Content Section */}
            <div className="relative z-20 p-8 bg-white/95 backdrop-blur-sm">
              {/* Name and Title */}
              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-cyan-700 to-blue-600 bg-clip-text text-transparent mb-3 leading-tight">
                  Amith Girish
                </h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent flex-1"></div>
                  <p className="text-gray-600 text-lg font-semibold px-4">
                    Founder & CEO
                  </p>
                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent flex-1"></div>
                </div>
              </div>

              {/* Enhanced company badge */}
              <div className="text-center mb-6">
                <span className=" text-xl relative z-10">Synapse Edu Hub</span>
              </div>

              {/* Enhanced quote */}
              <div className="text-center mb-6 relative">
                <svg
                  className="w-8 h-8 text-cyan-200 absolute -top-2 -left-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
                </svg>
                <p className="text-gray-600 text-lg italic leading-relaxed font-medium relative z-10">
                  "Empowering minds through innovative education solutions and
                  personalized learning experiences"
                </p>
              </div>

              {/* Enhanced social links */}
              <div className="flex justify-center gap-3">
                {/* Facebook */}
                <button
                  onClick={() =>
                    window.open(
                      "https://www.facebook.com/share/18RBjNLHAa/ ",
                      "_blank"
                    )
                  }
                  className="w-10 h-10 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-cyan-500 hover:to-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                >
                  <Facebook className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300" />
                </button>

                {/* Call */}
                <a
                  href="tel:+9162357 23263"
                  className="w-10 h-10 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-green-500 hover:to-emerald-600 rounded-xl flex items-center justify-center transition-all duration-300 group/icon shadow-md hover:shadow-lg transform hover:scale-110"
                >
                  <Phone className="w-4 h-6 text-gray-700 group-hover/icon:text-white transition-colors duration-300" />
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/amithgirish_?igsh=eW90NTJxeGJ6Mmto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-pink-500 hover:to-purple-600 rounded-xl flex items-center justify-center transition-all duration-300 group/icon shadow-md hover:shadow-lg transform hover:scale-110"
                >
                  <Instagram className="w-6 h-6 text-gray-700 group-hover/icon:text-white transition-colors duration-300" />
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/62357 23263" // Replace with your WhatsApp number
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-green-400 hover:to-green-600 rounded-xl flex items-center justify-center transition-all duration-300 group/icon shadow-md hover:shadow-lg transform hover:scale-110"
                >
                  
                  <img
                    width="28"
                    height="28"
                    src="https://img.icons8.com/color/48/whatsapp--v1.png"
                    alt="whatsapp--v1"
                  />
                </a>
              </div>
            </div>

            {/* Enhanced bottom accent */}
            <div className="h-2 bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Right Side - About Text */}
        <div className="flex-1 text-center lg:text-left space-y-8">
          {/* Enhanced Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-cyan-100/80 backdrop-blur-sm text-cyan-800 px-5 py-2 rounded-full text-sm font-semibold shadow-md">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
              Learn About Us
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-cyan-700 to-blue-700 bg-clip-text text-transparent leading-tight">
              SYNAPSE Speaks You
              <br />
            </h2>
          </div>

          {/* Enhanced Description */}
          <div className="space-y-6 text-lg leading-relaxed">
            <p className="text-gray-700">
              At{" "}
              <span className="font-bold text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">
                Synapse Edu Hub
              </span>
              , we believe learning is most effective when it speaks your way.
              That’s why we connect students with expert faculty who teach in
              their own regional language — Malayalam, Hindi, Tamil, Telugu, or
              English. Because education isn’t just about subjects, it’s about
              understanding you{" "}
            </p>

            <p className="text-gray-600">
              With a dedicated team of experienced educators, we provide
              innovative programs tailored to individual learning needs,
              ensuring academic excellence and confidence building through
              proven methodologies.
            </p>
          </div>

          {/* Enhanced Highlight Points */}
          <div className="space-y-5">
            <div className="group flex items-center gap-4 bg-white/60 backdrop-blur-sm p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="text-slate-800 font-semibold text-lg">
                Personalized Learning Approach
              </span>
            </div>

            <div className="group flex items-center gap-4 bg-white/60 backdrop-blur-sm p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-slate-800 font-semibold text-lg">
                Experienced & Passionate Educators
              </span>
            </div>

            <div className="group flex items-center gap-4 bg-white/60 backdrop-blur-sm p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-cyan-100/50">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-slate-800 font-semibold text-lg">
                Programs for Academic Excellence
              </span>
            </div>
          </div>

          {/* New: Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            {/* <button className="group relative overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <span className="relative z-10">Explore Our Programs</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button> */}

            {/* <button className="group border-2 border-cyan-600 text-cyan-700 hover:bg-cyan-600 hover:text-white font-bold px-8 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl">
              <span>Contact Us Today</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
