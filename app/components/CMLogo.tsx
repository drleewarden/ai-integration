type LogoVariant = "cream-on-ink" | "ink-on-cream" | "gold-on-ink";

export function CMMark({
  size = 32,
  variant = "ink-on-cream",
}: {
  size?: number;
  variant?: LogoVariant;
}) {
  const fill =
    variant === "cream-on-ink"
      ? "var(--warm-cream)"
      : variant === "gold-on-ink"
      ? "var(--liquid-gold)"
      : "var(--midnight-ink)";

  // Milk-droplet glyph: round bottom, tapered top, slight off-axis tilt.
  // Inner cutout forms the "C" for Creative — reads as both a droplet and a C.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0, display: "block" }}
    >
      <path
        d="M20 3.5
           C 21.5 9, 30 13, 32 22
           C 33.6 29.5, 28 36, 20 36
           C 12 36, 6.4 29.5, 8 22
           C 10 13, 18.5 9, 20 3.5 Z"
        fill={fill}
      />
      <path
        d="M24.5 22.5
           C 24.5 25.5, 22.5 27.7, 20 27.7
           C 17.2 27.7, 15.3 25.4, 15.3 22.4
           C 15.3 19.4, 17.2 17.2, 20 17.2
           C 21.4 17.2, 22.6 17.7, 23.4 18.5"
        stroke={
          variant === "ink-on-cream" ? "var(--warm-cream)" : "var(--midnight-ink)"
        }
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function CMWordmark({
  variant = "ink-on-cream",
  markSize = 30,
}: {
  variant?: LogoVariant;
  markSize?: number;
}) {
  const textColor =
    variant === "cream-on-ink" || variant === "gold-on-ink"
      ? "var(--warm-cream)"
      : "var(--midnight-ink)";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.65rem",
      }}
    >
      <CMMark size={markSize} variant={variant} />
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: textColor,
          lineHeight: 1,
        }}
      >
        Creative Milk
      </span>
    </span>
  );
}
