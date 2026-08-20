"use client";

import { useState } from "react";
import { requestMemberSignup } from "@/lib/portal/memberAuth";
import { CAPITAL_CIRCLES, OPPORTUNITY_SECTORS } from "@/lib/portal/content";
import { portalTheme } from "@/lib/portal/theme";

const STEPS = ["Details", "Investment Profile", "Review & Submit"];

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  color: portalTheme.textSecondary,
  textTransform: "uppercase",
  letterSpacing: ".6px",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1px solid ${portalTheme.inputBorder}`,
  background: portalTheme.inputBackground,
  color: portalTheme.textPrimary,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  marginBottom: 16,
};

const fieldRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 };

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input style={inputStyle} {...props} />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea
        style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}

export default function RegisterMemberPage() {
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [linkedinOrWebsite, setLinkedinOrWebsite] = useState("");
  const [capitalCircle, setCapitalCircle] = useState("");
  const [sectorInterests, setSectorInterests] = useState<string[]>([]);
  const [referralCode, setReferralCode] = useState("");

  // Step 2 — required, so TBP has this on hand before reviewing the request
  const [familyOrGroupBackground, setFamilyOrGroupBackground] = useState("");
  const [geography, setGeography] = useState("");
  const [capitalAppetite, setCapitalAppetite] = useState("");
  const [investmentHorizon, setInvestmentHorizon] = useState("");
  const [riskPreference, setRiskPreference] = useState("");
  const [esgAlignment, setEsgAlignment] = useState("");
  const [legacyObjectives, setLegacyObjectives] = useState("");

  // Step 3
  const [consent, setConsent] = useState(false);

  function toggleSector(s: string) {
    setSectorInterests((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function validateStep1(): string | null {
    if (!name.trim() || !email.trim()) return "Name and email are required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (!capitalCircle) return "Please select which Capital Circle best describes you.";
    if (sectorInterests.length === 0) return "Please select at least one sector of interest.";
    return null;
  }

  function validateStep2(): string | null {
    if (
      !familyOrGroupBackground.trim() ||
      !geography.trim() ||
      !capitalAppetite.trim() ||
      !investmentHorizon.trim() ||
      !riskPreference.trim() ||
      !esgAlignment.trim() ||
      !legacyObjectives.trim()
    ) {
      return "Please complete every field in this section — TBP reviews your request against this information.";
    }
    return null;
  }

  function handleNext() {
    const err = step === 0 ? validateStep1() : step === 1 ? validateStep2() : null;
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => s + 1);
  }

  async function handleSubmit() {
    if (!consent) {
      setError("Please confirm the declaration below before submitting.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await requestMemberSignup({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        organisation: organisation.trim(),
        roleTitle: roleTitle.trim(),
        city: city.trim(),
        country: country.trim(),
        linkedinOrWebsite: linkedinOrWebsite.trim(),
        capitalCircle,
        sectorInterests,
        referralCode: referralCode.trim(),
        familyOrGroupBackground: familyOrGroupBackground.trim(),
        geography: geography.trim(),
        capitalAppetite: capitalAppetite.trim(),
        investmentHorizon: investmentHorizon.trim(),
        riskPreference: riskPreference.trim(),
        esgAlignment: esgAlignment.trim(),
        legacyObjectives: legacyObjectives.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: portalTheme.background,
        fontFamily: "sans-serif",
        padding: "40px 24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ color: portalTheme.textPrimary, fontSize: 22, fontWeight: 700, margin: 0 }}>
            TBP Capital Circles
          </h1>
          <p style={{ color: portalTheme.textMuted, fontSize: 12.5, marginTop: 6 }}>Circle Membership Registration</p>
        </div>

        {!submitted && (
          <div style={{ display: "flex", justifyContent: "center", gap: 28, marginBottom: 28 }}>
            {STEPS.map((label, i) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    margin: "0 auto 6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    background: i <= step ? portalTheme.gold : "rgba(27,42,61,0.08)",
                    color: i <= step ? portalTheme.goldText : portalTheme.textMuted,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: 11, color: i === step ? portalTheme.textPrimary : portalTheme.textMuted, fontWeight: i === step ? 700 : 400 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            background: portalTheme.panel,
            border: `1px solid ${portalTheme.panelBorder}`,
            borderRadius: 12,
            padding: "28px 26px",
          }}
        >
          {submitted ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: portalTheme.textPrimary, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Request submitted.
              </p>
              <p style={{ color: portalTheme.textMuted, fontSize: 13 }}>
                TBP will review your details and assign a Capital Advisor. You&apos;ll be able to log in with the
                email and password you just set once approved.
              </p>
              <a href="/portal/login" style={{ color: portalTheme.gold, fontSize: 12.5, textDecoration: "none" }}>
                &larr; Back to Log In
              </a>
            </div>
          ) : (
            <>
              {step === 0 && (
                <div>
                  <div
                    style={{
                      background: "rgba(196,153,42,0.06)",
                      border: `1px solid ${portalTheme.panelBorder}`,
                      borderRadius: 10,
                      padding: "16px 18px",
                      marginBottom: 18,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, color: portalTheme.gold, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 12 }}>
                      Create Your Account
                    </div>
                    <div style={fieldRow}>
                      <Field label="Email Address *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      <Field label="Password *" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Field label="Confirm Password *" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                  </div>

                  <Field label="Full Name *" value={name} onChange={(e) => setName(e.target.value)} required />

                  <div style={fieldRow}>
                    <Field label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <Field label="Organisation / Family Office" value={organisation} onChange={(e) => setOrganisation(e.target.value)} />
                  </div>

                  <div style={fieldRow}>
                    <Field label="Role / Title" value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} />
                    <Field label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>

                  <div style={fieldRow}>
                    <Field label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
                    <Field label="LinkedIn / Company Website" value={linkedinOrWebsite} onChange={(e) => setLinkedinOrWebsite(e.target.value)} />
                  </div>

                  <label style={labelStyle}>Which Capital Circle best describes you? *</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, marginBottom: 16 }}>
                    {CAPITAL_CIRCLES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCapitalCircle(c)}
                        style={{
                          padding: "10px 12px",
                          borderRadius: 8,
                          fontSize: 12.5,
                          cursor: "pointer",
                          border: `1px solid ${capitalCircle === c ? portalTheme.gold : portalTheme.inputBorder}`,
                          background: capitalCircle === c ? "rgba(196,153,42,0.14)" : portalTheme.inputBackground,
                          color: capitalCircle === c ? portalTheme.gold : portalTheme.textSecondary,
                          fontWeight: capitalCircle === c ? 700 : 500,
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  <label style={labelStyle}>Sector Interest * (select at least one)</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                    {OPPORTUNITY_SECTORS.map((s) => {
                      const active = sectorInterests.includes(s);
                      return (
                        <label
                          key={s}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "9px 11px",
                            borderRadius: 8,
                            fontSize: 12.5,
                            cursor: "pointer",
                            border: `1px solid ${active ? portalTheme.gold : portalTheme.inputBorder}`,
                            background: active ? "rgba(196,153,42,0.1)" : portalTheme.inputBackground,
                            color: active ? portalTheme.gold : portalTheme.textSecondary,
                          }}
                        >
                          <input type="checkbox" checked={active} onChange={() => toggleSector(s)} style={{ margin: 0 }} />
                          {s}
                        </label>
                      );
                    })}
                  </div>

                  <Field label="Referral / Invitation Code (optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />
                </div>
              )}

              {step === 1 && (
                <div>
                  <p style={{ color: portalTheme.textMuted, fontSize: 12.5, marginBottom: 16 }}>
                    TBP&apos;s Capital Advisory &amp; Coordination Office reviews every request against this
                    information — please complete all fields.
                  </p>
                  <TextAreaField label="Family / Group Background *" value={familyOrGroupBackground} onChange={setFamilyOrGroupBackground} required />
                  <TextAreaField label="Geography Focus *" value={geography} onChange={setGeography} required />
                  <TextAreaField label="Capital Appetite *" value={capitalAppetite} onChange={setCapitalAppetite} required />
                  <TextAreaField label="Investment Horizon *" value={investmentHorizon} onChange={setInvestmentHorizon} required />
                  <TextAreaField label="Risk Preference *" value={riskPreference} onChange={setRiskPreference} required />
                  <TextAreaField label="ESG Alignment *" value={esgAlignment} onChange={setEsgAlignment} required />
                  <TextAreaField label="Legacy Objectives *" value={legacyObjectives} onChange={setLegacyObjectives} required />
                </div>
              )}

              {step === 2 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: portalTheme.textMuted, textTransform: "uppercase", letterSpacing: ".6px", marginBottom: 10 }}>
                    Review Your Submission
                  </div>
                  <div style={{ fontSize: 13, color: portalTheme.textSecondary, lineHeight: 2, marginBottom: 18 }}>
                    <div><strong style={{ color: portalTheme.textPrimary }}>{name}</strong> &middot; {email}</div>
                    {organisation && <div>{organisation}{roleTitle ? ` — ${roleTitle}` : ""}</div>}
                    {(city || country) && <div>{[city, country].filter(Boolean).join(", ")}</div>}
                    <div>Capital Circle: <strong style={{ color: portalTheme.textPrimary }}>{capitalCircle}</strong></div>
                    <div>Sector Interest: {sectorInterests.join(" · ")}</div>
                  </div>

                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 3 }} />
                    <span style={{ fontSize: 12, color: portalTheme.textMuted, lineHeight: 1.6 }}>
                      I confirm the information provided is accurate. I understand this is a request for review by
                      TBP&apos;s Capital Advisory &amp; Coordination Office and does not constitute membership,
                      an offer, or a solicitation until approved.
                    </span>
                  </label>
                </div>
              )}

              {error && <div style={{ color: portalTheme.danger, fontSize: 12.5, marginTop: 14 }}>{error}</div>}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={() => { setError(null); setStep((s) => s - 1); }}
                    style={{ padding: "10px 18px", borderRadius: 8, border: `1px solid ${portalTheme.panelBorder}`, background: "transparent", color: portalTheme.textMuted, fontSize: 13, cursor: "pointer" }}
                  >
                    &larr; Back
                  </button>
                ) : (
                  <a href="/portal/login" style={{ color: portalTheme.textMuted, fontSize: 12.5, textDecoration: "none", alignSelf: "center" }}>
                    &larr; Back to Log In
                  </a>
                )}

                {step < 2 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: portalTheme.gold, color: portalTheme.goldText, fontWeight: 700, fontSize: 13, cursor: "pointer" }}
                  >
                    Continue &rarr;
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{ padding: "10px 22px", borderRadius: 8, border: "none", background: portalTheme.gold, color: portalTheme.goldText, fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? "Submitting..." : "Submit Request"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
