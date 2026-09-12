/**
 * College Domain Authentication & Verification Utilities
 * PVG's COET & GKPIM, Pune (pvgcoet.ac.in)
 */

export const ALLOWED_COLLEGE_DOMAIN = "pvgcoet.ac.in";
export const APP_OWNER_EMAIL = "ayushgadigone@gmail.com";

/**
 * Validates whether an email ends with @pvgcoet.ac.in or is the designated app owner.
 * Allows anyone with an email ending with @pvgcoet.ac.in (or any department subdomains).
 */
export function isValidCollegeEmail(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  
  // Matches any email ending with @pvgcoet.ac.in or .pvgcoet.ac.in
  const isCollegeDomain =
    clean.endsWith(`@${ALLOWED_COLLEGE_DOMAIN}`) ||
    clean.endsWith(`.${ALLOWED_COLLEGE_DOMAIN}`);

  return isCollegeDomain || clean === APP_OWNER_EMAIL.toLowerCase();
}

/**
 * Checks specifically if the email ends with @pvgcoet.ac.in
 */
export function isExactCollegeDomain(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return (
    clean.endsWith(`@${ALLOWED_COLLEGE_DOMAIN}`) ||
    clean.endsWith(`.${ALLOWED_COLLEGE_DOMAIN}`)
  );
}

export const COLLEGE_RESTRICTION_MESSAGE =
  "Access Restricted: Anyone with an official college email ID ending with @pvgcoet.ac.in can sign in.";
