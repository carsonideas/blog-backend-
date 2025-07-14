"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const blog_routes_1 = __importDefault(require("./routes/blog.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000/',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.get('/', (_req, res) => {
    res.status(200).json({
        message: "Welcome to the Blog API",
        endpoints: {
            auth: "/api/auth",
            blogs: "/api/blogs",
            user: "/api/user",
            health: "/health"
        }
    });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/blogs', blog_routes_1.default);
app.use('/api/user', user_routes_1.default);
app.get('/health', (_req, res) => {
    res.status(200).json({ message: "HOUSTON! Something went wrong!! noooo!!!! Blog API is running!" });
});
app.use('*', (_req, res) => {
    res.status(404).json({ message: "HOUSTON! Something went wrong!! noooo!!!! Route not found" });
});
exports.default = app;
//# sourceMappingURL=app.js.map