import React, { useState, useEffect, useMemo } from "react";
import {
  UserPlus,
  GraduationCap,
  Edit,
  Trash2,
  Ban,
  Search,
  Filter,
  X,
  CheckCircle2,
  AlertCircle,
  Layers,
} from "lucide-react";
import {
  getAdminUsers,
  updateAdminUser,
  deleteAdminUser,
  blockAdminUser,
} from "../../../api/services";
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });

  const showToast = (type, message) => {
    const errorMsg =
      typeof message === "object"
        ? message.message || JSON.stringify(message)
        : String(message);
    setStatus({ type, message: errorMsg });
    setTimeout(() => setStatus({ type: "", message: "" }), 3000);
  };

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("error", "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    class: "",
  });
  const [blockReason, setBlockReason] = useState("");

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      class: user.class || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    // Frontend Phone validation
    if (
      editFormData.phoneNumber &&
      !/^\d{10}$/.test(editFormData.phoneNumber.replace(/\s+/g, ""))
    ) {
      showToast("error", "Phone number must be exactly 10 digits");
      return;
    }

    try {
      await updateAdminUser(selectedUser._id, editFormData);
      showToast("success", "User updated successfully");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      showToast("error", error);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAdminUser(selectedUser._id);
      showToast("success", "User deleted successfully");
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      showToast("error", error);
    }
  };

  const handleBlockClick = (user) => {
    setSelectedUser(user);
    setBlockReason(user.blockReason || "");
    setIsBlockModalOpen(true);
  };

  const confirmBlockAction = async (isBlocked) => {
    try {
      await blockAdminUser(selectedUser._id, {
        isBlocked,
        reason: blockReason,
      });
      showToast(
        "success",
        `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      );
      setIsBlockModalOpen(false);
      fetchUsers();
    } catch (error) {
      showToast("error", error);
    }
  };

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search Match
      const matchesSearch =
        (user.name &&
          user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.uniqueId &&
          user.uniqueId.toLowerCase().includes(searchTerm.toLowerCase()));

      // Role Match
      const matchesRole = roleFilter === "all" || user.role === roleFilter;

      // Class Match
      let matchesClass = true;
      if (classFilter !== "all") {
        matchesClass = user.class === classFilter;
      }

      // Program Match
      let matchesProgram = true;
      if (programFilter !== "all") {
        matchesProgram = user.enrolledClassrooms?.some(
          (c) => c.programType === programFilter,
        );
      }

      return matchesSearch && matchesRole && matchesClass && matchesProgram;
    });
  }, [users, searchTerm, roleFilter, classFilter, programFilter]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto p-4 md:p-8">
      {/* Modal Components */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Edit User</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  maxLength={10}
                  title="10-digit phone number"
                  value={editFormData.phoneNumber}
                  onChange={(e) => {
                    const numericValue = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setEditFormData({
                      ...editFormData,
                      phoneNumber: numericValue,
                    });
                  }}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              {selectedUser.role === "student" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Class
                  </label>
                  <select
                    value={editFormData.class}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        class: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                      <option key={c} value={c.toString()}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 shadow-sm transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">
              Confirm Deletion
            </h2>
            <p className="text-slate-500 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-700">
                {selectedUser.name}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 shadow-lg shadow-rose-200 transition-colors"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {selectedUser.isBlocked ? "Unblock User" : "Block User"}
              </h2>
              <button
                onClick={() => setIsBlockModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            {!selectedUser.isBlocked ? (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">
                  Provide a reason for blocking{" "}
                  <span className="font-bold">{selectedUser.name}</span>. They
                  won't be able to log in until unblocked.
                </p>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Enter reason for blocking..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 min-h-[120px]"
                />
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsBlockModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => confirmBlockAction(true)}
                    className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors"
                  >
                    Confirm Block
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-left">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                    Current Block Reason
                  </p>
                  <p className="text-slate-700 text-sm italic">
                    "{selectedUser.blockReason || "No reason provided"}"
                  </p>
                </div>
                <p className="text-sm text-slate-500 mt-4">
                  Are you sure you want to unblock{" "}
                  <span className="font-bold">{selectedUser.name}</span>?
                </p>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsBlockModalOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => confirmBlockAction(false)}
                    className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Confirm Unblock
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">User Management</h1>
          <p className="text-slate-500 mt-2">
            Manage Students and Teachers in the platform.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/users/create")}
          className="flex items-center space-x-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          <span>Create User</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <UsersListIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">All Users</h2>
          </div>
        </div>

        {/* Toast Notification */}
        {status.message && (
          <div className="fixed top-6 right-6 z-[100] animate-in slide-in-from-top-5 fade-in duration-300">
            <div
              className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center space-x-3 ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-100/50"
                  : "bg-rose-50 text-rose-700 border-rose-100 shadow-rose-100/50"
              }`}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0" />
              )}
              <p className="text-sm font-semibold">{status.message}</p>
              <button
                onClick={() => setStatus({ type: "", message: "" })}
                className="ml-2 hover:bg-black/5 p-1 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-slate-50/50 p-4 rounded-2xl mb-6 border border-slate-100 flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Name or User ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none shadow-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative min-w-[160px]">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  if (e.target.value === "teacher") setClassFilter("all");
                }}
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none text-slate-700 appearance-none shadow-sm font-medium"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                {userInfo.role === "superadmin" && (
                  <option value="admin">Admin</option>
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            <div className="relative min-w-[140px]">
              <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                disabled={roleFilter === "teacher"}
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none text-slate-700 appearance-none disabled:opacity-50 disabled:bg-slate-50 shadow-sm font-medium"
              >
                <option value="all">All Classes</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                  <option key={c} value={c.toString()}>
                    Class {c}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            <div className="relative min-w-[140px]">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all outline-none text-slate-700 appearance-none shadow-sm font-medium"
              >
                <option value="all">All Programs</option>
                <option value="PrimeOne">PrimeOne</option>
                <option value="Cluster">Cluster</option>
                <option value="PlanB">PlanB</option>
                <option value="E-Zone">E-Zone</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {(searchTerm ||
                roleFilter !== "all" ||
                classFilter !== "all" ||
                programFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setRoleFilter("all");
                    setClassFilter("all");
                    setProgramFilter("all");
                  }}
                  className="flex items-center justify-center p-2.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                  title="Clear filters"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <div className="px-4 py-2 bg-white text-slate-600 text-sm font-bold rounded-xl border border-slate-200 shadow-sm whitespace-nowrap hidden sm:block">
                {filteredUsers.length}{" "}
                <span className="font-normal text-slate-500">Found</span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-slate-500 font-medium">
              No users match your filters
            </h3>
            <button
              onClick={() => {
                setSearchTerm("");
                setRoleFilter("all");
                setClassFilter("all");
              }}
              className="mt-4 text-cyan-600 hover:text-cyan-700 font-medium text-sm transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-4 text-sm font-semibold text-slate-600 px-6">
                    User Id
                  </th>
                  <th className="py-4 text-sm font-semibold text-slate-600 px-6">
                    Name
                  </th>
                  <th className="py-4 text-sm font-semibold text-slate-600 px-6">
                    Role
                  </th>
                  <th className="py-4 text-sm font-semibold text-slate-600 px-6">
                    Status
                  </th>
                  <th className="py-4 text-sm font-semibold text-slate-600 px-6">
                    Program
                  </th>
                  <th className="py-4 text-sm font-semibold text-slate-600 px-6">
                    Class
                  </th>
                  <th className="py-4 text-sm font-semibold text-slate-600 px-6">
                    Joined
                  </th>
                  <th className="py-4 text-sm font-semibold text-slate-600 px-6">
                    Last Login
                  </th>
                  <th className="py-4 text-sm font-semibold text-slate-600 px-6 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <span className="font-mono text-xs font-bold text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-100">
                        {user.uniqueId || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-sm whitespace-nowrap">
                            {user.name || "Unknown User"}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                          user.role === "student"
                            ? "bg-blue-50 text-blue-700 border-blue-100"
                            : "bg-emerald-50 text-emerald-700 border-emerald-100"
                        }`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {user.isBlocked ? (
                        <span className="px-2.5 py-1 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100 rounded-full flex items-center gap-1 w-fit">
                          <Ban className="w-3 h-3" /> Blocked
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center gap-1 w-fit">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />{" "}
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {user.programType ? (
                        (() => {
                          const colorMap = {
                            PrimeOne:
                              "bg-violet-50 text-violet-700 border-violet-100",
                            Cluster: "bg-blue-50 text-blue-700 border-blue-100",
                            PlanB:
                              "bg-amber-50 text-amber-700 border-amber-100",
                            "E-Zone":
                              "bg-emerald-50 text-emerald-700 border-emerald-100",
                            "Deep Roots":
                              "bg-teal-50 text-teal-700 border-teal-100",
                            NEET: "bg-emerald-50 text-emerald-700 border-emerald-100",
                            JEE: "bg-cyan-50 text-cyan-700 border-cyan-100",
                            PSC: "bg-rose-50 text-rose-700 border-rose-100",
                          };
                          return (
                            <span
                              className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase tracking-tight w-fit ${colorMap[user.programType] || "bg-slate-100 text-slate-700 border-slate-200"}`}
                            >
                              {user.programType === "NEET" ||
                              user.programType === "JEE" ||
                              user.programType === "PSC"
                                ? "E-Zone"
                                : user.programType}
                            </span>
                          );
                        })()
                      ) : user.enrolledClassrooms?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {[
                            ...new Set(
                              user.enrolledClassrooms.map((c) => c.programType),
                            ),
                          ]
                            .filter(Boolean)
                            .map((prog) => {
                              const colorMap = {
                                PrimeOne:
                                  "bg-violet-50 text-violet-700 border-violet-100",
                                Cluster:
                                  "bg-blue-50 text-blue-700 border-blue-100",
                                PlanB:
                                  "bg-amber-50 text-amber-700 border-amber-100",
                                "E-Zone":
                                  "bg-emerald-50 text-emerald-700 border-emerald-100",
                                "Deep Roots":
                                  "bg-teal-50 text-teal-700 border-teal-100",
                              };
                              return (
                                <span
                                  key={prog}
                                  className={`px-2 py-0.5 text-[9px] font-black rounded border uppercase tracking-tight w-fit ${colorMap[prog] || "bg-slate-100 text-slate-700 border-slate-200"}`}
                                >
                                  {prog}
                                </span>
                              );
                            })}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic font-medium">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      {user.class ? (
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded border border-slate-200 whitespace-nowrap">
                          {["NEET", "JEE", "PSC"].includes(
                            user.class?.toUpperCase?.(),
                          )
                            ? user.class
                            : `Class ${user.class}`}
                        </span>
                      ) : user.enrolledClassrooms?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {[
                            ...new Set(
                              user.enrolledClassrooms.map((c) => {
                                // Legacy E-Zone classrooms have className='N/A', fall back to subjects[0]
                                if (!c.className || c.className === "N/A") {
                                  return c.subjects?.[0] || null;
                                }
                                return c.className;
                              }),
                            ),
                          ]
                            .filter(Boolean)
                            .map((cls) => (
                              <span
                                key={cls}
                                className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap"
                              >
                                {cls}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400">
                          —
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 whitespace-nowrap">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—"}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 focus:text-blue-600 focus:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                          title="Edit User"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleBlockClick(user)}
                          className={`p-2 rounded-xl transition-colors border border-transparent ${
                            user.isBlocked
                              ? "text-rose-600 bg-rose-50 border-rose-100 hover:bg-rose-100"
                              : "text-slate-400 hover:text-rose-600 hover:bg-rose-50 focus:text-rose-600 focus:bg-rose-50 hover:border-rose-100"
                          }`}
                          title={user.isBlocked ? "Unblock User" : "Block User"}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 focus:text-rose-600 focus:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                          title="Delete User"
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
        )}
      </div>
    </div>
  );
};

// Extracted little icon perfectly sized
const UsersListIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default UserManagement;
