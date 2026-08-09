export const PASSWORD_MIN_LENGTH = 8;

export type PasswordRuleKey =
  | "minLength"
  | "lowercase"
  | "uppercase"
  | "number"
  | "special";

export interface PasswordStrength {
  valid: boolean;
  passed: PasswordRuleKey[];
  failed: PasswordRuleKey[];
}

const RULE_CHECKS: Array<{ key: PasswordRuleKey; ok: (pw: string) => boolean }> = [
  { key: "minLength", ok: (pw) => pw.length >= PASSWORD_MIN_LENGTH },
  { key: "lowercase", ok: (pw) => /[a-z]/.test(pw) },
  { key: "uppercase", ok: (pw) => /[A-Z]/.test(pw) },
  { key: "number", ok: (pw) => /[0-9]/.test(pw) },
  { key: "special", ok: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export function checkPasswordStrength(password: string): PasswordStrength {
  const passed = RULE_CHECKS.filter((r) => r.ok(password)).map((r) => r.key);
  const failed = RULE_CHECKS.filter((r) => !r.ok(password)).map((r) => r.key);
  return { valid: failed.length === 0, passed, failed };
}

export function firstFailedPasswordRule(password: string): PasswordRuleKey | null {
  const { failed } = checkPasswordStrength(password);
  return failed[0] ?? null;
}