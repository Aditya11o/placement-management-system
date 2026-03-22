const fs = require('fs');
const path = require('path');

const logDirectory = path.join(__dirname, '../logs');

// Ensure log directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logFile = path.join(logDirectory, 'error.log');

const logger = {
  error: (err, req) => {
    const timestamp = new Date().toISOString();
    const method = req ? req.method : 'N/A';
    const url = req ? req.originalUrl : 'N/A';
    const message = err.stack || err.message || err;
    
    const logEntry = `[${timestamp}] ${method} ${url}\n${message}\n${'-'.repeat(50)}\n`;
    
    fs.appendFile(logFile, logEntry, (error) => {
      if (error) console.error('Failed to write to log file:', error);
    });
  },
  info: (message) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] INFO: ${message}\n`;
    console.log(logEntry);
  }
};

module.exports = logger;
