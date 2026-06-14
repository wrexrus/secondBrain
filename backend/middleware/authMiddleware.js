const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {

    try {

        // get token from headers
        const authHeader = req.headers.authorization;

        // check if token exists
        if (!authHeader) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        // remove "Bearer "
        const token = authHeader.split(" ")[1];

        // verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // store user data in request
        req.user = decoded;

        // continue to next function
        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid token"
        });

    }

};

module.exports = authMiddleware;