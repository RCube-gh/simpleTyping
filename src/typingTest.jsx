import React, { useState, useEffect } from "react";
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
    display: "けんかりょうせいばいおこったかんなんにょー",
    reading: "けんかりょうせいばいおこったかんなんにょー"
  };

  const kanaList = parseHiraganaSmart(question.reading, kanaPatterns);

  useEffect(() => {
    const currentKana = kanaList[index];
    const candidates = kanaPatterns[currentKana] || [];
    setLiveCandidates(prev => {
      const newList = [...prev];
      newList[index] = candidates;
      return newList;
    });
  }, [index]);

  useEffect(() => {
    const handler = (e) => {
      const key = e.key;
      const currentKana = kanaList[index];
      const candidates = kanaPatterns[currentKana] || [];
      const newBuffer = buffer + key;

      const valid = candidates.filter(p => p.startsWith(newBuffer));

      if (valid.length > 0) {
        setBuffer(newBuffer);
        setLiveCandidates(prev => {
          const updated = [...prev];
          updated[index] = valid;
          return updated;
        });

        if (valid.length === 1) {
          setLockedRomaji(prev => {
            const updated = [...prev];
            updated[index] = valid[0];
            return updated;
          });
        }

        if (valid.includes(newBuffer)) {
          setIndex(index + 1);
          setBuffer("");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [buffer, index, kanaList]);

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>{question.display}</h2>
      <div style={{ fontSize: "1.5rem", marginTop: "1rem" }}>
        {kanaList.map((kana, i) => {
          const isDone = i < index;
          const isCurrent = i === index;
          const color = isDone ? "#ccc" : isCurrent ? "#0f0" : "#fff";

          const displayRomaji =
            lockedRomaji[i] ||
            liveCandidates[i]?.[0] ||
            kanaPatterns[kana]?.[0] || "";

          return (
            <span key={i} style={{ color, marginRight: "0.3rem" }}>
              {displayRomaji}
            </span>
          );
        })}
      </div>
    </div>
  );
}
