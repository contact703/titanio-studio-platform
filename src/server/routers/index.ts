import { router } from '../trpc/trpc';
import { authRouter } from './auth.router';
import { projectsRouter } from './projects.router';
import { musicRouter } from './music.router';
import { videoRouter } from './video.router';
import { publicationsRouter } from './publications.router';
import { adsRouter } from './ads.router';
import { legalRouter } from './legal.router';
import { paymentsRouter } from './payments.router';

export const appRouter = router({
  auth: authRouter,
  projects: projectsRouter,
  music: musicRouter,
  video: videoRouter,
  publications: publicationsRouter,
  ads: adsRouter,
  legal: legalRouter,
  payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;

