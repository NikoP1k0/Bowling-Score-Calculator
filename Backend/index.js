const express = require("express");
const cors = require("cors");
const {simulateGame, calculateScore} = require("./bowling");

const app = express();
app.use(cors());
const PORT = 3001;

app.get("/simulate", (req, res) => {
  const rolls = simulateGame();
  const score = calculateScore(rolls);
  res.json({ rolls, score });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
