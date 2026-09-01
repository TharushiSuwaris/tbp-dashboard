"use client";

import { useState } from "react";
import { portalTheme } from "@/lib/portal/theme";
import { requestInvitation } from "@/lib/portal/invitationRequests";
import { COUNTRIES, INVITATION_REQUEST_FAMILY_GROUP_CATEGORIES, INVITATION_REQUEST_PRIMARY_INTERESTS } from "@/lib/portal/content";

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

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input style={inputStyle} {...props} />
    </div>
  );
}

function Select({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
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

export default function RequestInvitationPage() {
  const [name, setName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [familyGroupCategory, setFamilyGroupCategory] = useState("");
  const [primaryInterest, setPrimaryInterest] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !organisation.trim() || !email.trim() || !country || !familyGroupCategory || !primaryInterest) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      await requestInvitation({
        name: name.trim(),
        organisation: organisation.trim(),
        email: email.trim(),
        country,
        familyGroupCategory,
        primaryInterest,
        message: message.trim(),
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
      <div style={{ width: "100%", maxWidth: 520, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ color: portalTheme.textPrimary, fontSize: 22, fontWeight: 700, margin: 0 }}>
            Request an Invitation
          </h1>
          <p style={{ color: portalTheme.textMuted, fontSize: 12.5, marginTop: 6 }}>
            TBP Investor Circle Member&apos;s Portal
          </p>
        </div>

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
                Request received.
              </p>
              <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 18 }}>
                TBP Capital Advisory will review your details and, if approved, send an invitation code to the email
                address you provided.
              </p>
              <a href="/portal/circles" style={{ color: portalTheme.gold, fontSize: 12.5, textDecoration: "none" }}>
                &larr; Back to TBP Capital Circles
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p style={{ color: portalTheme.textMuted, fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
                Please complete the short form below to request consideration for invitation-only access to the TBP
                Family Office &amp; Private Capital Circle.
              </p>

              <Field label="Full Name *" value={name} onChange={(e) => setName(e.target.value)} required />
              <Field
                label="Organisation / Family / Group Name *"
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                required
              />
              <Field
                label="Email Address *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div style={{ marginBottom: 16 }}>
                <Select label="Country / Region *" options={COUNTRIES} value={country} onChange={setCountry} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <Select
                  label="Family / Group Category *"
                  options={INVITATION_REQUEST_FAMILY_GROUP_CATEGORIES}
                  value={familyGroupCategory}
                  onChange={setFamilyGroupCategory}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <Select
                  label="Primary Interest *"
                  options={INVITATION_REQUEST_PRIMARY_INTERESTS}
                  value={primaryInterest}
                  onChange={setPrimaryInterest}
                />
              </div>

              <div>
                <label style={labelStyle}>Short Message</label>
                <p style={{ color: portalTheme.textMuted, fontSize: 11.5, margin: "-2px 0 10px", fontStyle: "italic" }}>
                  Please briefly tell us why you are interested in the TBP Family Office &amp; Private Capital
                  Circle.
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              {error && <div style={{ color: portalTheme.danger, fontSize: 12.5, marginBottom: 14 }}>{error}</div>}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "10px 22px",
                  borderRadius: 8,
                  border: "none",
                  background: portalTheme.gold,
                  color: portalTheme.goldText,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>

              <p style={{ color: portalTheme.textMuted, fontSize: 10.5, lineHeight: 1.6, marginTop: 18, marginBottom: 0 }}>
                Submission of this request does not guarantee membership, portal access, project allocation,
                participation rights or financial return. Access remains subject to TBP review, eligibility,
                approval, confidentiality requirements and applicable legal or regulatory considerations.
              </p>

              <div style={{ textAlign: "center", marginTop: 16 }}>
                <a href="/portal/circles" style={{ color: portalTheme.textMuted, fontSize: 12.5, textDecoration: "none" }}>
                  &larr; Back to TBP Capital Circles
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
