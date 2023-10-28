const root = document.body;

/*search for mobiles */
let searchView = document.querySelector("[data-search-view]");
let searchToggle = document.querySelectorAll("[data-search-toggler]");

function moreEvents(array, eventType, functionCall) {
  for (const e of array) e.addEventListener(eventType, functionCall);
}
console.log(searchToggle);
function activate() {
  searchView.classList.toggle("active");
}

moreEvents(searchToggle, "click", activate);

/* fetching data from server*/
const apiKey = "96771e971243152d6b8948878c26adde";
function apiFetchData(url, urlFunction) {
  axios.get(`${url}&appid=${apiKey}`).then(urlFunction);
}

let urls = {
  currentWeather(latitude, longitude) {
    return `https://api.openweathermap.org/data/2.5/weather?${latitude}&${longitude}&units=metric`;
  },

  fiveDayForecast(latitude, longitude) {
    return `https://api.openweathermap.org/data/2.5/forecast?${latitude}&${longitude}&units=metric`;
  },

  airQuality(latitude, longitude) {
    return `https://api.openweathermap.org/data/2.5/air_pollution?${latitude}&${longitude}`;
  },

  changeGeoToCity(latitude, longitude) {
    return `https://api.openweathermap.org/geo/1.0/reverse?${latitude}&${longitude}&limit=5`;
  },

  changeCityToGeo(cityName) {
    return `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5`;
  },
};

/**
 *  creating  date and tie in utc format. ie converting the time depending on the api result
 *  date: Thursday, 16 Feb
 * date and timezone in seconds
 */
let days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
let months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function convertDate(date, timeZone) {
  let newDate = new Date((date + timeZone) * 1000);
  let weekDay = days[newDate.getUTCDay()];
  let month = months[newDate.getUTCMonth()];
  return `${weekDay} ${newDate.getUTCDate()}, ${month}`;
}

/* to time */
function convertTime(time, timeZone) {
  let newDate = new Date((time + timeZone) * 1000);
  let hours = newDate.getUTCHours();
  let minutes = newDate.getUTCMinutes();
  let period = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${minutes} ${period}`;
}

function hrs(time, timeZone) {
  let newDate = new Date((time + timeZone) * 1000);
  let hours = newDate.getUTCHours();
  let period = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12} ${period}`;
}

/* convert to km per hour */
function convertToKmPerHr(speed) {
  speed = (speed * 3600) / 1000;
  return speed;
}

/* air quality message */
let qualityAir = {
  1: {
    level: "Good",
    message: "Air quality considered satisfactory",
  },
  2: {
    level: "Fair",
    message: "Air quality is acceptable",
  },
  3: {
    level: "Moderate",
    message:
      "Members of sensitive groups are likely to face health effects but general public may not",
  },
  4: {
    level: "Poor",
    message: "Everyone may face health effects especially sensitive gropus",
  },
  5: {
    level: "Very Poor",
    message: "Entire population is likely to be affected",
  },
};

/* creating a search engine */

function timeOut() {
  let searchField = document.querySelector("[data-search-field]");
  let searchResult = document.querySelector("[data-search-result]");

  apiFetchData(urls.changeCityToGeo(searchField.value), function (locations) {
    searchField.classList.remove("searching");
    searchResult.classList.add("active");
    searchResult.innerHTML = `
    <ul class="view-list" data-search-list></ul>`;

    let searchItems = [];
    locations.data.forEach(function (location) {
      let items = document.createElement("li");
      items.classList.add("view-item");
      items.innerHTML = `
      <span class="material-symbols-outlined">location_on</span>
      <div>
        <p class="item-title">${location.name}</p>
        <p class="label-2 item-subtitle">${location.state || ""} ${
        location.country
      }</p>
      </div>
      <a href="#/weather?lat=${location.lat}&lon=${
        location.lon
      }" class="item-link has-state" aria-label="${
        location.name
      } weather" data-search-toggler></a>
      `;
      searchResult.querySelector("[data-search-list]").appendChild(items);
      searchItems.push(items.querySelector("[data-search-toggler]"));
    });
    moreEvents(searchItems, "click", function () {
      activate();
      searchResult.classList.remove("active");
    });
  });
}

/* integrating search engine into search-field*/
let searchField = document.querySelector("[data-search-field]");
let searchResult = document.querySelector("[data-search-result]");

let searchTime = null;
let searchDuration = 500;

