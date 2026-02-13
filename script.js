const API_KEY = "3594d5052720afa49440b3d17c10ce28";

// DOM Elements
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
const closeModal = document.getElementById("closeModal");
const modalError = document.getElementById("modalError");

let is24Hour = localStorage.getItem("24hour") === "true";
formatToggle.innerText = is24Hour ? "24H" : "12H";

/* ==========================================
   1. CLOCK LOGIC
========================================== */
function updateClock() {
  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  dayEl.innerText = days[now.getDay()];
  dateEl.innerText = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  
  // Format the time
  let timeString = now.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit', 
    hour12: !is24Hour 
  });

  // Strip AM/PM for a cleaner look
  if (!is24Hour) {
    timeString = timeString.replace(/\s?[APap][mM]/g, '').trim();
  }
  
  // Split the time and insert blinking colons
  const parts = timeString.split(':');
  timeEl.innerHTML = parts.join('<span class="blink">:</span>');
}

setInterval(updateClock, 1000);
updateClock();

/* ==========================================
   2. UI CONTROLS & TOGGLES
========================================== */
modeToggle.onclick = () => document.body.classList.toggle("light");

formatToggle.onclick = () => {
  is24Hour = !is24Hour;
  localStorage.setItem("24hour", is24Hour);
  formatToggle.innerText = is24Hour ? "24H" : "12H";
  updateClock(); 
};

fullscreenToggle.onclick = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};

/* ==========================================
   3. WEATHER & AQI LOGIC
========================================== */

// Maps OpenWeather conditions to minimalist FontAwesome icons
function getWeatherIcon(condition) {
  const map = {
    'Clear': '<i class="fa-solid fa-sun"></i>',
    'Clouds': '<i class="fa-solid fa-cloud"></i>',
    'Rain': '<i class="fa-solid fa-cloud-rain"></i>',
    'Drizzle': '<i class="fa-solid fa-cloud-rain"></i>',
    'Thunderstorm': '<i class="fa-solid fa-cloud-bolt"></i>',
    'Snow': '<i class="fa-solid fa-snowflake"></i>',
    'Mist': '<i class="fa-solid fa-smog"></i>',
    'Smoke': '<i class="fa-solid fa-smog"></i>',
    'Haze': '<i class="fa-solid fa-smog"></i>',
    'Dust': '<i class="fa-solid fa-smog"></i>',
    'Fog': '<i class="fa-solid fa-smog"></i>',
  };
  return map[condition] || '<i class="fa-solid fa-cloud"></i>';
}

// Converts raw PM2.5 to US EPA Standard AQI (0-500) and assigns a color code
function calculateStandardAQI(pm25) {
  let aqi, label, color;
  
  if (pm25 <= 12.0) { aqi = Math.round((50 / 12.0) * pm25); label = "Good"; color = "#00e400"; }
  else if (pm25 <= 35.4) { aqi = Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51); label = "Moderate"; color = "#ffff00"; }
  else if (pm25 <= 55.4) { aqi = Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101); label = "Sensitive"; color = "#ff7e00"; }
  else if (pm25 <= 150.4) { aqi = Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151); label = "Unhealthy"; color = "#ff0000"; }
  else if (pm25 <= 250.4) { aqi = Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201); label = "Very Unhealthy"; color = "#8f3f97"; }
  else { aqi = Math.round(((500 - 301) / (500.4 - 250.5)) * (pm25 - 250.5) + 301); label = "Hazardous"; color = "#7e0023"; }
  
  return { aqi: Math.min(aqi, 500), label, color };
}

