const express = require('express');
const router = express.Router();
const alertsController = require('../controllers/alertsController');

router.get('/:userId', alertsController.getUserAlerts);

module.exports = router;
