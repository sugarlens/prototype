import regression from 'regression';
import KalmanFilter from 'kalmanjs';

// Determine the color based on whether the reading is in range
export function getColorForReading(glucose, minValue, maxValue, optimalMin, optimalMax, alpha = 1) {
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
}

export function getActualReading(glucose, minValue, maxValue) {
	if (glucose < minValue) {
		return minValue;
	} else if (glucose > maxValue) {
		return maxValue;
	}
	return glucose;
}

export function doRegression(data, minValue, maxValue, pointsForRegression) {
	// Calculate regression points
	const minTime = Math.min(...data.map((r) => new Date(r.time).getTime()));
	const maxTime = Math.max(...data.map((r) => new Date(r.time).getTime()));
	const normalizedData = data.map((r) => [
		(new Date(r.time).getTime() - minTime) / (maxTime - minTime),
		getActualReading(r.mmol, minValue, maxValue),
	]);

	// Train the regression model
	const regressionResult = getBestRegression(normalizedData);

	// Predict future points
	const lastTimeNormalized = (new Date(data[data.length - 1].time).getTime() - minTime) / (maxTime - minTime);
	const futurePoints = extendRegression(regressionResult, lastTimeNormalized, maxTime, minTime, pointsForRegression);

	const regressionPoints = regressionResult.points.map(([normalizedTime, value]) => ({
		x: new Date(minTime + normalizedTime * (maxTime - minTime)),
		y: value,
	}));
	return [regressionPoints, futurePoints];
}

// Function to extrapolate future points based on regression result
export function extendRegression(regressionResult, lastNormalizedTime, maxTime, minTime, pointsForRegression) {
	const futurePoints = [];
	const futureInterval = 1 / pointsForRegression; // Step size for generating future points

	// Extend the regression for the future
	for (let i = 1; i <= 3; i++) {
		const futureNormalizedTime = lastNormalizedTime + (i * futureInterval);  // Increment in normalized units
		const futureY = predictValue(regressionResult, futureNormalizedTime);

		// Push the future point
		futurePoints.push(futureY);
	}

	return futurePoints;
}

export function getBestRegression(data) {
	var models = [];
	models.push(regression.linear(data));
	models.push(regression.polynomial(data, { order: 2, precision: 3 }));
	models.push(regression.polynomial(data, { order: 3, precision: 3 }));
	models.push(regression.polynomial(data, { order: 4, precision: 3 }));
	models.push(regression.power(data));
	models.push(regression.exponential(data));

	// select model with the highest R^2 value
	var bestModel = models.reduce((best, model) => {
		return model.r2 > best.r2 ? model : best;
	});
	// console.log(bestModel);
	return bestModel;

	// return regression.polynomial(data, { order: 2 });
}

export function predictValue(model, x) {
	// Linear equation: y = m * x + b
	var value = model.predict(x)[1];
	if (value < 2) {
		return 2
	} else if (value > 20) {
		return 20;
	}
	return value;
}

export function smoothData(glucoseData) {
	// Initialize the Kalman filter
	const kf = new KalmanFilter({
		R: 0.1, // Measurement noise (lower = trusts sensor more)
		Q: 0.1, // Process noise (higher = smoother trends)
	});
	return glucoseData.map(point => kf.filter(point).toFixed(2));
}

export function calculatePointsForRegression(data, minPointsForRegression, maxPointsForRegression) {
	const values = data.map(point => point.mmol); // Extract glucose values
	const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
	const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
	var spread = Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length);
	// console.log(spread);
	const maxSpread = 1; // Maximum spread threshold
	const minSpread = 0.1; // Minimum spread threshold

	// Clamp spread between minSpread and maxSpread
	spread = Math.max(minSpread, Math.min(spread, maxSpread));

	// Map spread to the range of points
	return Math.round(
		maxPointsForRegression - ((spread - minSpread) / (maxSpread - minSpread)) * (maxPointsForRegression - minPointsForRegression)
	);

}

export function calculateAverage(readings) {
	if (!readings || readings.length === 0) return 0;
	const total = readings.reduce((sum, reading) => sum + reading.mmol, 0);
	return total / readings.length;
}


// Plugin to fill horizontal area
export const horizontalFillPlugin = {
	id: "horizontalFill",
	beforeDraw(chart, args, pluginOptions) {
		const { ctx, chartArea, scales } = chart;
		const { startValue, endValue, color } = pluginOptions;

		const startY = scales.y.getPixelForValue(startValue);
		const endY = scales.y.getPixelForValue(endValue);

		ctx.save();
		ctx.fillStyle = color;
		ctx.fillRect(chartArea.left, endY, chartArea.width, startY - endY);
		ctx.restore();
	},
};

// Plugin to draw horizontal lines
export const horizontalLinePlugin = {
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

export const futureBackgroundPlugin = {
	id: 'futureBackgroundPlugin',
	beforeDraw(chart) {
		const { ctx, chartArea, scales } = chart;
		const { top, bottom } = chartArea;
		const xScale = scales.x;
		const pastDataset = chart.data.datasets.find(dataset => dataset.label === 'Raw glucose value');
		const lastPastIndex = pastDataset?.data[pastDataset.data.length - 1]?.x;
		const firstFutureX = xScale.getPixelForValue(lastPastIndex) + 5;
		if (firstFutureX) {
			ctx.save();
			ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
			ctx.fillRect(firstFutureX, top, chartArea.right - firstFutureX, bottom - top);
			ctx.restore();
		}
	}
};
