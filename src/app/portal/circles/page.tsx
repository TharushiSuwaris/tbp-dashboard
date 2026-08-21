"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Compass,
  FileText,
  Landmark,
  CalendarDays,
  Handshake,
  LayoutDashboard,
  Network,
  Globe2,
  Building2,
  Rocket,
  Mail,
  ClipboardList,
  Search,
  BadgeCheck,
  KeyRound,
  Lock,
} from "lucide-react";
import { portalTheme } from "@/lib/portal/theme";

// ── Scroll-triggered reveal ──────────────────────────────────────
function Reveal({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal ${visible ? "reveal-visible" : ""}`} style={{ transitionDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: 34 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: portalTheme.gold, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>
        {eyebrow}
      </div>
      <h2 style={{ fontFamily: "var(--font-serif), Georgia, serif", color: portalTheme.textPrimary, fontSize: 26, fontWeight: 700, margin: 0 }}>
        {title}
      </h2>
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────
const circles = [
  {
    icon: Landmark,
    name: "Family Office & Private Capital Circle™",
    description: "For family offices, private investment firms, principals and private capital allocators.",
  },
  {
    icon: Building2,
    name: "Institutional Investors Circle™",
    description: "For pension funds, asset managers, infrastructure funds, banks, insurers, DFIs and other institutional capital providers.",
  },
  {
    icon: Rocket,
    name: "Angel Investors Circle™",
    description: "For experienced individual investors, entrepreneurs and early-stage capital interested in emerging TBP technologies and ventures.",
  },
];

const provides = [
  { icon: Compass, text: "Curated access to TBP Project Opportunities" },
  { icon: FileText, text: "Private project and investment briefings" },
  { icon: Landmark, text: "Capital Advisory access" },
  { icon: CalendarDays, text: "Invitation to selected TBP roundtables and events" },
  { icon: Handshake, text: "Ability to express interest in projects and strategic partnerships" },
  { icon: LayoutDashboard, text: "Access to the member My Portfolio / Investor Dashboard" },
  { icon: Network, text: "Future access to qualifying participation structures within the proposed I, C & N capital architecture" },
  { icon: Globe2, text: "Direct visibility into projects spanning trade, infrastructure, maritime, energy, technology and global gateway development" },
];

const process = [
  { icon: Mail, label: "Invitation" },
  { icon: ClipboardList, label: "Registration" },
  { icon: Search, label: "TBP Review" },
  { icon: BadgeCheck, label: "Membership Approval" },
  { icon: KeyRound, label: "Capital Circle Access" },
];

const sectionStyle: React.CSSProperties = {
  maxWidth: 960,
  margin: "0 auto",
  padding: "70px 24px",
};

export default function CapitalCirclesLandingPage() {
  return (
    <main style={{ background: portalTheme.background, fontFamily: "sans-serif", overflowX: "hidden" }}>
      <style jsx global>{`
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.8s cubic-bezier(0.2, 0.6, 0.2, 1), transform 0.8s cubic-bezier(0.2, 0.6, 0.2, 1);
        }
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .circle-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .circle-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px rgba(27, 42, 61, 0.1);
          border-color: rgba(196, 153, 42, 0.4) !important;
        }
        .cta-button {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 26px rgba(196, 153, 42, 0.4);
        }
        .corridor-line {
          stroke-dashoffset: 0;
          animation: dashflow 7s linear infinite;
        }
        @keyframes dashflow {
          to {
            stroke-dashoffset: -50;
          }
        }
        h1.hero-title {
          font-size: 48px;
        }
        @media (max-width: 860px) {
          h1.hero-title {
            font-size: 34px !important;
          }
        }
        .provides-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }
        @media (max-width: 640px) {
          .provides-grid {
            grid-template-columns: 1fr;
          }
        }
        .circles-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 780px) {
          .circles-grid {
            grid-template-columns: 1fr;
          }
        }
        .process-chain {
          display: flex;
          justify-content: center;
          align-items: stretch;
          flex-wrap: wrap;
          gap: 6px;
        }
        @media (max-width: 700px) {
          .process-chain {
            flex-direction: column;
            align-items: center;
          }
          .process-arrow {
            transform: rotate(90deg);
          }
        }
      `}</style>

      {/* Hero — dark, glowing world-map background */}
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, #0A1526 0%, #16233A 55%, #1B2A3D 100%)",
        }}
      >
        <div style={{ position: "absolute", inset: 0, filter: "contrast(0.82) brightness(0.7) saturate(0.85)" }}>
          <Image src="/circles/world-network.png" alt="" fill sizes="100vw" style={{ objectFit: "cover", objectPosition: "center" }} priority />
        </div>
        {/* Bottom fade into the page's light body */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, rgba(10,21,38,0.35) 0%, rgba(10,21,38,0.3) 45%, ${portalTheme.background} 100%)`,
          }}
        />
        {/* Scrim behind the text column only, so the map stays visible
            elsewhere while the headline/copy stay clearly readable */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 560px 420px at 16% 42%, rgba(6,13,24,0.75) 0%, rgba(6,13,24,0.45) 45%, rgba(6,13,24,0) 75%)",
          }}
        />

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: 960,
            margin: "0 auto",
            padding: "28px 24px 0",
            flexWrap: "wrap",
            position: "relative",
            zIndex: 1,
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                background: portalTheme.gold,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 11,
                color: portalTheme.goldText,
                letterSpacing: ".5px",
              }}
            >
              TBP
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#F2EFE8", letterSpacing: ".8px" }}>
              THE BORDERLESS PROJECT
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#AEB8C8", letterSpacing: ".3px" }}>
            Coordinated by the TBP Capital Advisory &amp; Coordination Office
          </div>
        </div>

        {/* Hero text */}
        <div style={{ ...sectionStyle, paddingTop: 52, paddingBottom: 68, position: "relative", zIndex: 1 }}>
          <Reveal>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{ width: 26, height: 1, background: portalTheme.gold, display: "inline-block" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#F6D08A", letterSpacing: "2px", textTransform: "uppercase" }}>
                Invitation-Only Membership
              </span>
            </div>
            <h1
              className="hero-title"
              style={{
                fontFamily: "var(--font-serif), Georgia, serif",
                color: "#FFFFFF",
                fontWeight: 700,
                margin: "0 0 20px",
                lineHeight: 1.15,
              }}
            >
              TBP Capital Circles<span style={{ fontSize: 22, verticalAlign: "super" }}>™</span>
            </h1>
            <p style={{ color: "#C9D0DB", fontSize: 15.5, lineHeight: 1.85, maxWidth: 500 }}>
              An exclusive global capital community connecting family offices, private capital, institutional
              investors and angel investors with curated TBP project opportunities, strategic partnerships and
              emerging capital participation structures.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Circles */}
      <div style={{ ...sectionStyle, paddingBottom: 20 }}>
        <Reveal>
          <SectionHeading eyebrow="The Network" title="Three Capital Circles" />
        </Reveal>
        <div className="circles-grid">
          {circles.map((c, i) => {
            const Icon = c.icon;
            return (
              <Reveal key={c.name} delay={i * 120}>
                <div
                  className="circle-card"
                  style={{
                    background: portalTheme.panel,
                    border: `1px solid ${portalTheme.panelBorder}`,
                    borderRadius: 14,
                    padding: "26px 22px",
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border: `1.5px solid ${portalTheme.gold}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Icon size={19} color={portalTheme.gold} strokeWidth={1.6} />
                  </div>
                  <div style={{ color: portalTheme.textPrimary, fontWeight: 700, fontSize: 14.5, marginBottom: 8, lineHeight: 1.4 }}>
                    {c.name}
                  </div>
                  <div style={{ color: portalTheme.textMuted, fontSize: 12.5, lineHeight: 1.7 }}>{c.description}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* What Membership Provides */}
      <div style={{ ...sectionStyle, paddingTop: 20, paddingBottom: 20 }}>
        <Reveal>
          <SectionHeading eyebrow="Membership" title="What Membership Provides" />
        </Reveal>

        <div className="provides-grid">
          {provides.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.text} delay={i * 60}>
                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "flex-start",
                    background: portalTheme.panel,
                    border: `1px solid ${portalTheme.panelBorder}`,
                    borderRadius: 10,
                    padding: "16px 18px",
                    height: "100%",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      background: "rgba(196,153,42,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} color={portalTheme.gold} strokeWidth={1.8} />
                  </div>
                  <span style={{ color: portalTheme.textSecondary, fontSize: 13, lineHeight: 1.7, paddingTop: 6 }}>{p.text}</span>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Process */}
      <div style={{ ...sectionStyle, paddingTop: 20, paddingBottom: 20 }}>
        <Reveal>
          <SectionHeading eyebrow="How It Works" title="Membership Pathway" />
        </Reveal>
        <Reveal>
          <div className="process-chain">
            {process.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 8,
                      padding: "16px 18px",
                      minWidth: 120,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: portalTheme.panel,
                        border: `1.5px solid ${portalTheme.gold}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={18} color={portalTheme.gold} strokeWidth={1.7} />
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: portalTheme.textSecondary, textAlign: "center", whiteSpace: "nowrap" }}>
                      {step.label}
                    </span>
                  </div>
                  {i < process.length - 1 && (
                    <span className="process-arrow" style={{ color: portalTheme.gold, fontSize: 16 }}>
                      &rarr;
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>

      {/* Private / exclusivity callout */}
      <div style={{ ...sectionStyle, paddingTop: 30, paddingBottom: 30 }}>
        <Reveal>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              maxWidth: 640,
              margin: "0 auto",
              background: "rgba(27,42,61,0.03)",
              border: `1px solid ${portalTheme.panelBorder}`,
              borderRadius: 12,
              padding: "24px 28px",
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: portalTheme.textPrimary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Lock size={18} color={portalTheme.background} strokeWidth={1.8} />
            </div>
            <p style={{ color: portalTheme.textSecondary, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
              This is a private capital network and participation-mapping process.{" "}
              <strong style={{ color: portalTheme.textPrimary }}>Access is strictly by invitation only.</strong>
            </p>
          </div>
        </Reveal>
      </div>

      {/* CTA — its own soft banded section for breathing room */}
      <div style={{ background: "rgba(196,153,42,0.05)", borderTop: `1px solid ${portalTheme.panelBorder}`, borderBottom: `1px solid ${portalTheme.panelBorder}` }}>
        <div style={{ ...sectionStyle, textAlign: "center", paddingTop: 72, paddingBottom: 72 }}>
          <Reveal>
            <Link
              href="/portal/register-member"
              className="cta-button"
              style={{
                display: "inline-block",
                padding: "16px 38px",
                borderRadius: 8,
                background: portalTheme.gold,
                color: portalTheme.goldText,
                fontWeight: 700,
                fontSize: 14.5,
                textDecoration: "none",
              }}
            >
              Proceed to Membership Registration &rarr;
            </Link>
            <p style={{ color: portalTheme.textMuted, fontSize: 11.5, marginTop: 14 }}>
              This registration page is intended for invited prospective members of the TBP Capital Circles.
            </p>

            <div
              style={{
                maxWidth: 560,
                margin: "32px auto 0",
                padding: "16px 20px",
                borderRadius: 10,
                background: portalTheme.panel,
                border: `1px solid ${portalTheme.panelBorder}`,
              }}
            >
              <p style={{ color: portalTheme.textMuted, fontSize: 11.5, lineHeight: 1.7, margin: 0 }}>
                Membership is by invitation and subject to TBP review and approval. Registration does not
                automatically constitute acceptance into a TBP Capital Circle or an offer of investment.
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "56px 24px 64px" }}>
        <div
          style={{
            width: 40,
            height: 40,
            background: portalTheme.gold,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 12,
            color: portalTheme.goldText,
            margin: "0 auto 18px",
          }}
        >
          TBP
        </div>
        <p style={{ color: portalTheme.textMuted, fontSize: 11, letterSpacing: ".4px", marginBottom: 6 }}>
          Powered by TBP Capital Advisory &amp; Coordination Office
        </p>
        <p style={{ color: portalTheme.textMuted, fontSize: 10.5, opacity: 0.7 }}>The Borderless Project™</p>
      </div>
    </main>
  );
}
