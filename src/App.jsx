import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Whiteboard from "./pages/Whiteboard";
import Dashboard from "./pages/Dashboard";
import "./App.css";
// import { useState } from "react";

function App() {
  // const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content-container">
          <Sidebar />
          {/* <main className={`main-container ${isCollapsed ? "" : "expanded"}`}> */}
          <main className="main-container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/whiteboard" element={<Whiteboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;