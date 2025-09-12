const express = require("express");
const cors = require("cors");
const {simulateGame, calculateScore} = require("./bowling");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3001;

// Simulate a random game
app.get("/simulate", (req, res) => {
  const rolls = simulateGame();
  const score = calculateScore(rolls);
  res.json({ rolls, score });
});

// Calculate score from provided rolls
app.post("/score", (req, res) => {
  const { rolls } = req.body;
  if (!Array.isArray(rolls)){
    return res.status(400).json({ error: "Invalid rolls format" });
  }
  try{
    const score = calculateScore(rolls);
    res.json({ score });
  } catch (e){
    res.status(500).json({ error: "Error calculating score" });
  }
});



app.listen(PORT, () => console.log(`Bowling backend running on  port http://localhost:${PORT}`));
