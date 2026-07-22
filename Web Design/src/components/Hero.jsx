import React from 'react';
import './Hero.css';

const Hero = () => {
  // Generate some dummy images for the grid
  // Use our generated professional photos
  const column1 = [
    "/portrait-data.png",
    "/portrait-photographer.png",
    "/portrait-copywriter.png",
    "/portrait-data.png" // duplicate for seamless loop
  ];
  
  const column2 = [
    "/portrait-designer.png",
    "/hero-portrait.png",
    "/portrait-lecturer.png",
    "/portrait-designer.png"
  ];
  
  const column3 = [
    "/portrait-marketer.png",
    "/portrait-engineer.png",
    "/portrait-freelancer.png",
    "/portrait-marketer.png"
  ];

  return (
    <section className="hero" id="home">
      <div className="hero-container">
        {/* Left Column: Content */}
        <div className="hero-content animate-fade-in-up">
          <h1 className="hero-title">
            Portfolios that<br />
            <span style={{ color: 'var(--accent-color)' }}>actually</span> get you<br />
            hired.
          </h1>
          <p className="hero-subtitle">
            Create stunning, professional websites in minutes. Perfect for Marketers, Data Analysts, and Educators looking to stand out.
          </p>
          <div className="hero-actions">
            <button className="btn-primary btn-large">Get Started</button>
            <div className="hero-users" style={{ marginTop: '24px' }}>
              <div className="user-icon" style={{ background: '#f3f4f6', padding: '12px', borderRadius: '50%', marginRight: '12px' }}>
                👥
              </div>
              <div className="user-text">
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Users joining</span><br/>
                <strong style={{ fontSize: '1.2rem', color: '#111827' }}>319,836</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Moving Tilted Photo Grid */}
        <div className="hero-visual animate-fade-in-up delay-200">
          <div className="tilted-grid-container">
            <div className="tilted-grid">
              
              {/* Column 1 (Scrolls Down) */}
              <div className="grid-col scroll-down">
                {column1.map((src, i) => (
                  <div key={i} className="grid-item">
                    <img src={src} alt="Portfolio item" />
                  </div>
                ))}
              </div>

              {/* Column 2 (Scrolls Up) */}
              <div className="grid-col scroll-up">
                {column2.map((src, i) => (
                  <div key={i} className="grid-item">
                    <img src={src} alt="Portfolio item" />
                  </div>
                ))}
              </div>

              {/* Column 3 (Scrolls Down) */}
              <div className="grid-col scroll-down-slow">
                {column3.map((src, i) => (
                  <div key={i} className="grid-item">
                    <img src={src} alt="Portfolio item" />
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
