// Import dependencies
import { createLogger, format, transports } from 'winston';

// Determine if logging is enabled from .env
const isLoggingEnabled = process.env.ENABLE_LOGS === 'true';

// Define log format
const logFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`)
);

// Create the logger
const logger = createLogger({
  level: isLoggingEnabled ? 'info' : 'silent', // Disable logs by setting level to 'silent'
  format: logFormat,
  transports: [new transports.Console()],
});

// Export the logger
export default logger;