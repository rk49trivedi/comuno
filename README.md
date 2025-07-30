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
// Handle incoming call
socket.on("incomingCall", args -> {
    JSONObject data = (JSONObject) args[0];
    // Show notification or update UI
    String callId = data.getString("callId");
    String fromNumber = data.getString("from");
    
    // Display notification
    showCallNotification("Incoming Call", fromNumber);
});

// Handle outgoing call
socket.on("outgoingCall", args -> {
    JSONObject data = (JSONObject) args[0];
    // Show notification or update UI
});

// Handle call recording
socket.on("callRecording", args -> {
    JSONObject data = (JSONObject) args[0];
    // Handle recording data
    String recordingUrl = data.getString("recordingUrl");
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

## Example Data Formats

### Incoming Call
```json
{
  "callId": "call-123",
  "from": "+911234567890",
  "to": "+919876543210",
  "timestamp": "2023-06-15T10:30:00Z",
  "status": "ringing"
}
```

### Outgoing Call
```json
{
  "callId": "call-456",
  "from": "+919876543210",
  "to": "+911234567890",
  "timestamp": "2023-06-15T11:30:00Z",
  "status": "dialing"
}
```

### Call Recording
```json
{
  "callId": "call-123",
  "recordingUrl": "https://example.com/recordings/call-123.mp3",
  "duration": 120,
  "timestamp": "2023-06-15T10:35:00Z"
}
```
