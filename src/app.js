const express = require('express');
const config = require('./config/config');
const sensorRegistrationRoutes = require('./routes/sensorRegistration.routes');

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Routes
app.use('/register-sensor', sensorRegistrationRoutes);

// Start server
app.listen(config.PORT, () => {
    console.log(`Sensor Registration Service running on port ${config.PORT}`);
    console.log(`Data Adapter URL: ${config.DATA_ADAPTER_URL}`);
});

module.exports = app;
