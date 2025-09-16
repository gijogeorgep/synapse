import React from "react";
import synapse_y_logo from "../assets/synapse y logo.png"; // background logo
import amith from "../assets/amith.png"; // founder photo

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

              {/* New: Achievement badges */}
              {/* <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg z-20">
                <span className="text-xs font-semibold text-cyan-700">10+ Years Experience</span>
              </div> */}
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
              {/* <div className="flex justify-center gap-3">
                <button className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-cyan-500 hover:to-blue-600 rounded-xl flex items-center justify-center transition-all duration-300 group/icon shadow-md hover:shadow-lg transform hover:scale-110">
                  <svg className="w-6 h-6 text-gray-700 group-hover/icon:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </button>
                
                <button className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-500 hover:to-indigo-600 rounded-xl flex items-center justify-center transition-all duration-300 group/icon shadow-md hover:shadow-lg transform hover:scale-110">
                  <svg className="w-6 h-6 text-gray-700 group-hover/icon:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                
                <button className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-green-500 hover:to-emerald-600 rounded-xl flex items-center justify-center transition-all duration-300 group/icon shadow-md hover:shadow-lg transform hover:scale-110">
                  <svg className="w-6 h-6 text-gray-700 group-hover/icon:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.520.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                </button>
              </div> */}
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
              Transforming Education
              <br />
              <span className="relative">
                One Student at a Time
                <svg
                  className="absolute -bottom-3 left-0 w-full h-4"
                  viewBox="0 0 200 16"
                  fill="none"
                >
                  <path
                    d="M2 12c40-8 80-8 120 0s80 8 120 0"
                    stroke="url(#gradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#0891b2" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h2>
          </div>

          {/* Enhanced Description */}
          <div className="space-y-6 text-lg leading-relaxed">
            <p className="text-gray-700">
              At{" "}
              <span className="font-bold text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">
                Synapse Edu Hub
              </span>
              , we are committed to empowering students with high-quality
              education and personalized learning experiences. Our mission is to
              make learning{" "}
              <span className="font-semibold text-slate-800">
                accessible, engaging, and impactful
              </span>{" "}
              for every student.
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
