import { useState, useEffect, useRef } from "react";

const kanaList = ["ちゅ", "う", "ちょ"];
const displayRomaji = "chuutyo";
const kanaPatterns = {
  "ちゅ": ["chu", "tyu"],
  "う": ["u"],
  "ちょ": ["cho", "tyo"]
};

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedLength, setTypedLength] = useState(0);
  const [lockedPattern, setLockedPattern] = useState(null);
  const [buffer, setBuffer] = useState("");
  const bufferRef = useRef("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if (!/^[a-z]$/.test(key)) return;

      const newBuffer = bufferRef.current + key;
      const currentKana = kanaList[currentIndex];
      const patterns = kanaPatterns[currentKana] || [currentKana];
      const candidates = (lockedPattern ? [lockedPattern] : patterns)
        .filter((p) => p.startsWith(newBuffer));

      console.log("currentKana:", currentKana);
      console.log("buffer:", bufferRef.current, "→", newBuffer);
      console.log("patterns:", patterns);
      console.log("candidates:", candidates);

      if (candidates.length === 0) {
        bufferRef.current = "";
        setBuffer("");
        setLockedPattern(null);
        return;
      }
      setTypedLength(prev=>prev+1);

      if (candidates.length === 1 && !lockedPattern) {
        setLockedPattern(candidates[0]);
      }

      if ((lockedPattern||candidates[0]) === newBuffer) {
        // 完全一致 → 確定！
        console.log("ACCEPTED:", lockedPattern||candidates[0]);
        setCurrentIndex((prev) => prev + 1);
        bufferRef.current = "";
        setBuffer("");
        setLockedPattern(null);
      } else {
        bufferRef.current = newBuffer;
        setBuffer(newBuffer);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, lockedPattern]);

  return (
    <div
      style={{
        backgroundColor: "#ffffaa",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "monospace"
      }}
    >
      <div
        style={{
          backgroundColor: "#111",
          color: "#fff",
          border: "4px solid #fff",
          width: "80%",
          maxWidth: "600px",
          height: "80%",
          maxHeight: "600px",
          padding: "2rem 3rem",
          borderRadius: "2rem",
          textAlign: "center",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)"
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
          {kanaList.map((kana, i) => (
            <span
              key={i}
              style={{
                color:
                  i < currentIndex
                    ? "#fff"
                    : i === currentIndex
                    ? "#0f0"
                    : "#888",
                textDecoration: i === currentIndex ? "underline" : "none",
                marginRight: "0.25em"
              }}
            >
              {kana}
            </span>
          ))}
        </div>

        <div
          style={{
            fontSize: "1.5rem",
            letterSpacing: "0.05em"
          }}
        >
          {displayRomaji.split("").map((char, i) => (
            <span key={i} style={{ color: i < typedLength ? "#888" : "#fff" }}>
              {char}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
