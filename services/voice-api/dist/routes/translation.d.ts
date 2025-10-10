import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import { Server } from 'socket.io';
export default function createTranslationRoutes(prisma: PrismaClient, redis: ReturnType<typeof createClient>, io: Server): Router;
//# sourceMappingURL=translation.d.ts.map