searchField.addEventListener("input", function () {
  searchTime ?? clearTimeout(searchTime); /* clears time if has been set */
  if (!searchField.value) {
    searchResult.classList.remove("active");
    searchResult.innerHTML = "";
    searchField.classList.remove("searching");
  } else {
    searchField.classList.add("searching");
  }

  if (searchField.value) {
    searchTime = setTimeout(timeOut, searchDuration);
  }
});

/*dynamic weather
does the manipulation of data calling the urls
*/
let defaultLocation = "#/weather?lat=0.3163&lon=32.5822";

function currentLocation() {
  /*gets current loction if user allows else we use the default location*/
  navigator.geolocation.getCurrentPosition(
    function (position) {
      let { latitude, longitude } = position.coords;
      updateWeatherParts(`lat=${latitude}`, `lon=${longitude}`);
    },
    function () {
      window.location.hash = defaultLocation;
    }
  );
}

function searchedLocation(query) {
  updateWeatherParts(...query.split("&"));
  /* "..." spreads the elements of array as separate entities
    eg. lat=1222, lon=1222
  */
}

let newUrl = new Map([
  ["/current-location", currentLocation],
  ["/weather", searchedLocation],
]);

function hasHashCheck() {
  let getUrl = window.location.hash.slice(1);
  /**
   * split url at ? and store in an array
   * url : /weather
   * query lat=2333&lon=12344
   */
  let [url, query] = getUrl.includes ? getUrl.split("?") : [getUrl];
  /*  check if function exists and if so we execute else we call an error*/
  if (newUrl.has(url)) {
    newUrl.get(url)(query);
  } else {
    error404();
  }
}

window.addEventListener("hashchange", hasHashCheck);

window.addEventListener("load", function () {
  if (!window.location.hash) {
    this.window.location.hash = defaultLocation;
  } else {
    hasHashCheck();
  }
});

/*changing entire html page*/
let container = document.querySelector("[data-container]");
let loadData = document.querySelector("[data-loading]");
let currentPos = document.querySelector("[data-current-location-btn]");
let errors = document.querySelector("[data-error-content]");
let obj = {};

function updateWeatherParts(lat, lon) {
  loadData.style.display = "grid";
  container.style.overflowY = "hidden";
  container.classList.remove("fade-in");
  errors.style.display = "none";

  let currentweather = document.querySelector("[data-current-weather]");
  currentweather.innerHTML = "";

  if (window.location.hash === "#/current-location") {
    currentPos.setAttribute("disabled", "");
  } else {
    currentPos.removeAttribute("disabled");
  }

  /* current weather*/
  apiFetchData(
    urls.currentWeather(lat, lon),
    function changeCurrentWeather(current) {
      let card = document.createElement("div");
      card.classList.add("card", "card-lg", "current-weather-card");
      card.innerHTML = `
    <h2 class="title-2">Now</h2>
    <div class="weapper">
      <p class="heading celcius" celcius onclick="conversion()" title="click to change from celcius to fanhereit and vice versa">${Math.round(
        current.data.main.temp
      )}°c</p>
      <img
        src="src/images/weather/day/${current.data.weather[0].icon}.png"
        width="64"
        height="64"
        alt="${current.data.weather[0].icon}"
        class="weather-icon"
      />
    </div>
    <p class="body-3">${current.data.weather[0].description}</p>
    <ul class="meta-list">
      <li class="meta-item">
        <span class="material-symbols-outlined">calendar_today</span>
        <p class="title-3 meta-text">${convertDate(
          current.data.dt,
          current.data.timezone
        )}</p>
      </li>
      <li class="meta-item">
        <span class="material-symbols-outlined">location_on</span>
        <p class="title-3 meta-text">${current.data.name}, ${
        current.data.sys.country
      }</p>
      </li>
    </ul> `;

      currentweather.appendChild(card);
      /* retrieve highlight*/
      obj = {
        humidity: current.data.main.humidity,
        visibility: current.data.visibility / 1000,
        pressure: current.data.main.pressure,
        feelsLike: current.data.main.feels_like,
        sunrise: current.data.sys.sunrise,
        sunset: current.data.sys.sunset,
        timezone: current.data.timezone,
      };

      /* airquality and highlights*/
      apiFetchData(urls.airQuality(lat, lon), changeAirPollution);

      /* hourly forecasts and five day forecast*/
      apiFetchData(urls.fiveDayForecast(lat, lon), changeForecast);
      changetheme();
    }
  );
}

