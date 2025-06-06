import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Setup PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// POST /weather route - get weather info and save search to DB
app.post("/weather", async (req, res) => {
  const city = req.body.city;

  if (!city) {
    return res.status(400).json({ error: "City name is required" });
  }

  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const weatherData = await weatherRes.json();

    if (weatherData.cod !== 200) {
      return res.status(weatherData.cod).json({ error: weatherData.message });
    }

    // Save search to DB (optional, adjust your table/columns)
    await pool.query(
      "INSERT INTO search_history(city, searched_at) VALUES ($1, NOW())",
      [city]
    );

    res.json(weatherData);
  } catch (err) {
    console.error("Error fetching weather:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /history route - return last 5 searches
app.get("/history", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT city, searched_at FROM search_history ORDER BY searched_at DESC LIMIT 5"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
