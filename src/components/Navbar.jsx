import "../App.css";
import { Link } from "react-router-dom";
import logo from "../assets/logo-small-image.png";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = ({ isCollapsed }) => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <nav className={`navbar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="logo-container">
        <Link to="/">
          <img src={logo} alt="Logo" className="logo" />
        </Link>
      </div>
      <div className="search-container">
        <input type="text" placeholder="Search..." className="search-bar" />
      </div>
      <div className="navbar-actions">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>
        <Link className="account-btn" to="#">👤 Account</Link>
      </div>
    </nav>
  );
};

export default Navbar;
