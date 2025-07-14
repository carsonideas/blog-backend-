"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../utils/prisma"));
const getAllBlogs = async (_req, res) => {
    try {
        const blogs = await prisma_1.default.blog.findMany({
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
    }
    catch (error) {
        console.error('Get all blogs error:', error);
        res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
    }
};
const getBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const blog = await prisma_1.default.blog.findUnique({
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
    }
    catch (error) {
        console.error('Get blog error:', error);
        res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
    }
};
const createBlog = async (req, res) => {
    try {
        const { title, synopsis, content, featuredImageUrl } = req.body;
        const authorId = req.user.id;
        const blog = await prisma_1.default.blog.create({
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
    }
    catch (error) {
        console.error('Create blog error:', error);
        res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
    }
};
const updateBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { title, synopsis, content, featuredImageUrl } = req.body;
        const userId = req.user.id;
        const existingBlog = await prisma_1.default.blog.findUnique({
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
        const updatedBlog = await prisma_1.default.blog.update({
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
    }
    catch (error) {
        console.error('Update blog error:', error);
        res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
    }
};
const deleteBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const userId = req.user.id;
        const existingBlog = await prisma_1.default.blog.findUnique({
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
        await prisma_1.default.blog.update({
            where: { id: blogId },
            data: {
                isDeleted: true,
                updatedAt: new Date()
            }
        });
        res.status(200).json({ message: "HOUSTON! Something went wrong!! noooo!!!! Blog deleted successfully" });
    }
    catch (error) {
        console.error("Delete blog error:", error);
        res.status(500).json({ message: "HOUSTON! Something went wrong!! noooo!!!!" });
    }
};
exports.default = {
    getAllBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog
};
//# sourceMappingURL=blog.controller.js.map