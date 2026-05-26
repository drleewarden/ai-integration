import Image from "next/image";

type Client = {
  name: string;
  shortName: string;
  detail: string;
  logoSrc?: string;
  logoFit?: "contain" | "cover";
  logoPosition?: string;
  logoScale?: number;
};

const CLIENTS: Client[] = [
  {
    name: "Xplor Technologies",
    shortName: "xplor",
    detail: "Software · Payments",
    logoSrc: "/images/clients/xplor.svg",
  },
  {
    name: "Woolpert",
    shortName: "WOOLPERT",
    detail: "Architecture · Engineering",
  },
  {
    name: "Bureau of Meteorology",
    shortName: "BOM",
    detail: "Government · Weather",
    logoSrc: "/images/clients/bureau-of-meteorology.svg",
  },
  {
    name: "IAG",
    shortName: "IAG",
    detail: "Insurance",
    logoSrc: "/images/clients/iag.svg",
  },
  {
    name: "AGL Energy",
    shortName: "AGL",
    detail: "Energy",
    logoSrc: "/images/clients/agl-energy.svg",
  },
  {
    name: "Australian Unity",
    shortName: "Australian Unity",
    detail: "Health · Wealth · Care",
    logoSrc: "/images/clients/australian-unity.svg",
  },
  {
    name: "AKQA",
    shortName: "AKQA",
    detail: "Experience Design",
    logoSrc: "/images/clients/akqa.svg",
  },
  {
    name: "AIA",
    shortName: "AIA",
    detail: "Insurance · Finance",
    logoSrc: "/images/clients/aia.svg",
  },
  {
    name: "Myer",
    shortName: "MYER",
    detail: "Retail",
    logoSrc: "/images/clients/myer.svg",
  },
];

function ClientLogo({ client }: { client: Client }) {
  if (!client.logoSrc) {
    return <ClientWordmark client={client} />;
  }

  return (
    <div
      className="client-logo-frame"
      style={{
        width: "100%",
        aspectRatio: "280 / 96",
        border: "1px solid rgba(247,247,242,0.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(0.75rem, 1.4vw, 1.1rem)",
        overflow: "hidden",
      }}
    >
      <Image
        src={client.logoSrc}
        alt={`${client.name} logo`}
        width={280}
        height={96}
        className="client-logo-image"
        style={{
          width: "100%",
          height: "100%",
          objectFit: client.logoFit ?? "contain",
          objectPosition: client.logoPosition ?? "center",
          transform: client.logoScale
            ? `scale(${client.logoScale})`
            : undefined,
          transformOrigin: client.logoPosition ?? "center",
        }}
      />
    </div>
  );
}

function ClientWordmark({ client }: { client: Client }) {
  return (
    <svg
      viewBox="0 0 280 96"
      role="img"
      aria-labelledby={`client-${client.name.replace(/\s+/g, "-").toLowerCase()}`}
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        color: "currentColor",
      }}
    >
      <title id={`client-${client.name.replace(/\s+/g, "-").toLowerCase()}`}>
        {client.name}
      </title>
      <rect
        x="0.5"
        y="0.5"
        width="279"
        height="95"
        fill="none"
        stroke="currentColor"
        opacity="0.16"
      />
      <text
        x="140"
        y="48"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="currentColor"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize:
            client.shortName.length > 14
              ? 18
              : client.shortName.length > 7
                ? 23
                : 30,
          fontWeight: 700,
          letterSpacing: client.shortName.length > 7 ? "0.03em" : "0.1em",
        }}
      >
        {client.shortName}
      </text>
      <line
        x1="72"
        y1="68"
        x2="208"
        y2="68"
        stroke="currentColor"
        opacity="0.18"
      />
    </svg>
  );
}

export default function Clients({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  return (
    <section
      id="clients"
      className="section-tight"
      aria-labelledby="clients-heading"
      style={{
        background: "#050505",
        color: "#f7f7f2",
        borderTop: "1px solid rgba(247,247,242,0.14)",
        borderBottom: "1px solid rgba(247,247,242,0.14)",
        paddingTop: standalone ? "clamp(7rem, 12vw, 9rem)" : undefined,
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: "clamp(2rem, 5vw, 5rem)",
            alignItems: "end",
            paddingBottom: "clamp(2rem, 4vw, 3rem)",
            borderBottom: "1px solid rgba(247,247,242,0.14)",
          }}
        >
          <div>
            <span
              className="eyebrow"
              style={{
                color: "rgba(247,247,242,0.68)",
                marginBottom: "1rem",
              }}
            >
              Company Experience
            </span>
            <h2
              id="clients-heading"
              className="h-section"
              style={{
                color: "#f7f7f2",
                margin: "1rem 0 0",
                maxWidth: "12ch",
              }}
            >
              Brands We've worked with.
            </h2>
          </div>
          <p
            className="body-copy"
            style={{
              color: "rgba(247,247,242,0.62)",
              margin: 0,
              maxWidth: "48ch",
              justifySelf: "end",
            }}
          >
            Experience across enterprise software, government, insurance,
            energy, health, retail, and design-led technology teams.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
            gap: 0,
          }}
        >
          {CLIENTS.map((client, index) => (
            <article
              key={client.name}
              className="client-tile"
              style={{
                minHeight: 180,
                padding: "clamp(1.2rem, 2vw, 1.7rem)",
                borderRight: "1px solid rgba(247,247,242,0.12)",
                borderBottom: "1px solid rgba(247,247,242,0.12)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                animation: `fadeInUp 0.7s var(--ease-out) ${index * 0.05}s both`,
              }}
            >
              <ClientLogo client={client} />
              <div style={{ paddingTop: "1rem" }}>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(247,247,242,0.42)",
                    marginBottom: "0.35rem",
                  }}
                >
                  {client.detail}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 300,
                    fontSize: "clamp(1.15rem, 1.8vw, 1.45rem)",
                    lineHeight: 1.15,
                    color: "rgba(247,247,242,0.82)",
                    margin: 0,
                  }}
                >
                  {client.name}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
