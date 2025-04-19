import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import TypingDFA from './TypingDFA.jsx'
import KanaParser from './KanaParserTest.jsx'
import TypingTest from './typingTest.jsx'
import KanaParserTest from './KanaParserTest.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
