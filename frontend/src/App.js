import { useState } from "react";

function App() {
  const [rolls, setRolls] = useState([]);
  const [frame, setFrame] = useState(1);
  const [rollInFrame, setRollInFrame] = useState(1);
  const [firstRollPins, setFirstRollPins] = useState(null);
  const [score, setScore] = useState(null);
  const [frameScores, setFrameScores] = useState([]);
  const [message, setMessage] = useState("");
  const [maxPossible, setMaxPossible] = useState(300);

  // Call backend to calculate score and frame scores
  const calculateScore = async (rollsArr) => {
    const res = await fetch("http://localhost:3001/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rolls: rollsArr }),
    });
    const data = await res.json();
    setScore(data.score);
    setFrameScores(data.frameScores || []);
    console.log("frameScores from backend:", data.frameScores); 
  };

  // Prepare frame data for display
  const frames = [];
  let rollIndex = 0;
  for (let i = 0; i < 10; i++) {
    let first = rolls[rollIndex] !== undefined ? rolls[rollIndex] : "";
    let second = "";
    let third = "";
    if (i < 9) {
      if (first === 10) {
        second = "";
        rollIndex += 1;
      } else {
        second = rolls[rollIndex + 1] !== undefined ? rolls[rollIndex + 1] : "";
        rollIndex += 2;
      }
    } else {
      // 10th frame
      second = rolls[rollIndex + 1] !== undefined ? rolls[rollIndex + 1] : "";
      third = rolls[rollIndex + 2] !== undefined ? rolls[rollIndex + 2] : "";
      rollIndex += 3;
    }
    frames.push({ first, second, third });
  }

  // Handle roll selection
  const handleRoll = (pins) => {
    setMessage("");
    let newRolls = [...rolls, pins];

    // 10th frame logic
    if (frame === 10) {
      if (rollInFrame === 1) {
        setFirstRollPins(pins);
        setRolls(newRolls);
        setRollInFrame(2);
        calculateScore(newRolls);
      } else if (rollInFrame === 2) {
        setRolls(newRolls);
        calculateScore(newRolls);
        if (
          firstRollPins === 10 ||
          firstRollPins + pins === 10
        ) {
          setRollInFrame(3);
        } else {
          setFrame(11);
        }
      } else if (rollInFrame === 3) {
        setRolls(newRolls);
        calculateScore(newRolls);
        setFrame(11);
      }
      return;
    }

    // Frames 1-9
    if (rollInFrame === 1) {
      setFirstRollPins(pins);
      setRolls(newRolls);
      calculateScore(newRolls);
      if (pins === 10) {
        setFrame(frame + 1);
        setRollInFrame(1);
        setFirstRollPins(null);
      } else {
        setRollInFrame(2);
      }
    } else if (rollInFrame === 2) {
      setRolls(newRolls);
      calculateScore(newRolls);
      setFrame(frame + 1);
      setRollInFrame(1);
      setFirstRollPins(null);
    }
    getMaxPossibleScore(newRolls).then(setMaxPossible);
  };

  // Determine available options for current roll
  let maxPins = 10;
  if (frame <= 10 && rollInFrame === 2 && firstRollPins !== null) {
    maxPins = frame === 10 && firstRollPins === 10 ? 10 : 10 - firstRollPins;
  }
  if (frame === 10 && rollInFrame === 3) {
    maxPins = 10;
  }

  // Only include frames that are actually complete (score is not undefined)
  const completedFrames = frameScores.filter((s) => s !== undefined);
  // Find the last defined frame score (the running total up to the current frame)
  const runningTotal = (() => {
    for (let i = frameScores.length - 1; i >= 0; i--) {
      if (typeof frameScores[i] === "number") return frameScores[i];
    }
    return 0;
  })();

  // Ensure frameScores is always length 10, filling with undefined if needed
  const paddedFrameScores = Array.from({ length: 10 }, (_, i) => frameScores[i]);

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Bowling Score Card Calculator 🎳</h1>
      <div style={{
        display: "flex",
        border: "2px solid #333",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "2rem"
      }}>
        {frames.map((f, idx) => (
          <div key={idx} style={{
            flex: idx === 9 ? "1.5" : "1",
            borderRight: idx < 9 ? "2px solid #333" : "none",
            background: idx % 2 === 0 ? "#f8f8f8" : "#e8e8e8",
            padding: "0.5rem",
            minWidth: 60,
            textAlign: "center"
          }}>
            <div style={{ display: "flex", justifyContent: "center", gap: 2 }}>
              {/* First box */}
              <div style={boxStyle}>
                {idx === 9
                  ? (f.first === 10 ? "X" : f.first)
                  : (f.first === 10 ? "" : f.first)}
              </div>
              {/* Second box */}
              <div style={boxStyle}>
                {idx === 9
                  ? (f.second === 10
                      ? "X"
                      : (f.first !== "" && f.second !== "" && f.first !== 10 && (parseInt(f.first) + parseInt(f.second) === 10)
                        ? "/"
                        : f.second))
                  : (f.first === 10
                      ? "X"
                      : (f.first !== "" && f.second !== "" && f.first !== 10 && (parseInt(f.first) + parseInt(f.second) === 10)
                        ? "/"
                        : (f.second === 10 ? "X" : f.second)))
                }
              </div>
              {/* Third box (only for 10th frame) */}
              {idx === 9 && (
                <div style={boxStyle}>
                  {f.third === 10
                    ? "X"
                    : (f.second !== "" && f.third !== "" && f.second !== 10 && (parseInt(f.second) + parseInt(f.third) === 10)
                      ? "/"
                      : f.third)}
                </div>
              )}
            </div>
            {/* Frame score display */}
            <div style={{
              borderTop: "1px solid #aaa",
              marginTop: 4,
              fontSize: 16,
              color: "#333",
              minHeight: 22
            }}>
              {paddedFrameScores[idx] !== undefined ? paddedFrameScores[idx] : ""}
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>Frame {idx + 1}</div>
          </div>
        ))}
        {/* Total Score Box */}
        <div style={{
          flex: "1",
          background: "#d1ffd1",
          padding: "0.5rem",
          minWidth: 80,
          textAlign: "center",
          borderLeft: "2px solid #333"
        }}>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>Total</div>
          <div style={{ fontSize: 24, marginTop: 8 }}>
            {runningTotal}
          </div>
        </div>
        {/* Max Possible Score Box */}
        <div style={{
          flex: "1",
          background: "#ffe6b3",
          padding: "0.5rem",
          minWidth: 120,
          textAlign: "center",
          borderLeft: "2px solid #333"
        }}>
          <div style={{ fontWeight: "bold", fontSize: 18 }}>Max Possible</div>
          <div style={{ fontSize: 24, marginTop: 8 }}>
            {maxPossible}
          </div>
        </div>
      </div>
      {frame <= 10 ? (
        <div>
          <h2>Frame {frame} - Roll {rollInFrame}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {Array.from({ length: maxPins + 1 }, (_, i) => (
              <button
                key={i}
                style={{
                  width: 40,
                  height: 40,
                  fontSize: 18,
                  borderRadius: 6,
                  border: "1px solid #888",
                  background: "#fff",
                  cursor: "pointer"
                }}
                onClick={() => handleRoll(i)}
              >
                {i}
              </button>
            ))}
          </div>
          {message && <p style={{ color: "red" }}>{message}</p>}
        </div>
      ) : (
        <div>
          <h2>Game Over!</h2>
        </div>
      )}
    </div>
  );
}

function getMaxPossibleScore(rolls) {
  // Copy current rolls
  const simulatedRolls = [...rolls];
  // Fill the rest with strikes (10s) until we have enough for 10 frames
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

export default App;

// Constant style object so there is no need for repetition
const boxStyle = {
  border: "1px solid #aaa",
  width: 24,
  height: 24,
  margin: 2,
  display: "inline-block",
  lineHeight: "24px",
  background: "#fff"
};

