import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        {/* Footer Main Content */}
        <div className="footer-main">
          <div className="footer-brand">
            <img src="/logo.png" alt="Portofio Logo" className="footer-logo" style={{ filter: 'brightness(0) invert(1)' }} />
            <p>Platform pembuatan portofolio terkemuka untuk desainer dan developer.</p>
            <div className="social-links">
              <a href="#" className="social-icon">Tw</a>
              <a href="#" className="social-icon">In</a>
              <a href="#" className="social-icon">Ig</a>
            </div>
          </div>
          
          <div className="footer-links-group">
            <div className="footer-column">
              <h4>Produk</h4>
              <a href="#">Template</a>
              <a href="#">Harga</a>
            </div>
            <div className="footer-column">
              <h4>Sumber Daya</h4>
              <a href="#">Panduan</a>
              <a href="#">Bantuan</a>
            </div>
            <div className="footer-column">
              <h4>Perusahaan</h4>
              <a href="#">Tentang Kami</a>
              <a href="#">Kontak</a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Portofio. Hak Cipta Dilindungi.</p>
          <div className="legal-links">
            <a href="#">Privasi</a>
            <a href="#">Syarat</a>
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({top: 0, behavior: 'smooth'}); }}>Kembali ke Atas ↑</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
