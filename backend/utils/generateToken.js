import jwt from "jsonwebtoken";

const generateToken = (id, sessionToken) => {
    return jwt.sign({ id, sessionToken }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

export default generateToken;
