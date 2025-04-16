const express = require('express');
const { importData } = require('../controllers/importController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protection de toutes les routes
router.use(protect);

router.route('/')
    .post(importData);

module.exports = router;