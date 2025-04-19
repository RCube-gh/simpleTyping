import React, { useState } from "react";
import kanaPatterns from "./kanaPatterns"


function parseHiraganaSmart(text, kanaDict) {
  const result = [];
  let i = 0;
  while (i < text.length) {
    let matched = null;
    // 最大3文字の前方最長一致をチェック
    for (let j = Math.min(text.length, i + 3); j > i; j--) {
      const chunk = text.slice(i, j);
      if (kanaDict[chunk]) {
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

export default function KanaParserTest() {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState([]);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
    const result = parseHiraganaSmart(value, kanaPatterns);
    setParsed(result);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h2>Kana Parser Test(Longest prefix match ver)</h2>
      <textarea
        rows="3"
        style={{ width: "100%", fontSize: "1.2rem" }}
        placeholder="Input Hiragana Text"
        value={input}
        onChange={handleChange}
      />
      <div style={{ marginTop: "1rem" }}>
        <strong>Result:</strong>
        <div style={{ marginTop: "0.5rem", fontSize: "1.2rem" }}>
          {parsed.map((kana, i) => (
            <span key={i} style={{ marginRight: "0.5rem" }}>[{kana}]</span>
          ))}
        </div>
      </div>
    </div>
  );
}
