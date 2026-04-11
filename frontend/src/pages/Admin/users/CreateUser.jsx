import React, { useState } from "react";
import {
  UserPlus,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createAdminUser } from "../../../api/services";

// Fixed program list — each entry maps to an ID prefix
const PROGRAMS = [
  {
    id: "PrimeOne",
    label: "PrimeOne",
    id_prefix: "P",
    color: "violet",
    ezoneType: null,
  },
  {
    id: "Cluster",
    label: "Cluster",
    id_prefix: "C",
    color: "blue",
    ezoneType: null,
  },
  {
    id: "PlanB",
    label: "Plan B",
    id_prefix: "B",
    color: "amber",
    ezoneType: null,
  },
  {
    id: "Deep Roots",
    label: "Deep Roots",
    id_prefix: "D",
    color: "teal",
    ezoneType: null,
  },
  {
    id: "NEET",
    label: "E-Zone • NEET",
    id_prefix: "N",
    color: "emerald",
    ezoneType: "NEET",
  },
  {
    id: "JEE",
    label: "E-Zone • JEE",
    id_prefix: "J",
    color: "cyan",
    ezoneType: "JEE",
  },
  {
    id: "PSC",
    label: "E-Zone • PSC",
    id_prefix: "K",
    color: "rose",
    ezoneType: "PSC",
  },
];

const CreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    phoneNumber: "",
    className: "10", // the class number (8-12) for regular programs, or program name for E-Zone
    programType: "PrimeOne", // the program type (PrimeOne, Cluster, PlanB, Deep Roots, NEET, JEE, PSC)
    board: "State",
    uniqueId: "",
  });
  const [selectedProgram, setSelectedProgram] = useState(PROGRAMS[0]);
  const [selectedClass, setSelectedClass] = useState("10"); // Track selected class separately
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    phoneNumber: "",
  });

  // Available classes for non-E-Zone programs
  const CLASS_OPTIONS = ["4", "5", "6", "7", "8", "9", "10"];

  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};


  const validate = (name, value) => {
    let error = "";
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        error = "Please enter a valid email address";
      }
    } else if (name === "phoneNumber") {
      const phoneRegex = /^\d{10}$/;
      const cleanPhone = value.replace(/\s+/g, "");
      if (value && !phoneRegex.test(cleanPhone)) {
        error = "Phone number must be exactly 10 digits";
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
      const error = validate(name, numericValue);
      setValidationErrors((prev) => ({ ...prev, [name]: error }));
    } else {
      setFormData({ ...formData, [name]: value });
      const error = validate(name, value);
      setValidationErrors((prev) => ({ ...prev, [name]: error }));
    }
    if (status.message) setStatus({ type: "", message: "" });
  };

  const handleProgramSelect = (prog) => {
    setSelectedProgram(prog);

    // For E-Zone programs, set className to the program ID (NEET, JEE, PSC)
    // For regular programs, set className to a default class (10)
    const newClassName = prog.ezoneType ? prog.id : selectedClass;

    setFormData((prev) => ({
      ...prev,
      programType: prog.id, // Send the program ID for ID generation
      className: newClassName, // Send class number for regular programs or program name for E-Zone
      board: prog.ezoneType ? "Entrance/Exam" : prev.board,
    }));
  };

  const handleClassSelect = (classNum) => {
    setSelectedClass(classNum);
    setFormData((prev) => ({
      ...prev,
      className: classNum,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation check
    const emailError = validate("email", formData.email);
    const phoneError = validate("phoneNumber", formData.phoneNumber);

    if (emailError || phoneError) {
      setValidationErrors({
        email: emailError,
        phoneNumber: phoneError,
      });
      setStatus({
        type: "error",
        message: "Please fix the errors in the form",
      });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      // Send both className (the class number) and programType (for ID generation)
      const submissionData = {
        ...formData,
        // programType is already in formData, just ensure className is the actual class number
      };

      const data = await createAdminUser(submissionData);
      setStatus({ type: "success", message: "User created successfully!" });

      // Store generated credentials to show to admin
      if (data.uniqueId || data.password) {
        setGeneratedCredentials({
          uniqueId: data.uniqueId,
          password: data.password,
          name: data.name,
          email: data.email,
        });
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "student",
        phoneNumber: "",
        className: "10",
        programType: "PrimeOne",
        board: "State",
        uniqueId: "",
      });
      setSelectedProgram(PROGRAMS[0]);
      setSelectedClass("10");
      setValidationErrors({ email: "", phoneNumber: "" });

      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.message || error.message || "Error creating user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/users")}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
          >
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Create New User
            </h1>
            <p className="text-slate-500 mt-1">
              Register a new student, teacher, or admin into the system.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              User Information
            </h2>
          </div>

          {status.message && (
            <div
              className={`p-4 rounded-xl mb-8 flex items-start gap-3 animate-in fade-in duration-300 ${status.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              )}
              <p className="text-sm font-medium">{status.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium text-slate-900"
                    placeholder="Enter user's full name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${validationErrors.email ? "text-rose-400" : "text-slate-400"}`}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 transition-all font-medium ${validationErrors.email ? "border-rose-200 focus:ring-rose-500" : "border-slate-200 focus:ring-cyan-500"}`}
                    placeholder="email@example.com"
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-rose-500 text-xs mt-1 ml-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 ml-1">
                  User Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 transition-all font-medium text-slate-900 cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  {userInfo.role === "superadmin" && (
                    <option value="admin">Administrator</option>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 ml-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  maxLength={10}
                  className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl outline-none focus:ring-2 transition-all font-medium ${validationErrors.phoneNumber ? "border-rose-200 focus:ring-rose-500" : "border-slate-200 focus:ring-cyan-500"}`}
                  placeholder="Enter 10-digit mobile number"
                />
                {validationErrors.phoneNumber && (
                  <p className="text-rose-500 text-xs mt-1 ml-1">
                    {validationErrors.phoneNumber}
                  </p>
                )}
              </div>
            </div>

            {formData.role === "student" && (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                    Program
                  </h3>
                  <span className="text-xs font-mono font-bold text-cyan-600 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-md">
                    ID prefix: SS{selectedProgram.id_prefix}...
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PROGRAMS.map((prog) => (
                    <button
                      key={prog.id}
                      type="button"
                      onClick={() => handleProgramSelect(prog)}
                      className={`py-2.5 px-3 rounded-xl border-2 text-xs font-bold transition-all text-left ${
                        selectedProgram.id === prog.id
                          ? "border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {prog.label}
                    </button>
                  ))}
                </div>
                {!selectedProgram.ezoneType && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-500 ml-1">
                        Board
                      </label>
                      <select
                        name="board"
                        value={formData.board}
                        onChange={handleChange}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                      >
                        <option value="State">State Board</option>
                        <option value="CBSE">CBSE Board</option>
                        <option value="ICSE">ICSE Board</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-medium text-slate-500 ml-1">
                        Class
                      </label>
                      <select
                        value={selectedClass}
                        onChange={(e) => handleClassSelect(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500 font-medium"
                      >
                        {CLASS_OPTIONS.map((cls) => (
                          <option key={cls} value={cls}>
                            Class {cls}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !!validationErrors.email ||
                  !!validationErrors.phoneNumber
                }
                className="w-full flex items-center justify-center py-3 px-6 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    Create User Account <UserPlus className="w-5 h-5" />
                  </span>
                )}
              </button>
            </div>
          </form>

          {generatedCredentials && (
            <div className="mt-8 p-6 bg-slate-900 rounded-3xl text-white relative animate-in slide-in-from-bottom-6 duration-500">
              <button
                onClick={() => setGeneratedCredentials(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-500 rounded-xl text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-400">
                    Credentials Generated
                  </h3>
                  <p className="text-xs text-slate-400">
                    Share these details with the user
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Email / Username
                  </label>
                  <div className="font-mono text-lg font-bold text-white select-all">
                    {generatedCredentials.email}
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    User ID
                  </label>
                  <div className="font-mono text-lg font-bold text-white select-all">
                    {generatedCredentials.uniqueId}
                  </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Temporary Password
                  </label>
                  <div className="font-mono text-lg font-bold text-cyan-400 select-all">
                    {generatedCredentials.password}
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic border-t border-white/5 pt-4 mt-2">
                  * Please ensure the user keeps these credentials secure. The
                  password should be changed after first login.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateUser;
