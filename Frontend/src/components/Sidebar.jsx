import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../App.css";
import axios from "../providers/axios";

const Sidebar = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const selectedOrg = localStorage.getItem('selectedOrganisation');
        if (!selectedOrg) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const response = await axios.post('/org/check-admin', {
          organisationName: selectedOrg
        });
        setIsAdmin(response.data.isAdmin);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  return (
    //collapsed class not needed now.
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>

      <button onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? "≡" : "Menu"}
      </button>

      <nav>
        {isCollapsed ? (
          <>
            <Link to="/">🏠</Link>
            <Link to="/whiteboard">📝</Link>
            <Link to="/Chats">💬</Link>
            {!loading && isAdmin && <Link to="/admin">👑</Link>}
          </>
        ) : (
          <>
            <Link to="/">🏠 Home</Link>
            <Link to="/whiteboard">📝 Whiteboard</Link>
            <Link to="/Chats">💬 Chats</Link>
            {!loading && isAdmin && <Link to="/admin">👑 Admin</Link>}
          </>
        )}
      </nav>

    </div>
  );
};

// export const isCollapsed;
export default Sidebar;