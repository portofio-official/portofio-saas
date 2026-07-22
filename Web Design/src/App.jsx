import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

// Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TemplateShowcase from './components/TemplateShowcase';
import PricingPlans from './components/PricingPlans';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';

// Pages
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';

// Komponen Pembungkus untuk Halaman Utama (Home)
const Home = () => {
  useEffect(() => {
    // Menonaktifkan fitur bawaan browser yang selalu mengingat posisi scroll terakhir
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    // Menghapus hash (#pricing, #templates) dari URL agar browser tidak mencoba melompat ke bawah
    if (window.location.hash) {
      window.history.replaceState(null, null, ' ');
    }
    
    // Memaksa halaman untuk mulai dari paling atas (Hero section)
    window.scrollTo(0, 0);

    // Scroll Reveal Observer
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target); // Animasi hanya terjadi satu kali
          }
        });
      },
      {
        root: null,
        threshold: 0, // Menggunakan 0 agar langsung terpicu sekecil apa pun elemen yang masuk viewport
        rootMargin: "0px 0px -50px 0px" // Terpicu saat elemen 50px masuk dari bawah layar
      }
    );

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach((el) => revealObserver.observe(el));

    // Fitur "Space terakhir untuk kembali ke atas"
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        const scrollY = window.scrollY;
        const windowH = window.innerHeight;
        const docH = document.documentElement.scrollHeight;
        
        // Jika halaman sudah mentok sampai ke dasar (dengan toleransi 150px)
        if (scrollY + windowH >= docH - 150) {
          e.preventDefault(); // Mencegah perilaku default Space yang berusaha gulir ke bawah lagi
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); // Meluncur mulus ke atas
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      revealObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Hero />
        <TemplateShowcase />
        <PricingPlans />
        <Testimonials />
        <FAQ />
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
}

export default App;
