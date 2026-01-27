# Sensor Registration Service

The Sensor Registration Service handles the registration of IoT sensors in the domotic web application. It validates sensor data, hashes sensor secrets, and stores them in the Internal Data Adapter.

## Features

- **Sensor Registration**: Registers temperature, humidity, and wind sensors
- **Secret Hashing**: Uses bcrypt to hash sensor secrets before storage (similar to password hashing)
- **URL Validation**: Ensures sensor URLs are unique and follow naming conventions
- **Type Validation**: Validates sensor types against allowed values

## API Endpoints

### Health Check
```
GET /health
Response: { "status": "ok" }
```

### Register Sensor
```
POST /register-sensor
Content-Type: application/json

Request Body:
{
  "userEmail": "user@example.com",
  "type": "temperature",
  "name": "Living Room Temperature",
  "secret": "mysecret123"
}

Responses:
- 201 Created:
  {
    "sensorId": 1,
    "name": "Living Room Temperature",
    "type": "temperature"
  }
- 400 Bad Request: { "error": "Missing required fields: ..." }
- 409 Conflict: { "error": "Sensor URL already exists" }
- 500 Internal Server Error: { "error": "Internal server error" }
```

## Sensor Types

- `temperature` - Temperature sensor
- `humidity` - Humidity sensor
- `wind` - Wind speed sensor

## Sensor Identification

- Each sensor is identified by its **auto-generated ID** (not by URL)
- All sensors use the **same API endpoint** to publish data: `POST /measures`
- Sensors authenticate using their **ID + secret** when publishing data

## Secret Requirements

- Minimum 8 characters
- Will be hashed using bcrypt (10 salt rounds)
- User must remember this secret to authenticate their sensor when publishing data

## Configuration

Create a `.env` file:

```env
PORT=3006
DATA_ADAPTER_URL=http://localhost:3001
```

## Installation

```bash
npm install
```

## Running the Service

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## Architecture

```
Orchestrator Service (Port 3005) - with authentication
    ↓
Sensor Registration Service (Port 3006)
    ↓
Internal Data Adapter (Port 3001)
    ↓
SQLite Database
```

## Project Structure

```
SensorRegistrationService/
├── src/
│   ├── app.js                             # Express application entry point
│   ├── config/
│   │   └── config.js                      # Configuration management
│   ├── routes/
│   │   └── sensorRegistration.routes.js   # HTTP route handlers
│   ├── services/
│   │   └── sensorRegistration.service.js  # Business logic
│   ├── clients/
│   │   └── dataAdapter.client.js          # Internal Data Adapter HTTP client
│   └── utils/
│       └── secret.js                      # Secret hashing utilities (bcrypt)
├── package.json
├── .env
└── README.md
```

## Dependencies

- **express**: Web framework
- **axios**: HTTP client for service-to-service communication
- **bcryptjs**: Secret hashing (10 rounds)
- **dotenv**: Environment variable management
- **nodemon**: Development auto-reload (dev dependency)

## Security

- Secrets are hashed using bcrypt with 10 salt rounds before storage
- Plain text secrets are never stored in the database
- Each sensor has a unique URL to prevent conflicts
- Sensor authentication happens during data publishing (future feature)

## How Sensor Authentication Works

1. User registers sensor with a secret
2. Service hashes the secret using bcrypt
3. Hashed secret is stored in the database
4. When the sensor publishes data, it must provide the secret
5. The system verifies the secret against the stored hash
6. If valid, the data is accepted

## Example Registration Flow

```bash
# 1. User logs in and gets token
TOKEN=$(curl -X POST http://localhost:3005/orchestrator/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}' \
  | jq -r '.token')

# 2. User registers sensor (authenticated request)
curl -X POST http://localhost:3005/orchestrator/register-sensor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "type": "temperature",
    "name": "Living Room Temperature",
    "secret": "mysecret123"
  }'

# 3. Response includes sensor ID
# User notes down the sensor ID and secret for configuring their physical sensor
```

## Database Schema

The sensor is stored with the following structure:

```sql
CREATE TABLE sensors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('temperature', 'humidity', 'wind')),
  name TEXT NOT NULL,
  secret_hash TEXT NOT NULL,
  FOREIGN KEY (user_email) REFERENCES users(email) ON DELETE CASCADE
);
```

## How Sensors Publish Data

All sensors use a **single unified endpoint** in the Internal Data Adapter:

```
POST /measures
Content-Type: application/json

{
  "sensorId": 1,
  "secret": "mysecret123",
  "value": 23.5
}
```

The system:
1. Looks up the sensor by ID
2. Verifies the secret against the stored hash
3. If valid, stores the measurement
4. If invalid, rejects with 401 Unauthorized

**No need for different URLs per sensor** - they all POST to the same endpoint!

## Future Enhancements

- Sensor update/delete endpoints
- Sensor configuration settings (e.g., polling interval, thresholds)
- Sensor status monitoring
- Multiple sensor locations per user
