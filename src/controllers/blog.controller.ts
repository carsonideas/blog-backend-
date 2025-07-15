
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
            firstName: true,
            lastName: true,
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

    console.log('Get blog request received for ID:', blogId);

    if (!blogId) {
      console.error('Get blog error: Blog ID is required');
      return res.status(400).json({ message: 'Blog ID is required' });
    }

    console.log('Fetching blog from database...');
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    console.log('Blog fetched:', blog ? 'Found' : 'Not found');

    if (!blog) {
      console.error('Get blog error: Blog not found');
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.isDeleted) {
      console.error('Get blog error: Blog has been deleted');
      return res.status(404).json({ message: 'Blog has been deleted' });
    }

    console.log('Returning blog successfully');
    res.status(200).json({
      message: 'Blog retrieved successfully',
      blog,
    });
  } catch (error) {
    console.error('Get blog error - Full error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({
      message: 'An error occurred while retrieving the blog. Please try again later.',
    });
  }
};

const createBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log('Create blog request received:', {
      body: req.body,
      headers: req.headers
    });

    const { title, content, imageUrl, user } = req.body;
    const authorId = user?.id;

    // Validate user authentication
    if (!user || !authorId) {
      console.error('Create blog error: User not authenticated');
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate required fields
    if (!title || typeof title !== 'string' || !title.trim()) {
      console.error('Create blog error: Title is required');
      return res.status(400).json({ message: 'Title is required' });
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      console.error('Create blog error: Content is required');
      return res.status(400).json({ message: 'Content is required' });
    }

    // Validate title length
    if (title.trim().length < 3 || title.trim().length > 100) {
      console.error('Create blog error: Title length invalid');
      return res.status(400).json({ message: 'Title must be between 3 and 100 characters' });
    }

    // Validate content length
    if (content.trim().length < 100) {
      console.error('Create blog error: Content too short');
      return res.status(400).json({ message: 'Content must be at least 100 characters long' });
    }

    console.log('Creating blog with data:', {
      title: title.trim(),
      content: content.trim().substring(0, 100) + '...',
      authorId,
      imageUrl: imageUrl?.trim()
    });

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
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    console.log('Blog created successfully:', blog.id);

    res.status(201).json({
      message: 'Blog created successfully',
      blog,
    });
  } catch (error) {
    console.error('Create blog error - Full error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    res.status(500).json({
      message: 'An error occurred while creating the blog. Please try again later.',
    });
  }
};

const updateBlog = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { blogId } = req.params;
    const { title, content, imageUrl, user } = req.body;
    const userId = user?.id;

    if (!blogId) {
      return res.status(400).json({ message: 'Blog ID is required' });
    }

    if (!user || !userId) {
      return res.status(401).json({ message: 'User not authenticated' });
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
            firstName: true,
            lastName: true,
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
    const { user } = req.body;
    const userId = user?.id;

    if (!blogId) {
      return res.status(400).json({ message: 'Blog ID is required' });
    }

    if (!user || !userId) {
      return res.status(401).json({ message: 'User not authenticated' });
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