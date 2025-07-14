"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_1 = __importDefault(require("../middlewares/auth"));
const router = (0, express_1.Router)();
router.patch("/", auth_1.default, user_controller_1.default.updateUser);
router.patch("/password", auth_1.default, user_controller_1.default.updatePassword);
router.get('/blogs', auth_1.default, user_controller_1.default.getUserBlogs);
exports.default = router;
//# sourceMappingURL=user.routes.js.map