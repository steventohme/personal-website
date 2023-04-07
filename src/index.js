import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import React from 'react'
import Home from "./pages/Home"
import Intro from "./pages/Intro"
import './styles.css'

export default function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/intro" element={<Intro />} />
        </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
