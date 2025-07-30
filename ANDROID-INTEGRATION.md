# Android Integration - Minimal Data API

## Server URL
```
http://31.97.206.244:3000
```

## 1. Android WebSocket Connection

```java
// Add to build.gradle
implementation 'io.socket:socket.io-client:2.0.0'

// Connect to server
Socket socket = IO.socket("http://31.97.206.244:3000");
socket.connect();
```

## 2. Register Android Client

```java
socket.on(Socket.EVENT_CONNECT, args -> {
    try {
        String userPhoneNumber = "+919876543210"; // User's phone number
        
        JSONObject registrationData = new JSONObject();
        registrationData.put("agentId", "android-" + userPhoneNumber.replaceAll("[^0-9]", ""));
        registrationData.put("agentNumber", userPhoneNumber);
        registrationData.put("agentName", "Android User");
        registrationData.put("agentType", "mobile_client");
        
        socket.emit("registerAgent", registrationData);
        
    } catch (Exception e) {
        Log.e("Socket", "Registration error: " + e.getMessage());
    }
});
```

## 3. Handle Minimal Call Data

```java
// Incoming call - ONLY essential data
socket.on("incomingCall", args -> {
    try {
        JSONObject data = (JSONObject) args[0];
        
        String agentPhone = data.getString("agentPhone");
        String customerPhone = data.getString("customerPhone");
        String liveEvent = data.getString("live_event");
        
        // Show simple notification
        showNotification("Call: " + customerPhone + " → " + agentPhone);
        
    } catch (Exception e) {
        Log.e("Socket", "Error: " + e.getMessage());
    }
});

// Outgoing call - ONLY essential data
socket.on("outgoingCall", args -> {
    try {
        JSONObject data = (JSONObject) args[0];
        
        String agentPhone = data.getString("agentPhone");
        String customerPhone = data.getString("customerPhone");
        
        showNotification("Outgoing: " + agentPhone + " → " + customerPhone);
        
    } catch (Exception e) {
        Log.e("Socket", "Error: " + e.getMessage());
    }
});

// Call recording - ONLY essential data
socket.on("callRecording", args -> {
    try {
        JSONObject data = (JSONObject) args[0];
        
        String agentPhone = data.getString("agentPhone");
        String customerPhone = data.getString("customerPhone");
        
        showNotification("Recording: " + agentPhone + " ↔ " + customerPhone);
        
    } catch (Exception e) {
        Log.e("Socket", "Error: " + e.getMessage());
    }
});
```

## 4. API Endpoints for Android (Minimal Data)

### Send to Specific Android Client
```
POST http://31.97.206.244:3000/api/android/incomingCall/number/+919876543210
POST http://31.97.206.244:3000/api/android/outgoingCall/number/+919876543210
POST http://31.97.206.244:3000/api/android/callRecording/number/+919876543210
```

### Request Body (Any format - server extracts minimal data)
```json
{
  "call_details": {
    "live_event": "evt_completed_with_recording",
    "customer_number": "+919662682525"
  },
  "agent_details": [{
    "agent_number": "+919924936750"
  }]
}
```

### Android Receives (Minimal Data Only)
```json
{
  "type": "incomingCall",
  "agentPhone": "+919924936750",
  "customerPhone": "+919662682525",
  "live_event": "evt_completed_with_recording",
  "timestamp": "2025-07-30T08:59:16.000Z"
}
```

### API Response (Minimal)
```json
{
  "status": "success",
  "agentPhone": "+919924936750",
  "customerPhone": "+919662682525"
}
```

## 5. Complete Android Example

```java
public class CallService extends Service {
    private Socket socket;
    private String userPhoneNumber = "+919876543210"; // Get from user
    
    @Override
    public void onCreate() {
        super.onCreate();
        initSocket();
    }
    
    private void initSocket() {
        try {
            socket = IO.socket("http://31.97.206.244:3000");
            
            socket.on(Socket.EVENT_CONNECT, args -> registerClient());
            socket.on("incomingCall", this::handleIncomingCall);
            socket.on("outgoingCall", this::handleOutgoingCall);
            socket.on("callRecording", this::handleCallRecording);
            
            socket.connect();
            
        } catch (Exception e) {
            Log.e("CallService", "Socket error: " + e.getMessage());
        }
    }
    
    private void registerClient() {
        try {
            JSONObject data = new JSONObject();
            data.put("agentId", "android-" + userPhoneNumber.replaceAll("[^0-9]", ""));
            data.put("agentNumber", userPhoneNumber);
            data.put("agentName", "Android User");
            data.put("agentType", "mobile_client");
            
            socket.emit("registerAgent", data);
            
        } catch (Exception e) {
            Log.e("CallService", "Registration error: " + e.getMessage());
        }
    }
    
    private void handleIncomingCall(Object... args) {
        try {
            JSONObject data = (JSONObject) args[0];
            
            String agentPhone = data.getString("agentPhone");
            String customerPhone = data.getString("customerPhone");
            
            // Simple notification
            sendNotification("Incoming Call", customerPhone + " → " + agentPhone);
            
        } catch (Exception e) {
            Log.e("CallService", "Error handling incoming call: " + e.getMessage());
        }
    }
    
    private void handleOutgoingCall(Object... args) {
        try {
            JSONObject data = (JSONObject) args[0];
            
            String agentPhone = data.getString("agentPhone");
            String customerPhone = data.getString("customerPhone");
            
            sendNotification("Outgoing Call", agentPhone + " → " + customerPhone);
            
        } catch (Exception e) {
            Log.e("CallService", "Error handling outgoing call: " + e.getMessage());
        }
    }
    
    private void handleCallRecording(Object... args) {
        try {
            JSONObject data = (JSONObject) args[0];
            
            String agentPhone = data.getString("agentPhone");
            String customerPhone = data.getString("customerPhone");
            
            sendNotification("Call Recorded", agentPhone + " ↔ " + customerPhone);
            
        } catch (Exception e) {
            Log.e("CallService", "Error handling recording: " + e.getMessage());
        }
    }
    
    private void sendNotification(String title, String message) {
        // Your notification code here
        Log.d("CallService", title + ": " + message);
    }
}
```

## Key Benefits for Android:
- ✅ **Minimal data** - Only agent phone and customer phone
- ✅ **Simple JSON** - No complex parsing required
- ✅ **Specific targeting** - Send to exact phone number
- ✅ **Clean API** - Dedicated Android endpoints
- ✅ **Real-time** - Instant notifications via WebSocket
