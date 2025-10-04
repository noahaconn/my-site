import { useState } from "react"
import ChatInput from './components/ChatInput'
import Sidebar from './components/Sidebar.tsx'
import WelcomePage from "./components/WelcomePage.tsx";
import Topbar from "./components/Topbar.tsx";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex flex-col">
      <Topbar></Topbar>
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}></Sidebar>
        <WelcomePage open={sidebarOpen}></WelcomePage>
      </div>
    </div>
    
  )
}