async function fetchWeatherAndAQI(lat, lon, cityName = null, country = null) {
  if (!navigator.onLine) return; 
  
  try {
    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    const weatherData = await weatherRes.json();
    
    const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
    const aqiData = await aqiRes.json();
    
    const pm25 = aqiData.list[0].components.pm2_5;
    const standardAqi = calculateStandardAQI(pm25);

    const finalCity = cityName || weatherData.name;
    const finalCountry = country || weatherData.sys.country;

    // Save location locally
    localStorage.setItem("savedLat", lat);
    localStorage.setItem("savedLon", lon);
    localStorage.setItem("savedCity", finalCity);
    localStorage.setItem("savedCountry", finalCountry);

    // Update UI elements with icons and colors
    locationEl.innerHTML = `<i class="fa-solid fa-location-dot" style="font-size: 0.8em;"></i> ${finalCity}, ${finalCountry}`;
    tempEl.innerText = Math.round(weatherData.main.temp) + "°C";
    conditionEl.innerHTML = `${getWeatherIcon(weatherData.weather[0].main)} ${weatherData.weather[0].main}`;
    windEl.innerText = "Wind " + Math.round(weatherData.wind.speed * 3.6) + " km/h"; 
    
    aqiEl.innerHTML = `<span class="aqi-dot" style="background-color: ${standardAqi.color}; box-shadow: 0 0 8px ${standardAqi.color};"></span> AQI ${standardAqi.aqi} (${standardAqi.label})`;
    
  } catch (err) {
    console.error("Error fetching weather data", err);
    locationEl.innerText = "Weather unavailable (Click to retry)";
  }
}

/* ==========================================
   4. LOCATION, STORAGE & NETWORK HANDLING
========================================== */
function handleOfflineState() {
  if (!navigator.onLine) {
    locationEl.innerHTML = '<i class="fa-solid fa-wifi" style="text-decoration: line-through;"></i> Offline - Time is Current';
    tempEl.innerText = "";
    conditionEl.innerText = "";
    windEl.innerText = "";
    aqiEl.innerText = "";
    modal.classList.add("hidden"); 
    locationEl.style.cursor = "default";
  } else {
    locationEl.style.cursor = "pointer";
    initLocation();
  }
}

window.addEventListener('offline', handleOfflineState);
window.addEventListener('online', handleOfflineState);

// Click Location to Edit
locationEl.addEventListener("click", () => {
  if (navigator.onLine) {
    modal.classList.remove("hidden");
    closeModal.classList.remove("hidden"); // Show cancel button when editing
    setTimeout(() => cityInput.focus(), 100); 
  }
});

// Close Modal manually
closeModal.onclick = () => {
  modal.classList.add("hidden");
  modalError.classList.add("hidden");
}

function initLocation() {
  if (!navigator.onLine) {
    handleOfflineState();
    return;
  }

  // 1. Check Local Storage First
  const savedLat = localStorage.getItem("savedLat");
  const savedLon = localStorage.getItem("savedLon");
  const savedCity = localStorage.getItem("savedCity");
  const savedCountry = localStorage.getItem("savedCountry");

  if (savedLat && savedLon) {
    locationEl.innerHTML = `<i class="fa-solid fa-location-dot" style="font-size: 0.8em;"></i> ${savedCity}, ${savedCountry}`; 
    fetchWeatherAndAQI(savedLat, savedLon, savedCity, savedCountry); 
  } 
  // 2. If no storage, try Geolocation
  else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeatherAndAQI(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        modal.classList.remove("hidden");
        locationEl.innerText = "Location required";
      }
    );
  } 
  // 3. Fallback
  else {
    modal.classList.remove("hidden");
  }
}

// Manual Modal Search
submitCity.onclick = async () => {
  if (!navigator.onLine) return; 
  
  const query = cityInput.value.trim();
  if (!query) return;
  
  try {
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${API_KEY}`);
    const data = await res.json();
    
    if (data.length === 0) throw new Error("City not found");
    
    const { lat, lon, name, country } = data[0];
    
    modalError.classList.add("hidden");
    modal.classList.add("hidden");
    cityInput.value = ""; 
    
    locationEl.innerText = "Updating...";
    fetchWeatherAndAQI(lat, lon, name, country);
    
  } catch (err) {
    modalError.classList.remove("hidden");
  }
};

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") submitCity.click();
});

// Boot the app
initLocation(); 

/* ==========================================
   5. MISC
========================================== */
document.getElementById("year").innerText = new Date().getFullYear();

// Request Wake Lock to keep screen alive
if ("wakeLock" in navigator) {
  navigator.wakeLock.request("screen").catch(() => console.log("Wake Lock failed"));
}
