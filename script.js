const API_KEY = "3594d5052720afa49440b3d17c10ce28";

// Elements
const timeEl = document.getElementById("time");
const dayEl = document.getElementById("day");
const dateEl = document.getElementById("date");
const dayProgressFill = document.getElementById("day-progress-fill");
const yearGrid = document.getElementById("year-grid");
const batteryEl = document.getElementById("battery-status");

const locationEl = document.getElementById("location");
const tempEl = document.getElementById("temp");
const conditionEl = document.getElementById("condition");
const humidityEl = document.getElementById("humidity");
const sunTimeEl = document.getElementById("sun-time");
const windEl = document.getElementById("wind");
const aqiEl = document.getElementById("aqi");

// Location Modal Elements
const locModal = document.getElementById("locationModal");
const cityInput = document.getElementById("cityInput");
const submitCity = document.getElementById("submitCity");
const closeModal = document.getElementById("closeModal");
const modalError = document.getElementById("modalError");

// Timezone Modal Elements
const tzModal = document.getElementById("tzModal");
const tzSelect = document.getElementById("tzSelect");
const submitTz = document.getElementById("submitTz");
const closeTzModal = document.getElementById("closeTzModal");
let currentEditingTzIndex = 0;

// Toggles
const modeToggle = document.getElementById("modeToggle");
const formatToggle = document.getElementById("formatToggle");
const fullscreenToggle = document.getElementById("fullscreenToggle");

let is24Hour = localStorage.getItem("24hour") === "true";
formatToggle.innerText = is24Hour ? "24H" : "12H";

/* ==========================================
   1. WORLD CLOCKS (Configurable)
========================================== */
// Standard list of useful global timezones
const availableTimezones = [
  { val: "America/New_York", label: "New York (NY)" },
  { val: "America/Los_Angeles", label: "Los Angeles (LA)" },
  { val: "America/Chicago", label: "Chicago (CHI)" },
  { val: "Europe/London", label: "London (LDN)" },
  { val: "Europe/Paris", label: "Paris (PAR)" },
  { val: "Europe/Berlin", label: "Berlin (BER)" },
  { val: "Asia/Tokyo", label: "Tokyo (TOK)" },
  { val: "Asia/Dubai", label: "Dubai (DXB)" },
  { val: "Asia/Singapore", label: "Singapore (SGP)" },
  { val: "Asia/Kolkata", label: "India (DEL)" },
  { val: "Australia/Sydney", label: "Sydney (SYD)" }
];

// Load saved timezones OR use defaults (NY, London, Tokyo)
let worldTimezones = JSON.parse(localStorage.getItem("worldTimezones")) || [
  "America/New_York", "Europe/London", "Asia/Tokyo"
];

// Populate the <select> dropdown in the modal
availableTimezones.forEach(tz => {
  const option = document.createElement("option");
  option.value = tz.val;
  option.text = tz.label;
  tzSelect.appendChild(option);
});

// Helper to get 3-letter abbreviation from string (e.g. "NY" from "New York (NY)")
function getTzLabel(tzString) {
  const found = availableTimezones.find(t => t.val === tzString);
  if (found) {
    const match = found.label.match(/\(([^)]+)\)/); // Extracts text inside parentheses
    return match ? match[1] : tzString.substring(0,3).toUpperCase();
  }
  return "UTC";
}

/* ==========================================
   2. MAIN CLOCK & PROGRESS BARS
========================================== */
function formatClock(now, tz) {
  let timeStr = now.toLocaleTimeString([], { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: !is24Hour });
  if (!is24Hour) timeStr = timeStr.replace(/\s?[APap][mM]/g, '').trim();
  return timeStr;
}

