const ITEMS = [
  "Strategy → Build → Ship",
  "Specific outcomes",
  "Plain-English systems",
  "6–8 weeks to first value",
  "No buzzwords",
  "Built to your stack",
];

export default function Marquee() {
  // Duplicate so the -50% loop is seamless
  const track = [...ITEMS, ...ITEMS];

  return (
    <section
      style={{
        background: "var(--midnight-deep)",
        borderTop: "1px solid var(--rule-cream)",
        borderBottom: "1px solid var(--rule-cream)",
        paddingBlock: "1.25rem",
      }}
      aria-label="Operating principles"
    >
      <div className="marquee">
        <div className="marquee-track">
          {track.map((item, i) => (
            <span
              key={`${item}-${i}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4rem",
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.5rem, 3vw, 2.4rem)",
                fontWeight: 300,
                fontStyle: "italic",
                letterSpacing: "-0.01em",
                color: "var(--warm-cream)",
              }}
            >
              {item}
              <span
                aria-hidden="true"
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--liquid-gold)",
                }}
              />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
