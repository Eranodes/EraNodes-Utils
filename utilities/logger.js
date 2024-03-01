const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const axios = require('axios');

const logsFolder = './logs';

// Create a "logs" folder if it doesn't exist
if (!fs.existsSync(logsFolder)) {
  fs.mkdirSync(logsFolder);
}

const logToFile = (message, level) => {
  const currentDate = format(new Date(), 'dd-MM-yyyy');
  const logFileName = `./logs/${currentDate}.log`;

  const logMessage = `[${level.toUpperCase()}] [${format(new Date(), 'HH:mm:ss')}] ${message}\n`;

  fs.appendFileSync(logFileName, logMessage, 'utf8');
};

const logToWebhook = async (message, level) => {
  try {
    const currentDate = format(new Date(), 'dd-MM-yyyy');
    const webhookUrl = process.env.WEBHOOK_URL;

    const color = level.toLowerCase() === 'error' ? 0xFF0000 : level.toLowerCase() === 'warn' ? 0xFFA500 : 0x00FF00;

    await axios.post(webhookUrl, {
      embeds: [
        {
          title: `${level.toUpperCase()} Log - ${currentDate}`,
          description: `\`\`\`${message}\`\`\``,
          color: color,
        },
      ],
    });
  } catch (error) {
    console.error('Error sending log to webhook:', error.message);
  }
};

const log = async (message, level = 'info') => {
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

  // Log to webhook
  await logToWebhook(message, level);
};

module.exports = { log };