function changeAirPollution(airQuality) {
  let hightlights = document.querySelector("[data-highlights]");
  hightlights.innerHTML = "";
  let card = document.createElement("div");
  card.classList.add("card", "card-lg");
  card.innerHTML = `
  <h2 class="title-2" id="highlights-label">Today Highlights</h2>
  <div class="highlight-list">
    <div class="card card-sm highlight-card one">
      <h3 class="title-3">Air Quality Index</h3>
      <div class="wrapper">
        <span class="material-symbols-outlined">air</span>
        <ul class="card-list">
          <li class="card-item">
            <p class="title-1">${airQuality.data.list[0].components.pm2_5.toFixed(
              1
            )}</p>
            <p class="label-1">PM<sub>2.5</sub></p>
          </li>

          <li class="card-item">
            <p class="title-1">${airQuality.data.list[0].components.so2.toFixed(
              1
            )}</p>
            <p class="label-1">SO<sub>2</sub></p>
          </li>

          <li class="card-item">
            <p class="title-1">${airQuality.data.list[0].components.no2.toFixed(
              1
            )}</p>
            <p class="label-1">NO<sub>2</sub></p>
          </li>

          <li class="card-item">
            <p class="title-1">${airQuality.data.list[0].components.o3.toFixed(
              1
            )}</p>
            <p class="label-1">O<sub>3</sub></p>
          </li>
        </ul>
      </div>
      <span class="badge aqi-${airQuality.data.list[0].main.aqi} label-${
    airQuality.data.list[0].main.aqi
  }" title="${qualityAir[airQuality.data.list[0].main.aqi].message}">
  ${qualityAir[airQuality.data.list[0].main.aqi].level}
      </span>
    </div>
    <div class="card card-sm highlight-card two">
      <h3 class="title-3">Sunrise & Sunset</h3>
      <div class="card-list">
        <div class="card-item">
          <span class="material-symbols-outlined">clear_day</span>
          <div>
            <p class="label-1">Sunrise</p>
            <p class="title-1">${convertTime(obj.sunrise, obj.timezone)}</p>
          </div>
        </div>

        <div class="card-item">
          <span class="material-symbols-outlined">clear_night</span>
          <div>
            <p class="label-1">Sunset</p>
            <p class="title-1">${convertTime(obj.sunset, obj.timezone)}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="card card-sm highlight-card">
      <h3 class="title-3">Humidity</h3>
      <div class="wrapper">
        <span class="material-symbols-outlined"
          >humidity_percentage</span
        >
        <p class="title-1">${obj.humidity}<sub>%</sub></p>
      </div>
    </div>

    <div class="card card-sm highlight-card">
      <h3 class="title-3">Pressure</h3>
      <div class="wrapper">
        <span class="material-symbols-outlined">airwave</span>
        <p class="title-1">${obj.pressure}<sub>hPa</sub></p>
      </div>
    </div>

    <div class="card card-sm highlight-card">
      <h3 class="title-3">Visibility</h3>
      <div class="wrapper">
        <span class="material-symbols-outlined">visibility</span>
        <p class="title-1">${Math.round(obj.visibility)}<sub>km</sub></p>
      </div>
    </div>

    <div class="card card-sm highlight-card">
      <h3 class="title-3">Feels Like</h3>
      <div class="wrapper">
        <span class="material-symbols-outlined">thermostat</span>
        <p class="title-1" dummy1>${Math.round(obj.feelsLike)}°<sub>c</sub></p>
      </div>
    </div>
  </div>
  `;
  hightlights.append(card);
}

