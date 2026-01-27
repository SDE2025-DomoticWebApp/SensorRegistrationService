require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3006,
  DATA_ADAPTER_URL: process.env.DATA_ADAPTER_URL || 'http://localhost:3001'
};
