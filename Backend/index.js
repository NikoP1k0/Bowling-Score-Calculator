const express = require("express");
const cors = require("cors");
const { simulateGame, calculateScore } = require("./bowling");

function getFrameScores(rolls) {
  let scores = [];
  let rollIndex = 0;
  let total = 0;
  for (let frame = 0; frame < 10; frame++) {
    if (rolls[rollIndex] === 10) {
      total += 10 + (rolls[rollIndex + 1] || 0) + (rolls[rollIndex + 2] || 0);
      scores.push(total);
      rollIndex += 1;
    } else if ((rolls[rollIndex] || 0) + (rolls[rollIndex + 1] || 0) === 10) {
      total += 10 + (rolls[rollIndex + 2] || 0);
      scores.push(total);
      rollIndex += 2;
    } else {
      total += (rolls[rollIndex] || 0) + (rolls[rollIndex + 1] || 0);
      scores.push(total);
      rollIndex += 2;
    }
  }
  return scores;
}

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
  if (!Array.isArray(rolls)) {
    return res.status(400).json({ error: "Invalid rolls array" });
  }
  try {
    const score = calculateScore(rolls);
    const frameScores = getFrameScores(rolls);
    res.json({ score, frameScores });
  } catch (e) {
    res.status(400).json({ error: "Error calculating score" });
  }
});

app.listen(PORT, () => {
  console.log(`Bowling backend running on port ${PORT}`);
});
