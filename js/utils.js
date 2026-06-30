const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const cats = ["Food","Coffee","Groceries","Shopping","Beauty","Dog","Going Out","Uber/Waymo","Subscription","Home","Health","Trip/Travel","Other"];
const billCats = ["Housing","Car","Insurance","Utilities","Phone","Subscription","Dog","Health","Debt","Other"];
const planTypes = ["Trip/Travel","Moving","Gift","Annual Bill","Medical","Beauty","Home","Other"];

function monthKeyFromDate(date) {
  return date.toISOString().slice(0, 7);
}

function firstOfMonth(key) {
  return new Date(key + "-01T00:00:00");
}

function addMonthsToKey(key, n) {
  const d = firstOfMonth(key);
  d.setMonth(d.getMonth() + n);
  return monthKeyFromDate(d);
}

function monthName(key) {
  return firstOfMonth(key).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function addDays(iso, days) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function shortDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function defaultWeekStarts(key) {
  const start = firstOfMonth(key);
  const starts = [];
  let d = new Date(start);
  while (d.getMonth() === start.getMonth()) {
    starts.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 7);
  }
  return starts;
}

function daysInMonth(key) {
  const d = firstOfMonth(key);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function dateForDay(key, day) {
  const d = firstOfMonth(key);
  d.setDate(Math.min(Math.max(1, Number(day) || 1), daysInMonth(key)));
  return d.toISOString().slice(0, 10);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[m]));
}

function normalizeDesc(desc) {
  return String(desc || "")
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 40);
}
