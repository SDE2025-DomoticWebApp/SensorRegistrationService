const dataAdapterClient = require('../clients/dataAdapter.client');
const secretUtils = require('../utils/secret');

/**
 * Register a new sensor
 * @param {Object} sensorData - Sensor registration data
 * @param {string} sensorData.userEmail - Email of the user who owns the sensor
 * @param {string} sensorData.type - Sensor type (temperature, humidity, wind)
 * @param {string} sensorData.name - Sensor name
 * @param {string} sensorData.secret - Plain text secret for sensor authentication
 * @returns {Promise<Object>} Created sensor info
 */
async function registerSensor({ userEmail, type, name, secret }) {
    console.log(`[Sensor Registration Service] Hashing secret for sensor: ${name}`);
    const secretHash = await secretUtils.hash(secret);

    try {
        console.log(`[Sensor Registration Service] Forwarding to Internal Data Adapter for sensor: ${name}`);
        const response = await dataAdapterClient.createSensor({
            userEmail,
            type,
            name,
            secretHash
        });

        console.log(`[Sensor Registration Service] Sensor created successfully: ${name} (ID: ${response.data.sensorId})`);

        return {
            sensorId: response.data.sensorId,
            name,
            type
        };
    } catch (err) {
        if (err.response && err.response.status === 409) {
            throw new Error('SENSOR_EXISTS');
        }
        if (err.response && err.response.status === 400) {
            throw new Error('INVALID_DATA');
        }
        throw err;
    }
}

module.exports = {
    registerSensor
};
