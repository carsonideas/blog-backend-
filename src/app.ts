

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import blogRoutes from './routes/blog.routes';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();

app.use(express.json());

// CORS configuration - improved to handle multiple origins
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all origins if CORS_ORIGIN is set to *
    if (process.env.CORS_ORIGIN === '*') {
      return callback(null, true);
    }
    
    // Allow specific origins
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173' // Vite default port
    ];
    
    if (allowedOrigins.includes(origin )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

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

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Global error handler:', err);
  
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ message: 'CORS policy violation' });
  }
  
  // Handle other errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({ message });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
