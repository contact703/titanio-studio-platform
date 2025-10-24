import { router, protectedProcedure, publicProcedure } from '../trpc/trpc';
import { z } from 'zod';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { videoGenerations, publications, adCampaigns, legalConversations, payments } from '../db/schema';
import { YouTubeService } from '../services/youtube.service';
import { SpotifyService } from '../services/spotify.service';
import { TikTokService, MetaService } from '../services/social-media.service';
import { GoogleAdsService } from '../services/googleads.service';
import { LegalAgentService } from '../services/legal-agent.service';

// VIDEO ROUTER
export const videoRouter = router({
  generate: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      provider: z.enum(['kling', 'runway', 'invideo']),
      prompt: z.string(),
      musicUrl: z.string().optional(),
      style: z.string().optional(),
      resolution: z.enum(['1080p', '4k']).optional(),
    }))
    .mutation(async ({ input }) => {
      // Placeholder - implement actual video generation
      const [generation] = await db.insert(videoGenerations).values({
        projectId: input.projectId,
        provider: input.provider,
        prompt: input.prompt,
        musicUrl: input.musicUrl,
        style: input.style,
        resolution: input.resolution || '1080p',
        status: 'pending',
        cost: 1500, // $15.00
      }).returning();
      
      return generation;
    }),
});

// PUBLICATIONS ROUTER
export const publicationsRouter = router({
  publishToYouTube: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      title: z.string(),
      description: z.string(),
      videoUrl: z.string(),
      accessToken: z.string(),
      refreshToken: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const result = await YouTubeService.uploadVideo(
        {
          title: input.title,
          description: input.description,
          videoUrl: input.videoUrl,
          privacyStatus: 'public',
        },
        input.accessToken,
        input.refreshToken
      );

      const [publication] = await db.insert(publications).values({
        projectId: input.projectId,
        platform: 'youtube',
        platformId: result.videoId,
        url: result.url,
        status: 'published',
        publishedAt: new Date(),
      }).returning();

      return publication;
    }),

  publishToTikTok: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      videoUrl: z.string(),
      accessToken: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = await TikTokService.uploadVideo(
        input.accessToken,
        input.videoUrl,
        input.title,
        input.description
      );

      const [publication] = await db.insert(publications).values({
        projectId: input.projectId,
        platform: 'tiktok',
        platformId: result.videoId,
        url: result.url,
        status: 'published',
        publishedAt: new Date(),
      }).returning();

      return publication;
    }),

  getSpotifyDistributionInfo: publicProcedure
    .query(() => {
      return SpotifyService.getDistributionInfo();
    }),
});

// ADS ROUTER
export const adsRouter = router({
  createCampaign: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      name: z.string(),
      budget: z.number(),
      keywords: z.array(z.string()),
      adCopy: z.object({
        headlines: z.array(z.string()),
        descriptions: z.array(z.string()),
      }),
      targetUrl: z.string(),
    }))
    .mutation(async ({ input }) => {
      const result = await GoogleAdsService.createCampaign({
        name: input.name,
        budget: input.budget,
        keywords: input.keywords,
        adCopy: input.adCopy,
        targetUrl: input.targetUrl,
      });

      const [campaign] = await db.insert(adCampaigns).values({
        projectId: input.projectId,
        campaignName: input.name,
        budget: input.budget,
        status: 'draft',
        googleCampaignId: result.campaignId,
      }).returning();

      return campaign;
    }),

  getCampaignStats: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input }) => {
      return await GoogleAdsService.getCampaignStats(input.campaignId);
    }),
});

// LEGAL ROUTER
export const legalRouter = router({
  askQuestion: protectedProcedure
    .input(z.object({
      question: z.string().min(10),
      context: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await LegalAgentService.answerQuestion({
        question: input.question,
        context: input.context,
      });

      const [conversation] = await db.insert(legalConversations).values({
        userId: ctx.user.id,
        question: input.question,
        answer: result.answer,
        references: result.references,
        category: result.category,
      }).returning();

      return { ...result, conversationId: conversation.id };
    }),

  getCommonQuestions: publicProcedure
    .query(() => {
      return LegalAgentService.getCommonQuestions();
    }),

  getHistory: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.select().from(legalConversations)
        .where(eq(legalConversations.userId, ctx.user.id));
    }),
});

// PAYMENTS ROUTER
export const paymentsRouter = router({
  createPayment: protectedProcedure
    .input(z.object({
      amount: z.number(),
      projectId: z.string().optional(),
      description: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Placeholder - implement Stripe integration
      const [payment] = await db.insert(payments).values({
        userId: ctx.user.id,
        projectId: input.projectId,
        amount: input.amount,
        currency: 'usd',
        status: 'pending',
        description: input.description,
      }).returning();

      return payment;
    }),

  getPaymentHistory: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.select().from(payments)
        .where(eq(payments.userId, ctx.user.id));
    }),
});

