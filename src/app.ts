import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import blogRoutes from './routes/blog.routes';
import userRoutes from './routes/user.routes';

const app = express();

app.use(express.json());


// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/user', userRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({ message: "HOUSTON! Something went wrong!! noooo!!!! Blog API is running!" });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ message: "HOUSTON! Something went wrong!! noooo!!!! Route not found" });
});

export default app;

