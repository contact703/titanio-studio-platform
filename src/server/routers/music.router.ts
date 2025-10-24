import { router, protectedProcedure } from '../trpc/trpc';
import { z } from 'zod';
import { db } from '../db';
import { musicGenerations, projects } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { SunoService } from '../services/suno.service';
import { MusicGPTService } from '../services/musicgpt.service';

export const musicRouter = router({
  generate: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      provider: z.enum(['suno', 'musicgpt']),
      prompt: z.string().min(10),
      genre: z.string().optional(),
      mood: z.string().optional(),
      duration: z.number().optional(),
      instrumental: z.boolean().optional(),
      customLyrics: z.string().optional(),
      needStems: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify project ownership
      const [project] = await db.select().from(projects)
        .where(and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.user.id)
        ))
        .limit(1);
      
      if (!project) {
        throw new Error('Project not found');
      }

      // Generate music based on provider
      let result;
      let cost;
      
      if (input.provider === 'suno') {
        result = await SunoService.generateMusic({
          prompt: input.prompt,
          genre: input.genre,
          mood: input.mood,
          duration: input.duration,
          instrumental: input.instrumental,
          customLyrics: input.customLyrics,
        });
        cost = SunoService.getPricing().cost;
      } else {
        result = await MusicGPTService.generateMusic({
          prompt: input.prompt,
          genre: input.genre,
          mood: input.mood,
          duration: input.duration,
          instrumental: input.instrumental,
          needStems: input.needStems,
        });
        cost = MusicGPTService.getPricing().cost;
      }

      // Save to database
      const [generation] = await db.insert(musicGenerations).values({
        projectId: input.projectId,
        provider: input.provider,
        prompt: input.prompt,
        genre: input.genre,
        mood: input.mood,
        duration: input.duration,
        status: result.status,
        cost,
      }).returning();

      return generation;
    }),

  checkStatus: protectedProcedure
    .input(z.object({
      generationId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const [generation] = await db.select().from(musicGenerations)
        .where(eq(musicGenerations.id, input.generationId))
        .limit(1);
      
      if (!generation) {
        throw new Error('Generation not found');
      }

      // Check status with provider
      let result;
      if (generation.provider === 'suno') {
        result = await SunoService.checkStatus(generation.id);
      } else {
        result = await MusicGPTService.checkStatus(generation.id);
      }

      // Update database if completed
      if (result.status === 'completed' || result.status === 'failed') {
        await db.update(musicGenerations)
          .set({
            status: result.status,
            resultUrl: result.status === 'completed' ? (result.audioUrl || result.audioUrls?.[0]) : null,
            stemsUrl: result.stemsUrl,
            errorMessage: result.errorMessage,
            completedAt: new Date(),
          })
          .where(eq(musicGenerations.id, generation.id));
      }

      return result;
    }),

  list: protectedProcedure
    .input(z.object({
      projectId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // Verify project ownership
      const [project] = await db.select().from(projects)
        .where(and(
          eq(projects.id, input.projectId),
          eq(projects.userId, ctx.user.id)
        ))
        .limit(1);
      
      if (!project) {
        throw new Error('Project not found');
      }

      return await db.select().from(musicGenerations)
        .where(eq(musicGenerations.projectId, input.projectId));
    }),

  separateStems: protectedProcedure
    .input(z.object({
      audioUrl: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      return await MusicGPTService.separateStems(input.audioUrl);
    }),
});

