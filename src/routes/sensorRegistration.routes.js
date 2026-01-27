const express = require('express');
const router = express.Router();
const sensorRegService = require('../services/sensorRegistration.service');

/**
 * POST /register-sensor
 * Register a new sensor
 *
 * Required fields: userEmail, type, name, secret
 */
router.post('/', async (req, res) => {
    const { userEmail, type, name, secret } = req.body;

    if (!userEmail || !type || !name || !secret) {
        return res.status(400).json({
            error: 'Missing required fields: userEmail, type, name, secret'
        });
    }

    // Validate sensor type
    const validTypes = ['temperature', 'humidity', 'wind'];
    if (!validTypes.includes(type)) {
        return res.status(400).json({
            error: 'Invalid sensor type. Must be: temperature, humidity, or wind'
        });
    }

    // Validate secret length
    if (secret.length < 8) {
        return res.status(400).json({
            error: 'Secret must be at least 8 characters long'
        });
    }

    try {
        console.log(`[Sensor Registration] Processing registration for sensor: ${name} by user: ${userEmail}`);
        const result = await sensorRegService.registerSensor({
            userEmail,
            type,
            name,
            secret
        });
        console.log(`[Sensor Registration] Sensor registration completed: ${name} (ID: ${result.sensorId})`);
        res.status(201).json(result);
    } catch (err) {
        console.log(`[Sensor Registration] Registration failed for ${name}: ${err.message}`);
        if (err.message === 'SENSOR_EXISTS') {
            return res.status(409).json({ error: 'Sensor already exists' });
        }
        if (err.message === 'INVALID_DATA') {
            return res.status(400).json({ error: 'Invalid sensor data' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
