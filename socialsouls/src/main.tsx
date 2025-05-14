import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Landing from './Landing'
import Chat from './Chat'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
   <Router>
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/chat" element={<Chat />} />
  </Routes>
</Router>
  </StrictMode>,
)
