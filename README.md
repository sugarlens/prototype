# prototype

## How the data is processed

The tools shows both the raw data and the data after a Kalman filter is applied. What is highlighed is the data AFTER the application of the filter.

The prediction is based on a polynomial regression of order 3 computed on the raw data (now on the filtered one).

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
