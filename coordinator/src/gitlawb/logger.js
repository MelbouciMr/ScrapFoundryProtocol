'use strict';

const { createLogger, transports, format } = require('winston');
const config = require('./config');

module.exports = createLogger({
  level: config.LOG_LEVEL,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [new transports.Console()],
});
