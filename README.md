# Sugarlens prototype

## How the data is processed

The tools shows both the raw data and the data after a Kalman filter is applied. What is highlighed is the data AFTER the application of the filter.

The prediction is based on the regression model with highest R^2 among linear, polynomial degree 2, polynomial degree 3. The number of data points is selected by consideing the spread of the latest data (the higher the spread the less points considered). All this is computed on the data after the Kalman filter.

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```
