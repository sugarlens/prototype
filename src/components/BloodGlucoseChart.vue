<template>
  <Line v-if="chartData" :data="chartData" :options="chartOptions"></Line>
</template>
  
<script>
import { Line } from 'vue-chartjs';
import 'chartjs-adapter-moment';
import { Chart as ChartJS, Tooltip, CategoryScale, TimeScale, LineElement, LinearScale, PointElement } from 'chart.js';
import regression from 'regression';
import KalmanFilter from 'kalmanjs';

const minValue = 2;
const maxValue = 17;
const optimalMin = 4;
const optimalMax = 10;
const pointsForRegression = 12;

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
    ChartJS.register([ horizontalLinePlugin ]);
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

      // Consider only the last amountOfDataPoints readings
      var newReadings = readings.slice(-this.amountOfDataPoints);
      var smoothedReadings = this.smoothData(readings.map((reading) => reading.mmol)).slice(-this.amountOfDataPoints);

      // Extract times and glucose values from the readings prop
      const times = newReadings.map((reading) => reading.time);
      const glucoseValues = newReadings.map((reading) => this.getActualReading(reading.mmol));
      const colorsActualReadings = newReadings.map((reading) => this.getColorForReading(reading.mmol, 0.3));
      const colorsSmoothedReadings = smoothedReadings.map((reading) => this.getColorForReading(reading, 0.9));

      // prediction
      // const dataForPrediction = smoothedReadings.map((value, index) => ({ time: newReadings[index].time, mmol: value }));
      const [ pastRegressionPoints, futureRegressionPoints ] = this.doRegression(newReadings.slice(-pointsForRegression));

      // Set chartData with proper structure
      this.chartData = {
        labels: times,
        datasets: [
          {
            // Raw glucose values
            data: glucoseValues,
            pointRadius: 2,
            pointBackgroundColor: colorsActualReadings,
            borderColor: 'transparent',
          },
          {
            // Smoothed glucose values
            data: smoothedReadings,
            pointRadius: 3,
            borderWidth: 1,
            pointBackgroundColor: colorsSmoothedReadings,
            borderColor: 'transparent',
          },
          {
            // Regression line for past data
            data: pastRegressionPoints,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            borderWidth: 1,
            pointRadius: 0,
            borderDash: [5, 2],
          },
          {
            // Regression line for future data
            data: futureRegressionPoints,
            borderColor: 'transparent',
            borderWidth: 0,
            pointRadius: 3,
            pointBackgroundColor: 'rgba(255, 255, 255, 0.5)',
          },
        ]
      };
    },
    // Determine the color based on whether the reading is in range
    getColorForReading(glucose, alpha = 1) {
      if (glucose <= minValue) {
        return 'rgba(102,0,0, ' + alpha + ')';
      } else if (glucose < optimalMin) {
        return 'rgba(255, 0, 0, ' + alpha + ')';
      } else if (glucose > maxValue) {
        return 'rgba(96, 59, 0, ' + alpha + ')';
      } else if (glucose >= optimalMax) {
        return 'rgba(255, 165, 0, ' + alpha + ')';
      } else {
        return 'rgba(144, 238, 144, ' + alpha + ')';
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
      const minTime = Math.min(...data.map((r) => new Date(r.time).getTime()));
      const maxTime = Math.max(...data.map((r) => new Date(r.time).getTime()));
      const normalizedData = data.map((r) => [
        (new Date(r.time).getTime() - minTime) / (maxTime - minTime),
        this.getActualReading(r.mmol),
      ]);

      // Train the regression model
      const regressionResult = this.getBestRegression(normalizedData);

      // Predict future points
      const lastTimeNormalized = (new Date(data[data.length - 1].time).getTime() - minTime) / (maxTime - minTime);
      const futurePoints = this.extendRegression(regressionResult, lastTimeNormalized, maxTime, minTime);

      const regressionPoints = regressionResult.points.map(([normalizedTime, value]) => ({
        x: new Date(minTime + normalizedTime * (maxTime - minTime)).toISOString(),
        y: value,
      }));
      return [ regressionPoints, futurePoints ];
    },
    // Function to extrapolate future points based on regression result
    extendRegression(regressionResult, lastNormalizedTime, maxTime, minTime) {
      const futurePoints = [];
      const futureInterval = 1/pointsForRegression; // Step size for generating future points
      
      // Extend the regression for the future
      for (let i = 1; i <= 3; i++) {
        const futureNormalizedTime = lastNormalizedTime + (i * futureInterval);  // Increment in normalized units
        const futureY = this.predictValue(regressionResult, futureNormalizedTime);
        
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
    getBestRegression(data) {
      var models = [];
      // models.push(regression.linear(data));
      // models.push(regression.polynomial(data, { order: 2 }));
      models.push(regression.polynomial(data, { order: 3 }));
      // models.push(regression.exponential(data));

      // select model with the highest R^2 value
      var bestModel = models.reduce((best, model) => {
        return model.r2 > best.r2 ? model : best;
      });
      return bestModel;
    },
    predictValue(model, x) {
      // Linear equation: y = m * x + b
      var value = model.predict(x)[1];
      if (value < 2) {
        return 2
      } else if (value > 20) {
        return 20;
      }
      return value;
    },
    smoothData(glucoseData) {
      // Initialize the Kalman filter
      const kf = new KalmanFilter({
        R: 1, // Measurement noise (lower = trusts sensor more)
        Q: 2,    // Process noise (higher = smoother trends)
      });
      return glucoseData.map(point => kf.filter(point).toFixed(2));
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
  
