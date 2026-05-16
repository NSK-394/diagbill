const express = require('express');
const router = express.Router();
const {
  getBills,
  getBill,
  createBill,
  updateBillStatus,
} = require('../controllers/bill.controller');
const verifyToken = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getBills);
router.get('/:id', getBill);
router.post('/', createBill);
router.patch('/:id/status', updateBillStatus);

module.exports = router;
