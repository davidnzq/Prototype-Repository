type LogoProps = {
  variant?: "horizontal" | "horizontal-dark" | "horizontal-zh" | "vertical" | "mark" | "mark-dark";
  height?: number;
  className?: string;
};

const MAP = {
  horizontal: "/brand/logo-horizontal.svg",
  "horizontal-dark": "/brand/logo-horizontal-dark.svg",
  "horizontal-zh": "/brand/logo-horizontal-zh.svg",
  vertical: "/brand/logo-vertical.svg",
  mark: "/brand/logomark.svg",
  "mark-dark": "/brand/logomark-dark.svg",
} as const;

export function Logo({ variant = "horizontal", height = 28, className }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={MAP[variant]}
      alt="Longbridge"
      height={height}
      style={{ height, width: "auto" }}
      className={className}
    />
  );
}
