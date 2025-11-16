import { Router } from 'express';
import { BillService } from '../../services/billService';

const router: Router = Router();
const billService = new BillService();

/**
 * GET /api/bills/:billId
 * billId format: "groupId:billId"
 */
router.get('/:billId', async (req, res, next) => {
  try {
    const { billId } = req.params;
    const bill = await billService.getBillById(billId);
    
    if (!bill) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    
    res.json(bill);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/bills/user/:address
 * Get all bills for a user (as payer or debtor)
 */
router.get('/user/:address', async (req, res, next) => {
  try {
    const { address } = req.params;
    const bills = await billService.getUserBills(address);
    res.json(bills);
  } catch (error) {
    next(error);
  }
});

export default router;

