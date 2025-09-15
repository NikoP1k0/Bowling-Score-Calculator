// Helper to get max possible score
export function getMaxPossibleScore(rolls) {
  const simulatedRolls = [...rolls];
  while (simulatedRolls.length < 21) {
    simulatedRolls.push(10);
  }
  return fetch("http://localhost:3001/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rolls: simulatedRolls }),
  })
    .then(res => res.json())
    .then(data => data.score || 0);
}

export function createEmptyScorecard(id) {
    return {
      id,
      name: `Player ${id}`,
      editingName: false, 
      rolls: [],
      frame: 1,
      rollInFrame: 1,
      firstRollPins: null,
      score: null,
      frameScores: [],
      maxPossible: 300,
      message: ""
    };
  }