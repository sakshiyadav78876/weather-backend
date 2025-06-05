async function getWeather() {
  const city = document.getElementById("cityInput").value;

  const response = await fetch("http://localhost:3000/weather", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ city })
  });

  const data = await response.json();

  if (data.error) {
    document.getElementById("weather").innerHTML = `<p style="color:red;">${data.error}</p>`;
  } else {
    document.getElementById("weather").innerHTML = `
      <h2>${data.name}, ${data.sys.country}</h2>
      <p>Temperature: ${data.main.temp} °C</p>
      <p>Weather: ${data.weather[0].description}</p>
    `;
  }

  loadHistory();
}

async function loadHistory() {
  const response = await fetch("http://localhost:3000/history");
  const history = await response.json();

  let html = "<h3>Last 5 Searches</h3><ul>";
  history.forEach(item => {
    html += `<li>${item.city} - ${new Date(item.searched_at).toLocaleString()}</li>`;
  });
  html += "</ul>";

  document.getElementById("history").innerHTML = html;
}
