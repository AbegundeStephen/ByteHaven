export interface PasswordCheck {
  valid: boolean;
  reason?: string;
}

/** Minimum-strength rule for admin passwords (FR-E3): at least 10 characters,
 * with at least one letter and one number. */
export function checkPasswordStrength(password: string): PasswordCheck {
  if (password.length < 10) {
    return { valid: false, reason: "Password must be at least 10 characters." };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return {
      valid: false,
      reason: "Password must contain at least one letter.",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      reason: "Password must contain at least one number.",
    };
  }
  return { valid: true };
}