function updateClock() {
  const now = new Date();
  
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  dayEl.innerText = days[now.getDay()];
  dateEl.innerText = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  
  let timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: !is24Hour });
  if (!is24Hour) timeString = timeString.replace(/\s?[APap][mM]/g, '').trim();
  timeEl.innerHTML = timeString.split(':').join('<span class="blink">:</span>');

  // Update Dynamic World Clocks
  for (let i = 0; i < 3; i++) {
    const el = document.getElementById(`wc-${i}`);
    const tz = worldTimezones[i];
    el.innerText = `${getTzLabel(tz)} ${formatClock(now, tz)}`;
  }

  // Day Progress Bar Calculation
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000;
  const progress = ((Date.now() - startOfDay) / (endOfDay - startOfDay)) * 100;
  dayProgressFill.style.width = `${progress}%`;
}

setInterval(updateClock, 1000);
updateClock();

/* ==========================================
   3. EDIT TIMEZONES (MODAL)
========================================== */
for (let i = 0; i < 3; i++) {
  document.getElementById(`wc-${i}`).addEventListener("click", () => {
    currentEditingTzIndex = i;
    tzSelect.value = worldTimezones[i]; // Pre-select current
    tzModal.classList.remove("hidden");
  });
}

closeTzModal.onclick = () => tzModal.classList.add("hidden");

submitTz.onclick = () => {
  worldTimezones[currentEditingTzIndex] = tzSelect.value;
  localStorage.setItem("worldTimezones", JSON.stringify(worldTimezones));
  tzModal.classList.add("hidden");
  updateClock(); // Instantly refresh
};

/* ==========================================
   4. YEAR PROGRESS GRAPH (CUBES)
========================================== */
function renderYearGrid() {
  yearGrid.innerHTML = "";
  const now = new Date();
  const year = now.getFullYear();
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const totalDays = isLeap ? 366 : 365;
  const startOfYear = new Date(year, 0, 1);
  const currentDayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24)) + 1;

  for (let i = 1; i <= totalDays; i++) {
    const cube = document.createElement("div");
    cube.classList.add("cube");
    if (i < currentDayOfYear) cube.classList.add("completed");
    else if (i === currentDayOfYear) cube.classList.add("today");
    yearGrid.appendChild(cube);
  }
}
renderYearGrid();

/* ==========================================
   5. BATTERY STATUS API
========================================== */
async function initBattery() {
  if ('getBattery' in navigator) {
    try {
      const battery = await navigator.getBattery();
      const updateBattery = () => {
        const level = Math.round(battery.level * 100);
        let icon = 'fa-battery-full';
        
        if (battery.charging) icon = 'fa-bolt';
        else if (level <= 20) icon = 'fa-battery-quarter';
        else if (level <= 50) icon = 'fa-battery-half';
        else if (level <= 80) icon = 'fa-battery-three-quarters';
        
        batteryEl.innerHTML = `<i class="fa-solid ${icon}"></i> ${level}%`;
        batteryEl.style.color = level <= 20 && !battery.charging ? '#ff5e5e' : 'var(--subtext-color)';
      };
      updateBattery();
      battery.addEventListener('levelchange', updateBattery);
      battery.addEventListener('chargingchange', updateBattery);
    } catch (e) { batteryEl.style.display = 'none'; }
  } else { batteryEl.style.display = 'none'; }
}
initBattery();

/* ==========================================
   6. WEATHER & LOCATION
========================================== */
function getWeatherIcon(condition) {
  const map = {
    'Clear': '<i class="fa-solid fa-sun"></i>',
    'Clouds': '<i class="fa-solid fa-cloud"></i>',
    'Rain': '<i class="fa-solid fa-cloud-rain"></i>',
    'Snow': '<i class="fa-solid fa-snowflake"></i>',
    'Thunderstorm': '<i class="fa-solid fa-cloud-bolt"></i>',
  };
  return map[condition] || '<i class="fa-solid fa-cloud"></i>';
}

