<template>
	<Line v-if="chartData" :data="chartData" :options="chartOptions"></Line>
</template>

<script>
import { IN_RANGE_MIN, IN_RANGE_MAX, CHART_MIN, CHART_MAX, getmgdLValue } from '../dexcom/valueparser';

import { Line } from 'vue-chartjs';
import 'chartjs-adapter-moment';
import { Chart as ChartJS, Tooltip, CategoryScale, TimeScale, LineElement, LinearScale, PointElement } from 'chart.js';
import { smoothData, getColorForReading, getActualReading, horizontalLinePlugin, futureBackgroundPlugin, calculateAverage } from './chartUtils';
import { forecastAR2, forecastAR2Cone } from '@/plugins/prediction';

const minValue = CHART_MIN;
const maxValue = CHART_MAX;
const optimalMin = IN_RANGE_MIN;
const optimalMax = IN_RANGE_MAX;

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

			// Consider only the last amountOfDataPoints readings
			var newReadings = readings.slice(-this.amountOfDataPoints);
			var smoothedReadings = smoothData(readings.map((reading) => reading.value)).slice(-this.amountOfDataPoints);

			// Add the average glucose as a horizontal line
			const averageGlucose = calculateAverage(newReadings);
			if (this.chartOptions.horizontalLines.length > 2) {
				this.chartOptions.horizontalLines.pop();
			}
			this.chartOptions.horizontalLines.push({
				y: averageGlucose,
				color: "rgba(255, 255, 255, 0.2)",
				lineWidth: 3,
				dash: [7, 3],
			});

			// Extract times and glucose values from the readings prop
			const glucoseValues = newReadings.map((reading) => ({
				x: reading.time,
				y: getActualReading(reading.value, minValue, maxValue)
			}));
			const colorsActualReadings = newReadings.map((reading) => getColorForReading(reading.value, minValue, maxValue, optimalMin, optimalMax, 0.3));
			const colorsSmoothedReadings = smoothedReadings.map((reading) => getColorForReading(reading, minValue, maxValue, optimalMin, optimalMax, 0.9));
			const lastTime = readings[readings.length - 1].time;

			// DES prediction
			// const zodiac = require("zodiac-ts");
			// var alpha = 0;
			// var ses = new zodiac.DoubleExponentialSmoothing(readings.map((reading) => reading.value), alpha);
			// ses.optimizeParameter(20);
			// var forecast = ses.predict(3).slice(-3);

			// AR2 prediction
			const series = readings.map(r => getmgdLValue(r.value));
			const forecast = forecastAR2(series, 4);
			const forecast_cone = forecastAR2Cone(series, 4, { coneFactor: 2 });
			
			const futureDESPoints = forecast.map((value, index) => ({
				x: new Date(lastTime.getTime() + (index + 1) * 5 * 60 * 1000),
				y: (getActualReading(value, minValue, maxValue)).toFixed(2),
			}));
			const futureDESPoints_up = forecast_cone.map((point) => ({
				x: new Date(lastTime.getTime() + point.k * 5 * 60 * 1000),
				y: (getActualReading(point.high, minValue, maxValue)).toFixed(2)
			}));
			const futureDESPoints_low = forecast_cone.map((point) => ({
				x: new Date(lastTime.getTime() + point.k * 5 * 60 * 1000),
				y: (getActualReading(point.low, minValue, maxValue)).toFixed(2)
			}));

			// definition of labels as all times
			var times = [
				...newReadings.map((reading) => reading.time),
				...futureDESPoints.map((point) => new Date(point.x))
			];

			// Set chartData with proper structure
			this.chartData = {
				labels: times,
				datasets: [
					{
						// Raw glucose values
						label: 'Raw glucose value',
						data: glucoseValues,
						pointRadius: 2,
						pointBackgroundColor: colorsActualReadings,
						borderColor: 'transparent',
					},
					{
						// Smoothed glucose values
						label: 'Glucose value', // name is fixed so that the future background area is properly colored
						data: smoothedReadings,
						pointRadius: 3,
						borderWidth: 1,
						pointBackgroundColor: colorsSmoothedReadings,
						borderColor: 'transparent',
					},
					{
						// Prediction points
						label: 'AR2 Forecast cone',
						data: futureDESPoints_low.concat(futureDESPoints_up),
						borderColor: 'rgba(49, 151, 190, 0.75)',
						borderWidth: 1,
						pointRadius: 2,
						pointBackgroundColor: 'rgba(49, 151, 190, 0.25)',
						showLine: false
					},
					{
						// Prediction points
						label: 'AR2 Forecast',
						data: futureDESPoints,
						borderColor: 'rgba(49, 151, 190, 1)',
						borderWidth: 0,
						pointRadius: 3,
						pointBackgroundColor: 'rgba(49, 151, 190, 1)',
						showLine: false
					},
				]
			};
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
