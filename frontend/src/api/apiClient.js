const getApiUrl = () => {
    let base = import.meta.env.VITE_API_URL || "";
    
    // Clean up base URL if it contains '||' (frequent copy-paste error)
    if (base.includes("||")) {
        base = base.split("||")[0].trim();
    }
    
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
        const fullUrl = `${API_URL}${endpoint}`;
        console.log(`[API_CLIENT] Fetching: ${fullUrl}`, {
            method: config.method,
            headers: config.headers
        });
        
        const response = await fetch(fullUrl, config);
        console.log(`[API_CLIENT] Response Status: ${response.status} ${response.statusText}`);
        
        const contentType = response.headers.get("content-type");
        const text = await response.text();
        
        // Defensive check: if we got HTML but expected JSON (common with redirects or misconfigured hosting)
        if (contentType && contentType.includes("text/html")) {
            console.error("[API_CLIENT] Received HTML instead of JSON. Potential redirect issue or misconfiguration.", {
                url: fullUrl,
                status: response.status,
                preview: text.substring(0, 200)
            });
            return Promise.reject("Invalid server response (received HTML). Check if the API URL is correct.");
        }

        console.log(`[API_CLIENT] Raw Response Text:`, text.substring(0, 500) + (text.length > 500 ? "..." : ""));
        
        let data;
        
        try {
            data = text ? JSON.parse(text) : {};
        } catch (err) {
            console.error("[API_CLIENT] JSON Parse Error:", err, "Raw Text:", text);
            return Promise.reject(`Invalid response format from server: ${text.substring(0, 100)}...`);
        }
        
        console.log(`[API_CLIENT] Parsed Data:`, data);

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
