const express = require('express');
const statsController = require('../controllers/stats.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Lấy thống kê tổng quan
router.get('/', protect, statsController.getOverviewStats);

module.exports = router;
