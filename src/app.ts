import express from 'express';
import {
  i18n,
  setupI18n,
  middleware as i18nMiddleware,
} from './config/i18n.js';
import path from 'path';
import expressEjsLayouts from 'express-ejs-layouts';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { setupI18n } from './middleware/i18n.js';
import { sequelize } from './config/database.js';
import authRoutes from './routes/auth.js';
import mahasiswaRoutes from './routes/mahasiswa.js';
import adminRoutes from './routes/admin.js';
import adminAuthRoutes from './routes/admin-auth.js';
import { ensureAdminSession } from './middleware/adminSession.js';
import adminUsersRoutes from './routes/admin-users.js';
import adminRolesRoutes from './routes/admin-roles.js';
import adminPaymentsRoutes from './routes/admin-payments.js';
import exportAdminRoutes from './routes/export-admin.js';
import exportApiMahasiswa from './routes/export-api-mahasiswa.js';
import exportApiUsers from './routes/export-api-users.js';
import exportApiRoles from './routes/export-api-roles.js';
import exportApiPayments from './routes/export-api-payments.js';
import paymentsRoutes from './routes/payments.js';
import paymentsCoreRoutes from './routes/payments-core.js';
import userApiRoutes from './routes/users.js';
import { errorHandler } from './middleware/errorHandler.js';
import './models/User.js';
import './models/Mahasiswa.js';
import { randomBytes } from 'node:crypto';
import FileStoreFactory from 'session-file-store';
const FileStore = FileStoreFactory(session);

dotenv.config();
const app = express();

app.use(i18nMiddleware.handle(i18n));

// Expose t (translator) to all EJS views
app.use((req, res, next) => {
  // @ts-ignore
  res.locals.t = req.t ? req.t.bind(req) : (x: any) => x;
  next();
});

// Expose current language & URL to views
app.use((req, res, next) => {
  // @ts-ignore
  res.locals.lng = req.language || (req as any).lng || 'en';
  res.locals.url = req.originalUrl || '/';
  next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nonce = randomBytes(16).toString('base64');
// Security
// app.use(
//   helmet({
//     contentSecurityPolicy: {
//       useDefaults: true,
//       directives: {
//         'default-src': ["'self'"],
//         'script-src': [
//           "'self'",
//           `'nonce-${nonce}'`,
//           'https://cdn.jsdelivr.net',
//         ],
//         'style-src': ["'self'", `'nonce-${nonce}'`, 'https://cdn.jsdelivr.net'],
//         'img-src': ["'self'", 'data:'],
//         'font-src': ["'self'", 'https://cdn.jsdelivr.net'],
//         'connect-src': ["'self'", 'https://cdn.jsdelivr.net'], // <<< ini kuncinya
//         'object-src': ["'none'"],
//         'base-uri': ["'self'"],
//         'frame-ancestors': ["'self'"],
//       },
//     },
//   }),
// );
app.use((req, res, next) => {
  res.locals.cspNonce = nonce;
  // res.setHeader(
  //   'Content-Security-Policy',
  //   [
  //     "default-src 'self'",
  //     `script-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net`, // izinkan CDN kalau perlu
  //     "style-src 'self' https://cdn.jsdelivr.net", // tambah 'unsafe-inline' bila butuh inline CSS
  //     "img-src 'self' data:",
  //     "font-src 'self' https://cdn.jsdelivr.net",
  //     "object-src 'none'",
  //     "base-uri 'self'",
  //     "frame-ancestors 'self'",
  //   ].join('; '),
  // );
  next();
});
app.use(rateLimit({ windowMs: 60 * 1000, max: 300 }));

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// i18n

// Views
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressEjsLayouts);
app.set('layout', 'layouts/layout');

// Session for Admin UI
app.use(
  // session({
  //   secret: process.env.SESSION_SECRET || 'dev_session_secret',
  //   resave: false,
  //   saveUninitialized: false,
  // }),
  session({
    name: process.env.SESSION_NAME || 'sid',
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      path: path.join(process.cwd(), '.sessions'), // folder file session
      retries: 1,
    }),
    cookie: {
      maxAge: Number(process.env.SESSION_MAX_AGE) || 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
    },
  }),
);

app.use((req: any, res, next) => {
  // Anda bisa expose seluruh session (res.locals.session = req.session)
  // atau expose only what you need for safety (recommended).
  res.locals.session = req.session; // raw session (caution)
  // res.locals.user = req.session?.user ?? null; // contoh: user object
  // res.locals.lang = req.session?.lang ?? 'id'; // contoh: language setting
  next();
});

// Static
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => res.json({ message: 'API OK' }));
app.use('/api/auth', authRoutes);
app.use('/api/mahasiswa', mahasiswaRoutes);
app.use('/api/users', userApiRoutes);
app.use('/api/roles', adminRolesRoutes);
app.use('/admin', adminAuthRoutes);
app.use('/admin', ensureAdminSession, adminRoutes);
app.use('/admin/users', ensureAdminSession, adminUsersRoutes);
app.use('/admin/roles', ensureAdminSession, adminRolesRoutes);
app.use('/admin/payments', ensureAdminSession, adminPaymentsRoutes);
app.use('/admin/export', exportAdminRoutes);
app.use('/api/export/mahasiswa', exportApiMahasiswa);
app.use('/api/export/users', exportApiUsers);
app.use('/api/export/roles', exportApiRoles);
app.use('/api/export/payments', exportApiPayments);
app.use('/api/payments', paymentsRoutes);
app.use('/api/payments/core', paymentsCoreRoutes);

// Health check DB
sequelize
  .authenticate()
  .then(() => console.log('DB connected'))
  .catch(console.error);

// Error handler
app.use(errorHandler);

export default app;
