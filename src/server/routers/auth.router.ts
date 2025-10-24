import { router, publicProcedure, protectedProcedure } from '../trpc/trpc';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';

export const authRouter = router({
  register: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(2),
    }))
    .mutation(async ({ input }) => {
      return await AuthService.register(input);
    }),

  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await AuthService.login(input.email, input.password);
    }),

  me: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.user;
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(2).optional(),
      avatar: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Update user profile logic here
      return { success: true, message: 'Profile updated' };
    }),
});

