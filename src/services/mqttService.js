import mqtt from "mqtt";

let client = null;

const connectAndSubscribe = (onMessageCallback, onErrorCallback) => {
  const host = "wss://3d820d7ce1a34bd0b8804d67d848abf6.s1.eu.hivemq.cloud:8884/mqtt"; // WebSocket Secure URL
  const username = "subscribe";
  const password = "Subscribe1";

  console.log("Initializing MQTT client with the following configuration:");
  console.log(`Host: ${host}, Username: ${username}`);

  // Connect to the MQTT broker
  client = mqtt.connect(host, {
    username,
    password,
    reconnectPeriod: 3000, // Automatically reconnect after 3 seconds
    keepalive: 60, // Keepalive in seconds
    clean: true, // Start a clean session
  });

  // Handle successful connection
  client.on("connect", () => {
    console.log("Connected to MQTT broker!");

    // Subscribe to topics
    client.subscribe("sensors/ph", (err) => {
      if (err) {
        console.error("Failed to subscribe to sensors/ph:", err.message);
      } else {
        console.log("Subscribed to sensors/ph");
      }
    });

    client.subscribe("sensors/ammonia_gas", (err) => {
      if (err) {
        console.error("Failed to subscribe to sensors/ammonia_gas:", err.message);
      } else {
        console.log("Subscribed to sensors/ammonia_gas");
      }
    });

    client.subscribe("sensors/ammonia_water", (err) => {
      if (err) {
        console.error("Failed to subscribe to sensors/ammonia_water:", err.message);
      } else {
        console.log("Subscribed to sensors/ammonia_water");
      }
    });
  });

  // Handle incoming messages
  client.on("message", (topic, message) => {
    const payload = message.toString();
    console.log(`Message received: Topic=${topic}, Payload=${payload}`);
    if (onMessageCallback) {
      onMessageCallback({ topic, payload });
    }
  });

  // Handle connection loss
  client.on("close", () => {
    console.log("Connection closed. Attempting to reconnect...");
  });

  // Handle errors
  client.on("error", (error) => {
    console.error("Connection error:", error.message);
    if (onErrorCallback) {
      onErrorCallback(error);
    }
  });
};

const publish = (topic, payload) => {
  if (client && client.connected) {
    client.publish(topic, payload, (err) => {
      if (err) {
        console.error("Failed to publish message:", err.message);
      } else {
        console.log(`Message published: Topic=${topic}, Payload=${payload}`);
      }
    });
  } else {
    console.error("Cannot publish message. Client is not connected.");
  }
};

export default { connectAndSubscribe, publish };
