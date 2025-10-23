import express from "express";
import path from "path";
import expressEjsLayouts from "express-ejs-layouts";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import session from "express-session";
import rateLimit from "express-rate-limit";
import { setupI18n } from "./middleware/i18n.js";
import { sequelize } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import mahasiswaRoutes from "./routes/mahasiswa.js";
import adminRoutes from "./routes/admin.js";
import { errorHandler } from "./middleware/errorHandler.js";
import "./models/User.js";
import "./models/Mahasiswa.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security
app.use(helmet());
app.use(rateLimit({ windowMs: 60 * 1000, max: 300 }));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// i18n
await setupI18n(app);

// Views
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(expressEjsLayouts);
app.set("layout", "layouts/layout");

// Session for Admin UI
app.use(session({
  secret: process.env.SESSION_SECRET || "dev_session_secret",
  resave: false,
  saveUninitialized: false
}));

// Static
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => res.json({ message: "API OK" }));
app.use("/api/auth", authRoutes);
app.use("/api/mahasiswa", mahasiswaRoutes);
app.use("/admin", adminRoutes);

// Health check DB
sequelize.authenticate().then(() => console.log("DB connected")).catch(console.error);

// Error handler
app.use(errorHandler);

export default app;
