const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const db = require('./db');
const authRouter = require('./routes/auth').router;
const recordsRouter = require('./routes/records');
const usersRouter = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database (Seeding if files don't exist)
db.initDb();

// Global Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the Angular build directory
const frontendBuildPath = path.join(__dirname, '../frontend/dist/frontend/browser');
app.use(express.static(frontendBuildPath));

// Mount API Routes
app.use('/api/auth', authRouter);
app.use('/api/records', recordsRouter);
app.use('/api/users', usersRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Healthy',
    timestamp: new Date().toISOString(),
    service: 'MPloyChek Verification API'
  });
});

// Catch-all route to serve the Angular SPA index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server listening on dynamic port or 5000
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  MPloyChek Node.js API Service Started Successfully`);
  console.log(`  Running Local Environment on http://localhost:${PORT}`);
  console.log(`==================================================`);
});
