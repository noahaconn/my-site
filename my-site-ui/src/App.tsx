import { useState } from "react"
import SidebarWeb from './components/web/SidebarWeb.tsx'
import Home from "./components/pages/Home.tsx";
import Topbar from "./components/Topbar.tsx";
import Bio from "./components/pages/Bio.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CONNrWeb from "./components/web/CONNrWeb.tsx";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [connrOpen, setConnrOpen] = useState(false);

  return (
    <Router>
      <div className="flex flex-col bg-white dark:bg-gray-900">
        
        <Topbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} connrOpen={connrOpen} setConnrOpen={setConnrOpen}></Topbar>
        <div className="flex flex-1">
          
          <SidebarWeb open={sidebarOpen} setOpen={setSidebarOpen}></SidebarWeb>
          
          {/* Main content */}
          <Routes>
            <Route path="/" element={<Home openSide={sidebarOpen} openConnr={connrOpen}/>} />
            <Route path="/bio" element={<Bio openSide={sidebarOpen} openConnr={connrOpen}/>} />
          </Routes>

          <CONNrWeb open={connrOpen} setOpen={setConnrOpen}></CONNrWeb>
        
        </div>
      </div>
    </Router>
  )
}
