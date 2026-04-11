import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { loginUser, registerUser } from "../api/authService";
import { toast } from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("userInfo");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("[AUTH_CONTEXT] Error parsing saved user info:", error);
            return null;
        }
    });
    const [loading, setLoading] = useState(true);
    const [sessionInvalidated, setSessionInvalidated] = useState(false);

    const logout = useCallback(async ({ invalidated = false } = {}) => {
        // Call backend to clear sessionToken from DB (best effort)
        if (user?.token && !invalidated) {
            try {
                await fetch(`${import.meta.env.VITE_API_URL || "/api"}/auth/logout`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${user.token}` },
                });
            } catch (_) {
                // Ignore network errors during logout
            }
        }
        if (invalidated) {
            setSessionInvalidated(true);
            toast.error("Session expired. Please login again.");
        } else {
            toast.success("Logged out successfully");
        }
        setUser(null);
        localStorage.removeItem("userInfo");
    }, [user]);

    const login = async (email, password) => {
        try {
            const data = await loginUser(email, password);
            
            // Validate that we have a valid user object with a role
            if (!data || !data.role || !data.token) {
                const missing = [];
                if (!data) missing.push("response body");
                else {
                    if (!data.role) missing.push("role");
                    if (!data.token) missing.push("token");
                }
                
                const errorDetail = data ? JSON.stringify(data) : "empty";
                console.error("[AUTH_CONTEXT] Invalid user data received during login:", data);
                
                return { 
                    success: false, 
                    message: `Invalid response from server. Missing: ${missing.join(", ")}. Data: ${errorDetail.substring(0, 100)}` 
                };
            }

            console.log("[AUTH_CONTEXT] Login successful for:", data.email, "Role:", data.role);
            setUser(data);
            localStorage.setItem("userInfo", JSON.stringify(data));
            toast.success(`Welcome back, ${data.name || 'User'}!`);
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Login failed";
            toast.error(errorMsg);
            return { success: false, message: error };
        }
    };

    const register = async (...args) => {
        // Support both register(userData) and register(name, email, password, role)
        let userData;
        if (args.length === 1 && typeof args[0] === "object") {
            userData = args[0];
        } else if (args.length >= 3) {
            const [name, email, password, role = "student"] = args;
            userData = { name, email, password, role };
        } else {
            return { success: false, message: "Invalid registration data" };
        }

        try {
            const data = await registerUser(userData);

            // Validate that we have a valid user object with a role
            if (!data || !data.role || !data.token) {
                const errorDetail = data ? JSON.stringify(data) : "empty";
                console.error("[AUTH_CONTEXT] Invalid user data received during registration:", data);
                return { 
                    success: false, 
                    message: `Invalid registration response from server. Data: ${errorDetail.substring(0, 100)}` 
                };
            }

            console.log("[AUTH_CONTEXT] Registration successful for:", data.email, "Role:", data.role);
            setUser(data);
            localStorage.setItem("userInfo", JSON.stringify(data));
            toast.success("Account created successfully!");
            return { success: true };
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Registration failed";
            toast.error(errorMsg);
            return { success: false, message: error };
        }
    };

    useEffect(() => {
        setLoading(false);

        // Listen for "Session Invalidated" from API client (Single Active Session)
        const handleSessionInvalidated = (e) => {
            console.warn("[AUTH_CONTEXT] Session invalidated detected from API client.");
            logout({ invalidated: true });
        };
        
        window.addEventListener("auth:session-invalidated", handleSessionInvalidated);
        return () => window.removeEventListener("auth:session-invalidated", handleSessionInvalidated);
    }, [logout]);


    const updateUser = (updatedData) => {
        console.log("[AUTH_CONTEXT] updateUser called with:", updatedData);
        console.log("[AUTH_CONTEXT] Current user state:", user);
        
        const mergedUser = user ? { ...user, ...updatedData } : updatedData;
        console.log("[AUTH_CONTEXT] Merged user state:", mergedUser);
        
        setUser(mergedUser);
        localStorage.setItem("userInfo", JSON.stringify(mergedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading, sessionInvalidated, setSessionInvalidated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
