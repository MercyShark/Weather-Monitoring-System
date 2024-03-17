document.addEventListener("DOMContentLoaded", () => {
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
  SearchByDateForm = document.getElementById("search_by_date_form");
  SearchByDateForm.addEventListener("submit", (event) => {
    event.preventDefault();

    params = {};
    start_timestamp = pythonDatetimeString(
      document.getElementById("start_date").value
    );
    end_timestamp = pythonDatetimeString(
      document.getElementById("end_date").value
    );

    if (start_timestamp != null) {
      params["start"] = start_timestamp;
    }
    if (end_timestamp != null) {
      params["end"] = end_timestamp;
    }

    console.log("her");
    axios
      .get("http://127.0.0.1:8000/filter_data/", {
        params: params,
      })
      .then((response) => {
        console.log("successfully");
      })
      .catch((error) => {
        console.log("error");
      });
  });

  function pythonDatetimeString(datetime) {
    console.log(datetime);
    if (datetime === "") {
      return null;
    }
    let jsDate = new Date(datetime);
    let pythonDatetimeString =
      jsDate.getFullYear() +
      "-" +
      ("0" + (jsDate.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + jsDate.getDate()).slice(-2) +
      " " +
      ("0" + jsDate.getHours()).slice(-2) +
      ":" +
      ("0" + jsDate.getMinutes()).slice(-2) +
      ":" +
      ("0" + jsDate.getSeconds()).slice(-2);
    return pythonDatetimeString;
  }
  const ws = new WebSocket("ws://127.0.0.1:8000/ws"); // WebSocket endpoint

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

    if (response.type === "filter_data") {
      console.log("filter data");
      chart.data.datasets.forEach((dataset) => {
        dataset.data = [];
        dataset.labels = [];
      });
      chart.data.labels = [];
      chart.update();

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
