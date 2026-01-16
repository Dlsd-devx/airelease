const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { validateChangeReports } = require('./validators/changeNoteValidator');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get list of all JSON files in data directory
app.get('/api/files', async (req, res) => {
  try {
    const dataDir = path.join(__dirname, '../data');
    const files = await fs.readdir(dataDir);
    const jsonFiles = files
      .filter(file => file.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first
    
    res.json({ files: jsonFiles, count: jsonFiles.length });
  } catch (error) {
    console.error('Error reading files:', error);
    res.status(500).json({ error: 'Failed to read files', message: error.message });
  }
});

// Get list of files from subset directory
app.get('/api/files/subset', async (req, res) => {
  try {
    const dataDir = path.join(__dirname, '../data/subset');
    const files = await fs.readdir(dataDir);
    const jsonFiles = files
      .filter(file => file.endsWith('.json'))
      .sort()
      .reverse();
    
    res.json({ files: jsonFiles, count: jsonFiles.length });
  } catch (error) {
    console.error('Error reading subset files:', error);
    res.status(500).json({ error: 'Failed to read subset files', message: error.message });
  }
});

// Validate a specific file
app.get('/api/validate/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const useSubset = req.query.subset === 'true';
    
    const dataDir = useSubset 
      ? path.join(__dirname, '../data/subset')
      : path.join(__dirname, '../data');
    
    const filePath = path.join(dataDir, filename);
    
    // Security check: ensure file is within data directory
    const realPath = await fs.realpath(filePath);
    const realDataDir = await fs.realpath(dataDir);
    if (!realPath.startsWith(realDataDir)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const data = await fs.readJson(filePath);
    const validationResults = validateChangeReports(data, filename);
    
    res.json(validationResults);
  } catch (error) {
    console.error('Error validating file:', error);
    res.status(500).json({ 
      error: 'Failed to validate file', 
      message: error.message 
    });
  }
});

// Validate all files
app.post('/api/validate/all', async (req, res) => {
  try {
    const { useSubset = false, fileList = [] } = req.body;
    
    const dataDir = useSubset 
      ? path.join(__dirname, '../data/subset')
      : path.join(__dirname, '../data');
    
    let files;
    if (fileList.length > 0) {
      files = fileList;
    } else {
      const allFiles = await fs.readdir(dataDir);
      files = allFiles.filter(file => file.endsWith('.json'));
    }
    
    const results = [];
    
    for (const filename of files) {
      try {
        const filePath = path.join(dataDir, filename);
        const data = await fs.readJson(filePath);
        const validationResults = validateChangeReports(data, filename);
        results.push({
          filename,
          ...validationResults
        });
      } catch (error) {
        results.push({
          filename,
          error: error.message,
          totalEntries: 0,
          totalViolations: 0,
          violations: []
        });
      }
    }
    
    res.json({
      totalFiles: results.length,
      results
    });
  } catch (error) {
    console.error('Error validating all files:', error);
    res.status(500).json({ 
      error: 'Failed to validate files', 
      message: error.message 
    });
  }
});

// Get change note rules
app.get('/api/rules', async (req, res) => {
  try {
    const rulesPath = path.join(__dirname, '../change-notes.md');
    const rulesContent = await fs.readFile(rulesPath, 'utf-8');
    res.json({ content: rulesContent });
  } catch (error) {
    console.error('Error reading rules:', error);
    res.status(500).json({ 
      error: 'Failed to read rules', 
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Release Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
