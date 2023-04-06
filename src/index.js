import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import React from 'react'
import Home from "./pages/Home"
import Info from "./pages/Info"
import './styles.css'

export default function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/info" element={<Info />} />
        </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
