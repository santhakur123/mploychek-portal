const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = 'mploychek-super-secret-key-2026';

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', (req, res) => {
  const { userId, password, role } = req.body;

  // Basic validation
  if (!userId || !password || !role) {
    return res.status(400).json({ message: 'Please enter User ID, Password, and Role.' });
  }

  const users = db.getUsers();
  
  // Find user by ID or Username (case-insensitive for convenience)
  const user = users.find(u => u.id.toLowerCase() === userId.toLowerCase() || u.username.toLowerCase() === userId.toLowerCase());

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials. User not found.' });
  }

  // Verify Role
  if (user.role !== role) {
    return res.status(401).json({ message: `Access denied. Selected role '${role}' does not match registered role.` });
  }

  // Verify Password
  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
  }

  // Create JWT Token
  const payload = {
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email
    }
  };

  jwt.sign(
    payload,
    JWT_SECRET,
    { expiresIn: '8h' }, // Token valid for 8 hours
    (err, token) => {
      if (err) throw err;
      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          email: user.email
        }
      });
    }
  );
});

// Helper middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing. Access denied.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid or expired.' });
    }
    req.user = decoded.user;
    next();
  });
}

module.exports = {
  router,
  authenticateToken
};
