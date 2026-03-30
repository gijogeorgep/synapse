import { BrowserRouter as Router, Routes, Route, useLocation, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import "./App.css";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/Shared/ProtectedRoute";
import DashboardLayout from "./components/Layout/DashboardLayout";

// Landing Page Sections (Still in root components for now, can move later)
import Hero from "./components/Hero";
import Program from "./components/Program";
import About from "./components/About";
import VideoCard from "./components/VideoCard";
import TutorsMultilanguage from "./components/TutorsMultilanguage";
import Crescent from "./components/Crescent";
import Contact from "./components/Contact";
import FAQ from "./components/FAQ";
import Testimonials from "./components/Testimonials";
import AboutPage from "./pages/AboutPage";
import MaintenancePage from "./pages/MaintenancePage";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";

// Portal Pages
import StudentDashboard from "./pages/Student/Dashboard";
import StudentExams from "./pages/Student/Exams";
import StudentClassrooms from "./pages/Student/Classrooms";
import StudentMaterials from "./pages/Student/Materials";
import TeacherDashboard from "./pages/Teacher/Dashboard";
import TeacherClassrooms from "./pages/Teacher/Classrooms";
import TeacherClassroom from "./pages/Teacher/Classroom";
import TeacherExams from "./pages/Teacher/Exams";
import TeacherSettings from "./pages/Teacher/Settings";
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
import StudentSettings from "./pages/Student/Settings";
import StudentClassroom from "./pages/Student/Classroom";
import ClassroomSelection from "./pages/Student/ClassroomSelection";
import Blogs from "./pages/Blogs/Blogs";
import BlogPost from "./pages/Blogs/BlogPost";
import ProgramDetail from "./pages/Programs/ProgramDetail";
import Notifications from "./pages/Notifications/Notifications";

function LandingPage() {
  return (
    <>
      <section id="home" className="scroll-mt-20 md:scroll-mt-24">
        <Hero />
      </section>
      <section id="programs" className="scroll-mt-20 md:scroll-mt-24">
        <Program />
      </section>
      <section id="about" className="scroll-mt-20 md:scroll-mt-24">
        <About />
        <div className="bg-[#f8fafc] pb-20 text-center">
            <Link 
                to="/about"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-cyan-700 rounded-2xl font-bold border border-cyan-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
            >
                Learn more about our mission
                <ArrowRight className="w-4 h-4" />
            </Link>
        </div>
      </section>
      <TutorsMultilanguage />
      <VideoCard />
      <Crescent />
      <section id="reviews" className="scroll-mt-20 md:scroll-mt-24">
        <Testimonials />
      </section>
      <section id="faq" className="scroll-mt-20 md:scroll-mt-24">
        <FAQ />
      </section>
      <section id="contact" className="scroll-mt-20 md:scroll-mt-24">
        <Contact />
      </section>
    </>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminAuth = location.pathname === "/admin-portal-auth";
  const isDashboardRoute =
    location.pathname.startsWith("/student") ||
    location.pathname.startsWith("/teacher") ||
    location.pathname.startsWith("/admin");
  const showFloatingWhatsApp = !isAdminAuth && !isDashboardRoute;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!isAdminAuth && <Navbar />}
      {showFloatingWhatsApp && <FloatingWhatsApp />}
      <div className={`flex-1 ${!isAdminAuth ? "mt-20 md:mt-24" : ""}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin-portal-auth" element={<AdminAuth />} />

          {/* Public Pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/blogs/:idOrSlug" element={<BlogPost />} />
          <Route path="/programs/:id" element={<ProgramDetail />} />

          {/* General Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={["student", "admin", "superadmin"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/classrooms" element={<StudentClassrooms />} />
              <Route path="/student/exams" element={<StudentExams />} />
              <Route path="/student/materials" element={<StudentMaterials />} />
              <Route path="/student/history" element={<div className="p-8"><h1>Exam History</h1></div>} />
              <Route path="/student/settings" element={<StudentSettings />} />
              <Route path="/student/classroom" element={<StudentClassroom />} />
              <Route path="/student/select-classroom" element={<ClassroomSelection />} />
            </Route>
          </Route>

          {/* Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={["teacher", "admin", "superadmin"]} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/classrooms" element={<TeacherClassrooms />} />
              <Route path="/teacher/classroom" element={<TeacherClassroom />} />
              <Route path="/teacher/exams" element={<TeacherExams />} />
              <Route path="/teacher/materials" element={<div className="p-8"><h1>Manage Materials</h1></div>} />
              <Route path="/teacher/settings" element={<TeacherSettings />} />
            </Route>
          </Route>

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
              <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
                <Route index element={<AdminAuditLogs />} />
              </Route>
              <Route path="/admin/payments" element={<div className="p-8"><h1>Payment Settings</h1></div>} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isAdminAuth && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
