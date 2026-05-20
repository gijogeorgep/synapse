import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Filter,
  PlusCircle,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Users,
  DollarSign,
  Award,
  Clock,
  ExternalLink,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  getAdminPayments,
  getAdminPaymentStats,
  getAdminSubscriptions,
  createAdminSubscription,
  cancelAdminSubscription,
  getAdminUsers,
  getMaterials,
} from "../../../api/services";

const PaymentsManagement = () => {
  const [activeTab, setActiveTab] = useState("transactions");
  const [payments, setPayments] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    successCount: 0,
    pendingCount: 0,
    failedCount: 0,
    activeSubscriptionsCount: 0,
  });

  // Loading States
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    student: "",
    type: "full-access",
    material: "",
    expiryDate: "",
  });

  // Notifications / Alert State
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchStats();
    fetchPayments();
    fetchSubscriptions();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const data = await getAdminPaymentStats();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      const data = await getAdminPayments({ status: statusFilter, search: searchQuery });
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      setStatus({ type: "error", message: "Failed to fetch payments." });
    } finally {
      setLoadingPayments(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoadingSubscriptions(true);
      const data = await getAdminSubscriptions({ search: searchQuery });
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setStatus({ type: "error", message: "Failed to fetch subscriptions." });
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  // Triggered when filters change
  useEffect(() => {
    if (activeTab === "transactions") {
      fetchPayments();
    } else {
      fetchSubscriptions();
    }
  }, [searchQuery, statusFilter, activeTab]);

  const openGrantModal = async () => {
    setIsModalOpen(true);
    try {
      setActionLoading(true);
      const [usersData, materialsData] = await Promise.all([
        getAdminUsers().catch(() => []),
        getMaterials().catch(() => []),
      ]);
      setUsers(Array.isArray(usersData) ? usersData.filter((u) => u.role === "student") : []);
      setMaterials(Array.isArray(materialsData) ? materialsData : []);
    } catch (error) {
      console.error("Error fetching users/materials:", error);
      setStatus({ type: "error", message: "Failed to load students or materials." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    if (!formData.student) {
      setStatus({ type: "error", message: "Please select a student." });
      return;
    }
    if (formData.type === "material" && !formData.material) {
      setStatus({ type: "error", message: "Please select study material." });
      return;
    }

    try {
      setActionLoading(true);
      await createAdminSubscription(formData);
      setStatus({ type: "success", message: "Subscription manually granted successfully!" });
      setIsModalOpen(false);
      setFormData({ student: "", type: "full-access", material: "", expiryDate: "" });
      fetchSubscriptions();
      fetchStats();
    } catch (error) {
      console.error("Error creating subscription:", error);
      setStatus({ type: "error", message: error.response?.data?.message || "Failed to create subscription." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this student's access? This action cannot be undone.")) return;
    try {
      setActionLoading(true);
      await cancelAdminSubscription(id);
      setStatus({ type: "success", message: "Subscription successfully revoked." });
      fetchSubscriptions();
      fetchStats();
    } catch (error) {
      console.error("Error revoking subscription:", error);
      setStatus({ type: "error", message: "Failed to revoke subscription." });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-indigo-600 animate-pulse" />
            Payments & Subscriptions
          </h1>
          <p className="text-slate-500 mt-2">
            Track student transactions, manage system subscriptions, and grant manual access overrides.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              fetchStats();
              if (activeTab === "transactions") fetchPayments();
              else fetchSubscriptions();
            }}
            className="p-2.5 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
            title="Refresh Data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={openGrantModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Grant Access Override</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {status.message && (
        <div
          className={`p-4 rounded-xl flex items-center space-x-3 text-sm font-medium ${
            status.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
              : "bg-rose-50 text-rose-700 border border-rose-100"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span>{status.message}</span>
          <button onClick={() => setStatus({ type: "", message: "" })} className="ml-auto">
            <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-white shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {loadingStats ? (
                <span className="inline-block w-20 h-6 bg-slate-100 animate-pulse rounded"></span>
              ) : (
                `₹${stats.totalRevenue?.toLocaleString()}`
              )}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-white shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Successful Orders</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {loadingStats ? (
                <span className="inline-block w-12 h-6 bg-slate-100 animate-pulse rounded"></span>
              ) : (
                stats.successCount
              )}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-white shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
          <div className="p-4 bg-violet-50 text-violet-600 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Subs</p>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {loadingStats ? (
                <span className="inline-block w-12 h-6 bg-slate-100 animate-pulse rounded"></span>
              ) : (
                stats.activeSubscriptionsCount
              )}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-white shadow-sm flex items-center gap-5 transition-all hover:shadow-md">
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending / Failed</p>
            <p className="text-xl font-black text-slate-900 mt-1">
              {loadingStats ? (
                <span className="inline-block w-16 h-6 bg-slate-100 animate-pulse rounded"></span>
              ) : (
                <span className="text-slate-700">
                  <span className="text-amber-600">{stats.pendingCount}</span>
                  <span className="text-slate-300 mx-1">/</span>
                  <span className="text-rose-600">{stats.failedCount}</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs & Controls Section */}
      <div className="bg-white rounded-[2rem] border border-white shadow-sm overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl shrink-0 w-fit">
            <button
              onClick={() => {
                setActiveTab("transactions");
                setSearchQuery("");
                setStatusFilter("");
              }}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "transactions"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Transactions
            </button>
            <button
              onClick={() => {
                setActiveTab("subscriptions");
                setSearchQuery("");
                setStatusFilter("");
              }}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === "subscriptions"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Subscriptions
            </button>
          </div>

          {/* Filtering and Searching Inputs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeTab === "transactions"
                    ? "Search name, email, order, ID..."
                    : "Search student, material..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full font-medium"
              />
            </div>

            {activeTab === "transactions" && (
              <div className="relative w-full sm:w-44">
                <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full appearance-none font-bold text-slate-600"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Data Tables */}
        {activeTab === "transactions" ? (
          <div className="overflow-x-auto">
            {loadingPayments ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-medium">Retrieving transactions...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-20">
                <CreditCard className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-400">No Transactions Found</h3>
                <p className="text-slate-400 mt-1">No payment records match the current filters.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Details</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment / Order IDs</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(p.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.student?.name || "Deleted User"}</div>
                        <div className="text-xs text-slate-400 font-medium">{p.student?.email || "N/A"}</div>
                        {p.student?.phoneNumber && (
                          <div className="text-[10px] text-slate-400 font-medium">{p.student.phoneNumber}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-black text-slate-800 text-base">
                        ₹{p.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500 space-y-1">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Pay ID:</span>
                          {p.paymentId || "N/A"}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Order ID:</span>
                          {p.orderId || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            p.status === "completed"
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : p.status === "pending"
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-rose-50 text-rose-600 border border-rose-100"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            {loadingSubscriptions ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-slate-500 font-medium">Retrieving subscriptions...</p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-20">
                <Award className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-400">No Active Access Overrides</h3>
                <p className="text-slate-400 mt-1">Students will gain default access based on payment verify calls.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subscription Type</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Resource</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiration Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {subscriptions.map((s) => {
                    const isExpired = s.expiryDate && new Date(s.expiryDate) < new Date();
                    return (
                      <tr key={s._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{s.student?.name || "Deleted User"}</div>
                          <div className="text-xs text-slate-400 font-medium">{s.student?.email || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 capitalize font-semibold text-slate-700">
                          {s.type === "full-access" ? (
                            <span className="px-2 py-1 bg-violet-50 text-violet-600 rounded-lg text-xs font-bold border border-violet-100">
                              Full Access
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold border border-blue-100">
                              Material Access
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600">
                          {s.type === "full-access" ? "Entire Library" : s.material?.title || "Deleted Resource"}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium">
                          {s.expiryDate
                            ? new Date(s.expiryDate).toLocaleDateString("en-IN", {
                                dateStyle: "medium",
                              })
                            : "Lifetime Access"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                              isExpired || s.status === "expired"
                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            }`}
                          >
                            {isExpired || s.status === "expired" ? "Expired" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleCancelSubscription(s._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Revoke Access"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Grant Override Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center p-8 border-b border-slate-100 shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Manual Access Override</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Grant a student special library or document privileges.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="p-8 space-y-6">
              {/* Student Dropdown Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                  Select Student
                </label>
                <select
                  value={formData.student}
                  onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-700"
                  required
                >
                  <option value="">Choose Student...</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Select Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                  Access Scope
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value, material: "" })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-700"
                  required
                >
                  <option value="full-access">Full Access (All Library Materials)</option>
                  <option value="material">Material Specific Access</option>
                </select>
              </div>

              {/* Material Dropdown Selector (if type is material) */}
              {formData.type === "material" && (
                <div className="animate-in fade-in slide-in-from-top-3 duration-200">
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                    Select Study Material
                  </label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-700"
                    required
                  >
                    <option value="">Choose Resource...</option>
                    {materials.map((m) => (
                      <option key={m._id} value={m._id}>
                        [{m.classLevel} - {m.subject}] {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Expiration Date Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold text-slate-700"
                />
                <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                  Leave empty for lifetime/permanent override.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50 text-sm"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Grant Access"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManagement;
