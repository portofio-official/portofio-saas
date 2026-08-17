import { PageHeader } from "@/components/ui/PageHeader";

export function AdminHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />;
}