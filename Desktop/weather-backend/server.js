import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // optional, if you serve frontend from here

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// POST /weather — fetch weather & save search
app.post("/weather", async (req, res) => {
  const city = req.body.city;

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
        city
      )}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
    );

    const data = await response.json();

    if (data.cod !== 200) {
      return res.status(404).json({ error: data.message || "City not found" });
    }

    await pool.query("INSERT INTO search_history(city) VALUES($1)", [city]);

    res.json(data);
  } catch (err) {
    console.error("Error fetching weather or saving to DB:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /history — get recent search history
app.get("/history", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT city, searched_at FROM search_history ORDER BY searched_at DESC LIMIT 5"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching search history:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
