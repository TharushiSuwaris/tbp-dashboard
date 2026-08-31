"use client";

import Link from "next/link";

// ── Data ──────────────────────────────────────────────────────────
const heroChips = [
  "HNWIs, Family Office & Private Capital",
  "Institutional Investors",
  "Angel Investors",
];

const heroMetrics = [
  {
    title: "Curated Project Access",
    text: "Explore selected TBP projects across trade, infrastructure, energy, maritime, technology and strategic development.",
  },
  {
    title: "Capital Advisory & Investor Concierge",
    text: "A dedicated Investor Concierge supports members with confidential enquiries, curated project briefings, strategic introductions and navigation across relevant opportunities within the TBP ecosystem.",
  },
  {
    title: "My Portfolio",
    text: "Track active participations, opportunities in progress and future investor dashboard activity.",
  },
  {
    title: "Discretion by Design",
    text: "Members determine how visible they wish to be within the Circle environment.",
  },
];

const projectCategories = [
  "Global Trade & Gateway Cities",
  "Infrastructure & Real Assets",
  "Energy & Strategic Reserves",
  "Maritime & ASMOFP™",
  "Technology, AI & TradeTech",
  "Corridor & Regional Development",
];

const circles = [
  {
    num: "01",
    name: "HNWIs, Family Office & Private Capital Circle™",
    description:
      "For HNWIs, family offices, private investment companies, principal investors, private capital firms and other long-term private capital participants.",
    tags: ["Infrastructure", "Real Assets", "Co-Investment", "Private Capital", "Strategic Partnerships"],
  },
  {
    num: "02",
    name: "Institutional Investors Circle™",
    description:
      "For asset managers, infrastructure funds, pension and insurance capital, banks, DFIs and other institutional allocators.",
    tags: ["Project Finance", "Energy", "Maritime", "Digital Infrastructure", "Corridor Development"],
  },
  {
    num: "03",
    name: "Angel Investors Circle™",
    description:
      "For experienced individual investors, entrepreneurs and innovation-focused capital exploring emerging TBP technologies, ventures and platforms.",
    tags: ["Technology", "AI", "FinTech", "TradeTech", "Energy Innovation"],
  },
];

const opportunityCards = [
  {
    eyebrow: "Project Environment",
    title: "Neutral Trade Cities & Global Gateway Cities",
    text: "Trade infrastructure, vertical districts, logistics, commercial activation and global gateway development.",
  },
  {
    eyebrow: "Maritime & Energy",
    title: "ASMOFP™ Offshore Infrastructure",
    text: "Offshore maritime, energy, transshipment, data and modular infrastructure opportunities.",
  },
  {
    eyebrow: "Corridor Development",
    title: "Regional & Continental Trade Corridors",
    text: "Integrated trade, transport, logistics, energy, data and strategic economic corridor ecosystems.",
  },
];

const journeySteps = [
  { n: "01", title: "Discover", text: "Explore curated TBP Project Opportunities." },
  { n: "02", title: "Express Interest", text: "Identify projects and participation areas of interest." },
  { n: "03", title: "Capital Advisory", text: "Submit a confidential enquiry to TBP." },
  { n: "04", title: "Private Briefing", text: "Receive further information where appropriate." },
  { n: "05", title: "Participation", text: "Explore suitable capital or strategic structures." },
  { n: "06", title: "My Portfolio", text: "Track approved participations and active opportunities." },
];

const tokens = [
  {
    letter: "I",
    cls: "i",
    title: "I™ — Asset",
    text: "Potential participation associated with qualifying individual infrastructure, assets, facilities or project components.",
  },
  {
    letter: "C",
    cls: "c",
    title: "C™ — Corridor",
    text: "Potential participation across defined interconnected trade, infrastructure or economic corridor ecosystems.",
  },
  {
    letter: "N",
    cls: "n",
    title: "N™ — Network",
    text: "The wider network, protocol, coordination and interoperability layer supporting the TBP global ecosystem.",
  },
];

