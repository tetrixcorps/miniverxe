import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { Server } from 'socket.io';
export default function createStripeWebhookRoutes(prisma: PrismaClient, redis: ReturnType<typeof createClient>, io: Server): import("express-serve-static-core").Router;
//# sourceMappingURL=stripe-webhooks.d.ts.map