document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".toggle");
  const nav = document.querySelector("nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", function () {
    const isActive = toggle.classList.toggle("active");
    nav.classList.toggle("active");
    toggle.setAttribute("aria-expanded", isActive ? "true" : "false");
  });
});
