// Copyright info in footer section
const year = document.querySelector(".year");
year.innerHTML = "© " + new Date().getFullYear() + " | London Futsal League";

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}
