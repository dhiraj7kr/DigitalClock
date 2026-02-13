const API_KEY = "3594d5052720afa49440b3d17c10ce28";

const timeEl = document.getElementById("time");
const dayEl = document.getElementById("day");
const dateEl = document.getElementById("date");

const locationEl = document.getElementById("location");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const windEl = document.getElementById("wind");
const aqiEl = document.getElementById("aqi");

const modeToggle = document.getElementById("modeToggle");
const formatToggle = document.getElementById("formatToggle");
const fullscreenToggle = document.getElementById("fullscreenToggle");

const modal = document.getElementById("locationModal");
const cityInput = document.getElementById("cityInput");
const submitCity = document.getElementById("submitCity");
const modalError = document.getElementById("modalError");

let is24Hour = localStorage.getItem("24hour") === "true";
formatToggle.innerText = is24Hour ? "24H" : "12H";

/* ==========================================
   CLOCK
========================================== */
function updateClock() {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  dayEl.innerText = days[now.getDay()];
  dateEl.innerText = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  
  // Format the time ensuring seconds and leading zeros are handled properly
  let timeString = now.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: !is24Hour 
  });

  // Remove AM/PM from the string if we are in 12-hour mode
  if (!is24Hour) {
    timeString = timeString.replace(/\s?[APap][mM]/g, '');
  }
  
  timeEl.innerText = timeString;
}

setInterval(updateClock, 1000);
updateClock();

/* ==========================================
   TOGGLES
========================================== */
modeToggle.onclick = () => document.body.classList.toggle("light");

formatToggle.onclick = () => {
  is24Hour = !is24Hour;
  localStorage.setItem("24hour", is24Hour);
  formatToggle.innerText = is24Hour ? "24H" : "12H";
  updateClock(); // Instantly update without waiting 1 second
};

fullscreenToggle.onclick = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};

/* ==========================================
   WEATHER & AQI LOGIC
========================================== */

function calculateStandardAQI(pm25) {
  let aqi, label;
  if (pm25 <= 12.0) { aqi = Math.round((50 / 12.0) * pm25); label = "Good"; }
  else if (pm25 <= 35.4) { aqi = Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51); label = "Moderate"; }
  else if (pm25 <= 55.4) { aqi = Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101); label = "Sensitive"; }
  else if (pm25 <= 150.4) { aqi = Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151); label = "Unhealthy"; }
  else if (pm25 <= 250.4) { aqi = Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201); label = "Very Unhealthy"; }
  else { aqi = Math.round(((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301); label = "Hazardous"; }
  
  return { aqi: Math.min(aqi, 500), label };
}

async function fetchWeatherAndAQI(lat, lon, cityName = null, country = null) {
  try {
    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const weatherData = await weatherRes.json();
    
    const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    const aqiData = await aqiRes.json();
    
    const pm25 = aqiData.list[0].components.pm2_5;
    const standardAqi = calculateStandardAQI(pm25);

    locationEl.innerText = cityName ? `${cityName}, ${country}` : `${weatherData.name}, ${weatherData.sys.country}`;
    tempEl.innerText = Math.round(weatherData.main.temp) + "°C";
    conditionEl.innerText = weatherData.weather[0].main;
    windEl.innerText = "Wind " + Math.round(weatherData.wind.speed * 3.6) + " km/h"; 
    aqiEl.innerText = `AQI ${standardAqi.aqi} (${standardAqi.label})`;
    
  } catch (err) {
    console.error("Error fetching weather data", err);
    locationEl.innerText = "Weather unavailable";
  }
}

/* ==========================================
   LOCATION HANDLING
========================================== */
function requestLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeatherAndAQI(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        modal.classList.remove("hidden");
        locationEl.innerText = "Location required";
      }
    );
  } else {
    modal.classList.remove("hidden");
  }
}

submitCity.onclick = async () => {
  const query = cityInput.value.trim();
  if (!query) return;
  
  try {
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${API_KEY}`);
    const data = await res.json();
    
    if (data.length === 0) throw new Error("City not found");
    
    const { lat, lon, name, country } = data[0];
    
    modalError.classList.add("hidden");
    modal.classList.add("hidden");
    
    fetchWeatherAndAQI(lat, lon, name, country);
    
  } catch (err) {
    modalError.classList.remove("hidden");
  }
};

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") submitCity.click();
});

requestLocation();

/* ==========================================
   MISC
========================================== */
document.getElementById("year").innerText = new Date().getFullYear();

if ("wakeLock" in navigator) {
  navigator.wakeLock.request("screen").catch(() => console.log("Wake Lock failed"));
}
