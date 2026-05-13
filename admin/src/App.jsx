import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./App.css";
import ProtectedRoute from "./components/Shared/ProtectedRoute";
import SEO from "./components/Shared/SEO";
import DashboardLayout from "./components/Layout/DashboardLayout";
import SplashScreen from "./components/Shared/SplashScreen";

import AdminDashboard from "./pages/Admin/dashboard/Dashboard";
import AdminUserManagement from "./pages/Admin/users/UserManagement";
import AdminClassroomManagement from "./pages/Admin/classrooms/ClassroomManagement";
import AdminClassroomDetails from "./pages/Admin/classrooms/ClassroomDetails";
import AdminCreateUser from "./pages/Admin/users/CreateUser";
import AdminAuth from "./pages/Admin/auth/AdminAuth";
import AdminAnnouncements from "./pages/Admin/content/Announcements";
import AdminExams from "./pages/Admin/exams/ExamsManagement";
import AdminPromotions from "./pages/Admin/promotions/Promotions";
import AdminResources from "./pages/Admin/content/LibraryManagement";
import AdminSettings from "./pages/Admin/settings/Settings";
import AdminAuditLogs from "./pages/Admin/reports/AuditLogs";
import AdminReports from "./pages/Admin/reports/Reports";
import AdminBlogManagement from "./pages/Admin/content/BlogManagement";
import AdminProgramManagement from "./pages/Admin/content/ProgramManagement";
import AdminBannerManagement from "./pages/Admin/content/BannerManagement";
import AdminProfile from "./pages/Admin/profile/AdminProfile";
import EventManagement from "./pages/Admin/EventManagement";
import EnquiryFormList from "./pages/Admin/enquiry/EnquiryFormList";
import EnquiryFormBuilder from "./pages/Admin/enquiry/EnquiryFormBuilder";
import EnquiryResponses from "./pages/Admin/enquiry/EnquiryResponses";
import PublicForm from "./pages/Public/EnquiryForm/PublicForm";
import LessonTracker from "./pages/Teacher/LessonTracker"; // Shared component
import Notifications from "./pages/Notifications/Notifications";
import { useAuth } from "./context/AuthContext";

function RouteSeo() {
  const location = useLocation();
  const pathname = location.pathname;

  return <SEO title="Admin Portal" description="Secure Admin portal for Synapse Edu Hub." noindex />;
}

function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const role = user.role;
      if (role === "admin" || role === "superadmin") {
        if (window.location.pathname === "/") {
          navigate("/admin/dashboard");
        }
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <RouteSeo />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<AdminAuth />} />
          <Route path="/login" element={<AdminAuth />} />
          <Route path="/admin-portal-auth" element={<AdminAuth />} />
          <Route path="/form/:slug" element={<PublicForm />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={["admin", "superadmin"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUserManagement />} />
              <Route path="/admin/users/create" element={<AdminCreateUser />} />
              <Route path="/admin/classrooms" element={<AdminClassroomManagement />} />
              <Route path="/admin/classrooms/:id" element={<AdminClassroomDetails />} />
              <Route path="/admin/announcements" element={<AdminAnnouncements />} />
              <Route path="/admin/exams" element={<AdminExams />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/promotions" element={<AdminPromotions />} />
              <Route path="/admin/resources" element={<AdminResources />} />
              <Route path="/admin/programs" element={<AdminProgramManagement />} />
              <Route path="/admin/blogs" element={<AdminBlogManagement />} />
              <Route path="/admin/banners" element={<AdminBannerManagement />} />
              <Route path="/admin/events" element={<EventManagement />} />
              <Route path="/admin/enquiry" element={<EnquiryFormList />} />
              <Route path="/admin/enquiry/create" element={<EnquiryFormBuilder />} />
              <Route path="/admin/enquiry/responses/:id" element={<EnquiryResponses />} />
              <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
                <Route index element={<AdminAuditLogs />} />
              </Route>
              <Route path="/admin/payments" element={<div className="p-8"><h1>Payment Settings</h1></div>} />
              <Route path="/admin/lesson-tracker" element={<LessonTracker />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<div className="p-8 text-center mt-20"><h1>404 - Not Found</h1><p>The requested admin page does not exist.</p></div>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <Router>
        <AppContent />
      </Router>
    </>
  );
}

export default App;
