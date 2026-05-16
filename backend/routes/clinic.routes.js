const express = require('express');
const router = express.Router();
const {
  getClinics,
  getClinic,
  createClinic,
  updateClinic,
  deleteClinic,
} = require('../controllers/clinic.controller');
const verifyToken = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getClinics);
router.get('/:id', getClinic);
router.post('/', createClinic);
router.put('/:id', updateClinic);
router.delete('/:id', deleteClinic);

module.exports = router;
