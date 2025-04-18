import {useEffect, useState } from "react";
const dfa={
    start: {c:"c",t:"t"},
    c:{h:"ch"},
    ch:{i:"accept"},
    t:{i:"accept"},
    accept:{}
};
export default function App(){
    const [kana,setKana]=useState("");
    const [buffer,setBuffer]=useState("");
    const [state,setState]=useState("");

    useEffect(()=>{
        const handleKeyDown=(e)=>{
            const key=e.key;
            if(!/^[a-z]$/.test(key)) return;
            const nextState=dfa[state]?.[key];
            if(nextState){
                setBuffer((prev)=>prev+key);
                setState(nextState);
                if(nextState==="accept"){
                    setKana((prev)=>prev+"ち");
                    setBuffer("");
                    setState("start");
                }
            }else{
                setBuffer("");
                setState("start");
            }
        };
        window.addEventListener("keydown",handleKeyDown);
        return ()=> window.removeEventListener("keydown",handleKeyDown);
    },[state]);
    return (
    <div style={{
      backgroundColor: "#111",
      color: "#fff",
      fontFamily: "monospace",
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "2rem",
    }}>
      <div>
        <div style={{ marginBottom: "1rem" }}>📝 Kana Output:</div>
        <div>{kana}</div>
        <div style={{ marginTop: "1rem", color: "#888", fontSize: "1rem" }}>
          Buffer: {buffer} | State: {state}
        </div>
      </div>
    </div>
  );
}