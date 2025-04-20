import React, { useState, useEffect, useMemo, useRef } from "react";
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
  const [questionList,setQuestionList]=useState([]);
  const [questionIndex,setQuestionIndex]=useState(0);
  const [mistakes, setMistakes]=useState(0);
  const [isLocked,setIsLocked]=useState(false);
  const flashRef=useRef(null);

  useEffect(()=>{
    fetch("/typing_texts.json")
    .then((res)=>res.json())
    .then((data)=>{
        setQuestionList(data);
    });
  },[]);

  const question = questionList[questionIndex]||{display:"",reading:""};
  const kanaList = useMemo(() => {
    if (!question.reading)return [];
    return parseHiraganaSmart(question.reading, kanaPatterns);
  },[question.reading]);

  useEffect(() => {
    if (!kanaList[index]||lockedRomaji[index]) return;
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
        console.log(isLocked);
        if (isLocked) {
            console.log("lockkkkkked");
            return;
        }
      const key = e.key;
      if (!/^[a-z-!?]$/.test(key)) return;
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
            const nextIndex=index+1;
          setLockedRomaji((prev) => {
            const updated = [...prev];
            updated[index] = newBuffer;
            return updated;
          });
          setIndex(nextIndex);
          setBuffer("");
          if(nextIndex===kanaList.length){
            setBuffer("");
            setIndex(0);
            setLiveCandidates([]);
            setLockedRomaji([]);
            setQuestionIndex((prev)=>(prev+1)%questionList.length);
          }

        }

      }else{
        console.log("invalid");
        setMistakes((prev)=>(prev+1));
        const box=flashRef.current;
        if(box){
            box.classList.remove("flash");
            void box.offsetWidth;
            box.classList.add("flash");
        }
        setIsLocked(true);
        setTimeout(()=>{
            setIsLocked(false);
        },100);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [buffer, index, kanaList, lockedRomaji, isLocked]);

  useEffect(() => {
    console.log("isLocked",isLocked);
},[isLocked]);

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
            <style>{`
                @keyframes flashFade{
                    0% { background-color: red; }
                    100% { background-color: #111; }
                }
                .flash{
                    animation: flashFade 0.5s ease-out;
                }
            `}</style>
            <div 
                ref={flashRef}
                className="flash-container"
                style={{
                    backgroundColor:"#111",
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
                <div style={{fontSize:"2rem",marginBottom:"1rem"}}>{questionList.length===0?"Loading...":question.display}</div>
                <div style={{fontSize:"1.5rem",letterSpacing:"0.05em"}}>{questionList.length===0?"":view}</div>
            </div>
        </div>
    );
}


