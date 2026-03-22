import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";
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
import AdminDashboard from "./pages/Admin/Dashboard";
import AdminUserManagement from "./pages/Admin/UserManagement";
import AdminClassroomManagement from "./pages/Admin/ClassroomManagement";
import AdminClassroomDetails from "./pages/Admin/ClassroomDetails";
import AdminCreateUser from "./pages/Admin/CreateUser";
import AdminAuth from "./pages/Admin/AdminAuth";
import AdminAnnouncements from "./pages/Admin/Announcements";
import AdminExams from "./pages/Admin/ExamsManagement";
import AdminPromotions from "./pages/Admin/Promotions";
import AdminResources from "./pages/Admin/LibraryManagement";
import AdminSettings from "./pages/Admin/Settings";
import AdminAuditLogs from "./pages/Admin/AuditLogs";
import AdminReports from "./pages/Admin/Reports";
import StudentSettings from "./pages/Student/Settings";
import StudentClassroom from "./pages/Student/Classroom";
import ClassroomSelection from "./pages/Student/ClassroomSelection";

function LandingPage() {
  return (
    <>
      <section id="home" className="scroll-mt-24">
        <Hero />
      </section>
      <section id="programs" className="scroll-mt-24">
        <Program />
      </section>
      <section id="about" className="scroll-mt-24">
        <About />
      </section>
      <TutorsMultilanguage />
      <VideoCard />
      <Crescent />
      <section id="contact" className="scroll-mt-24">
        <Contact />
      </section>
    </>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminAuth = location.pathname === "/admin-portal-auth";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!isAdminAuth && <Navbar />}
      <div className={`flex-1 ${!isAdminAuth ? "mt-24" : ""}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin-portal-auth" element={<AdminAuth />} />

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
              <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={["superadmin"]} />}>
                <Route index element={<AdminAuditLogs />} />
              </Route>
              <Route path="/admin/payments" element={<div className="p-8"><h1>Payment Settings</h1></div>} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<div className="flex items-center justify-center p-20 text-slate-500">Page not found</div>} />
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
