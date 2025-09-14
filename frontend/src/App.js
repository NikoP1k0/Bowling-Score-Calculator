import { useState } from "react";

// Helper to get max possible score (unchanged)
function getMaxPossibleScore(rolls) {
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

const boxStyle = {
  border: "1px solid #aaa",
  width: 24,
  height: 24,
  margin: 2,
  display: "inline-block",
  lineHeight: "24px",
  background: "#fff"
};

function App() {
  const [scorecards, setScorecards] = useState([
    createEmptyScorecard(1)
  ]);
  const [nextId, setNextId] = useState(2);

  function createEmptyScorecard(id) {
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

  // Backend call for score and frameScores
  const calculateScore = async (rollsArr) => {
    const res = await fetch("http://localhost:3001/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rolls: rollsArr }),
    });
    const data = await res.json();
    return {
      score: data.score,
      frameScores: data.frameScores || []
    };
  };

  // Handle roll for a specific scorecard
  const handleRoll = (cardId, pins) => {
    setScorecards(prev =>
      prev.map(card => {
        if (card.id !== cardId) return card;
        let newRolls = [...card.rolls, pins];
        let newFrame = card.frame;
        let newRollInFrame = card.rollInFrame;
        let newFirstRollPins = card.firstRollPins;
        let newMessage = "";

        // 10th frame logic
        if (card.frame === 10) {
          if (card.rollInFrame === 1) {
            newFirstRollPins = pins;
            newRollInFrame = 2;
          } else if (card.rollInFrame === 2) {
            if (
              card.firstRollPins === 10 ||
              card.firstRollPins + pins === 10
            ) {
              newRollInFrame = 3;
            } else {
              newFrame = 11;
            }
          } else if (card.rollInFrame === 3) {
            newFrame = 11;
          }
        } else {
          // Frames 1-9
          if (card.rollInFrame === 1) {
            newFirstRollPins = pins;
            if (pins === 10) {
              newFrame = card.frame + 1;
              newRollInFrame = 1;
              newFirstRollPins = null;
            } else {
              newRollInFrame = 2;
            }
          } else if (card.rollInFrame === 2) {
            newFrame = card.frame + 1;
            newRollInFrame = 1;
            newFirstRollPins = null;
          }
        }

        // Update score and max possible asynchronously
        calculateScore(newRolls).then(({ score, frameScores }) => {
          setScorecards(cards =>
            cards.map(c =>
              c.id === cardId
                ? { ...c, score, frameScores }
                : c
            )
          );
        });
        getMaxPossibleScore(newRolls).then(maxPossible => {
          setScorecards(cards =>
            cards.map(c =>
              c.id === cardId
                ? { ...c, maxPossible }
                : c
            )
          );
        });

        return {
          ...card,
          rolls: newRolls,
          frame: newFrame,
          rollInFrame: newRollInFrame,
          firstRollPins: newFirstRollPins,
          message: newMessage
        };
      })
    );
  };

  // Add a new scorecard (up to 6)
  const addScorecard = () => {
    if (scorecards.length < 6) {
      setScorecards([...scorecards, createEmptyScorecard(nextId)]);
      setNextId(nextId + 1);
    }
  };

  // Delete a scorecard with confirmation
  const deleteScorecard = (id) => {
    if (window.confirm("Are you sure you want to delete this scorecard? This action cannot be undone.")) {
      setScorecards(scorecards.filter(card => card.id !== id));
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Bowling Score Card Calculator 🎳</h1>
      <button
        onClick={addScorecard}
        disabled={scorecards.length >= 6}
        style={{ marginBottom: 24, fontSize: 18, padding: "0.5rem 1rem" }}
      >
        Add Scorecard
      </button>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 32 }}>
        {scorecards.map((card, cardIdx) => {
          // Prepare frame data for display
          const frames = [];
          let rollIndex = 0;
          for (let i = 0; i < 10; i++) {
            let first = card.rolls[rollIndex] !== undefined ? card.rolls[rollIndex] : "";
            let second = "";
            let third = "";
            if (i < 9) {
              if (first === 10) {
                second = "";
                rollIndex += 1;
              } else {
                second = card.rolls[rollIndex + 1] !== undefined ? card.rolls[rollIndex + 1] : "";
                rollIndex += 2;
              }
            } else {
              // 10th frame
              second = card.rolls[rollIndex + 1] !== undefined ? card.rolls[rollIndex + 1] : "";
              third = card.rolls[rollIndex + 2] !== undefined ? card.rolls[rollIndex + 2] : "";
              rollIndex += 3;
            }
            frames.push({ first, second, third });
          }

          // Only include frames that are actually complete (score is not undefined)
          const frameScores = card.frameScores || [];
          const paddedFrameScores = Array.from({ length: 10 }, (_, i) => frameScores[i]);
          const runningTotal = (() => {
            for (let i = frameScores.length - 1; i >= 0; i--) {
              if (typeof frameScores[i] === "number") return frameScores[i];
            }
            return 0;
          })();

          // Determine available options for current roll
          let maxPins = 10;
          if (card.frame <= 10 && card.rollInFrame === 2 && card.firstRollPins !== null) {
            maxPins = card.frame === 10 && card.firstRollPins === 10 ? 10 : 10 - card.firstRollPins;
          }
          if (card.frame === 10 && card.rollInFrame === 3) {
            maxPins = 10;
          }

          return (
            <div key={card.id} style={{
              minWidth: 900,
              border: "2px solid #333",
              borderRadius: "8px",
              padding: 16,
              marginBottom: 24,
              background: "#f9f9f9"
            }}>
              <div style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 8,
  minHeight: 40
}}>
  <div>
    {card.editingName ? (
      <input
        type="text"
        value={card.name}
        autoFocus
        maxLength={50}
        onChange={e => {
          const newName = e.target.value.slice(0, 50);
          setScorecards(scorecards =>
            scorecards.map(c =>
              c.id === card.id ? { ...c, name: newName } : c
            )
          );
        }}
        onBlur={() => {
          setScorecards(scorecards =>
            scorecards.map(c =>
              c.id === card.id ? { ...c, editingName: false } : c
            )
          );
        }}
        onKeyDown={e => {
          if (e.key === "Enter" || e.key === "Escape") {
            setScorecards(scorecards =>
              scorecards.map(c =>
                c.id === card.id ? { ...c, editingName: false } : c
              )
            );
          }
        }}
        style={{ fontSize: 20, marginRight: 8, width: 120 }}
      />
    ) : (
      <h2 style={{ margin: 0, cursor: "pointer" }} onClick={() => {
        setScorecards(scorecards =>
          scorecards.map(c =>
            c.id === card.id ? { ...c, editingName: true } : c
          )
        );
      }}>
        {card.name}
      </h2>
    )}
  </div>
  <div style={{ display: "flex", gap: 8 }}>
    {!card.editingName && (
      <button
        style={{ fontSize: 14 }}
        onClick={() => {
          setScorecards(scorecards =>
            scorecards.map(c =>
              c.id === card.id ? { ...c, editingName: true } : c
            )
          );
        }}
      >
        Rename
      </button>
    )}
    <button
      style={{ color: "red", fontWeight: "bold", fontSize: 14 }}
      onClick={() => deleteScorecard(card.id)}
    >
      Delete
    </button>
  </div>
</div>
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
                    {card.maxPossible}
                  </div>
                </div>
              </div>
              {card.frame <= 10 ? (
                <div>
                  <h3>Frame {card.frame} - Roll {card.rollInFrame}</h3>
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
                        onClick={() => handleRoll(card.id, i)}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                  {card.message && <p style={{ color: "red" }}>{card.message}</p>}
                </div>
              ) : (
                <div>
                  <h3>Game Over!</h3>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;

