import React from 'react';
import './FAQ.css';
import Footer from './Footer';

const faqData = [
  {
    question: "Apakah butuh skill coding?",
    answer: "Sama sekali tidak! Platform kami menggunakan sistem visual drag-and-drop yang sangat mudah dipelajari oleh siapa saja."
  },
  {
    question: "Berapa lama proses pembuatannya?",
    answer: "Hanya butuh waktu kurang dari 15 menit untuk online, berkat ratusan template siap pakai yang bisa langsung Anda sesuaikan."
  },
  {
    question: "Bisa pakai domain sendiri?",
    answer: "Tentu! Anda bisa menghubungkan domain kustom (misal: nama-anda.com) di semua paket layanan kami dengan mudah."
  },
  {
    question: "Adakah bantuan teknis?",
    answer: "Ya, tim dukungan pelanggan kami siap membantu Anda 24/7 melalui fitur live chat di dalam dashboard."
  }
];

const FAQ = () => {
  return (
    <section id="faq" className="faq-section">
      <div className="faq-content-wrapper container">
        <div className="faq-header-row reveal-on-scroll">
          <div className="faq-header-text">
            <h2 className="section-title">Pertanyaan Umum</h2>
            <p className="section-subtitle">Beberapa hal yang paling sering ditanyakan oleh pengguna baru kami.</p>
          </div>
          <div className="faq-header-action">
            <a href="#all-faq" className="btn-outline-green" onClick={(e) => {
              e.preventDefault();
              alert("Halaman Semua FAQ akan segera hadir!");
            }}>
              Lihat Semua Pertanyaan →
            </a>
          </div>
        </div>

        <div className="faq-grid reveal-on-scroll" style={{ animationDelay: '0.2s' }}>
          {faqData.map((faq, index) => (
            <div key={index} className="faq-static-card">
              <div className="faq-static-number">
                0{index + 1}
              </div>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default FAQ;
