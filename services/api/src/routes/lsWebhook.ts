import { Router } from 'express';
import { db } from '../firebase';

const router = Router();

// Handle Label Studio webhook events
router.post('/', async (req, res) => {
  const event = req.body;
  // TODO: Validate webhook source and event type
  // Example: update task_item status or annotation based on event
  if (!event || !event.task || !event.annotation) {
    return res.status(400).json({ error: 'Invalid event payload' });
  }
  try {
    await db.collection('task_items').doc(event.task.id).update({
      annotation: event.annotation,
      status: event.status || 'submitted',
      updatedAt: new Date()
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Webhook handling failed' });
  }
});

export default router; 