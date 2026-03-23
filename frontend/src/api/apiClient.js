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
        console.log(`[API_CLIENT] Fetching: ${API_URL}${endpoint}`, {
            method: config.method,
            headers: config.headers
        });
        
        const response = await fetch(`${API_URL}${endpoint}`, config);
        console.log(`[API_CLIENT] Response Status: ${response.status} ${response.statusText}`);
        
        // Read response text first to handle non-JSON or empty bodies
        const text = await response.text();
        console.log(`[API_CLIENT] Raw Response Text:`, text.substring(0, 500) + (text.length > 500 ? "..." : ""));
        
        let data;
        
        try {
            data = text ? JSON.parse(text) : {};
        } catch (err) {
            console.error("[API_CLIENT] JSON Parse Error:", err, "Raw Text:", text);
            // If it's 200 OK but not JSON, and we expect JSON, this is an error
            return Promise.reject(`Invalid response format from server: ${text.substring(0, 100)}...`);
        }

        if (response.ok) {
            return data;
        } else {
            console.warn("[API_CLIENT] Error response data:", data);
            return Promise.reject(data.message || `Error: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        console.error("[API_CLIENT] Request Error:", error);
        return Promise.reject(error.message || "Network error occurred");
    }
};

export default apiClient;
