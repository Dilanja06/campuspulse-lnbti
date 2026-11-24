import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

export const NavBar: React.FC = () => (
  <nav className="navbar">
    <Link to="/home">Home</Link>
    <Link to="/events">Explore</Link>
    <Link to="/my-registrations">My Registrations</Link>
    <Link to="/my-badges">My Badges</Link>
    <Link to="/my-qr">My QR</Link>
  </nav>
);
