import { Router } from 'express';
import { db } from '../firebase';
import { z } from 'zod';

const router = Router();

// Zod schema for webhook event
const WebhookEventSchema = z.object({
  task: z.object({
    id: z.string(),
    // Add more fields as needed
  }),
  annotation: z.any(), // Adjust as needed for annotation structure
  status: z.string().optional(),
  // Add more fields as needed
});

// Handle Label Studio webhook events
router.post('/', async (req, res) => {
  const parseResult = WebhookEventSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Invalid event payload',
      code: 'invalid_payload',
      details: parseResult.error.errors,
    });
  }
  const event = parseResult.data;
  // TODO: Validate webhook source and event type
  try {
    await db.collection('task_items').doc(event.task.id).update({
      annotation: event.annotation,
      status: event.status || 'submitted',
      updatedAt: new Date()
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Webhook handling failed', code: 'webhook_error' });
  }
});

export default router; 