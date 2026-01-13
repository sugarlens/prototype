const Client = (function () {
	class Client {

		login() {
			return Promise.resolve("hello world");
		}

		async fetchReadings() {
			return [
				{ "time": new Date("2026-01-12 14:00"), "value": 1.9, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 14:05"), "value": 1.8, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 14:10"), "value": 2.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 14:15"), "value": 2.8, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 14:20"), "value": 3, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 14:25"), "value": 3.2, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 14:30"), "value": 3.4, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 14:35"), "value": 3.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 14:40"), "value": 4.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 14:45"), "value": 5.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 14:50"), "value": 6.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 14:55"), "value": 7.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 15:00"), "value": 8.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 15:05"), "value": 9.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 15:10"), "value": 10.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 15:15"), "value": 11.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 15:20"), "value": 12.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 15:25"), "value": 13.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 15:30"), "value": 14.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 15:35"), "value": 15.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 15:40"), "value": 16.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 15:45"), "value": 17.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 15:50"), "value": 18.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 15:55"), "value": 19.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 16:00"), "value": 18, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 16:05"), "value": 17, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 16:10"), "value": 16, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 16:15"), "value": 15, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 16:20"), "value": 14, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" } },
				{ "time": new Date("2026-01-12 16:25"), "value": 12, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
				{ "time": new Date("2026-01-12 16:30"), "value": 10, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
				{ "time": new Date("2026-01-12 16:35"), "value": 8, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
				{ "time": new Date("2026-01-12 16:40"), "value": 6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
				{ "time": new Date("2026-01-12 16:45"), "value": 4, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
			].reverse();
		}
	}

	return Client
})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
	module.exports = Client
}