const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');
const delayMiddleware = require('../middleware/delay');

// @route   GET /api/records
// @desc    Get background check records (all for Admin, only owned for General User)
// @access  Private
router.get('/', authenticateToken, delayMiddleware, (req, res) => {
  const records = db.getRecords();
  
  if (req.user.role === 'Admin') {
    res.json(records);
  } else {
    // General User: Filter records that belong to this user
    const filteredRecords = records.filter(r => r.userId.toLowerCase() === req.user.id.toLowerCase());
    res.json(filteredRecords);
  }
});

// @route   POST /api/records
// @desc    Create a verification check request (Admin or General User for self)
// @access  Private
router.post('/', authenticateToken, delayMiddleware, (req, res) => {
  const { candidateName, type, notes } = req.body;

  if (!candidateName || !type) {
    return res.status(400).json({ message: 'Candidate Name and Verification Type are required.' });
  }

  const records = db.getRecords();
  
  const newRecord = {
    id: `V-2026-${String(records.length + 1).padStart(3, '0')}`,
    candidateName,
    userId: req.user.role === 'Admin' ? (req.body.userId || 'admin123') : req.user.id,
    type,
    status: 'Pending',
    riskLevel: req.body.riskLevel || 'Low',
    submittedDate: new Date().toISOString().split('T')[0],
    verifiedDate: null,
    notes: notes || 'Background verification check requested.'
  };

  records.push(newRecord);
  db.saveRecords(records);

  res.status(201).json(newRecord);
});

module.exports = router;
