import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Upload,
  FileText,
  Send,
  Sparkles,
  Layers,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitCareerApplication } from "../api/services";
import toast from "react-hot-toast";
import SEO from "../components/Shared/SEO";

const SpontaneousApply = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    onlineExperience: "",
    offlineExperience: "",
    generalRole: "Tutor",
    subjects: [],
    languages: [],
    classLevels: [],
    coverLetter: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileName, setResumeFileName] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const validateField = (name, value) => {
    const raw = typeof value === "string" ? value : String(value ?? "");
    const trimmed = raw.trim();
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const normalized = trimmed.toLowerCase();
      if (!normalized) return "Email address is required.";
      if (!emailRegex.test(normalized)) return "Please enter a valid email address.";
    }
    if (name === "phoneNumber") {
      const clean = trimmed.replace(/[\s\-\(\)]/g, "");
      const phoneRegex = /^\+?\d{10,15}$/;
      if (!trimmed) return "Phone number is required.";
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

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!["email", "phoneNumber"].includes(name)) return;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const toggleMultiValue = (key, value) => {
    setFormData((prev) => {
      const current = Array.isArray(prev[key]) ? prev[key] : [];
      const exists = current.includes(value);
      return {
        ...prev,
        [key]: exists ? current.filter((v) => v !== value) : [...current, value],
      };
    });
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

    if (formData.generalRole === "Tutor") {
      const hasSubjects = Array.isArray(formData.subjects) && formData.subjects.length > 0;
      const hasLanguages = Array.isArray(formData.languages) && formData.languages.length > 0;
      const hasClassLevels = Array.isArray(formData.classLevels) && formData.classLevels.length > 0;
      if (!hasSubjects || !hasLanguages || !hasClassLevels) {
        toast.error("Please select at least 1 subject, 1 language, and 1 class level.");
        return;
      }
    }

    if (!resumeFile) {
      toast.error("Please upload your CV/Resume");
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      const normalizedEmail = String(formData.email || "").trim().toLowerCase();
      const normalizedPhone = String(formData.phoneNumber || "").trim();

      data.append("name", String(formData.name || "").trim());
      data.append("email", normalizedEmail);
      data.append("phoneNumber", normalizedPhone);
      data.append("onlineExperience", formData.onlineExperience);
      data.append("offlineExperience", formData.offlineExperience);
      data.append("coverLetter", formData.coverLetter);
      data.append("resume", resumeFile);
      data.append("generalRole", formData.generalRole);

      if (formData.generalRole === "Tutor") {
        data.append("subjects", JSON.stringify(formData.subjects || []));
        data.append("languages", JSON.stringify(formData.languages || []));
        data.append("classLevels", JSON.stringify(formData.classLevels || []));
      }

      await submitCareerApplication(data);
      toast.success("Spontaneous application submitted!");
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
      onlineExperience: "",
      offlineExperience: "",
      generalRole: "Tutor",
      subjects: [],
      languages: [],
      classLevels: [],
      coverLetter: "",
    });
    setResumeFile(null);
    setResumeFileName("");
    setSubmitted(false);
  };

  const generalRolesList = [
    "Tutor",
    "Academic Coordinator",
    "Content Developer",
    "Marketing Executive",
    "Operations Manager",
    "Counselor",
    "Other"
  ];

  const subjectOptions = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Science (General)",
    "English",
    "Malayalam",
    "Social Science",
    "Hindi",
    "Other",
  ];

  const languageOptions = [
    "English",
    "Malayalam",
    "Tamil",
    "Kannada",
    "Hindi",
    "Other",
  ];

  const classLevelOptions = [
    { value: "Class 1-5", label: "Class 1-5 (Primary)" },
    { value: "Class 6-8", label: "Class 6-8 (Middle School)" },
    { value: "Class 9-10", label: "Class 9-10 (High School)" },
    { value: "Plus One", label: "Plus One (+1)" },
    { value: "Plus Two", label: "Plus Two (+2)" },
    { value: "NEET", label: "NEET Coaching" },
    { value: "JEE", label: "JEE Coaching" },
    { value: "Degree", label: "Degree / UG" },
    { value: "All Levels", label: "All Levels" },
  ];

  const CheckboxPills = ({ label, hint, values, selectedValues, onToggle }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>
        {hint ? <span className="text-[11px] text-slate-400 font-semibold">{hint}</span> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => {
          const value = typeof v === "string" ? v : v.value;
          const display = typeof v === "string" ? v : v.label;
          const isActive = Array.isArray(selectedValues) && selectedValues.includes(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onToggle(value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                isActive
                  ? "bg-cyan-600 text-white border-transparent shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50"
              }`}
            >
              {display}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen font-['Plus_Jakarta_Sans',sans-serif] pb-24">
      <SEO
        title="Spontaneous Application | Join Synapse"
        description="Submit your CV and details to express interest in joining the Synapse team. We are always seeking talented educators, coordinators, and support staff."
        canonicalPath="/careers/apply"
      />

      {/* Top Banner / Hero */}
      <section className="relative bg-white border-b border-slate-100 overflow-hidden pt-12 pb-16">
        <div className="absolute top-0 right-0 w-1/4 h-full bg-cyan-50/40 -skew-x-12 transform origin-top translate-x-1/3" />
        <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
          
          {/* Back button */}
          <button
            onClick={() => navigate("/careers")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-bold transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Careers
          </button>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-black uppercase tracking-widest">
              General Submission
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Spontaneous Application
            </h1>
            <p className="text-slate-600 font-semibold text-sm max-w-2xl">
              Don't see an open vacancy that matches your skill set? Express your general interest below. 
              We actively check spontaneous CVs as new requirements arise!
            </p>
          </div>
        </div>
      </section>

      {/* Main Form Content */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 mt-12">
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-slate-100 shadow-xl max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center space-y-6 py-6"
              >
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">Application Received!</h3>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    We've registered your credentials. Thank you for taking the time to share your career objectives. 
                    Our operations team will coordinate with you if an opportunity matching your preferred role arises.
                  </p>
                </div>
                <div className="space-y-3 pt-4">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all w-full"
                  >
                    Submit Another Profile
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
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <div className="flex items-center gap-2 text-cyan-600 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-indigo-600">Join our team</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Candidate Profile details
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Please provide accurate contact details and experience to speed up the review.
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
                        onBlur={handleBlur}
                        autoComplete="email"
                        inputMode="email"
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
                        onBlur={handleBlur}
                        autoComplete="tel"
                        inputMode="tel"
                        pattern="^\\+?\\d[\\d\\s\\-\\(\\)]{9,20}$"
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Online Experience (Years)
                      </label>
                      <input
                        type="number"
                        name="onlineExperience"
                        required
                        min="0"
                        max="50"
                        value={formData.onlineExperience}
                        onChange={handleInputChange}
                        placeholder="e.g. 3"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-800 placeholder-slate-400 font-semibold text-sm transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Offline Experience (Years)
                      </label>
                      <input
                        type="number"
                        name="offlineExperience"
                        required
                        min="0"
                        max="50"
                        value={formData.offlineExperience}
                        onChange={handleInputChange}
                        placeholder="e.g. 2"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-800 placeholder-slate-400 font-semibold text-sm transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Preferred Role
                    </label>
                    <select
                      name="generalRole"
                      value={formData.generalRole}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-800 font-semibold text-sm transition-all outline-none bg-white"
                    >
                      {generalRolesList.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {formData.generalRole === "Tutor" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 gap-5"
                    >
                      <CheckboxPills
                        label="Subjects"
                        hint={formData.subjects?.length ? `${formData.subjects.length} selected` : "Select 1 or more"}
                        values={subjectOptions}
                        selectedValues={formData.subjects}
                        onToggle={(value) => toggleMultiValue("subjects", value)}
                      />

                      <CheckboxPills
                        label="Languages"
                        hint={formData.languages?.length ? `${formData.languages.length} selected` : "Select 1 or more"}
                        values={languageOptions}
                        selectedValues={formData.languages}
                        onToggle={(value) => toggleMultiValue("languages", value)}
                      />

                      <CheckboxPills
                        label="Class Levels"
                        hint={formData.classLevels?.length ? `${formData.classLevels.length} selected` : "Select 1 or more"}
                        values={classLevelOptions}
                        selectedValues={formData.classLevels}
                        onToggle={(value) => toggleMultiValue("classLevels", value)}
                      />
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Cover Letter / Message
                    </label>
                    <textarea
                      name="coverLetter"
                      rows="3"
                      value={formData.coverLetter}
                      onChange={handleInputChange}
                      placeholder="Briefly describe your areas of educational expertise and mentorship style..."
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
                        <span>Submit Spontaneous Application</span>
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default SpontaneousApply;
