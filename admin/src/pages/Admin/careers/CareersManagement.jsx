import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Briefcase,
  PlusCircle,
  Trash2,
  Edit,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  ExternalLink,
  FileText,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  Award,
  Filter,
  Check,
  Layers,
  Sparkles,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import {
  getAdminVacancies,
  createVacancy,
  updateVacancy,
  deleteVacancy,
  getApplications,
  updateApplicationStatus,
  deleteApplication
} from "../../../api/services";

const CareersManagement = () => {
  const [activeTab, setActiveTab] = useState("vacancies"); // "vacancies" or "applications"
  const [vacancies, setVacancies] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Vacancy Form Modal State
  const [isVacancyModalOpen, setIsVacancyModalOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState(null); // null for create, vacancy object for edit
  const [vacancyFormData, setVacancyFormData] = useState({
    title: "",
    role: "Teacher",
    description: "",
    requirements: "", // Comma-separated or new-line input, will split to array
    location: "Mavoor, Calicut",
    type: "Full-time",
    workMode: "Offline",
    classLevel: "",
    isActive: true,
  });

  const isTeachingRole = ["Tutor", "Teacher", "Faculty"].includes(vacancyFormData.role);
  const needsLocation = ["Offline", "Hybrid"].includes(vacancyFormData.workMode);

  // Application Detail Modal State
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === "vacancies") {
        const data = await getAdminVacancies();
        setVacancies(Array.isArray(data) ? data : []);
      } else {
        const data = await getApplications();
        setApplications(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error);
      toast.error(`Failed to load ${activeTab}.`);
    } finally {
      setLoading(false);
    }
  };

  // Vacancy Handlers
  const handleVacancyInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVacancyFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openAddVacancyModal = () => {
    setEditingVacancy(null);
    setVacancyFormData({
      title: "",
      role: "Teacher",
      description: "",
      requirements: "",
      location: "Mavoor, Calicut",
      type: "Full-time",
      workMode: "Offline",
      classLevel: "",
      isActive: true,
    });
    setIsVacancyModalOpen(true);
  };

  const openEditVacancyModal = (vacancy) => {
    setEditingVacancy(vacancy);
    setVacancyFormData({
      title: vacancy.title || "",
      role: vacancy.role || "Teacher",
      description: vacancy.description || "",
      requirements: Array.isArray(vacancy.requirements) ? vacancy.requirements.join("\n") : vacancy.requirements || "",
      location: vacancy.location || "Mavoor, Calicut",
      type: vacancy.type || "Full-time",
      workMode: vacancy.workMode || "Offline",
      classLevel: vacancy.classLevel || "",
      isActive: vacancy.isActive !== undefined ? vacancy.isActive : true,
    });
    setIsVacancyModalOpen(true);
  };

  const handleVacancySubmit = async (e) => {
    e.preventDefault();
    const loadId = toast.loading(editingVacancy ? "Updating vacancy..." : "Posting vacancy...");
    try {
      // Clean and split requirements
      const requirementsArray = vacancyFormData.requirements
        .split("\n")
        .map((r) => r.trim())
        .filter((r) => r.length > 0);

      const payload = {
        ...vacancyFormData,
        requirements: requirementsArray,
      };

      if (!needsLocation) {
        payload.location = "Online";
      }

      if (editingVacancy) {
        await updateVacancy(editingVacancy._id, payload);
        toast.success("Vacancy updated successfully!", { id: loadId });
      } else {
        await createVacancy(payload);
        toast.success("Vacancy posted successfully!", { id: loadId });
      }

      setIsVacancyModalOpen(false);
      fetchData();
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Operation failed.";
      toast.error(msg, { id: loadId });
    }
  };

  const handleToggleVacancyActive = async (vacancy) => {
    const loadId = toast.loading("Updating vacancy status...");
    try {
      await updateVacancy(vacancy._id, { isActive: !vacancy.isActive });
      toast.success(`Vacancy is now ${!vacancy.isActive ? "active" : "inactive"}.`, { id: loadId });
      fetchData();
    } catch (error) {
      toast.error("Failed to toggle vacancy status.", { id: loadId });
    }
  };

  const handleDeleteVacancy = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vacancy? This cannot be undone.")) return;
    const loadId = toast.loading("Deleting vacancy...");
    try {
      await deleteVacancy(id);
      toast.success("Vacancy deleted successfully.", { id: loadId });
      fetchData();
    } catch (error) {
      toast.error("Failed to delete vacancy.", { id: loadId });
    }
  };

  // Application Handlers
  const handleUpdateApplicationStatus = async (id, newStatus) => {
    const loadId = toast.loading(`Updating status to ${newStatus}...`);
    try {
      await updateApplicationStatus(id, { status: newStatus });
      toast.success(`Candidate status set to ${newStatus}.`, { id: loadId });
      
      // Update selected modal details state as well
      if (selectedApplication && selectedApplication._id === id) {
        setSelectedApplication((prev) => ({ ...prev, status: newStatus }));
      }
      fetchData();
    } catch (error) {
      toast.error("Failed to update candidate status.", { id: loadId });
    }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm("Are you sure you want to delete this application? This will permanently remove their records and delete the CV from storage.")) return;
    const loadId = toast.loading("Deleting application...");
    try {
      await deleteApplication(id);
      toast.success("Application deleted successfully.", { id: loadId });
      setSelectedApplication(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to delete application.", { id: loadId });
    }
  };

  // Filters applications based on selected dropdown filter
  const filteredApplications = applications.filter((app) => {
    if (statusFilter === "all") return true;
    return app.status.toLowerCase() === statusFilter.toLowerCase();
  });

  return (
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-7xl mx-auto font-outfit">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tightest leading-none">
            Careers Portal
          </h1>
          <p className="text-slate-400 mt-3 text-sm font-medium tracking-wide">
            Manage vacancies and review job applications.
          </p>
        </div>

        {activeTab === "vacancies" && (
          <button
            onClick={openAddVacancyModal}
            className="group flex items-center gap-3 bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-[1.25rem] font-bold transition-all shadow-xl shadow-cyan-100 active:scale-95 animate-in fade-in"
          >
            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>Post Vacancy</span>
          </button>
        )}
      </div>

      {/* Tabs Selector */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-8">
          {[
            { id: "vacancies", label: "Job Openings", icon: Briefcase },
            { id: "applications", label: "Candidates Applications", icon: User },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setLoading(true);
              }}
              className={`flex items-center gap-2.5 pb-4 font-black text-xs uppercase tracking-widest border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-cyan-600 text-cyan-600"
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-[3px] border-slate-100 border-t-cyan-500 rounded-full animate-spin shadow-inner"></div>
        </div>
      ) : activeTab === "vacancies" ? (
        /* VACANCIES SECTION */
        vacancies.length === 0 ? (
          <div className="text-center py-40 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm animate-in fade-in">
            <div className="p-8 bg-slate-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 border border-slate-100">
              <Briefcase className="w-8 h-8 text-slate-200" />
            </div>
            <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest mb-1">
              No Open Vacancies
            </h3>
            <p className="text-slate-400 font-medium text-sm mb-6">
              You haven't posted any job vacancies yet.
            </p>
            <button
              onClick={openAddVacancyModal}
              className="px-6 py-3.5 bg-slate-900 hover:bg-cyan-600 text-white rounded-xl font-bold transition-all text-xs uppercase tracking-widest"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in">
            {vacancies.map((vacancy) => (
              <div
                key={vacancy._id}
                className="bg-white rounded-[2rem] p-6 border border-slate-100/60 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all group relative flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-cyan-50 text-cyan-700 text-[10px] font-black uppercase rounded-lg tracking-widest border border-cyan-100">
                      {vacancy.type}
                    </span>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase rounded-lg tracking-widest border border-emerald-100">
                      {vacancy.workMode || "Offline"}
                    </span>
                  </div>
                  <button
                    onClick={() => handleToggleVacancyActive(vacancy)}
                    className="text-slate-400 hover:text-cyan-600 transition-colors"
                    title={vacancy.isActive ? "Deactivate" : "Activate"}
                  >
                    {vacancy.isActive ? (
                      <ToggleRight className="w-8 h-8 text-cyan-600" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-slate-300" />
                    )}
                  </button>
                </div>

                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-snug">
                    {vacancy.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap text-slate-400 text-xs font-semibold">
                    {vacancy.location && vacancy.location !== "Online" && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{vacancy.location}</span>
                      </div>
                    )}
                    {vacancy.classLevel && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 text-[10px] font-black uppercase tracking-wider">
                        {vacancy.classLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-sm font-medium line-clamp-3 pt-2">
                    {vacancy.description}
                  </p>

                  <div className="pt-4 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Requirements:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {vacancy.requirements?.slice(0, 3).map((req, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-slate-500 text-xs font-semibold"
                        >
                          {req}
                        </span>
                      ))}
                      {vacancy.requirements?.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-bold">
                          +{vacancy.requirements.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 border-t border-slate-50 pt-4">
                  <button
                    onClick={() => openEditVacancyModal(vacancy)}
                    className="flex-1 py-3 border border-slate-200 hover:border-cyan-500 hover:text-cyan-700 rounded-xl font-bold text-slate-600 transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteVacancy(vacancy._id)}
                    className="px-4 py-3 border border-transparent hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all flex items-center justify-center"
                    title="Delete"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* APPLICATIONS SECTION */
        <div className="space-y-6 animate-in fade-in">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 text-xs font-black uppercase tracking-wider">
                Filter Candidates
              </span>
            </div>
            <div className="flex gap-2">
              {["all", "applied", "interviewing", "offered", "rejected"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    statusFilter === filter
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center py-40 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="p-8 bg-slate-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 border border-slate-100">
                <FileText className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest mb-1">
                No Applications Found
              </h3>
              <p className="text-slate-400 font-medium text-sm">
                Applications matching the filters will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Candidate
                      </th>
                      <th className="p-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Applied Position / Role
                      </th>
                      <th className="p-5 font-black text-slate-400 text-[10px] uppercase tracking-widest text-center">
                        Experience
                      </th>
                      <th className="p-5 font-black text-slate-400 text-[10px] uppercase tracking-widest">
                        Status
                      </th>
                      <th className="p-5 font-black text-slate-400 text-[10px] uppercase tracking-widest text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((app) => (
                      <tr
                        key={app._id}
                        className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600 font-black text-sm">
                              {app.name ? app.name[0].toUpperCase() : "?"}
                            </div>
                            <div>
                              <h4 className="font-black text-slate-800 tracking-tight">
                                {app.name}
                              </h4>
                              <p className="text-slate-400 text-xs font-semibold">
                                {app.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          {app.appliedVacancy ? (
                            <div>
                              <span className="font-bold text-slate-800 text-sm">
                                {app.appliedVacancy.title}
                              </span>
                              <span className="block text-cyan-600 text-[9px] font-black uppercase tracking-widest">
                                Vacancy Ref
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="font-bold text-slate-800 text-sm">
                                {app.generalRole || "Spontaneous Application"}
                              </span>
                              <span className="block text-indigo-500 text-[9px] font-black uppercase tracking-widest">
                                General Spontaneous
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-5 text-center font-bold text-slate-700 text-sm">
                          {app.experience} Years
                        </td>
                        <td className="p-5">
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                              app.status === "applied"
                                ? "bg-cyan-50 text-cyan-600 border-cyan-100"
                                : app.status === "interviewing"
                                ? "bg-amber-50 text-amber-600 border-amber-100"
                                : app.status === "offered"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-rose-50 text-rose-600 border-rose-100"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedApplication(app)}
                              className="p-2 bg-slate-50 hover:bg-slate-100 hover:text-cyan-600 rounded-xl transition-all border border-slate-100"
                              title="View Application Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 rounded-xl transition-all border border-slate-100"
                              title="Open Resume"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDeleteApplication(app._id)}
                              className="p-2 hover:bg-rose-50 hover:text-rose-600 text-slate-300 rounded-xl transition-all border border-transparent hover:border-rose-100"
                              title="Delete Application"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VACANCY CREATION & EDITING MODAL */}
      {isVacancyModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-all duration-500">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-xl shadow-3xl animate-in zoom-in-95 duration-500 border border-slate-100 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tightest uppercase">
                  {editingVacancy ? "Edit Job opening" : "Post new vacancy"}
                </h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                  Configure Job details
                </p>
              </div>
              <button
                onClick={() => setIsVacancyModalOpen(false)}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100 group"
              >
                <X className="w-5 h-5 text-slate-400 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <form onSubmit={handleVacancySubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest block">
                    Job Title
                  </label>
                  <input
                    name="title"
                    value={vacancyFormData.title}
                    onChange={handleVacancyInputChange}
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 focus:border-cyan-500/20 focus:bg-white rounded-xl transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                    required
                    placeholder="e.g., Mathematics Mentor (NEET/JEE)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest block">
                      Category / Role
                    </label>
                    <select
                      name="role"
                      value={vacancyFormData.role}
                      onChange={handleVacancyInputChange}
                      className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-xl outline-none font-bold text-sm focus:border-cyan-500 transition-all shadow-sm"
                    >
                      <option value="Teacher">Teacher / Faculty</option>
                      <option value="Academic Coordinator">Academic Coordinator</option>
                      <option value="Content Developer">Content Developer</option>
                      <option value="Marketing Executive">Marketing Executive</option>
                      <option value="Operations Manager">Operations Manager</option>
                      <option value="Counselor">Counselor</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest block">
                      Job Type
                    </label>
                    <select
                      name="type"
                      value={vacancyFormData.type}
                      onChange={handleVacancyInputChange}
                      className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-xl outline-none font-bold text-sm focus:border-cyan-500 transition-all shadow-sm"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest block">
                      Work Mode
                    </label>
                    <select
                      name="workMode"
                      value={vacancyFormData.workMode}
                      onChange={handleVacancyInputChange}
                      className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-xl outline-none font-bold text-sm focus:border-cyan-500 transition-all shadow-sm"
                    >
                      <option value="Offline">Offline</option>
                      <option value="Online">Online</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-start pl-2 pt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={vacancyFormData.isActive}
                        onChange={handleVacancyInputChange}
                        className="w-4.5 h-4.5 text-cyan-600 border-slate-200 rounded focus:ring-cyan-500"
                      />
                      <span className="text-xs font-black text-slate-500 uppercase tracking-wider select-none">
                        Active vacancy
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  {needsLocation ? (
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest block">
                        Location
                      </label>
                      <input
                        name="location"
                        value={vacancyFormData.location}
                        onChange={handleVacancyInputChange}
                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 focus:border-cyan-500/20 focus:bg-white rounded-xl transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 shadow-sm"
                        required={needsLocation}
                        placeholder="e.g., Mavoor, Calicut"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest block">
                        Location
                      </label>
                      <div className="px-5 py-3.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl font-bold text-sm select-none">
                        Not required for Online jobs
                      </div>
                    </div>
                  )}
                </div>

                {isTeachingRole && (
                  <div>
                    <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest block">
                      Class / Level
                    </label>
                    <select
                      name="classLevel"
                      value={vacancyFormData.classLevel}
                      onChange={handleVacancyInputChange}
                      className="w-full px-5 py-3.5 bg-white border border-slate-100 rounded-xl outline-none font-bold text-sm focus:border-cyan-500 transition-all shadow-sm"
                    >
                      <option value="">Select Class / Level</option>
                      <option value="Class 1-5">Class 1–5 (Primary)</option>
                      <option value="Class 6-8">Class 6–8 (Middle School)</option>
                      <option value="Class 9-10">Class 9–10 (Secondary / SSLC)</option>
                      <option value="Plus One">Plus One (+1)</option>
                      <option value="Plus Two">Plus Two (+2)</option>
                      <option value="NEET">NEET</option>
                      <option value="JEE">JEE</option>
                      <option value="Degree">Degree / UG</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest block">
                    Job Description
                  </label>
                  <textarea
                    name="description"
                    value={vacancyFormData.description}
                    onChange={handleVacancyInputChange}
                    rows="3"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 focus:border-cyan-500/20 focus:bg-white rounded-xl transition-all outline-none font-medium text-slate-600 placeholder:text-slate-300 resize-none text-sm shadow-sm"
                    required
                    placeholder="Provide a comprehensive job description..."
                  ></textarea>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest block">
                    Candidate Requirements (one per line)
                  </label>
                  <textarea
                    name="requirements"
                    value={vacancyFormData.requirements}
                    onChange={handleVacancyInputChange}
                    rows="3"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 focus:border-cyan-500/20 focus:bg-white rounded-xl transition-all outline-none font-medium text-slate-600 placeholder:text-slate-300 resize-none text-sm shadow-sm"
                    required
                    placeholder="e.g., M.Sc in Mathematics or equivalent&#10;2+ years experience in teaching NEET/JEE&#10;Strong communication skills in Malayalam/English"
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4.5 bg-slate-900 hover:bg-cyan-600 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-xl transition-all shadow-xl active:scale-[0.98] mt-2"
              >
                {editingVacancy ? "Save Changes" : "Post vacancy"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* APPLICATION DETAIL MODAL */}
      {selectedApplication && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-all duration-500">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-2xl shadow-3xl animate-in zoom-in-95 duration-500 border border-slate-100 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border block w-fit mb-2 ${
                    selectedApplication.status === "applied"
                      ? "bg-cyan-50 text-cyan-600 border-cyan-100"
                      : selectedApplication.status === "interviewing"
                      ? "bg-amber-50 text-amber-600 border-amber-100"
                      : selectedApplication.status === "offered"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-rose-50 text-rose-600 border-rose-100"
                  }`}
                >
                  {selectedApplication.status}
                </span>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
                  Application Details
                </h2>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100 group"
              >
                <X className="w-5 h-5 text-slate-400 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      Applicant Name
                    </span>
                    <span className="font-bold text-slate-700">{selectedApplication.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${selectedApplication.email}`}
                      className="font-bold text-cyan-600 hover:underline"
                    >
                      {selectedApplication.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      Phone Number
                    </span>
                    <a
                      href={`tel:${selectedApplication.phoneNumber}`}
                      className="font-bold text-slate-700"
                    >
                      {selectedApplication.phoneNumber}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      Position Applied
                    </span>
                    <span className="font-bold text-slate-700">
                      {selectedApplication.appliedVacancy
                        ? selectedApplication.appliedVacancy.title
                        : selectedApplication.generalRole || "Spontaneous"}
                    </span>
                    {selectedApplication.subject && (
                      <span className="block text-xs text-slate-500 font-semibold mt-0.5">
                        Subject: <strong className="text-slate-700">{selectedApplication.subject}</strong>
                      </span>
                    )}
                    {selectedApplication.classLevel && (
                      <span className="block text-xs text-slate-500 font-semibold mt-0.5">
                        Class: <strong className="text-slate-700">{selectedApplication.classLevel}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      Experience
                    </span>
                    <span className="font-bold text-slate-700">
                      {selectedApplication.experience} Years
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      Submitted On
                    </span>
                    <span className="font-bold text-slate-700">
                      {new Date(selectedApplication.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cover letter block */}
            <div className="py-6 space-y-2 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Cover Letter / Spontaneous message
              </span>
              <p className="text-slate-600 bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                {selectedApplication.coverLetter || "No message or cover letter provided by candidate."}
              </p>
            </div>

            {/* Action Bar */}
            <div className="pt-6 flex flex-col md:flex-row gap-6 md:items-center justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Update Candidate status
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["applied", "interviewing", "offered", "rejected"].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateApplicationStatus(selectedApplication._id, st)}
                      className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                        selectedApplication.status === st
                          ? "bg-slate-900 text-white border-transparent"
                          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={selectedApplication.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-lg transition-all text-xs uppercase tracking-wider"
                >
                  <FileText className="w-4 h-4" />
                  <span>Open CV</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleDeleteApplication(selectedApplication._id)}
                  className="p-3.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                  title="Purge Candidate Records"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareersManagement;
