import apiClient from "./apiClient";

export const loginUser = (email, password) => {
    return apiClient("/auth/login", { body: { email, password } });
};

export const sendOtpAPI = (email) => {
    return apiClient("/auth/send-otp", { body: { email } });
};

export const registerUser = (userData) => {
    return apiClient("/auth/register", { body: userData });
};
