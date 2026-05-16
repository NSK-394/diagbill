const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/dashboard.controller');
const verifyToken = require('../middleware/auth');

router.get('/stats', verifyToken, getStats);

module.exports = router;
