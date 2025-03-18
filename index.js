const express = require("express");
const app = express();

// Middleware to check for Authorization header
app.use((req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
});

// Example route
app.get("/", (req, res) => {
    res.json({ message: "Welcome! You are authorized." });
});

// Example route
app.post("/", (req, res) => {
    res.json({ message: "Welcome! You are authorized." });
});

// Start server (for local testing)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Export for Vercel
module.exports = app;

