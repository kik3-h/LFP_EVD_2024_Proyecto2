const express = require('express');
const router = express.Router();
const analyzerController = require('../controllers/analyzerController');

// Route to analyze .nlex file
router.post('/analyze', analyzerController.analyzeFile);

// Route to get analysis report
router.get('/report', analyzerController.getReport);

module.exports = router;