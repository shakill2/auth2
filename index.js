const express = require("express");
const app = express();

const authorizedTokens = new Map(); // Store token -> timestamp

// Function to clean up expired tokens
setInterval(() => {
    const currentTime = Math.floor(Date.now() / 1000);
    console.log(`[Cleanup] currentTime: ${currentTime}`);
    for (const [token, timestamp] of authorizedTokens.entries()) {
        if (currentTime - timestamp > 30) {
            console.log(`[Cleanup] Token expired and removed: ${token}`);
            authorizedTokens.delete(token);
        }
    }
}, 60000); // Run cleanup every 60s

app.use(express.json());

// Middleware to check authorization
app.use((req, res, next) => {
    const authHeader = req.headers.authorization;
    const currentTime = Math.floor(Date.now() / 1000);

    if (!authHeader) {
        console.log("[Auth] No Authorization header, rejecting request.");
        res.setHeader("WWW-Authenticate", 'Bearer error="invalid_token, error_description="Your access token has expired. Please renew it before submitting the request."');
        return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if token exists and is recent
    if (authorizedTokens.has(authHeader)) {
        const tokenTime = authorizedTokens.get(authHeader);
        if (currentTime - tokenTime <= 30) {
            console.log(`[Auth] Token authorized: ${authHeader}`);
            return next(); // Authorized
        } else {
            console.log(`[Auth] Token expired: ${authHeader}`);
            authorizedTokens.delete(authHeader); // Remove expired token
            res.setHeader("WWW-Authenticate", 'Bearer error="invalid_token, error_description="Your access token has expired. Please renew it before submitting the request."');
            return res.status(401).json({ error: "Unauthorized" });
        }
    }

    // Store new token with current timestamp
    console.log(`[Auth] New token stored: ${authHeader}`);
    authorizedTokens.set(authHeader, currentTime);
    next();
});

// Handle all requests
app.all("*", (req, res) => {
    console.log(`authorized`);
    res.json({ message: "You are authorized" });
});

// Export for Vercel
module.exports = app;
