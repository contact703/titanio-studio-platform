import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';

// Users table
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('user'), // user, admin
  avatar: text('avatar'),
  plan: text('plan', { enum: ['free', 'basic', 'standard', 'premium'] }).notNull().default('free'),
  credits: integer('credits').notNull().default(100),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Projects table
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('draft'), // draft, music_generation, video_generation, editing, completed, published
  musicUrl: text('music_url'),
  musicProvider: text('music_provider'), // suno, musicgpt, upload
  videoUrl: text('video_url'),
  videoProvider: text('video_provider'), // kling, runway, invideo
  thumbnailUrl: text('thumbnail_url'),
  duration: integer('duration'), // in seconds
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Music Generation table
export const musicGenerations = sqliteTable('music_generations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  projectId: text('project_id').notNull().references(() => projects.id),
  provider: text('provider').notNull(), // suno, musicgpt
  prompt: text('prompt').notNull(),
  genre: text('genre'),
  mood: text('mood'),
  duration: integer('duration'),
  status: text('status').notNull().default('pending'), // pending, processing, completed, failed
  resultUrl: text('result_url'),
  stemsUrl: text('stems_url'), // for MusicGPT
  cost: integer('cost'), // in cents
  metadata: text('metadata', { mode: 'json' }),
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// Video Generation table
export const videoGenerations = sqliteTable('video_generations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  projectId: text('project_id').notNull().references(() => projects.id),
  provider: text('provider').notNull(), // kling, runway, invideo
  prompt: text('prompt').notNull(),
  musicUrl: text('music_url'),
  style: text('style'),
  resolution: text('resolution'), // 1080p, 4k
  status: text('status').notNull().default('pending'),
  resultUrl: text('result_url'),
  cost: integer('cost'),
  metadata: text('metadata', { mode: 'json' }),
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// Publications table (social media)
export const publications = sqliteTable('publications', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  projectId: text('project_id').notNull().references(() => projects.id),
  platform: text('platform').notNull(), // youtube, tiktok, instagram, facebook, spotify, apple_music, deezer
  platformId: text('platform_id'), // ID on the platform
  url: text('url'),
  status: text('status').notNull().default('pending'), // pending, scheduled, published, failed
  scheduledFor: integer('scheduled_for', { mode: 'timestamp' }),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  metadata: text('metadata', { mode: 'json' }),
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Google Ads Campaigns table
export const adCampaigns = sqliteTable('ad_campaigns', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  projectId: text('project_id').notNull().references(() => projects.id),
  campaignName: text('campaign_name').notNull(),
  budget: integer('budget').notNull(), // daily budget in cents
  status: text('status').notNull().default('draft'), // draft, active, paused, completed
  googleCampaignId: text('google_campaign_id'),
  impressions: integer('impressions').default(0),
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),
  spent: integer('spent').default(0), // in cents
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  endedAt: integer('ended_at', { mode: 'timestamp' }),
});

// Legal Agent Conversations table
export const legalConversations = sqliteTable('legal_conversations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  references: text('references', { mode: 'json' }), // JSON with legal references
  category: text('category'), // copyright, licensing, fair_use, etc
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Payments table
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  projectId: text('project_id').references(() => projects.id),
  amount: integer('amount').notNull(), // in cents
  currency: text('currency').notNull().default('usd'),
  status: text('status').notNull().default('pending'), // pending, completed, failed, refunded
  stripePaymentId: text('stripe_payment_id'),
  stripeCustomerId: text('stripe_customer_id'),
  description: text('description'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// API Integrations table (store OAuth tokens)
export const apiIntegrations = sqliteTable('api_integrations', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  platform: text('platform').notNull(), // youtube, spotify, tiktok, etc
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  scope: text('scope'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Credit Transactions table
export const creditTransactions = sqliteTable('credit_transactions', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').notNull().references(() => users.id),
  amount: integer('amount').notNull(),
  type: text('type', { enum: ['purchase', 'usage', 'refund', 'bonus'] }).notNull(),
  description: text('description').notNull(),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type MusicGeneration = typeof musicGenerations.$inferSelect;
export type NewMusicGeneration = typeof musicGenerations.$inferInsert;
export type VideoGeneration = typeof videoGenerations.$inferSelect;
export type NewVideoGeneration = typeof videoGenerations.$inferInsert;
export type Publication = typeof publications.$inferSelect;
export type NewPublication = typeof publications.$inferInsert;
export type AdCampaign = typeof adCampaigns.$inferSelect;
export type NewAdCampaign = typeof adCampaigns.$inferInsert;
export type LegalConversation = typeof legalConversations.$inferSelect;
export type NewLegalConversation = typeof legalConversations.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type ApiIntegration = typeof apiIntegrations.$inferSelect;
export type NewApiIntegration = typeof apiIntegrations.$inferInsert;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;

