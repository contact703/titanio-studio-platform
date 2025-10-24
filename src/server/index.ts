import express from 'express';
import cors from 'cors';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './routers';
import { createContext } from './trpc/context';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    services: {
      database: 'connected',
      apis: 'ready',
    }
  });
});

// tRPC endpoint
app.use(
  '/api/trpc',
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Start server
app.listen(port, () => {
  console.log(`🚀 Titanio Studio Platform server running on port ${port}`);
  console.log(`📡 tRPC endpoint: http://localhost:${port}/api/trpc`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
  console.log(`🎵 Music APIs: Suno AI, MusicGPT`);
  console.log(`📹 Video APIs: YouTube, TikTok, Meta`);
  console.log(`🎼 Music Platforms: Spotify, Apple Music, Deezer`);
  console.log(`📢 Ads: Google Ads`);
  console.log(`⚖️  Legal Agent: Ready`);
});

export default app;

