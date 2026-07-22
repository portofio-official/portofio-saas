import React, { useState, useRef, useEffect } from 'react';
import basicTemplate1 from '../assets/basic_template_1.png';
import './TemplateShowcase.css';

function TemplateShowcase() {
  const [activeTab, setActiveTab] = useState('Basic');
  const [currentIndex, setCurrentIndex] = useState(2); // Start at middle of 5 items
  
  const deltaHistory = useRef([0, 0, 0, 0, 0]);
  const lastWheelTime = useRef(0);
  const swipeLock = useRef(false);
  const wrapperRef = useRef(null);
  
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const allTemplates = [
    // Basic Templates (Images)
    { id: 1, category: 'Designer', name: 'Minimalist', image: basicTemplate1, isPremium: false },
    { id: 2, category: 'Developer', name: 'Clean Code', image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', isPremium: false },
    { id: 3, category: 'Writer', name: 'Typewriter', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', isPremium: false },
    { id: 4, category: 'Marketer', name: 'Brand Story', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', isPremium: false },
    { id: 5, category: 'Creator', name: 'Vlog Flow', image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', isPremium: false },
    
    // Premium Templates
    { id: 6, category: 'Agency', name: 'Studio Flow', image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', isPremium: true },
    { id: 7, category: 'Tech Pro', name: 'Cyber Space', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', isPremium: true },
    { id: 8, category: 'Corporate', name: 'Business Elite', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', isPremium: true },
    { id: 9, category: 'E-Commerce', name: 'Shop Prime', image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', isPremium: true },
    { id: 10, category: 'Photographer', name: 'Lens Master', image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', isPremium: true },
  ];

  const categories = ['Basic', 'Premium'];

  // Filter template berdasarkan tab yang aktif
  const displayTemplates = allTemplates.filter(t => 
    activeTab === 'Premium' ? t.isPremium : !t.isPremium
  );

  // Reset karosel ke posisi tengah setiap kali tab diubah
  useEffect(() => {
    setCurrentIndex(2);
  }, [activeTab]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === displayTemplates.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayTemplates.length - 1 : prev - 1));
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const handleNativeWheel = (e) => {
      const currentDeltaX = Math.abs(e.deltaX);
      const currentDeltaY = Math.abs(e.deltaY);

      // Jika usapan lebih dominan ke horizontal
      if (currentDeltaX > currentDeltaY) {
        // MENCEGAH SCROLL VERTIKAL JIKA USAPAN MIRING!
        // Wajib menggunakan native listener {passive: false} agar fungsi ini bekerja tanpa diabaikan browser.
        e.preventDefault();

        const now = Date.now();
        if (now - lastWheelTime.current > 200) {
          deltaHistory.current = [0, 0, 0, 0, 0];
        }
        lastWheelTime.current = now;

        const prevAverage = (
          deltaHistory.current[0] + 
          deltaHistory.current[1] + 
          deltaHistory.current[2] + 
          deltaHistory.current[3]
        ) / 4;

        deltaHistory.current.shift();
        deltaHistory.current.push(currentDeltaX);

        if (currentDeltaX > 20 && currentDeltaX > prevAverage * 1.5) {
          if (!swipeLock.current) {
            swipeLock.current = true;
            
            if (e.deltaX > 0) {
              setCurrentIndex((prev) => (prev === 4 ? 0 : prev + 1)); // 4 = displayTemplates.length - 1
            } else {
              setCurrentIndex((prev) => (prev === 0 ? 4 : prev - 1));
            }
            
            setTimeout(() => {
              swipeLock.current = false;
            }, 400); 
          }
        }
      } else {
        lastWheelTime.current = 0;
      }
    };

    // Attach native listener with passive: false
    wrapper.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      wrapper.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const getCardStyle = (index) => {
    // Calculate distance from center (currentIndex)
    let offset = index - currentIndex;
    const total = displayTemplates.length;
    
    // Handle wrap-around for infinite feeling (optional, but good for 5 items)
    if (offset < -2) offset += total;
    if (offset > 2) offset -= total;

    let translateX = 0;
    let scale = 1;
    let zIndex = 5;
    let opacity = 1;
    let rotateY = 0;

    if (offset === 0) {
      // Center item
      translateX = 0;
      scale = 1;
      zIndex = 10;
      opacity = 1;
      rotateY = 0;
    } else if (offset === 1) {
      // Right 1
      translateX = 55; // percentage
      scale = 0.8;
      zIndex = 8;
      opacity = 0.8;
      rotateY = -15; // slight 3D rotation
    } else if (offset === -1) {
      // Left 1
      translateX = -55;
      scale = 0.8;
      zIndex = 8;
      opacity = 0.8;
      rotateY = 15;
    } else if (offset === 2) {
      // Right 2
      translateX = 100;
      scale = 0.6;
      zIndex = 6;
      opacity = 0.5;
      rotateY = -25;
    } else if (offset === -2) {
      // Left 2
      translateX = -100;
      scale = 0.6;
      zIndex = 6;
      opacity = 0.5;
      rotateY = 25;
    }

    return {
      transform: `translateX(${translateX}%) scale(${scale}) perspective(1000px) rotateY(${rotateY}deg)`,
      zIndex: zIndex,
      opacity: opacity,
    };
  };

  return (
    <section className="template-showcase" id="templates">
      {/* Background Decorative Squiggle */}
      <svg viewBox="0 0 1600 800" className="abstract-squiggle" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="squiggleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FDB4D2"/>
            <stop offset="16%" stop-color="#FDB4D2"/>
            <stop offset="16%" stop-color="#FF7214"/>
            <stop offset="33%" stop-color="#FF7214"/>
            <stop offset="33%" stop-color="#D2F614"/>
            <stop offset="50%" stop-color="#D2F614"/>
            <stop offset="50%" stop-color="#005A3D"/>
            <stop offset="66%" stop-color="#005A3D"/>
            <stop offset="66%" stop-color="#0E6DFD"/>
            <stop offset="83%" stop-color="#0E6DFD"/>
            <stop offset="83%" stop-color="#80C9FF"/>
            <stop offset="100%" stop-color="#80C9FF"/>
          </linearGradient>
        </defs>
        {/* Curvy snake path membentang dari kiri ke kanan dengan ruang aman agar tidak terpotong */}
        <path 
          d="M -100 400 C 200 150, 400 650, 800 400 C 1200 150, 1400 650, 1700 400" 
          fill="none" 
          stroke="url(#squiggleGrad)" 
          strokeWidth="60" 
          strokeLinecap="round" 
        />
      </svg>

      <div className="container reveal-on-scroll">
        
        <div className="showcase-header">
          <h2>Stunning Templates</h2>
          <p>See the world through our lens: beautiful portfolios for every creator</p>
        </div>

        <div className="template-tabs">
          {categories.map((cat) => {
            const isPremium = cat === 'Premium';
            return (
              <button 
                key={cat}
                className={`pill-btn ${activeTab === cat ? 'active' : ''} ${isPremium ? 'premium-pill' : ''}`}
                onClick={() => setActiveTab(cat)}
              >
                {cat}
              </button>
            );
          })}
          <button className="pill-btn view-more">View More →</button>
        </div>

        <div className="coverflow-container">
          <div 
            className="coverflow-wrapper"
            ref={wrapperRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {displayTemplates.map((template, index) => {
              const isCenter = index === currentIndex;
              
              return (
                <div 
                  key={template.id} 
                  className={`coverflow-card ${isCenter ? 'active' : ''}`}
                  style={getCardStyle(index)}
                  onClick={() => !isCenter && setCurrentIndex(index)}
                >
                  <img src={template.image} alt={template.name} className="coverflow-image" />
                  
                  {template.isPremium && (
                    <div className="premium-badge">
                      <svg viewBox="0 0 24 24" fill="#FCA311" width="22px" height="22px">
                        <path d="M2.5 6.5l5.5 5.5 4-7.5 4 7.5 5.5-5.5-2 10.5h-15z" strokeLinejoin="round" />
                        <rect x="3" y="19" width="18" height="2.5" rx="1" />
                      </svg>
                    </div>
                  )}

                  {isCenter && (
                    <div className="card-play-btn">
                      <span className="material-symbols-outlined">play_arrow</span>
                    </div>
                  )}
                  
                  <div className="card-info">
                    <span className="card-category">{template.category}</span>
                    <h3 className="card-name">{template.name}</h3>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="coverflow-controls">
            <button className="nav-arrow" onClick={prevSlide}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <button className="nav-arrow" onClick={nextSlide}>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

export default TemplateShowcase;
