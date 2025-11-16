import { Router } from 'express';
import { BalancesService } from '../../services/balancesService';

const router: Router = Router();
const balancesService = new BalancesService();

/**
 * GET /api/balances/:address
 * Get balance information for a user
 */
router.get('/:address', async (req, res, next) => {
  try {
    const { address } = req.params;
    const balances = await balancesService.getBalances(address);
    res.json(balances);
  } catch (error) {
    next(error);
  }
});

export default router;

