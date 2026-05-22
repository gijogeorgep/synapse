import React, { useEffect, useState } from "react";
import {
  Briefcase,
  MapPin,
  ChevronRight,
  Sparkles,
  Layers
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getPublicVacancies } from "../api/services";
import toast from "react-hot-toast";

const Careers = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const res = await getPublicVacancies();
      if (res && Array.isArray(res)) {
        setVacancies(res);
      }
    } catch (error) {
      console.error("Error fetching vacancies:", error);
      toast.error("Failed to load active vacancies.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-['Plus_Jakarta_Sans',sans-serif] pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden bg-white">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-cyan-50/50 -skew-x-12 transform origin-top translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-bold uppercase tracking-widest">
              Careers
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[0.95] tracking-tighter">
              Build the Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">
                Personalized Learning
              </span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl">
              Join a dedicated ecosystem built on mentorship, individual attention, and
              unconditional support. Explore open vacancies or submit your CV to join us.
            </p>
          </div>
        </div>
      </section>

      {/* Main Section */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 mt-12 space-y-8">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Open Vacancies</h2>
          <p className="text-slate-500 mt-2">Browse our open roles and find your perfect fit.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
            <span className="text-slate-500 font-medium text-sm">Searching open positions...</span>
          </div>
        ) : vacancies.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-8 md:p-12 border border-slate-100 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto">
              <Briefcase className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">No Open Vacancies Currently</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                We don't have any formal job vacancies listed right now, but we are always looking for stellar talent to join our mentoring team!
              </p>
            </div>
            <Link
              to="/careers/apply"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              Submit Spontaneous Application
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {vacancies.map((vacancy) => (
              <div
                key={vacancy._id}
                className="group bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold uppercase tracking-wider">
                      {vacancy.type}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-100">
                      {vacancy.workMode || "Offline"}
                    </span>
                    {vacancy.classLevel && (
                      <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                        {vacancy.classLevel}
                      </span>
                    )}
                    {vacancy.location && vacancy.location !== "Online" && (
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <MapPin className="w-3.5 h-3.5" />
                        {vacancy.location}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-950 tracking-tight group-hover:text-cyan-700 transition-colors">
                    {vacancy.title}
                  </h3>
                  <p className="text-slate-600 text-sm font-medium line-clamp-2">
                    {vacancy.description}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {vacancy.requirements?.slice(0, 3).map((req, index) => (
                      <span
                        key={index}
                        className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 text-xs font-semibold"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Link
                    to={`/careers/job/${vacancy._id}`}
                    className="w-1/2 md:w-auto text-center px-5 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all duration-200"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => navigate(`/careers/job/${vacancy._id}`, { state: { scrollToForm: true } })}
                    className="w-1/2 md:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4">
                <Sparkles className="w-64 h-64 text-cyan-400" />
              </div>
              <div className="relative z-10 space-y-4 max-w-lg">
                <h3 className="text-xl font-black">Looking for something else?</h3>
                <p className="text-slate-300 text-sm">
                  If you don't find a role matching your exact experience, submit a spontaneous application. We review these regularly as new positions open up!
                </p>
                <Link
                  to="/careers/apply"
                  className="inline-flex items-center gap-2 text-cyan-400 font-bold text-sm hover:text-cyan-300 transition-colors"
                >
                  Send Spontaneous CV
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Careers;
