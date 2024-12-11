<template>
  <div style="display: flex; flex-direction: column; height: 100vh; background-color: #f4f2e8;">
    <!-- Header Section -->
    <div style="padding: 30px; text-align: center; background-color: #2c3e50; color: white; border-radius: 10px 10px 0 0;">
      <h1 style="font-size: 2.5rem; font-weight: bold;">Ammonia Water Level Monitoring</h1>
      <button @click="connect" style="padding: 12px 25px; background-color: #3498db; color: white; border: none; border-radius: 5px; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        Connect and Subscribe
      </button>
    </div>

    <!-- Main Content Section -->
    <div style="flex: 1; display: flex; gap: 30px; padding: 40px 20px; justify-content: space-between; flex-wrap: wrap;">

      <!-- Graphs Section -->
      <div style="flex: 2; display: flex; flex-direction: column; gap: 25px; max-width: 65%;"> 

        <!-- pH Level Graph -->
        <div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);">
          <h3 style="text-align: center; font-size: 1.5rem; color: #333;">pH Level</h3>
          <div id="phChart" style="width: 100%; height: 350px;"></div>
        </div>

        <!-- Ammonia Gas Level Graph -->
        <div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);">
          <h3 style="text-align: center; font-size: 1.5rem; color: #333;">Ammonia Gas Level</h3>
          <div id="ammoniaGasChart" style="width: 100%; height: 350px;"></div>
        </div>

        <!-- Ammonia Water Level Graph -->
        <div style="background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);">
          <h3 style="text-align: center; font-size: 1.5rem; color: #333;">Ammonia Water Level</h3>
          <div id="ammoniaWaterChart" style="width: 100%; height: 350px;"></div>
        </div>
      </div>

      <!-- Right Sidebar Section -->
      <div style="width: 400px; background-color: #ecf0f1; border-radius: 10px; padding: 25px; box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);">

        <!-- Alerts & Thresholds -->
        <h3 style="text-align: center; font-size: 2.2rem; color: #2c3e50;">Alerts & Thresholds</h3>
        <ul style="padding: 0; list-style: none; font-size: 14px; margin-bottom: 20px; max-height: 500px; overflow-y: auto;">
          <li v-for="(log, index) in logs" :key="index" style="background: #f9f9f9; padding: 12px; margin-bottom: 10px; border-radius: 8px; word-wrap: break-word; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <span style="font-size: 1.2rem; color: #333;">{{ log }}</span>
          </li>
        </ul>

        <!-- Threshold Settings -->
        <div>
          <h4 style="font-size: 1.2rem; color: #333;">Set Threshold for Ammonia Water</h4>
          <div style="display: flex; flex-direction: column; gap: 15px;">
            <div>
              <label for="lowerThreshold" style="color: #2c3e50; font-weight: bold;">Lower Threshold:</label>
              <input type="number" v-model.number="thresholds.ammoniaWater.lower" style="width: 100%; padding: 10px; font-size: 1rem; border-radius: 5px; border: 1px solid #ddd;" />
            </div>
            <div>
              <label for="upperThreshold" style="color: #2c3e50; font-weight: bold;">Upper Threshold:</label>
              <input type="number" v-model.number="thresholds.ammoniaWater.upper" style="width: 100%; padding: 10px; font-size: 1rem; border-radius: 5px; border: 1px solid #ddd;" />
            </div>
          </div>
          <button @click="setThresholds" style="margin-top: 15px; padding: 12px 20px; background-color: #2ecc71; color: white; border: none; border-radius: 5px; font-size: 1rem; cursor: pointer; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            Set Thresholds
          </button>
        </div>

        <!-- Ammonia Water Level Status -->
        <div style="margin-top: 20px;">
          <h4 style="font-size: 1.5rem; color: #333;">Status:</h4>
          <div :style="ammoniaWaterStatusStyle" style="padding: 15px; border-radius: 8px; text-align: center; font-size: 1.5rem; font-weight: bold;">
            {{ ammoniaWaterStatus }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mqttService from "../services/mqttService.js";
import * as echarts from "echarts";

export default {
  data() {
    return {
      logs: [],
      chart: null,
      thresholds: {
        temperature: 30,
        humidity: 70,
        ammoniaWater: {
          lower: 10,
          upper: 50,
        },
      },
      chartOptions: {
        ph: {
          xAxis: { type: "category", data: [] },
          yAxis: { type: "value" },
          series: [
            { name: "pH Level", type: "line", data: [], smooth: true, color: "#ff6384" },
          ],
        },
        ammoniaGas: {
          xAxis: { type: "category", data: [] },
          yAxis: { type: "value" },
          series: [
            { name: "Ammonia Gas", type: "line", data: [], smooth: true, color: "#36a2eb" },
          ],
        },
        ammoniaWater: {
          xAxis: { type: "category", data: [] },
          yAxis: { type: "value" },
          series: [
            { name: "Ammonia Water", type: "line", data: [], smooth: true, color: "#ffcd56" },
          ],
        },
      },
      ammoniaWaterStatus: "Normal",
      ammoniaWaterStatusStyle: {
        backgroundColor: "#2ecc71",
        color: "white",
      },
    };
  },
  methods: {
    addLog(message) {
      this.logs.push(message);
      if (this.logs.length > 50) this.logs.shift(); // Keep the logs limited to the last 50 entries
    },

    initializeChart() {
      this.phChart = echarts.init(document.getElementById("phChart"));
      this.ammoniaGasChart = echarts.init(document.getElementById("ammoniaGasChart"));
      this.ammoniaWaterChart = echarts.init(document.getElementById("ammoniaWaterChart"));
      this.phChart.setOption(this.chartOptions.ph);
      this.ammoniaGasChart.setOption(this.chartOptions.ammoniaGas);
      this.ammoniaWaterChart.setOption(this.chartOptions.ammoniaWater);
    },

    updateChart(topic, payload) {
      const value = Number(payload);
      const timestamp = new Date().toLocaleTimeString();

      // Ensure that charts are initialized before attempting to update them
      if (!this.phChart || !this.ammoniaGasChart || !this.ammoniaWaterChart) {
        this.addLog("Error: Charts not initialized yet.");
        return;
      }

      // Determine the formatted log message based on the topic
      let logMessage = "";
      let statusMessage = "";

      if (topic === "sensors/ph") {
        logMessage = `pH Level: ${value.toFixed(2)}`;
      } else if (topic === "sensors/ammonia_gas") {
        logMessage = `Ammonia Gas (ppm): ${value.toFixed(2)}`;
      } else if (topic === "sensors/ammonia_water") {
        logMessage = `Ammonia Concentration in Water (ppm): ${value.toFixed(6)}`;

        // Check ammonia water value against thresholds
        if (value < this.thresholds.ammoniaWater.lower) {
          this.ammoniaWaterStatus = "Low";
          this.ammoniaWaterStatusStyle.backgroundColor = "#e74c3c"; // Red
          this.ammoniaWaterStatusStyle.color = "white";
        } else if (value > this.thresholds.ammoniaWater.upper) {
          this.ammoniaWaterStatus = "High";
          this.ammoniaWaterStatusStyle.backgroundColor = "#f39c12"; // Orange
          this.ammoniaWaterStatusStyle.color = "white";
        } else {
          this.ammoniaWaterStatus = "Normal";
          this.ammoniaWaterStatusStyle.backgroundColor = "#2ecc71"; // Green
          this.ammoniaWaterStatusStyle.color = "white";
        }
        
        // Log ammonia water status
        this.addLog(statusMessage);
      }

      // Add the formatted log message to the logs
      if (logMessage) {
        this.addLog(logMessage);
      }

      // Update the chart data
      switch (topic) {
        case "sensors/ph":
          this.chartOptions.ph.xAxis.data.push(timestamp);
          this.chartOptions.ph.series[0].data.push(value);
          this.phChart.setOption(this.chartOptions.ph);
          break;
        case "sensors/ammonia_gas":
          this.chartOptions.ammoniaGas.xAxis.data.push(timestamp);
          this.chartOptions.ammoniaGas.series[0].data.push(value);
          this.ammoniaGasChart.setOption(this.chartOptions.ammoniaGas);
          break;
        case "sensors/ammonia_water":
          this.chartOptions.ammoniaWater.xAxis.data.push(timestamp);
          this.chartOptions.ammoniaWater.series[0].data.push(value);
          this.ammoniaWaterChart.setOption(this.chartOptions.ammoniaWater);
          break;
          default:
          break;
      }
    },

    connect() {
      this.addLog("Connecting to MQTT broker...");
      mqttService.connectAndSubscribe(
        (message) => {
          const { topic, payload } = message;
          this.updateChart(topic, payload); // Update chart and log based on topic
        },
        (error) => {
          this.addLog(`Connection error: ${error.message}`);
        }
      );
    },

    setThresholds() {
      // Log ammonia water thresholds
      if (this.thresholds && this.thresholds.ammoniaWater) {
        this.addLog(
          `New ammonia water thresholds: ${this.thresholds.ammoniaWater.lower} - ${this.thresholds.ammoniaWater.upper}`
        );
      } else {
        this.addLog("Error: Ammonia water thresholds are not defined.");
      }
    },
  },

  mounted() {
    // Initialize the charts when the component is mounted
    this.initializeChart();
  },
};
</script>

<style scoped>
/* Global Styles */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f4f2e8;
}

h1 {
  font-size: 2.5rem;
}

button:hover {
  opacity: 0.9;
}

ul {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 20px;
  border-right: 1px solid #ddd;
}
</style>
