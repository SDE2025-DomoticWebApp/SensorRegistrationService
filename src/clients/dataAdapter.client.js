const axios = require('axios');
const config = require('../config/config');

/**
 * Create a new sensor in the Internal Data Adapter
 * @param {Object} sensorData - Sensor data
 * @returns {Promise<Object>} Response with sensorId
 */
async function createSensor(sensorData) {
    return axios.post(`${config.DATA_ADAPTER_URL}/sensors`, sensorData);
}

module.exports = {
    createSensor
};
