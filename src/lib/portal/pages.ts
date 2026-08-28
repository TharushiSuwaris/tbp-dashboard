import type { PortalRole } from "./session";

export type PortalPageDef = {
  path: string;
  label: string;
  description: string;
  roles: PortalRole[];
  // Consecutive entries sharing the same section render together under one
  // small heading in the Circle Portal's own sidebar (see PortalSidebar.tsx).
  // Entries with no section render flush, with no heading above them.
  section?: string;
};

// Matches the "Portal Pages by Role" breakdown discussed for the FO Circle
// role-based access proposal. Deliberately does NOT include any of the
// existing /dashboard/* internal pages - a Circle Member should never see
// TBP's own prospect-sourcing/scoring tools, which include evaluations of
// family offices (potentially including themselves or peers).
//
// super_admin sees everything admin sees, plus Admin Account Requests,
// which is exclusive to super_admin - enforced in the database function
// itself, not just here (see migration_super_admin.sql).
export const PORTAL_PAGES: PortalPageDef[] = [
  {
    path: "/portal/account",
    label: "My Account",
    description: "Your profile details and password",
    roles: ["circle_member", "admin", "super_admin"],
  },
  {
    path: "/portal/opportunities",
    label: "Curated Projects",
    description: "Browse published opportunities and apply",
    roles: ["circle_member", "admin", "super_admin"],
    section: "Opportunities & Events",
  },
  {
    path: "/portal/events",
    label: "Events & Roundtables",
    description: "Private briefings and roundtables",
    roles: ["circle_member", "admin", "super_admin"],
    section: "Opportunities & Events",
  },
  {
    path: "/portal/my-invitations",
    label: "My Invitations",
    description: "Event invitations TBP Capital Advisory has granted you",
    roles: ["circle_member", "admin", "super_admin"],
    section: "Opportunities & Events",
  },
  {
    path: "/portal/messages",
    label: "Correspondence",
    description: "Correspondence with your assigned TBP Capital Advisor",
    roles: ["circle_member", "admin", "super_admin"],
    section: "Communications",
  },
  {
    path: "/portal/briefings",
    label: "Briefings & Enquiries",
    description: "Submit structured requests to TBP Capital Advisory",
    roles: ["circle_member", "admin", "super_admin"],
    section: "Communications",
  },
  {
    path: "/portal/opportunities/manage",
    label: "Opportunity Management",
    description: "Create, edit, and publish investment opportunities",
    roles: ["admin", "super_admin"],
  },
  {
    path: "/portal/profiles/review",
    label: "Profile Review",
    description: "Approve or reject submitted member profiles",
    roles: ["admin", "super_admin"],
  },
  {
    path: "/portal/applications",
    label: "Application Review",
    description: "See who applied to which opportunity",
    roles: ["admin", "super_admin"],
  },
  {
    path: "/portal/member-requests",
    label: "Circle Member Requests",
    description: "Review registrations, assign advisors, and approve new Circle Members",
    roles: ["super_admin"],
  },
  {
    path: "/portal/invitations",
    label: "Invitations",
    description: "Generate private invitation codes for prospective members",
    roles: ["super_admin"],
  },
  {
    path: "/portal/admin-requests",
    label: "Admin Account Requests",
    description: "Approve or reject requests for new Admin accounts",
    roles: ["super_admin"],
  },
  {
    path: "/portal/manage-users",
    label: "Manage User Accounts",
    description: "Delete Admin or Circle Member accounts",
    roles: ["super_admin"],
  },
];

export function portalPagesForRole(role: string): PortalPageDef[] {
  return PORTAL_PAGES.filter((p) => p.roles.includes(role as PortalRole));
}
