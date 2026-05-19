import { Shell } from "@/components/shell/Shell";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Shell>{children}</Shell>;
}
