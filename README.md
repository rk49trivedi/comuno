# Call Notification System - Android Integration Guide

This system allows Android apps to receive real-time call notifications via WebSocket. The server identifies clients by their phone number, allowing targeted notifications.

## Server URL
```
http://31.97.206.244:3000
```

## Integration Steps for Android

### 1. Connect to WebSocket Server

Add Socket.IO client to your Android project:

```gradle
// build.gradle
dependencies {
    implementation 'io.socket:socket.io-client:2.0.0'
}
```

Connect to the server:

```java
import io.socket.client.IO;
import io.socket.client.Socket;

// Initialize socket
Socket socket = IO.socket("http://31.97.206.244:3000");

// Connect
socket.connect();
```

### 2. Register with User's Phone Number

When your app starts, register the user with their phone number:

```java
// Get user's phone number (from your app)
String userPhoneNumber = "+919876543210"; // Must be in international format

// Create registration data
JSONObject registrationData = new JSONObject();
try {
    registrationData.put("agentId", "android-" + userPhoneNumber.replaceAll("[^0-9]", ""));
    registrationData.put("agentNumber", userPhoneNumber);
    registrationData.put("agentName", "Android User");
    registrationData.put("agentType", "mobile_client");
} catch (JSONException e) {
    e.printStackTrace();
}

// Register with server
socket.emit("registerAgent", registrationData);
```

### 3. Handle Registration Response

```java
// Handle successful registration
socket.on("registrationSuccess", args -> {
    JSONObject data = (JSONObject) args[0];
    Log.d("Socket", "Registration successful");
});

// Handle registration error
socket.on("registrationError", args -> {
    JSONObject data = (JSONObject) args[0];
    String errorMessage = data.getString("message");
    Log.e("Socket", "Registration failed: " + errorMessage);
});
```

### 4. Listen for Call Events

```java
// Handle incoming call (simplified data format)
socket.on("incomingCall", args -> {
    try {
        JSONObject data = (JSONObject) args[0];

        String agentPhone = data.getString("agentPhone");
        String customerPhone = data.getString("customerPhone");
        String liveEvent = data.getString("live_event");
        String timestamp = data.getString("timestamp");

        Log.d("Socket", "📞 Incoming call - Agent: " + agentPhone + ", Customer: " + customerPhone);

        // Show notification to user
        runOnUiThread(() -> {
            showCallNotification("Incoming Call", agentPhone, customerPhone, liveEvent);
        });

    } catch (Exception e) {
        Log.e("Socket", "Error parsing incoming call: " + e.getMessage());
    }
});

// Handle outgoing call (simplified data format)
socket.on("outgoingCall", args -> {
    try {
        JSONObject data = (JSONObject) args[0];

        String agentPhone = data.getString("agentPhone");
        String customerPhone = data.getString("customerPhone");
        String liveEvent = data.getString("live_event");

        // Show notification or update UI
        runOnUiThread(() -> {
            showCallNotification("Outgoing Call", agentPhone, customerPhone, liveEvent);
        });

    } catch (Exception e) {
        Log.e("Socket", "Error parsing outgoing call: " + e.getMessage());
    }
});

// Handle call recording (simplified data format)
socket.on("callRecording", args -> {
    try {
        JSONObject data = (JSONObject) args[0];

        String agentPhone = data.getString("agentPhone");
        String customerPhone = data.getString("customerPhone");
        String liveEvent = data.getString("live_event");

        // Handle recording data
        runOnUiThread(() -> {
            handleCallRecording(agentPhone, customerPhone, liveEvent);
        });

    } catch (Exception e) {
        Log.e("Socket", "Error parsing call recording: " + e.getMessage());
    }
});
```

### 5. Handle Disconnection

```java
// Handle disconnection
socket.on(Socket.EVENT_DISCONNECT, args -> {
    Log.d("Socket", "Disconnected from server");
    
    // Attempt to reconnect if needed
    if (!socket.connected()) {
        socket.connect();
    }
});
```

## API Endpoints

### Send Notification to Specific Phone Number

```
POST http://31.97.206.244:3000/api/incomingCall/number/+919876543210
POST http://31.97.206.244:3000/api/outgoingCall/number/+919876543210
POST http://31.97.206.244:3000/api/callRecording/number/+919876543210
```

Request body:
```json
{
  "callId": "call-123",
  "from": "+911234567890",
  "to": "+919876543210",
  "timestamp": "2023-06-15T10:30:00Z",
  "duration": 30,
  "status": "completed"
}
```

### Send to Multiple Phone Numbers

```
POST http://31.97.206.244:3000/api/incomingCall/numbers
```

Request body:
```json
{
  "agentNumbers": ["+919876543210", "+919876543211"],
  "callId": "call-123",
  "from": "+911234567890",
  "timestamp": "2023-06-15T10:30:00Z"
}
```

### Check Connected Agents

```
GET http://31.97.206.244:3000/api/agents
GET http://31.97.206.244:3000/api/agents/number/+919876543210
```

## Testing Your Integration

### Quick Start Testing

1. **Start all test services:**
```bash
node start-all-services.js
```

2. **Run API tests:**
```bash
node test-api-production.js
```

### Manual Testing

You can test if your Android app is receiving notifications by sending a test call:

```bash
curl -X POST http://31.97.206.244:3000/api/incomingCall/number/+919876543210 \
  -H "Content-Type: application/json" \
  -d '{"callId": "test-123", "from": "+911234567890", "timestamp": "2023-06-15T10:30:00Z"}'
```

## Important Notes

1. Phone numbers must be in international format (e.g., +919876543210)
2. Each phone number can only be registered once
3. The WebSocket connection must remain open to receive notifications
4. If connection is lost, your app should automatically reconnect

## Example Data Formats (Simplified for Android)

Android apps receive simplified data format with only essential information:

### Incoming Call
```json
{
  "type": "incomingCall",
  "agentPhone": "+919924936750",
  "customerPhone": "+919662682525",
  "live_event": "evt_completed_with_recording",
  "timestamp": "2025-07-30T08:59:16.000Z"
}
```

### Outgoing Call
```json
{
  "type": "outgoingCall",
  "agentPhone": "+919924936750",
  "customerPhone": "+919662682525",
  "live_event": "evt_completed_with_recording",
  "timestamp": "2025-07-30T09:00:33.000Z"
}
```

### Call Recording
```json
{
  "type": "callRecording",
  "agentPhone": "+919924936750",
  "customerPhone": "+919662682525",
  "live_event": "evt_completed_with_recording",
  "timestamp": "2025-07-30T09:00:33.000Z"
}
```

### Key Fields for Android:
- **`agentPhone`**: The agent's phone number who handled the call
- **`customerPhone`**: The customer's phone number
- **`live_event`**: Call status (usually "evt_completed_with_recording" for completed calls)
- **`timestamp`**: When the event occurred
- **`type`**: Event type (incomingCall, outgoingCall, callRecording)
