"use client";

import { useEffect, useRef, useState } from "react";
import { requestMemberSignup } from "@/lib/portal/memberAuth";
import { checkInvitationEmail, previewInvitation, type InvitationPreview } from "@/lib/portal/invitations";
import { CAPITAL_CIRCLES, OPPORTUNITY_SECTORS } from "@/lib/portal/content";
import { portalTheme } from "@/lib/portal/theme";

const STEPS = ["Details", "Capital Profile", "Review & Submit"];

const FAMILY_GROUP_CATEGORIES = [
  "Single Family Office",
  "Multi-Family Office",
  "Private Investment Company",
  "Private Capital / PE",
  "Institutional Investor",
  "Asset Manager",
  "Pension / Insurance",
  "Bank / DFI",
  "Corporate Investment Arm",
  "Angel / Individual Investor",
  "Other",
];

const GEOGRAPHY_FOCUS_OPTIONS = [
  "Global",
  "Africa",
  "Europe",
  "Middle East",
  "North America",
  "Central Asia",
  "South Asia",
  "Southeast Asia",
  "East Asia",
  "Latin America",
];

const CAPITAL_PARTICIPATION_INTERESTS = [
  "Infrastructure",
  "Real Assets",
  "Project Finance",
  "Co-Investment",
  "Private Equity",
  "Venture / Innovation",
  "Energy",
  "Maritime",
  "Technology",
  "Strategic Partnership",
  "Operating Partnership",
  "Corridor-Level Participation",
];

const INVESTMENT_HORIZON_OPTIONS = ["Opportunistic / Project Dependent", "1–3 Years", "3–7 Years", "7–15 Years", "15+ Years / Long-Term"];

const INVESTMENT_ORIENTATION_OPTIONS = ["Capital Preservation", "Conservative", "Balanced", "Growth", "Innovation / Venture", "Project Dependent"];

const ESG_ALIGNMENT_OPTIONS = [
  "Sustainable Infrastructure",
  "Energy Transition",
  "Climate Resilience",
  "Energy Security",
  "Trade & Economic Inclusion",
  "Employment & Skills",
  "Food Security",
  "Digital Infrastructure",
  "Social Impact",
  "No Specific Mandate",
];

const STRATEGIC_IMPACT_OBJECTIVES_OPTIONS = [
  "Intergenerational Value",
  "Long-Term Economic Impact",
  "Regional Development",
  "Infrastructure Development",
  "Innovation",
  "Strategic Resilience",
  "Sustainable Development",
  "Philanthropic / Impact Objectives",
  "No Specific Objective",
];

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

