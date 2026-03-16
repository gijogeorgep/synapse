import apiClient from "./apiClient";

// Exam Services
export const getExams = () => apiClient("/exams");
export const getExamsByClassroom = (subject, classLevel, examType = "") =>
    apiClient(`/exams?subject=${subject}&classLevel=${classLevel}${examType ? `&examType=${examType}` : ""}`);
export const getQuestions = (examId) => apiClient(`/exams/${examId}/questions`);
export const submitExamResult = (examId, resultData) =>
    apiClient(`/exams/${examId}/submit`, { body: resultData });
export const createBulkExam = (examData) =>
    apiClient("/exams/bulk", { body: examData });
export const getExamDetails = (examId) => apiClient(`/exams/${examId}`);
export const getMyResults = () => apiClient("/exams/my-results");
export const deleteExam = (examId) =>
    apiClient(`/exams/${examId}`, { method: "DELETE" });

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
