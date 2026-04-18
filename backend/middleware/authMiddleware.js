import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    } else if (req.query.token) {
        token = req.query.token;
    }

    if (token) {
        try {

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                return res.status(401).json({ message: "Not authorized, user not found" });
            }

            // Single active session check:
            // If sessionToken in JWT doesn't match the one in DB, another device has logged in
            if (decoded.sessionToken && user.sessionToken && decoded.sessionToken !== user.sessionToken) {
                return res.status(401).json({
                    message: "Your session was ended because your account was logged in from another device.",
                    code: "SESSION_INVALIDATED",
                });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`,
            });
        }
        next();
    };
};
