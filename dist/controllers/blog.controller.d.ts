import { Response } from 'express';
import AuthenticatedRequest from '../types/AuthenticatedRequest';
declare const _default: {
    getAllBlogs: (_req: AuthenticatedRequest, res: Response) => Promise<void>;
    getBlog: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    createBlog: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    updateBlog: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    deleteBlog: (req: AuthenticatedRequest, res: Response) => Promise<void>;
};
export default _default;
//# sourceMappingURL=blog.controller.d.ts.map