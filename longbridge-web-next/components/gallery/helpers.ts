// Plain helper functions — no React, no client directive.
// Safe to import from both server and client components.

export function shortStrat(name: string): string {
  if (name.startsWith("Buffett")) return "Buffett";
  if (name.startsWith("Wood")) return "Wood";
  if (name.startsWith("Simons")) return "Simons";
  if (name.startsWith("Soros")) return "Soros";
  if (name.startsWith("Lynch")) return "Lynch";
  return name.split(" ")[0];
}

export function methodOf(name: string): "基本面" | "技术" | "宏观" | "复合" {
  if (name.startsWith("Buffett") || name.startsWith("Wood") || name.startsWith("Lynch"))
    return "基本面";
  if (name.startsWith("Simons") || name.startsWith("Turtle")) return "技术";
  if (name.startsWith("Soros") || name.startsWith("All-Weather")) return "宏观";
  return "复合";
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600_000);
  if (h < 1) return `${Math.max(1, Math.floor(diff / 60_000))}m 前`;
  if (h < 24) return `${h}h 前`;
  return `${Math.floor(h / 24)}d 前`;
}
