const API_URL = import.meta.env.VITE_API_URL || "/api";

const apiClient = async (endpoint, { body, ...customConfig } = {}) => {
    const userInfo = localStorage.getItem("userInfo")
        ? JSON.parse(localStorage.getItem("userInfo"))
        : null;

    const isFormData = body instanceof FormData;
    const headers = isFormData ? {} : { "Content-Type": "application/json" };

    if (userInfo?.token) {
        headers.Authorization = `Bearer ${userInfo.token}`;
    }

    const config = {
        method: body ? "POST" : "GET",
        ...customConfig,
        headers: {
            ...headers,
            ...customConfig.headers,
        },
    };

    if (body) {
        config.body = isFormData ? body : JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (response.ok) {
            return data;
        } else {
            return Promise.reject(data.message || "Something went wrong");
        }
    } catch (error) {
        return Promise.reject(error.message || "Server connection error");
    }
};

export default apiClient;