function calculateStandardAQI(pm25) {
  let aqi, label, color;
  if (pm25 <= 12.0) { aqi = Math.round((50 / 12.0) * pm25); label = "Good"; color = "#00e400"; }
  else if (pm25 <= 35.4) { aqi = Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51); label = "Moderate"; color = "#ffff00"; }
  else if (pm25 <= 150.4) { aqi = Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151); label = "Unhealthy"; color = "#ff0000"; }
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

    localStorage.setItem("savedLat", lat);
    localStorage.setItem("savedLon", lon);
    localStorage.setItem("savedCity", finalCity);
    localStorage.setItem("savedCountry", finalCountry);

    locationEl.innerHTML = `<i class="fa-solid fa-location-dot" style="font-size: 0.8em;"></i> ${finalCity}, ${finalCountry}`;
    tempEl.innerText = Math.round(weatherData.main.temp) + "°C";
    conditionEl.innerHTML = `${getWeatherIcon(weatherData.weather[0].main)} ${weatherData.weather[0].main}`;
    humidityEl.innerHTML = `<i class="fa-solid fa-droplet"></i> ${weatherData.main.humidity}%`;
    windEl.innerText = "Wind " + Math.round(weatherData.wind.speed * 3.6) + " km/h"; 
    aqiEl.innerHTML = `<span class="aqi-dot" style="background-color: ${standardAqi.color}; box-shadow: 0 0 8px ${standardAqi.color};"></span> AQI ${standardAqi.aqi}`;
    
    const nowMs = Date.now();
    const sunriseMs = weatherData.sys.sunrise * 1000;
    const sunsetMs = weatherData.sys.sunset * 1000;
    
    if (nowMs > sunriseMs && nowMs < sunsetMs) {
      sunTimeEl.innerHTML = `<i class="fa-solid fa-moon"></i> ${new Date(sunsetMs).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    } else {
      sunTimeEl.innerHTML = `<i class="fa-solid fa-sun"></i> ${new Date(sunriseMs).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    }
  } catch (err) { locationEl.innerText = "Weather unavailable (Click to retry)"; }
}

function handleOfflineState() {
  if (!navigator.onLine) {
    locationEl.innerHTML = '<i class="fa-solid fa-wifi" style="text-decoration: line-through;"></i> Offline';
    tempEl.innerText = ""; conditionEl.innerText = ""; humidityEl.innerText = "";
    windEl.innerText = ""; aqiEl.innerText = ""; sunTimeEl.innerText = "";
    locModal.classList.add("hidden"); 
  } else initLocation();
}

window.addEventListener('offline', handleOfflineState);
window.addEventListener('online', handleOfflineState);

locationEl.addEventListener("click", () => {
  if (navigator.onLine) {
    locModal.classList.remove("hidden");
    closeModal.classList.remove("hidden");
    setTimeout(() => cityInput.focus(), 100); 
  }
});

closeModal.onclick = () => { locModal.classList.add("hidden"); modalError.classList.add("hidden"); }

function initLocation() {
  if (!navigator.onLine) return handleOfflineState();
  const savedLat = localStorage.getItem("savedLat");
  const savedLon = localStorage.getItem("savedLon");
  
  if (savedLat && savedLon) {
    fetchWeatherAndAQI(savedLat, savedLon, localStorage.getItem("savedCity"), localStorage.getItem("savedCountry")); 
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeatherAndAQI(pos.coords.latitude, pos.coords.longitude),
      () => locModal.classList.remove("hidden")
    );
  } else locModal.classList.remove("hidden");
}

submitCity.onclick = async () => {
  if (!navigator.onLine) return; 
  const query = cityInput.value.trim();
  if (!query) return;
  try {
    const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${API_KEY}`);
    const data = await res.json();
    if (data.length === 0) throw new Error("City not found");
    modalError.classList.add("hidden"); locModal.classList.add("hidden"); cityInput.value = ""; 
    locationEl.innerText = "Updating...";
    fetchWeatherAndAQI(data[0].lat, data[0].lon, data[0].name, data[0].country);
  } catch (err) { modalError.classList.remove("hidden"); }
};

cityInput.addEventListener("keypress", (e) => { if (e.key === "Enter") submitCity.click(); });

/* ==========================================
   7. UI TOGGLES & INIT
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

initLocation(); 
document.getElementById("year").innerText = new Date().getFullYear();
if ("wakeLock" in navigator) navigator.wakeLock.request("screen").catch(() => {});
