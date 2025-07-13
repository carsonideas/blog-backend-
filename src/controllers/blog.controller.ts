import { Response } from 'express';
import prisma from '../utils/prisma';
import AuthenticatedRequest from '../types/AuthenticatedRequest';

const getAllBlogs = async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const blogs = await prisma.blog.findMany({
      where: {
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
      message: 'Blogs retrieved successfully',
      blogs
    });
  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
  }
};

const getBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { blogId } = req.params;

    const blog = await prisma.blog.findUnique({
      where: {
        id: blogId
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
      }
    });

    if (!blog || blog.isDeleted) {
      res.status(404).json({ message: 'HOUSTON! Something went wrong!! noooo!!!! Blog not found' });
      return;
    }

    res.status(200).json({
      message: 'HOUSTON! Something went wrong!! noooo!!!! Blog retrieved successfully',
      blog
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
  }
};

const createBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, synopsis, content, featuredImageUrl } = req.body;
    const authorId = req.user!.id;

    const blog = await prisma.blog.create({
      data: {
        title,
        synopsis,
        content,
        featuredImageUrl,
        authorId
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
      }
    });

    res.status(201).json({
      message: "HOUSTON! Something went wrong!! noooo!!!! Blog created successfully",
      blog
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
  }
};

const updateBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { blogId } = req.params;
    const { title, synopsis, content, featuredImageUrl } = req.body;
    const userId = req.user!.id;

    // Check if blog exists and belongs to the user
    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId }
    });

    if (!existingBlog || existingBlog.isDeleted) {
      res.status(404).json({ message: 'HOUSTON! Something went wrong!! noooo!!!! Blog not found' });
      return;
    }

    if (existingBlog.authorId !== userId) {
      res.status(403).json({ message: 'HOUSTON! Something went wrong!! noooo!!!! You can only update your own blogs' });
      return;
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        title,
        synopsis,
        content,
        featuredImageUrl,
        updatedAt: new Date()
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
      }
    });

    res.status(200).json({
      message: "HOUSTON! Something went wrong!! noooo!!!! Blog updated successfully",
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
  }
};

const deleteBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = req.user!.id;

    // Check if blog exists and belongs to the user
    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId }
    });

    if (!existingBlog || existingBlog.isDeleted) {
      res.status(404).json({ message: 'HOUSTON! Something went wrong!! noooo!!!! Blog not found' });
      return;
    }

    if (existingBlog.authorId !== userId) {
      res.status(403).json({ message: 'HOUSTON! Something went wrong!! noooo!!!! You can only delete your own blogs' });
      return;
    }

    // Soft delete - mark as deleted instead of actually deleting
    await prisma.blog.update({
      where: { id: blogId },
      data: {
        isDeleted: true,
        updatedAt: new Date()
      }
    });

    res.status(200).json({ message: "HOUSTON! Something went wrong!! noooo!!!! Blog deleted successfully" });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ message: "HOUSTON! Something went wrong!! noooo!!!!" });
  }
};

export default {
  getAllBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog
};

