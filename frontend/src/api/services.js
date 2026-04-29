import apiClient from "./apiClient";

// Exam Services
export const getExams = () => apiClient("/exams");
export const getExamsByClassroom = (subject, classLevel, examType = "") =>
  apiClient(
    `/exams?subject=${subject}&classLevel=${classLevel}${examType ? `&examType=${examType}` : ""}`,
  );
export const getExamsBySpecificClassroom = (classroomId) =>
  apiClient(`/exams?classroomId=${classroomId}`);
export const getQuestions = (examId) => apiClient(`/exams/${examId}/questions?includeDrafts=true`);
export const submitExamResult = (examId, resultData) =>
  apiClient(`/exams/${examId}/submit`, { body: resultData });
export const createBulkExam = (examData) =>
  apiClient("/exams/bulk", { body: examData });
export const updateBulkExam = (examId, examData) =>
  apiClient(`/exams/${examId}`, { method: "PUT", body: examData });
export const getExamDetails = (examId) => apiClient(`/exams/${examId}`);
export const getMyResults = () => apiClient("/exams/my-results");
export const deleteExam = (examId) =>
  apiClient(`/exams/${examId}`, { method: "DELETE" });

export const saveDraftQuestion = (questionData) =>
  apiClient(`/exams/questions/draft`, { method: "POST", body: questionData });

export const getDraftQuestions = (params) => {
  const query = new URLSearchParams(params).toString();
  return apiClient(`/exams/questions/drafts?${query}`);
};

export const updateQuestion = (questionId, questionData) =>
  apiClient(`/exams/questions/${questionId}`, {
    method: "PUT",
    body: questionData,
  });

export const publishQuestion = (questionId) =>
  apiClient(`/exams/questions/${questionId}/publish`, { method: "POST" });
export const deleteQuestion = (questionId) =>
  apiClient(`/exams/questions/${questionId}`, { method: "DELETE" });

// Report Services
export const getOverallStats = () => apiClient("/reports/overall");
export const getClassroomReports = () => apiClient("/reports/classrooms");
export const getSubjectStats = () => apiClient("/reports/subjects");
export const getStudentsListForReports = () =>
  apiClient("/reports/students-list");
export const getTeachersListForReports = () =>
  apiClient("/reports/teachers-list");
export const getAdminsListForReports = () => apiClient("/reports/admins-list");

export const getStudentReport = (studentId) =>
  apiClient(`/reports/student/${studentId}`);
export const getTeacherReport = (teacherId) =>
  apiClient(`/reports/teacher/${teacherId}`);
export const getAdminReport = (adminId) =>
  apiClient(`/reports/admin/${adminId}`);

// Material Services
export const getMaterials = () => apiClient("/materials");
export const getMaterialById = (id) => apiClient(`/materials/${id}`);
export const uploadMaterial = (materialData) =>
  apiClient("/materials", { body: materialData });

// Auth Services
export const getProfile = () => apiClient("/auth/profile");
export const updateProfile = (profileData) =>
  apiClient("/auth/profile", { method: "PUT", body: profileData });
export const updatePassword = (passwordData) =>
  apiClient("/auth/profile/password", { method: "PUT", body: passwordData });

// Upload Services
export const uploadImage = (formData) => {
  // For FormData, we need to let the browser set the content-type automatically
  return apiClient("/upload/image", {
    method: "POST",
    body: formData,
    // Passing null headers for multipart to work correctly (apiClient usually sets JSON)
    headers: null,
  });
};

// Classroom Services
export const getMyClassrooms = () => apiClient("/classrooms/my-classrooms");
export const getTeacherClassrooms = () =>
  apiClient("/classrooms/my-classrooms");
export const getMyTeacherStats = () =>
  apiClient("/reports/my-teacher-stats");
export const deleteMaterial = (id) =>
  apiClient(`/materials/${id}`, { method: "DELETE" });
export const getClassroomById = (id) => apiClient(`/classrooms/${id}`);
export const getPublicClassrooms = () => apiClient("/classrooms/public");

export const updateClassroomResources = (id, resourceData) =>
  apiClient(`/classrooms/${id}/resources`, {
    method: "PUT",
    body: resourceData,
  });

export const deleteClassroomResource = (classroomId, noteId) =>
  apiClient(`/classrooms/${classroomId}/resources/${noteId}`, { method: "DELETE" });

// Admin Services
export const getAdminClassrooms = () => apiClient("/admin/classrooms");
export const getAdminClassroomById = (id) => apiClient(`/admin/classrooms/${id}`);
export const createAdminUser = (userData) =>
  apiClient("/admin/users", { method: "POST", body: userData });
export const getAdminUsers = () => apiClient("/admin/users");
export const createAdminClassroom = (classroomData) =>
  apiClient("/admin/classrooms", { method: "POST", body: classroomData });
