import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./src/db/db.js";

dotenv.config();
connectDB();

const app = express();

// CORS setup: allow React frontend
const allowedOrigins = [
  "https://health-planner-frontend-2yyfs6wrl-asif26679s-projects.vercel.app",
  "https://health-planner-frontend-w1t117gho-asif26679s-projects.vercel.app",
  "http://localhost:5173", // local dev
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

// Test route
import userRoutes from "./src/routes/auth.js";
import dietRoutes from './src/routes/dietRoute.js'
import chatRoutes from './src/routes/chatRoute.js'
app.use('/api/dites',dietRoutes)
app.use("/api/users", userRoutes);
app.use("/api", chatRoutes);
app.get("/", (req, res) => res.send("API Running"));

// Start server on all interfaces (IPv4)
const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);