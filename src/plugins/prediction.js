import { getTranslatedRawValue } from "@/dexcom/valueparser";

// Nightscout-ish constants
const BG_REF = 140;
const BG_MIN = 36;
const BG_MAX = 400;

// Nightscout AR2 coefficients
const AR = [-0.723, 1.716];

// Nightscout cone step scales (13 steps)
const DEFAULT_CONE_STEPS = [
  0.020, 0.041, 0.061, 0.081, 0.099, 0.116, 0.132,
  0.146, 0.159, 0.171, 0.182, 0.192, 0.201
];

function clamp(x, lo, hi) {
  return Math.max(lo, Math.min(hi, x));
}

function mgdlFromLog(logVal) {
  const mgdl = Math.round(BG_REF * Math.exp(logVal));
  return clamp(mgdl, BG_MIN, BG_MAX);
}

/**
 * AR2 midline forecast (no cone)
 * @param {number[]} series oldest -> newest (mg/dL)
 * @param {number} steps number of future points
 * @returns {number[]} midline forecast mg/dL
 */
export function forecastAR2(series, steps = 4) {
  if (!Array.isArray(series) || series.length < 2) return [];
  const yPrev = series[series.length - 2];
  const yCurr = series[series.length - 1];
  if (!(yPrev > 0) || !(yCurr > 0)) return [];

  let prev = Math.log(yPrev / BG_REF);
  let curr = Math.log(yCurr / BG_REF);

  const out = [];
  for (let i = 0; i < steps; i++) {
    const next = AR[0] * prev + AR[1] * curr;
    prev = curr;
    curr = next;
    out.push(getTranslatedRawValue(mgdlFromLog(curr)));
  }
  return out;
}

/**
 * AR2 forecast cone (widening bounds like Nightscout)
 *
 * @param {number[]} series oldest -> newest (mg/dL)
 * @param {number} steps number of future points (default: 13 like Nightscout cone array)
 * @param {object} options
 * @param {number} [options.coneFactor=2] how wide the cone is (Nightscout default behavior)
 * @param {number[]} [options.coneSteps=DEFAULT_CONE_STEPS] the widening schedule
 * @returns {Array<{k:number, mid:number, low:number, high:number}>}
 */
export function forecastAR2Cone(series, steps = DEFAULT_CONE_STEPS.length, options = {}) {
  const coneFactor = Number.isFinite(options.coneFactor) ? options.coneFactor : 2;
  const coneSteps = Array.isArray(options.coneSteps) ? options.coneSteps : DEFAULT_CONE_STEPS;

  if (!Array.isArray(series) || series.length < 2) return [];
  const yPrev = series[series.length - 2];
  const yCurr = series[series.length - 1];
  if (!(yPrev > 0) || !(yCurr > 0)) return [];

  let prev = Math.log(yPrev / BG_REF);
  let curr = Math.log(yCurr / BG_REF);

  const out = [];
  const n = Math.min(steps, coneSteps.length);

  for (let k = 0; k < n; k++) {
    // increment AR2 state (Nightscout incrementAR2)
    const next = AR[0] * prev + AR[1] * curr;
    prev = curr;
    curr = next;

    // widening amount for this horizon
    const stepScale = coneSteps[k];
    const widen = coneFactor * stepScale;

    const mid = getTranslatedRawValue(mgdlFromLog(curr));
    const low = getTranslatedRawValue(mgdlFromLog(curr - widen));
    const high = getTranslatedRawValue(mgdlFromLog(curr + widen));

    out.push({ k: k + 1, mid, low, high });
  }

  return out;
}
