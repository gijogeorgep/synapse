import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileText,
  Send,
  Sparkles,
  Layers,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPublicVacancyDetail, submitCareerApplication } from "../api/services";
import toast from "react-hot-toast";
import SEO from "../components/Shared/SEO";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [vacancy, setVacancy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    experience: "",
    coverLetter: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");
  
  const formRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchVacancyDetails();
  }, [id]);

  const fetchVacancyDetails = async () => {
    try {
      setLoading(true);
      const data = await getPublicVacancyDetail(id);
      if (data) {
        setVacancy(data);
        setError(null);
      } else {
        setError("Vacancy not found.");
      }
    } catch (err) {
      console.error("Error fetching vacancy detail:", err);
      setError(err?.message || "Failed to load job details.");
    } finally {
      setLoading(false);
    }
  };

  // Scroll to form if passed in location state
  useEffect(() => {
    if (vacancy && location.state?.scrollToForm) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [vacancy, location.state]);

  const validateField = (name, value) => {
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) return "Email address is required.";
      if (!emailRegex.test(value)) return "Please enter a valid email address.";
    }
    if (name === "phoneNumber") {
      const clean = value.replace(/[\s\-\(\)]/g, "");
      const phoneRegex = /^\+?\d{10,15}$/;
      if (!value) return "Phone number is required.";
      if (!phoneRegex.test(clean)) return "Enter a valid phone number (10–15 digits, e.g. +91 XXXXX XXXXX).";
    }
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error live as user corrects the field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Resume file size must be less than 5MB");
        return;
      }
      const allowedExtensions = /(\.pdf|\.doc|\.docx)$/i;
      if (!allowedExtensions.exec(file.name)) {
        toast.error("Only PDF and Word documents (.doc, .docx) are allowed");
        return;
      }
      setResumeFile(file);
      setResumeFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email and phone before submitting
    const emailError = validateField("email", formData.email);
    const phoneError = validateField("phoneNumber", formData.phoneNumber);
    if (emailError || phoneError) {
      setErrors({ email: emailError, phoneNumber: phoneError });
      toast.error("Please fix the errors in the form.");
      return;
    }

    if (!resumeFile) {
      toast.error("Please upload your CV/Resume");
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phoneNumber", formData.phoneNumber);
      data.append("experience", formData.experience);
      data.append("coverLetter", formData.coverLetter);
      data.append("resume", resumeFile);
      data.append("appliedVacancy", id);

      await submitCareerApplication(data);
      toast.success("Application submitted successfully!");
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err?.message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      experience: "",
      coverLetter: "",
    });
    setResumeFile(null);
    setResumeFileName("");
    setSubmitted(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading position details...</p>
        </div>
      </div>
    );
  }

  if (error || !vacancy) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <SEO title="Job Opening Not Found" description="The requested job vacancy is not active or could not be found." noindex />
        <div className="text-center space-y-4 max-w-md px-6">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Job Posting Inactive</h2>
          <p className="text-slate-500">
            This job posting has been filled, taken down, or doesn't exist. Click below to return to the active listings.
          </p>
          <button
            onClick={() => navigate("/careers")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Careers
          </button>
        </div>
      </div>
    );
  }

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: vacancy.title,
    description: vacancy.description,
    datePosted: vacancy.createdAt,
    employmentType: vacancy.type?.toUpperCase().replace("-", ""),
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: vacancy.location || "Mavoor, Calicut",
        addressRegion: "Kerala",
        addressCountry: "IN"
      }
    },
    hiringOrganization: {
      "@type": "Organization",
      name: "Synapse Edu Hub",
      sameAs: typeof window !== "undefined" ? window.location.origin : ""
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-['Plus_Jakarta_Sans',sans-serif] pb-24">
      <SEO
        title={`${vacancy.title} (${vacancy.type})`}
        description={`Apply for ${vacancy.title} at Synapse Edu Hub. ${vacancy.description.slice(0, 150)}...`}
        canonicalPath={`/careers/job/${id}`}
        structuredData={courseSchema}
      />

      {/* Top Banner / Hero */}
      <section className="relative bg-white border-b border-slate-100 overflow-hidden pt-12 pb-16">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-cyan-50/40 -skew-x-12 transform origin-top translate-x-1/3" />
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          
          {/* Back button */}
          <button
            onClick={() => navigate("/careers")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Careers
          </button>

          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3.5 py-1.5 rounded-full bg-cyan-50 text-cyan-700 text-xs font-black uppercase tracking-wider">
                {vacancy.type}
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider border border-emerald-100">
                {vacancy.workMode || "Offline"}
              </span>
              {vacancy.classLevel && (
                <span className="px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-wider border border-indigo-100">
                  {vacancy.classLevel}
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl">
              {vacancy.title}
            </h1>

            {vacancy.location && vacancy.location !== "Online" && (
              <div className="flex items-center gap-2 text-slate-500 font-semibold text-sm">
                <MapPin className="w-4 h-4 text-cyan-600" />
                <span>{vacancy.location}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Section */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Job Description & Details */}
        <div className="lg:col-span-7 space-y-10">
          
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Job Overview</h2>
            <p className="text-slate-600 leading-relaxed text-base font-medium whitespace-pre-line">
              {vacancy.description}
            </p>
          </div>

          {vacancy.requirements && vacancy.requirements.length > 0 && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Requirements & Expectations
              </h2>
              <ul className="space-y-4">
                {vacancy.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="p-1 rounded-full mt-1 bg-cyan-50 border border-cyan-100 text-cyan-600 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <span className="text-slate-700 text-base font-semibold leading-relaxed">
                      {req}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Synapse Value Proposition */}
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4">
              <Sparkles className="w-64 h-64 text-cyan-400" />
            </div>
            <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-black">Why join Synapse?</h3>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                At Synapse, we are building India's most focused, personalized academic ecosystem. 
                We place a huge emphasis on mentors who don't just teach, but provide unconditional 
                support and guidance to shape student career and character. You'll work with like-minded 
                passionate educators in a state-of-the-art visual setup.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Application Form */}
        <div ref={formRef} className="lg:col-span-5">
          <div className="sticky top-28">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[2rem] p-8 border border-emerald-100 shadow-xl text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Application Sent!</h3>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      Thank you for applying to the <strong>{vacancy.title}</strong> position. 
                      Our team will carefully review your credentials and reach out if you are shortlisted.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={resetForm}
                      className="px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all w-full"
                    >
                      Apply Again / Change Info
                    </button>
                    <Link
                      to="/careers"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all w-full"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back to Careers
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-xl space-y-6"
                >
                  <div>
                    <div className="flex items-center gap-2 text-cyan-600 mb-1">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-black uppercase tracking-widest">Apply Now</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      Submit Your Details
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">
                      Complete the details below to submit your profile for this vacancy.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-800 placeholder-slate-400 font-semibold text-sm transition-all outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          onBlur={(e) => setErrors((prev) => ({ ...prev, email: validateField("email", e.target.value) }))}
                          placeholder="john@example.com"
                          className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm transition-all outline-none text-slate-800 placeholder-slate-400 ${
                            errors.email
                              ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400 bg-rose-50/30"
                              : "border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                          }`}
                        />
                        {errors.email && (
                          <p className="text-rose-500 text-[11px] font-semibold flex items-center gap-1 mt-1">
                            <span>⚠</span> {errors.email}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          required
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          onBlur={(e) => setErrors((prev) => ({ ...prev, phoneNumber: validateField("phoneNumber", e.target.value) }))}
                          placeholder="+91 XXXXX XXXXX"
                          className={`w-full px-4 py-3 rounded-xl border font-semibold text-sm transition-all outline-none text-slate-800 placeholder-slate-400 ${
                            errors.phoneNumber
                              ? "border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-400 bg-rose-50/30"
                              : "border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                          }`}
                        />
                        {errors.phoneNumber && (
                          <p className="text-rose-500 text-[11px] font-semibold flex items-center gap-1 mt-1">
                            <span>⚠</span> {errors.phoneNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Experience (Years)
                      </label>
                      <input
                        type="number"
                        name="experience"
                        required
                        min="0"
                        max="50"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="e.g. 3"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-800 placeholder-slate-400 font-semibold text-sm transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Cover Letter / Message
                      </label>
                      <textarea
                        name="coverLetter"
                        rows="3"
                        value={formData.coverLetter}
                        onChange={handleInputChange}
                        placeholder="Tell us why you are a great fit for this position..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-800 placeholder-slate-400 font-semibold text-sm transition-all outline-none resize-none"
                      ></textarea>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Resume / CV (PDF, DOC, DOCX up to 5MB)
                      </label>
                      <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-cyan-500 transition-colors flex flex-col items-center justify-center bg-slate-50/50">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <Upload className="w-8 h-8 text-slate-400 mb-2" />
                        {resumeFileName ? (
                          <div className="flex items-center gap-2 text-cyan-700 font-bold text-sm">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate max-w-[200px]">{resumeFileName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs font-bold">
                            Click or Drag file to upload
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Application</span>
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JobDetail;
