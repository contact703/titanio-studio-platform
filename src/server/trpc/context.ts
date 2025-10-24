import { type CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { AuthService } from '../services/auth.service';

export async function createContext({ req, res }: CreateExpressContextOptions) {
  // Get token from Authorization header
  const token = req.headers.authorization?.replace('Bearer ', '');

  let user = null;

  if (token) {
    try {
      const decoded = await AuthService.verifyToken(token);
      user = await AuthService.getUserById(decoded.userId);
    } catch (error) {
      // Token invalid or expired, user remains null
      console.log('Invalid token:', error);
    }
  }

  return {
    req,
    res,
    user,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

