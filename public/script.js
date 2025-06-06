async function getWeather() {
  const city = document.getElementById("cityInput").value.trim();

  if (!city) {
    document.getElementById("weather").innerHTML = `<p style="color:red;">Please enter a city name.</p>`;
    return;
  }

  try {
    const response = await fetch("https://weather-backend-qsfj.onrender.com/weather", {
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
  } catch (error) {
    document.getElementById("weather").innerHTML = `<p style="color:red;">Server error. Please try again later.</p>`;
    console.error("Fetch error:", error);
  }
}

async function loadHistory() {
  try {
    const response = await fetch("https://weather-backend-qsfj.onrender.com/history");
    const history = await response.json();

    let html = "<h3>Last 5 Searches</h3><ul>";
    history.forEach(item => {
      html += `<li>${item.city} - ${new Date(item.searched_at).toLocaleString()}</li>`;
    });
    html += "</ul>";

    document.getElementById("history").innerHTML = html;
  } catch (error) {
    console.error("Error loading history:", error);
    document.getElementById("history").innerHTML = `<p style="color:red;">Unable to load search history.</p>`;
  }
}
