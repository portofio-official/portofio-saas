import React from 'react';
import './Testimonials.css';
import coverImage from '../assets/cover-kata-mereka.png';

const testimonialsData = [
  {
    id: 1,
    name: "Sarah Wijaya",
    role: "Digital Marketer",
    content: "Berkat portofolio dari sini, saya berhasil memenangkan 3 klien besar bulan ini. Tampilannya sangat profesional dan sangat mudah disesuaikan!",
    avatar: "https://i.pravatar.cc/150?img=1"
  },
  {
    id: 2,
    name: "Budi Santoso",
    role: "Data Analyst",
    content: "Desainnya luar biasa bersih. Saya tidak mengerti coding sama sekali, tapi saya bisa mengatur portofolio data saya dalam waktu kurang dari 10 menit.",
    avatar: "https://i.pravatar.cc/150?img=11"
  },
  {
    id: 3,
    name: "Amanda Putri",
    role: "UI/UX Designer",
    content: "Animasi scroll dan detail micro-interaction di sini sangat memukau. Sangat merepresentasikan kualitas dan karakter kerja saya sebagai desainer kreatif.",
    avatar: "https://i.pravatar.cc/150?img=5"
  },
  {
    id: 4,
    name: "Reza Mahendra",
    role: "Freelance Photographer",
    content: "Platform ini adalah penyelamat hidup! Klien sering memuji seberapa elegan dan responsifnya galeri foto saya saat diakses melalui smartphone.",
    avatar: "https://i.pravatar.cc/150?img=68"
  }
];

const Testimonials = () => {
  // Memisahkan data untuk 2 baris (kanan dan kiri)
  const row1 = [testimonialsData[0], testimonialsData[1]];
  const row2 = [testimonialsData[2], testimonialsData[3]];
  
  // Menggandakan data agar bisa looping tanpa putus (infinite scroll)
  const row1Half = [...row1, ...row1];
  const row2Half = [...row2, ...row2];

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="testimonials-content-wrapper container">
        
        <div className="testimonials-split-layout">
          
          {/* Bagian Kiri: Gambar Collage */}
          <div className="testimonials-image-side reveal-on-scroll">
            <img 
              src={coverImage} 
              alt="Kolase Testimoni" 
              className="collage-image-real"
            />
          </div>

          {/* Bagian Kanan: Teks & Grid 4 Kartu */}
          <div className="testimonials-text-side">
            <div className="section-header reveal-on-scroll">
              <h2 className="section-title">Testimonials</h2>
              <p className="section-subtitle">Dengarkan cerita sukses dari para profesional yang telah menggunakan platform kami.</p>
            </div>
            <div className="marquee-wrapper">
              
              {/* Baris 1: Berjalan ke kiri */}
              <div className="marquee-track">
                <div className="marquee-content scroll-left">
                  {row1Half.map((testimonial, index) => (
                    <div key={`r1-1-${index}`} className="testimonial-card">
                      <div className="rating">★★★★★</div>
                      <p className="testimonial-text">"{testimonial.content}"</p>
                      <div className="author-info">
                        <img src={testimonial.avatar} alt={testimonial.name} className="author-avatar" />
                        <div className="author-details">
                          <h4 className="author-name">{testimonial.name}</h4>
                          <p className="author-role">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="marquee-content scroll-left" aria-hidden="true">
                  {row1Half.map((testimonial, index) => (
                    <div key={`r1-2-${index}`} className="testimonial-card">
                      <div className="rating">★★★★★</div>
                      <p className="testimonial-text">"{testimonial.content}"</p>
                      <div className="author-info">
                        <img src={testimonial.avatar} alt={testimonial.name} className="author-avatar" />
                        <div className="author-details">
                          <h4 className="author-name">{testimonial.name}</h4>
                          <p className="author-role">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Baris 2: Berjalan ke kanan */}
              <div className="marquee-track">
                <div className="marquee-content scroll-right">
                  {row2Half.map((testimonial, index) => (
                    <div key={`r2-1-${index}`} className="testimonial-card">
                      <div className="rating">★★★★★</div>
                      <p className="testimonial-text">"{testimonial.content}"</p>
                      <div className="author-info">
                        <img src={testimonial.avatar} alt={testimonial.name} className="author-avatar" />
                        <div className="author-details">
                          <h4 className="author-name">{testimonial.name}</h4>
                          <p className="author-role">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="marquee-content scroll-right" aria-hidden="true">
                  {row2Half.map((testimonial, index) => (
                    <div key={`r2-2-${index}`} className="testimonial-card">
                      <div className="rating">★★★★★</div>
                      <p className="testimonial-text">"{testimonial.content}"</p>
                      <div className="author-info">
                        <img src={testimonial.avatar} alt={testimonial.name} className="author-avatar" />
                        <div className="author-details">
                          <h4 className="author-name">{testimonial.name}</h4>
                          <p className="author-role">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Testimonials;
