//date
let apiKey = "2a2eaa51d996796495bf456e5b58adf4";
let url = "https://api.openweathermap.org/data/2.5/";
let today = new Date();
let hour = today.getHours();
let minutes = today.getMinutes();
let days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];
let day = days[today.getDay()];
let date = document.querySelector(".date");

if (hour < 10) {
  hour = `0${hour}`;
}

if (minutes < 10) {
  minutes = `0${minutes}`;
}

//changing the date
date.innerHTML = `${day} ${hour}:${minutes}`;

//current position changing and for chnaging details for city asked for
function apiResponse(response) {
  let bigH2 = document.querySelector(".big-h2");
  let city = document.querySelector(".cityName");
  let comment = document.querySelector(".comment");
  let humid = document.querySelector("#humid");
  let wind = document.querySelector("#wind");
  let image = document.querySelector(".weather-icon");
  //changing the parameters
  bigH2.innerHTML = Math.round(response.data.main.temp);
  city.innerHTML = response.data.name;
  comment.innerHTML = response.data.weather[0].description;
  humid.innerHTML = `Humidty: ${response.data.main.humidity}%`;
  wind.innerHTML = `Windy: ${Math.round(response.data.wind.speed)}km/h`;
  image.src = ` https://openweathermap.org/img/wn/${response.data.weather[0].icon}@2x.png`
}

//default weather to show on start
axios
  .get(`${url}weather?q=kampala&units=metric&appid=${apiKey}`)
  .then(apiResponse);

//using gps
function findPosition() {
  navigator.geolocation.getCurrentPosition(function (position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    axios
      .get(
        `${url}weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
      )
      .then(apiResponse);
  });
}

let currentPosition = document.querySelector(".currentLocation");
currentPosition.addEventListener("click", findPosition);

//search engine
let form = document.querySelector(".submit-form");
function searchEngine(event) {
  event.preventDefault();
  let input = document.querySelector("#search-input");
  axios
    .get(`${url}weather?q=${input.value}&units=metric&appid=${apiKey}`)
    .then(apiResponse);
}

form.addEventListener("submit", searchEngine);

//change to celcius or fanhereit
let fanhereit = document.querySelector(".fanhereit");
let celcius = document.querySelector(".celcius");

celcius.addEventListener("click", function () {
  let deg = document.querySelector(".big-h2");
  let degree = (deg.innerHTML - 32) * (5/9)
  deg.innerHTML = `${Math.round(degree)}`;
  celcius.classList.add("styledeg");
  if (fanhereit.classList.contains("styledeg")) {
    fanhereit.classList.remove("styledeg");
  }
});

fanhereit.addEventListener("click", function () {
  let deg = document.querySelector(".big-h2");
  let degree = deg.innerHTML * (9/5) + 32
  deg.innerHTML = `${Math.round(degree)}`;
  fanhereit.classList.add("styledeg");
  if (celcius.classList.contains("styledeg")) {
    celcius.classList.remove("styledeg");
  }
});
