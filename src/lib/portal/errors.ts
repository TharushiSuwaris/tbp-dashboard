// Translates raw Postgres/PostgREST errors (e.g. "duplicate key value
// violates unique constraint \"portal_users_email_key\"") into messages a
// TBP staff member or applicant can actually act on. Supabase-js error
// objects from both .from(...) calls and .rpc(...) calls share the
// PostgrestError shape: { message, details, hint, code }.
export function friendlyDbError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const err = error as { code?: string; message?: string } | null;
  const message = err?.message ?? "";

  const isUniqueViolation = err?.code === "23505" || /duplicate key value violates unique constraint/i.test(message);
  if (isUniqueViolation) {
    if (/email/i.test(message)) return "An account with this email already exists.";
    return "This already exists.";
  }

  if (err?.code === "23503" || /violates foreign key constraint/i.test(message)) {
    return "This refers to something that no longer exists — please refresh and try again.";
  }

  if (err?.code === "23502" || /null value in column/i.test(message)) {
    return "Please fill in all required fields.";
  }

  return message || fallback;
}
