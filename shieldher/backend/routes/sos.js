const express = require('express');
const router = express.Router();
const sosController = require('../controllers/sosController');

router.post('/', sosController.triggerSOS);
router.get('/active', sosController.getActiveSOS);
router.post('/update', sosController.updateSOS);
router.post('/resolve', sosController.resolveSOS);
router.post('/transcript', sosController.sendTranscript);
router.post('/camera', sosController.sendCameraEvidence);
router.post('/gps', sosController.sendGPSUpdate);
router.post('/motion', sosController.sendMotionUpdate);

module.exports = router;
