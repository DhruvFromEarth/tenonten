import "../App.css";
import "./Navbar.css";
import { AuthModal } from "./AuthModal";
import { Link } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";

const Navbar = ({ isCollapsed }) => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const usernameRef = useRef('');
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!isInitializedRef.current) {
      const savedUsername = localStorage.getItem('userName');
      if (savedUsername) {
        usernameRef.current = savedUsername;
        setIsLoggedIn(true);
      }
      isInitializedRef.current = true;
    }
  }, []);

  // useEffect(() => {
  //   if (showModal && modalInputRef.current) {
  //     modalInputRef.current.focus();
  //   }
  // }, [showModal]);

  return (
    <nav className={`navbar ${isCollapsed ? "collapsed" :""}`}>
      <div className="logo-container">
        <Link to="/" className="logo">
          TenOnTen
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
        <div>
          <Link className="account-btn" to="#" onClick={() => setShowModal(!showModal)}>
            {/* 👤 {isLoggedIn ? usernameRef.current : 'Log In'} */}
            👤 {isLoggedIn ? localStorage.getItem('userName') : 'Log In'}
          </Link>
        </div>
      </div>

      <AuthModal 
        showModal={showModal} 
        setShowModal={setShowModal} 
        isLoggedIn={isLoggedIn} 
        setIsLoggedIn={setIsLoggedIn} 
      />
    </nav>
  );
};

export default Navbar;


// import "../App.css";
// import "./Navbar.css";
// import { AuthModal } from "./AuthModal";
// import { Link } from "react-router-dom";
// import { useContext, useEffect, useRef, useState } from "react";
// import { ThemeContext } from "../context/ThemeContext";

// const Navbar = ({ isCollapsed }) => {
//   const { isDarkMode, toggleTheme } = useContext(ThemeContext);
//   const isLoggedInRef = useRef(false);
//   const showModalRef = useRef(false);
//   const usernameRef = useRef('');
//   const modalInputRef = useRef(null); // Ref for the modal input
//   const isInitializedRef = useRef(false);

//   useEffect(() => {
//     if (!isInitializedRef.current) {
//       const savedUsername = localStorage.getItem('userName');
//       if (savedUsername) {
//         usernameRef.current = savedUsername;
//         isLoggedInRef.current = true;
//       }
//       isInitializedRef.current = true;
//     }
//   }, []);

//   // const handleAccountClick = () => {
//   //   showModalRef.current = true;
//   // };

//   useEffect(() => {
//     if (showModalRef.current && modalInputRef.current) {
//       modalInputRef.current.focus();
//     }
//   }, [showModalRef.current]);

//   return (
//     <nav className={`navbar ${isCollapsed ? "collapsed" : ""}`}>
//       <div className="logo-container">
//         <Link to="/" className="logo">
//           TenOnTen
//         </Link>
//       </div>
//       <div className="search-container">
//         <input type="text" placeholder="Search..." className="search-bar" />
//       </div>
//       <div className="navbar-actions">
//         <button 
//           className="theme-toggle" 
//           onClick={toggleTheme}
//           aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
//         >
//           {isDarkMode ? "☀️" : "🌙"}
//         </button>
//         <div>
//           <Link className="account-btn" to="#" onClick={() => { showModalRef.current = !showModalRef.current}}>
//             👤 {isLoggedInRef.current ? usernameRef.current : 'Log In'}
//           </Link>
//         </div>
//       </div>

//       <AuthModal showModalRef={showModalRef.current} isLoggedInRef={isLoggedInRef.current}/>
      
//     </nav>
//   );
// };

// export default Navbar;