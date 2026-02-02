# Sugarlens prototype

## How personal data is handled

No personal data is stored on the app and there is no backend. The login credendials are stored on the [Local Storage](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) of the browser on the user's machine.

## How the data is displayed and processed

The tools shows both the raw data and the data after a [Kalman filter](https://en.wikipedia.org/wiki/Kalman_filter) (R=0.1, Q=0.1) is applied. What is highlighed is the data AFTER the application of the filter.

The trend values are based on [Autoregressive model](https://en.wikipedia.org/wiki/Autoregressive_model) (AR2) learned over the smoothed data of the last day, similarly to what is done in the [NightScout project](https://nightscout.github.io/).

⚠️ **ATTENTION**: the trend values should not be used for any medical decision: they show just the trend of the blood glucose curve and are completely unaware of the external conditions (for example, if insulin has been administered, or carbohydrates have been ingested).

![image](https://github.com/user-attachments/assets/3abfecca-6b31-4c48-add1-e5205d524302)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```