export const updateAdminClassroom = (id, classroomData) =>
  apiClient(`/admin/classrooms/${id}`, {
    method: "PATCH",
    body: classroomData,
  });
export const deleteAdminClassroom = (id) =>
  apiClient(`/admin/classrooms/${id}`, { method: "DELETE" });
export const assignUserToClassroom = (id, assignData) =>
  apiClient(`/admin/classrooms/${id}/assign`, {
    method: "POST",
    body: assignData,
  });

export const getAdminAnnouncements = () => apiClient("/admin/announcements");
export const createAdminAnnouncement = (announcementData) =>
  apiClient("/admin/announcements", { method: "POST", body: announcementData });
export const deleteAdminAnnouncement = (id) =>
  apiClient(`/admin/announcements/${id}`, { method: "DELETE" });

export const getAdminExams = () => apiClient("/admin/exams");
export const submitAdminResult = (resultData) =>
  apiClient("/admin/results", { method: "POST", body: resultData });

export const updateAdminUser = (id, userData) =>
  apiClient(`/admin/users/${id}`, { method: "PATCH", body: userData });
export const deleteAdminUser = (id) =>
  apiClient(`/admin/users/${id}`, { method: "DELETE" });
export const blockAdminUser = (id, blockData) =>
  apiClient(`/admin/users/${id}/block`, { method: "PATCH", body: blockData });

// Program Services
export const getPrograms = () => apiClient("/programs");
export const getProgramById = (id) => apiClient(`/programs/${id}`);
export const getAdminPrograms = () => apiClient("/programs/admin");
export const createProgram = (programData) =>
  apiClient("/programs", { method: "POST", body: programData });
export const updateProgram = (id, programData) =>
  apiClient(`/programs/${id}`, { method: "PATCH", body: programData });
export const deleteProgram = (id) =>
  apiClient(`/programs/${id}`, { method: "DELETE" });

// Notification Services
export const getNotifications = () => apiClient("/notifications");
export const markNotificationRead = (id) =>
  apiClient(`/notifications/${id}/read`, { method: "PATCH" });
export const markAllNotificationsRead = () =>
  apiClient("/notifications/read-all", { method: "PATCH" });
export const clearAllNotifications = () =>
  apiClient("/notifications/clear-all", { method: "PATCH" });

// Assignment Services
export const getAssignments = (classroomId) =>
  apiClient(`/assignments/classroom/${classroomId}`);
export const createAssignment = (assignmentData) =>
  apiClient("/assignments", { method: "POST", body: assignmentData });
export const deleteAssignment = (assignmentId) =>
  apiClient(`/assignments/${assignmentId}`, { method: "DELETE" });
export const getAssignmentSubmissions = (assignmentId) =>
  apiClient(`/assignments/${assignmentId}/submissions`);
export const submitHomework = (assignmentId, submissionData) =>
  apiClient(`/assignments/${assignmentId}/submit`, {
    method: "POST",
    body: submissionData,
  });
export const gradeHomework = (submissionId, gradeData) =>
  apiClient(`/assignments/submissions/${submissionId}/grade`, {
    method: "PUT",
    body: gradeData,
  });

// Upload Services (File / PDF)
export const uploadFile = (formData) =>
  apiClient("/upload/file", {
    method: "POST",
    body: formData,
    headers: null, // let browser set multipart/form-data boundary
  });

// Contact Services
export const submitContactForm = (contactData) =>
  apiClient("/contact", { method: "POST", body: contactData });

// Promotion Services
export const promoteClassroom = (promoteData) =>
  apiClient("/admin/promote", { method: "POST", body: promoteData });

// Audit Log Services
export const getAuditLogs = () => apiClient("/admin/audit-logs");

// Admin Resource (Library) Services
export const getAdminResources = () => apiClient("/admin/resources");
export const createAdminResource = (resourceData) =>
  apiClient("/admin/resources", { method: "POST", body: resourceData });
export const deleteAdminResource = (id) =>
  apiClient(`/admin/resources/${id}`, { method: "DELETE" });

// Student Enrollment Services
export const enrollInClassroom = (classroomId) =>
  apiClient(`/classrooms/${classroomId}/enroll`, { method: "POST" });

// Banner Services
export const getBanners = () => apiClient("/banners");
export const getAdminBanners = () => apiClient("/banners/admin");
export const createBanner = (bannerData) =>
  apiClient("/banners", { method: "POST", body: bannerData });
export const updateBanner = (id, bannerData) =>
  apiClient(`/banners/${id}`, { method: "PATCH", body: bannerData });
export const deleteBanner = (id) =>
  apiClient(`/banners/${id}`, { method: "DELETE" });

// Global Settings Services
export const getSettings = () => apiClient("/settings");
export const updateSettings = (settingsData) =>
  apiClient("/settings", { method: "PATCH", body: settingsData });
