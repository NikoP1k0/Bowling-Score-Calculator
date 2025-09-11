import { useState } from "react";

function App() {
  const [rolls, setRolls] = useState([]);
  const [score, setScore] = useState(null);

  const simulate = async () => {
    const res = await fetch("http://localhost:3001/simulate");
    const data = await res.json();
    setRolls(data.rolls);
    setScore(data.score);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bowling Simulator 🎳</h1>
      <button onClick={simulate}>Simulate Game</button>

      {score !== null && (
        <div>
          <h2>Total Score: {score}</h2>
          <p>Rolls: {rolls.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

export default App;

