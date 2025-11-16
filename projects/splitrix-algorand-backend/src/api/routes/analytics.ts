import { Router } from 'express';
import { AnalyticsService } from '../../services/analyticsService';

const router: Router = Router();
const analyticsService = new AnalyticsService();

/**
 * GET /api/analytics/user/:address
 * Get user spending analytics
 */
router.get('/user/:address', async (req, res, next) => {
  try {
    const { address } = req.params;
    const analytics = await analyticsService.getUserAnalytics(address);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/group/:groupId
 * Get group analytics
 */
router.get('/group/:groupId', async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const analytics = await analyticsService.getGroupAnalytics(groupId);
    
    if (!analytics) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(analytics);
  } catch (error) {
    next(error);
  }
});

export default router;

