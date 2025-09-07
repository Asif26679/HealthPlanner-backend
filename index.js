import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./src/db/db.js";

dotenv.config();
connectDB();

const app = express();

// CORS setup: allow React frontend
const corsOptions = {
  origin: "http://localhost:5173",
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
app.listen(PORT, "127.0.0.1", () =>
  console.log(`Server running on port ${PORT}`)
);