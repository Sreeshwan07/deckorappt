// Admin emails that bypass payment for free downloads
const ADMIN_EMAILS = ["mdr.gemini@gmail.com"];

export function isAdminUser(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
