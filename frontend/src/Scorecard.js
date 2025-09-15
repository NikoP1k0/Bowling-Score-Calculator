import React from "react";

const boxStyle = {
  border: "1px solid #aaa",
  width: 24,
  height: 24,
  margin: 2,
  display: "inline-block",
  lineHeight: "24px",
  background: "#fff"
};

export default function Scorecard({
  card,
  onRoll,
  onRename,
  onDelete
}) {
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
    <div style={{
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
              onChange={e => onRename(card.id, e.target.value)}
              onBlur={() => onRename(card.id, card.name, true)}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === "Escape") {
                  onRename(card.id, card.name, true);
                }
              }}
              style={{ fontSize: 20, marginRight: 8, width: 120 }}
            />
          ) : (
            <h2 style={{ margin: 0, cursor: "pointer" }} onClick={() => onRename(card.id, card.name, false, true)}>
              {card.name}
            </h2>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!card.editingName && (
            <button
              style={{ fontSize: 14 }}
              onClick={() => onRename(card.id, card.name, false, true)}
            >
              Rename
            </button>
          )}
          <button
            style={{ color: "red", fontWeight: "bold", fontSize: 14 }}
            onClick={() => onDelete(card.id)}
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
                onClick={() => onRoll(card.id, i)}
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
}