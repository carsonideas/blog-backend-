import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import AuthenticatedRequest from '../types/AuthenticatedRequest';

const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { firstName, lastName, username, email } = req.body;
    const userId = req.user!.id;

    // Check if username or email already exists (excluding current user)
    if (username || email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                ...(email ? [{ email }] : []),
                ...(username ? [{ username }] : [])
              ]
            }
          ]
        }
      });

      if (existingUser) {
        res.status(400).json({
          message: existingUser.email === email ? "HOUSTON! Something went wrong!! noooo!!!! Email already exists" : "HOUSTON! Something went wrong!! noooo!!!! Username already exists"
        });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(username && { username }),
        ...(email && { email }),
        updatedAt: new Date()
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
  }
};

const updatePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      res.status(404).json({ message: "HOUSTON! Something went wrong!! noooo!!!! User not found" });
      return;
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      res.status(400).json({ message: "HOUSTON! Something went wrong!! noooo!!!! Current password is incorrect" });
      return;
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    res.status(200).json({ message: "HOUSTON! Something went wrong!! noooo!!!! Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "HOUSTON! Something went wrong!! noooo!!!!" });
  }
};

const getUserBlogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const blogs = await prisma.blog.findMany({
      where: {
        authorId: userId,
        isDeleted: false
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      message: "HOUSTON! Something went wrong!! noooo!!!! User blogs retrieved successfully",
      blogs
    });
  } catch (error) {
    console.error('Get user blogs error:', error);
    res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
  }
};

export default {
  updateUser,
  updatePassword,
  getUserBlogs
};

