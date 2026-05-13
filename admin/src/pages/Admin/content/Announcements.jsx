import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  Megaphone,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  Users,
  GraduationCap,
  Globe,
} from "lucide-react";
import {
  getAdminAnnouncements,
  getAdminClassrooms,
  createAdminAnnouncement,
  deleteAdminAnnouncement,
} from "../../../api/services";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [audienceType, setAudienceType] = useState("all"); // 'all', 'role', 'classroom'
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetRole: "all",
    targetClassroom: "",
  });
  const [status, setStatus] = useState({ type: "", message: "" });

  const userInfo = JSON.parse(localStorage.getItem("userInfo")) || {};

  useEffect(() => {
    fetchAnnouncements();
    fetchClassrooms();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getAdminAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const data = await getAdminClassrooms();
      setClassrooms(data);
    } catch (error) {
      console.error("Error fetching classrooms:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Construct final payload based on audience selection
      const payload = {
        title: formData.title,
        content: formData.content,
        targetRole: audienceType === "all" ? "all" : formData.targetRole,
        targetClassroom:
          audienceType === "classroom" ? formData.targetClassroom : null,
      };

      const loadId = toast.loading("Broadcasting notification...");
      await createAdminAnnouncement(payload);
      const msg = "Notification broadcasted successfully!";
      setStatus({ type: "success", message: msg });
      toast.success(msg, { id: loadId });
      setIsModalOpen(false);
      setFormData({
        title: "",
        content: "",
        targetRole: "all",
        targetClassroom: "",
      });
      setAudienceType("all");
      fetchAnnouncements();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to broadcast notification.";
      setStatus({ type: "error", message: msg });
      toast.error(msg, { id: loadId });
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure? This will remove the history but won't delete sent notifications.",
      )
    )
      return;
    const loadId = toast.loading("Deleting announcement...");
    try {
      await deleteAdminAnnouncement(id);
      toast.success("Announcement history entry removed.", { id: loadId });
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast.error("Failed to remove history entry.", { id: loadId });
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-6xl mx-auto font-outfit">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tightest leading-none">
            Broadcasts
          </h1>
          <p className="text-slate-400 mt-3 text-sm font-medium tracking-wide">
            Manage and deploy platform-wide notifications.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="group flex items-center gap-3 bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-4 rounded-[1.25rem] font-bold transition-all shadow-xl shadow-cyan-100 active:scale-95"
        >
          <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Create New</span>
        </button>
      </div>

      {status.message && (
        <div
          className={`p-4 rounded-2xl flex items-center space-x-3 text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-4 duration-300 ${status.type === "success" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shadow-sm" />
          ) : (
            <AlertCircle className="w-4 h-4 shadow-sm" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-[3px] border-slate-100 border-t-cyan-500 rounded-full animate-spin shadow-inner"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-40 bg-white rounded-[2.5rem] border border-slate-50 shadow-sm">
          <div className="p-8 bg-slate-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 border border-slate-100">
            <Megaphone className="w-8 h-8 text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest mb-1">
            No Broadcast History
          </h3>
          <p className="text-slate-400 font-medium text-sm">
            Your manual broadcasts will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((ann) => (
            <div
              key={ann._id}
              className="bg-white rounded-[1.5rem] p-6 border border-slate-100/60 hover:border-cyan-200/50 hover:shadow-2xl hover:shadow-cyan-500/5 transition-all group relative"
            >
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(ann._id)}
                  className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-6 items-start">
                <div
                  className={`p-4 rounded-2xl ${ann.targetRole === "admin" ? "bg-slate-50 text-slate-400" : ann.targetRole === "teacher" ? "bg-amber-50 text-amber-500" : "bg-cyan-50 text-cyan-500"}`}
                >
                  <Megaphone className="w-5 h-5" />
                </div>
                <div className="flex-1 pr-10">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-black text-slate-800 tracking-tight">
                      {ann.title}
                    </h3>
                    <span className="px-2.5 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase rounded-lg tracking-widest border border-slate-100">
                      {ann.targetRole === "all" ? "Everyone" : ann.targetRole}
                    </span>
                    {ann.targetClassroom && (
                      <span className="px-2.5 py-1 bg-cyan-50 text-cyan-600 text-[9px] font-black uppercase rounded-lg tracking-widest border border-cyan-100">
                        Classroom Target
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 font-medium leading-relaxed whitespace-pre-wrap text-sm mb-4">
                    {ann.content}
                  </p>
                  <div className="flex items-center gap-4 text-[9px] text-slate-300 font-bold uppercase tracking-tighter">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
                      <Clock className="w-3 h-3" />
                      <span>
                        Sent {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BROADCAST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 transition-all duration-500">
          <div className="bg-white rounded-[2rem] p-10 w-full max-w-xl shadow-3xl animate-in zoom-in-95 duration-500 border border-slate-100">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tightest uppercase">
                  New Broadcast
                </h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                  Manual Notification Trigger
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100 group"
              >
                <X className="w-5 h-5 text-slate-400 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest block">
                    Broadcast Title
                  </label>
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 focus:border-cyan-500/20 focus:bg-white rounded-2xl transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 shadow-sm shadow-slate-100/50"
                    required
                    placeholder="e.g., Examination Schedule Updated"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest block">
                    Choose Audience
                  </label>
                  <div className="p-1 bg-slate-50 rounded-2xl border border-slate-100 flex gap-1">
                    {[
                      { id: "all", label: "Everyone", icon: Globe },
                      { id: "role", label: "Role Based", icon: Users },
                      {
                        id: "classroom",
                        label: "Classroom",
                        icon: GraduationCap,
                      },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setAudienceType(t.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-tighter ${
                          audienceType === t.id
                            ? "bg-white text-cyan-600 shadow-sm border border-slate-100"
                            : "text-slate-400 hover:text-slate-500"
                        }`}
                      >
                        <t.icon className="w-3.5 h-3.5" />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Targeting Controls */}
                {audienceType !== "all" && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">
                    <div
                      className={audienceType === "role" ? "col-span-2" : ""}
                    >
                      <label className="text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest block">
                        Target Role
                      </label>
                      <select
                        name="targetRole"
                        value={formData.targetRole}
                        onChange={handleChange}
                        className="w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-cyan-500 transition-all shadow-sm"
                      >
                        <option value="all">Any Role</option>
                        <option value="student">Students</option>
                        <option value="teacher">Teachers</option>
                        <option value="admin">Admins</option>
                      </select>
                    </div>

                    {audienceType === "classroom" && (
                      <div>
                        <label className="text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest block">
                          Target Classroom
                        </label>
                        <select
                          name="targetClassroom"
                          value={formData.targetClassroom}
                          onChange={handleChange}
                          className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-cyan-500 transition-all shadow-sm"
                          required={audienceType === "classroom"}
                        >
                          <option value="">Select...</option>
                          {classrooms.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest block">
                    Detailed Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 focus:border-cyan-500/20 focus:bg-white rounded-2xl transition-all outline-none font-medium text-slate-600 placeholder:text-slate-300 resize-none text-sm shadow-sm"
                    required
                    placeholder="Type your official announcement..."
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-slate-900 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-cyan-600 transition-all shadow-2xl shadow-cyan-100 active:scale-[0.98]"
              >
                Initiate Broadcast
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
