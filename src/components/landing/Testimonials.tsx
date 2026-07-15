"use client";

import { useTranslations } from "next-intl";
import shared from "./shared.module.css";
import styles from "./Testimonials.module.css";

const avatars = [
  "https://i.pravatar.cc/150?img=1",
  "https://i.pravatar.cc/150?img=11",
  "https://i.pravatar.cc/150?img=5",
  "https://i.pravatar.cc/150?img=68",
];

type TestimonialCopy = { name: string; role: string; content: string };
type Testimonial = TestimonialCopy & { avatar: string };

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className={styles.testimonialCard}>
      <div className={styles.rating}>★★★★★</div>
      <p className={styles.testimonialText}>&quot;{testimonial.content}&quot;</p>
      <div className={styles.authorInfo}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={testimonial.avatar} alt={testimonial.name} className={styles.authorAvatar} />
        <div>
          <h4 className={styles.authorName}>{testimonial.name}</h4>
          <p className={styles.authorRole}>{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const t = useTranslations("Landing.Testimonials");
  const items = t.raw("items") as TestimonialCopy[];
  const testimonialsData: Testimonial[] = items.map((item, i) => ({ ...item, avatar: avatars[i] }));

  const row1 = [testimonialsData[0], testimonialsData[1]];
  const row2 = [testimonialsData[2], testimonialsData[3]];

  const row1Half = [...row1, ...row1];
  const row2Half = [...row2, ...row2];

  return (
    <section id="testimonials" className={styles.testimonialsSection}>
      <div className={`${styles.testimonialsContentWrapper} ${shared.container}`}>
        <div className={styles.testimonialsSplitLayout}>
          <div className={`${styles.testimonialsImageSide} ${shared.revealOnScroll}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/cover-kata-mereka.png" alt="Testimonial collage" className={styles.collageImageReal} />
          </div>

          <div className={styles.testimonialsTextSide}>
            <div className={`${styles.sectionHeader} ${shared.revealOnScroll}`}>
              <h2 className={styles.sectionTitle}>{t("heading")}</h2>
              <p className={styles.sectionSubtitle}>{t("subheading")}</p>
            </div>
            <div className={styles.marqueeWrapper}>
              <div className={styles.marqueeTrack}>
                <div className={`${styles.marqueeContent} ${styles.scrollLeft}`}>
                  {row1Half.map((testimonial, index) => (
                    <TestimonialCard key={`r1-1-${index}`} testimonial={testimonial} />
                  ))}
                </div>
                <div className={`${styles.marqueeContent} ${styles.scrollLeft}`} aria-hidden="true">
                  {row1Half.map((testimonial, index) => (
                    <TestimonialCard key={`r1-2-${index}`} testimonial={testimonial} />
                  ))}
                </div>
              </div>

              <div className={styles.marqueeTrack}>
                <div className={`${styles.marqueeContent} ${styles.scrollRight}`}>
                  {row2Half.map((testimonial, index) => (
                    <TestimonialCard key={`r2-1-${index}`} testimonial={testimonial} />
                  ))}
                </div>
                <div className={`${styles.marqueeContent} ${styles.scrollRight}`} aria-hidden="true">
                  {row2Half.map((testimonial, index) => (
                    <TestimonialCard key={`r2-2-${index}`} testimonial={testimonial} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
