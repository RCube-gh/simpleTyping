import React, { useState, useEffect, useMemo } from "react";
import kanaPatterns from "./kanaPatterns";

function parseHiraganaSmart(text, dict) {
  const result = [];
  let i = 0;
  while (i < text.length) {
    let matched = null;
    for (let j = Math.min(text.length, i + 3); j > i; j--) {
      const chunk = text.slice(i, j);
      if (dict[chunk]) {
        matched = chunk;
        break;
      }
    }
    if (matched) {
      result.push(matched);
      i += matched.length;
    } else {
      result.push(text[i]);
      i++;
    }
  }
  return result;
}

export default function TypingTest() {
  const [buffer, setBuffer] = useState("");
  const [index, setIndex] = useState(0);
  const [liveCandidates, setLiveCandidates] = useState([]);
  const [lockedRomaji, setLockedRomaji] = useState([]);

  const question = {
    display: "しゅうりょうんぎゃ",
    reading: "しゅうりょうんぎゃ"
  };

  const kanaList = useMemo(() => parseHiraganaSmart(question.reading, kanaPatterns), [question.reading]);

  useEffect(() => {
    if (lockedRomaji[index]) return;
    const currentKana = kanaList[index];
    const candidates = kanaPatterns[currentKana] || [];
    setLiveCandidates((prev) => {
      const newList = [...prev];
      newList[index] = candidates;
      return newList;
    });
  }, [index, kanaList, lockedRomaji]);

  useEffect(() => {
    const handler = (e) => {
      const key = e.key;
      if (!/^[a-z]$/.test(key)) return;
      if(index>=kanaList.length)return;

      const currentKana = kanaList[index];
      const candidates = kanaPatterns[currentKana] || [];
      const newBuffer = buffer + key;


      const valid = candidates.filter((p) => p.startsWith(newBuffer));

      if (valid.length > 0) {
        setBuffer(newBuffer);
        setLiveCandidates((prev) => {
          const updated = [...prev];
          updated[index] = valid;
          return updated;
        });

        if (valid.length === 1) {
          setLockedRomaji((prev) => {
            const updated = [...prev];
            updated[index] = valid[0];
            return updated;
          });
        }

        if (valid.includes(newBuffer)) {
          setLockedRomaji((prev) => {
            const updated = [...prev];
            updated[index] = newBuffer;
            return updated;
          });
          setIndex((prev) => prev + 1);
          setBuffer("");
        }

      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [buffer, index, kanaList, lockedRomaji]);


    const view = kanaList.flatMap((kana, i) => {
        const pattern =
        lockedRomaji[i] ||
        liveCandidates[i]?.[0] ||
        kanaPatterns[kana]?.[0] ||
        "";

        return [...pattern].map((char, j) => {
        let color = "#fff";
        if (i < index) {
            color = "#777";
        } else if (i === index) {
            if (j < buffer.length) {
            color = "#777";
            } else if (j === buffer.length) {
            color = "#0f0";
            }
        }

        return (
            <span key={`${i}-${j}`} style={{ color }}>
            {char}
            </span>
        );
        });
    });

    return (
        <div style={{
                backgroundColor: "#ffffaa",
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: "monospace"
        }}>
            <div style={{
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
            }}>
                <div style={{fontSize:"2rem",marginBottom:"1rem"}}>{question.display}</div>
                <div style={{fontSize:"1.5rem",letterSpacing:"0.05em"}}>{view}</div>
            </div>
        </div>
    );
}


