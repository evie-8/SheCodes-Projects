const logo = document.querySelector(".logo img");
const root = document.body;

/* preloader */
window.addEventListener("load", function () {
let loader = document.querySelector(".loading");
loader.classList.add("preloader--hidden");
});

/* dark theme effect */
logo.addEventListener("click", function () {
if (root.classList.contains('light-mode')) {
    root.classList.remove('light-mode');
    logo.src = "src/images/favicon.svg";
} else {
  root.classList.add('light-mode');
  logo.src = "src/images/favicon - Copy.svg";
}
});

/*search for mobiles */
let searchView = document.querySelector("[data-search-view]");
let searchToggle = document.querySelectorAll("[data-search-toggler]");

console.log(searchToggle);
function activate() {
  searchView.classList.toggle("active");
}

searchToggle.forEach(function (element) {
  element.addEventListener("click", activate);
});

/* fetching data from server*/
const apiKey = "96771e971243152d6b8948878c26adde";
function apiFetchData (url, urlFunction) {
  axios.get(`${url}&appid=${apiKey}`)
    .then(urlFunction);
}

let urls = {
  currentWeather(latitude, longitude) {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric`
  },

  fiveDayForecast(latitude, longitude) {
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric`;
  },

  airQuality(latitude, longitude) {
    return `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}`;
  },

  changeGeoToCity(latitude, longitude) {
    return `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=5`;
  },

  changeCityToGeo(cityName) {
    return `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5`;
  }
}

/* creating a search engine */

function timeOut () {
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
        <p class="label-2 item-subtitle">${location.state || ""} ${location.country}</p>
      </div>
      <a href="#/weather?lat=${location.lat}&lon=${location.lon}" class="item-link has-state" aria-label="${location.name} weather" data-search-toggler></a>
      `;
      searchResult.querySelector("[data-search-list]").appendChild(items);
      searchItems.push(items.querySelector("[data-search-toggler]"));
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