import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

// Configuration for CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);



app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Default/Health-check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is healthy and running',
  });
});

// Routes import
import userRouter from './routes/user.routes.js';
import projectRouter from './routes/project.routes.js';
import reportRouter from './routes/report.routes.js';
import taskRouter from './routes/task.routes.js';
import timelogRouter from './routes/timelog.route.js';
import adminpanelRouter from './routes/adminpanel.routes.js';

// Routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/reports", reportRouter);
app.use("/api/v1/task", taskRouter);
app.use("/api/v1/timelog", timelogRouter);
app.use("/api/v1/adminpanel", adminpanelRouter);



// Global Error Handler — catches all errors from next(error)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
  });
});

export { app };

