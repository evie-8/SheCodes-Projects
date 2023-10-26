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