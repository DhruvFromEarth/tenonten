import "../App.css";
import { Link } from "react-router-dom";
import logo from "../assets/logo-small-image.png";

const Navbar = ({ isCollapsed }) => {
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
      <Link className="account-btn" to="#">👤 Account</Link>
    </nav>
  );
};

export default Navbar;
