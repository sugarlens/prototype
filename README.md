# Sugarlens prototype

## How personal data is handled

No personal data is stored on the app and there is no backend. The login credendials are stored on the [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) of the browser on the user's machine.

## How the data is displayed and processed

The tools shows both the raw data and the data after a [Kalman filter](https://en.wikipedia.org/wiki/Kalman_filter) (R=0.1, Q=0.1) is applied. What is highlighed is the data AFTER the application of the filter.

The prediction is based on [Double Exponential Smoothing](https://en.wikipedia.org/wiki/Exponential_smoothing) learned over the raw data of the last day. Parameters are optimized looking at 20 possible values evenly distributed. 

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```
