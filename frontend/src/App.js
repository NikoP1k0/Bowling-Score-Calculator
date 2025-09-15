import { useState } from "react";
import { getMaxPossibleScore, createEmptyScorecard } from "./bowlingUtils";
import Scorecard from "./Scorecard";


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

  // Rename handler:
  const handleRename = (cardId, newName, finish = false, start = false) => {
    setScorecards(scorecards =>
      scorecards.map(c =>
        c.id === cardId
          ? {
              ...c,
              name: newName.slice(0, 50),
              editingName: start ? true : finish ? false : c.editingName
            }
          : c
      )
    );
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
        {scorecards.map(card => (
          <Scorecard
            key={card.id}
            card={card}
            onRoll={handleRoll}
            onRename={handleRename}
            onDelete={deleteScorecard}
          />
        ))}
      </div>
    </div>
  );
}

export default App;

