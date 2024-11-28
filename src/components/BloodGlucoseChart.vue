<template>
  <Line v-if="chartData" :data="chartData" :options="chartOptions"></Line>
</template>
  
<script>
import { Line } from 'vue-chartjs';
import 'chartjs-adapter-moment';
import { Chart as ChartJS, Tooltip, CategoryScale, TimeScale, LineElement, LinearScale, PointElement } from 'chart.js';
import regression from 'regression';

const minValue = 2;
const maxValue = 17;
const optimalMin = 4;
const optimalMax = 10;

// Register the necessary Chart.js components
ChartJS.register(Tooltip, CategoryScale, TimeScale, LineElement, LinearScale, PointElement);

// Plugin to draw horizontal lines
const horizontalLinePlugin = {
  id: "horizontalLinePlugin",
  beforeDraw(chart) {
    // eslint-disable-next-line
    const { ctx, chartArea: { top, bottom, left, right }, scales: { y } } = chart;
    const lines = chart.options.horizontalLines || [];

    lines.forEach((line) => {
      const yPos = y.getPixelForValue(line.y);
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = line.lineWidth || 1;
      ctx.strokeStyle = line.color || "rgba(0, 0, 0, 0.5)";
      ctx.setLineDash(line.dash || []); // For dashed lines
      ctx.moveTo(left, yPos);
      ctx.lineTo(right, yPos);
      ctx.stroke();
      ctx.restore();
    });
  },
};

export default {
  name: 'BloodGlucoseChart',
  components: {
    Line
  },
  props: {
    readings: {
      type: Array,
      required: true
    },
    amountOfDataPoints: {
      type: Number,
      default: 12*3
    }
  },
  setup() {
    ChartJS.register(horizontalLinePlugin);
  },
  data() {
    return {
      chartData: null, // Initialize chartData as null
      chartOptions: {
        responsive: true,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: "hour", // Display ticks every hour
              displayFormats: {
                hour: "HH:mm", // Custom format for hours
              },
            },
            ticks: {
              maxTicksLimit: 10,
              stepSize: 0.5,
            },
            grid: {
              drawTicks: true, // Ensures tick marks align with grid lines
              color: "#666666", // Vertical grid line color
            },
          },
          y: {
            suggestedMin: optimalMin,
            suggestedMax: optimalMax,
            grid: {
              color: "transparent",
            },
          }
        },
        maintainAspectRatio: false,
        horizontalLines: [
          { y: optimalMin, color: "red", lineWidth: 2, dash: [5, 5] },
          { y: optimalMax, color: "orange", lineWidth: 2, dash: [5, 5] },
        ],

      }
    };
  },
  watch: {
    // Watch for changes in the readings prop and update chartData accordingly
    readings(newReadings) {
      this.updateChartData(newReadings);
    }
  },
  methods: {
    updateChartData(readings) {
      // Check if the readings array is not empty
      if (!readings || readings.length === 0) {
        return;
      }

      var newReadings = readings.slice(-this.amountOfDataPoints);

      // Extract times and glucose values from the readings prop
      const times = newReadings.map((reading) => reading.time);
      const glucoseValues = newReadings.map((reading) => this.getActualReading(reading.mmol));
      const colors = newReadings.map((reading) => this.getColorForReading(reading.mmol));

      // prediction
      const fullRegressionLine = this.doRegression(newReadings.slice(-12));

      // Set chartData with proper structure
      this.chartData = {
        labels: times,
        datasets: [
          {
            data: glucoseValues,
            pointRadius: 3, // Increase the size of the points
            pointBackgroundColor: colors,
            borderColor: 'transparent',
          },
          {
            data: fullRegressionLine, // Use computed regression points
            // borderColor: 'rgba(255, 255, 255, 1)',
            borderColor: 'transparent',
            borderWidth: 1,
            borderDash: [0, 1], // Dashed regression line
            pointRadius: 4,
            pointBackgroundColor: 'rgba(255, 255, 255, 0.2)', // Gray points for regression line
          },
        ]
      };
    },
    // Determine the color based on whether the reading is in range
    getColorForReading(glucose) {
      if (glucose <= minValue) {
        return '#660000';
      } else if (glucose < optimalMin) {
        return 'red';
      } else if (glucose > maxValue) {
        return '#603B00';
      } else if (glucose >= optimalMax) {
        return 'orange';
      } else {
        return 'lightgreen';
      }
    },
    getActualReading(glucose) {
      if (glucose < minValue) {
        return minValue;
      } else if (glucose > maxValue) {
        return maxValue;
      }
      return glucose;
    },
    doRegression(data) {
      // Calculate regression points
      // Normalize time: Map time to [0, 1]
      const minTime = Math.min(...data.map((r) => new Date(r.time).getTime()));
      const maxTime = Math.max(...data.map((r) => new Date(r.time).getTime()));
      
      const normalizedData = data.map((r) => [
        (new Date(r.time).getTime() - minTime) / (maxTime - minTime), // Normalize time to [0, 1]
        this.getActualReading(r.mmol),
      ]);

      // Perform regression (linear regression in this case)
      const regressionResult = regression.linear(normalizedData);

      // Predict future points
      const lastTimeNormalized = (new Date(data[data.length - 1].time).getTime() - minTime) / (maxTime - minTime);
      const futurePoints = this.extendRegression(regressionResult, lastTimeNormalized, maxTime, minTime);

      // Extend the regression with future predictions and convert to actual time
      // const regressionPoints = regressionResult.points.map(([normalizedTime, value]) => ({
      //   x: new Date(minTime + normalizedTime * (maxTime - minTime)).toISOString(),
      //   y: value,
      // }));
      // return [...regressionPoints, ...futurePoints];
      return futurePoints;
    },
    // Function to extrapolate future points based on regression result
    extendRegression(regressionResult, lastNormalizedTime, maxTime, minTime) {
      const futurePoints = [];
      const futureInterval = 0.1; // Step size for generating future points
      
      // Extend the regression for the next 30 minutes (normalized)
      for (let i = 1; i <= 3; i++) {
        const futureNormalizedTime = lastNormalizedTime + (i * futureInterval);  // Increment in normalized units
        const futureY = this.predictValue(regressionResult.equation, futureNormalizedTime);
        
        // Convert the future normalized time back to real time (milliseconds)
        const futureRealTime = minTime + futureNormalizedTime * (maxTime - minTime);

        // Push the future point
        futurePoints.push({
          x: new Date(futureRealTime).toISOString(), // Convert back to ISO time string
          y: futureY,
        });
      }

      return futurePoints;
    },
    predictValue(equation, x) {
      // Linear equation: y = m * x + b
      return equation[0] * x + equation[1];
    }
  },
  mounted() {
    // Initialize chartData when the component is mounted
    this.updateChartData(this.readings);
  }
};
</script>
  
<style scoped>
  .v-card {
    max-width: 800px;
    margin: auto;
  }
  
  .line-chart {
    height: 400px;
  }
</style>
  
