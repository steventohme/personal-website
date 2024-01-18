import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import React from 'react'
import Home from "./pages/Home"
import './styles.css'

export default function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
        </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(<App />)
