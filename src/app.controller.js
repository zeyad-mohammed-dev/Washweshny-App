//========================================== 🌍 Environment Configuration ==========================================
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Select env file based on NODE_ENV
const envFile =
  process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev';

// Load env variables BEFORE anything else
dotenv.config({
  path: path.join(__dirname, 'config', envFile),
});

import express from 'express';
import colors from 'colors';
import authController from './modules/auth/auth.controller.js';
import userController from './modules/user/user.controller.js';
import connectDB from './DB/connection.db.js';

const bootstrap = async () => {
  const app = express();
  const port = process.env.PORT || 5000;

  //========================================== 📚 Database Connection ==========================================
  await connectDB();

  //========================================== 🧰 Global Middlewares ==========================================
  app.use(express.json());

  //========================================== 🌐 Routes ==========================================
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Washweshny App 💖' });
  });

  app.use('/auth', authController);
  app.use('/user', userController);

  //========================================== ❌ Not Found Handler ==========================================
  app.all('{/*dummy}', (req, res) => {
    res.status(404).json({ message: 'Route not found 🚫' });
  });

  //========================================== 🧯 Global Error Handler ==========================================
  app.use((error, req, res, next) => {
    console.log(colors.red({ error_stack: error.stack }));
    res.status(error.cause || 400).json({
      message: error.message,
    });
  });

  //========================================== 🚀 Start Server ==========================================
  app.listen(port, () => {
    console.log(colors.bgBrightCyan(`Server listening on port ${port} 🚀`));
  });
};

export default bootstrap;
