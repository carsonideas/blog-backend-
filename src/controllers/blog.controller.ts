import { Response } from 'express';
import prisma from '../utils/prisma';
import AuthenticatedRequest from '../types/AuthenticatedRequest';

const getAllBlogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search } = req.query;

    const blogs = await prisma.blog.findMany({
      where: {
        isDeleted: false,
        ...(search && {
          OR: [
            {
              title: {
                contains: search as string,
                mode: 'insensitive',
              },
            },
            {
              content: {
                contains: search as string,
                mode: 'insensitive',
              },
            },
            {
              author: {
                username: {
                  contains: search as string,
                  mode: 'insensitive',
                },
              },
            },
          ],
        }),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      message: 'Blogs retrieved successfully',
      blogs,
    });
  } catch (error) {
    console.error('Get all blogs error:', error);
    res.status(500).json({
      message: 'An error occurred while retrieving blogs. Please try again later.',
    });
  }
};

const getBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { blogId } = req.params;

    if (!blogId) {
      return res.status(400).json({ message: 'Blog ID is required' });
    }

    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!blog || blog.isDeleted) {
      return res.status(404).json({ message: 'Blog not found or has been deleted' });
    }

    res.status(200).json({
      message: 'Blog retrieved successfully',
      blog,
    });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({
      message: 'An error occurred while retrieving the blog. Please try again later.',
    });
  }
};

const createBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, imageUrl } = req.body;
    const authorId = req.user!.id;

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const blog = await prisma.blog.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        authorId,
        ...(imageUrl && imageUrl.trim() && { imageUrl: imageUrl.trim() }),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Blog created successfully',
      blog,
    });
  } catch (error) {
    console.error('Create blog error:', error);
    res.status(500).json({
      message: 'An error occurred while creating the blog. Please try again later.',
    });
  }
};

const updateBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { blogId } = req.params;
    const { title, content, imageUrl } = req.body;
    const userId = req.user!.id;

    if (!blogId) {
      return res.status(400).json({ message: 'Blog ID is required' });
    }

    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!existingBlog || existingBlog.isDeleted) {
      return res.status(404).json({ message: 'Blog not found or has been deleted' });
    }

    if (existingBlog.authorId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to update this blog' });
    }

    const updatedBlog = await prisma.blog.update({
      where: { id: blogId },
      data: {
        title: title.trim(),
        content: content.trim(),
        ...(imageUrl && imageUrl.trim() && { imageUrl: imageUrl.trim() }),
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            // profileImage: true,
          },
        },
      },
    });

    res.status(200).json({
      message: 'Blog updated successfully',
      blog: updatedBlog,
    });
  } catch (error) {
    console.error('Update blog error:', error);
    res.status(500).json({
      message: 'An error occurred while updating the blog. Please try again later.',
    });
  }
};

const deleteBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { blogId } = req.params;
    const userId = req.user!.id;

    if (!blogId) {
      return res.status(400).json({ message: 'Blog ID is required' });
    }

    const existingBlog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!existingBlog || existingBlog.isDeleted) {
      return res.status(404).json({ message: 'Blog not found or has been deleted' });
    }

    if (existingBlog.authorId !== userId) {
      return res.status(403).json({ message: 'You do not have permission to delete this blog' });
    }

    await prisma.blog.update({
      where: { id: blogId },
      data: {
        isDeleted: true,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({
      message: 'An error occurred while deleting the blog. Please try again later.',
    });
  }
};

export default {
  getAllBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
};