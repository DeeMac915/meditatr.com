const { auth } = require("../config/firebase");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ error: "Access token required" });
        }

        // Verify the Firebase token
        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken;

        // Get or create user in our database
        let user = await User.findOne({ firebaseUid: decodedToken.uid });
        if (!user) {
            user = new User({
                firebaseUid: decodedToken.uid,
                email: decodedToken.email,
                name: decodedToken.name || decodedToken.email.split("@")[0],
            });
            await user.save();
        }
        req.userDoc = user;

        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

const requireAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
    }
    next();
};

module.exports = { authenticateToken, requireAuth };
