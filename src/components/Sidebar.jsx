import { Link } from "react-router-dom";
import { useState } from "react";
import "../App.css";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>

      <button onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? "≡" : "Menu"}
      </button>

      <nav>
      {isCollapsed ?  <>
        <Link to="/">🏠</Link>
        <Link to="/whiteboard">🖍️</Link>
        <Link to="/dashboard">📊</Link>
        </>:<>
        <Link to="/">🏠 Home</Link>
        <Link to="/whiteboard">🖍️ Whiteboard</Link>
        <Link to="/dashboard">📊 Dashboard</Link>
        </> }
      </nav>

    </div>
  );
};

// export const isCollapsed;
export default Sidebar;