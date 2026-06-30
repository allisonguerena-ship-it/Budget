let chart;

function renderChart() {
  const weeks = calcWeeks();
  const ctx = document.getElementById("spendChart");
  if (chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: weeks.map(w => "W" + (w.i + 1)),
      datasets: [
        { label: "Spent", data: weeks.map(w => w.used) },
        { label: "Left over", data: weeks.map(w => w.leftover) }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" }
      },
      scales: {
        y: {
          ticks: {
            callback: v => "$" + v
          }
        }
      }
    }
  });
}
