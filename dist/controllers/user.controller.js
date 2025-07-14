"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const updateUser = async (req, res) => {
    try {
        const { firstName, lastName, username, email } = req.body;
        const userId = req.user.id;
        if (username || email) {
            const existingUser = await prisma_1.default.user.findFirst({
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
        const updatedUser = await prisma_1.default.user.update({
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
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
    }
};
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            res.status(404).json({ message: "HOUSTON! Something went wrong!! noooo!!!! User not found" });
            return;
        }
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            res.status(400).json({ message: "HOUSTON! Something went wrong!! noooo!!!! Current password is incorrect" });
            return;
        }
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                password: hashedNewPassword,
                updatedAt: new Date()
            }
        });
        res.status(200).json({ message: "HOUSTON! Something went wrong!! noooo!!!! Password updated successfully" });
    }
    catch (error) {
        console.error("Update password error:", error);
        res.status(500).json({ message: "HOUSTON! Something went wrong!! noooo!!!!" });
    }
};
const getUserBlogs = async (req, res) => {
    try {
        const userId = req.user.id;
        const blogs = await prisma_1.default.blog.findMany({
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
    }
    catch (error) {
        console.error('Get user blogs error:', error);
        res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
    }
};
exports.default = {
    updateUser,
    updatePassword,
    getUserBlogs
};
//# sourceMappingURL=user.controller.js.map