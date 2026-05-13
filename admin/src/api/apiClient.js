export const getApiUrl = () => {
    let base = import.meta.env.VITE_API_URL || "";
    
    // Clean up base URL if it contains '||' (frequent copy-paste error)
    if (base.includes("||")) {
        base = base.split("||")[0].trim();
    }
    
    // Fallback logic for production if env variable is missing
    if (!base && typeof window !== "undefined" && !window.location.hostname.includes("localhost")) {
        console.warn("[API_CLIENT] VITE_API_URL is missing. Falling back to production Render backend.");
        base = "https://synapsebackend.onrender.com/api";
    }

    // If it's still empty, use the default relative /api
    if (!base) return "/api";
    // If it already ends with /api, use it as is
    if (base.endsWith("/api") || base.endsWith("/api/")) return base.replace(/\/$/, "");
    // Otherwise, append /api
    const resolvedUrl = `${base.replace(/\/$/, "")}/api`;
    
    // Log for debugging in development only
    if (import.meta.env.DEV) {
        // console.log(`[API_CLIENT] API URL resolved to: ${resolvedUrl}`);
    }

    return resolvedUrl;
};

const apiClient = async (endpoint, { body, ...customConfig } = {}) => {
    // Resolve API URL at runtime to ensure window and hostname are available
    const API_URL = getApiUrl();
    
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
        
        // Detailed logging for debugging domain issues
        console.log(`[API_CLIENT] Finished: ${fullUrl} | Status: ${response.status} | Content-Type: ${contentType}`);
        console.log(`[API_CLIENT] Actual Response Domain: ${new URL(response.url).origin}`);
        
        // Defensive check: if we got HTML but expected JSON (usually means domain mismatch or redirect to login/index)
        if (contentType && contentType.includes("text/html")) {
            console.error("[API_CLIENT] HTML received instead of JSON. Check the backend domain.", {
                requestedUrl: fullUrl,
                actualUrl: response.url
            });
            return Promise.reject(`Server error (HTML received). The request likely hit the wrong domain: ${response.url}`);
        }

        let data;
        try {
            data = text ? JSON.parse(text) : null;
        } catch (err) {
            console.error("[API_CLIENT] JSON Parse Error at:", fullUrl, "| Raw:", text.substring(0, 100));
            return Promise.reject(`Response parse error from ${fullUrl}`);
        }
        
        if (response.ok) {
            return data;
        } else {
            // Check for specific session invalidation from backend (Single Session Enforcement)
            if (data?.code === "SESSION_INVALIDATED") {
                window.dispatchEvent(new CustomEvent("auth:session-invalidated", { detail: data.message }));
            }
            
            return Promise.reject(data?.message || `Error ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error("[API_CLIENT] Network/Request Error:", error.message || error);
        return Promise.reject(error.message || "Network connection failed");
    }
};

export default apiClient;
