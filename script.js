const API_KEY = "YOUR_API_KEY";

const body = document.body;

const modeToggle = document.getElementById("modeToggle");

const fullscreenBtn = document.getElementById("fullscreenToggle");

const formatToggle = document.getElementById("formatToggle");

let is24Hour = true;

/* Dark / Light Mode */

modeToggle.onclick = () => {

body.classList.toggle("dark-mode");

body.classList.toggle("light-mode");

modeToggle.classList.toggle("fa-sun");

modeToggle.classList.toggle("fa-moon");

};

/* Fullscreen */

fullscreenBtn.onclick = () => {

if(!document.fullscreenElement){

document.documentElement.requestFullscreen();

}else{

document.exitFullscreen();

}

};

/* 12 / 24 Hour Toggle */

formatToggle.onclick = () => {

is24Hour = !is24Hour;

formatToggle.innerText = is24Hour ? "24H":"12H";

};

/* Clock */

function updateClock(){

const now = new Date();

const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

document.getElementById("day").innerText = days[now.getDay()];

document.getElementById("date").innerText = now.toLocaleDateString("en-GB");

document.getElementById("time").innerText = now.toLocaleTimeString([],{

hour12:!is24Hour

});

}

setInterval(updateClock,1000);

updateClock();

/* Weather */

navigator.geolocation.getCurrentPosition(async position => {

const lat = position.coords.latitude;

const lon = position.coords.longitude;

const weatherRes = await fetch(

`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`

);

const weather = await weatherRes.json();

document.getElementById("location").innerText =

weather.name + ", " + weather.sys.country;

document.getElementById("temp").innerText =

"🌡 " + weather.main.temp + "°C";

document.getElementById("condition").innerText =

"☁ " + weather.weather[0].main;

document.getElementById("wind").innerText =

"💨 Wind " + weather.wind.speed + " km/h";

/* AQI */

const aqiRes = await fetch(

`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`

);

const aqiData = await aqiRes.json();

const aqi = aqiData.list[0].main.aqi;

const quality = ["Good","Fair","Moderate","Poor","Very Poor"];

document.getElementById("aqi").innerText =

"AQI " + aqi + " (" + quality[aqi-1] + ")";

});

/* Footer Year */

document.getElementById("year").innerText = new Date().getFullYear();

/* Wake Lock */

if("wakeLock" in navigator){

let wakeLock;

navigator.wakeLock.request("screen").then(lock=>{

wakeLock = lock;

});

}

/* PWA Service Worker */

if("serviceWorker" in navigator){

navigator.serviceWorker.register("service-worker.js");

}
