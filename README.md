# Sensor Registration Service

Registers sensors for a user and hashes their secrets before storage.

**Port:** 3006  
**Auth:** None (expected to be called by OrchestratorService)

## Configuration

Create `.env` from `.env.example`:
```
PORT=3006
DATA_ADAPTER_URL=http://localhost:3001
```

## API

### `POST /register-sensor`
Body:
```
{ "userEmail": "user@example.com", "type": "temperature", "name": "Living Room", "secret": "mysecret123" }
```
Response:
```
{ "sensorId": 1 }
```

### `GET /health`
Service health check.

## Notes

- Secrets are hashed with bcrypt before storage.
- The returned `sensorId` is used by sensors when posting measurements.

## Capabilities
- Registers sensors for a user
- Hashes sensor secrets before persisting

## Run
```
npm install
npm run dev
```
