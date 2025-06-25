import { Router } from 'express';
import { db } from '../firebase';
import { authGuard } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import axios from 'axios';

const router = Router();

interface WalletResponse {
  walletId: string;
  txHash?: string;
}

// Create wallet for user (calls wallet-svc)
router.post('/create', authGuard, async (req, res) => {
  const uid = (req as any).user.uid;
  // TODO: Check if wallet already exists
  try {
    const resp = await axios.post('http://wallet-svc:4100/wallet/create', { uid });
    const data = resp.data as WalletResponse;
    await db.collection('users').doc(uid).update({ walletId: data.walletId });
    res.json({ walletId: data.walletId });
  } catch (e) {
    res.status(500).json({ error: 'Wallet creation failed' });
  }
});

// Admin triggers payout for annotator
router.post('/payout', authGuard, requireRole('admin'), async (req, res) => {
  const { uid, amountUSD } = req.body;
  // TODO: Validate payout eligibility, prevent duplicates
  try {
    const resp = await axios.post('http://wallet-svc:4100/wallet/payout', { uid, amountUSD });
    const data = resp.data as WalletResponse;
    await db.collection('payments').add({
      uid,
      amountUSD,
      txHash: data.txHash,
      createdAt: new Date()
    });
    res.json({ txHash: data.txHash });
  } catch (e) {
    res.status(500).json({ error: 'Payout failed' });
  }
});

export default router; 