function changeForecast(forecast) {
  let hourSection = document.querySelector("[data-hourly-forecast]");
  hourSection.innerHTML = "";

  let dailyForecast = document.querySelector("[data-5-day-forecast]");
  dailyForecast.innerHTML = "";

  hourSection.innerHTML = `
  <h2 class="title-2">Today at</h2>
  <div class="slider-container">
    <ul class="slider-list" data-temp></ul>

    <ul class="slider-list" data-wind></ul>
  </div>
  `;
  let timezones = forecast.data.city.timezone;
  for (let i = 0; i < 8; i++) {
    let Forecast = forecast.data.list[i];
    let tempLi = document.createElement("li");
    tempLi.classList.add("slider-item");
    tempLi.innerHTML = `
    <div class="card card-sm slider-card">
    <p class="body-3">${hrs(Forecast.dt, timezones)}</p>
    <img
      src="src/images/weather/day/${Forecast.weather[0].icon}.png"
      width="48"
      height="48"
      alt="${Forecast.weather[0].description}"
      class="weather-icon"
      loading="lazy"
    />
    <p class="body-3" dummies>${Math.round(Forecast.main.temp)}°</p>
  </div>
    `;
    hourSection.querySelector("[data-temp]").appendChild(tempLi);

    let windLi = document.createElement("li");
    windLi.classList.add("slider-item");
    windLi.innerHTML = `
    <div class="card card-sm slider-card">
    <p class="body-3">${hrs(Forecast.dt, timezones)}</p>
    <img
      src="./src/images/direction.png"
      width="48"
      height="48"
      alt="weather-icon"
      class="weather-icon"
      loading="lazy"
      style="transform: rotate(${Forecast.wind.deg - 180}deg)"
    />
    <p class="body-3">${Math.round(
      convertToKmPerHr(Forecast.wind.speed)
    )} km/h</p>
  </div>
    `;
    hourSection.querySelector("[data-wind]").appendChild(windLi);
  }

  /*5 day forecast */
  dailyForecast.innerHTML = `
    <h2 class="title-2" id="forecast-label">5 Days Forecast</h2>
    <div class="card card-lg forecast-card">
      <ul data-forecast-list></ul>
  </div>
  `;
  let lists = forecast.data.list;

  for (let i = 7, len = lists.length; i < len; i += 8) {
    let date = new Date(lists[i].dt_txt);
    let li = document.createElement("li");
    li.classList.add("card-item");
    li.innerHTML = `
      <div class="icon-wrapper">
      <img
        src="src/images/weather/day/${lists[i].weather[0].icon}.png"
        width="36"
        height="36"
        alt="${lists[i].weather[0].description}"
        class="weather-icon"
      />
      <span class="span">
        <p class="title-2" dummies>${Math.round(lists[i].main.temp_max)}°</p>
      </span>
    </div>
    <p class="label-1">${date.getUTCDate()} ${months[date.getUTCMonth()]}</p>
    <p class="label-1">${days[date.getUTCDay()]}</p>
      `;
    dailyForecast.querySelector("[data-forecast-list]").appendChild(li);
  }
  loadData.style.display = "none";
  container.style.overflowY = "overlay";
  container.classList.add("fade-in");
}

function error404() {
  errors.style.display = "flex";
}

function changetheme() {
  let weatherIcon = document.querySelector(
    ".current-weather-card .weather-icon"
  );
  let altValue = weatherIcon.getAttribute("alt");

  const logo = document.querySelector(".header .container .logo");

  if (altValue.slice(-1) === "d") {
    root.classList.add("light-mode");
    src = logo.getAttribute("src");
    logo.setAttribute("src", "src/images/favicon - Copy.svg");
  } else {
    root.classList.remove("light-mode");
    logo.setAttribute("src", "src/images/favicon.svg");
  }
}

function convertToFanhereit(value) {
  let newValue = value * (9 / 5) + 32;
  return newValue;
}

function convertToCelcius(value) {
  newValue = (value - 32) * (5 / 9);
  return newValue;
}

function conversion() {
  let celcius = document.querySelector("[celcius]");
  let dummies = document.querySelectorAll("[dummies]");
  let feels = document.querySelector("[dummy1]");

  if (celcius.classList.contains("celcius")) {
    celcius.classList.remove("celcius");
    celcius.classList.add("fan");
    let value = celcius.textContent.slice(0, -2);

    /* changing for current weather */
    celcius.textContent = `${Math.round(convertToFanhereit(Number(value)))}°F`;

    /* for todays highlight*/
    let newFeel = feels.textContent.slice(0, -2);
    feels.textContent = `${Math.round(convertToFanhereit(Number(newFeel)))}°F`;

    /* changing for hourly weather */
    dummies.forEach(function (dummy) {
      let value = dummy.textContent.slice(0, -1);
      dummy.textContent = `${Math.round(convertToFanhereit(Number(value)))}°`;
    });
  } else {
    celcius.classList.remove("fan");
    celcius.classList.add("celcius");
    let value = celcius.textContent.slice(0, -2);

    /* changing for current weather */
    celcius.textContent = `${Math.round(convertToCelcius(Number(value)))}°c`;

    /* for todays highlight*/
    let newFeel = feels.textContent.slice(0, -2);
    feels.textContent = `${Math.round(convertToCelcius(Number(newFeel)))}°c`;

    /* changing for hourly weather */
    dummies.forEach(function (dummy) {
      let value = dummy.textContent.slice(0, -1);
      dummy.textContent = `${Math.round(convertToCelcius(Number(value)))}°`;
    });
  }
}
