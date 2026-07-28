"use client";

import { EnvelopeSimple, ArrowRight, WhatsappLogo, LinkedinLogo } from "@phosphor-icons/react";
import type { PortfolioProData } from "./schema";

export function ContactSection({
  contact,
  socials,
  isDark,
  isMobileView,
}: {
  contact: PortfolioProData["contact"];
  socials: PortfolioProData["socials"];
  isDark: boolean;
  isMobileView: boolean;
}) {
  const linkedin = socials.find((s) => s.platform === "linkedin")?.url;

  const cards = [
    contact.email
      ? {
          title: "Email",
          desc: "Have a formal question, project offer, or collaboration opportunity? Reach me directly by email.",
          subtext: contact.email,
          url: `mailto:${contact.email}`,
          bg: "bg-gradient-to-br from-[#ea4335] via-[#ea4335] to-[#c5221f]",
          btnTextColor: "text-[#ea4335]",
          btnText: "Send Email",
          Icon: EnvelopeSimple,
        }
      : null,
    contact.whatsapp
      ? {
          title: "WhatsApp",
          desc: "Want to chat faster or ask something casually? Message me directly on WhatsApp.",
          subtext: contact.whatsapp,
          url: `https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`,
          bg: "bg-gradient-to-br from-emerald-500 to-green-600",
          btnTextColor: "text-[#25d366]",
          btnText: "Chat on WhatsApp",
          Icon: WhatsappLogo,
        }
      : null,
    linkedin
      ? {
          title: "LinkedIn",
          desc: "Let's connect professionally, collaborate, or check out my career track record and portfolio.",
          subtext: "View profile",
          url: linkedin,
          bg: "bg-gradient-to-br from-[#0077b5] to-[#005987]",
          btnTextColor: "text-[#0077b5]",
          btnText: "Visit LinkedIn",
          Icon: LinkedinLogo,
        }
      : null,
  ].filter((c): c is NonNullable<typeof c> => c !== null);

  if (!cards.length) return null;

  return (
    <section id="contact" className="w-full scroll-mt-[72px] py-12 lg:py-16">
      <div className="mb-6 flex flex-col items-center gap-2 px-4 text-center lg:mb-10">
        <h2 className={`mb-3 font-bold tracking-tight ${isMobileView ? "text-3xl" : "text-4xl lg:text-5xl"} ${isDark ? "text-white" : "text-slate-900"}`}>Let&apos;s Connect</h2>
        <p className={`mx-auto max-w-2xl leading-relaxed ${isMobileView ? "text-sm" : "text-base"} ${isDark ? "text-gray-400" : "text-slate-600"}`}>
          Have a question, a collaboration idea, or just want to talk shop? I&apos;m always open to sharing experience and making new connections.
        </p>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className={`grid w-full ${isMobileView ? "grid-cols-1 gap-4" : "grid-cols-1 gap-6 md:grid-cols-3"}`}>
          {cards.map((card, idx) =>
            isMobileView ? (
              <a
                key={idx}
                href={card.url}
                target="_blank"
                rel="noreferrer"
                className={`group relative flex h-[100px] items-center justify-between overflow-hidden rounded-[1.5rem] p-5 text-white shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-95 ${card.bg}`}
              >
                <div className="relative z-10 flex w-[calc(100%-48px)] items-center gap-4 text-left">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-white p-2.5 shadow-md">
                    <card.Icon size={28} className={card.btnTextColor} />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <h3 className="text-[17px] leading-tight font-extrabold text-white">{card.title}</h3>
                    <p className="mt-0.5 truncate pr-2 text-[13px] font-medium text-white/90">{card.subtext}</p>
                  </div>
                </div>
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:translate-x-1">
                  <ArrowRight size={20} className="text-white" />
                </div>
              </a>
            ) : (
              <div key={idx} className={`relative flex h-[360px] flex-col justify-between overflow-hidden rounded-[2rem] p-6 text-white shadow-xl transition-all duration-300 hover:scale-[1.02] sm:h-[380px] sm:p-8 ${card.bg}`}>
                <div className="relative z-10 flex h-full w-full flex-col justify-between text-left">
                  <div className="flex flex-col">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-100 bg-white p-2.5 shadow-md">
                      <card.Icon size={28} className={card.btnTextColor} />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-white sm:text-2xl">{card.title}</h3>
                    <p className="text-xs leading-relaxed text-white/90 sm:text-sm">{card.desc}</p>
                  </div>
                  <a
                    href={card.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`mt-6 block w-full rounded-2xl bg-white py-3.5 px-6 text-center text-xs font-bold shadow-md transition-all hover:bg-slate-50 sm:text-sm ${card.btnTextColor}`}
                  >
                    {card.btnText}
                  </a>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}
