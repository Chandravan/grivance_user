import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";


import "./Navbar.css";

const Navbar = ({ user, isAdmin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Grievance Portal
        </Link>

        <div className="menu-icon" onClick={toggleMobileMenu}>
          <i className={mobileMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>

        <ul className={mobileMenuOpen ? "nav-menu active" : "nav-menu"}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
          </li>
          
          
          
          <li className="nav-item">
            <Link to="/track-grievance" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
              Track Grievance
            </Link>
          </li>
          
         

         

          {user ? (
            <>
              <li className="nav-item">
                <span className="nav-user">
                  Hello, {user.displayName || user.email}
                </span>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-button">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;