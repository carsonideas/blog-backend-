import { Response, NextFunction } from 'express';
import AuthenticatedRequest from '../types/AuthenticatedRequest';
declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export default authenticateToken;
//# sourceMappingURL=auth.d.ts.map