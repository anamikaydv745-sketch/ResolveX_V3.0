import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import connectDB from "./config/db.js";
import wasteRoutes from "./routes/wasteRoutes.js";
import waterRoutes from "./routes/waterRoutes.js";

dotenv.config();
connectDB();

// Ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const app = express();

// Middleware

// --- CORS Configuration ---
const allowedOrigins = [
  'http://localhost:8080', // Your local frontend
  // Add your deployed frontend URL here when you have it
  // 'https://your-frontend-app.onrender.com' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allows cookies to be sent (if you use them)
  methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS', // Explicitly allow methods
  allowedHeaders: 'Content-Type,Authorization' // Explicitly allow headers
}));
app.options('*', cors());
// --- End CORS Configuration ---

app.use(express.json({ limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

// Simple logger (optional)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/waste", wasteRoutes);
app.use("/api/water", waterRoutes);

// Fallback route
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
