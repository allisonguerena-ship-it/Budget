const CACHE_NAME = "squid-budget-v5";
const ASSETS = [
	"./",
	"./index.html",
	"./manifest.json",
	"./icon.svg",
	"./css/main.css",
	"./css/layout.css",
	"./css/components.css",
	"./css/cards.css",
	"./css/forms.css",
	"./css/theme.css",
	"./js/utils.js",
	"./js/storage.js",
	"./js/budget.js",
	"./js/pot.js",
	"./js/fixedBills.js",
	"./js/weeks.js",
	"./js/categoryLearning.js",
	"./js/plannedExpenses.js",
	"./js/cashflow.js",
	"./js/charts.js",
	"./js/ui.js",
	"./js/app.js",
	"https://cdn.jsdelivr.net/npm/chart.js"
];

self.addEventListener("install", e => {
	e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
	self.skipWaiting();
});

self.addEventListener("activate", e => {
	e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))));
	self.clients.claim();
});

self.addEventListener("fetch", e => {
	e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});