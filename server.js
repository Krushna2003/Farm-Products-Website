// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// serve frontend static files if you keep frontend files in the same folder
app.use(express.static(path.join(__dirname)));

app.get("/products", (req, res) => {
  const file = path.join(__dirname, "products.json");
  fs.readFile(file, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading products.json:", err);
      return res.status(500).json({ error: "Failed to read products" });
    }
    try {
      const products = JSON.parse(data);
      res.json(products);
    } catch (e) {
      console.error("Invalid JSON in products.json:", e);
      res.status(500).json({ error: "Invalid products JSON" });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
