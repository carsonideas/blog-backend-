import { Request } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        username: string;
        email: string;
    };
}
export default AuthenticatedRequest;
//# sourceMappingURL=AuthenticatedRequest.d.ts.map