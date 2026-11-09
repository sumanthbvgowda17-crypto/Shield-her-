const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

router.post('/', locationController.updateLocation);
router.get('/:deviceId', locationController.getLocation);

module.exports = router;
