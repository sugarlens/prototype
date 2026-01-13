var european_units = getUnitType();

export const IN_RANGE_MIN = european_units ? 4 : 70;
export const IN_RANGE_MAX = european_units ? 10 : 180;
export const IN_TIGHT_RANGE_MIN = european_units ? 3.8 : 70;
export const IN_TIGHT_RANGE_MAX = european_units ? 7.8 : 140;
export const CHART_MIN = european_units ? 2 : 40;
export const CHART_MAX = european_units ? 20 : 400;

export const UNITS_LABEL = european_units ? "mmol/L" : "mg/dL";

export function getTranslatedValue(reading) {
	if (european_units) {
		return Math.round(reading.Value * 0.0555 * 10) / 10;
	} else {
		return reading.Value;
	}
}

function getUnitType() {
	const storedCredentials = localStorage.getItem('userCredentials');
	if (storedCredentials) {
		return JSON.parse(atob(storedCredentials)).mmolL_units == true;
	}
	return true;
}