const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RECORDS_FILE = path.join(DATA_DIR, 'records.json');

// Helper to ensure data directory exists
function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read database file helper
function readDataFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
}

// Write database file helper
function writeDataFile(filePath, data) {
  try {
    ensureDirectories();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing to ${filePath}:`, error);
    return false;
  }
}

// Initialize and seed database
function initDb() {
  ensureDirectories();

  // 1. Seed Users
  let users = readDataFile(USERS_FILE);
  if (!users || users.length === 0) {
    console.log('Seeding default users...');
    const salt = bcrypt.genSaltSync(10);
    users = [
      {
        id: 'admin123',
        username: 'admin123',
        name: 'NSQTech Administrator',
        passwordHash: bcrypt.hashSync('admin@123', salt),
        role: 'Admin',
        email: 'admin@nsqtech.com',
        createdAt: new Date().toISOString()
      },
      {
        id: 'giri_cto',
        username: 'giri_cto',
        name: 'Giri Venkataramanan (CTO)',
        passwordHash: bcrypt.hashSync('cto@123', salt),
        role: 'Admin',
        email: 'giri@nsqtech.com',
        createdAt: new Date().toISOString()
      },
      {
        id: 'arvind_ceo',
        username: 'arvind_ceo',
        name: 'Arvind R A (CEO)',
        passwordHash: bcrypt.hashSync('ceo@123', salt),
        role: 'Admin',
        email: 'arvind@nsqtech.com',
        createdAt: new Date().toISOString()
      },
      {
        id: 'harsh_thakur',
        username: 'harsh_thakur',
        name: 'Harsh Thakur',
        passwordHash: bcrypt.hashSync('harsh@123', salt),
        role: 'General User',
        email: 'harsh.thakur@nsqtech.com',
        createdAt: new Date().toISOString()
      },
      {
        id: 'user123',
        username: 'user123',
        name: 'John Doe',
        passwordHash: bcrypt.hashSync('user@123', salt),
        role: 'General User',
        email: 'johndoe@gmail.com',
        createdAt: new Date().toISOString()
      }
    ];
    writeDataFile(USERS_FILE, users);
  }

  // 2. Seed Records
  let records = readDataFile(RECORDS_FILE);
  if (!records || records.length === 0) {
    console.log('Seeding verification records...');
    records = [
      {
        id: 'V-2026-001',
        candidateName: 'Harsh Thakur',
        userId: 'harsh_thakur',
        type: 'UIDAI Identity Verification',
        status: 'Verified',
        riskLevel: 'Low',
        submittedDate: '2026-05-20',
        verifiedDate: '2026-05-21',
        notes: 'Aadhar and Passport credentials verified successfully via UIDAI central registry.'
      },
      {
        id: 'V-2026-002',
        candidateName: 'Harsh Thakur',
        userId: 'harsh_thakur',
        type: 'EPFO Work History Audit',
        status: 'In Progress',
        riskLevel: 'Low',
        submittedDate: '2026-05-22',
        verifiedDate: null,
        notes: 'EPF establishment records request in progress. Awaiting employer approval.'
      },
      {
        id: 'V-2026-003',
        candidateName: 'John Doe',
        userId: 'user123',
        type: 'E-Courts Litigation Scan',
        status: 'Flagged',
        riskLevel: 'High',
        submittedDate: '2026-05-18',
        verifiedDate: '2026-05-19',
        notes: 'Match identified in E-Courts litigation database. Subject involved in active case.'
      },
      {
        id: 'V-2026-004',
        candidateName: 'John Doe',
        userId: 'user123',
        type: 'Academic Degree Audit',
        status: 'Verified',
        riskLevel: 'Low',
        submittedDate: '2026-05-18',
        verifiedDate: '2026-05-19',
        notes: 'B.Sc. Computer Science degree verified with Stanford University registrar.'
      },
      {
        id: 'V-2026-005',
        candidateName: 'Jane Smith',
        userId: 'jane_smith',
        type: 'Academic Degree Audit',
        status: 'Verified',
        riskLevel: 'Low',
        submittedDate: '2026-05-15',
        verifiedDate: '2026-05-16',
        notes: 'B.Tech degree verified with IIT Delhi registrar.'
      }
    ];
    writeDataFile(RECORDS_FILE, records);
  }
}

module.exports = {
  initDb,
  getUsers: () => readDataFile(USERS_FILE) || [],
  saveUsers: (users) => writeDataFile(USERS_FILE, users),
  getRecords: () => readDataFile(RECORDS_FILE) || [],
  saveRecords: (records) => writeDataFile(RECORDS_FILE, records)
};
