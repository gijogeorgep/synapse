import React from "react";
import { MapPin, BookOpen, Star } from "lucide-react";

const Crescent = () => {
  return (
    <section className="w-full bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-100 py-20 px-6 md:px-20 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-200 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-200 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-slate-200 rounded-full blur-lg"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Enhanced Heading */}
        <div className="mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-700 via-blue-700 to-cyan-800 bg-clip-text text-transparent mb-6 leading-tight">
            Crescent Study Centre – Powered by Synapse
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are proud to collaborate with{" "}
            <span className="font-semibold text-cyan-700">Crescent Study Centre, Mavoor</span>{" "}
            (Kozhikode, Kerala) – an offline tuition centre powered by Synapse.
          </p>
        </div>

        {/* Enhanced Programs Grid */}
        <div className="grid md:grid-cols-2 gap-8 text-left mb-16">
          <div className="group p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-cyan-100 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-cyan-800 mb-4">
              Programs Offered
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span className="text-lg">CBSE Classes 9 & 10</span>
              </li>
              <li className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span className="text-lg">Higher Secondary (State & CBSE)</span>
              </li>
            </ul>
          </div>

          <div className="group p-8 rounded-3xl bg-white/70 backdrop-blur-sm border border-cyan-100 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Star className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-cyan-800 mb-4">
              Why Crescent x Synapse?
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-lg">Expert guidance from skilled faculty</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-lg">Exclusive Synapse study materials & revision notes</span>
              </li>
              <li className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-lg">Personalized offline support + innovative learning</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Enhanced Location */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-cyan-100 shadow-lg">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <p className="text-xl font-semibold text-gray-800">
              Location: Crescent Study Centre, Mavoor, Kozhikode, Kerala
            </p>
          </div>

          {/* Enhanced Google Map */}
          <div className="w-full h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <iframe
              title="Crescent Study Centre Location"
              src="https://www.google.com/maps/embed?pb=!1m23!1m12!1m3!1d148918.48916134008!2d75.86807791418465!3d11.24065434603382!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m8!3e6!4m0!4m5!1s0x3ba645c5d46c52df%3A0xfcce108cd88d162e!2s7X63%2B35J%2C%20Mavoor%20-%20Calicut%20Rd%2C%20Mavoor%2C%20Kerala%20673661!3m2!1d11.2603672!2d75.95287669999999!5e0!3m2!1sen!2sin!4v1758369376986!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Crescent;