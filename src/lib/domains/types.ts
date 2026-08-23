export type CustomDomainStatus = "pending_verification" | "verified" | "failed" | "removed";

export interface CustomDomainRecord {
  id: string;
  projectId: string;
  domain: string;
  status: CustomDomainStatus;
  verificationToken: string;
  lastCheckedAt: string | null;
  createdAt: string;
  verifiedAt: string | null;
}

export interface DnsInstruction {
  type: string;
  name: string;
  value: string;
}
