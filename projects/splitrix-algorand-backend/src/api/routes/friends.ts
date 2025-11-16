import { Router } from 'express';
import { FriendService } from '../../services/friendService';

const router = Router();
const friendService = new FriendService();

/**
 * POST /api/friends
 * Body: { address: string, friendAddress: string, nickname?: string }
 */
router.post('/', async (req, res, next) => {
  try {
    const { address, friendAddress, nickname } = req.body;

    if (!address || !friendAddress || !nickname) {
      return res.status(400).json({
        error: 'Missing required fields: address, friendAddress, nickname',
      });
    }

    if (address === friendAddress) {
      return res.status(400).json({
        error: 'Cannot add yourself as a friend',
      });
    }

    await friendService.addFriend({ address, friendAddress, nickname });
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/friends/:address
 * Get all friends for an address
 */
router.get('/:address', async (req, res, next) => {
  try {
    const { address } = req.params;
    const friends = await friendService.getFriends(address);
    res.json(friends);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/friends/:address/:friendAddress
 * Remove a friend
 */
router.delete('/:address/:friendAddress', async (req, res, next) => {
  try {
    const { address, friendAddress } = req.params;
    await friendService.removeFriend(address, friendAddress);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;

