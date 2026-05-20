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
import authRouter from './modules/auth/auth.routes.js';
import userRouter from './modules/user/user.routes.js';
import connectDB from './db/connection.db.js';
import cors from 'cors';
import { successResponse } from './utils/response/response.js';
import {
  globalErrorHandler,
  notFoundHandler,
} from './middleware/error.middleware.js';

const bootstrap = async () => {
  const app = express();
  const port = process.env.PORT || 5000;

  //========================================== 📚 Database Connection ==========================================
  await connectDB();

  //========================================== 🧰 Global Middlewares ==========================================
  app.use(cors());
  app.use(express.json());

  //========================================== 🌐 Routes ==========================================
  app.get('/', (req, res) => {
    successResponse({ res, message: 'Welcome to Washweshny App 💖' });
  });

  //========================================== 🧑‍🤝‍🧑 Module Routes ==========================================
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);

  //========================================== ❌ Not Found Handler ==========================================
  app.all('{/*dummy}', notFoundHandler);

  //========================================== 🧯 Global Error Handler ==========================================
  app.use(globalErrorHandler);

  //========================================== 🚀 Start Server ==========================================
  app.listen(port, () => {
    console.log(colors.bgBrightCyan(`Server listening on port ${port} 🚀`));
  });
};

export default bootstrap;
