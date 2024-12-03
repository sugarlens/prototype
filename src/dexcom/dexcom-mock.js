const Client = (function () {
	class Client {

		login() {
			return null;
		}

		async fetchReadings() {
			return [
				{ "time": "2024-11-28 14:00", "mmol": 1.9, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 14:05", "mmol": 1.8, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 14:10", "mmol": 2.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 14:15", "mmol": 2.8, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 14:20", "mmol": 3, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 14:25", "mmol": 3.2, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 14:30", "mmol": 3.4, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 14:35", "mmol": 3.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 14:40", "mmol": 4.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 14:45", "mmol": 5.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 14:50", "mmol": 6.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 14:55", "mmol": 7.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 15:00", "mmol": 8.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 15:05", "mmol": 9.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 15:10", "mmol": 10.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 15:15", "mmol": 11.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 15:20", "mmol": 12.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 15:25", "mmol": 13.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 15:30", "mmol": 14.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 15:35", "mmol": 15.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 15:40", "mmol": 16.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 15:45", "mmol": 17.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 15:50", "mmol": 18.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 15:55", "mmol": 19.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 16:00", "mmol": 18, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 16:05", "mmol": 17, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 16:10", "mmol": 16, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 16:15", "mmol": 15, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": "2024-11-28 16:20", "mmol": 14, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				// {"time": "2024-11-28 16:25", "mmol":13, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
				// {"time": "2024-11-28 16:30", "mmol":12, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
				// {"time": "2024-11-28 16:35", "mmol":11, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
				// {"time": "2024-11-28 16:40", "mmol":10, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
				// {"time": "2024-11-28 16:45", "mmol":9.2, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
			].reverse();
		}
	}

	return Client
})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	module.exports = Client
}