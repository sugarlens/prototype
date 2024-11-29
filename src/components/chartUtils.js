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
        x: new Date(minTime + normalizedTime * (maxTime - minTime)).toISOString(),
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

        // Convert the future normalized time back to real time (milliseconds)
        const futureRealTime = minTime + futureNormalizedTime * (maxTime - minTime);

        // Push the future point
        futurePoints.push({
            x: new Date(futureRealTime).toISOString(), // Convert back to ISO time string
            y: futureY,
        });
    }

    return futurePoints;
}

export function getBestRegression(data) {
    // var models = [];
    // models.push(regression.linear(data));
    // models.push(regression.polynomial(data, { order: 2 }));
    // models.push(regression.polynomial(data, { order: 3 }));
    // models.push(regression.exponential(data));

    // select model with the highest R^2 value
    // var bestModel = models.reduce((best, model) => {
    //   return model.r2 > best.r2 ? model : best;
    // });
    // return bestModel;

    return regression.polynomial(data, { order: 3 });
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
        R: 1, // Measurement noise (lower = trusts sensor more)
        Q: 2, // Process noise (higher = smoother trends)
    });
    return glucoseData.map(point => kf.filter(point).toFixed(2));
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
