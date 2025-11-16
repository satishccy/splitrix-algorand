import { Router } from 'express';
import { HelperService } from '../../services/helperService';

const router: Router = Router();
const helperService = new HelperService();

/**
 * POST /api/helpers/create-bill-data
 * Body: {
 *   groupId: string,
 *   payer: string,
 *   debtors: Array<{ address: string, amount: string }>,
 *   memo: string
 * }
 * Returns: CreateBillHelperData ready to be passed to create_bill contract method
 */
router.post('/create-bill-data', async (req, res, next) => {
  try {
    const { groupId, payer, debtors, memo } = req.body;

    if (!groupId || !payer || !debtors || !memo) {
      return res.status(400).json({
        error: 'Missing required fields: groupId, payer, debtors, memo',
      });
    }

    if (!Array.isArray(debtors) || debtors.length === 0) {
      return res.status(400).json({
        error: 'debtors must be a non-empty array',
      });
    }

    // Convert amount strings to BigInt
    const debtorsWithBigInt = debtors.map((d) => ({
      address: d.address,
      amount: BigInt(d.amount),
    }));

    const helperData = await helperService.getCreateBillHelperData(
      groupId,
      payer,
      debtorsWithBigInt,
      memo
    );

    res.json(helperData);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/helpers/pending-debts/:groupId/:payer
 * Get all pending debts for a payer in a group (bills where payer owes money)
 */
router.get('/pending-debts/:groupId/:payer', async (req, res, next) => {
  try {
    const { groupId, payer } = req.params;
    const pendingDebts = await helperService.getPendingDebtsForPayer(groupId, payer);
    res.json(pendingDebts);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/helpers/group-members/:groupId
 * Get all members of a group
 */
router.get('/group-members/:groupId', async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const members = await helperService.getGroupMembers(groupId);
    res.json(members);
  } catch (error) {
    next(error);
  }
});

export default router;