const accessFeatures = [
  {
    title: "Curated TBP Project Opportunities",
    text: "Discover projects aligned with your capital profile and strategic interests.",
  },
  {
    title: "Private Project & Capital Briefings",
    text: "Request deeper engagement with selected projects where appropriate.",
  },
  {
    title: "Capital Advisory Enquiries",
    text: "Submit structured, confidential enquiries directly to TBP Capital Advisory.",
  },
  {
    title: "Strategic Partnership Discussions",
    text: "Explore project, capital, technology or operating participation routes.",
  },
  {
    title: "Private Roundtables & Investor Events",
    text: "Access selected TBP briefings, roundtables, site engagements and capital events.",
  },
  {
    title: "My Portfolio / Investor Dashboard",
    text: "Track active participations, opportunities in progress and selected interests.",
  },
  {
    title: "I, C & N Capital Architecture",
    text: "Future visibility into qualifying asset, corridor and network participation structures.",
  },
  {
    title: "Global TBP Project Pipeline",
    text: "Private visibility into selected opportunities across the evolving TBP ecosystem.",
  },
];

const privacyOptions = [
  { title: "Discreet Member", text: "No member-facing profile visibility." },
  { title: "Limited Profile", text: "Selected professional information visible to approved Circle members." },
  { title: "Network Profile", text: "A broader profile for members who choose to engage more visibly within the network." },
];

const membershipProcess = [
  "Invitation",
  "Membership Registration",
  "TBP Review",
  "Membership Approval",
  "Capital Circle Access",
  "Project Discovery & Advisory",
];

