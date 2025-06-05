import "../App.css";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import React from 'react';
import axios from "../providers/axios";

export const AuthModal = ({ showModal, setShowModal, isLoggedIn, setIsLoggedIn }) => {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSignedUp, setIsSignedUp] = useState(true);
  const [isCreateOrg, setIsCreateOrg] = useState(false);
  const [isJoinOrg, setIsJoinOrg] = useState(false);
  const [organisations, setOrganisations] = useState([]);
  const [newOrgName, setNewOrgName] = useState('');
  const [joinOrganisationName, setJoinOrganisationName] = useState('');
  const [showJoinOrganisation, setShowJoinOrganisation] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      fetchUserOrganisations();
    }
  }, [isLoggedIn]);

  const fetchUserOrganisations = async () => {
    try {
      const response = await axios.get('/org/organisations', {
        withCredentials: true
      });
      console.log('Fetched organisations:', response.data); // Debug log
      setOrganisations(response.data || []);
    } catch (error) {
      console.error('Error fetching organisations:', error);
      if (error.response?.status === 403) {
        // Handle authentication error
        setIsLoggedIn(false);
        localStorage.removeItem('userName');
      }
    }
  };

  const handelSignUpSubmit = async () => {
    setIsSignedUp(false);
    try {
      const response = await axios.post('/user/create-user', {
        userName: usernameInput,
        password: passwordInput
      },
        {
          withCredentials: true,
        }
      );

      localStorage.setItem('userName', usernameInput);
      setIsLoggedIn(true);
      setShowModal(false);

    } catch (error) {
      console.error('Error signing up:', error.response.data.message);
      alert('Error Signing Up: ' + error.response.data.message);
    }
  }

  const handelLoginSubmit = async () => {
    setIsSignedUp(true);
    try {
      const response = await axios.post('/user/login', {
        userName: usernameInput,
        password: passwordInput
      });
      localStorage.setItem('userName', usernameInput);
      setIsLoggedIn(true);
      setShowModal(false);

    } catch (error) {
      alert('Error Logging In: ' + error.response.data.message);
      console.error('Error logging in:', error, error.response.data.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setShowModal(false);
  };

  const createOrganisation = async () => {
    try {
      if (!newOrgName) {
        alert('Please enter organisation name');
        return;
      }

      const response = await axios.post('/org/create', {
        organisationName: newOrgName,
        userId: localStorage.getItem('userName')
      }, {
        withCredentials: true
      });

      alert('Organisation created successfully!');
      setNewOrgName('');
      setIsCreateOrg(false);
      if (isLoggedIn) {
        fetchUserOrganisations();
      }
      setShowModal(false);

    } catch (error) {
      console.error('Error creating organisation:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create organisation';
      alert('Error creating organisation: ' + errorMessage);
    }
  };

  const joinOrganisation = async () => {
    try {
      if (!newOrgName) {
        alert('Please enter organisation name');
        return;
      }

      const response = await axios.post('/org/join', {
        organisationName: newOrgName
      }, {
        withCredentials: true
      });

      alert('Joined organisation successfully!');
      setNewOrgName('');
      setIsJoinOrg(false);
      if (isLoggedIn) {
        fetchUserOrganisations();
      }
      setShowModal(false);

    } catch (error) {
      console.error('Error joining organisation:', error);
      alert('Error joining organisation: ' + error.response?.data?.message || 'Unknown error');
    }
  };

  const handleJoinOrganisation = async (e) => {
    e.preventDefault();
    try {
      if (!joinOrganisationName) {
        setError('Please enter organisation name');
        return;
      }

      const response = await axios.post('/org/join-request', {
        organisationName: joinOrganisationName
      });

      setJoinOrganisationName('');
      setShowJoinOrganisation(false);
      setMessage(response.data.message);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send join request');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <>
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{isLoggedIn ? `Hi, ${localStorage.getItem('userName')}!` : isSignedUp ? 'Login :' : 'SignUp :'}</h3>
            {!isLoggedIn && (
              <form className="modal-form">
                <input
                  required
                  autoFocus
                  type="text"
                  placeholder="Username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                />
                <input
                  required
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handelLoginSubmit();
                    }
                  }}
                />
              </form>
            )}
            {isLoggedIn && (
              <div className="organisation-box">
                <div className="organisation-header">
                  <h3>Organisations</h3>
                  <div className="org-actions">
                    <button onClick={() => {
                      setShowJoinOrganisation(!showJoinOrganisation);
                      setIsCreateOrg(false);
                    }}>Join</button>
                    <button onClick={() => {
                      setIsCreateOrg(!isCreateOrg);
                      setShowJoinOrganisation(false);
                    }}>Create</button>
                  </div>
                </div>

                {showJoinOrganisation && (
                  <div className="create-org-form">
                    <input
                      type="text"
                      placeholder="Enter organisation name"
                      value={joinOrganisationName}
                      onChange={(e) => setJoinOrganisationName(e.target.value)}
                    />
                    <button onClick={handleJoinOrganisation}>Send Request</button>
                  </div>
                )}

                {isCreateOrg && (
                  <div className="create-org-form">
                    <input
                      type="text"
                      placeholder="Enter organisation name"
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                    />
                    <button onClick={createOrganisation}>Create</button>
                  </div>
                )}

                {message && <div className="success-message">{message}</div>}
                {error && <div className="error-message">{error}</div>}

                <div className="organisations-list">
                  {organisations.map((org, index) => (
                    <button
                      key={index}
                      className="organisation-item"
                      onClick={() => {
                        if (org.organisationName) {
                          localStorage.setItem('selectedOrganisation', org.organisationName);
                          window.location.reload();
                          setShowModal(false);
                        }
                      }}
                    >
                      {org.organisationName} {org.position ? `(${org.position})` : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="modal-actions-area">
              {isLoggedIn ? (
                <div></div>
              ) : (isSignedUp ?
                (<Link onClick={() => setIsSignedUp(false)}>Make New Account</Link>) :
                (<Link onClick={() => setIsSignedUp(true)}>Already have Account?</Link>)
              )}
              <div className="modal-actions">
                {isLoggedIn ? (
                  <button onClick={handleLogout}>Logout</button>
                ) : isSignedUp ? (
                  <button onClick={() => handelLoginSubmit()}>Submit</button>
                ) : (
                  <button onClick={() => handelSignUpSubmit()}>Submit</button>
                )}
                <button onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


// import "../App.css";
// import "./Navbar.css";
// import { Link } from "react-router-dom";
// import { useContext, useEffect, useRef, useState } from "react";
// import { ThemeContext } from "../context/ThemeContext";
// import React from 'react'

// export const AuthModal = ({showModalRef , isLoggedInRef}) => {

//   const [usernameInput, setUsernameInput] = useState(''); // Use state for input value
//   const usernameRef = useRef('');
//   const modalInputRef = useRef(null);


//   const handleNameSubmit = (name) => {
//     if (name) {
//       usernameRef.current = name;
//       localStorage.setItem('userName', name);
//       isLoggedInRef = true;
//       showModalRef = false;
//       setUsernameInput(''); // Clear input after submission
//     }
//   };

//   const handleLogout = () => {
//     localStorage.removeItem('userName');
//     usernameRef.current = '';
//     isLoggedInRef = false;
//     showModalRef = false;
//   };

//   return (
//     <div>{showModalRef && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <h3>{isLoggedInRef ? `Hi , ${usernameRef.current}!` : 'Enter a unique user name :'}</h3>
//             {!isLoggedInRef && (
//               <form className="modal-form">
//                 <input
//                   type="text"
//                   placeholder="Enter your userName"
//                   value={usernameInput} // Bind input value to state
//                   onChange={(e) => setUsernameInput(e.target.value)} // Update state on change
//                   ref={modalInputRef} // Assign ref to input
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') {
//                       handleNameSubmit(usernameInput); // Use state value
//                     }
//                   }}
//                 />
//                 <input //TODO
//                   type="password"
//                   placeholder="Password"
//                   // value={usernameInput} // Bind input value to state
//                   onChange={(e) => setUsernameInput(e.target.value)} // Update state on change
//                   ref={modalInputRef} // Assign ref to input
//                   onKeyDown={(e) => {
//                     if (e.key === 'Enter') {
//                       handleNameSubmit(usernameInput); // Use state value
//                     }
//                   }}
//                 />
//               </form>
//             )}
//             <div className="modal-actions">
//               {isLoggedInRef ? (
//                 <button onClick={handleLogout}>Logout</button>
//               ) : (
//                 <button onClick={() => handleNameSubmit(usernameInput)}>Submit</button> // Use state value
//               )}
//               <button onClick={() => showModalRef = false}>Close</button>
//             </div>
//           </div>
//         </div>
//     )}
//     </div>
//   )
// }
