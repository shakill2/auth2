const express = require("express");
const app = express();

const authorizedTokens = new Map(); // Store token -> timestamp

// Function to clean up expired tokens
setInterval(() => {
    const currentTime = Math.floor(Date.now() / 1000);
    for (const [token, timestamp] of authorizedTokens.entries()) {
        if (currentTime - timestamp > 30) {
            authorizedTokens.delete(token);
        }
    }
}, 60000); // Run cleanup every 60s

app.use(express.json());

// Middleware to check authorization
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const currentTime = Math.floor(Date.now() / 1000);

    // Check if token exists and is recent
    if (authorizedTokens.has(authHeader)) {
        const tokenTime = authorizedTokens.get(authHeader);
        if (currentTime - tokenTime <= 30) {
            return next(); // Authorized
        } else {
            authorizedTokens.delete(authHeader); // Remove expired token
            return res.status(401).json({ error: "Unauthorized" });
        }
    }

    // Store new token with current timestamp
    authorizedTokens.set(authHeader, currentTime);
    next();
});

// Handle all requests
app.all("*", (req, res) => {
    res.json({ message: "You are authorized" });
});

// Export for Vercel
module.exports = app;
