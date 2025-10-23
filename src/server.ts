import { setupI18n } from './config/i18n.js';
import { sequelize } from './config/database.js';
import app from './app.js';
import dotenv from 'dotenv';
dotenv.config();

// Bootstrap DB then start server (no top-level await)

// Single bootstrap: DB then server
(async () => {
  try {
    await setupI18n();
    await sequelize.authenticate();
    console.log('DB connection OK');
  } catch (e) {
    console.error('DB bootstrap error:', e);
  }
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () =>
    console.log(`Server running on http://localhost:${port}`),
  );
})();
