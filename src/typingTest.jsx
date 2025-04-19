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
      //console.log("currentKana",currentKana);
      //console.log("candidates",kanaPatterns[currentKana]||[]);
      //console.log("newBuffer",newBuffer);


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
//console.log("🟣 kanaList:", kanaList);
//console.log("🔵 lockedRomaji:", lockedRomaji);
//console.log("[] confirmed",lockedRomaji.join("")+buffer)
//console.log("🟡 buffer:", buffer);
//console.log("🟠 liveCandidates:", liveCandidates);


  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>{question.display}</h2>

      <div style={{ fontSize: "1.5rem", marginTop: "1rem" }}>
        {(() => {
          const view = [];
          for (let i = 0; i < kanaList.length; i++) {
            const kana = kanaList[i];
            const pattern = lockedRomaji[i] || liveCandidates[i]?.[0] || kanaPatterns[kana]?.[0] || "";

            for (let j = 0; j < pattern.length; j++) {
                let color = "#fff";

                if (i < index) {
                    color = "#777"; // 完了
                } else if (i === index) {
                    if (j < buffer.length) {
                        color = "#777"; // 入力中
                    } else if (j === buffer.length) {
                        color = "#0f0"; // 次に打つ文字
                    }
                }
                view.push(
                <span key={`${i}-${j}`} style={{ color }}>
                    {pattern[j]}
                </span>
                );
            }
        }
          return view;
        })()}
      </div>
    </div>
  );
}
