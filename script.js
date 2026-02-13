const API_KEY = "3594d5052720afa49440b3d17c10ce28";

/* ELEMENTS */

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

/* SETTINGS */

let is24Hour = localStorage.getItem("24hour") === "true";

/* APPLY SAVED SETTINGS */

formatToggle.innerText = is24Hour ? "24H" : "12H";

if(localStorage.getItem("theme")==="light")
document.body.classList.add("light");

/* CLOCK */

function updateClock(){

const now = new Date();

const days = [
"Sunday","Monday","Tuesday","Wednesday",
"Thursday","Friday","Saturday"
];

dayEl.innerText = days[now.getDay()];

dateEl.innerText =
now.toLocaleDateString("en-GB",{
day:"numeric",
month:"long",
year:"numeric"
});

timeEl.innerText =
now.toLocaleTimeString([],{
hour12:!is24Hour
});

}

setInterval(updateClock,1000);

updateClock();

/* THEME */

modeToggle.onclick=()=>{

document.body.classList.toggle("light");

localStorage.setItem(
"theme",
document.body.classList.contains("light")
?"light":"dark"
);

};

/* FORMAT */

formatToggle.onclick=()=>{

is24Hour=!is24Hour;

localStorage.setItem("24hour",is24Hour);

formatToggle.innerText=is24Hour?"24H":"12H";

};

/* FULLSCREEN */

fullscreenToggle.onclick=()=>{

if(!document.fullscreenElement)
document.documentElement.requestFullscreen();
else
document.exitFullscreen();

};

/* WEATHER */

navigator.geolocation.getCurrentPosition(async pos=>{

const lat=pos.coords.latitude;
const lon=pos.coords.longitude;

/* WEATHER */

const res=await fetch(
`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
);

const data=await res.json();

locationEl.innerText=
`${data.name}, ${data.sys.country}`;

tempEl.innerText=
`${data.main.temp} °C`;

conditionEl.innerText=
data.weather[0].main;

windEl.innerText=
`${data.wind.speed} km/h`;

/* AQI */

const aqiRes=await fetch(
`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
);

const aqiData=await aqiRes.json();

const aqi=aqiData.list[0].main.aqi;

const quality=[
"Good",
"Fair",
"Moderate",
"Poor",
"Very Poor"
];

aqiEl.innerText=
`${aqi} (${quality[aqi-1]})`;

});

/* FOOTER YEAR */

document.getElementById("year").innerText=
new Date().getFullYear();

/* PREVENT SCREEN SLEEP */

if("wakeLock" in navigator){

navigator.wakeLock.request("screen");

}
