import { router, protectedProcedure } from '../trpc/trpc';
import { z } from 'zod';
import { db } from '../db';
import { projects } from '../db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const projectsRouter = router({
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.select().from(projects)
        .where(eq(projects.userId, ctx.user.id))
        .orderBy(desc(projects.createdAt));
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [project] = await db.select().from(projects)
        .where(and(
          eq(projects.id, input.id),
          eq(projects.userId, ctx.user.id)
        ))
        .limit(1);
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      return project;
    }),

  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [project] = await db.insert(projects).values({
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        status: 'draft',
      }).returning();
      
      return project;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(['draft', 'music_generation', 'video_generation', 'editing', 'completed', 'published']).optional(),
      musicUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      
      const [project] = await db.update(projects)
        .set({ ...updateData, updatedAt: new Date() })
        .where(and(
          eq(projects.id, id),
          eq(projects.userId, ctx.user.id)
        ))
        .returning();
      
      if (!project) {
        throw new Error('Project not found');
      }
      
      return project;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db.delete(projects)
        .where(and(
          eq(projects.id, input.id),
          eq(projects.userId, ctx.user.id)
        ));
      
      return { success: true };
    }),
});

