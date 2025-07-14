"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = __importDefault(require("../controllers/blog.controller"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const router = (0, express_1.Router)();
router.get('/', blog_controller_1.default.getAllBlogs);
router.get('/:blogId', blog_controller_1.default.getBlog);
router.post("/", auth_1.default, blog_controller_1.default.createBlog);
router.patch("/:blogId", auth_1.default, blog_controller_1.default.updateBlog);
router.delete('/:blogId', auth_1.default, blog_controller_1.default.deleteBlog);
exports.default = router;
//# sourceMappingURL=blog.routes.js.map