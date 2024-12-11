import { defineStore } from 'pinia';
import mqtt from 'mqtt';

export const useSensorStore = defineStore('sensor', {
  state: () => ({
    sensorData: {}, // Real-time sensor data
    mqttClient: null, // MQTT client instance
  }),
  actions: {
    // Connect to the MQTT broker
    connectMQTT(brokerUrl, options) {
      this.mqttClient = mqtt.connect(brokerUrl, options);

      this.mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
        this.subscribeToTopic('sensor/data');
      });

      this.mqttClient.on('message', (topic, message) => {
        if (topic === 'sensor/data') {
          this.sensorData = JSON.parse(message.toString());
        }
      });

      this.mqttClient.on('error', (error) => {
        console.error('MQTT Error:', error);
      });
    },

    // Subscribe to a topic
    subscribeToTopic(topic) {
      if (this.mqttClient) {
        this.mqttClient.subscribe(topic, (err) => {
          if (err) {
            console.error(`Failed to subscribe to ${topic}:`, err);
          } else {
            console.log(`Subscribed to ${topic}`);
          }
        });
      }
    },
  },
  getters: {
    // Access sensor data
    getSensorData: (state) => state.sensorData,
  },
});
