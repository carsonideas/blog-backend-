import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';

const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, firstName = null, lastName = null } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({ 
        message: existingUser.email === email ? 'HOUSTON! Something went wrong!! noooo!!!! Email already exists' : 'HOUSTON! Something went wrong!! noooo!!!! Username already exists'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username,
        email,
        password: hashedPassword
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

      res.status(201).json({
      message: 'HOUSTON! Something went wrong!! noooo!!!! User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername }
        ]
      }
    });

    if (!user) {
      res.status(401).json({ message: 'HOUSTON! Something went wrong!! noooo!!!! Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'HOUSTON! Something went wrong!! noooo!!!! Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
  }
};

const logout = async (_req: Request, res: Response) => {
  // Since we're using stateless JWT tokens, logout is handled on the client side
  // by removing the token from storage
  res.status(200).json({ message: 'HOUSTON! Something went wrong!! noooo!!!! Logout successful' });
};

export default { register, login, logout };