const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

// Create a "logs" folder if it doesn't exist
const logsFolder = './logs';
if (!fs.existsSync(logsFolder)) {
  fs.mkdirSync(logsFolder);
}

const logToFile = (message, level) => {
  const currentDate = format(new Date(), 'dd-MM-yyyy');
  const logFileName = `./logs/${currentDate}.log`;

  const logMessage = `[${level.toUpperCase()}] [${format(new Date(), 'HH:mm:ss')}] ${message}\n`;

  fs.appendFileSync(logFileName, logMessage, 'utf8');
};

const log = (message, level = 'info') => {
  // Log to console
  switch (level.toLowerCase()) {
    case 'error':
      console.error(`[ERROR] ${message}`);
      break;
    case 'warn':
      console.warn(`[WARN] ${message}`);
      break;
    default:
      console.log(`[INFO] ${message}`);
      break;
  }

  // Log to file
  logToFile(message, level);
};

module.exports = { log };
