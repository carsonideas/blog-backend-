import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import blogRoutes from './routes/blog.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();

app.use(express.json());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN === '*' ? true : (process.env.CORS_ORIGIN || 'http://localhost:5173' ),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Welcome endpoint
app.get('/api', (_req, res) => {
  res.status(200).json({
    message: "Welcome to the Blog API",
    endpoints: {
      auth: '/api/auth/*',
      blogs: '/api/blogs/*',
      user: '/api/user/*'
    }
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/user', userRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({ message: "API is healthy and running" });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
