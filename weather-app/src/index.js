const logo = document.querySelector(".logo img");
const root = document.body;

logo.addEventListener("click", function () {
if (root.classList.contains('light-mode')) {
    root.classList.remove('light-mode');
    logo.src = "src/images/favicon.svg";
} else {
  root.classList.add('light-mode');
  logo.src = "src/images/favicon - Copy.svg";
}
});
