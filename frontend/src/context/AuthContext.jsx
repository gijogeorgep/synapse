import { createContext, useState, useEffect, useContext } from "react";
import { loginUser, registerUser } from "../api/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem("userInfo");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const data = await loginUser(email, password);
            
            // Validate that we have a valid user object with a role
            if (!data || !data.role || !data.token) {
                console.error("[AUTH_CONTEXT] Invalid user data received during login:", data);
                return { success: false, message: "Invalid login response from server" };
            }

            console.log("[AUTH_CONTEXT] Login successful for:", data.email, "Role:", data.role);
            setUser(data);
            localStorage.setItem("userInfo", JSON.stringify(data));
            return { success: true };
        } catch (error) {
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
                console.error("[AUTH_CONTEXT] Invalid user data received during registration:", data);
                return { success: false, message: "Invalid registration response from server" };
            }

            console.log("[AUTH_CONTEXT] Registration successful for:", data.email, "Role:", data.role);
            setUser(data);
            localStorage.setItem("userInfo", JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return { success: false, message: error };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("userInfo");
    };

    const updateUser = (updatedData) => {
        console.log("[AUTH_CONTEXT] updateUser called with:", updatedData);
        console.log("[AUTH_CONTEXT] Current user state:", user);
        
        const mergedUser = user ? { ...user, ...updatedData } : updatedData;
        console.log("[AUTH_CONTEXT] Merged user state:", mergedUser);
        
        setUser(mergedUser);
        localStorage.setItem("userInfo", JSON.stringify(mergedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
