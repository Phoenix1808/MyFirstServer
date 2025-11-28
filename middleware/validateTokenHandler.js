const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

const validateToken = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401);
        throw new Error("Token missing");
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Token invalid or expired");
    }
});

module.exports = validateToken;
