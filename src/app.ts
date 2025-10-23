import express from "express";
import { i18n, setupI18n, middleware as i18nMiddleware } from "./config/i18n.js";
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
import adminAuthRoutes from "./routes/admin-auth.js";
import { ensureAdminSession } from "./middleware/adminSession.js";
import adminUsersRoutes from "./routes/admin-users.js";
import adminRolesRoutes from "./routes/admin-roles.js";
import adminPaymentsRoutes from "./routes/admin-payments.js";
import exportAdminRoutes from "./routes/export-admin.js";
import exportApiMahasiswa from "./routes/export-api-mahasiswa.js";
import exportApiUsers from "./routes/export-api-users.js";
import exportApiRoles from "./routes/export-api-roles.js";
import exportApiPayments from "./routes/export-api-payments.js";
import paymentsRoutes from "./routes/payments.js";
import paymentsCoreRoutes from "./routes/payments-core.js";
import { errorHandler } from "./middleware/errorHandler.js";
import "./models/User.js";
import "./models/Mahasiswa.js";

dotenv.config();
const app = express();

app.use(i18nMiddleware.handle(i18n));

// Expose t (translator) to all EJS views
app.use((req, res, next) => {
  // @ts-ignore
  res.locals.t = req.t ? req.t.bind(req) : (x:any)=>x;
  next();
});

// Expose current language & URL to views
app.use((req, res, next) => {
  // @ts-ignore
  res.locals.lng = (req.language || (req as any).lng || 'en');
  res.locals.url = req.originalUrl || '/';
  next();
});

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
app.use("/admin", adminAuthRoutes);
app.use("/admin", ensureAdminSession, adminRoutes);
app.use("/admin/users", ensureAdminSession, adminUsersRoutes);
app.use("/admin/roles", ensureAdminSession, adminRolesRoutes);
app.use("/admin/payments", ensureAdminSession, adminPaymentsRoutes);
app.use("/admin/export", exportAdminRoutes);
app.use("/api/export/mahasiswa", exportApiMahasiswa);
app.use("/api/export/users", exportApiUsers);
app.use("/api/export/roles", exportApiRoles);
app.use("/api/export/payments", exportApiPayments);
app.use("/api/payments", paymentsRoutes);
app.use("/api/payments/core", paymentsCoreRoutes);

// Health check DB
sequelize.authenticate().then(() => console.log("DB connected")).catch(console.error);

// Error handler
app.use(errorHandler);

export default app;
