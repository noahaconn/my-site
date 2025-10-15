import { useState } from "react"
import Sidebar from './components/Sidebar.tsx'
import Home from "./components/Home.tsx";
import Topbar from "./components/Topbar.tsx";
import Bio from "./components/Bio.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CONNr from "./components/CONNr.tsx";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [connrOpen, setConnrOpen] = useState(false);

  return (
    <Router>
      <div className="flex flex-col">
        
        <Topbar></Topbar>
        <div className="flex flex-1">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}></Sidebar>
          
          {/* Main content */}
          <Routes>
            <Route path="/" element={<Home openSide={sidebarOpen} openConnr={connrOpen}/>} />
            <Route path="/bio" element={<Bio openSide={sidebarOpen} openConnr={connrOpen}/>} />
          </Routes>

          <CONNr open={connrOpen} setOpen={setConnrOpen}></CONNr>
        </div>
      </div>
    </Router>
  )
}
