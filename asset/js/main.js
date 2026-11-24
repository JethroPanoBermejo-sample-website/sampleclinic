"use strict";

const navigation = document.querySelector("#primary-nav");
const navigationToggle = document.querySelector(".nav-toggle");
const mobileNavigation = window.matchMedia("(max-width: 770px)");

function closeNavigation() {
  navigation.classList.remove("is-open");
  navigationToggle.setAttribute("aria-expanded", "false");
}

navigationToggle.hidden = false;
document.documentElement.classList.add("nav-enhanced");
navigationToggle.addEventListener("click", () => {
  const expanded = navigation.classList.toggle("is-open");
  navigationToggle.setAttribute("aria-expanded", String(expanded));
});
navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) closeNavigation();
});
mobileNavigation.addEventListener("change", closeNavigation);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("is-open")) {
    closeNavigation();
    navigationToggle.focus();
  }
});

const form = document.querySelector("#booking-form");
const formFields = document.querySelector("#booking-fields");
const treatment = document.querySelector("#service");
const preferredDate = document.querySelector("#date");
const preferredTime = document.querySelector("#time");
const dateHelp = document.querySelector("#date-help");
const summary = document.querySelector("#request-summary");
const treatmentSummary = document.querySelector("#request-treatment");
const scheduleSummary = document.querySelector("#request-schedule");
const dateFormatter = new Intl.DateTimeFormat("en-PH", {
  timeZone: "UTC",
  dateStyle: "full",
});
const thisClinicDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" })
  .formatToParts(new Date());
const part = (name) => thisClinicDay.find((item) => item.type === name).value;
const today = new Date(Date.UTC(Number(part("year")), Number(part("month")) - 1, Number(part("day"))));
const fromToday = (days) => new Date(today.getTime() + days * 86400000).toISOString().slice(0, 10);

const weekdayTimes = ["9:00 am", "10:30 am", "1:00 pm", "2:30 pm", "4:30 pm"];
const saturdayTimes = ["9:00 am", "10:30 am", "12:00 pm"];

preferredDate.min = fromToday(1);
preferredDate.max = fromToday(60);

function updateTimes() {
  const chosen = preferredTime.value;
  preferredTime.replaceChildren(new Option("Choose a time", ""));
  preferredTime.disabled = true;
  preferredDate.setCustomValidity("");
  summary.hidden = true;

  if (!preferredDate.value) {
    preferredTime.options[0].textContent = "Choose a date first";
    dateHelp.textContent = "Sample times are shown in Philippine time.";
    return;
  }

  if (preferredDate.validity.rangeUnderflow || preferredDate.validity.rangeOverflow) {
    dateHelp.textContent = "Choose a date from tomorrow through the next 60 days.";
    return;
  }

  const weekday = new Date(preferredDate.value + "T00:00:00Z").getUTCDay();
  if (weekday === 0) {
    const message = "The sample clinic is closed on Sundays. Choose another date.";
    preferredDate.setCustomValidity(message);
    dateHelp.textContent = message;
    return;
  }

  const times = weekday === 6 ? saturdayTimes : weekdayTimes;
  times.forEach((time) => preferredTime.add(new Option(time, time)));
  preferredTime.disabled = false;
  if (times.includes(chosen)) preferredTime.value = chosen;
  dateHelp.textContent = times.length + " sample times in Philippine time.";
}

function clearSummary() {
  summary.hidden = true;
}

preferredDate.addEventListener("input", updateTimes);
preferredDate.addEventListener("change", updateTimes);
treatment.addEventListener("change", clearSummary);
preferredTime.addEventListener("change", clearSummary);

document.querySelectorAll("[data-service]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    treatment.value = link.dataset.service;
    clearSummary();
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!form.reportValidity() || !preferredTime.value) return;
  const displayDate = dateFormatter.format(new Date(preferredDate.value + "T00:00:00Z"));
  treatmentSummary.textContent = treatment.selectedOptions[0].textContent;
  scheduleSummary.textContent = displayDate + " · " + preferredTime.value + " Philippine time";
  summary.hidden = false;
  summary.focus();
});

formFields.disabled = false;
updateTimes();
