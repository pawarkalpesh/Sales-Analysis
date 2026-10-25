
"use strict";

const PRODUCTS = {
  Laptop: 60000,
  Mobile: 25000,
  Headphones: 2000,
  Monitor: 12000,
  Keyboard: 1500
};

const REGIONS = ["North", "South", "East", "West"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const COLORS = ["#6759e8", "#159b73", "#4388e8", "#e99a3d", "#d65f91"];
const REGION_COLORS = {
  North: "#6759e8",
  South: "#159b73",
  East: "#4388e8",
  West: "#e99a3d"
};

const money = value => "₹" + value.toLocaleString("en-IN", {
  maximumFractionDigits: 2
});

const number = value => value.toLocaleString("en-IN");

function seededRandom(seed) {
  return function () {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Generate a repeatable demonstration dataset.
function generateSalesData() {
  const random = seededRandom(42);
  const productNames = Object.keys(PRODUCTS);
  const start = Date.UTC(2025, 0, 1);
  const end = Date.UTC(2025, 11, 31);
  const dayCount = Math.round((end - start) / 86400000);

  return Array.from({ length: 1000 }, (_, index) => {
    const day = Math.floor(random() * (dayCount + 1));
    const date = new Date(start + day * 86400000);
    const product = productNames[
      Math.floor(random() * productNames.length)
    ];
    const region = REGIONS[
      Math.floor(random() * REGIONS.length)
    ];
    const quantity = 1 + Math.floor(random() * 5);
    const revenue = quantity * PRODUCTS[product];

    return {
      Order_ID: index + 1,
      Date: date.toISOString().slice(0, 10),
      Product: product,
      Region: region,
      Quantity: quantity,
      Unit_Price: PRODUCTS[product],
      Revenue: revenue,
      Profit: Math.round(revenue * 0.20 * 100) / 100
    };
  });
}

const salesData = generateSalesData();
let charts = {};

function sum(rows, key) {
  return rows.reduce((total, row) => total + row[key], 0);
}

function groupBy(rows, key) {
  return rows.reduce((groups, row) => {
    const name = row[key];
    if (!groups[name]) {
      groups[name] = { Revenue: 0, Profit: 0, Units_Sold: 0, Orders: 0 };
    }
    groups[name].Revenue += row.Revenue;
    groups[name].Profit += row.Profit;
    groups[name].Units_Sold += row.Quantity;
    groups[name].Orders += 1;
    return groups;
  }, {});
}

function createChart(id, config) {
  const canvas = document.getElementById(id);
  if (!canvas || typeof Chart === "undefined") return null;

  return new Chart(canvas, {
    ...config,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 350 },
      ...config.options
    }
  });
}

function initializeCharts() {
  if (typeof Chart === "undefined") {
    document.querySelector(".chart-grid").insertAdjacentHTML(
      "afterbegin",
      '<p class="insight">Charts could not load. Check your internet connection and reload the page.</p>'
    );
    return;
  }

  Chart.defaults.font.family = "Inter, sans-serif";
  Chart.defaults.font.size = 11;
  Chart.defaults.color = "#8993a5";

  charts.product = createChart("productChart", {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "Revenue",
        data: [],
        backgroundColor: COLORS,
        borderRadius: 5,
        maxBarThickness: 40
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: "#f0f2f7" },
          ticks: { callback: value => "₹" + Number(value).toLocaleString("en-IN") }
        }
      }
    }
  });

  charts.region = createChart("regionChart", {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "Revenue",
        data: [],
        backgroundColor: [],
        borderRadius: 5,
        maxBarThickness: 45
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: "#f0f2f7" },
          ticks: { callback: value => "₹" + Number(value).toLocaleString("en-IN") }
        }
      }
    }
  });

  charts.monthly = createChart("monthlyChart", {
    type: "line",
    data: {
      labels: MONTHS,
      datasets: [{
        label: "Revenue",
        data: [],
        borderColor: "#6759e8",
        backgroundColor: "rgba(103,89,232,0.10)",
        pointBackgroundColor: "#6759e8",
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: {
          beginAtZero: true,
          grid: { color: "#f0f2f7" },
          ticks: { callback: value => "₹" + Number(value).toLocaleString("en-IN") }
        }
      }
    }
  });

  charts.scatter = createChart("scatterChart", {
    type: "scatter",
    data: {
      datasets: REGIONS.map(region => ({
        label: region,
        data: [],
        backgroundColor: REGION_COLORS[region] + "99",
        pointRadius: 3,
        pointHoverRadius: 5
      }))
    },
    options: {
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true } },
        tooltip: {
          callbacks: {
            label: context =>
              "Revenue: " + money(context.raw.x) +
              " | Profit: " + money(context.raw.y)
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: "Revenue (₹)" },
          beginAtZero: true,
          grid: { color: "#f0f2f7" },
          ticks: { callback: value => "₹" + Number(value).toLocaleString("en-IN") }
        },
        y: {
          title: { display: true, text: "Profit (₹)" },
          beginAtZero: true,
          grid: { color: "#f0f2f7" },
          ticks: { callback: value => "₹" + Number(value).toLocaleString("en-IN") }
        }
      }
    }
  });
}

