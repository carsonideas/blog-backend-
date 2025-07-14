

import { Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import AuthenticatedRequest from '../types/AuthenticatedRequest';

const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        // profileImage: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile retrieved successfully',
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to retrieve profile' });
  }
};

const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { firstName, lastName, username, email } = req.body;
    const userId = req.user!.id;

    // Validate firstName and lastName if provided
    const nameRegex = /^[a-zA-Z\s]+$/;
    
    if (firstName !== undefined) {
      if (!firstName.trim() || firstName.trim().length < 2) {
        return res.status(400).json({ message: 'First name must be at least 2 characters long' });
      }
      if (!nameRegex.test(firstName.trim())) {
        return res.status(400).json({ message: 'First name can only contain letters and spaces' });
      }
    }

    if (lastName !== undefined) {
      if (!lastName.trim() || lastName.trim().length < 2) {
        return res.status(400).json({ message: 'Last name must be at least 2 characters long' });
      }
      if (!nameRegex.test(lastName.trim())) {
        return res.status(400).json({ message: 'Last name can only contain letters and spaces' });
      }
    }

    // Check if username or email already exists (excluding current user)
    if (username || email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                ...(email ? [{ email: email.trim() }] : []),
                ...(username ? [{ username: username.trim() }] : [])
              ]
            }
          ]
        }
      });

      if (existingUser) {
        return res.status(400).json({
          message: existingUser.email === email ? "Email already exists" : "Username already exists"
        });
      }
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();
    if (username !== undefined) updateData.username = username.trim();
    if (email !== undefined) updateData.email = email.trim();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        // profileImage: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

const updatePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
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

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({ message: "Failed to update password" });
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
      message: "User blogs retrieved successfully",
      blogs
    });
  } catch (error) {
    console.error('Get user blogs error:', error);
    res.status(500).json({ message: 'Failed to retrieve user blogs' });
  }
};

export default {
  getProfile,
  updateProfile,
  updatePassword,
  getUserBlogs
};
