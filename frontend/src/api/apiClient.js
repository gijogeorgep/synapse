const getApiUrl = () => {
    const base = import.meta.env.VITE_API_URL || "";
    // If it's empty, use the default relative /api
    if (!base) return "/api";
    // If it already ends with /api, use it as is
    if (base.endsWith("/api") || base.endsWith("/api/")) return base.replace(/\/$/, "");
    // Otherwise, append /api
    return `${base.replace(/\/$/, "")}/api`;
};

const API_URL = getApiUrl();

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
        
        // Read response text first to handle non-JSON or empty bodies
        const text = await response.text();
        let data;
        
        try {
            data = text ? JSON.parse(text) : {};
        } catch (err) {
            // If parsing fails but response was ok, it's a weird case
            if (response.ok) {
                return text; // Return raw text if it's not JSON but was successful
            }
            // If parsing fails and response was not ok, use the text or a default message
            return Promise.reject(text || `Error: ${response.status} ${response.statusText}`);
        }

        if (response.ok) {
            return data;
        } else {
            return Promise.reject(data.message || `Error: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        return Promise.reject(error.message || "Server connection error");
    }
};

export default apiClient;
