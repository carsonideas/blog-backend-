"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const register = async (req, res) => {
    try {
        const { username, email, password, firstName = null, lastName = null } = req.body;
        const existingUser = await prisma_1.default.user.findFirst({
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
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.default.user.create({
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
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'HOUSTON! Something went wrong!! noooo!!!! User registered successfully',
            user,
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
    }
};
const login = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;
        const user = await prisma_1.default.user.findFirst({
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
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'HOUSTON! Something went wrong!! noooo!!!! Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        const { password: _, ...userWithoutPassword } = user;
        res.status(200).json({
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'HOUSTON! Something went wrong!! noooo!!!!' });
    }
};
const logout = async (_req, res) => {
    res.status(200).json({ message: 'HOUSTON! Something went wrong!! noooo!!!! Logout successful' });
};
exports.default = { register, login, logout };
//# sourceMappingURL=auth.controller.js.map