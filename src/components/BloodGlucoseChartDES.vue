<template>
	<Line v-if="chartData" :data="chartData" :options="chartOptions"></Line>
</template>

<script>
import { Line } from 'vue-chartjs';
import 'chartjs-adapter-moment';
import { Chart as ChartJS, Tooltip, CategoryScale, TimeScale, LineElement, LinearScale, PointElement } from 'chart.js';
import { smoothData, getColorForReading, getActualReading, doRegression, horizontalLinePlugin, futureBackgroundPlugin, calculatePointsForRegression } from './chartUtils';

const minValue = 2;
const maxValue = 17;
const optimalMin = 4;
const optimalMax = 10;
const pointsForRegressionMax = 18;
const pointsForRegressionMin = 6;

// Register the necessary Chart.js components
ChartJS.register(Tooltip, CategoryScale, TimeScale, LineElement, LinearScale, PointElement, horizontalLinePlugin, futureBackgroundPlugin);

export default {
	name: 'BloodGlucoseChartDES',
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
			default: 12 * 3
		}
	},
	data() {
		return {
			chartData: null,
			chartOptions: {
				responsive: true,
				scales: {
					x: {
						type: 'time',
						time: {
							unit: "hour",
							displayFormats: {
								hour: "HH:mm",
							},
						},
						ticks: {
							maxTicksLimit: 10,
							stepSize: 0.5,
						},
						grid: {
							drawTicks: true,
							color: "#666666",
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
				plugins: {
					futureBackgroundPlugin: true
				},
			},
		};
	},
	watch: {
		// Watch for changes in the readings prop and update chartData accordingly
		readings(newReadings) {
			this.updateChartData(newReadings);
		}
	},
	methods: {
		async updateChartData(readings) {
			// Check if the readings array is not empty
			if (!readings || readings.length === 0) {
				return;
			}

			// Add the average glucose as a horizontal line
			const averageGlucose = this.calculateAverage(readings);
			if (this.chartOptions.horizontalLines.length > 2) {
				this.chartOptions.horizontalLines.pop();
			}
			this.chartOptions.horizontalLines.push({
				y: averageGlucose,
				color: "gray",
				lineWidth: 1,
				dash: [5, 5],
			});

			// Consider only the last amountOfDataPoints readings
			var newReadings = readings.slice(-this.amountOfDataPoints);
			var smoothedReadings = smoothData(readings.map((reading) => reading.mmol)).slice(-this.amountOfDataPoints);

			// Extract times and glucose values from the readings prop
			const glucoseValues = newReadings.map((reading) => getActualReading(reading.mmol, minValue, maxValue));
			const colorsActualReadings = newReadings.map((reading) => getColorForReading(reading.mmol, minValue, maxValue, optimalMin, optimalMax, 0.3));
			const colorsSmoothedReadings = smoothedReadings.map((reading) => getColorForReading(reading, minValue, maxValue, optimalMin, optimalMax, 0.9));
			const lastTime = readings[readings.length - 1].time;

			// Regression prediction
			// compute how many points to use for the regression based on the spread of the data
			const pointsForRegressionCheck = pointsForRegressionMin + Math.round((pointsForRegressionMax - pointsForRegressionMin) / 2);
			const dataForPrediction = smoothedReadings.map((value, index) => ({ time: newReadings[index].time, mmol: parseFloat(value) }));
			const pointsForRegression = calculatePointsForRegression(dataForPrediction.slice(-pointsForRegressionCheck), pointsForRegressionMin, pointsForRegressionMax);
			const [pastRegressionPoints, futureRegressionPoints] = doRegression(dataForPrediction.slice(-pointsForRegression), minValue, maxValue, pointsForRegression);
			const futureRegressionPointsWithTime = futureRegressionPoints.map((point, index) => ({
				x: new Date(lastTime.getTime() + (index + 1) * 5 * 60 * 1000),
				y: point
			}));

			// SES prediction
			const zodiac = require("zodiac-ts");
			var alpha = 0;
			var ses = new zodiac.DoubleExponentialSmoothing(readings.map((reading) => reading.mmol), alpha);
			ses.optimizeParameter(50);
			var forecast = ses.predict(3).slice(-3);
			const futureDESPoints = forecast.map((value, index) => ({
				x: new Date(lastTime.getTime() + (index + 1) * 5 * 60 * 1000),
				y: getActualReading(value).toFixed(2)
			}));

			// definition of labels as all times
			var times = [...newReadings.map((reading) => reading.time), ...futureRegressionPointsWithTime.map((point) => new Date(point.x))];

			// Set chartData with proper structure
			this.chartData = {
				labels: times,
				datasets: [
					{
						// Raw glucose values
						label: 'Raw glucose values',
						data: glucoseValues,
						pointRadius: 2,
						pointBackgroundColor: colorsActualReadings,
						borderColor: 'transparent',
					},
					{
						// Smoothed glucose values
						label: 'Past', // name is fixed so that the future background area is properly colored
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
						label: 'Regression prediction',
						data: futureRegressionPointsWithTime,
						borderColor: 'transparent',
						borderWidth: 0,
						pointRadius: 3,
						pointBackgroundColor: 'rgba(255, 255, 255, 0.5)',
					},
					{
						// Regression line for future data
						label: 'DES Forecast',
						data: futureDESPoints,
						borderColor: 'transparent',
						borderWidth: 0,
						pointRadius: 3,
						pointBackgroundColor: 'rgba(49, 151, 190, 1)',
					},
				]
			};
		},
		evaluateModel(actual, predicted) {
			const n = actual.length;
			let sumSquaredError = 0;

			for (let i = 0; i < n; i++) {
				sumSquaredError += Math.pow(actual[i] - predicted[i], 2);
				// console.log(`Actual: ${actual[i]}, Predicted: ${predicted[i]}`);
			}
			return Math.sqrt(sumSquaredError / n); // Return RMSE
		},
		calculateAverage(readings) {
			if (!readings || readings.length === 0) return 0;
			const total = readings.reduce((sum, reading) => sum + reading.mmol, 0);
			return total / readings.length;
		},

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