export default function CapitalCirclesLandingPage() {
  return (
    <>
      <style jsx global>{`
        .cc-page {
          --cc-navy: #1b2a3d;
          --cc-navy-2: #223650;
          --cc-navy-3: #17324a;
          --cc-gold: #3a9fc0;
          --cc-gold-2: #5FB3CE;
          --cc-ivory: #d4ebf2;
          --cc-white: #ffffff;
          --cc-slate: #5e6e7c;
          --cc-muted: #7b8792;
          --cc-stone: rgba(27, 42, 61, 0.1);
          --cc-shadow: 0 18px 48px rgba(12, 34, 56, 0.08);
          --cc-radius: 20px;
          --cc-max: 1180px;

          font-family: var(--font-sans), ui-sans-serif, system-ui, sans-serif;
          background: var(--cc-ivory);
          color: var(--cc-navy-3);
          line-height: 1.65;
          overflow-x: hidden;
        }
        .cc-page a {
          text-decoration: none;
          color: inherit;
        }
        .cc-wrap {
          width: min(var(--cc-max), calc(100% - 40px));
          margin: 0 auto;
        }

        /* HEADER */
        .cc-header {
          position: sticky;
          top: 0;
          z-index: 50;
          backdrop-filter: blur(16px);
          background: rgba(255, 255, 255, 0.94);
          border-bottom: 1px solid var(--cc-stone);
        }
        .cc-nav {
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
        }
        .cc-brand {
          display: flex;
          align-items: center;
          gap: 13px;
          color: var(--cc-navy);
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .cc-brand-mark {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          background: var(--cc-gold);
          color: var(--cc-navy);
          font-weight: 900;
          box-shadow: 0 8px 24px rgba(58, 159, 192, 0.18);
          flex-shrink: 0;
        }
        .cc-brand-copy small {
          display: block;
          color: var(--cc-slate);
          font-weight: 500;
          font-size: 0.74rem;
          margin-top: 1px;
        }
        .cc-nav-links {
          display: flex;
          gap: 26px;
          align-items: center;
          color: #506476;
          font-size: 0.92rem;
        }
        .cc-nav-links a:hover {
          color: var(--cc-navy);
        }
        .cc-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 48px;
          padding: 0 22px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.94rem;
          transition: 0.2s ease;
          border: 1px solid transparent;
          cursor: pointer;
        }
        .cc-btn-gold {
          background: var(--cc-gold);
          color: var(--cc-navy);
          box-shadow: 0 10px 28px rgba(58, 159, 192, 0.22);
        }
        .cc-btn-gold:hover {
          background: var(--cc-gold-2);
          transform: translateY(-1px);
        }
        .cc-btn-outline {
          color: var(--cc-navy);
          border-color: #c9d1d8;
          background: white;
        }
        .cc-btn-outline:hover {
          background: #EAF6FA;
        }

        /* HERO */
        .cc-hero {
          position: relative;
          overflow: hidden;
          color: var(--cc-navy);
          background: radial-gradient(circle at 86% 20%, rgba(58, 159, 192, 0.13), transparent 24%),
            radial-gradient(circle at 20% 86%, rgba(23, 50, 74, 0.06), transparent 28%),
            linear-gradient(180deg, #fbfdfe, #eaf6fa 82%);
          border-bottom: 1px solid var(--cc-stone);
        }
        .cc-hero:before,
        .cc-hero:after {
          content: "";
          position: absolute;
          border: 1px solid rgba(58, 159, 192, 0.16);
          border-radius: 50%;
          width: 560px;
          height: 560px;
          right: -260px;
          top: -210px;
        }
        .cc-hero:after {
          width: 340px;
          height: 340px;
          right: -130px;
          top: -60px;
        }
        .cc-hero-inner {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          align-items: center;
          gap: 68px;
          padding: 90px 0 96px;
          position: relative;
          z-index: 1;
        }
        .cc-eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.19em;
          font-size: 0.76rem;
          font-weight: 800;
          color: var(--cc-gold);
          margin-bottom: 18px;
        }
        .cc-page h1,
        .cc-page h2,
        .cc-page h3,
        .cc-page p {
          margin-top: 0;
        }
        .cc-h1 {
          color: var(--cc-navy);
          font-family: var(--font-serif), Georgia, "Times New Roman", serif;
          font-size: clamp(2.6rem, 6vw, 5.2rem);
          line-height: 1.02;
          letter-spacing: -0.03em;
          max-width: 850px;
          margin-bottom: 24px;
        }
        .cc-hero-sub {
          font-size: 1.1rem;
          color: var(--cc-slate);
          max-width: 760px;
          margin-bottom: 28px;
        }
        .cc-hero-circles {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 0 0 34px;
        }
        .cc-chip {
          border: 1px solid var(--cc-stone);
          color: var(--cc-navy-2);
          padding: 9px 13px;
          border-radius: 999px;
          font-size: 0.82rem;
          background: rgba(255, 255, 255, 0.76);
        }
        .cc-hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .cc-hero-note {
          margin-top: 18px;
          color: var(--cc-muted);
          font-size: 0.82rem;
          max-width: 660px;
        }
        .cc-hero-card {
          background: rgba(255, 255, 255, 0.86);
          border: 1px solid var(--cc-stone);
          border-radius: 24px;
          padding: 28px;
          backdrop-filter: blur(18px);
          box-shadow: var(--cc-shadow);
        }
        .cc-mini-title {
          color: var(--cc-gold);
          text-transform: uppercase;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          margin-bottom: 18px;
        }
        .cc-metric {
          padding: 18px 0;
          border-top: 1px solid var(--cc-stone);
        }
        .cc-metric:first-of-type {
          border-top: 0;
          padding-top: 0;
        }
        .cc-metric strong {
          display: block;
          font-family: var(--font-serif), Georgia, serif;
          font-size: 1.32rem;
          margin-bottom: 2px;
        }
        .cc-metric span {
          color: var(--cc-muted);
          font-size: 0.88rem;
        }

        /* SECTIONS */
        .cc-section {
          padding: 96px 0;
        }
        .cc-section.light {
          background: var(--cc-ivory);
        }
        .cc-section.white {
          background: var(--cc-white);
        }
        .cc-section.dark {
          background: #EAF6FA;
        }
        .cc-section-head {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 60px;
          margin-bottom: 48px;
          align-items: end;
        }
        .cc-section-head h2 {
          font-family: var(--font-serif), Georgia, serif;
          font-size: clamp(2rem, 4vw, 3.4rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 0;
          color: var(--cc-navy);
        }
        .cc-section-head p {
          margin-bottom: 0;
          color: var(--cc-slate);
          font-size: 1.03rem;
        }

        .cc-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }
        .cc-card {
          background: var(--cc-white);
          border: 1px solid var(--cc-stone);
          border-radius: var(--cc-radius);
          padding: 30px;
          box-shadow: 0 9px 28px rgba(7, 24, 41, 0.035);
        }
        .cc-card .cc-num {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: var(--cc-navy);
          color: #86C5DA;
          font-weight: 800;
          margin-bottom: 26px;
        }
        .cc-card h3 {
          font-family: var(--font-serif), Georgia, serif;
          font-size: 1.4rem;
          line-height: 1.2;
          margin-bottom: 14px;
          color: var(--cc-navy);
        }
        .cc-card p {
          color: var(--cc-slate);
        }
        .cc-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 22px;
        }
        .cc-tag {
          padding: 7px 10px;
          border-radius: 999px;
          border: 1px solid var(--cc-stone);
          background: white;
          font-size: 0.75rem;
          color: #58697b;
        }

        /* PROJECT STRIP */
        .cc-project-strip {
          background: white;
          color: var(--cc-navy);
          border: 1px solid var(--cc-stone);
          border-radius: 26px;
          padding: 42px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          box-shadow: var(--cc-shadow);
          overflow: hidden;
          position: relative;
        }
        .cc-project-strip:after {
          content: "";
          position: absolute;
          width: 270px;
          height: 270px;
          border-radius: 50%;
          border: 1px solid rgba(58, 159, 192, 0.18);
          right: -90px;
          bottom: -120px;
        }
        .cc-project-strip h3 {
          font-family: var(--font-serif), Georgia, serif;
          font-size: 1.8rem;
          margin-bottom: 12px;
          color: var(--cc-navy);
        }
        .cc-project-strip p {
          color: var(--cc-slate);
        }
        .cc-project-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .cc-project-item {
          border: 1px solid var(--cc-stone);
          border-radius: 14px;
          padding: 15px;
          background: #EAF6FA;
          color: var(--cc-navy-2);
          font-size: 0.9rem;
        }

        /* JOURNEY */
        .cc-journey {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
        }
        .cc-step {
          background: white;
          border: 1px solid var(--cc-stone);
          border-radius: 16px;
          padding: 22px 18px;
          min-height: 150px;
        }
        .cc-step b {
          display: block;
          color: var(--cc-gold);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          margin-bottom: 12px;
        }
        .cc-step strong {
          display: block;
          font-size: 0.98rem;
          margin-bottom: 8px;
          color: var(--cc-navy);
        }
        .cc-step span {
          color: var(--cc-slate);
          font-size: 0.82rem;
        }

        /* TOKEN ARCH */
        .cc-token-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .cc-token {
          background: white;
          border: 1px solid var(--cc-stone);
          border-radius: 22px;
          padding: 32px;
        }
        .cc-token-badge {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          font-size: 1.5rem;
          font-weight: 900;
          margin-bottom: 22px;
          background: #EAF6FA;
          border: 1px solid var(--cc-stone);
        }
        .cc-token.i .cc-token-badge {
          color: var(--cc-gold-2);
        }
        .cc-token.c .cc-token-badge {
          color: #667684;
        }
        .cc-token.n .cc-token-badge {
          color: var(--cc-navy-2);
        }
        .cc-token h3 {
          color: var(--cc-navy);
          font-family: var(--font-serif), Georgia, serif;
          font-size: 1.35rem;
          margin-bottom: 10px;
        }
        .cc-token p {
          color: var(--cc-slate);
          font-size: 0.92rem;
        }
        .cc-arch-line {
          margin-top: 34px;
          text-align: center;
          font-family: var(--font-serif), Georgia, serif;
          font-size: 1.4rem;
          color: var(--cc-navy-2);
        }
        .cc-arch-line span {
          color: var(--cc-gold-2);
        }

        /* ACCESS */
        .cc-access-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 36px;
        }
        .cc-feature-list {
          display: grid;
          gap: 12px;
        }
        .cc-feature {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          background: white;
          border: 1px solid var(--cc-stone);
          border-radius: 14px;
          padding: 16px 18px;
        }
        .cc-check {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: #D8EEF5;
          color: var(--cc-gold);
          flex: 0 0 24px;
          font-size: 0.75rem;
          font-weight: 900;
        }

        /* PRIVACY */
        .cc-privacy-card {
          background: white;
          color: var(--cc-navy);
          border: 1px solid var(--cc-stone);
          border-left: 5px solid var(--cc-gold);
          border-radius: 28px;
          padding: 48px;
          box-shadow: var(--cc-shadow);
        }
        .cc-privacy-card h2 {
          color: var(--cc-navy);
          font-family: var(--font-serif), Georgia, serif;
          font-size: clamp(1.9rem, 4vw, 3rem);
          line-height: 1.05;
          margin-bottom: 18px;
        }
        .cc-privacy-card > p {
          color: var(--cc-slate);
          max-width: 760px;
        }
        .cc-privacy-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 34px;
        }
        .cc-privacy-option {
          border: 1px solid var(--cc-stone);
          background: #EAF6FA;
          border-radius: 16px;
          padding: 20px;
        }
        .cc-privacy-option strong {
          display: block;
          margin-bottom: 7px;
          color: var(--cc-navy);
        }
        .cc-privacy-option span {
          color: var(--cc-slate);
          font-size: 0.87rem;
        }

        /* MEMBERSHIP PROCESS */
        .cc-process {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
          margin-top: 36px;
        }
        .cc-process .cc-p {
          background: var(--cc-white);
          border: 1px solid var(--cc-stone);
          border-radius: 14px;
          padding: 18px 14px;
          text-align: center;
          font-size: 0.84rem;
          position: relative;
          color: var(--cc-navy-2);
        }
        .cc-process .cc-p:not(:last-child):after {
          content: "→";
          position: absolute;
          right: -11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--cc-gold);
          font-weight: 900;
          z-index: 2;
        }

        /* CTA */
        .cc-final-cta {
          text-align: center;
          padding: 104px 0 112px;
          background: radial-gradient(circle at 50% 0%, rgba(58, 159, 192, 0.13), transparent 34%), #EAF6FA;
          color: var(--cc-navy);
          border-top: 1px solid var(--cc-stone);
        }
        .cc-final-cta h2 {
          color: var(--cc-navy);
          font-family: var(--font-serif), Georgia, serif;
          font-size: clamp(2.1rem, 5vw, 3.8rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          max-width: 860px;
          margin: 0 auto 20px;
        }
        .cc-final-cta p {
          color: var(--cc-slate);
          max-width: 720px;
          margin: 0 auto 30px;
        }
        .cc-legal {
          max-width: 900px;
          margin: 28px auto 0;
          font-size: 0.76rem;
          color: var(--cc-muted);
        }

        .cc-footer {
          background: white;
          color: var(--cc-muted);
          border-top: 1px solid var(--cc-stone);
          padding: 26px 0;
          font-size: 0.78rem;
        }
        .cc-footer-inner {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        /* RESPONSIVE */
        @media (max-width: 980px) {
          .cc-nav-links {
            display: none;
          }
          .cc-hero-inner,
          .cc-section-head,
          .cc-project-strip,
          .cc-access-grid {
            grid-template-columns: 1fr;
          }
          .cc-hero-inner {
            gap: 36px;
          }
          .cc-cards,
          .cc-token-grid,
          .cc-privacy-options {
            grid-template-columns: 1fr;
          }
          .cc-journey,
          .cc-process {
            grid-template-columns: repeat(2, 1fr);
          }
          .cc-project-grid {
            grid-template-columns: 1fr;
          }
          .cc-process .cc-p:after {
            display: none;
          }
        }
        @media (max-width: 620px) {
          .cc-wrap {
            width: min(var(--cc-max), calc(100% - 26px));
          }
          .cc-hero-inner {
            padding: 70px 0;
          }
          .cc-section {
            padding: 70px 0;
          }
          .cc-journey,
          .cc-process {
            grid-template-columns: 1fr;
          }
          .cc-hero-actions {
            flex-direction: column;
          }
          .cc-hero-actions .cc-btn {
            width: 100%;
          }
          .cc-project-strip,
          .cc-privacy-card {
            padding: 28px 22px;
          }
          .cc-footer-inner {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="cc-page">
        <header className="cc-header">
          <div className="cc-wrap cc-nav">
            <a className="cc-brand" href="#top" aria-label="TBP Capital Circles home">
              <div className="cc-brand-mark">TBP</div>
              <div className="cc-brand-copy">
                TBP Capital Circles™
                <small>Invitation-Only Capital Community</small>
              </div>
            </a>
            <nav className="cc-nav-links" aria-label="Primary">
              <a href="#circles">The Circles</a>
              <a href="#opportunities">Project Opportunities</a>
              <a href="#capital-architecture">Capital Architecture</a>
              <a href="#privacy">Privacy</a>
            </nav>
            <Link className="cc-btn cc-btn-gold" href="/portal/register-member">
              Proceed to Registration →
            </Link>
          </div>
        </header>

        <main id="top">
          {/* HERO */}
          <section className="cc-hero">
            <div className="cc-wrap cc-hero-inner">
              <div>
                <div className="cc-eyebrow">Invitation-Only Membership</div>
                <h1 className="cc-h1">A Private Gateway into the TBP Global Project &amp; Capital Ecosystem.</h1>
                <p className="cc-hero-sub">
                  TBP Capital Circles™ connects selected Family Offices &amp; HNWIs, institutional investors, private
                  capital providers and strategic participants with curated opportunities emerging across The
                  Borderless Project ecosystem — projected to become one of the world&apos;s largest single-network
                  neutral trade corridors, supporting US$10 trillion+ in corridor activity at maturity.
                </p>

                <div className="cc-hero-circles">
                  {heroChips.map((c) => (
                    <span className="cc-chip" key={c}>
                      {c}
                    </span>
                  ))}
                </div>

                <div className="cc-hero-actions">
                  <Link className="cc-btn cc-btn-gold" href="/portal/register-member">
                    Proceed to Membership Registration →
                  </Link>
                  <a className="cc-btn cc-btn-outline" href="#circles">
                    Explore the Capital Circles
                  </a>
                </div>

                <div className="cc-hero-note">Membership is by invitation and subject to TBP review and approval.</div>
              </div>

              <aside className="cc-hero-card" aria-label="Capital Circles overview">
                <div className="cc-mini-title">Private Capital Environment</div>
                {heroMetrics.map((m) => (
                  <div className="cc-metric" key={m.title}>
                    <strong>{m.title}</strong>
                    <span>{m.text}</span>
                  </div>
                ))}
              </aside>
            </div>
          </section>

          {/* ECOSYSTEM / PROJECT STRIP */}
          <section className="cc-section light">
            <div className="cc-wrap">
              <div className="cc-section-head">
                <h2>One Global Project Ecosystem. Multiple Capital Perspectives.</h2>
                <p>
                  TBP is developing an interconnected portfolio of projects, platforms and strategic infrastructure
                  across multiple regions. The Capital Circles provide a curated environment through which different
                  classes of capital can discover where their interests, expertise and strategic objectives may
                  align.
                </p>
              </div>

              <div className="cc-project-strip">
                <div>
                  <div className="cc-eyebrow">A Different Capital Discovery Model</div>
                  <h3>Projects first. Participation second.</h3>
                  <p>
                    Rather than presenting isolated deals by cheque size, TBP presents complete project ecosystems. A
                    single corridor, city, infrastructure platform or technology environment may offer multiple forms
                    of participation for different capital circles.
                  </p>
                </div>
                <div className="cc-project-grid">
                  {projectCategories.map((c) => (
                    <div className="cc-project-item" key={c}>
                      {c}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CIRCLES */}
          <section id="circles" className="cc-section white">
            <div className="cc-wrap">
              <div className="cc-section-head">
                <h2>The TBP Capital Circles.</h2>
                <p>
                  Three distinct capital communities within one curated TBP environment. Members may be eligible for
                  one or more circles depending on their organisation, mandate and investment profile.
                </p>
              </div>

              <div className="cc-cards">
                {circles.map((c) => (
                  <article className="cc-card" key={c.num}>
                    <div className="cc-num">{c.num}</div>
                    <h3>{c.name}</h3>
                    <p>{c.description}</p>
                    <div className="cc-tags">
                      {c.tags.map((t) => (
                        <span className="cc-tag" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* OPPORTUNITIES */}
          <section id="opportunities" className="cc-section light">
            <div className="cc-wrap">
              <div className="cc-section-head">
                <h2>Discover Curated TBP Project Opportunities.</h2>
                <p>
                  Capital Circle members can explore an evolving portfolio of TBP projects across regions and
                  sectors. Individual projects may offer different forms of investment, capital participation,
                  strategic partnership, technology participation or operating opportunity.
                </p>
              </div>

              <div className="cc-cards">
                {opportunityCards.map((o) => (
                  <article className="cc-card" key={o.title}>
                    <div className="cc-eyebrow">{o.eyebrow}</div>
                    <h3>{o.title}</h3>
                    <p>{o.text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* JOURNEY */}
          <section className="cc-section white">
            <div className="cc-wrap">
              <div className="cc-section-head">
                <h2>From Project Discovery to Participation.</h2>
                <p>The portal is designed around a structured institutional journey rather than an open marketplace.</p>
              </div>

              <div className="cc-journey">
                {journeySteps.map((s) => (
                  <div className="cc-step" key={s.n}>
                    <b>{s.n}</b>
                    <strong>{s.title}</strong>
                    <span>{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CAPITAL ARCHITECTURE */}
          <section id="capital-architecture" className="cc-section dark">
            <div className="cc-wrap">
              <div className="cc-section-head">
                <h2>TBP Capital Architecture.</h2>
                <p>
                  TBP is developing an evolving capital architecture intended to support participation at different
                  levels of its global project ecosystem.
                </p>
              </div>

              <div className="cc-token-grid">
                {tokens.map((t) => (
                  <article className={`cc-token ${t.cls}`} key={t.letter}>
                    <div className="cc-token-badge">{t.letter}</div>
                    <h3>{t.title}</h3>
                    <p>{t.text}</p>
                  </article>
                ))}
              </div>

              <div className="cc-arch-line">
                <span>Asset</span> → Corridor → Network &nbsp;&nbsp;|&nbsp;&nbsp; <span>I™</span> → C™ → N™
              </div>
            </div>
          </section>

          {/* ACCESS */}
          <section className="cc-section light">
            <div className="cc-wrap">
              <div className="cc-section-head">
                <h2>What Members Can Access.</h2>
                <p>
                  Access varies by membership status, project stage, confidentiality requirements and applicable
                  legal or regulatory considerations.
                </p>
              </div>

              <div className="cc-access-grid">
                <div className="cc-feature-list">
                  {accessFeatures.slice(0, 4).map((f) => (
                    <div className="cc-feature" key={f.title}>
                      <div className="cc-check">✓</div>
                      <div>
                        <strong>{f.title}</strong>
                        <br />
                        <span>{f.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cc-feature-list">
                  {accessFeatures.slice(4).map((f) => (
                    <div className="cc-feature" key={f.title}>
                      <div className="cc-check">✓</div>
                      <div>
                        <strong>{f.title}</strong>
                        <br />
                        <span>{f.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* PRIVACY */}
          <section id="privacy" className="cc-section white">
            <div className="cc-wrap">
              <div className="cc-privacy-card">
                <div className="cc-eyebrow">Privacy &amp; Discretion by Design</div>
                <h2>Membership does not require visibility.</h2>
                <p>
                  The TBP Capital Circles are intended for a community in which confidentiality and discretion
                  matter. Information provided during registration is used primarily by TBP to understand member
                  interests, support opportunity curation and facilitate Capital Advisory engagement.
                </p>

                <div className="cc-privacy-options">
                  {privacyOptions.map((p) => (
                    <div className="cc-privacy-option" key={p.title}>
                      <strong>{p.title}</strong>
                      <span>{p.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* MEMBERSHIP PROCESS */}
          <section className="cc-section light">
            <div className="cc-wrap">
              <div className="cc-section-head">
                <h2>Invitation-Only Membership.</h2>
                <p>
                  Registration enables TBP to understand your organisation, capital profile, geographic interests and
                  preferred areas of engagement. Submission does not automatically constitute membership approval.
                </p>
              </div>

              <div className="cc-process">
                {membershipProcess.map((p) => (
                  <div className="cc-p" key={p}>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="cc-final-cta">
            <div className="cc-wrap">
              <div className="cc-eyebrow">TBP Capital Circles™</div>
              <h2>Your invitation to explore what TBP is building.</h2>
              <p>
                Family Office &amp; Private Capital. Institutional Investment. Angel &amp; Innovation Capital. One
                curated gateway into the evolving TBP global project ecosystem.
              </p>
              <Link className="cc-btn cc-btn-gold" href="/portal/register-member">
                Proceed to Membership Registration →
              </Link>
              <div className="cc-legal">
                This page is intended for invited prospective members of the TBP Capital Circles™. Membership
                registration does not constitute an investment recommendation, financial advice, solicitation or
                offer of securities. Any future investment or capital participation will be subject to the
                applicable legal, regulatory, financial and jurisdictional requirements.
              </div>
            </div>
          </section>
        </main>

        <footer className="cc-footer">
          <div className="cc-wrap cc-footer-inner">
            <div>© 2026 The Borderless Project. All rights reserved.</div>
            <div>TBP Capital Circles™ · Private Access · Curated Opportunities · Capital Advisory</div>
          </div>
        </footer>
      </div>
    </>
  );
}
