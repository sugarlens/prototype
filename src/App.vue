<template>
  <v-app dark>
    <v-main>
      <v-container style="height: 100vh">
        <v-card v-if="!isLoggedIn" width="400">
          <v-card-title>Login</v-card-title>
          <v-card-text>
            <v-form ref="loginForm" v-model="valid">
              <v-text-field
                v-model="username"
                label="Username"
                :rules="[rules.required]"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                :rules="[rules.required]"
                type="password"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="handleLogin" :disabled="!valid">
              Login
            </v-btn>
          </v-card-actions>
        </v-card>
        <div v-else class="d-flex flex-column fill-height">
          <v-row>
            <v-col cols="12">
              <MainValue :history="this.history"></MainValue>
            </v-col>
          </v-row>
          <v-row class="fill-height" style="flex-grow: 1;">
            <v-col cols="12" class="d-flex flex-column">
              <BloodGlucoseChart :readings="this.history" style="flex-grow: 1; width:100%;"></BloodGlucoseChart>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import MainValue from './components/MainValue.vue';
import BloodGlucoseChart from './components/BloodGlucoseChart.vue';

const Client = require('./dexcom.js');

export default {
  components: {
    MainValue,
    BloodGlucoseChart,
  },
  data() {
    return {
      username: '',
      password: '',
      valid: false,
      isLoggedIn: false,
      dexcomClient: null,
      history: [
        {"time": "2024-11-26 14:00", "mmol":2.2, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 14:05", "mmol":2.4, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 14:10", "mmol":2.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 14:15", "mmol":2.8, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 14:20", "mmol":3, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 14:25", "mmol":3.2, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 14:30", "mmol":3.4, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 14:35", "mmol":3.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 14:40", "mmol":4.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 14:45", "mmol":5.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 14:50", "mmol":6.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 14:55", "mmol":7.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 15:00", "mmol":8.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 15:05", "mmol":9.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 15:10", "mmol":10.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 15:15", "mmol":11.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        // {"time": "2024-11-26 15:20", "mmol":12.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        // {"time": "2024-11-26 15:25", "mmol":13.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        // {"time": "2024-11-26 15:30", "mmol":14.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        // {"time": "2024-11-26 15:35", "mmol":15.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        // {"time": "2024-11-26 15:40", "mmol":16.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        // {"time": "2024-11-26 15:45", "mmol":17.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        // {"time": "2024-11-26 15:50", "mmol":18.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        // {"time": "2024-11-26 15:55", "mmol":19.6, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        // {"time": "2024-11-26 16:00", "mmol":18, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        // {"time": "2024-11-26 16:05", "mmol":17, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 16:10", "mmol":16, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 16:15", "mmol":15, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 16:20", "mmol":14, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 16:25", "mmol":13, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 16:30", "mmol":12, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 16:35", "mmol":11, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 16:40", "mmol":10, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 16:45", "mmol":9.2, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 16:50", "mmol":9.1, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
        {"time": "2024-11-26 16:55", "mmol":8.7, "trend": { "name": "Flat", "desc": "steady", "arrow": "→" }},
      ],
      rules: {
        required: value => !!value || 'This field is required',
      },
      fetchInterval: null, // Store the interval ID for future cleanup
    };
  },
  created() {
    this.dexcomClient = new Client(true);
    // Check for existing credentials in localStorage
    const storedCredentials = localStorage.getItem('userCredentials');
    if (storedCredentials) {
      const credentials = JSON.parse(atob(storedCredentials));
      this.username = credentials.username;
      this.password = credentials.password;
      this.login();
    }
  },
  methods: {
    handleLogin() {
      const credentials = btoa(JSON.stringify({ username: this.username, password: this.password }));
      localStorage.setItem('userCredentials', credentials);
      this.login();
    },
    async login() {
      await this.dexcomClient.login(this.username, this.password);
      this.isLoggedIn = true;
      this.startDataFetching();
    },
    logout() {
      this.isLoggedIn = false;
      localStorage.removeItem('userCredentials');
      this.username = '';
      this.password = '';
    },
    startDataFetching() {
      // Fetch data immediately on login
      this.fetchData();

      // Set an interval to fetch data every minute (60,000 milliseconds)
      this.fetchInterval = setInterval(() => {
        this.fetchData();
      }, 2*60000);
    },
    fetchData() {
      console.log(" - Fetching new data...");
      this.dexcomClient.fetchReadings(180, 36).then(
        (data) => {
          this.history = data.reverse();
        }
      );
    },
  },
};
</script>

<style>
body {
  margin: 0;
  font-family: Roboto, sans-serif;
}


</style>
