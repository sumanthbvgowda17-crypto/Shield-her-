const express = require('express');
const router = express.Router();
const actionsController = require('../controllers/actionsController');

router.post('/share-location', actionsController.shareLocation);
router.post('/call', actionsController.initiateCall);

module.exports = router;
