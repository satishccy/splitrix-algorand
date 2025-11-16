import { Router } from 'express';
import { GroupService } from '../../services/groupService';

const router = Router();
const groupService = new GroupService();

/**
 * GET /api/groups
 * Query params: ?address=<wallet_address> (optional)
 */
router.get('/', async (req, res, next) => {
  try {
    const address = req.query.address as string | undefined;
    const groups = await groupService.getGroups(address);
    res.json(groups);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/groups/:groupId
 */
router.get('/:groupId', async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const group = await groupService.getGroupById(groupId);
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    res.json(group);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/groups/:groupId/bills
 */
router.get('/:groupId/bills', async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const bills = await groupService.getGroupBills(groupId);
    res.json(bills);
  } catch (error) {
    next(error);
  }
});

export default router;

