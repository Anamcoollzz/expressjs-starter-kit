import express, { NextFunction } from 'express';
import { i18n, handle } from './config/i18n.js';
import path from 'path';
import expressEjsLayouts from 'express-ejs-layouts';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
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

// ---- Tambah typing untuk session.lang ----
declare module 'express-session' {
  interface SessionData {
    lang?: 'id' | 'en' | string;
  }
}

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

app.use(handle(i18n));

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

app.use((req: any, res, next) => {
  res.locals.session = req.session;
  next();
});

// Static
app.use(express.static(path.join(__dirname, 'public')));

// --- pilih bahasa dari session (prioritas), dengan fallback dari query/lang header ---
const SUPPORTED = new Set(['id', 'en']);

app.use((req, res, next) => {
  let chosen = req.session.lang;

  // allow override via query ?lang=id|en (mis. klik tombol switch)
  const q = (req.query.lang as string | undefined)?.toLowerCase();
  if (q && SUPPORTED.has(q)) {
    req.session.lang = q;
    chosen = q;
  }

  // fallback pertama kali: dari header Accept-Language
  if (!chosen) {
    const header = req.acceptsLanguages()?.[0]?.split('-')[0]?.toLowerCase();
    chosen = SUPPORTED.has(header || '') ? header : 'id';
    req.session.lang = chosen;
  }
  console.log('Session lang:', chosen);
  // sinkronkan i18n ke bahasa pilihan
  // @ts-ignore - `i18n` tersedia via middleware handle()
  if (req.i18n) req.i18n.changeLanguage(chosen);

  // buat tersedia di EJS
  // @ts-ignore - `t` tersedia via middleware
  res.locals.t = req.t;
  res.locals.lang = chosen;

  next();
});

// Routes
app.get('/', (req, res) => res.json({ message: 'API OK' }));
// --- route untuk switch bahasa secara eksplisit ---
app.get('/lang/:lng', (req, res) => {
  const lng = String(req.params.lng).toLowerCase();
  if (SUPPORTED.has(lng)) {
    req.session.lang = lng;
    // @ts-ignore
    if (req.i18n) req.i18n.changeLanguage(lng);
  }
  console.log('Switch lang to:', req.session.lang);
  // kembali ke halaman sebelumnya atau ke /
  const back = req.get('referer') || '/';
  req.session.save(() => res.redirect(back));
});
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

// Error handler
app.use(errorHandler);

export default app;