// Single-select: a plain dropdown
function SingleChoice({
  label,
  options,
  value,
  onChange,
  hint,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={labelStyle}>{label}</label>
      {hint && <p style={{ color: portalTheme.textMuted, fontSize: 11.5, margin: "-2px 0 10px", fontStyle: "italic" }}>{hint}</p>}
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, marginBottom: 0 }}>
        <option value="" disabled>
          Select...
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// Multi-select: a real dropdown - closed by default showing a summary of
// what's picked, opens a checkbox panel on click, closes on an outside
// click or when you're done. Looks and behaves like SingleChoice above,
// just allows more than one pick.
function MultiChoice({
  label,
  options,
  values,
  onChange,
  hint,
}: {
  label: string;
  options: string[];
  values: string[];
  onChange: (v: string[]) => void;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggle(opt: string) {
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);
  }

  const summary = values.length === 0 ? "Select..." : values.length <= 2 ? values.join(", ") : `${values.length} selected`;

  return (
    <div style={{ marginBottom: 20 }} ref={ref}>
      <label style={labelStyle}>{label}</label>
      {hint && <p style={{ color: portalTheme.textMuted, fontSize: 11.5, margin: "-2px 0 10px" }}>{hint}</p>}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            ...inputStyle,
            marginBottom: 0,
            textAlign: "left",
            cursor: "pointer",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: values.length === 0 ? portalTheme.textMuted : portalTheme.textPrimary,
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{summary}</span>
          <span style={{ color: portalTheme.textMuted, marginLeft: 8, flexShrink: 0 }}>{open ? "▲" : "▼"}</span>
        </button>

        {open && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              zIndex: 10,
              background: portalTheme.panel,
              border: `1px solid ${portalTheme.inputBorder}`,
              borderRadius: 8,
              boxShadow: "0 8px 24px rgba(27,42,61,0.15)",
              maxHeight: 260,
              overflowY: "auto",
              padding: 6,
            }}
          >
            {options.map((opt) => {
              const active = values.includes(opt);
              return (
                <label
                  key={opt}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    padding: "8px 10px",
                    borderRadius: 6,
                    fontSize: 12.5,
                    cursor: "pointer",
                    color: active ? portalTheme.gold : portalTheme.textSecondary,
                    background: active ? "rgba(196,153,42,0.08)" : "transparent",
                  }}
                >
                  <input type="checkbox" checked={active} onChange={() => toggle(opt)} style={{ margin: 0 }} />
                  {opt}
                </label>
              );
            })}
          </div>
        )}
      </div>
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
  const [sectorInterests, setSectorInterests] = useState<string[]>([]);
  const [additionalCircleRelevance, setAdditionalCircleRelevance] = useState<string[]>([]);

  // Invitation code — required, verified against the invitations table
  const [invitationCode, setInvitationCode] = useState("");
  const [invitationStatus, setInvitationStatus] = useState<"idle" | "checking" | "verified" | "invalid">("idle");
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [invitation, setInvitation] = useState<InvitationPreview | null>(null);
  const [emailMismatch, setEmailMismatch] = useState(false);
  const capitalCircle = invitation?.capital_circle ?? "";

  // Step 2 — selection-led Capital Profile
  const [familyGroupCategory, setFamilyGroupCategory] = useState("");
  const [familyGroupOther, setFamilyGroupOther] = useState("");
  const [geographyFocus, setGeographyFocus] = useState<string[]>([]);
  const [participationInterests, setParticipationInterests] = useState<string[]>([]);
  const [investmentHorizon, setInvestmentHorizon] = useState("");
  const [investmentOrientation, setInvestmentOrientation] = useState("");
  const [esgAlignment, setEsgAlignment] = useState<string[]>([]);
  const [strategicObjectives, setStrategicObjectives] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Step 3
  const [consent, setConsent] = useState(false);

  async function handleCheckInvitationCode() {
    const code = invitationCode.trim();
    if (!code) {
      setInvitationStatus("idle");
      setInvitation(null);
      return;
    }
    setInvitationStatus("checking");
    setInvitationError(null);
    try {
      const preview = await previewInvitation(code);
      setInvitation(preview);
      setInvitationStatus("verified");
      if (email.trim()) {
        const match = await checkInvitationEmail(code, email.trim());
        setEmailMismatch(!match);
      }
    } catch (err) {
      setInvitation(null);
      setInvitationStatus("invalid");
      setInvitationError(err instanceof Error ? err.message : "Invalid invitation code.");
    }
  }

  async function handleCheckEmailMatch() {
    if (invitationStatus !== "verified" || !email.trim()) return;
    try {
      const match = await checkInvitationEmail(invitationCode.trim(), email.trim());
      setEmailMismatch(!match);
    } catch {
      // non-fatal — the authoritative check happens server-side at submit
    }
  }

  function validateStep1(): string | null {
    if (!name.trim() || !email.trim()) return "Name and email are required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (invitationStatus !== "verified" || !invitation) return "Please enter a valid, verified invitation code.";
    if (emailMismatch) return "This invitation is associated with another email address.";
    if (sectorInterests.length === 0) return "Please select at least one sector of interest.";
    return null;
  }

  function validateStep2(): string | null {
    if (!familyGroupCategory) return "Please select the category that best describes you.";
    if (familyGroupCategory === "Other" && !familyGroupOther.trim()) return "Please describe your category.";
    if (geographyFocus.length === 0) return "Please select at least one geography focus.";
    if (participationInterests.length === 0) return "Please select at least one capital & participation interest.";
    if (!investmentHorizon) return "Please select an investment horizon.";
    if (!investmentOrientation) return "Please select an indicative investment orientation.";
    if (esgAlignment.length === 0) return "Please select at least one ESG alignment (or \"No Specific Mandate\").";
    if (strategicObjectives.length === 0) return "Please select at least one strategic & impact objective (or \"No Specific Objective\").";
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
        invitationCode: invitationCode.trim(),
        familyOrGroupBackground: familyGroupCategory === "Other" ? familyGroupOther.trim() : familyGroupCategory,
        geographyFocus,
        capitalParticipationInterests: participationInterests,
        investmentHorizon,
        riskPreference: investmentOrientation,
        esgAlignmentInterests: esgAlignment,
        strategicImpactObjectives: strategicObjectives,
        additionalNotes: additionalNotes.trim(),
        additionalCircleRelevance,
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
      <div style={{ width: "100%", maxWidth: 720, margin: "0 auto" }}>
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
                      Your Invitation
                    </div>
                    <label style={labelStyle}>Private Invitation Code *</label>
                    <p style={{ color: portalTheme.textMuted, fontSize: 11.5, margin: "-2px 0 10px", fontStyle: "italic" }}>
                      Your personal invitation code is included in your TBP Capital Circles invitation.
                    </p>
                    <input
                      style={{ ...inputStyle, marginBottom: 0, textTransform: "uppercase" }}
                      value={invitationCode}
                      onChange={(e) => {
                        setInvitationCode(e.target.value);
                        setInvitationStatus("idle");
                        setInvitation(null);
                        setEmailMismatch(false);
                      }}
                      onBlur={handleCheckInvitationCode}
                      placeholder="TBP-XXXX-XXXX"
                    />
                    {invitationStatus === "checking" && (
                      <p style={{ color: portalTheme.textMuted, fontSize: 12, marginTop: 8 }}>Verifying...</p>
                    )}
                    {invitationStatus === "invalid" && invitationError && (
                      <p style={{ color: portalTheme.danger, fontSize: 12, marginTop: 8 }}>{invitationError}</p>
                    )}
                    {invitationStatus === "verified" && invitation && (
                      <div style={{ marginTop: 10 }}>
                        <p style={{ color: "#0F8A5F", fontSize: 12.5, fontWeight: 700, margin: "0 0 6px" }}>✓ Invitation Verified</p>
                        <p style={{ color: portalTheme.textSecondary, fontSize: 12.5, margin: 0 }}>
                          Invited Circle: <strong style={{ color: portalTheme.textPrimary }}>{invitation.capital_circle} Circle™</strong>
                        </p>
                        {emailMismatch && (
                          <p style={{ color: portalTheme.danger, fontSize: 12, marginTop: 8 }}>
                            This invitation is associated with another email address. Please use the email address to
                            which your TBP invitation was issued or contact TBP Capital Advisory.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

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
                      <Field label="Email Address *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={handleCheckEmailMatch} required />
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

                  <MultiChoice
                    label="Sector Interest * (select at least one)"
                    options={[...OPPORTUNITY_SECTORS]}
                    values={sectorInterests}
                    onChange={setSectorInterests}
                  />

                  {invitationStatus === "verified" && invitation && (
                    <MultiChoice
                      label="Additional Circle Relevance — Optional"
                      hint="If you may also be relevant to other Capital Circles, you can flag that here — this does not change your invited Circle."
                      options={[...CAPITAL_CIRCLES].filter((c) => c !== invitation.capital_circle)}
                      values={additionalCircleRelevance}
                      onChange={setAdditionalCircleRelevance}
                    />
                  )}
                </div>
              )}

              {step === 1 && (
                <div>
                  <p style={{ color: portalTheme.textMuted, fontSize: 12.5, marginBottom: 20 }}>
                    Select the options that best describe you — this takes about a minute. TBP&apos;s Capital
                    Advisory &amp; Coordination Office reviews every request against this information.
                  </p>

                  <SingleChoice label="Family / Group Category *" options={FAMILY_GROUP_CATEGORIES} value={familyGroupCategory} onChange={setFamilyGroupCategory} />
                  {familyGroupCategory === "Other" && (
                    <Field label="Please describe *" value={familyGroupOther} onChange={(e) => setFamilyGroupOther(e.target.value)} />
                  )}

                  <MultiChoice label="Geography Focus * (select all that apply)" options={GEOGRAPHY_FOCUS_OPTIONS} values={geographyFocus} onChange={setGeographyFocus} />

                  <MultiChoice
                    label="Capital & Participation Interests * (select all that apply)"
                    options={CAPITAL_PARTICIPATION_INTERESTS}
                    values={participationInterests}
                    onChange={setParticipationInterests}
                  />

                  <SingleChoice label="Investment Horizon *" options={INVESTMENT_HORIZON_OPTIONS} value={investmentHorizon} onChange={setInvestmentHorizon} />

                  <SingleChoice
                    label="Indicative Investment Orientation *"
                    options={INVESTMENT_ORIENTATION_OPTIONS}
                    value={investmentOrientation}
                    onChange={setInvestmentOrientation}
                    hint="For membership profiling and opportunity relevance only."
                  />

                  <MultiChoice label="ESG Alignment * (select all that apply)" options={ESG_ALIGNMENT_OPTIONS} values={esgAlignment} onChange={setEsgAlignment} />

                  <MultiChoice
                    label="Strategic & Impact Objectives * (select all that apply)"
                    options={STRATEGIC_IMPACT_OBJECTIVES_OPTIONS}
                    values={strategicObjectives}
                    onChange={setStrategicObjectives}
                  />

                  <div>
                    <label style={labelStyle}>Anything Else We Should Know? (Optional)</label>
                    <textarea
                      style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit", marginBottom: 0 }}
                      rows={3}
                      placeholder="Please share any particular investment themes, strategic interests, regions, projects or participation objectives you would like TBP Capital Advisory to be aware of."
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                    />
                  </div>
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
                    <div>Category: {familyGroupCategory === "Other" ? familyGroupOther : familyGroupCategory}</div>
                    <div>Geography Focus: {geographyFocus.join(" · ")}</div>
                    <div>Capital &amp; Participation Interests: {participationInterests.join(" · ")}</div>
                    <div>Investment Horizon: {investmentHorizon}</div>
                    <div>Indicative Investment Orientation: {investmentOrientation}</div>
                    <div>ESG Alignment: {esgAlignment.join(" · ")}</div>
                    <div>Strategic &amp; Impact Objectives: {strategicObjectives.join(" · ")}</div>
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