function updateDashboard() {
  const region = document.getElementById("regionFilter").value;
  const product = document.getElementById("productFilter").value;

  const rows = salesData.filter(row =>
    (region === "All" || row.Region === region) &&
    (product === "All" || row.Product === product)
  );

  const revenue = sum(rows, "Revenue");
  const profit = sum(rows, "Profit");
  const units = sum(rows, "Quantity");

  document.getElementById("totalRevenue").textContent = money(revenue);
  document.getElementById("totalProfit").textContent = money(profit);
  document.getElementById("totalOrders").textContent = number(rows.length);
  document.getElementById("totalUnits").textContent = number(units);

  const products = groupBy(rows, "Product");
  const productRows = Object.entries(products)
    .sort((a, b) => b[1].Revenue - a[1].Revenue);

  if (charts.product) {
    charts.product.data.labels = productRows.map(item => item[0]);
    charts.product.data.datasets[0].data = productRows.map(item => item[1].Revenue);
    charts.product.data.datasets[0].backgroundColor =
      productRows.map((_, i) => COLORS[i % COLORS.length]);
    charts.product.update();
  }

  const regions = groupBy(rows, "Region");
  const regionRows = Object.entries(regions)
    .sort((a, b) => b[1].Revenue - a[1].Revenue);

  if (charts.region) {
    charts.region.data.labels = regionRows.map(item => item[0]);
    charts.region.data.datasets[0].data = regionRows.map(item => item[1].Revenue);
    charts.region.data.datasets[0].backgroundColor =
      regionRows.map(item => REGION_COLORS[item[0]]);
    charts.region.update();
  }

  const monthly = Array(12).fill(0);
  rows.forEach(row => {
    const monthIndex = Number(row.Date.slice(5, 7)) - 1;
    monthly[monthIndex] += row.Revenue;
  });

  if (charts.monthly) {
    charts.monthly.data.datasets[0].data = monthly;
    charts.monthly.update();
  }

  if (charts.scatter) {
    charts.scatter.data.datasets.forEach(dataset => {
      dataset.data = rows
        .filter(row => row.Region === dataset.label)
        .map(row => ({ x: row.Revenue, y: row.Profit }));
    });
    charts.scatter.update();
  }

  renderProductTable(productRows);
  renderInsights(rows, productRows, regionRows, monthly);
}

function renderProductTable(productRows) {
  const tbody = document.getElementById("productTable");

  if (!productRows.length) {
    tbody.innerHTML = '<tr><td colspan="4">No matching sales data.</td></tr>';
    return;
  }

  tbody.innerHTML = productRows.map(([name, stats]) => `
    <tr>
      <td>${name}</td>
      <td>${money(stats.Revenue)}</td>
      <td>${money(stats.Profit)}</td>
      <td>${number(stats.Units_Sold)}</td>
    </tr>
  `).join("");
}

function renderInsights(rows, productRows, regionRows, monthly) {
  const container = document.getElementById("insights");

  if (!rows.length) {
    container.innerHTML = `
      <div class="insight">
        <div class="insight-value">No matching orders</div>
        <div class="insight-detail">Change your filters to see business insights.</div>
      </div>`;
    return;
  }

  const bestProduct = productRows[0];
  const bestRegion = regionRows[0];
  const bestMonthValue = Math.max(...monthly);
  const bestMonth = MONTHS[monthly.indexOf(bestMonthValue)];

  const cards = [
    {
      label: "Top Product",
      value: bestProduct[0],
      detail: money(bestProduct[1].Revenue) + " in revenue"
    },
    {
      label: "Top Region",
      value: bestRegion[0],
      detail: money(bestRegion[1].Revenue) + " in revenue"
    },
    {
      label: "Best Sales Month",
      value: bestMonth,
      detail: money(bestMonthValue) + " in revenue"
    },
    {
      label: "Average Order Value",
      value: money(sum(rows, "Revenue") / rows.length),
      detail: number(rows.length) + " orders in current selection"
    }
  ];

  container.innerHTML = cards.map(card => `
    <div class="insight">
      <div class="insight-label">${card.label}</div>
      <div class="insight-value">${card.value}</div>
      <div class="insight-detail">${card.detail}</div>
    </div>
  `).join("");
}

function downloadCSV() {
  const region = document.getElementById("regionFilter").value;
  const product = document.getElementById("productFilter").value;

  const rows = salesData.filter(row =>
    (region === "All" || row.Region === region) &&
    (product === "All" || row.Product === product)
  );

  const columns = [
    "Order_ID", "Date", "Product", "Region",
    "Quantity", "Unit_Price", "Revenue", "Profit"
  ];

  const csvCell = value =>
    '"' + String(value).replace(/"/g, '""') + '"';

  const csv = [
    columns.join(","),
    ...rows.map(row => columns.map(key => csvCell(row[key])).join(","))
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sales_data.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("regionFilter")
    .addEventListener("change", updateDashboard);

  document.getElementById("productFilter")
    .addEventListener("change", updateDashboard);

  document.getElementById("downloadBtn")
    .addEventListener("click", downloadCSV);

  initializeCharts();
  updateDashboard();
});
