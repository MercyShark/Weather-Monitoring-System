document.addEventListener("DOMContentLoaded", () => {
  const ws = new WebSocket("ws://127.0.0.1:8000/ws"); // WebSocket endpoint
  const ctx = document.getElementById("chart").getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Temperature (°C)",
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
          data: [],
          tension: 0.1,
        },
        {
          label: "Humidity (%)",
          borderColor: "rgb(54, 162, 235)",
          backgroundColor: "rgba(54, 162, 235, 0.5)",
          data: [],
          tension: 0.1,
        },
      ],
    },
    options: {
      animation: {
        duration: 0, // Disable animation for better performance
      },
      scales: {
        x: {
          display: true,
        },
        y: {
          display: true,
          suggestedMin: 0,
          suggestedMax: 100,
        },
      },
    },
  });

  ws.onopen = () => {
    console.log("Connected to the server");
  };

  ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    if (response.type === "initial_data") {
      for (const data of response.data) {
        chart.data.labels.push(data.timestamp);
        chart.data.datasets[0].data.push(data.temperature);
        chart.data.datasets[1].data.push(data.humidity);
      }
      chart.update();
    }

    if (response.type === "live_data") {
      data = response.data;
      chart.data.labels.push(data.timestamp);
      chart.data.datasets[0].data.push(data.temperature);
      chart.data.datasets[1].data.push(data.humidity);
      chart.update();
    }
  };
});
