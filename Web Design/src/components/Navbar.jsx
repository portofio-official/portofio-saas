import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section');
      let current = '';

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        // Cek jika posisi scroll saat ini berada di dalam area section
        if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
          current = section.getAttribute('id');
        }
      });

      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Panggil sekali saat pertama load
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <a href="#home" className="logo-link">
          <img src="/logo.png" alt="Portofio Logo" className="logo-img" />
        </a>
        <div className="nav-links">
          <a href="#home" data-text="Home" className={activeSection === 'home' ? 'active' : ''}>Home</a>
          <a href="#templates" data-text="Templates" className={activeSection === 'templates' ? 'active' : ''}>Templates</a>
          <a href="#pricing" data-text="Pricing" className={activeSection === 'pricing' ? 'active' : ''}>Pricing</a>
        </div>

        {/* Profile Icon di Pojok Kanan */}
        <Link to="/login" className="profile-icon-link">
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=2.5&w=150&h=150&q=80" alt="User Profile" className="profile-icon-img" />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
