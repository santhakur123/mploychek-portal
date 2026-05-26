const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticateToken } = require('./auth');
const delayMiddleware = require('../middleware/delay');

// Middleware to restrict access to Admins only
function requireAdmin(req, res, next) {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
  }
  next();
}

// Apply authentication and admin check to all routes in this file
router.use(authenticateToken);
router.use(requireAdmin);
router.use(delayMiddleware);

// @route   GET /api/users
// @desc    Get all users (excluding password hashes)
// @access  Private (Admin only)
router.get('/', (req, res) => {
  const users = db.getUsers();
  // Map users to exclude password hash
  const safeUsers = users.map(({ passwordHash, ...safeUser }) => safeUser);
  res.json(safeUsers);
});

// @route   POST /api/users
// @desc    Create a new user
// @access  Private (Admin only)
router.post('/', (req, res) => {
  const { username, name, password, role, email } = req.body;

  if (!username || !name || !password || !role || !email) {
    return res.status(400).json({ message: 'All fields (username, name, password, role, email) are required.' });
  }

  const users = db.getUsers();

  // Check if username/ID already exists
  const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.id.toLowerCase() === username.toLowerCase());
  if (userExists) {
    return res.status(400).json({ message: 'User ID or Username already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const newUser = {
    id: username.toLowerCase().replace(/\s+/g, '_'),
    username,
    name,
    passwordHash: bcrypt.hashSync(password, salt),
    role,
    email,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  db.saveUsers(users);

  const { passwordHash, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

// @route   PUT /api/users/:id
// @desc    Update user details
// @access  Private (Admin only)
router.put('/:id', (req, res) => {
  const { name, role, email, password } = req.body;
  const userId = req.params.id;

  const users = db.getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found.' });
  }

  // Prevent admin from changing their own role to something else to avoid lockout
  if (userId === req.user.id && role && role !== 'Admin') {
    return res.status(400).json({ message: 'Cannot demote your own administrator account.' });
  }

  // Update fields
  if (name) users[userIndex].name = name;
  if (role) users[userIndex].role = role;
  if (email) users[userIndex].email = email;
  
  // Update password if provided
  if (password && password.trim() !== '') {
    const salt = bcrypt.genSaltSync(10);
    users[userIndex].passwordHash = bcrypt.hashSync(password, salt);
  }

  db.saveUsers(users);

  const { passwordHash, ...safeUser } = users[userIndex];
  res.json(safeUser);
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/:id', (req, res) => {
  const userId = req.params.id;

  // Prevent self-deletion
  if (userId === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete your own active administrator account.' });
  }

  const users = db.getUsers();
  const filteredUsers = users.filter(u => u.id !== userId);

  if (users.length === filteredUsers.length) {
    return res.status(404).json({ message: 'User not found.' });
  }

  db.saveUsers(filteredUsers);
  res.json({ message: 'User deleted successfully.', id: userId });
});

module.exports = router;
